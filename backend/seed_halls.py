"""
Seed database with Hall data for multiple cities
"""

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app import models
import json
import os


def seed_halls():
    # Ensure tables exist
    models.Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        
        file_path = "halls_1000.json"

        if not os.path.exists(file_path):
            raise FileNotFoundError(f"{file_path} not found. Please place halls_1000.json in project root.")

        with open(file_path, "r") as f:
            halls_data = json.load(f)

        print(f" Total halls found in file: {len(halls_data)}")
        added = 0
        skipped = 0

        for hall_data in halls_data:

          
            existing = (
                db.query(models.Hall)
                .filter(
                    models.Hall.name == hall_data["name"],
                    models.Hall.city == hall_data["city"],
                )
                .first()
            )

            if existing:
                skipped += 1
                continue

            hall = models.Hall(**hall_data)
            db.add(hall)
            added += 1

        db.commit()

        print(f"\n Seeding Completed")
        print(f" Added: {added} halls")
        print(f" Skipped duplicates: {skipped}")

    except Exception as e:
        print(f" Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("\n Seeding Halls...\n")
    seed_halls()
