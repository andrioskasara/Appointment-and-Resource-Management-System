from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.services import resource_service
from backend.app.db import schemas
from backend.app.core.dependencies import get_db

router = APIRouter()


@router.post("/", response_model=schemas.Resource)
async def create_resource(resource: schemas.ResourceCreate, db: AsyncSession = Depends(get_db)):
    return await resource_service.create_resource(db, resource)


@router.get("/{resource_id}", response_model=schemas.Resource)
async def read_resource(resource_id: int, db: AsyncSession = Depends(get_db)):
    resource = await resource_service.get_resource(db, resource_id)
    if resource is None:
        raise HTTPException(status_code=404, detail="Resource not found")
    return resource


@router.get("/", response_model=list[schemas.Resource])
async def read_resources(db: AsyncSession = Depends(get_db)):
    return await resource_service.get_resources(db)


@router.get("/available", response_model=list[schemas.Resource])
async def read_available_resources(db: AsyncSession = Depends(get_db)):
    available_resources = await resource_service.get_available_resources(db)
    if not available_resources:
        raise HTTPException(status_code=404, detail="No available resources found")
    return available_resources


@router.get("/movable/available", response_model=list[schemas.Resource])
async def read_available_movable_resources(start_time: str, end_time: str, db: AsyncSession = Depends(get_db)):
    available_resources = await resource_service.get_available_movable_resources(db, start_time, end_time)
    if not available_resources:
        raise HTTPException(status_code=404, detail="No available movable resources found")
    return available_resources


@router.put("/{resource_id}", response_model=schemas.Resource)
async def update_resource(
    resource_id: int,
    resource: schemas.ResourceUpdate,
    db: AsyncSession = Depends(get_db)
):
    updated_resource = await resource_service.update_resource(db, resource_id, resource)
    if updated_resource is None:
        raise HTTPException(status_code=404, detail="Resource not found")
    return updated_resource


@router.delete("/{resource_id}", response_model=schemas.Resource)
async def delete_resource(resource_id: int, db: AsyncSession = Depends(get_db)):
    deleted_resource = await resource_service.delete_resource(db, resource_id)
    if deleted_resource is None:
        raise HTTPException(status_code=404, detail="Resource not found")
    return deleted_resource


@router.put("/{resource_id}/availability", response_model=schemas.Resource)
async def update_resource_availability(
        resource_id: int,
        availability: schemas.ResourceUpdate,
        db: AsyncSession = Depends(get_db)
):
    # Ensure only admins or the resource owner can update availability
    resource = await resource_service.get_resource(db, resource_id)
    if resource is None:
        raise HTTPException(status_code=404, detail="Resource not found")

    updated_resource = await resource_service.update_resource_availability(db, resource_id, availability)
    if updated_resource is None:
        raise HTTPException(status_code=404, detail="Resource availability not updated")

    return updated_resource
