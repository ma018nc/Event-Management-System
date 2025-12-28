from app.database import SessionLocal
from app.models import User
import hashlib

# Helper function to hash passwords
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def create_admin():
    db = SessionLocal()
    email = "admin@gmail.com"
    password = "admin123"
    
    # Check if user exists
    user = db.query(User).filter(User.email == email).first()
    
    if user:
        print(f"User {email} found.")
       
        if not user.is_admin:
            print("Promoting to Admin...")
            user.is_admin = True
        else:
            print("User is already Admin. Resetting password...")
            
        user.hashed_password = hash_password(password)
        db.commit()
        print(" Admin permissions and password updated successfully.")
        
    else:
        print(f"User {email} not found. Creating new Admin account...")
        new_admin = User(
            full_name="System Admin",
            email=email,
            hashed_password=hash_password(password),
            is_admin=True
        )
        db.add(new_admin)
        db.commit()
        print(" New Admin account created successfully.")
    
    db.close()
    print(f" Login with: {email} / {password}")

if __name__ == "__main__":
    create_admin()