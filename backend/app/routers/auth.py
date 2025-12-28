from fastapi import APIRouter, Depends, HTTPException, status, Response, Cookie, Request, Form
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import secrets, hashlib

from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/auth", tags=["Auth"])


from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def generate_session_token() -> str:
    return secrets.token_urlsafe(32)


#  COOKIE + HEADER AUTH
def get_current_active_user(
    request: Request,
    db: Session = Depends(get_db),
    session_token: str = Cookie(None),
):
    token = session_token

    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.replace("Bearer ", "")

    if not token:
        raise HTTPException(status_code=401, detail="Not logged in")

    session = db.query(models.Session).filter(
        models.Session.token == token,
        models.Session.expiration > datetime.utcnow()
    ).first()

    if not session:
        raise HTTPException(status_code=401, detail="Invalid or expired session")

    user = db.query(models.User).filter(
        models.User.id == session.user_id
    ).first()

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user


#  ADMIN ONLY DEPENDENCY  
def get_current_admin_user(
    current_user: models.User = Depends(get_current_active_user),
):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user


#  SIGNUP 

@router.post("/signup", response_model=schemas.User, status_code=201)
def signup(user_data: schemas.UserCreate, db: Session = Depends(get_db)):

    if db.query(models.User).filter(models.User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = models.User(
        full_name=user_data.full_name,
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        is_admin=False
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


#  USER + ADMIN LOGIN 

@router.post("/login")
def login(data: schemas.Login, response: Response, db: Session = Depends(get_db)):

    user = db.query(models.User).filter(models.User.email == data.email).first()

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    session_token = generate_session_token()

    db.add(models.Session(
        token=session_token,
        user_id=user.id,
        expiration=datetime.utcnow() + timedelta(days=7)
    ))
    db.commit()

    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=False,  
        samesite="lax",
        secure=False,
        path="/",
        max_age=60 * 60 * 24 * 7
    )

    return {
        "message": "Login successful",
        "is_admin": user.is_admin,
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "is_admin": user.is_admin
        }
    }


# ------------------ DEFAULT ADMIN LOGIN ------------------

@router.post("/admin/login")
def admin_login(
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):

    # Create forced admin if not exists
    if email == "admin@gmail.com" and password == "admin123":
        user = db.query(models.User).filter(models.User.email == email).first()

        if not user:
            user = models.User(
                full_name="System Admin",
                email=email,
                hashed_password=hash_password(password),
                is_admin=True
            )
            db.add(user)
            db.commit()
        elif not user.is_admin:
            user.is_admin = True
            user.hashed_password = hash_password(password)
            db.commit()

    user = db.query(models.User).filter(models.User.email == email).first()

    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin only")

    session_token = generate_session_token()

    db.add(models.Session(
        token=session_token,
        user_id=user.id,
        expiration=datetime.utcnow() + timedelta(days=1)
    ))
    db.commit()

    response = Response()

    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=False,
        samesite="lax",
        secure=False,
        path="/",
        max_age=60 * 60 * 24
    )

    return {
        "message": "Admin login successful",
        "is_admin": True,
        "user": {
            "id": user.id,
            "email": user.email,
            "is_admin": True
        }
    }


#  LOGOUT 

@router.post("/logout")
def logout(
    response: Response,
    db: Session = Depends(get_db),
    session_token: str = Cookie(None)
):

    if session_token:
        db.query(models.Session).filter(
            models.Session.token == session_token
        ).delete()
        db.commit()

    response.delete_cookie("session_token")

    return {"message": "Logged out"}


#  CHECK AUTH 

@router.get("/me", response_model=schemas.User)
def get_me(current_user: models.User = Depends(get_current_active_user)):
    return current_user
