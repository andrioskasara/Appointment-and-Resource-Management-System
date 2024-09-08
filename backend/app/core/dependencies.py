from fastapi import Depends, HTTPException, status
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi.security import OAuth2PasswordBearer
from backend.app.core.config import settings
from backend.app.db.models import User, Appointment
from backend.app.db.init_db import AsyncSessionLocal
from typing import AsyncGenerator, Optional

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/users/login")


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as db:
        try:
            yield db
        finally:
            await db.close()


async def get_user_by_token(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    query = select(User).filter(User.id == int(user_id))
    result = await db.execute(query)
    user = result.scalars().first()
    if user is None:
        raise credentials_exception
    return user


async def get_current_admin_user(current_user: User = Depends(get_user_by_token)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user


async def get_current_user_or_admin(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_user_by_token),
    appointment_id: Optional[int] = None
):
    if current_user.role == "admin":
        return current_user

    if appointment_id:
        query = select(Appointment).filter(Appointment.id == appointment_id)
        result = await db.execute(query)
        appointment = result.scalars().first()

        if appointment:
            if appointment.user_id == current_user.id:
                return current_user

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Not enough permissions"
    )
