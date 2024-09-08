from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import joinedload, selectinload

from backend.app.db import models, schemas
from fastapi import HTTPException
from datetime import datetime


async def create_room(db: AsyncSession, room: schemas.RoomCreate):
    async with db.begin():
        db_room = models.Room(
            name=room.name,
            capacity=int(room.capacity)
        )

        for resource_id in room.fixed_resources:
            query = select(models.Resource).filter(models.Resource.id == resource_id)
            result = await db.execute(query)
            db_resource = result.scalars().first()
            if db_resource is None:
                raise HTTPException(status_code=404, detail=f"Resource with id {resource_id} not found")
            db_resource.type = models.ResourceType.fixed
            db_resource.availability = models.ResourceAvailability.unavailable
            db.add(db_resource)
            db_room.fixed_resources.append(db_resource)

        db.add(db_room)
        await db.flush()
        await db.commit()

    return db_room


async def get_room(db: AsyncSession, room_id: int):
    query = select(models.Room).options(joinedload(models.Room.fixed_resources)).filter(models.Room.id == room_id)
    result = await db.execute(query)
    return result.scalars().first()


async def get_rooms(db: AsyncSession):
    query = select(models.Room).options(joinedload(models.Room.fixed_resources))
    result = await db.execute(query)
    return result.scalars().unique().all()


async def update_room(db: AsyncSession, room_id: int, room: schemas.RoomUpdate):
    query = select(models.Room).filter(models.Room.id == room_id).options(selectinload(models.Room.fixed_resources))

    result = await db.execute(query)
    db_room = result.scalars().first()
    if db_room is None:
        raise HTTPException(status_code=404, detail="Room not found")

    if room.name:
        db_room.name = room.name
    if room.capacity:
        db_room.capacity = room.capacity

    current_resource_ids = {r.id for r in db_room.fixed_resources}
    new_resource_ids = set(room.fixed_resources or [])
    resources_to_remove = current_resource_ids - new_resource_ids
    resources_to_add = new_resource_ids - current_resource_ids

    for resource_id in resources_to_remove:
        query = select(models.Resource).filter(models.Resource.id == resource_id)
        result = await db.execute(query)
        db_resource = result.scalars().first()
        if db_resource:
            db_resource.availability = models.ResourceAvailability.available
            db_resource.type = models.ResourceType.movable
            db_room.fixed_resources.remove(db_resource)

    for resource_id in resources_to_add:
        query = select(models.Resource).filter(models.Resource.id == resource_id)
        result = await db.execute(query)
        db_resource = result.scalars().first()
        if db_resource is None:
            raise HTTPException(status_code=404, detail=f"Resource with id {resource_id} not found")
        db_resource.type = models.ResourceType.fixed
        db_resource.availability = models.ResourceAvailability.unavailable
        db_room.fixed_resources.append(db_resource)

    db.add(db_room)
    await db.commit()
    await db.refresh(db_room)
    return db_room


async def delete_room(db: AsyncSession, room_id: int):
    try:
        query = select(models.Room).filter(models.Room.id == room_id)
        result = await db.execute(query)
        db_room = result.scalars().first()

        if db_room is None:
            raise HTTPException(status_code=404, detail="Room not found")

        appointments_query = select(models.Appointment).filter(models.Appointment.room_id == room_id)
        appointments_result = await db.execute(appointments_query)
        appointments = appointments_result.scalars().all()

        if appointments:
            raise HTTPException(status_code=400, detail="Room has associated appointments")

        fixed_resources_query = select(models.Resource).join(
            models.room_fixed_resources
        ).filter(models.room_fixed_resources.c.room_id == room_id)
        fixed_resources_result = await db.execute(fixed_resources_query)
        fixed_resources = fixed_resources_result.scalars().all()

        for resource in fixed_resources:
            resource.availability = models.ResourceAvailability.available
            db.add(resource)

        await db.execute(
            models.room_fixed_resources.delete().where(models.room_fixed_resources.c.room_id == room_id)
        )

        await db.execute(delete(models.Room).where(models.Room.id == room_id))
        await db.commit()

        return {"detail": "Room deleted successfully"}

    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"An error occurred while deleting the room: {str(e)}")


async def get_available_rooms(db: AsyncSession, start_time: datetime, end_time: datetime):
    overlapping_rooms_subquery = (
        select(models.Room.id)
        .join(models.Appointment, models.Room.id == models.Appointment.room_id)
        .filter(
            models.Appointment.start_time < end_time,
            models.Appointment.end_time > start_time
        )
    ).subquery()

    query = (
        select(models.Room)
        .filter(~models.Room.id.in_(overlapping_rooms_subquery))
        .options(selectinload(models.Room.fixed_resources))
    )

    result = await db.execute(query)
    rooms = result.scalars().all()

    available_rooms = [room for room in rooms]

    if not available_rooms:
        raise HTTPException(status_code=404, detail="No available rooms found for the selected time.")

    return available_rooms
