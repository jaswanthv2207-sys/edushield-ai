"""Database connection and session management."""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import get_settings

settings = get_settings()

# Ensure we use psycopg2 (not psycopg v3) by explicitly specifying the driver
DATABASE_URL = settings.DATABASE_URL
if DATABASE_URL.startswith("postgres://"):
    # Managed Postgres providers (Render, Fly, Heroku) hand out postgres:// URLs
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)
elif DATABASE_URL.startswith("postgresql+psycopg://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql+psycopg://", "postgresql+psycopg2://", 1)

# SSL: no forcing here. psycopg2 defaults to sslmode=prefer, which negotiates
# SSL when the server supports it (managed providers like Render) and falls
# back to plain TCP for local/dev servers. Add ?sslmode=require explicitly in
# DATABASE_URL when a provider mandates it.

IS_SQLITE = DATABASE_URL.startswith("sqlite")

if IS_SQLITE:
    # SQLite fallback for free tiers without managed Postgres.
    # check_same_thread=False: FastAPI serves requests from worker threads.
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
    )
else:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency to get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
