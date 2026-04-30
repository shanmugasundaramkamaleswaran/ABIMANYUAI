#!/usr/bin/env python3
"""Initialize demo user in database."""

import sys
import os

# Change to backend directory
os.chdir(os.path.join(os.path.dirname(__file__), 'backend'))
sys.path.insert(0, '.')

# Import only database and models, not main
from database import SessionLocal, init_db, Base, engine
from models import User
from auth import get_password_hash

def init_demo_user():
    """Initialize database and create demo user."""
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("✅ Database initialized")
        
        # Create session
        db = SessionLocal()
        
        try:
            # Check if demo user exists
            demo_user = db.query(User).filter(User.email == "demo@example.com").first()
            
            if demo_user:
                print("ℹ️  Demo user already exists")
                print(f"   Email: demo@example.com")
                print(f"   Password: demo123")
            else:
                # Create demo user
                demo_user = User(
                    email="demo@example.com",
                    password_hash=get_password_hash("demo123"),
                    name="Demo User"
                )
                db.add(demo_user)
                db.commit()
                print("✅ Demo user created successfully")
                print(f"   Email: demo@example.com")
                print(f"   Password: demo123")
                
        finally:
            db.close()
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

if __name__ == "__main__":
    success = init_demo_user()
    if not success:
        sys.exit(1)
