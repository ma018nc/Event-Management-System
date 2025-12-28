import sqlalchemy
print(f"SQLAlchemy version: {sqlalchemy.__version__}")
try:
    from sqlalchemy.orm import Session
    print("SQLAlchemy ORM imported successfully")
except ImportError as e:
    print(f"Error importing ORM: {e}")
