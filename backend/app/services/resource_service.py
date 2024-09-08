from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, not_
from backend.app.db import models, schemas
from fastapi import HTTPException


async def create_resource(db: AsyncSession, resource: schemas.ResourceCreate):
    db_resource = models.Resource(
        name=resource.name,
        type=resource.type,
        availability=resource.availability
    )
    db.add(db_resource)
    await db.commit()
    await db.refresh(db_resource)
    return db_resource


async def get_resource(db: AsyncSession, resource_id: int):
    query = select(models.Resource).filter(models.Resource.id == resource_id)
    result = await db.execute(query)
    return result.scalars().first()


async def get_resources(db: AsyncSession):
    query = select(models.Resource)
    result = await db.execute(query)
    return result.scalars().all()


async def get_available_resources(db: AsyncSession):
    result = await db.execute(
        select(models.Resource)
        .filter(models.Resource.availability == models.ResourceAvailability.available)
    )
    available_resources = result.scalars().all()
    return available_resources


async def get_available_movable_resources(db: AsyncSession, start_time: str, end_time: str):
    start_time_dt = datetime.fromisoformat(start_time)
    end_time_dt = datetime.fromisoformat(end_time)
    subquery = (
        select(models.AppointmentResource.resource_id)
        .join(models.Appointment)
        .filter(
            not_(
                (models.Appointment.start_time >= end_time_dt) |
                (models.Appointment.end_time <= start_time_dt)
            )
        )
        .subquery()
    )

    result = await db.execute(
        select(models.Resource)
        .filter(models.Resource.type == 'movable')
        .filter(models.Resource.availability == 'available')
        .filter(~models.Resource.id.in_(subquery))
    )
    return result.scalars().all()


async def update_resource(db: AsyncSession, resource_id: int, resource: schemas.ResourceUpdate):
    query = select(models.Resource).filter(models.Resource.id == resource_id)
    result = await db.execute(query)
    db_resource = result.scalars().first()
    if db_resource is None:
        raise HTTPException(status_code=404, detail="Resource not found")

    if resource.name:
        db_resource.name = resource.name
    if resource.type:
        db_resource.type = resource.type
    if resource.availability:
        db_resource.availability = resource.availability
    db.add(db_resource)
    await db.commit()
    await db.refresh(db_resource)
    return db_resource


async def delete_resource(db: AsyncSession, resource_id: int):
    query = select(models.Resource).filter(models.Resource.id == resource_id)
    result = await db.execute(query)
    db_resource = result.scalars().first()
    if db_resource is None:
        raise HTTPException(status_code=404, detail="Resource not found")

    await db.execute(
        delete(models.Resource).where(models.Resource.id == resource_id)
    )
    await db.commit()
    return db_resource
