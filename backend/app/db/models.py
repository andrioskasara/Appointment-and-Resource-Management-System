from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum, Table
from sqlalchemy.orm import relationship
from backend.app.db.init_db import Base
from datetime import datetime
import enum


class Role(enum.Enum):
    admin = "admin"
    user = "user"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(Enum(Role), default=Role.user)
    created_at = Column(DateTime, default=datetime.utcnow)


class ResourceType(enum.Enum):
    movable = "movable"
    fixed = "fixed"


class ResourceAvailability(enum.Enum):
    available = "available"
    unavailable = "unavailable"


room_fixed_resources = Table(
    "room_fixed_resources", Base.metadata,
    Column("room_id", Integer, ForeignKey("rooms.id"), primary_key=True),
    Column("resource_id", Integer, ForeignKey("resources.id"), primary_key=True)
)


class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    capacity = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

    fixed_resources = relationship("Resource", secondary=room_fixed_resources, back_populates="fixed_in_rooms")


class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(Enum(ResourceType))
    availability = Column(Enum(ResourceAvailability))
    created_at = Column(DateTime, default=datetime.utcnow)
    unavailable_times = relationship("ResourceUnavailable", back_populates="resource")

    fixed_in_rooms = relationship("Room", secondary=room_fixed_resources, back_populates="fixed_resources")


class ResourceUnavailable(Base):
    __tablename__ = "resource_unavailable"

    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(Integer, ForeignKey('resources.id'))
    start_time = Column(DateTime)
    end_time = Column(DateTime)

    resource = relationship("Resource", back_populates="unavailable_times")


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("rooms.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    room = relationship("Room")
    user = relationship("User")


class AppointmentResource(Base):
    __tablename__ = "appointment_resources"

    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id"))
    resource_id = Column(Integer, ForeignKey("resources.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    appointment = relationship("Appointment")
    resource = relationship("Resource")
