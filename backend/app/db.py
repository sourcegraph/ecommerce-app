from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy import text
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./store.db")
engine = create_engine(
    DATABASE_URL, 
    connect_args={
        "check_same_thread": False,
    }
)

def get_session():
    with Session(engine) as session:
        yield session

def create_db_and_tables():
    from .models import Product, Category, DeliveryOption, ProductDeliveryLink  # noqa: F401
    from .currency import FxRates  # noqa: F401
    
    SQLModel.metadata.create_all(engine)
    
    with engine.connect() as conn:
        conn.execute(text("PRAGMA journal_mode=WAL;"))
        conn.execute(text("PRAGMA cache_size=10000;"))
        conn.execute(text("PRAGMA synchronous=NORMAL;"))
        conn.commit()
