from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from calendar import month_name

from app import models, schemas
from app.database import get_db
from app.routers.auth import get_current_active_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


#  USER SUMMARY 
@router.get("/user/summary", response_model=schemas.DashboardSummary)
def user_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    bookings = (
        db.query(models.Booking, models.Hall)
        .join(models.Hall, models.Booking.hall_id == models.Hall.id)
        .filter(models.Booking.user_id == current_user.id)
        .order_by(models.Booking.start_time.desc())
        .all()
    )

    total_bookings = len(bookings)
    now = datetime.utcnow()

    def format_booking(booking: models.Booking, hall: models.Hall):
        return {
            "id": booking.id,
            "hall_name": hall.name if hall else "Unknown",
            "start_time": booking.start_time,
            "end_time": booking.end_time,
            "status": booking.status,
            "total_price": booking.total_price,
        }

    if not bookings:
        return {
            "total_bookings": 0,
            "total_spent": 0,
            "last_booking": None,
            "upcoming_booking": None,
            "most_used_hall": None,
        }

    # Total spent
    total_spent = sum((b.total_price or 0) for b, _ in bookings)

    # Last booking
    last_booking = format_booking(bookings[0][0], bookings[0][1])

    # Upcoming booking
    upcoming_booking = None
    for booking, hall in bookings:
        if booking.start_time and booking.start_time > now and booking.status != "cancelled":
            upcoming_booking = format_booking(booking, hall)
            break

    # Most used hall
    most_used = (
        db.query(models.Hall.name, func.count(models.Booking.id))
        .join(models.Booking)
        .filter(models.Booking.user_id == current_user.id)
        .group_by(models.Hall.name)
        .order_by(func.count(models.Booking.id).desc())
        .first()
    )

    return {
        "total_bookings": total_bookings,
        "total_spent": round(total_spent, 2),
        "last_booking": last_booking,
        "upcoming_booking": upcoming_booking,
        "most_used_hall": most_used[0] if most_used else None,
    }


#  MONTHLY BOOKINGS CHART 
@router.get("/charts/monthly-bookings", response_model=schemas.MonthlyBookingChart)
def monthly_bookings_chart(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    rows = (
        db.query(
            func.extract("month", models.Booking.start_time).label("month"),
            func.count(models.Booking.id).label("total")
        )
        .filter(models.Booking.user_id == current_user.id)
        .group_by("month")
        .order_by("month")
        .all()
    )

    data = [
        {"month": month_name[int(m)], "total_bookings": t}
        for m, t in rows if m
    ]

    return {"data": data}


#  HALL USAGE CHART 
@router.get("/charts/hall-usage", response_model=schemas.HallUsageChart)
def hall_usage_chart(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    rows = (
        db.query(models.Hall.name, func.count(models.Booking.id))
        .join(models.Booking, models.Hall.id == models.Booking.hall_id)
        .filter(models.Booking.user_id == current_user.id)
        .group_by(models.Hall.name)
        .order_by(func.count(models.Booking.id).desc())
        .all()
    )

    data = [{"hall_name": name, "total_bookings": total} for name, total in rows]

    return {"data": data}


#  REVENUE CHART 
@router.get("/charts/revenue", response_model=schemas.RevenueChart)
def revenue_chart(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    rows = (
        db.query(models.Booking)
        .filter(models.Booking.user_id == current_user.id)
        .all()
    )

    revenue_per_month = {}

    for booking in rows:
        if not booking.start_time:
            continue

        month_str = booking.start_time.strftime("%B")
        revenue_per_month[month_str] = revenue_per_month.get(month_str, 0) + (
            booking.total_price or 0
        )

    data = [
        {"month": m, "total_revenue": round(v, 2)}
        for m, v in revenue_per_month.items()
    ]

    return {"data": data}
