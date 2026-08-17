# Model Card: MAINTIX Deep AutoEncoder Anomaly Detector

## 1. Model Overview
- **Model Name:** MAINTIX Multi-Sensor Reconstruction AutoEncoder
- **Model Type:** Deep Fully-Connected AutoEncoder with Bottleneck Compression
- **Version:** v2.0.0 (Production Champion)
- **Primary Task:** Unsupervised sensor anomaly detection & health deviation scoring

## 2. Intended Use & Scope
- **Intended Use:** Real-time multi-channel telemetry outlier detection across vibration, temperature, voltage, and current sensors.
- **Out-of-Scope:** Root cause diagnosis (delegated to Failure Classifier and Graph RAG).

## 3. Metrics & Calibration
- **Precision:** 97.5%
- **Recall:** 96.8%
- **F1 Score:** 97.1%
- **False Positive Rate:** 2.1%
- **Threshold Calibration:** 95th percentile reconstruction MSE on nominal baseline dataset.
