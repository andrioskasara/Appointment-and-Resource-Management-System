from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, and_, update

from backend.app.db import models, schemas
from fastapi import HTTPException
from typing import Optional
from datetime import datetime


async def create_appointment(db: AsyncSession, appointment: schemas.AppointmentCreate, user_id: int):
    result = await db.execute(
        select(models.Appointment).filter(
            models.Appointment.room_id == appointment.room_id,
            models.Appointment.start_time < appointment.end_time,
            models.Appointment.end_time > appointment.start_time
        )
    )
    overlapping_appointments = result.scalars().first()
    if overlapping_appointments:
        raise HTTPException(status_code=400, detail="Room is not available during the selected time slot")

    if appointment.resource_ids:
        result = await db.execute(
            select(models.Resource).filter(
                models.Resource.id.in_(appointment.resource_ids),
                models.Resource.availability != 'available'
            )
        )
        unavailable_resources = result.scalars().all()
        if unavailable_resources:
            raise HTTPException(status_code=400, detail="Some resources are not available")

    await db.execute(
        update(models.Resource).where(
            and_(
                models.Resource.id.in_(appointment.resource_ids),
                models.Resource.type == "movable"
            )
        ).values(availability="unavailable")
    )

    db_appointment = models.Appointment(
        room_id=appointment.room_id,
        user_id=user_id,
        start_time=appointment.start_time,
        end_time=appointment.end_time,
    )
    db.add(db_appointment)
    await db.flush()
    await db.refresh(db_appointment)

    for resource_id in appointment.resource_ids:
        db_appointment_resource = models.AppointmentResource(
            appointment_id=db_appointment.id,
            resource_id=resource_id
        )
        db.add(db_appointment_resource)

    await db.commit()
    return db_appointment


async def get_appointment(db: AsyncSession, appointment_id: int):
    result = await db.execute(
        select(models.Appointment).filter(models.Appointment.id == appointment_id)
    )
    return result.scalars().first()


async def get_appointments(db: AsyncSession, user_id: Optional[int] = None):
    query = select(models.Appointment)
    if user_id:
        query = query.filter(models.Appointment.user_id == user_id)
    result = await db.execute(query)
    return result.scalars().all()


async def update_appointment(db: AsyncSession, appointment_id: int, appointment: schemas.AppointmentUpdate):
    result = await db.execute(
        select(models.Appointment).filter(models.Appointment.id == appointment_id)
    )
    db_appointment = result.scalars().first()
    if db_appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if appointment.room_id:
        db_appointment.room_id = appointment.room_id
    if appointment.start_time:
        db_appointment.start_time = appointment.start_time
    if appointment.end_time:
        db_appointment.end_time = appointment.end_time

    existing_resources_result = await db.execute(
        select(models.AppointmentResource.resource_id).filter(
            models.AppointmentResource.appointment_id == appointment_id
        )
    )
    existing_resource_ids = [res[0] for res in existing_resources_result.fetchall()]

    if existing_resource_ids:
        await db.execute(
            update(models.Resource).where(
                models.Resource.id.in_(existing_resource_ids)
            ).values(availability='available')
        )

    await db.execute(
        delete(models.AppointmentResource).where(models.AppointmentResource.appointment_id == appointment_id)
    )

    if appointment.resource_ids is not None:
        for resource_id in appointment.resource_ids:
            resource_result = await db.execute(
                select(models.Resource).filter(models.Resource.id == resource_id)
            )
            resource_obj = resource_result.scalars().first()
            if resource_obj is None:
                raise HTTPException(status_code=404, detail=f"Resource with id {resource_id} not found")

            if resource_obj.type == "movable":
                resource_obj.availability = "unavailable"
                db.add(resource_obj)

            db_appointment_resource = models.AppointmentResource(
                appointment_id=appointment_id,
                resource_id=resource_id
            )
            db.add(db_appointment_resource)

    try:
        await db.commit()
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update appointment")

    await db.refresh(db_appointment)

    return db_appointment


async def delete_appointment(
        db: AsyncSession,
        appointment_id: int
):
    result = await db.execute(
        select(models.Appointment).filter(models.Appointment.id == appointment_id)
    )
    db_appointment = result.scalars().first()
    if db_appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")

    associated_resources_result = await db.execute(
        select(models.AppointmentResource.resource_id).filter(
            models.AppointmentResource.appointment_id == appointment_id
        )
    )
    resource_ids = [res[0] for res in associated_resources_result.fetchall()]

    await db.execute(
        update(models.Resource).where(
            models.Resource.id.in_(resource_ids)
        ).values(availability='available')
    )

    await db.execute(
        delete(models.AppointmentResource).where(models.AppointmentResource.appointment_id == appointment_id)
    )
    await db.execute(
        delete(models.Appointment).where(models.Appointment.id == appointment_id)
    )
    await db.commit()
    return db_appointment


async def get_appointments_by_filters(
        db: AsyncSession,
        room_id: Optional[int] = None,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None
):
    query = select(models.Appointment)
    if room_id:
        query = query.filter(models.Appointment.room_id == room_id)
    if start_time and end_time:
        query = query.filter(
            and_(
                models.Appointment.start_time >= start_time,
                models.Appointment.end_time <= end_time
            )
        )
    result = await db.execute(query)
    return result.scalars().all()
