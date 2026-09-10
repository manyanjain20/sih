import logging
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from config import settings

logger = logging.getLogger("medikiosk.database")

# Primary database URL
db_url = settings.DATABASE_URL

# Create engine
engine = create_async_engine(
    db_url,
    echo=False,
    pool_pre_ping=True,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


def get_session():
    return AsyncSessionLocal()


async def init_db():
    """Create all tables. Used in development; falls back to SQLite if PostgreSQL is offline."""
    global engine, AsyncSessionLocal
    try:
        async with engine.begin() as conn:
            from models import all_models  # noqa: F401
            await conn.run_sync(Base.metadata.create_all)
            logger.info("Successfully connected to primary database.")
    except Exception as e:
        logger.warning(f"Could not connect to primary PostgreSQL ({e}). Falling back to local SQLite engine...")
        engine = create_async_engine(
            "sqlite+aiosqlite:///./medikiosk.db",
            echo=False,
        )
        AsyncSessionLocal.configure(bind=engine)
        async with engine.begin() as conn:
            from models import all_models  # noqa: F401
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Local SQLite database initialized with all 21 clinical tables.")
