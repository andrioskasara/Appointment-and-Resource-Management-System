from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from enum import Enum


class Role(str, Enum):
    admin = "admin"
    user = "user"


class ResourceType(str, Enum):
    movable = "movable"
    fixed = "fixed"


class ResourceAvailability(str, Enum):
    available = "available"
    unavailable = "unavailable"


class UserBase(BaseModel):
    username: str
    email: str
    role: Role


class UserCreate(BaseModel):
    username: str
    email: str
    password: str


class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    role: Optional[Role] = None
    password: Optional[str] = None


class UserLogin(BaseModel):
    username: str
    password: str


class User(UserBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True


class ResourceBase(BaseModel):
    name: str
    type: ResourceType
    availability: ResourceAvailability


class ResourceCreate(ResourceBase):
    pass


class ResourceUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[ResourceType] = None
    availability: Optional[ResourceAvailability] = None


class Resource(ResourceBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True


class RoomBase(BaseModel):
    name: str
    capacity: int


class RoomCreate(RoomBase):
    fixed_resources: List[int] = []


class RoomUpdate(BaseModel):
    name: Optional[str] = None
    capacity: Optional[int] = None
    fixed_resources: Optional[List[int]] = None


class Room(RoomBase):
    id: int
    created_at: datetime
    fixed_resources: List[Resource] = []

    class Config:
        orm_mode = True


class AppointmentBase(BaseModel):
    user_id: int
    room_id: int
    start_time: datetime
    end_time: datetime


class AppointmentCreate(AppointmentBase):
    resource_ids: List[int]


class AppointmentUpdate(AppointmentBase):
    user_id: Optional[int] = None
    room_id: Optional[int] = None
    resource_ids: Optional[List[int]] = None


class Appointment(AppointmentBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True


class AppointmentResourceBase(BaseModel):
    appointment_id: int
    resource_id: int


class AppointmentResourceCreate(AppointmentResourceBase):
    pass


class AppointmentResource(AppointmentResourceBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True
