import os
from dotenv import load_dotenv
from google.generativeai import GenerativeModel, configure
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

load_dotenv()

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Event Log Model
class EventLog(Base):
    __tablename__ = "event_logs"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(50))
    message = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)
    status = Column(String(50))
    model_name = Column(String(100))

# Create tables
Base.metadata.create_all(bind=engine)

def log_event(event_type, message, status="info", model_name=None):
    db = SessionLocal()
    try:
        event_log = EventLog(
            event_type=event_type,
            message=message,
            status=status,
            model_name=model_name
        )
        db.add(event_log)
        db.commit()
        db.refresh(event_log)
        return event_log
    except Exception as e:
        print(f"Error logging event: {e}")
        db.rollback()
    finally:
        db.close()

# Configure Gemini
gemini_key = os.getenv("GEMINI_API_KEY")
gemini_model = os.getenv("GEMINI_MODEL")
configure(api_key=str(gemini_key))

# Initialize the model
gemini = GenerativeModel("gemini-1.5-pro")  # or your preferred model
geminiModel = gemini.start_chat()

def clear_history():
    """Clear chat history and reinitialize"""
    try:
        global geminiModel
        gemini = GenerativeModel(gemini_model)
        geminiModel = gemini.start_chat()
        log_event(
            event_type="CLEAR",
            message="Chat history cleared",
            status="success",
            model_name="gemini-1.5-pro"
        )
        return True
    except Exception as e:
        log_event(
            event_type="ERROR",
            message=f"Error clearing chat history: {str(e)}",
            status="error",
            model_name="gemini-1.5-pro"
        )
        return False

def get_recent_logs(limit=10):
    """Retrieve recent event logs"""
    db = SessionLocal()
    try:
        logs = db.query(EventLog)\
            .order_by(EventLog.timestamp.desc())\
            .limit(limit)\
            .all()
        return logs
    finally:
        db.close()