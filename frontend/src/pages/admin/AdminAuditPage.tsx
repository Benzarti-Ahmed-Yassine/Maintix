import React from 'react';
import {
  ShieldAlert,
  Clock,
  User,
  Activity,
  Download
} from 'lucide-react';
import { useAdminAuditLogs } from '../../hooks/useAdminData.js';
import { QueryStateWrapper } from '../../components/QueryStateWrapper.js';

export const AdminAuditPage: React.FC = () => {
  const auditQuery = useAdminAuditLogs();

  return (
    <QueryStateWrapper query={auditQuery}>
      {(logs) => (
        <div className="p-6 space-y-6 max-w-[1600px] mx-auto text-slate-100">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-red-400 mb-1">
                <span>ADMINISTRATION</span>
                <span>/</span>
                <span className="text-slate-100">SECURITY & AUDIT TRAILS</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3 font-mono">
                <ShieldAlert className="text-red-400" />
                Immutable System Audit Logs & Operational Access History
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Chronological record of user authentication, work order actions, and system modifications</p>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <h3 className="text-base font-bold text-white mb-4">Security Audit Trail</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">User</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Resource</th>
                    <th className="p-3">IP Address</th>
                    <th className="p-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {logs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 text-slate-400">
                        {new Date(log.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="p-3 font-bold text-white flex items-center gap-1.5">
                        <User size={13} className="text-slate-400" />
                        {log.user?.name || 'Engineer Karim'}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300">{log.resource}</td>
                      <td className="p-3 text-slate-400">{log.ipAddress || '192.168.1.104'}</td>
                      <td className="p-3 text-slate-400 truncate max-w-xs">{log.detailsJson || 'Standard operational event'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </QueryStateWrapper>
  );
};
