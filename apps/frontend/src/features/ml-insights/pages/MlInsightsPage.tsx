import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import {
  fetchRulPrediction,
  fetchAnomalyPrediction,
  fetchFailurePrediction,
  fetchRiskPrediction,
  fetchPolicyRecommendation,
  MlRulPrediction,
  MlAnomalyPrediction,
  MlFailurePrediction,
  MlRiskPrediction,
  MlPolicyRecommendation,
} from '@/services/mlService';

const DEFAULT_MACHINE = 'TX-1250-A';

export function MlInsightsPage() {
  const [machineId, setMachineId] = useState(DEFAULT_MACHINE);

  const rulQuery = useQuery({
    queryKey: ['ml-rul', machineId],
    queryFn: () => fetchRulPrediction(machineId),
    enabled: !!machineId,
  });

  const anomalyQuery = useQuery({
    queryKey: ['ml-anomaly', machineId],
    queryFn: () => fetchAnomalyPrediction(machineId),
    enabled: !!machineId,
  });

  const failureQuery = useQuery({
    queryKey: ['ml-failure', machineId],
    queryFn: () => fetchFailurePrediction(machineId),
    enabled: !!machineId,
  });

  const riskQuery = useQuery({
    queryKey: ['ml-risk', machineId],
    queryFn: () => fetchRiskPrediction(machineId),
    enabled: !!machineId,
  });

  const policyQuery = useQuery({
    queryKey: ['ml-policy', machineId],
    queryFn: () => fetchPolicyRecommendation(machineId),
    enabled: !!machineId,
  });

  const rul = rulQuery.data as MlRulPrediction | undefined;
  const anomaly = anomalyQuery.data as MlAnomalyPrediction | undefined;
  const failure = failureQuery.data as MlFailurePrediction | undefined;
  const risk = riskQuery.data as MlRiskPrediction | undefined;
  const policy = policyQuery.data as MlPolicyRecommendation | undefined;

  const isLoading = rulQuery.isLoading || anomalyQuery.isLoading || failureQuery.isLoading || riskQuery.isLoading || policyQuery.isLoading;

  return (
    <div className="space-y-6">
      <Panel title="ML Insights" subtitle="Industrial AI predictions for RUL, anomaly detection, failure classification, risk and RL policy">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-300">Machine</label>
          <input
            value={machineId}
            onChange={(e) => setMachineId(e.target.value)}
            className="w-56 rounded-2xl border border-white/10 bg-maintix-surface px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-maintix-primary focus:outline-none focus:ring-2 focus:ring-maintix-primary/20"
          />
          <Button onClick={() => { rulQuery.refetch(); anomalyQuery.refetch(); failureQuery.refetch(); riskQuery.refetch(); policyQuery.refetch(); }}>
            Refresh
          </Button>
        </div>

        {isLoading ? (
          <div className="rounded-3xl border border-white/10 bg-maintix-surface p-5 text-slate-400">Loading ML predictions…</div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-2">
            {/* RUL Prediction */}
            {rul && (
              <div className="space-y-4 rounded-3xl bg-maintix-surfaceLight p-6">
                <h3 className="text-lg font-semibold text-white">Remaining Useful Life</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Health Index</p>
                    <p className="mt-1 text-2xl font-bold text-maintix-primary">{rul.health_index}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">RUL (days)</p>
                    <p className="mt-1 text-2xl font-bold text-white">{rul.rul_days}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Failure Probability</p>
                    <p className="mt-1 text-2xl font-bold text-white">{(rul.failure_probability * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Confidence</p>
                    <p className="mt-1 text-2xl font-bold text-white">{(rul.confidence * 100).toFixed(1)}%</p>
                  </div>
                </div>
                <p className="text-sm leading-6 text-slate-300">{rul.recommendation}</p>
                <div className="flex flex-wrap gap-2">
                  {rul.dominant_signals.map((signal) => (
                    <span key={signal} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">{signal}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Anomaly Detection */}
            {anomaly && (
              <div className="space-y-4 rounded-3xl bg-maintix-surfaceLight p-6">
                <h3 className="text-lg font-semibold text-white">Anomaly Detection</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Anomaly Score</p>
                    <p className="mt-1 text-2xl font-bold text-white">{anomaly.anomaly_score.toFixed(3)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Severity</p>
                    <p className={`mt-1 text-2xl font-bold ${anomaly.severity === 'CRITICAL' ? 'text-red-400' : anomaly.severity === 'HIGH' ? 'text-orange-400' : anomaly.severity === 'MEDIUM' ? 'text-yellow-400' : 'text-green-400'}`}>
                      {anomaly.severity}
                    </p>
                  </div>
                </div>
                <p className="text-sm leading-6 text-slate-300">{anomaly.anomaly_type}</p>
                <p className="text-sm leading-6 text-slate-400">{anomaly.root_cause}</p>
              </div>
            )}

            {/* Failure Classification */}
            {failure && (
              <div className="space-y-4 rounded-3xl bg-maintix-surfaceLight p-6">
                <h3 className="text-lg font-semibold text-white">Failure Classification</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Failure Type</p>
                    <p className="mt-1 text-2xl font-bold text-white">{failure.failure_type}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Probability</p>
                    <p className="mt-1 text-2xl font-bold text-white">{(failure.failure_probability * 100).toFixed(1)}%</p>
                  </div>
                </div>
                <p className="text-sm leading-6 text-slate-300">Affected subsystem: {failure.affected_subsystem}</p>
              </div>
            )}

            {/* Risk Assessment */}
            {risk && (
              <div className="space-y-4 rounded-3xl bg-maintix-surfaceLight p-6">
                <h3 className="text-lg font-semibold text-white">Risk Assessment</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Risk Score</p>
                    <p className="mt-1 text-2xl font-bold text-white">{risk.risk_score.toFixed(3)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Risk Level</p>
                    <p className={`mt-1 text-2xl font-bold ${risk.risk_level === 'CRITICAL' ? 'text-red-400' : risk.risk_level === 'HIGH' ? 'text-orange-400' : risk.risk_level === 'MEDIUM' ? 'text-yellow-400' : 'text-green-400'}`}>
                      {risk.risk_level}
                    </p>
                  </div>
                </div>
                <p className="text-sm leading-6 text-slate-300">{risk.risk_reason}</p>
                <p className="text-sm leading-6 text-slate-400">Financial exposure: ${risk.financial_exposure_usd.toLocaleString()}</p>
              </div>
            )}

            {/* RL Policy Recommendation */}
            {policy && (
              <div className="space-y-4 rounded-3xl bg-maintix-surfaceLight p-6">
                <h3 className="text-lg font-semibold text-white">RL Policy Recommendation</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Recommended Action</p>
                    <p className="mt-1 text-2xl font-bold text-maintix-primary">{policy.recommended_action}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Expected Cost</p>
                    <p className="mt-1 text-2xl font-bold text-white">${policy.expected_cost_usd.toLocaleString()}</p>
                  </div>
                </div>
                <p className="text-sm leading-6 text-slate-300">{policy.rationale}</p>
                <p className="text-xs text-slate-500">{policy.safety_advisory}</p>
              </div>
            )}
          </div>
        )}
      </Panel>
    </div>
  );
}