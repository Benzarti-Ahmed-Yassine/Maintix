import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Upload,
  BookOpen,
  ArrowRight,
  X,
  Loader2,
  Plus,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useAdminRagDocuments, useUpdateRagStatus, useUploadRagDocument } from '../../hooks/useAdminData.js';
import { QueryStateWrapper } from '../../components/QueryStateWrapper.js';

const CATEGORIES = ['MANUAL', 'PROCEDURE', 'STANDARD', 'SAFETY', 'HISTORY'];
const MACHINE_TYPES = ['ALL', 'Rapier Weaving Loom', 'Air-Jet Loom', 'Spinning Frame', 'Compressor', 'Motor', 'Pump', 'Other'];

interface UploadForm {
  title: string;
  content: string;
  category: string;
  machineType: string;
}

const DEFAULT_FORM: UploadForm = {
  title: '',
  content: '',
  category: 'MANUAL',
  machineType: 'ALL',
};

function UploadModal({
  open,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (form: UploadForm) => void;
  isSubmitting: boolean;
}) {
  const [form, setForm] = useState<UploadForm>(DEFAULT_FORM);
  const set = (key: keyof UploadForm) => (val: string) =>
    setForm(f => ({ ...f, [key]: val }));

  React.useEffect(() => {
    if (open) setForm(DEFAULT_FORM);
  }, [open]);

  if (!open) return null;

  const charCount = form.content.length;
  const estimatedChunks = Math.max(1, Math.ceil(charCount / 500));
  const canSubmit = form.title.trim().length > 3 && form.content.trim().length > 20;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-2xl my-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Upload size={18} className="text-blue-400" />
            <h2 className="text-base font-bold text-white">Upload Technical Document</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 transition">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Info */}
          <div className="flex items-start gap-2.5 p-3 bg-blue-950/30 border border-blue-800/30 rounded-lg text-xs text-blue-300">
            <Info size={14} className="flex-shrink-0 mt-0.5" />
            <p>
              Documents are processed by the AI engine and split into semantic chunks. Once validated, they are used by the RAG Copilot to answer technical questions.
            </p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Document Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={e => set('title')(e.target.value)}
              placeholder="e.g. Picanol OptiMax-i 1250 Maintenance Manual"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none transition"
            />
          </div>

          {/* Category + Machine Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Category</label>
              <select
                value={form.category}
                onChange={e => set('category')(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none transition"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Applicable Machine Type</label>
              <select
                value={form.machineType}
                onChange={e => set('machineType')(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none transition"
              >
                {MACHINE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Document Content <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={10}
              value={form.content}
              onChange={e => set('content')(e.target.value)}
              placeholder={`Paste the full technical content here.\n\nExample:\nSection 1 — Bearing Maintenance\nReplace the main shaft bearing (SKF 6208-2RS) every 2,000 operating hours.\nApply 15g of SKF LGMT 3 high-temperature grease.\nVerify radial runout does not exceed 0.02 mm after installation.\n\nSection 2 — Vibration Thresholds\nISO 10816-3 Zone A: < 1.4 mm/s RMS (new machine)\nISO 10816-3 Zone B: 1.4 – 2.8 mm/s (normal operation)\nISO 10816-3 Zone C: 2.8 – 4.5 mm/s (warning)\nISO 10816-3 Zone D: > 4.5 mm/s (critical — shutdown required)`}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-mono text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none transition resize-none"
            />
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[10px] text-slate-500">{charCount} characters</span>
              <span className="text-[10px] text-blue-400">≈ {estimatedChunks} semantic chunks will be generated</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 flex items-center justify-between">
          <p className="text-[10px] text-slate-500">Document will be saved with <span className="text-amber-400">PENDING</span> status — validate it after review.</p>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition">
              Cancel
            </button>
            <button
              onClick={() => onSubmit(form)}
              disabled={isSubmitting || !canSubmit}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-blue-600/20"
            >
              {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
              Upload & Index
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const AdminRagPage: React.FC = () => {
  const ragQuery = useAdminRagDocuments();
  const updateStatusMutation = useUpdateRagStatus();
  const uploadMutation = useUploadRagDocument();

  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleStatusChange = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status }, {
      onSuccess: () => {
        if (selectedDoc && selectedDoc.id === id) {
          setSelectedDoc((prev: any) => ({ ...prev, status }));
        }
      }
    });
  };

  const handleUpload = (form: UploadForm) => {
    uploadMutation.mutate(form, {
      onSuccess: (doc: any) => {
        setShowUpload(false);
        setSuccessMsg(`"${doc.title}" uploaded and indexed successfully.`);
        setTimeout(() => setSuccessMsg(null), 5000);
      },
    });
  };

  return (
    <QueryStateWrapper query={ragQuery}>
      {(docs) => (
        <div className="p-6 space-y-6 max-w-[1600px] mx-auto text-slate-100">
          {/* Upload Modal */}
          <UploadModal
            open={showUpload}
            onClose={() => setShowUpload(false)}
            onSubmit={handleUpload}
            isSubmitting={uploadMutation.isPending}
          />

          {/* Success toast */}
          {successMsg && (
            <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-emerald-900 border border-emerald-700 text-emerald-300 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold">
              <CheckCircle2 size={15} /> {successMsg}
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-1">
                <span>ADMINISTRATION</span><span>/</span>
                <span className="text-slate-200">KNOWLEDGE BASE</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
                <BookOpen className="text-blue-400" />
                RAG Knowledge Base
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {docs.length} documents indexed · Upload OEM manuals, ISO standards, maintenance procedures — used by the AI Copilot
              </p>
            </div>

            <button
              onClick={() => setShowUpload(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-blue-600/20"
            >
              <Plus size={15} /> Upload Document
            </button>
          </div>

          {/* Documents Grid & Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
                <h3 className="text-sm font-bold text-white">Indexed Documents</h3>

                {docs.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs">
                    No documents indexed yet. Upload OEM manuals, maintenance procedures, or technical standards.
                  </div>
                ) : (
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
                          <div className="space-y-1.5 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-mono text-slate-400 uppercase bg-slate-800 px-2 py-0.5 rounded">
                                {doc.category}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                isVal
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                  : isPend
                                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                  : 'bg-red-500/20 text-red-400 border-red-500/30'
                              }`}>
                                ● {doc.status}
                              </span>
                            </div>
                            <h4 className="font-bold text-white text-sm truncate">{doc.title}</h4>
                            <p className="text-[10px] text-slate-500">
                              {doc.chunks?.length || 0} chunks · Uploaded {new Date(doc.createdAt || Date.now()).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-blue-400 font-bold flex-shrink-0 ml-3">
                            Review <ArrowRight size={13} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Inspector Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-400" />
                Validation Gate
              </h3>

              {selectedDoc ? (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-950 rounded-lg space-y-2 text-xs">
                    <h4 className="font-bold text-white">{selectedDoc.title}</h4>
                    <p className="text-slate-400 font-mono">Category: {selectedDoc.category}</p>
                    <p className="text-slate-400 font-mono">Version: {selectedDoc.version || '1.0'}</p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-slate-400">Status:</span>
                      <strong className={
                        selectedDoc.status === 'VALIDATED' ? 'text-emerald-400' :
                        selectedDoc.status === 'PENDING' ? 'text-amber-400' : 'text-red-400'
                      }>{selectedDoc.status}</strong>
                    </div>
                  </div>

                  {/* Approval actions */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Approval Actions:</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusChange(selectedDoc.id, 'VALIDATED')}
                        disabled={updateStatusMutation.isPending || selectedDoc.status === 'VALIDATED'}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition"
                      >
                        <CheckCircle2 size={13} /> Validate
                      </button>
                      <button
                        onClick={() => handleStatusChange(selectedDoc.id, 'REJECTED')}
                        disabled={updateStatusMutation.isPending || selectedDoc.status === 'REJECTED'}
                        className="flex-1 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition"
                      >
                        <XCircle size={13} /> Reject
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Only <span className="text-emerald-400">VALIDATED</span> documents are used by the AI Copilot for answers.
                    </p>
                  </div>

                  {/* Content preview */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Content Preview:</span>
                    <div className="max-h-40 overflow-y-auto p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 whitespace-pre-wrap">
                      {selectedDoc.content?.slice(0, 800) || 'No content preview available.'}
                      {selectedDoc.content?.length > 800 && <span className="text-slate-500">…</span>}
                    </div>
                  </div>

                  {/* Chunks preview */}
                  {selectedDoc.chunks?.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Semantic Chunks ({selectedDoc.chunks.length}):
                      </span>
                      <div className="max-h-60 overflow-y-auto space-y-2 text-xs">
                        {selectedDoc.chunks.map((chunk: any, i: number) => (
                          <div key={i} className="p-2.5 bg-slate-950/80 rounded border border-slate-800 text-slate-300">
                            <span className="text-[10px] font-mono text-blue-400 font-bold block mb-1">
                              CHUNK #{(chunk.chunkIndex ?? i) + 1}
                            </span>
                            {chunk.content}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500 text-xs italic">
                  Select a document from the list to review its content and manage validation.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </QueryStateWrapper>
  );
};
