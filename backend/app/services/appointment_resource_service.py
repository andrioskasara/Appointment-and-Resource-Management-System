from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from backend.app.db import models, schemas
from fastapi import HTTPException


async def create_appointment_resource(db: AsyncSession, appointment_resource: schemas.AppointmentResourceCreate):
    db_appointment_resource = models.AppointmentResource(
        appointment_id=appointment_resource.appointment_id,
        resource_id=appointment_resource.resource_id
    )
    db.add(db_appointment_resource)
    await db.commit()
    await db.refresh(db_appointment_resource)
    return db_appointment_resource


async def get_appointment_resource(db: AsyncSession, appointment_resource_id: int):
    result = await db.execute(
        select(models.AppointmentResource).filter(models.AppointmentResource.id == appointment_resource_id)
    )
    return result.scalars().first()


async def get_appointment_resources(db: AsyncSession, appointment_id: int):
    result = await db.execute(
        select(models.AppointmentResource).filter(models.AppointmentResource.appointment_id == appointment_id)
    )
    return result.scalars().all()


async def update_appointment_resource(db: AsyncSession, appointment_resource_id: int,
                                      appointment_resource: schemas.AppointmentResourceCreate):
    result = await db.execute(
        select(models.AppointmentResource).filter(models.AppointmentResource.id == appointment_resource_id)
    )
    db_appointment_resource = result.scalars().first()
    if db_appointment_resource is None:
        raise HTTPException(status_code=404, detail="Appointment resource not found")

    db_appointment_resource.appointment_id = appointment_resource.appointment_id
    db_appointment_resource.resource_id = appointment_resource.resource_id
    await db.commit()
    await db.refresh(db_appointment_resource)
    return db_appointment_resource


async def delete_appointment_resource(db: AsyncSession, appointment_resource_id: int):
    result = await db.execute(
        select(models.AppointmentResource).filter(models.AppointmentResource.id == appointment_resource_id)
    )
    db_appointment_resource = result.scalars().first()

    if db_appointment_resource is None:
        raise HTTPException(status_code=404, detail="Appointment resource not found")

    await db.execute(
        delete(models.AppointmentResource).where(models.AppointmentResource.id == appointment_resource_id)
    )
    await db.commit()
    return db_appointment_resource


async def get_movable_resources_for_appointment(db: AsyncSession, appointment_id: int):
    result = await db.execute(
        select(models.AppointmentResource)
        .join(models.Resource)
        .filter(
            models.AppointmentResource.appointment_id == appointment_id,
            models.Resource.type == models.ResourceType.movable,
            models.Resource.availability == models.ResourceAvailability.available
        )
    )
    return result.scalars().all()
