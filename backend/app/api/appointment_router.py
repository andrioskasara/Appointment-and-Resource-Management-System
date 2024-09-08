from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.db.models import User
from backend.app.services import appointment_service
from backend.app.db import schemas
from backend.app.core.dependencies import get_db, get_current_user_or_admin, get_user_by_token
from datetime import datetime

router = APIRouter()


@router.post("/", response_model=schemas.Appointment)
async def create_appointment(
    appointment: schemas.AppointmentCreate,
    current_user: schemas.User = Depends(get_user_by_token),
    db: AsyncSession = Depends(get_db)
):
    return await appointment_service.create_appointment(db, appointment, current_user.id)


@router.get("/{appointment_id}", response_model=schemas.Appointment)
async def read_appointment(appointment_id: int, db: AsyncSession = Depends(get_db)):
    appointment = await appointment_service.get_appointment(db, appointment_id)
    if appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment


@router.get("/", response_model=list[schemas.Appointment])
async def read_appointments(user_id: int = None, db: AsyncSession = Depends(get_db)):
    return await appointment_service.get_appointments(db, user_id)


@router.put("/{appointment_id}", response_model=schemas.Appointment)
async def update_appointment(
    appointment_id: int,
    appointment: schemas.AppointmentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_or_admin)
):
    appointment_db = await appointment_service.get_appointment(db, appointment_id)
    if appointment_db.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update this appointment"
        )

    db_appointment = await appointment_service.update_appointment(db, appointment_id, appointment)
    if db_appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return db_appointment


@router.delete("/{appointment_id}", response_model=schemas.Appointment)
async def delete_appointment(
    appointment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_or_admin)
):
    appointment_db = await appointment_service.get_appointment(db, appointment_id)

    if appointment_db.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete this appointment"
        )

    await appointment_service.delete_appointment(db, appointment_id)
    return appointment_db


@router.get("/filter", response_model=list[schemas.Appointment])
async def read_appointments_by_filters(
    room_id: int = None,
    start_time: datetime = None,
    end_time: datetime = None,
    db: AsyncSession = Depends(get_db)
):
    return await appointment_service.get_appointments_by_filters(db, room_id, start_time, end_time)
