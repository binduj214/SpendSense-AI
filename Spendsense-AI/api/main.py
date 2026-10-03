"""
SpendSense AI - FastAPI Application Entry Point
Run with: uvicorn api.main:app --reload
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from backend.database.db import init_db
from backend.config.settings import APP_NAME, APP_DESCRIPTION, ALLOWED_ORIGINS
from api.routes import (
    transactions_router,
    income_router,
    budgets_router,
    savings_router,
    dashboard_router,
    analytics_router,
    ai_router,
    export_router
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database and seed data on startup."""
    logger.info("Starting SpendSense AI...")
    init_db()
    logger.info("Database initialized.")

    # Seed sample data if database is empty
    try:
        from backend.database.db import SessionLocal
        db = SessionLocal()
        from backend.models.models import Transaction
        count = db.query(Transaction).count()
        if count == 0:
            logger.info("Empty database detected - seeding sample data...")
            from database.seed.seed_data import seed_database
            seed_database(db)
            logger.info("Sample data seeded successfully.")
        db.close()
    except Exception as e:
        logger.warning(f"Could not seed data: {e}")

    yield  # Application runs here

    logger.info("SpendSense AI shutting down.")


# Create FastAPI application
app = FastAPI(
    title=APP_NAME,
    description=APP_DESCRIPTION,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Middleware - allow React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# --- Register Routers ---
API_PREFIX = "/api"

app.include_router(transactions_router, prefix=API_PREFIX)
app.include_router(income_router, prefix=API_PREFIX)
app.include_router(budgets_router, prefix=API_PREFIX)
app.include_router(savings_router, prefix=API_PREFIX)
app.include_router(dashboard_router, prefix=API_PREFIX)
app.include_router(analytics_router, prefix=API_PREFIX)
app.include_router(ai_router, prefix=API_PREFIX)
app.include_router(export_router, prefix=API_PREFIX)


# --- Health Check ---
@app.get("/", tags=["Health"])
async def root():
    return {
        "app": APP_NAME,
        "status": "running",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "app": APP_NAME}


# --- Global Exception Handler ---
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please try again."}
    )
