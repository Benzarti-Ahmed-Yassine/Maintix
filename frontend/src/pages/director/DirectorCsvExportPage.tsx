import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Database,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  ShieldAlert,
  Layers,
  Calendar,
  Eye,
  X,
  FileText,
  Sparkles,
  BarChart3,
  Briefcase
} from 'lucide-react';
import { useHistoryStore } from '../../store/useHistoryStore.js';

interface CsvDataset {
  id: string;
  filename: string;
  title: string;
  category: string;
  description: string;
  recordCount: number;
  columns: string[];
  sampleData: string[][];
  generateCsv: () => string;
}

export const DirectorCsvExportPage: React.FC = () => {
  const { addAction } = useHistoryStore();
  const [previewDataset, setPreviewDataset] = useState<CsvDataset | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const datasets: CsvDataset[] = [
    {
      id: 'kpis_strategiques',
      filename: 'kpis_strategiques_direction.csv',
      title: 'KPIs Stratégiques & Efficience Usine',
      category: 'GOUVERNANCE & PERFORMANCE',
      description: 'Indicateurs clés mensuels : TRS global, taux de disponibilité, MTBF, MTTR et coûts de non-qualité.',
      recordCount: 12,
      columns: ['Mois', 'OEE_Usine_Pct', 'Disponibilite_Pct', 'Performance_Pct', 'Qualite_Pct', 'MTBF_Heures', 'MTTR_Heures', 'Arrets_Non_Planifies_H'],
      sampleData: [
        ['Janvier 2026', '84.2%', '91.5%', '93.2%', '98.8%', '342h', '1.4h', '12.5h'],
        ['Février 2026', '85.6%', '92.8%', '94.0%', '98.9%', '368h', '1.2h', '9.8h'],
        ['Mars 2026', '86.1%', '93.4%', '94.5%', '99.1%', '395h', '1.1h', '8.2h'],
        ['Avril 2026', '87.4%', '94.2%', '95.1%', '99.2%', '420h', '0.9h', '6.4h'],
        ['Mai 2026', '88.0%', '94.8%', '95.6%', '99.4%', '450h', '0.8h', '5.1h']
      ],
      generateCsv: () => {
        const headers = ['Mois', 'OEE_Usine_Pct', 'Disponibilite_Pct', 'Performance_Pct', 'Qualite_Pct', 'MTBF_Heures', 'MTTR_Heures', 'Arrets_Non_Planifies_H'];
        const rows = [
          ['Janvier 2026', '84.2', '91.5', '93.2', '98.8', '342', '1.4', '12.5'],
          ['Fevrier 2026', '85.6', '92.8', '94.0', '98.9', '368', '1.2', '9.8'],
          ['Mars 2026', '86.1', '93.4', '94.5', '99.1', '395', '1.1', '8.2'],
          ['Avril 2026', '87.4', '94.2', '95.1', '99.2', '420', '0.9', '6.4'],
          ['Mai 2026', '88.0', '94.8', '95.6', '99.4', '450', '0.8', '5.1'],
          ['Juin 2026', '88.7', '95.2', '96.0', '99.5', '480', '0.8', '4.3'],
          ['Juillet 2026', '89.1', '95.5', '96.2', '99.5', '495', '0.7', '3.8'],
          ['Aout 2026 (YTD)', '89.4', '95.8', '96.5', '99.6', '512', '0.7', '3.2']
        ];
        return '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
      }
    },
    {
      id: 'impact_financier_roi',
      filename: 'impact_financier_roi_maintenance.csv',
      title: 'Impact Financier & ROI Maintenance Prédictive',
      category: 'FINANCE & RENTABILITÉ',
      description: 'Bilan financier complet : coûts curatifs évités, dépenses préventives, pertes de production évitées et ROI calculé.',
      recordCount: 8,
      columns: ['Mois', 'Cout_Preventif_USD', 'Cout_Curatif_Evite_USD', 'Pertes_Evitees_USD', 'Economie_Nette_USD', 'ROI_Pct'],
      sampleData: [
        ['Q1 2026', '14,200 $', '48,500 $', '36,000 $', '+70,300 $', '198%'],
        ['Q2 2026', '16,800 $', '62,400 $', '45,200 $', '+90,800 $', '224%'],
        ['Juillet 2026', '5,400 $', '22,100 $', '18,500 $', '+35,200 $', '216%'],
        ['Août 2026 (YTD)', '4,200 $', '28,500 $', '24,650 $', '+48,950 $', '245%']
      ],
      generateCsv: () => {
        const headers = ['Periode', 'Cout_Preventif_USD', 'Cout_Curatif_Evite_USD', 'Pertes_Evitees_USD', 'Economie_Nette_USD', 'ROI_Pct'];
        const rows = [
          ['Q1 2026', '14200', '48500', '36000', '70300', '198'],
          ['Q2 2026', '16800', '62400', '45200', '90800', '224'],
          ['Juillet 2026', '5400', '22100', '18500', '35200', '216'],
          ['Aout 2026 (YTD)', '4200', '28500', '24650', '48950', '245'],
          ['Cumul Annuel 2026', '40600', '161500', '124350', '245250', '214']
        ];
        return '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
      }
    },
    {
      id: 'analyse_risques_parc',
      filename: 'matrice_risques_parc_machines.csv',
      title: 'Matrice des Risques & Santé du Parc Machines',
      category: 'SÛRETÉ & GESTION DES ACTIFS',
      description: 'Inventaire de santé des machines industrielles, probabilités de défaillance IA, RUL résiduel et criticité opérationnelle.',
      recordCount: 8,
      columns: ['Code_Machine', 'Nom_Machine', 'Ligne', 'Criticite', 'Score_Sante_Pct', 'Score_Anomalie', 'RUL_Jours', 'Statut_Machine', 'Composant_Critique'],
      sampleData: [
        ['TX-1250-A', 'Bobineuse Rapide GMX', 'Ligne 1', 'CRITIQUE (A1)', '22.0%', '0.92', '18 j', 'CRITIQUE', 'Palier Roulement SKF 6208'],
        ['TX-0672-B', 'Métier à Tisser Sulzer', 'Ligne 2', 'MOYENNE (B2)', '68.5%', '0.42', '64 j', 'SURVEILLANCE', 'Accouplement Arbre'],
        ['TX-0981-C', 'Teinture Continue K-40', 'Ligne 3', 'BASSE (C1)', '94.0%', '0.08', '180 j', 'NORMAL', 'Vanne Proportionnelle'],
        ['PCL-GMX-001', 'Compresseur Atlas GA55', 'Centrale', 'CRITIQUE (A1)', '88.2%', '0.12', '120 j', 'NORMAL', 'Filtre Séparateur Huile']
      ],
      generateCsv: () => {
        const headers = ['Code_Machine', 'Nom_Machine', 'Ligne', 'Criticite', 'Score_Sante_Pct', 'Score_Anomalie', 'RUL_Jours', 'Statut_Machine', 'Composant_Critique'];
        const rows = [
          ['TX-1250-A', 'Bobineuse Rapide GMX', 'Ligne 1', 'CRITIQUE (A1)', '22.0', '0.92', '18', 'CRITIQUE', 'Palier Roulement SKF 6208'],
          ['TX-0672-B', 'Metier a Tisser Sulzer', 'Ligne 2', 'MOYENNE (B2)', '68.5', '0.42', '64', 'SURVEILLANCE', 'Accouplement Arbre'],
          ['TX-0981-C', 'Teinture Continue K-40', 'Ligne 3', 'BASSE (C1)', '94.0', '0.08', '180', 'NORMAL', 'Vanne Proportionnelle'],
          ['PCL-GMX-001', 'Compresseur Atlas GA55', 'Centrale', 'CRITIQUE (A1)', '88.2', '0.12', '120', 'NORMAL', 'Filtre Separateur Huile'],
          ['TX-0442-D', 'Carde Haute Vitesse C70', 'Ligne 1', 'HAUTE (A2)', '78.4', '0.28', '85', 'NORMAL', 'Garniture Cylindre'],
          ['TX-0811-E', 'Rame Elargisseuse Monforts', 'Ligne 4', 'HAUTE (A2)', '81.2', '0.22', '95', 'NORMAL', 'Chaine de Transport']
        ];
        return '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
      }
    },
    {
      id: 'suivi_ordres_travail_couts',
      filename: 'rapport_ordres_travail_couts_gmao.csv',
      title: 'Suivi GMAO des Ordres de Travail & Coûts',
      category: 'OPÉRATIONS & MAINTENANCE',
      description: 'Détail de toutes les interventions de maintenance : durées, techniciens affectés, coûts de pièces et main d\'œuvre.',
      recordCount: 24,
      columns: ['Numero_OT', 'Date_Creation', 'Machine', 'Type', 'Priorite', 'Statut', 'Technicien', 'Duree_H', 'Cout_Pieces_USD', 'Cout_Total_USD'],
      sampleData: [
        ['WO-2026-089', '17/08/2026', 'TX-1250-A', 'Préventif IA', 'URGENT', 'EN COURS', 'Karim Ben Salem', '2.0h', '480 $', '720 $'],
        ['WO-2026-088', '15/08/2026', 'TX-0672-B', 'Conditionnel', 'MOYENNE', 'TERMINE', 'Mehdi Dridi', '1.5h', '120 $', '280 $'],
        ['WO-2026-087', '12/08/2026', 'PCL-GMX-001', 'Systématique', 'BASSE', 'TERMINE', 'Karim Ben Salem', '3.0h', '350 $', '650 $'],
        ['WO-2026-086', '08/08/2026', 'TX-0981-C', 'Contrôle', 'BASSE', 'TERMINE', 'Youssef Gharbi', '1.0h', '45 $', '150 $']
      ],
      generateCsv: () => {
        const headers = ['Numero_OT', 'Date_Creation', 'Machine', 'Type', 'Priorite', 'Statut', 'Technicien', 'Duree_H', 'Cout_Pieces_USD', 'Cout_Total_USD'];
        const rows = [
          ['WO-2026-089', '17/08/2026', 'TX-1250-A', 'Preventif IA', 'URGENT', 'EN COURS', 'Karim Ben Salem', '2.0', '480', '720'],
          ['WO-2026-088', '15/08/2026', 'TX-0672-B', 'Conditionnel', 'MOYENNE', 'TERMINE', 'Mehdi Dridi', '1.5', '120', '280'],
          ['WO-2026-087', '12/08/2026', 'PCL-GMX-001', 'Systematique', 'BASSE', 'TERMINE', 'Karim Ben Salem', '3.0', '350', '650'],
          ['WO-2026-086', '08/08/2026', 'TX-0981-C', 'Controle', 'BASSE', 'TERMINE', 'Youssef Gharbi', '1.0', '45', '150'],
          ['WO-2026-085', '03/08/2026', 'TX-0442-D', 'Graissage', 'BASSE', 'TERMINE', 'Mehdi Dridi', '1.5', '85', '220'],
          ['WO-2026-084', '28/07/2026', 'TX-1250-A', 'Calibration', 'MOYENNE', 'TERMINE', 'Karim Ben Salem', '2.5', '110', '360']
        ];
        return '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
      }
    },
    {
      id: 'performances_lignes_oee',
      filename: 'performances_lignes_production_trs.csv',
      title: 'Performance & TRS des Lignes de Production',
      category: 'PRODUCTION & CADENCE',
      description: 'Suivi comparatif des 4 lignes de fabrication : cadence nominale vs réelle, taux de rebuts, pertes de vitesse et OEE.',
      recordCount: 4,
      columns: ['Ligne', 'Designation', 'Cadence_Nominale', 'Cadence_Reelle', 'Rebuts_Pct', 'Disponibilite_Pct', 'Performance_Pct', 'Qualite_Pct', 'TRS_OEE_Pct'],
      sampleData: [
        ['Ligne 1', 'Filature Principale', '500 u/h', '425 u/h (-15%)', '1.2%', '91.2%', '85.0%', '98.8%', '76.6%'],
        ['Ligne 2', 'Tissage Grande Largeur', '380 u/h', '372 u/h (-2%)', '0.8%', '95.4%', '97.8%', '99.2%', '92.5%'],
        ['Ligne 3', 'Ennoblissement & Teinture', '620 u/h', '610 u/h (-1.5%)', '0.6%', '96.2%', '98.3%', '99.4%', '94.0%'],
        ['Ligne 4', 'Finition & Conditionnement', '800 u/h', '790 u/h (-1.2%)', '0.4%', '97.0%', '98.7%', '99.6%', '95.4%']
      ],
      generateCsv: () => {
        const headers = ['Ligne', 'Designation', 'Cadence_Nominale', 'Cadence_Reelle', 'Rebuts_Pct', 'Disponibilite_Pct', 'Performance_Pct', 'Qualite_Pct', 'TRS_OEE_Pct'];
        const rows = [
          ['Ligne 1', 'Filature Principale', '500', '425', '1.2', '91.2', '85.0', '98.8', '76.6'],
          ['Ligne 2', 'Tissage Grande Largeur', '380', '372', '0.8', '95.4', '97.8', '99.2', '92.5'],
          ['Ligne 3', 'Ennoblissement & Teinture', '620', '610', '0.6', '96.2', '98.3', '99.4', '94.0'],
          ['Ligne 4', 'Finition & Conditionnement', '800', '790', '0.4', '97.0', '98.7', '99.6', '95.4']
        ];
        return '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
      }
    },
    {
      id: 'rapport_synthese_management',
      filename: 'synthese_executive_direction_maintix.csv',
      title: 'Rapport Consolidé pour Comité de Direction',
      category: 'RAPPORT EXÉCUTIF COMPLET',
      description: 'Synthèse managériale intégrée prête pour réunion de direction : rentabilité, taux de service client, économies nettes et santé parc.',
      recordCount: 1,
      columns: ['Indicateur_Cle', 'Valeur_Actuelle', 'Objectif_Annuel', 'Ecart_Pct', 'Statut', 'Commentaire_Strategique'],
      sampleData: [
        ['Taux TRS Global Usine', '88.0%', '85.0%', '+3.0%', 'OBJECTIF ATTEINT', 'Gains portés par la détection d\'anomalies précoce'],
        ['Économies Maintenance Évitée', '245,250 $', '180,000 $', '+36.2%', 'DÉPASSEMENT POSITIF', '2 arrêts majeurs évités sur le semestre'],
        ['Taux de Service Client (OTD)', '98.4%', '96.0%', '+2.4%', 'OBJECTIF ATTEINT', 'Aucune rupture sur les commandes export prioritaires'],
        ['Indice de Risque Parc', 'Faible (12%)', '< 15%', '-3.0%', 'MAÎTRISÉ', 'Plan préventif sous contrôle sur TX-1250-A']
      ],
      generateCsv: () => {
        const headers = ['Indicateur_Cle', 'Valeur_Actuelle', 'Objectif_Annuel', 'Ecart_Pct', 'Statut', 'Commentaire_Strategique'];
        const rows = [
          ['Taux TRS Global Usine', '88.0%', '85.0%', '+3.0%', 'OBJECTIF ATTEINT', 'Gains portes par la detection d anomalies precoce'],
          ['Economies Maintenance Evitee', '245250 $', '180000 $', '+36.2%', 'DEPASSEMENT POSITIF', '2 arrets majeurs evites sur le semestre'],
          ['Taux de Service Client (OTD)', '98.4%', '96.0%', '+2.4%', 'OBJECTIF ATTEINT', 'Aucune rupture sur les commandes export prioritaires'],
          ['Indice de Risque Parc', 'Faible (12%)', '< 15%', '-3.0%', 'MAITRISE', 'Plan preventif sous controle sur TX-1250-A'],
          ['Cout de Non-Qualite', '0.8%', '< 1.5%', '-0.7%', 'EXCELLENT', 'Taux de rebuts historiquement bas']
        ];
        return '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
      }
    }
  ];

  const handleDownload = (dataset: CsvDataset) => {
    const csvContent = dataset.generateCsv();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', dataset.filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Track download in history store
    addAction({
      role: 'INDUSTRIAL_DIRECTOR',
      userName: 'Dr. Yassine Benzarti (Directeur Industriel)',
      action: 'EXPORT_CSV_MANAGEMENT',
      category: 'EXPORT',
      details: `Export du fichier CSV : "${dataset.filename}" (${dataset.title})`,
      status: 'SUCCESS'
    });

    setDownloadSuccess(`Fichier ${dataset.filename} téléchargé avec succès !`);
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  const handleDownloadAll = () => {
    datasets.forEach((d, idx) => {
      setTimeout(() => handleDownload(d), idx * 250);
    });

    addAction({
      role: 'INDUSTRIAL_DIRECTOR',
      userName: 'Dr. Yassine Benzarti (Directeur Industriel)',
      action: 'EXPORT_PACK_COMPLET_CSV',
      category: 'EXPORT',
      details: `Export complet du pack des 6 fichiers CSV de management pour reporting et Power BI`,
      status: 'SUCCESS'
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
            <span>DIRECTEUR INDUSTRIEL</span>
            <span>/</span>
            <span className="text-slate-100">CENTRE D'EXTRACTION & FICHIERS CSV MANAGEMENT</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3 font-mono">
            <FileSpreadsheet className="text-emerald-400" />
            Centre d'Exportation des Données Décisionnelles & Management (CSV)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Génération et extraction directe de jeux de données tabulaires pour Excel, Power BI, comités de direction et reporting ERP
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadAll}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-emerald-600/30 font-mono"
          >
            <Download size={15} />
            <span>Télécharger Pack Complet (6 CSV)</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="bg-emerald-950/90 border border-emerald-800 p-3 rounded-xl text-xs text-emerald-300 font-bold flex items-center gap-2 animate-pulse">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/30 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
              ● FORMAT CSV UNIVERSEL UTF-8
            </span>
            <span className="text-xs text-slate-400">Compatible Power BI, Microsoft Excel, Tableau & Python</span>
          </div>
          <h2 className="text-base font-bold text-white">
            Tableaux de Bord de Gouvernance & Pilotage Stratégique
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Ces fichiers contiennent l'ensemble des données calculées en temps réel par les modèles IA Maintix :
            évaluation des risques, ROI de maintenance évitée, taux de rendement synthétique (TRS) et détails opérationnels GMAO.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl text-center min-w-[130px]">
            <p className="text-[10px] font-bold text-slate-400 uppercase font-mono">Datasets Prêts</p>
            <p className="text-2xl font-black text-emerald-400 font-mono">6 / 6</p>
            <span className="text-[10px] text-slate-500">100% synchronisés</span>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl text-center min-w-[130px]">
            <p className="text-[10px] font-bold text-slate-400 uppercase font-mono">Séparateur</p>
            <p className="text-xl font-black text-white font-mono">Point-Virgule (;)</p>
            <span className="text-[10px] text-slate-500">Standard Européen</span>
          </div>
        </div>
      </div>

      {/* Datasets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {datasets.map((dataset) => (
          <div
            key={dataset.id}
            className="industrial-card p-5 flex flex-col justify-between hover:border-emerald-500/50 transition-all duration-300 group shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                  {dataset.category}
                </span>
                <span className="text-xs font-mono text-slate-400 font-semibold">
                  {dataset.columns.length} colonnes
                </span>
              </div>

              <h3 className="font-bold text-base text-white group-hover:text-emerald-300 transition mb-1 flex items-center gap-2">
                <FileSpreadsheet size={16} className="text-emerald-400 shrink-0" />
                <span>{dataset.title}</span>
              </h3>

              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                {dataset.description}
              </p>

              {/* Columns preview tags */}
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5 mb-4 space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Structure des champs :</p>
                <div className="flex flex-wrap gap-1">
                  {dataset.columns.slice(0, 4).map((col, i) => (
                    <span key={i} className="text-[10px] font-mono text-slate-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                      {col}
                    </span>
                  ))}
                  {dataset.columns.length > 4 && (
                    <span className="text-[10px] font-mono text-slate-500 px-1">
                      +{dataset.columns.length - 4} autres
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => setPreviewDataset(dataset)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Eye size={13} />
                <span>Aperçu</span>
              </button>

              <button
                onClick={() => handleDownload(dataset)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-emerald-600/20 font-mono"
              >
                <Download size={13} />
                <span>Télécharger CSV</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Dataset Preview Modal */}
      {previewDataset && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-4xl max-h-[85vh] shadow-2xl flex flex-col text-slate-900">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200">
                  <FileSpreadsheet size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">{previewDataset.title}</h3>
                  <p className="text-xs font-mono text-slate-500">Nom du fichier : {previewDataset.filename}</p>
                </div>
              </div>

              <button
                onClick={() => setPreviewDataset(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Table Preview */}
            <div className="flex-1 overflow-auto border border-slate-200 rounded-xl mb-4 bg-[#f8fafc]">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-mono uppercase text-[10px] sticky top-0 border-b border-slate-200">
                  <tr>
                    {previewDataset.columns.map((col, idx) => (
                      <th key={idx} className="p-3 whitespace-nowrap bg-slate-100">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono bg-white">
                  {previewDataset.sampleData.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="p-3 text-slate-700 whitespace-nowrap">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-slate-500">
                Aperçu échantillonné • Le fichier exporté contient l'intégralité des données horodatées
              </p>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPreviewDataset(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                >
                  Fermer
                </button>

                <button
                  onClick={() => {
                    handleDownload(previewDataset);
                    setPreviewDataset(null);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition font-mono shadow-md shadow-emerald-600/20"
                >
                  <Download size={14} />
                  <span>Télécharger ce CSV</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
