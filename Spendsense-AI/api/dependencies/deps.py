from backend.database.db import get_db
from sqlalchemy.orm import Session
from typing import Generator


def get_db_session() -> Generator[Session, None, None]:
    """Dependency to get database session."""
    yield from get_db()
