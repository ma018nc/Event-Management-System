from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app import models, schemas
from app.routers.auth import get_current_active_user

router = APIRouter(prefix="/admin", tags=["Admin"])


#  SECURITY: ADMIN ONLY
def admin_only(user: models.User = Depends(get_current_active_user)):
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admins only")
    return user


# DASHBOARD STATS
@router.get("/stats")
def get_stats(db: Session = Depends(get_db), user=Depends(admin_only)):

    total_users = db.query(models.User).count()
    total_bookings = db.query(models.Booking).count()
    total_halls = db.query(models.Hall).count()

    revenue = (
        db.query(func.sum(models.Booking.total_price))
        .filter(models.Booking.status == "confirmed")
        .scalar()
    ) or 0

    return {
        "total_users": total_users,
        "total_bookings": total_bookings,
        "total_halls": total_halls,
        "total_revenue": float(revenue)
    }


# ALL BOOKINGS
@router.get("/bookings")
def get_bookings(limit: int = 100, db: Session = Depends(get_db), user=Depends(admin_only)):

    bookings = db.query(models.Booking).limit(limit).all()

    return [{
        "id": b.id,
        "user_name": b.user.full_name,
        "hall_name": b.hall.name,
        "guests": b.guests,
        "start_time": b.start_time,
        "status": b.status,
        "total_price": b.total_price
    } for b in bookings]


# UPDATE BOOKING
@router.patch("/bookings/{booking_id}")
def update_booking(
    booking_id: int,
    action: str,
    db: Session = Depends(get_db),
    user=Depends(admin_only)
):
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if action not in ["confirm", "cancel"]:
        raise HTTPException(status_code=400, detail="Invalid action")

    booking.status = "confirmed" if action == "confirm" else "cancelled"
    db.commit()

    return {"message": f"Booking {booking.status}"}


#  GET HALLS
@router.get("/halls")
def get_halls(db: Session = Depends(get_db), user=Depends(admin_only)):
    return db.query(models.Hall).all()


#  ADD HALL
@router.post("/halls")
def add_hall(
    data: schemas.HallCreate,
    db: Session = Depends(get_db),
    user=Depends(admin_only)
):
    new_hall = models.Hall(**data.dict())
    db.add(new_hall)
    db.commit()
    db.refresh(new_hall)
    return new_hall


# DELETE HALL
@router.delete("/halls/{hall_id}")
def delete_hall(
    hall_id: int,
    db: Session = Depends(get_db),
    user=Depends(admin_only)
):
    hall = db.query(models.Hall).filter(models.Hall.id == hall_id).first()

    if not hall:
        raise HTTPException(status_code=404, detail="Hall not found")

    db.delete(hall)
    db.commit()

    return {"message": "Hall deleted"}


#  GET ALL USERS
@router.get("/users")
def get_users(db: Session = Depends(get_db), user=Depends(admin_only)):
    users = db.query(models.User).all()
    
    return [{
        "id": u.id,
        "name": u.full_name,
        "email": u.email,
        "is_admin": u.is_admin
    } for u in users]
