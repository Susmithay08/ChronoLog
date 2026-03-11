from sqlalchemy import create_engine, Column, String, Text, Integer, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
import datetime

engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class LogEntry(Base):
    __tablename__ = "logs"
    id = Column(String, primary_key=True)
    date = Column(String, index=True)
    title = Column(String)
    body = Column(Text)
    mood = Column(String)  # great/good/okay/rough
    tags = Column(Text)    # comma-separated
    built = Column(Text)   # what was built
    learned = Column(Text)
    streak = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Digest(Base):
    __tablename__ = "digests"
    id = Column(String, primary_key=True)
    week_start = Column(String)
    week_end = Column(String)
    summary = Column(Text)
    highlights = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
