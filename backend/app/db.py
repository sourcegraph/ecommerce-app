from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy import text, inspect
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./store.db")
engine = create_engine(
    DATABASE_URL,
    connect_args={
        "check_same_thread": False,  # SQLite only
    },
)


def get_session():
    with Session(engine) as session:
        yield session


def ensure_product_feature_columns():
    """Add is_featured and featured_order columns if they don't exist"""
    with engine.connect() as conn:
        insp = inspect(conn)
        cols = {c["name"] for c in insp.get_columns("products")}

        if "is_featured" not in cols:
            conn.execute(
                text("ALTER TABLE products ADD COLUMN is_featured BOOLEAN DEFAULT 0")
            )

        if "featured_order" not in cols:
            conn.execute(
                text("ALTER TABLE products ADD COLUMN featured_order INTEGER NULL")
            )

        conn.commit()


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

    # Enable WAL mode for better performance with BLOBs
    with engine.connect() as conn:
        conn.execute(text("PRAGMA journal_mode=WAL;"))
        conn.execute(text("PRAGMA cache_size=10000;"))  # 10MB cache
        conn.execute(text("PRAGMA synchronous=NORMAL;"))  # better write throughput
        conn.commit()

    # Ensure feature columns exist for existing databases
    ensure_product_feature_columns()
