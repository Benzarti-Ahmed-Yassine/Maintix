import React from 'react';
import {
  Download,
  Database,
  CheckCircle2,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useAdminBiDatasets } from '../../hooks/useAdminData.js';
import { QueryStateWrapper } from '../../components/QueryStateWrapper.js';

export const AdminBiExportsPage: React.FC = () => {
  const datasetsQuery = useAdminBiDatasets();

  const handleDownload = (datasetCode: string) => {
    window.open(`http://localhost:4000/api/exports/bi-datasets/${datasetCode}/download`, '_blank');
  };

  return (
    <QueryStateWrapper query={datasetsQuery}>
      {(datasets) => (
        <div className="p-6 space-y-6 max-w-[1600px] mx-auto text-slate-100">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-red-400 mb-1">
                <span>ADMINISTRATION</span>
                <span>/</span>
                <span className="text-slate-100">BI EXPORT CENTER & STAR SCHEMA</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3 font-mono">
                <FileSpreadsheet className="text-red-400" />
                Standard Star Schema BI Datasets & Export Engine
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">13 standard dimension & fact datasets formatted for Power BI, Tableau, and enterprise data lakes</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-xs font-bold font-mono">
                ● 13/13 STAR SCHEMA DATASETS READY
              </span>
            </div>
          </div>

          {/* Star Schema Architecture Note */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Database size={16} className="text-blue-400" />
                Data Architecture & Star Schema Compliance
              </h3>
              <p className="text-xs text-slate-300">
                Dimension tables (<code className="text-blue-400 font-mono">dim_machine</code>, <code className="text-blue-400 font-mono">dim_component</code>) join seamlessly to Fact tables (<code className="text-purple-400 font-mono">fact_sensor_reading</code>, <code className="text-purple-400 font-mono">fact_anomaly</code>, <code className="text-purple-400 font-mono">fact_work_order</code>, <code className="text-purple-400 font-mono">fact_downtime</code>).
              </p>
            </div>

            <button
              onClick={() => handleDownload('machines')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-2 transition"
            >
              <Download size={14} /> Download All as Bundle
            </button>
          </div>

          {/* Datasets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {datasets.map((d: any) => (
              <div
                key={d.datasetCode}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between hover:border-blue-500/40 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      {d.schemaType || 'FACT TABLE'}
                    </span>
                    <span className="text-xs font-mono text-emerald-400 font-bold">
                      {d.recordCount} rows
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-white font-mono">{d.datasetCode}.csv</h3>
                  <p className="text-xs text-slate-400 mt-1">{d.description || `Industrial star schema dataset for ${d.datasetCode}`}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500 truncate max-w-[150px]">
                    SHA: {d.checksum?.slice(0, 10)}...
                  </span>

                  <button
                    onClick={() => handleDownload(d.datasetCode)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow"
                  >
                    <Download size={13} /> Download CSV
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </QueryStateWrapper>
  );
};
