"""
Database Recreation Script
Backs up the old database and creates a fresh one with updated schema
"""
import os
import shutil
from datetime import datetime
from app.database import engine, Base, SessionLocal
from app.models import User, Hall
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

DB_PATH = "app.db"
BACKUP_DIR = "db_backups"

def backup_database():
    """Backup the existing database"""
    if os.path.exists(DB_PATH):
        os.makedirs(BACKUP_DIR, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = os.path.join(BACKUP_DIR, f"app_backup_{timestamp}.db")
        shutil.copy2(DB_PATH, backup_path)
        print(f"✅ Database backed up to: {backup_path}")
        return True
    else:
        print("ℹ️  No existing database to backup")
        return False

def recreate_database():
    """Delete old database and create new one"""
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
        print(f"🗑️  Deleted old database: {DB_PATH}")
    
    # Create all tables with updated schema
    Base.metadata.create_all(bind=engine)
    print("✅ Created new database with updated schema")

def seed_data():
    """Seed initial data"""
    db = SessionLocal()
    try:
        # Create admin user
        admin = User(
            full_name="Admin User",
            email="admin@evento.com",
            hashed_password=pwd_context.hash("admin123"),
            is_admin=True
        )
        db.add(admin)
        
        # Create test user
        test_user = User(
            full_name="Test User",
            email="test@evento.com",
            hashed_password=pwd_context.hash("test123"),
            is_admin=False
        )
        db.add(test_user)
        
        # Create sample halls
        halls = [
            Hall(
                name="Grand Ballroom",
                city="Mumbai",
                state="Maharashtra",
                latitude=19.0760,
                longitude=72.8777,
                location="123 Marine Drive, Mumbai",
                capacity=500,
                price_per_hour=15000,
                description="Luxurious ballroom perfect for weddings and corporate events",
                image_url="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800"
            ),
            Hall(
                name="Royal Convention Center",
                city="Delhi",
                state="Delhi",
                latitude=28.6139,
                longitude=77.2090,
                location="45 Connaught Place, Delhi",
                capacity=300,
                price_per_hour=12000,
                description="Elegant convention center with modern amenities",
                image_url="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800"
            ),
            Hall(
                name="Crystal Palace Hall",
                city="Bangalore",
                state="Karnataka",
                latitude=12.9716,
                longitude=77.5946,
                location="78 MG Road, Bangalore",
                capacity=200,
                price_per_hour=8000,
                description="Modern hall with state-of-the-art facilities",
                image_url="https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&q=80&w=800"
            ),
            Hall(
                name="Sunset Garden Venue",
                city="Pune",
                state="Maharashtra",
                latitude=18.5204,
                longitude=73.8567,
                location="12 Koregaon Park, Pune",
                capacity=150,
                price_per_hour=6000,
                description="Beautiful outdoor venue perfect for intimate gatherings",
                image_url="https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=800"
            )
        ]
        
        for hall in halls:
            db.add(hall)
        
        db.commit()
        print("✅ Seeded initial data:")
        print("   • Admin user: admin@evento.com / admin123")
        print("   • Test user: test@evento.com / test123")
        print(f"   • {len(halls)} sample halls")
        
    except Exception as e:
        print(f"❌ Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

def main():
    print("=" * 60)
    print("DATABASE RECREATION SCRIPT")
    print("=" * 60)
    print()
    
    # Step 1: Backup
    backup_database()
    
    # Step 2: Recreate
    recreate_database()
    
    # Step 3: Seed
    seed_data()
    
    print()
    print("=" * 60)
    print(" DATABASE RECREATION COMPLETED")
    print("=" * 60)

if __name__ == "__main__":
    main()
