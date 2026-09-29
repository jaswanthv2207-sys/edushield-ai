# ============================================================
# EduShield AI - production image (single service)
# Stage 1 builds the React SPA, stage 2 runs FastAPI which
# serves both the API (/api/*) and the built SPA from one origin.
# This is the image Render builds via render.yaml.
# ============================================================

# ---- Stage 1: build React frontend ----
FROM node:20-alpine AS frontend

WORKDIR /build

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./

# Same-origin API: FastAPI serves the SPA and /api together,
# so the client just calls relative "/api" paths.
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---- Stage 2: FastAPI runtime ----
FROM python:3.11-slim

WORKDIR /app

# System dependencies for psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Application code
COPY backend/ ./

# Built SPA (served by app.main, resolved via STATIC_DIR)
COPY --from=frontend /build/dist /app/static
ENV STATIC_DIR=/app/static

# Reports output directory
RUN mkdir -p reports

# Render (and most platforms) inject the listen port via $PORT;
# default to 8000 for local docker/compose runs.
ENV PYTHONUNBUFFERED=1
EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
