# MAINTIX Final Jury Demonstration Guide

This guide walks through the exact 17-step end-to-end failure scenario for demonstrating the MAINTIX platform to industrial experts and hackathon juries.

---

## 17-Step Demo Scenario Walkthrough

### STEP 1: Role Selection
Launch the application and start at the **Role Selection Screen** (`/role-selection`). Highlight the 4 distinct industrial roles: Technician, Maintenance Manager, Production Manager, Industrial Director.

### STEP 2: Technician Overview & 3D Machine Inspection
Select **Technician** and navigate to Machine `TX-1250-A`. Observe the 3D Machine Spatial Diagnostic viewer showing the Picanol OptiMax-i 1250 weaving loom.

### STEP 3: Trigger Demo Scenario
Click **Bearing Failure ⚠️** on the floating bottom **Jury Demo Control Bar**.

### STEP 4: Real-Time Telemetry Reaction
Observe live sensor data update instantly without page refresh:
- Vibration RMS spikes to **11.2 mm/s RMS** (Red critical threshold).
- Bearing Temperature rises to **62.5 °C**.
- Real-time sparkline chart displays the exponential vibration curve.

### STEP 5: ML Anomaly Detection & Scoring
Python ML service processes the payload and returns:
- Anomaly Score: **0.92 (92%)**
- Health Score drops to **22%**
- Remaining Useful Life (RUL) decreases to **18 days**

### STEP 6: Alarm Generation
System triggers critical alarm: `ALM-VIB-1024: Abnormal vibration detected (Bearing - Left Side)`.

### STEP 7: AI Copilot RAG Reasoning
Open the **AI Copilot (RAG)** panel. The AI analyzes machine manuals and failure history using RAG:
- Diagnosis: *Stage 3 Bearing Outer-Race Degradation & Radial Misalignment*.
- RAG Sources: *Picanol OptiMax-i 1250 Manual & Machine TX-1250-A Intervention History*.

### STEP 8: Create Work Order
Click **Create Work Order** in the AI Copilot panel. Work Order `WO-2024-0891` is dispatched to the CMMS.

### STEP 9: Maintenance Manager View
Switch role to **Maintenance Manager** (`/maintenance/overview`). Observe:
- Machine `TX-1250-A` ranks **#1 in Risk Ranking** (92% Risk, 12 days RUL, Critical status).
- Gantt Maintenance Plan shows scheduled *Bearing Replacement & Shaft Realignment*.

### STEP 10: Production Manager View
Switch role to **Production Manager** (`/production/overview`). Observe:
- Production Line 4 status changes to **● Down / Critical** (OEE drops to **45.2%**).
- Bottleneck Analysis identifies Machine `TX-1250-A` as the line constraint.

### STEP 11: Industrial Director View
Switch role to **Industrial Director** (`/director/overview`). Observe executive metrics:
- Maintenance Cost Savings: **$24,650**
- Platform ROI: **312%**
- AI Decision Score: **92/100 (Excellent)**

### STEP 12: Human Feedback Loop & MLOps Validation
In the AI Copilot panel, accept the AI recommendation. The decision is saved to the database as validated human feedback for future MLOps retraining.
