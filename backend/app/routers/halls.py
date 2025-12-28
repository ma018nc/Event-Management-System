from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
import os, requests

from app import models, schemas
from app.database import get_db

from app.routers.auth import get_current_admin_user

router = APIRouter(prefix="/halls", tags=["Halls"])

GOOGLE_PLACES_API_KEY = os.getenv("GOOGLE_PLACES_API_KEY")


#  GET ALL HALLS 
@router.get("/", response_model=List[schemas.Hall])
def get_halls(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    return db.query(models.Hall).offset(skip).limit(limit).all()


#  GET SINGLE HALL 
@router.get("/{hall_id}", response_model=schemas.Hall)
def get_hall_by_id(hall_id: int, db: Session = Depends(get_db)):
    hall = db.query(models.Hall).filter(models.Hall.id == hall_id).first()
    if not hall:
        raise HTTPException(404, detail="Hall not found")
    return hall


# = CREATE HALL (ADMIN ONLY) 
@router.post("/", response_model=schemas.Hall, status_code=201)
def create_hall(
    hall: schemas.HallCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):

    new_hall = models.Hall(**hall.dict())

    db.add(new_hall)
    db.commit()
    db.refresh(new_hall)

    return new_hall


# GOOGLE LIVE HALLS 
@router.get("/google/nearby")
def google_nearby_halls(
    city: str = Query(None),
    lat: float = Query(None),
    lng: float = Query(None),
    radius: int = 5000
):
    if not GOOGLE_PLACES_API_KEY:
        raise HTTPException(500, detail="Google API key not configured")

    # Convert city to lat/lng
    if city:
        geo_url = "https://maps.googleapis.com/maps/api/geocode/json"
        geo_params = {
            "address": f"{city}, India",
            "key": GOOGLE_PLACES_API_KEY,
        }

        geo_res = requests.get(geo_url, params=geo_params).json()

        if geo_res.get("status") != "OK":
            raise HTTPException(404, detail="City not found")

        location = geo_res["results"][0]["geometry"]["location"]
        lat = location["lat"]
        lng = location["lng"]

    if not lat or not lng:
        raise HTTPException(400, detail="City or lat/lng is required")

    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {
        "location": f"{lat},{lng}",
        "radius": radius,
        "keyword": "banquet hall wedding event venue",
        "key": GOOGLE_PLACES_API_KEY,
    }

    data = requests.get(url, params=params).json()

    if data.get("status") not in ["OK", "ZERO_RESULTS"]:
        raise HTTPException(502, detail=data.get("error_message", "Google API error"))

    results = []
    for i, p in enumerate(data.get("results", [])):
        loc = p["geometry"]["location"]

        photo_url = "https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg"

        if p.get("photos"):
            ref = p["photos"][0]["photo_reference"]
            photo_url = (
                f"https://maps.googleapis.com/maps/api/place/photo"
                f"?maxwidth=800"
                f"&photoreference={ref}"
                f"&key={GOOGLE_PLACES_API_KEY}"
            )

        results.append({
            "id": p.get("place_id", i),
            "name": p.get("name"),
            "city": city,
            "address": p.get("vicinity"),
            "rating": p.get("rating", 4.2),
            "latitude": loc["lat"],
            "longitude": loc["lng"],
            "photo_url": photo_url,
            "capacity": 100 + (i * 25),
            "price_per_hour": 2000 + (i * 300),
            "description": "Premium event & wedding venue",
        })

    return results


#  SEED DUMMY HALLS 
@router.post("/seed")
def seed_halls(db: Session = Depends(get_db)):

    halls = [
        {
            "name": "Royal Banquet Hall",
            "city": "Bhopal",
            "state": "MP",
            "location": "MP Nagar",
            "latitude": 23.2599,
            "longitude": 77.4126,
            "capacity": 300,
            "price_per_hour": 2000,
            "description": "Premium venue",
            "image_url": "https://images.pexels.com/photos/169211/pexels-photo-169211.jpeg"
        },
        {
            "name": "Star Convention Center",
            "city": "Bhopal",
            "state": "MP",
            "location": "Arera Colony",
            "latitude": 23.259,
            "longitude": 77.4000,
            "capacity": 500,
            "price_per_hour": 3500,
            "description": "Conference and wedding hall",
            "image_url": "https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg"
        }
    ]

    for h in halls:
        exists = db.query(models.Hall).filter(models.Hall.name == h["name"]).first()
        if not exists:
            db.add(models.Hall(**h))

    db.commit()

    return {"message": " Dummy halls added"}
