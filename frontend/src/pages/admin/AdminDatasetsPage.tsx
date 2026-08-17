import React from 'react';
import {
  Database,
  Layers,
  CheckCircle2,
  Download,
  Filter,
  ArrowRight
} from 'lucide-react';
import { useAdminBiDatasets } from '../../hooks/useAdminData.js';
import { QueryStateWrapper } from '../../components/QueryStateWrapper.js';

export const AdminDatasetsPage: React.FC = () => {
  const datasetsQuery = useAdminBiDatasets();

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
                <span className="text-slate-100">DATA LAKEHOUSE & LAKE LAYERS</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3 font-mono">
                <Database className="text-red-400" />
                Medallion Data Lakehouse (Bronze • Silver • Gold)
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Automated pipeline processing from raw telemetry to validated dimensional star schema</p>
            </div>
          </div>

          {/* Medallion Architecture Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 bg-amber-950/60 text-amber-400 border border-amber-800/40 rounded-lg text-xs font-bold font-mono">
                  BRONZE LAYER (RAW)
                </span>
                <span className="text-xs font-mono text-slate-400">100% Ingested</span>
              </div>
              <p className="text-xs text-slate-300">
                Raw unmodified IoT telemetry packets, MQTT payloads, and raw SCADA register dumps straight from factory gateway.
              </p>
              <div className="pt-2 text-xs font-mono text-slate-400">
                Storage: SQLite / Parquet Lake (MinIO)
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold font-mono">
                  SILVER LAYER (CLEANSED)
                </span>
                <span className="text-xs font-mono text-cyan-400">Validated 99.4%</span>
              </div>
              <p className="text-xs text-slate-300">
                Validated timestamps, deduplicated readings, physical range verification, and standardized schema mapping.
              </p>
              <div className="pt-2 text-xs font-mono text-slate-400">
                Features: Interpolated 1Hz Sensor Readings
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 bg-yellow-950/60 text-yellow-400 border border-yellow-800/40 rounded-lg text-xs font-bold font-mono">
                  GOLD LAYER (STAR SCHEMA)
                </span>
                <span className="text-xs font-mono text-emerald-400">BI Analytics Ready</span>
              </div>
              <p className="text-xs text-slate-300">
                Standard dimension and fact tables (<code className="text-yellow-400">dim_machine</code>, <code className="text-yellow-400">fact_sensor_reading</code>, <code className="text-yellow-400">fact_anomaly</code>, <code className="text-yellow-400">fact_oee</code>) optimized for analytical queries.
              </p>
              <div className="pt-2 text-xs font-mono text-slate-400">
                Export: 13 CSV / Parquet Datasets
              </div>
            </div>
          </div>
        </div>
      )}
    </QueryStateWrapper>
  );
};
