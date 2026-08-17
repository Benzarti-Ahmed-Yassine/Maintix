# Model Card: MAINTIX Safe Offline Maintenance Policy

## 1. Model Overview
- **Model Name:** MAINTIX Safe RL Maintenance Policy
- **Algorithm:** Offline Behavior Cloning / Conservative Policy Optimization
- **Version:** v1.0.0 (Advisory / Shadow Mode)
- **Primary Task:** Recommendation of optimal maintenance timing to maximize plant operational availability and minimize total lifecycle cost.

## 2. Action Space & Constraints
- **Actions:** `WAIT`, `INSPECT`, `SCHEDULE_PREVENTIVE`, `REPLACE_COMPONENT`, `STOP_MACHINE`
- **Safety Policy:** Direct machine control is STRICTLY FORBIDDEN. All actions are advisory recommendations requiring human confirmation (Technician or Maintenance Manager).

## 3. Reward Formulation
- **Objective:** $\text{Reward} = \text{AvoidedFailureCost} - \text{MaintenanceCost} - \text{DowntimeCost} - \text{RiskPenalty}$
- Evaluated against No-Maintenance, Reactive-Only, and Fixed-Interval baselines.
