from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from backend.app.db import models, schemas
from backend.app.core.utils import get_password_hash, verify_password
from fastapi import HTTPException


async def create_user(db: AsyncSession, user: schemas.UserCreate):
    password_hash = get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        password_hash=password_hash,
        role=models.Role.user
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user


async def get_user(db: AsyncSession, user_id: int):
    query = select(models.User).filter(models.User.id == user_id)
    result = await db.execute(query)
    return result.scalars().first()


async def get_user_by_username(db: AsyncSession, username: str):
    query = select(models.User).filter(models.User.username == username)
    result = await db.execute(query)
    return result.scalars().first()


async def get_users(db: AsyncSession):
    query = select(models.User)
    result = await db.execute(query)
    return result.scalars().all()


async def update_user(db: AsyncSession, user_id: int, user: schemas.UserUpdate):
    query = select(models.User).filter(models.User.id == user_id)
    result = await db.execute(query)
    db_user = result.scalars().first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    if user.username:
        db_user.username = user.username
    if user.email:
        db_user.email = user.email
    if user.password:
        db_user.password_hash = get_password_hash(user.password)
    if user.role:
        db_user.role = user.role

    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user


async def delete_user(db: AsyncSession, user_id: int):
    query = select(models.User).filter(models.User.id == user_id)
    result = await db.execute(query)
    db_user = result.scalars().first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    await db.execute(
        delete(models.User).where(models.User.id == user_id)
    )
    await db.commit()
    return db_user


async def authenticate_user(db: AsyncSession, username: str, password: str):
    user = await get_user_by_username(db, username)
    if not user or not verify_password(password, user.password_hash):
        return None
    return user
