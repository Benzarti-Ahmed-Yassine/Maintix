FROM python:3.12-slim

WORKDIR /app

COPY pyproject.toml .
RUN pip install --no-cache-dir .

COPY maintix_mlops ./maintix_mlops
COPY tests ./tests

CMD ["python", "-m", "pytest", "-q"]
