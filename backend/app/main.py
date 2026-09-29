"""EduShield AI - Main FastAPI Application."""
import os
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, RedirectResponse
from starlette.routing import Match
from contextlib import asynccontextmanager
from app.config import get_settings
from app.database import engine, Base
from app.api import auth, students, predictions, analytics, counselling, schools, reports
from app.ml.model import predictor

settings = get_settings()


def _resolve_static_dir() -> Path | None:
    """Locate the built React frontend (if present) so one service can serve it.

    Resolution order:
    1. STATIC_DIR env var (used by the production Docker image: /app/static)
    2. <repo root>/frontend/dist (local builds)
    """
    candidates = []
    env_dir = os.getenv("STATIC_DIR")
    if env_dir:
        candidates.append(Path(env_dir))
    # <root>/backend/app/main.py -> parents: app, backend, <root>
    candidates.append(Path(__file__).resolve().parents[2] / "frontend" / "dist")
    for candidate in candidates:
        if candidate.is_dir() and (candidate / "index.html").is_file():
            return candidate
    return None


STATIC_DIR = _resolve_static_dir()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    print("Starting EduShield AI...")
    print(f"Serving SPA from: {STATIC_DIR or 'API only (no frontend build found)'}")

    # Create database tables
    Base.metadata.create_all(bind=engine)

    # Seed a fresh database (idempotent - skips when users already exist)
    try:
        from app.seed import seed_database
        seed_database()
    except Exception as e:
        print(f"Warning: Could not seed database: {e}")

    # Initialize ML model (falls back to synthetic training when no pkl exists)
    try:
        predictor.load_model()
        print("ML model loaded successfully")
    except Exception as e:
        print(f"Warning: Could not load ML model: {e}")

    yield

    # Shutdown
    print("Shutting down EduShield AI...")


app = FastAPI(
    title=settings.APP_NAME,
    description="AI-Powered Student Dropout Prediction & Counselling System",
    version=settings.APP_VERSION,
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(students.router, prefix="/api")
app.include_router(predictions.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(counselling.router, prefix="/api")
app.include_router(schools.router, prefix="/api")
app.include_router(reports.router, prefix="/api")


@app.get("/")
async def root():
    """Root endpoint: serve the SPA when a frontend build exists."""
    if STATIC_DIR:
        return FileResponse(STATIC_DIR / "index.html")
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "description": "AI-Powered Student Dropout Prediction & Counselling System",
        "status": "running",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }


@app.get("/{full_path:path}", include_in_schema=False)
async def spa_fallback(full_path: str, request: Request):
    """SPA fallback: serve built assets, unknown paths -> index.html (client routing)."""
    # Unmatched API routes stay JSON 404s instead of returning HTML
    if full_path.startswith("api/"):
        # This catch-all matches before Starlette's redirect_slashes can run,
        # so replicate it for API routes registered with a trailing slash
        # (e.g. GET /api/analytics -> /api/analytics/). Route.matches() is used
        # because FastAPI >= 0.141 wraps included routers in lazy _IncludedRouter
        # nodes, so flat app.routes path scanning cannot see individual routes.
        candidate = "/" + full_path + "/"
        scope = {"type": "http", "method": "GET", "path": candidate, "headers": []}
        for route in app.routes:
            if getattr(route, "path", None) == "/{full_path:path}":
                continue  # skip this catch-all (it matches every path)
            try:
                match, _ = route.matches(scope)
            except Exception:
                continue
            if match == Match.FULL:
                url = candidate + ("?" + request.url.query if request.url.query else "")
                return RedirectResponse(url=url, status_code=307)
        return JSONResponse({"detail": "Not Found"}, status_code=404)

    if STATIC_DIR:
        if full_path:
            # Serve real files (assets/*, favicon, robots.txt) with traversal guard
            candidate = (STATIC_DIR / full_path).resolve()
            if candidate.is_relative_to(STATIC_DIR) and candidate.is_file():
                return FileResponse(candidate)
        # Unknown paths fall back to the SPA shell for client-side routing
        return FileResponse(STATIC_DIR / "index.html")

    return JSONResponse({"detail": "Not Found"}, status_code=404)


@app.api_route(
    "/{full_path:path}",
    methods=["POST", "PUT", "PATCH", "DELETE"],
    include_in_schema=False,
)
async def non_get_fallback(full_path: str):
    """Unknown non-API/non-GET paths return JSON 404 (not a confusing 405)."""
    return JSONResponse({"detail": "Not Found"}, status_code=404)
