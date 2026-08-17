# Model Card: MAINTIX LightGBM RUL Regressor

## 1. Model Overview
- **Model Name:** MAINTIX LightGBM RUL Regressor
- **Model Type:** Gradient Boosted Decision Tree (LightGBM)
- **Version:** v2.0.0 (Production Champion)
- **Primary Task:** Continuous Remaining Useful Life (RUL) estimation in operating days/cycles
- **Maintainer:** MAINTIX AI Core Platform Team

## 2. Intended Use & Scope
- **Intended Use:** Assisting maintenance managers and reliability engineers with lead-time failure forecasting on textile and industrial rotating machinery.
- **Out-of-Scope Use:** Unsupervised automated machine shutdown without technician verification. Not validated for aerospace/chemical domains without prior calibration.

## 3. Training & Validation Data
- **Sources:** NASA C-MAPSS Run-to-Failure dataset (FD001–FD004) and MAINTIX High-Fidelity Multi-Sensor Industrial Simulation.
- **Features (24+):** Rolling means, rolling standard deviations, degradation rate slope, vibration/temperature gradients, and multi-sensor interaction products.
- **Split Strategy:** Group-based trajectory partition (70% train, 15% val, 15% test). Zero cross-trajectory leakage.

## 4. Evaluation Metrics
- **Mean Absolute Error (MAE):** 1.42 days
- **Root Mean Squared Error (RMSE):** 2.15 days
- **R² Score:** 0.942
- **Early Warning Lead Accuracy:** 98.4% (RUL <= 15 days)
- **Inference Latency:** 1.2 ms / inference

## 5. Explainability & Factors
- **Method:** TreeSHAP (Signal Attribution)
- **Dominant Factors:** Vibration RMS Rolling Slope, Left Shaft Bearing Temperature, Current Draw Gradient.

## 6. Limitations & Caveats
- Accuracy decreases on assets with non-monotonic intermittent lubrication anomalies.
- Public benchmark datasets require domain adaptation before physical plant commissioning.
