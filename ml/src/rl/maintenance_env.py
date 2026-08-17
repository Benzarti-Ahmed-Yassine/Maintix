"""
MAINTIX Industrial Maintenance Reinforcement Learning Environment
=================================================================
Gymnasium-compatible simulation environment modeling:
- Asset physical degradation dynamics
- Multi-component wear & random shock failures
- Operational costs: Inspections, Preventive repairs, Corrective replacements, Unplanned downtime
- Safe action constraints (Advisory only)

Action Space:
0: WAIT (Standard continuous operation)
1: INSPECT (Detailed diagnostic sensor check)
2: SCHEDULE_PREVENTIVE (Scheduled overhaul during planned window)
3: REPLACE_COMPONENT (Immediate component replacement)
4: STOP_MACHINE (Emergency controlled throttle/stop to prevent secondary damage)
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional, Tuple

import numpy as np

logger = logging.getLogger("maintix.rl_env")


class MaintixMaintenanceEnv:
    """Industrial plant machine maintenance simulation environment."""

    ACTION_NAMES = [
        "WAIT",
        "INSPECT",
        "SCHEDULE_PREVENTIVE",
        "REPLACE_COMPONENT",
        "STOP_MACHINE",
    ]

    def __init__(
        self,
        max_steps: int = 365,
        nominal_rul_days: float = 60.0,
        avoided_failure_reward: float = 24650.0,
        inspection_cost: float = 200.0,
        preventive_cost: float = 1500.0,
        replacement_cost: float = 3200.0,
        downtime_cost_per_step: float = 1850.0,
        catastrophic_failure_penalty: float = 25000.0,
        seed: int = 42,
    ):
        self.max_steps = max_steps
        self.nominal_rul = nominal_rul_days
        self.avoided_failure_reward = avoided_failure_reward
        self.inspection_cost = inspection_cost
        self.preventive_cost = preventive_cost
        self.replacement_cost = replacement_cost
        self.downtime_cost = downtime_cost_per_step
        self.catastrophic_penalty = catastrophic_failure_penalty

        self.rng = np.random.default_rng(seed)
        self.reset()

    def reset(self) -> np.ndarray:
        """Resets machine to healthy baseline state."""
        self.current_step = 0
        self.health_index = 100.0
        self.rul_days = self.nominal_rul
        self.anomaly_score = 0.02
        self.failure_prob = 0.01
        self.criticality = 0.85
        self.production_load = 0.90
        self.spare_available = 1.0
        self.is_failed = False
        self.cumulative_cost = 0.0
        return self._get_state()

    def _get_state(self) -> np.ndarray:
        """
        Returns observation vector:
        [health_index, rul_days, anomaly_score, failure_prob, criticality, production_load, spare_available]
        """
        return np.array([
            self.health_index / 100.0,
            min(1.0, self.rul_days / self.nominal_rul),
            self.anomaly_score,
            self.failure_prob,
            self.criticality,
            self.production_load,
            self.spare_available,
        ], dtype=np.float32)

    def step(self, action: int) -> Tuple[np.ndarray, float, bool, Dict[str, Any]]:
        """
        Executes one day step with chosen maintenance action.
        """
        self.current_step += 1
        reward = 0.0
        info = {"action_name": self.ACTION_NAMES[action]}

        # Natural degradation rate per step
        deg_step = float(self.rng.normal(0.4, 0.1))
        # Random shock event probability
        if self.rng.uniform() < 0.02:
            deg_step += float(self.rng.uniform(5.0, 15.0))

        # 1. Action Effects
        if action == 0:  # WAIT
            self.health_index -= deg_step
            self.rul_days = max(0.0, self.rul_days - 1.0)
            reward += 15.0  # nominal daily production value

        elif action == 1:  # INSPECT
            self.health_index -= deg_step
            reward -= self.inspection_cost
            self.cumulative_cost += self.inspection_cost
            # Inspection sharpens anomaly score visibility
            info["inspection_verified"] = True

        elif action == 2:  # SCHEDULE_PREVENTIVE
            if self.health_index < 65.0:
                reward += (self.avoided_failure_reward * 0.4) - self.preventive_cost
                self.health_index = min(100.0, self.health_index + 35.0)
                self.rul_days = min(self.nominal_rul, self.rul_days + 25.0)
            else:
                # Unnecessary early preventive penalty
                reward -= (self.preventive_cost + 500.0)
            self.cumulative_cost += self.preventive_cost

        elif action == 3:  # REPLACE_COMPONENT
            if self.health_index < 35.0:
                reward += (self.avoided_failure_reward * 0.8) - self.replacement_cost
            else:
                # Premature replacement cost
                reward -= (self.replacement_cost + 1000.0)
            self.health_index = 98.0
            self.rul_days = self.nominal_rul
            self.cumulative_cost += self.replacement_cost

        elif action == 4:  # STOP_MACHINE
            reward -= (self.downtime_cost * 0.5)
            self.cumulative_cost += (self.downtime_cost * 0.5)

        # 2. Update dynamic probabilities & check catastrophic failure
        self.health_index = float(np.clip(self.health_index, 0.0, 100.0))
        self.anomaly_score = float(np.clip((100.0 - self.health_index) / 100.0 + self.rng.normal(0, 0.02), 0.0, 1.0))
        self.failure_prob = float(np.clip((100.0 - self.health_index) / 80.0, 0.0, 1.0))

        if self.health_index <= 5.0 and not self.is_failed:
            # Unplanned catastrophic breakdown
            self.is_failed = True
            reward -= self.catastrophic_penalty
            self.cumulative_cost += self.catastrophic_penalty
            info["breakdown"] = True

        done = self.current_step >= self.max_steps or (self.is_failed and action != 3)
        return self._get_state(), float(reward), done, info
