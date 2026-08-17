# Model Card: MAINTIX LightGBM Failure Classifier

## 1. Model Overview
- **Model Name:** MAINTIX Component Failure Mode Classifier
- **Model Type:** Multi-Class LightGBM Classifier
- **Version:** v2.0.0 (Production Champion)
- **Primary Task:** Categorization of impending failure root cause into specific asset subsystems.

## 2. Supported Failure Classes
- `BEARING_WEAR` (Outer/Inner Race spalling)
- `MOTOR_OVERHEATING` (Stator/Rotor thermal stress)
- `GEARBOX_FAILURE` (Gear tooth fatigue & backlash)
- `OVERCURRENT` (Electrical imbalance / motor stalling)
- `SENSOR_FAILURE` (Data quality loss / disconnection)
- `NORMAL` (Nominal operation)

## 3. Metrics
- **Macro Precision:** 97.2%
- **Macro Recall:** 96.5%
- **Macro F1 Score:** 96.8%
- **Inference Latency:** 1.5 ms
