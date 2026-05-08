from database import SessionLocal, engine
import models
from auth_utils import get_password_hash

# Ensure tables are created
models.Base.metadata.create_all(bind=engine)

def seed_admin():
    db = SessionLocal()
    try:
        # Create roles
        admin_role = db.query(models.Role).filter(models.Role.name == "Admin").first()
        if not admin_role:
            admin_role = models.Role(name="Admin")
            db.add(admin_role)
            db.commit()
            db.refresh(admin_role)

        analyst_role = db.query(models.Role).filter(models.Role.name == "Analyst").first()
        if not analyst_role:
            analyst_role = models.Role(name="Analyst")
            db.add(analyst_role)
            db.commit()
            db.refresh(analyst_role)

        # Create admin user
        admin_user = db.query(models.User).filter(models.User.username == "admin").first()
        if not admin_user:
            admin_user = models.User(
                username="admin",
                email="admin@blueshield.local",
                hashed_password=get_password_hash("admin123"), # Default password
                role_id=admin_role.id
            )
            db.add(admin_user)
            db.commit()
            print("Admin user created successfully (username: admin, password: admin123)")
        else:
            print("Admin user already exists.")
            
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin()
