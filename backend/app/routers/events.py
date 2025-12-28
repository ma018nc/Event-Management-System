from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app import models, schemas
from app.database import get_db

from app.routers.auth import get_current_admin_user

router = APIRouter(prefix="/events", tags=["Events"])

@router.get("/", response_model=List[schemas.Event])
def list_events(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    return db.query(models.Event).offset(skip).limit(limit).all()

@router.post("/", response_model=schemas.Event, status_code=201)
def create_event(
    event: schemas.EventCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    db_event = models.Event(**event.dict())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event