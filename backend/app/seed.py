"""Seed script to populate database with initial data."""
import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.models.school import School
from app.models.student import Student, Gender, FeeStatus, FamilySupport, MedicalCondition
from app.services.auth_service import get_password_hash


def seed_database():
    """Seed database with initial data."""
    db = SessionLocal()

    try:
        # Create tables
        Base.metadata.create_all(bind=engine)

        # Check if data already exists
        if db.query(User).count() > 0:
            print("Database already seeded. Skipping...")
            return

        print("Seeding database...")

        # Create schools
        schools = [
            School(
                name="Government Senior Secondary School, Jaipur",
                code="GSSS-JPR-001",
                address="MG Road, Jaipur",
                city="Jaipur",
                district="Jaipur",
                state="Rajasthan",
                pincode="302001",
                phone="0141-2370001",
                email="gsss.jaipur@rajasthan.gov.in",
                school_type="government",
                medium="hindi"
            ),
            School(
                name="Government High School, Jodhpur",
                code="GHS-JDH-002",
                address="Station Road, Jodhpur",
                city="Jodhpur",
                district="Jodhpur",
                state="Rajasthan",
                pincode="342001",
                phone="0291-2610002",
                email="ghs.jodhpur@rajasthan.gov.in",
                school_type="government",
                medium="hindi"
            ),
            School(
                name="Government Senior Secondary School, Udaipur",
                code="GSSS-UDPR-003",
                address="Lake Pichola Road, Udaipur",
                city="Udaipur",
                district="Udaipur",
                state="Rajasthan",
                pincode="313001",
                phone="0294-2410003",
                email="gsss.udaipur@rajasthan.gov.in",
                school_type="government",
                medium="english"
            ),
            School(
                name="Government High School, Kota",
                code="GHS-KOTA-004",
                address="Kunhadi Road, Kota",
                city="Kota",
                district="Kota",
                state="Rajasthan",
                pincode="324001",
                phone="0744-2410004",
                email="ghs.kota@rajasthan.gov.in",
                school_type="government",
                medium="hindi"
            ),
            School(
                name="Government Senior Secondary School, Bikaner",
                code="GSSS-BKN-005",
                address="Gangashahar Road, Bikaner",
                city="Bikaner",
                district="Bikaner",
                state="Rajasthan",
                pincode="334001",
                phone="0151-2200005",
                email="gsss.bikaner@rajasthan.gov.in",
                school_type="government",
                medium="hindi"
            ),
        ]

        db.add_all(schools)
        db.commit()
        print(f"Created {len(schools)} schools")

        # Create users
        users = [
            User(
                email="admin@edushield.ai",
                hashed_password=get_password_hash("Admin@123"),
                full_name="System Administrator",
                role=UserRole.ADMIN,
                phone="9876543210",
                is_active=True,
                is_superuser=True
            ),
            User(
                email="principal@edushield.ai",
                hashed_password=get_password_hash("Principal@123"),
                full_name="Dr. Rajesh Sharma",
                role=UserRole.PRINCIPAL,
                school_id=schools[0].id,
                phone="9876543211",
                is_active=True
            ),
            User(
                email="teacher@edushield.ai",
                hashed_password=get_password_hash("Teacher@123"),
                full_name="Priya Verma",
                role=UserRole.TEACHER,
                school_id=schools[0].id,
                phone="9876543212",
                is_active=True
            ),
            User(
                email="counsellor@edushield.ai",
                hashed_password=get_password_hash("Counsellor@123"),
                full_name="Dr. Meena Kumari",
                role=UserRole.COUNSELLOR,
                school_id=schools[0].id,
                phone="9876543213",
                is_active=True
            ),
        ]

        db.add_all(users)
        db.commit()
        print(f"Created {len(users)} users")

        # Create students
        first_names_male = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Aadhya", "Krishna", "Ishaan", "Rohan", "Amit", "Vikram", "Suresh", "Rahul"]
        first_names_female = ["Aadhya", "Diya", "Myra", "Sara", "Ananya", "Aanya", "Anika", "Navya", "Angel", "Pari", "Priya", "Neha", "Kavita", "Sunita", "Pooja"]
        last_names = ["Sharma", "Verma", "Gupta", "Singh", "Kumar", "Patel", "Joshi", "Mehta", "Agarwal", "Reddy", "Nair", "Iyer", "Rao", "Desai", "Chopra"]

        students = []
        for i in range(100):
            gender = random.choice([Gender.MALE, Gender.FEMALE])
            first_name = random.choice(first_names_male if gender == Gender.MALE else first_names_female)
            last_name = random.choice(last_names)

            # Generate realistic academic data
            attendance = random.uniform(50, 100)
            failures = random.choices([0, 1, 2, 3], weights=[60, 25, 10, 5])[0]
            final_grade = random.uniform(25, 95)

            # Socioeconomic factors
            family_support = random.choices(
                [FamilySupport.HIGH, FamilySupport.MEDIUM, FamilySupport.LOW],
                weights=[30, 50, 20]
            )[0]
            internet_access = random.choices([True, False], weights=[70, 30])[0]
            fee_status = random.choices(
                [FeeStatus.PAID, FeeStatus.PENDING, FeeStatus.OVERDUE, FeeStatus.SCHOLARSHIP],
                weights=[50, 25, 15, 10]
            )[0]
            medical = random.choices(
                [MedicalCondition.NONE, MedicalCondition.MINOR, MedicalCondition.CHRONIC, MedicalCondition.SEVERE],
                weights=[80, 12, 6, 2]
            )[0]
            higher_ed_interest = random.choices([True, False], weights=[75, 25])[0]

            student = Student(
                student_id=f"STU{2024}{i+1:04d}",
                full_name=f"{first_name} {last_name}",
                email=f"{first_name.lower()}.{last_name.lower()}{i+1}@school.edu",
                phone=f"98{random.randint(10000000, 99999999)}",
                gender=gender,
                age=random.randint(14, 20),
                school_id=random.choice(schools).id,
                grade=random.choice(["9", "10", "11", "12"]),
                section=random.choice(["A", "B", "C"]),
                attendance_percentage=round(attendance, 2),
                final_grade=round(final_grade, 2),
                previous_failures=failures,
                study_time_weekly=round(random.uniform(0, 25), 2),
                family_support=family_support,
                internet_access=internet_access,
                fee_status=fee_status,
                medical_condition=medical,
                higher_education_interest=higher_ed_interest,
                parent_education=random.choice(["Primary", "Secondary", "Higher Secondary", "Graduate", "Post Graduate", "Illiterate"]),
                family_income=random.choice(["<1L", "1-3L", "3-5L", "5-10L", ">10L"]),
                distance_from_school=round(random.uniform(0, 25), 2),
                address=f"{random.randint(1, 999)}, {random.choice(['MG Road', 'Station Road', 'Market Area', 'Colony', 'Village'])}",
                city=random.choice(["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner"]),
                district=random.choice(["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner"]),
                state="Rajasthan"
            )
            students.append(student)

        db.add_all(students)
        db.commit()
        print(f"Created {len(students)} students")

        # Generate initial AI predictions so risk dashboards are populated on
        # first boot (the predictor self-trains when no model file exists).
        try:
            from app.services.prediction_service import predict_bulk
            predictions = predict_bulk(db, [s.id for s in students])
            print(f"Generated {len(predictions)} initial predictions")
        except Exception as e:
            db.rollback()
            print(f"Warning: Could not generate seed predictions: {e}")

        print("Database seeded successfully!")
        print("\nDefault login credentials:")
        print("  Admin: admin@edushield.ai / Admin@123")
        print("  Principal: principal@edushield.ai / Principal@123")
        print("  Teacher: teacher@edushield.ai / Teacher@123")
        print("  Counsellor: counsellor@edushield.ai / Counsellor@123")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
