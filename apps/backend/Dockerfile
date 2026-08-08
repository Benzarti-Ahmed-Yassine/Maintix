FROM python:3.12-slim

WORKDIR /app

COPY pyproject.toml setup.cfg* .
RUN python -m pip install --upgrade pip
RUN python -m pip install --no-cache-dir .

COPY . ./

EXPOSE 8000
CMD ["uvicorn", "maintix_backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
