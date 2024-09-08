from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.db.models import User
from backend.app.services import appointment_resource_service, appointment_service
from backend.app.db import schemas
from backend.app.core.dependencies import get_db, get_current_user_or_admin

router = APIRouter()


@router.post("/", response_model=schemas.AppointmentResource)
async def create_appointment_resource(
    appointment_resource: schemas.AppointmentResourceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_or_admin)
):
    appointment_db = await appointment_service.get_appointment(db, appointment_resource.appointment_id)
    if appointment_db.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to add resources to this appointment"
        )
    return await appointment_resource_service.create_appointment_resource(db, appointment_resource)


@router.get("/{appointment_resource_id}", response_model=schemas.AppointmentResource)
async def read_appointment_resource(appointment_resource_id: int, db: AsyncSession = Depends(get_db)):
    appointment_resource = await appointment_resource_service.get_appointment_resource(db, appointment_resource_id)
    if appointment_resource is None:
        raise HTTPException(status_code=404, detail="AppointmentResource not found")
    return appointment_resource


@router.get("/", response_model=list[schemas.AppointmentResource])
async def read_appointment_resources(appointment_id: int, db: AsyncSession = Depends(get_db)):
    return await appointment_resource_service.get_appointment_resources(db, appointment_id)


@router.put("/{appointment_resource_id}", response_model=schemas.AppointmentResource)
async def update_appointment_resource(
    appointment_resource_id: int,
    appointment_resource: schemas.AppointmentResourceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_or_admin)
):
    appointment_resource_db = await appointment_resource_service.get_appointment_resource(db, appointment_resource_id)
    if appointment_resource_db.appointment.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update this appointment resource"
        )
    return await appointment_resource_service.update_appointment_resource(
        db, appointment_resource_id, appointment_resource)


@router.delete("/{appointment_resource_id}", response_model=schemas.AppointmentResource)
async def delete_appointment_resource(
    appointment_resource_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_or_admin)
):
    appointment_resource_db = await appointment_resource_service.get_appointment_resource(db, appointment_resource_id)
    if appointment_resource_db.appointment.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete this appointment resource"
        )
    return await appointment_resource_service.delete_appointment_resource(db, appointment_resource_id)


@router.get("/movable/{appointment_id}", response_model=list[schemas.AppointmentResource])
async def read_movable_resources_for_appointment(appointment_id: int, db: AsyncSession = Depends(get_db)):
    return await appointment_resource_service.get_movable_resources_for_appointment(db, appointment_id)
