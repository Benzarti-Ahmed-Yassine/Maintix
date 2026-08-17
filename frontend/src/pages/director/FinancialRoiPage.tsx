import React from 'react';
import { DollarSign, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { useDirectorFinancialImpact } from '../../hooks/useDirectorData.js';
import { QueryStateWrapper } from '../../components/QueryStateWrapper.js';

export const FinancialRoiPage: React.FC = () => {
  const { data: finData, isLoading, isError, error, refetch } = useDirectorFinancialImpact();

  const totalSavings = finData?.totalMaintenanceCost || 0;
  const roiPercentage = finData?.roi || 0;
  const totalDowntimeCost = finData?.totalDowntimeCost || 0;

  const roiData = [
    { category: 'Downtime Impact Prevented', savings: totalDowntimeCost },
    { category: 'Labor Cost Allocated', savings: finData?.costByCategory?.labor || Math.round(totalSavings * 0.6) },
    { category: 'Spare Parts Investment', savings: finData?.costByCategory?.parts || Math.round(totalSavings * 0.4) },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <DollarSign size={20} className="text-amber-400" /> Executive Financial ROI & Cost Analytics
          </h1>
          <p className="text-xs text-slate-400">Financial impact of AI predictive maintenance vs traditional reactive repairs</p>
        </div>

        <button
          onClick={() => refetch()}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
          title="Refresh Financial Analytics"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      <QueryStateWrapper
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={!isLoading && !isError && !finData}
        emptyTitle="No Financial Data Available"
        emptyMessage="Financial records could not be retrieved from the backend."
        onRetry={() => refetch()}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="industrial-card p-5 text-center border-amber-900/60">
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">Total Maintenance Expenditure</p>
            <p className="text-4xl font-black text-white font-mono">${totalSavings.toLocaleString()}</p>
            <span className="text-xs text-emerald-400 font-bold">● Derived from completed WorkOrders</span>
          </div>

          <div className="industrial-card p-5 text-center">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Avoidance ROI Ratio</p>
            <p className="text-4xl font-black text-amber-400 font-mono">{roiPercentage}%</p>
            <span className="text-xs text-emerald-400 font-bold">Avoided Cost vs Maintenance Spend</span>
          </div>

          <div className="industrial-card p-5 text-center">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Calculated Downtime Cost</p>
            <p className="text-4xl font-black text-red-400 font-mono">${totalDowntimeCost.toLocaleString()}</p>
            <span className="text-xs text-slate-400">Aggregated from Downtime Events</span>
          </div>
        </div>

        <div className="industrial-card p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 tracking-wider uppercase">Financial Expenditure & Outage Avoidance Breakdown</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roiData} layout="vertical">
                <XAxis type="number" stroke="#475569" fontSize={10} />
                <YAxis dataKey="category" type="category" stroke="#475569" fontSize={11} width={220} />
                <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155', fontSize: '11px' }} />
                <Bar dataKey="savings" fill="#d97706" name="Amount ($)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </QueryStateWrapper>
    </div>
  );
};
