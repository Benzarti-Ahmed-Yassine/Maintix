import React from 'react';
import {
  FileText,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useTechnicianProcedures } from '../../hooks/useTechnicianData.js';
import { QueryStateWrapper } from '../../components/QueryStateWrapper.js';

export const TechnicianProceduresPage: React.FC = () => {
  const proceduresQuery = useTechnicianProcedures();

  return (
    <QueryStateWrapper query={proceduresQuery}>
      {(procedures: any) => (
        <div className="p-6 space-y-6 max-w-[1600px] mx-auto text-slate-100">
          {/* En-tête */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-blue-400 mb-1">
                <span>ESPACE TECHNICIEN</span>
                <span>/</span>
                <span className="text-slate-100">PROCÉDURES OPÉRATIONNELLES STANDARD</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3 font-mono">
                <FileText className="text-blue-400" />
                Procédures SOP Validées & Manuels Constructeur
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Checklists de maintenance conformes ISO 10816-3, routines de lubrification et guides de remplacement</p>
            </div>
          </div>

          {/* Grille des procédures */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {procedures.map((proc: any) => (
              <div
                key={proc.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between hover:border-blue-500/50 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded uppercase">
                      {proc.category}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      ● VALIDÉ
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-white">{proc.title}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">Applicable : {proc.machineType}</p>

                  <div className="mt-3 p-3 bg-slate-950/60 rounded-lg text-xs text-slate-300 space-y-1.5">
                    {(proc.chunks || []).slice(0, 2).map((chunk: any, i: number) => (
                      <p key={i} className="line-clamp-2 italic">"{chunk.content}"</p>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-mono text-blue-400 flex items-center gap-1">
                    <ShieldCheck size={14} /> Procédure certifiée
                  </span>
                  <button
                    onClick={() => alert(`Ouverture de la procédure : ${proc.title}`)}
                    className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
                  >
                    Voir le guide <ArrowRight size={13} />
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
