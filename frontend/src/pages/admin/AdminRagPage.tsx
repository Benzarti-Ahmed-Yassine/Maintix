import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Search,
  Upload,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { useAdminRagDocuments, useUpdateRagStatus } from '../../hooks/useAdminData.js';
import { QueryStateWrapper } from '../../components/QueryStateWrapper.js';

export const AdminRagPage: React.FC = () => {
  const ragQuery = useAdminRagDocuments();
  const updateStatusMutation = useUpdateRagStatus();
  const [selectedDoc, setSelectedDoc] = useState<any>(null);

  const handleStatusChange = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status }, {
      onSuccess: () => {
        if (selectedDoc && selectedDoc.id === id) {
          setSelectedDoc((prev: any) => ({ ...prev, status }));
        }
      }
    });
  };

  return (
    <QueryStateWrapper query={ragQuery}>
      {(docs) => (
        <div className="p-6 space-y-6 max-w-[1600px] mx-auto text-slate-100">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-red-400 mb-1">
                <span>ADMINISTRATION</span>
                <span>/</span>
                <span className="text-slate-100">RAG KNOWLEDGE APPROVAL & AUDIT</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3 font-mono">
                <BookOpen className="text-red-400" />
                Validated Knowledge Base & RAG Approval Pipeline
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Strict quality gatekeeper for industrial manuals, OEM guides, and ISO standards</p>
            </div>

            <button
              onClick={() => alert('OEM manual upload triggered!')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition"
            >
              <Upload size={14} /> Upload OEM Documentation
            </button>
          </div>

          {/* Documents Grid & Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
                <h3 className="text-base font-bold text-white mb-2">Registered Knowledge Documents</h3>

                <div className="space-y-3">
                  {docs.map((doc: any) => {
                    const isVal = doc.status === 'VALIDATED';
                    const isPend = doc.status === 'PENDING';

                    return (
                      <div
                        key={doc.id}
                        onClick={() => setSelectedDoc(doc)}
                        className={`p-4 bg-slate-950/60 border rounded-xl cursor-pointer transition flex items-start justify-between ${
                          selectedDoc?.id === doc.id ? 'border-blue-500' : 'border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-slate-400 uppercase bg-slate-800 px-2 py-0.5 rounded">
                              {doc.category}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isVal
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : isPend
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
                              }`}
                            >
                              ● {doc.status}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">{doc.machineType}</span>
                          </div>

                          <h4 className="font-bold text-white text-sm">{doc.title}</h4>
                          <p className="text-xs text-slate-400">{doc.chunks?.length || 0} extracted semantic chunks</p>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-blue-400 font-bold">
                          Inspect Chunks <ArrowRight size={13} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Inspector Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-400" />
                Document Approval Gate
              </h3>

              {selectedDoc ? (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-950 rounded-lg space-y-2 text-xs">
                    <h4 className="font-bold text-white">{selectedDoc.title}</h4>
                    <p className="text-slate-400 font-mono">Category: {selectedDoc.category}</p>
                    <p className="text-slate-400 font-mono">Machine: {selectedDoc.machineType}</p>
                    <div className="flex items-center gap-2 pt-2">
                      <span className="text-slate-400">Current Status:</span>
                      <strong className="text-emerald-400">{selectedDoc.status}</strong>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-mono text-slate-400 uppercase">Approval Actions:</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusChange(selectedDoc.id, 'VALIDATED')}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition"
                      >
                        <CheckCircle2 size={14} /> Validate
                      </button>
                      <button
                        onClick={() => handleStatusChange(selectedDoc.id, 'REJECTED')}
                        className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition"
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="text-xs font-mono text-slate-400 uppercase">Semantic Chunks Preview:</span>
                    <div className="max-h-60 overflow-y-auto space-y-2 text-xs">
                      {(selectedDoc.chunks || []).map((chunk: any, i: number) => (
                        <div key={i} className="p-2.5 bg-slate-950/80 rounded border border-slate-800 text-slate-300">
                          <span className="text-[10px] font-mono text-blue-400 font-bold block mb-1">CHUNK #{chunk.chunkIndex + 1}</span>
                          {chunk.content}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-slate-400 text-xs italic">
                  Select a document from the left to review extracted chunks and grant RAG validation approval.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </QueryStateWrapper>
  );
};
