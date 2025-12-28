from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/contact", tags=["Contact"])


@router.post("/", response_model=schemas.Contact, status_code=201)
def create_message(msg: schemas.ContactCreate, db: Session = Depends(get_db)):

    new_msg = models.ContactMessage(
        name=msg.name,
        email=msg.email,
        subject=msg.subject,
        message=msg.message
    )

    db.add(new_msg)
    db.commit()
    db.refresh(new_msg)

    return new_msg


@router.get("/", response_model=list[schemas.Contact])
def get_all(db: Session = Depends(get_db)):
    return db.query(models.ContactMessage).all()
