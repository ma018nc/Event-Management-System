from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


#  USER
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)

    bookings = relationship("Booking", back_populates="user", cascade="all, delete")


#  SESSION
class Session(Base):
    __tablename__ = "sessions"
    id = Column(Integer, primary_key=True, index=True)
    token = Column(String(255), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    expiration = Column(DateTime, nullable=False)

    user = relationship("User")


#  HALL
class Hall(Base):
    __tablename__ = "halls"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    city = Column(String)
    state = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    location = Column(String)
    capacity = Column(Integer, nullable=False)
    price_per_hour = Column(Float, nullable=False)
    description = Column(Text)
    image_url = Column(String)

    bookings = relationship("Booking", back_populates="hall", cascade="all, delete")


#  BOOKING
class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    hall_id = Column(Integer, ForeignKey("halls.id", ondelete="CASCADE"))

    booking_ref = Column(String, unique=True, index=True)
    
    start_time = Column(DateTime)
    end_time = Column(DateTime)

    guests = Column(Integer)
    note = Column(Text)

    amount = Column(Float, default=0.0)
    tax = Column(Float, default=0.0)
    service_fee = Column(Float, default=0.0)
    total_price = Column(Float, default=0.0)
    
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="bookings")
    hall = relationship("Hall", back_populates="bookings")


#  EVENTS
class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    category = Column(String(50))
    description = Column(Text)
    date = Column(DateTime)
    hall_id = Column(Integer, ForeignKey("halls.id", ondelete="SET NULL"))

    hall = relationship("Hall")


#  CONTACT
class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(120), nullable=False)
    subject = Column(String(200))
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved = Column(Boolean, default=False)
