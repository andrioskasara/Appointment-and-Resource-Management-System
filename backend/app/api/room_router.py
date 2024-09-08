from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
from backend.app.services import room_service
from backend.app.db import schemas
from backend.app.core.dependencies import get_db


router = APIRouter()


@router.post("/", response_model=schemas.Room)
async def create_room(room: schemas.RoomCreate, db: AsyncSession = Depends(get_db)):
    return await room_service.create_room(db, room)


@router.get("/available", response_model=list[schemas.Room])
async def read_available_rooms(start_time: datetime, end_time: datetime, db: AsyncSession = Depends(get_db)):
    if start_time >= end_time:
        raise HTTPException(status_code=400, detail="Start time must be before end time")

    try:
        available_rooms = await room_service.get_available_rooms(db, start_time, end_time)
        if not available_rooms:
            raise HTTPException(status_code=404, detail="No available rooms found")
        return available_rooms
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/{room_id}", response_model=schemas.Room)
async def read_room(room_id: int, db: AsyncSession = Depends(get_db)):
    room = await room_service.get_room(db, room_id)
    if room is None:
        raise HTTPException(status_code=404, detail="Room not found")
    return room


@router.get("/", response_model=list[schemas.Room])
async def read_rooms(db: AsyncSession = Depends(get_db)):
    return await room_service.get_rooms(db)


@router.put("/{room_id}", response_model=schemas.Room)
async def update_room(room_id: int, room: schemas.RoomUpdate, db: AsyncSession = Depends(get_db)):
    updated_room = await room_service.update_room(db, room_id, room)
    if updated_room is None:
        raise HTTPException(status_code=404, detail="Room not found")
    return updated_room


@router.delete("/{room_id}", response_model=dict)
async def delete_room(room_id: int, db: AsyncSession = Depends(get_db)):
    deleted_room = await room_service.delete_room(db, room_id)
    if deleted_room is None:
        raise HTTPException(status_code=404, detail="Room not found")
    return deleted_room
