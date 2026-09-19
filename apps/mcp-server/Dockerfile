FROM python:3.12-slim

WORKDIR /app

# Install build tools
RUN python -m pip install --upgrade pip setuptools wheel

# Copy pyproject and install dependencies
COPY pyproject.toml ./
RUN python -m pip install --no-cache-dir fastapi "uvicorn[standard]" pydantic python-dotenv setuptools wheel

COPY . ./

EXPOSE 8200
CMD ["uvicorn", "maintix_mcp.main:app", "--host", "0.0.0.0", "--port", "8200"]