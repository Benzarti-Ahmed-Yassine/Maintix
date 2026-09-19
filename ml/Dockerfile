# ── Stage 1: Builder ──────────────────────────────────────────
FROM python:3.11-slim AS builder

WORKDIR /app

# Install build tools
RUN python -m pip install --upgrade pip setuptools wheel

# Copy requirements and install dependencies
COPY requirements.txt ./
RUN python -m pip install --no-cache-dir -r requirements.txt

# ── Stage 2: Runner ───────────────────────────────────────────
FROM python:3.11-slim AS runner

WORKDIR /app

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONPATH=/app

# Copy installed packages from builder
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application code into /app/ml package layout
COPY . ./ml

# Create directories for data, artifacts, and reports
RUN mkdir -p /app/ml/data /app/ml/mlops/artifacts /app/ml/reports

EXPOSE 8000

CMD ["uvicorn", "ml.main:app", "--host", "0.0.0.0", "--port", "8000"]