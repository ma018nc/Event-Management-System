# app/routers/bookings.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List

from app.database import get_db
from app import models, schemas
from app.routers.auth import get_current_active_user  # your auth dependency
from app.models import Booking, Hall, User

router = APIRouter(prefix="/bookings", tags=["Bookings"])

GST_RATE = 0.18
SERVICE_FEE = 300

@router.post("/create")
def create_booking(payload: schemas.BookingCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    hall = db.query(Hall).filter(Hall.id == payload.hall_id).first()
    if not hall:
        raise HTTPException(status_code=404, detail="Hall not found")


    start_dt = payload.date
    
    end_dt = start_dt + timedelta(hours=payload.duration)

    # simple double-booking check
    overlapping = db.query(Booking).filter(
        Booking.hall_id == hall.id,
        Booking.status.in_(["confirmed", "pending"]),
        Booking.start_time < end_dt,
        Booking.end_time > start_dt
    ).first()
    if overlapping:
        raise HTTPException(status_code=400, detail="Time slot not available")

    amount = hall.price_per_hour * payload.duration
    tax = amount * GST_RATE
    service_fee = SERVICE_FEE
    total_price = amount + tax + service_fee

    # Generate Booking Ref
    import uuid
    booking_ref = f"BK-{uuid.uuid4().hex[:8].upper()}"

    booking = Booking(
        user_id=current_user.id,
        hall_id=hall.id,
        booking_ref=booking_ref,
        start_time=start_dt,
        end_time=end_dt,
        guests=payload.guests,
        status="pending",
        note=payload.note,
        amount=amount,
        tax=tax,
        service_fee=service_fee,
        total_price=total_price
    )

    db.add(booking)
    db.commit()
    db.refresh(booking)

    return {"success": True, "booking_id": booking.id, "booking_ref": booking.booking_ref}

@router.get("/me", response_model=List[dict])
def my_bookings(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    bookings = db.query(Booking).filter(Booking.user_id == current_user.id).order_by(Booking.created_at.desc()).all()
    result = []
    for b in bookings:
        hall = db.query(Hall).filter(Hall.id == b.hall_id).first()
        result.append({
            "id": b.id,
            "booking_ref": b.booking_ref,
            "hall_name": hall.name if hall else "Unknown",
            "hall_city": hall.city if hall else "",
            "hall_image": hall.image_url if hall else None,
            "start_time": b.start_time,
            "status": b.status,
            "total_amount": b.total_price,
            "hall": { "name": hall.name, "image": hall.image_url } if hall else None
        })
    return result

@router.get("/{booking_id}")
def get_booking(booking_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    booking = db.query(Booking).filter(Booking.id == booking_id, Booking.user_id == current_user.id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    hall = db.query(Hall).filter(Hall.id == booking.hall_id).first()
    return {
        "id": booking.id,
        "booking_ref": booking.booking_ref,
        "hall_name": hall.name if hall else "Unknown",
        "hall_city": hall.city if hall else "",
        "hall_image": hall.image_url if hall else None,
        "hall_phone": "9876543210", # Placeholder or add to Hall model
        "start_time": booking.start_time,
        "end_time": booking.end_time,
        "status": booking.status,
        "guests": booking.guests,
        "amount": booking.amount,
        "tax_amount": booking.tax, # Frontend expects tax_amount
        "service_fee": booking.service_fee,
        "total_amount": booking.total_price, # Frontend expects total_amount
        "note": booking.note,
        "created_at": booking.created_at,
        "hall": {
             "name": hall.name,
             "city": hall.city,
             "image": hall.image_url,
             "phone": "9876543210",
             "address": hall.location,
             "gstin": "23AABCU9603R1Z2"
        } if hall else None
    }

@router.delete("/{booking_id}")
def cancel_booking(booking_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    booking = db.query(Booking).filter(Booking.id == booking_id, Booking.user_id == current_user.id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.status == "cancelled":
        raise HTTPException(status_code=400, detail="Already cancelled")
    booking.status = "cancelled"
    db.commit()
    return {"success": True, "message": "Booking cancelled"}


@router.get("/hall/{hall_id}")
def get_bookings_by_hall(hall_id: int, db: Session = Depends(get_db)):
    bookings = db.query(Booking).filter(Booking.hall_id == hall_id).all()
    return bookings
