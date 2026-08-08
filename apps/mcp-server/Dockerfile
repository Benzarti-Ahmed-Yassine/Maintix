FROM python:3.12-slim

WORKDIR /app

COPY pyproject.toml ./
RUN python -m pip install --upgrade pip
RUN python -m pip install --no-cache-dir .

COPY . ./

EXPOSE 8200
CMD ["uvicorn", "maintix_mcp.main:app", "--host", "0.0.0.0", "--port", "8200"]
