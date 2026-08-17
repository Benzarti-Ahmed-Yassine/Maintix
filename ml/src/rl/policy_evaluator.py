"""
MAINTIX RL Policy Benchmark Evaluator
=====================================
Benchmarks the learned Safe RL Maintenance Policy against standard operational baselines:
1. No-Maintenance Policy (Run to catastrophic failure)
2. Reactive-Only Policy (Replace only after breakdown occurs)
3. Fixed-Interval Preventive Policy (Overhaul every 45 days regardless of condition)
4. MAINTIX Learned Safe RL Policy (Predictive Condition-Based Advisory)

Measures:
- Total lifecycle cost ($)
- Unplanned downtime days
- Catastrophic breakdown count
- Average operational reward
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Dict, Any, List

import numpy as np
import pandas as pd

from ml.src.rl.maintenance_env import MaintixMaintenanceEnv
from ml.src.rl.offline_rl import SafeOfflineRLPolicy

logger = logging.getLogger("maintix.rl_evaluator")

REPO_ROOT = Path(__file__).resolve().parents[3]
REPORTS_DIR = REPO_ROOT / "ml" / "reports"


def run_policy_benchmark(episodes: int = 50) -> pd.DataFrame:
    """Executes multi-episode Monte Carlo simulation comparing maintenance policies."""
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    env = MaintixMaintenanceEnv(max_steps=180)
    policy = SafeOfflineRLPolicy()

    # Try fitting policy if transitions available
    rl_data_path = REPO_ROOT / "ml" / "data" / "gold" / "rl" / "maintix_rl_dataset.parquet"
    if rl_data_path.exists():
        df_transitions = pd.read_parquet(rl_data_path)
        policy.fit_from_transitions(df_transitions)
        policy.save()  # Persist trained RL policy artifact
    else:
        # Save rule-based fallback so test_inference.py can always load something
        policy.save()

    policies = {
        "No_Maintenance": lambda s, step: 0,  # always WAIT
        "Reactive_Only": lambda s, step: 3 if s[0] <= 0.05 else 0,
        "Fixed_Interval_45d": lambda s, step: 2 if step % 45 == 0 else 0,
        "MAINTIX_Safe_RL_Policy": lambda s, step: policy.select_action(s),
    }

    results = []

    for pol_name, action_fn in policies.items():
        ep_rewards = []
        ep_costs = []
        ep_breakdowns = []
        ep_downtime = []

        for ep in range(episodes):
            state = env.reset()
            done = False
            total_reward = 0.0
            breakdowns = 0
            downtime_days = 0

            while not done:
                action = action_fn(state, env.current_step)
                state, reward, done, info = env.step(action)
                total_reward += reward
                if info.get("breakdown"):
                    breakdowns += 1
                    downtime_days += 3  # 3 days emergency line repair
                if action == 4:
                    downtime_days += 1

            ep_rewards.append(total_reward)
            ep_costs.append(env.cumulative_cost)
            ep_breakdowns.append(breakdowns)
            ep_downtime.append(downtime_days)

        results.append({
            "Policy": pol_name,
            "Avg_Total_Cost_USD": round(float(np.mean(ep_costs)), 2),
            "Avg_Reward": round(float(np.mean(ep_rewards)), 2),
            "Avg_Breakdowns": round(float(np.mean(ep_breakdowns)), 2),
            "Avg_Downtime_Days": round(float(np.mean(ep_downtime)), 2),
            "Cost_Reduction_vs_Reactive_Pct": 0.0,
        })

    df_res = pd.DataFrame(results)
    reactive_cost = df_res.loc[df_res["Policy"] == "Reactive_Only", "Avg_Total_Cost_USD"].values[0]
    for idx, row in df_res.iterrows():
        reduction = ((reactive_cost - row["Avg_Total_Cost_USD"]) / max(reactive_cost, 1)) * 100.0
        df_res.at[idx, "Cost_Reduction_vs_Reactive_Pct"] = round(reduction, 1)

    csv_path = REPORTS_DIR / "rl_policy_evaluation.csv"
    df_res.to_csv(csv_path, index=False)
    logger.info(f"[OK] RL Policy benchmark exported -> {csv_path}")
    logger.info("\n=== RL Maintenance Policy Evaluation ===\n" + df_res.to_string(index=False))
    return df_res


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
    run_policy_benchmark()
