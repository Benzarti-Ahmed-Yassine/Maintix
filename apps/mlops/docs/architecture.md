# MLOps Architecture

This document describes the Maintix MLOps architecture and component interactions.

## Components

- `Training` - Responsible for training experiments and model fitting.
- `Evaluation` - Responsible for scoring and comparing model candidates.
- `Validation` - Responsible for data quality and model validation checks.
- `MLflow` - Tracks experiments, metrics, and artifacts.
- `Model Registry` - Stores model versions and promotion states.
- `Feature Store` - Stores feature definitions and serving metadata.
- `Deployment` - Manages model packaging and rollout.
- `Monitoring` - Observes production model behavior and metrics.
- `Drift Detection` - Detects drift and triggers retraining workflows.
- `Retraining` - Orchestrates periodic or trigger-based retraining.
