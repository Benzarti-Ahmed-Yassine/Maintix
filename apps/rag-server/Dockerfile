FROM python:3.12-slim

WORKDIR /app

# Install build tools
RUN python -m pip install --upgrade pip setuptools wheel

# Copy pyproject and install dependencies
COPY pyproject.toml ./
RUN python -m pip install --no-cache-dir fastapi "uvicorn[standard]" pydantic python-dotenv redis httpx

COPY . ./

EXPOSE 8100
CMD ["uvicorn", "rag_server.main:app", "--host", "0.0.0.0", "--port", "8100"]