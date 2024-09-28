from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, and_
from backend.app.db import models, schemas
from fastapi import HTTPException
from typing import Optional
from datetime import datetime


async def create_appointment(db: AsyncSession, appointment: schemas.AppointmentCreate, user_id: int):
    overlapping_appointments_query = select(models.Appointment).filter(
        models.Appointment.room_id == appointment.room_id,
        models.Appointment.start_time < appointment.end_time,
        models.Appointment.end_time > appointment.start_time
    )
    overlapping_result = await db.execute(overlapping_appointments_query)
    if overlapping_result.scalars().first():
        raise HTTPException(status_code=400, detail="Room is not available for the selected time slot")

    db_appointment = models.Appointment(
        room_id=appointment.room_id,
        user_id=user_id,
        start_time=appointment.start_time,
        end_time=appointment.end_time
    )
    db.add(db_appointment)

    for resource_id in appointment.resource_ids:
        unavailable_query = select(models.ResourceUnavailable).filter(
            models.ResourceUnavailable.resource_id == resource_id,
            models.ResourceUnavailable.start_time < appointment.end_time,
            models.ResourceUnavailable.end_time > appointment.start_time
        )
        unavailable_result = await db.execute(unavailable_query)
        if unavailable_result.scalars().first():
            raise HTTPException(status_code=400,
                                detail=f"Resource with ID {resource_id} is not available during the selected time slot")

        db_unavailable = models.ResourceUnavailable(
            resource_id=resource_id,
            start_time=appointment.start_time,
            end_time=appointment.end_time
        )
        db.add(db_unavailable)

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
    query = select(models.Appointment).filter(models.Appointment.id == appointment_id)
    result = await db.execute(query)
    db_appointment = result.scalars().first()

    if not db_appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if appointment.room_id and appointment.room_id != db_appointment.room_id:
        overlapping_appointments_query = select(models.Appointment).filter(
            models.Appointment.room_id == appointment.room_id,
            models.Appointment.start_time < appointment.end_time,
            models.Appointment.end_time > appointment.start_time
        )
        overlapping_result = await db.execute(overlapping_appointments_query)
        if overlapping_result.scalars().first():
            raise HTTPException(status_code=400, detail="New room is not available for the selected time slot")

        db_appointment.room_id = appointment.room_id

    db_appointment.start_time = appointment.start_time or db_appointment.start_time
    db_appointment.end_time = appointment.end_time or db_appointment.end_time

    await db.commit()

    current_resources_query = select(models.AppointmentResource).filter(
        models.AppointmentResource.appointment_id == db_appointment.id
    )
    current_resources_result = await db.execute(current_resources_query)
    current_resources = {ar.resource_id for ar in current_resources_result.scalars().all()}

    new_resources = set(appointment.resource_ids) if appointment.resource_ids else set()
    resources_to_add = new_resources - current_resources

    for resource_id in resources_to_add:
        unavailable_query = select(models.ResourceUnavailable).filter(
            models.ResourceUnavailable.resource_id == resource_id,
            models.ResourceUnavailable.start_time < db_appointment.end_time,
            models.ResourceUnavailable.end_time > db_appointment.start_time
        )
        unavailable_result = await db.execute(unavailable_query)
        if unavailable_result.scalars().first():
            raise HTTPException(status_code=400,
                                detail=f"Resource with ID {resource_id} is not available during the selected time slot")

        db_unavailable = models.ResourceUnavailable(
            resource_id=resource_id,
            start_time=db_appointment.start_time,
            end_time=db_appointment.end_time
        )
        db.add(db_unavailable)

        db_appointment_resource = models.AppointmentResource(
            appointment_id=db_appointment.id,
            resource_id=resource_id
        )
        db.add(db_appointment_resource)

    await db.commit()
    await db.refresh(db_appointment)
    return db_appointment


async def delete_appointment(
        db: AsyncSession,
        appointment_id: int
):
    query = select(models.Appointment).filter(models.Appointment.id == appointment_id)
    result = await db.execute(query)
    db_appointment = result.scalars().first()

    if not db_appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    resources_query = select(models.AppointmentResource).filter(
        models.AppointmentResource.appointment_id == appointment_id
    )
    resources_result = await db.execute(resources_query)
    appointment_resources = resources_result.scalars().all()

    for appointment_resource in appointment_resources:
        await db.execute(
            delete(models.ResourceUnavailable).where(
                models.ResourceUnavailable.resource_id == appointment_resource.resource_id,
                models.ResourceUnavailable.start_time == db_appointment.start_time,
                models.ResourceUnavailable.end_time == db_appointment.end_time
            )
        )

        resource_query = select(models.Resource).filter(models.Resource.id == appointment_resource.resource_id)
        resource_result = await db.execute(resource_query)
        db_resource = resource_result.scalars().first()
        if db_resource:
            db_resource.availability = models.ResourceAvailability.available
            db.add(db_resource)

    await db.execute(
        delete(models.AppointmentResource).where(models.AppointmentResource.appointment_id == appointment_id)
    )

    await db.delete(db_appointment)
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
