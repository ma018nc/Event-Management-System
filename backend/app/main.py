from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routers import auth, halls, bookings, contact, events, dashboard, admin

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Event Booking API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8080",
        "http://127.0.0.1:8080"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "status": "Running",
        "message": "Event Booking API is LIVE",
    }

app.include_router(auth.router)
app.include_router(halls.router)
app.include_router(bookings.router)
app.include_router(contact.router)
app.include_router(events.router)
app.include_router(dashboard.router)
app.include_router(admin.router)