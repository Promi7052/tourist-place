from contextlib import contextmanager
from core import settings
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker


# Pulls the URL we added to settings.py
DATABASE_URL = settings.SQLALCHEMY_DATABASE_URL



engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

@contextmanager
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()