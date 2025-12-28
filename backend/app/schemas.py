from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime


# USER 

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str


class User(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    is_admin: bool

    class Config:
        from_attributes = True


#  LOGIN 

class Login(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


#  HALL 

class HallBase(BaseModel):
    name: str
    city: Optional[str] = None
    state: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location: Optional[str] = None
    capacity: int
    price_per_hour: float
    description: Optional[str] = None
    image_url: Optional[str] = None


class HallCreate(HallBase):
    pass


class Hall(HallBase):
    id: int

    class Config:
        from_attributes = True


#  GOOGLE HALL 

class GoogleHall(BaseModel):
    place_id: str
    name: str
    address: Optional[str] = None
    latitude: float
    longitude: float
    rating: Optional[float] = None
    user_ratings_total: Optional[int] = None
    icon: Optional[str] = None


#  BOOKING 
class BookingCreate(BaseModel):
    hall_id: int = Field(..., example=1)
    date: datetime
    duration: int = Field(..., ge=1)
    guests: int = Field(..., ge=1)
    note: Optional[str] = None


class Booking(BaseModel):
    id: int
    hall_id: int
    booking_ref: Optional[str] = None
    start_time: datetime
    end_time: datetime
    status: str
    amount: float
    tax: float
    service_fee: float
    total_price: float
    guests: int
    note: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


#  CONTACT 

class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str


class Contact(ContactCreate):
    id: int
    created_at: Optional[datetime] = None
    resolved: bool

    class Config:
        from_attributes = True


#  EVENT 

class EventBase(BaseModel):
    title: str
    category: Optional[str] = None
    description: Optional[str] = None
    date: Optional[datetime] = None
    hall_id: Optional[int] = None


class EventCreate(EventBase):
    pass


class Event(EventBase):
    id: int

    class Config:
        from_attributes = True


#  DASHBOARD 
class BookingSummary(BaseModel):
    id: int
    hall_name: str
    start_time: datetime
    end_time: datetime
    status: str
    total_price: float

    class Config:
        from_attributes = True


class DashboardSummary(BaseModel):
    total_bookings: int
    total_spent: float
    last_booking: Optional[BookingSummary] = None
    upcoming_booking: Optional[BookingSummary] = None
    most_used_hall: Optional[str] = None


#  ADMIN  
class AdminStats(BaseModel):
    revenue: float
    bookings: int
    users: int


class AdminBookingItem(BaseModel):
    id: int
    user_name: str
    hall_name: str
    start_time: datetime
    guests: int
    status: str
    total_price: float

    class Config:
        from_attributes = True


# CHARTS 

class MonthlyBookingItem(BaseModel):
    month: str
    total_bookings: int


class MonthlyBookingChart(BaseModel):
    data: List[MonthlyBookingItem]


class HallUsageItem(BaseModel):
    hall_name: str
    total_bookings: int


class HallUsageChart(BaseModel):
    data: List[HallUsageItem]


class MonthlyRevenueItem(BaseModel):
    month: str
    total_revenue: float


class RevenueChart(BaseModel):
    data: List[MonthlyRevenueItem]