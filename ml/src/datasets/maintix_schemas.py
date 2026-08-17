"""
MAINTIX Normalized Dataset Schemas
==================================
Defines authoritative schemas for the multi-table MAINTIX Industrial Intelligence architecture.
Ensures source-of-truth normalization across telemetry, production, maintenance,
knowledge, feedback, and reinforcement learning domains.
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any


@dataclass
class MachineSchema:
    machine_id: str
    machine_name: str
    machine_type: str
    manufacturer: str
    model: str
    production_line: str
    location: str
    criticality: str  # LOW, MEDIUM, HIGH, CRITICAL


@dataclass
class ComponentSchema:
    component_id: str
    machine_id: str
    component_type: str
    component_name: str
    position: str
    criticality: str


@dataclass
class SensorSchema:
    sensor_id: str
    machine_id: str
    component_id: str
    sensor_type: str
    unit: str
    sampling_rate: float


@dataclass
class TelemetrySchema:
    timestamp: str
    machine_id: str
    sensor_id: str
    component_id: str
    
    # Thermal
    temperature_motor: float
    temperature_bearing: float
    temperature_gearbox: float
    temperature_ambient: float
    
    # Vibration
    vibration_x: float
    vibration_y: float
    vibration_z: float
    vibration_rms: float
    vibration_peak: float
    crest_factor: float
    kurtosis: float
    skewness: float
    dominant_frequency: float
    
    # Electrical
    voltage: float
    current: float
    active_power: float
    reactive_power: float
    apparent_power: float
    power_factor: float
    
    # Kinematics & Environmental
    rpm: float
    torque: float
    pressure: float
    humidity: float
    dust: float
    
    # Production
    production_speed: float
    cycle_time: float
    downtime: float


@dataclass
class MaintenanceSchema:
    maintenance_id: str
    machine_id: str
    component_id: str
    maintenance_type: str
    maintenance_date: str
    failure_type: str
    root_cause: str
    action_taken: str
    parts_used: str
    duration: float
    cost: float


@dataclass
class ProductionSchema:
    production_id: str
    machine_id: str
    production_line: str
    timestamp: str
    production_order: str
    output: int
    good_output: int
    defect_output: int
    cycle_time: float
    downtime: float
    availability: float
    performance: float
    quality: float
    oee: float


@dataclass
class AILabelSchema:
    machine_id: str
    component_id: str
    timestamp: str
    health_index: float
    anomaly_score: float
    failure_probability: float
    failure_type: str
    severity: str
    rul: float
    rul_unit: str


@dataclass
class FeedbackSchema:
    prediction_id: str
    machine_id: str
    component_id: str
    prediction: str
    actual_outcome: str
    technician_feedback: str
    maintenance_action: str
    result: str
    validated: bool
    timestamp: str


@dataclass
class RLTransitionSchema:
    state_timestamp: str
    machine_id: str
    component_id: str
    health_index: float
    rul: float
    anomaly_score: float
    failure_probability: float
    criticality: str
    production_load: float
    production_value: float
    spare_part_available: int
    maintenance_cost: float
    downtime_cost: float
    action: str
    reward: float
    next_health_index: float
    next_rul: float
    next_machine_state: str
    episode_id: str
    policy_version: str


# Mapping of registered table schemas
TABLE_SCHEMAS = {
    "maintix_machine_dataset": MachineSchema,
    "maintix_component_dataset": ComponentSchema,
    "maintix_sensor_dataset": SensorSchema,
    "maintix_telemetry_dataset": TelemetrySchema,
    "maintix_maintenance_dataset": MaintenanceSchema,
    "maintix_production_dataset": ProductionSchema,
    "maintix_ai_label_dataset": AILabelSchema,
    "maintix_feedback_dataset": FeedbackSchema,
    "maintix_rl_dataset": RLTransitionSchema,
}
