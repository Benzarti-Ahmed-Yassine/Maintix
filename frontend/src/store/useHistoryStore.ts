import { create } from 'zustand';
import { HistoryAction, RoleType, ActionCategory } from '../types/index.js';

interface HistoryState {
  actions: HistoryAction[];
  addAction: (action: Omit<HistoryAction, 'id' | 'timestamp'> & { timestamp?: string }) => void;
  clearHistory: (role?: RoleType) => void;
  getActionsByRole: (role?: RoleType) => HistoryAction[];
  exportHistoryAsCsv: (role?: RoleType) => void;
}

const STORAGE_KEY = 'maintix_action_history';

const defaultSeedHistory: HistoryAction[] = [
  // Technician actions
  {
    id: 'act-tech-001',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    role: 'TECHNICIAN',
    userName: 'Karim Ben Salem (Tech L1)',
    action: 'INSPECTION_3D_REALISEE',
    category: 'DIAGNOSTIC',
    details: 'Inspection 3D complète du roulement palier gauche sur TX-1250-A. Vibration anormale confirmée à 11.2 mm/s RMS.',
    machineCode: 'TX-1250-A',
    status: 'WARNING'
  },
  {
    id: 'act-tech-002',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    role: 'TECHNICIAN',
    userName: 'Karim Ben Salem (Tech L1)',
    action: 'COPILOT_RAG_CONSULTE',
    category: 'COPILOT',
    details: 'Requête Copilot RAG : "Origine vibration 11.2 mm/s RMS sur TX-1250-A". Recommandation d\'intervention SKF 6208 reçue.',
    machineCode: 'TX-1250-A',
    status: 'INFO'
  },
  {
    id: 'act-tech-003',
    timestamp: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    role: 'TECHNICIAN',
    userName: 'Karim Ben Salem (Tech L1)',
    action: 'PIECE_RESERVE',
    category: 'MAINTENANCE',
    details: 'Réservation de 2x Roulements SKF 6208-2RS et 1kg Graisse LGMT 3 pour ordre préventif.',
    machineCode: 'TX-1250-A',
    status: 'SUCCESS'
  },
  {
    id: 'act-tech-004',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    role: 'TECHNICIAN',
    userName: 'Karim Ben Salem (Tech L1)',
    action: 'ORDRE_TRAVAIL_CREE',
    category: 'MAINTENANCE',
    details: 'Création ordre WO-2026-089: Remplacement préventif roulement moteur principal TX-1250-A.',
    machineCode: 'TX-1250-A',
    status: 'CRITICAL'
  },

  // Maintenance Manager actions
  {
    id: 'act-maint-001',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    role: 'MAINTENANCE_MANAGER',
    userName: 'Sonia Trabelsi (Resp. Maintenance)',
    action: 'PLANIFICATION_INTERVENTION',
    category: 'MAINTENANCE',
    details: 'Validation et planification du créneau de maintenance préventive de 2h sur la ligne 1 (TX-1250-A).',
    machineCode: 'TX-1250-A',
    status: 'SUCCESS'
  },
  {
    id: 'act-maint-002',
    timestamp: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
    role: 'MAINTENANCE_MANAGER',
    userName: 'Sonia Trabelsi (Resp. Maintenance)',
    action: 'ANALYSE_RISQUE_MACHINE',
    category: 'DIAGNOSTIC',
    details: 'Évaluation matrice de risque multi-capteurs : criticité élevée sur TX-1250-A (Score 92%) et TX-0672-B (78%).',
    machineCode: 'TX-1250-A',
    status: 'WARNING'
  },
  {
    id: 'act-maint-003',
    timestamp: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
    role: 'MAINTENANCE_MANAGER',
    userName: 'Sonia Trabelsi (Resp. Maintenance)',
    action: 'AFFECTATION_TECHNICIEN',
    category: 'MAINTENANCE',
    details: 'Affectation de Karim Ben Salem et Mehdi Dridi sur l\'intervention préventive TX-1250-A.',
    machineCode: 'TX-1250-A',
    status: 'INFO'
  },

  // Production Manager actions
  {
    id: 'act-prod-001',
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    role: 'PRODUCTION_MANAGER',
    userName: 'Tarek Mansour (Resp. Production)',
    action: 'REAJUSTEMENT_CADENCE',
    category: 'PRODUCTION',
    details: 'Ajustement de cadence sur Ligne 1 (-15%) pour préserver l\'arbre moteur jusqu\'au créneau de maintenance.',
    machineCode: 'TX-1250-A',
    status: 'WARNING'
  },
  {
    id: 'act-prod-002',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    role: 'PRODUCTION_MANAGER',
    userName: 'Tarek Mansour (Resp. Production)',
    action: 'ANALYSE_TRS_OEE',
    category: 'PRODUCTION',
    details: 'Audit de performance TRS Ligne 1 (76.4%) vs Ligne 2 (88.1%). Identification des 4.2h d\'arrêts micro-pannes.',
    machineCode: 'PCL-GMX-001',
    status: 'INFO'
  },
  {
    id: 'act-prod-003',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    role: 'PRODUCTION_MANAGER',
    userName: 'Tarek Mansour (Resp. Production)',
    action: 'REORDONNANCEMENT_MES',
    category: 'PRODUCTION',
    details: 'Bascule de l\'ordre de fabrication OF-4491 vers Ligne 3 pour sécuriser la commande client export.',
    machineCode: 'TX-0981-C',
    status: 'SUCCESS'
  },

  // Industrial Director actions
  {
    id: 'act-dir-001',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    role: 'INDUSTRIAL_DIRECTOR',
    userName: 'Dr. Yassine Benzarti (Directeur Industriel)',
    action: 'EXPORT_MANAGEMENT_CSV',
    category: 'EXPORT',
    details: 'Export du rapport complet de management décisionnel (KPIs, TRS, ROI et impact financier YTD).',
    status: 'SUCCESS'
  },
  {
    id: 'act-dir-002',
    timestamp: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    role: 'INDUSTRIAL_DIRECTOR',
    userName: 'Dr. Yassine Benzarti (Directeur Industriel)',
    action: 'SYNTHESE_STRATEGIQUE_IA',
    category: 'STRATEGY',
    details: 'Consultation synthèse IA : Économie de 24,650 $ confirmée par la détection précoce du roulement.',
    machineCode: 'TX-1250-A',
    status: 'INFO'
  },
  {
    id: 'act-dir-003',
    timestamp: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
    role: 'INDUSTRIAL_DIRECTOR',
    userName: 'Dr. Yassine Benzarti (Directeur Industriel)',
    action: 'VALIDATION_BUDGET_CAPEX',
    category: 'STRATEGY',
    details: 'Approbation de l\'extension IoT capteurs sans fil pour la zone filature 2.',
    status: 'SUCCESS'
  },

  // Admin actions
  {
    id: 'act-adm-001',
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    role: 'ADMIN',
    userName: 'Administrateur Système',
    action: 'CONNEXION_ADMIN_SECURISEE',
    category: 'SECURITY',
    details: 'Authentification réussie sur le panneau d\'administration via PIN certifié.',
    status: 'SUCCESS'
  },
  {
    id: 'act-adm-002',
    timestamp: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
    role: 'ADMIN',
    userName: 'Administrateur Système',
    action: 'SYNCHRONISATION_RAG_VECTOR',
    category: 'SYSTEM',
    details: 'Indexation de 42 documents techniques et manuels constructeurs dans la base vectorielle FAISS/RAG.',
    status: 'SUCCESS'
  }
];

const loadHistory = (): HistoryAction[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse stored action history', e);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSeedHistory));
  return defaultSeedHistory;
};

export const useHistoryStore = create<HistoryState>((set, get) => ({
  actions: loadHistory(),

  addAction: (actionData) => {
    const newAction: HistoryAction = {
      ...actionData,
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: actionData.timestamp || new Date().toISOString()
    };

    set((state) => {
      const updated = [newAction, ...state.actions].slice(0, 500); // keep last 500 actions
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to persist action history', e);
      }
      return { actions: updated };
    });
  },

  clearHistory: (role) => {
    set((state) => {
      const updated = role ? state.actions.filter((a) => a.role !== role) : [];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to clear action history', e);
      }
      return { actions: updated };
    });
  },

  getActionsByRole: (role) => {
    const { actions } = get();
    if (!role) return actions;
    return actions.filter((a) => a.role === role);
  },

  exportHistoryAsCsv: (role) => {
    const actions = get().getActionsByRole(role);
    if (actions.length === 0) return;

    const headers = ['ID', 'Date & Heure', 'Rôle', 'Utilisateur', 'Action', 'Catégorie', 'Machine', 'Statut', 'Détails'];
    const rows = actions.map((a) => [
      `"${a.id}"`,
      `"${new Date(a.timestamp).toLocaleString('fr-FR')}"`,
      `"${a.role}"`,
      `"${a.userName.replace(/"/g, '""')}"`,
      `"${a.action}"`,
      `"${a.category}"`,
      `"${a.machineCode || 'N/A'}"`,
      `"${a.status || 'INFO'}"`,
      `"${a.details.replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const roleSlug = role ? role.toLowerCase() : 'tous_roles';
    link.setAttribute('href', url);
    link.setAttribute('download', `maintix_journal_actions_${roleSlug}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}));
