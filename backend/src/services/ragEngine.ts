import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

const prisma = new PrismaClient();
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:0.5b';

export interface ExtractedProblem {
  machine_code: string;
  fault_type: string;
  subsystem: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  iso_zone: 'ZONE_A' | 'ZONE_B' | 'ZONE_C' | 'ZONE_D';
  urgency: string;
  symptoms: string[];
  rul_days: number;
  confidence: number;
  required_spare_part: {
    part_number: string;
    name: string;
    stock_available: number;
    location: string;
    lubricant: string;
  };
  estimated_downtime_hours: number;
  avoided_loss_usd: number;
  work_order_draft: {
    title: string;
    machine_code: string;
    target_subsystem: string;
    fault_type: string;
    priority: string;
    estimated_duration_hours: number;
    assigned_role: string;
    required_parts: Array<{
      part_number: string;
      name: string;
      quantity: number;
      location: string;
      in_stock: number;
    }>;
    required_lubricant: string;
    procedure_steps: string[];
    safety_instructions: string;
  };
  product_actions: Array<{
    action_id: string;
    label: string;
    type: string;
    payload: any;
  }>;
}

export interface RagResponse {
  answer: string;
  confidence: number;
  sources: { title: string; snippet: string }[];
  recommendedActions: string[];
  evidence?: string[];
  activeAiEngine?: string;
  extractedProblem?: ExtractedProblem;
  productActions?: any[];
}

// ─── Query Intent Classification ─────────────────────────────────────────────

type QueryIntent = 'GREETING' | 'OFF_TOPIC' | 'CONTRADICTION' | 'TECHNICAL';

function classifyQueryIntent(query: string, machine: any, liveTel: { vibRMS: number }): QueryIntent {
  const q = query.trim().toLowerCase();

  // 1. GREETING
  const greetings = ['hi', 'hello', 'bonjour', 'salut', 'coucou', 'hey', 'bonsoir', 'yo', 'salam', 'bon matin'];
  if (greetings.includes(q) || /^hi[ !.?]*$/i.test(q) || /^bonjour[ !.?]*$/i.test(q) || /^salut[ !.?]*$/i.test(q) || /^hello[ !.?]*$/i.test(q)) {
    return 'GREETING';
  }

  // 2. CONTRADICTION (claims fine / low vibration / speed up while machine is critical)
  const isCritical = (liveTel.vibRMS > 4.5) || (machine?.status === 'CRITICAL');
  if (isCritical) {
    const claimsFine = q.includes('va bien') || q.includes('très bien') || q.includes('parfait') ||
                       q.includes('normal') || q.includes('aucun problème') || q.includes('pas de problème') ||
                       q.includes('bonne santé') || q.includes('tout est ok') || q.includes('aucun souci');

    const claimsLowVib = q.includes('faible vibration') || q.includes('vibration faible') ||
                         q.includes('vibrations faibles') || q.includes('vibrations calmes') ||
                         q.includes('0.') || q.includes('1.0') || q.includes('1.2') || q.includes('1.4');

    const wantsToSpeedUp = q.includes('augmenter la cadence') || q.includes('monter la cadence') ||
                           q.includes('forcer la production') || q.includes('à fond') ||
                           q.includes('accélérer') || q.includes('plus vite') || q.includes('2000 rpm') ||
                           q.includes('augmenter la vitesse') || q.includes('plein régime');

    const wrongComponent = q.includes('courroie') || q.includes('moteur hydraulique') || q.includes('huile moteur');

    if (claimsFine || claimsLowVib || wantsToSpeedUp || wrongComponent) {
      return 'CONTRADICTION';
    }
  }

  // 3. OFF_TOPIC / GIBBERISH / UNRELATED WORDS (e.g. "briquet", "pomme", "test", "asdf")
  const industrialKeywords = [
    'machine', 'vibration', 'roulement', 'palier', 'température', 'temp', 'moteur', 'cadence', 
    'panne', 'alarme', 'seuil', 'iso', 'gmao', 'ordre', 'travail', 'pièce', 'stock',
    'magasin', 'graisse', 'loto', 'trs', 'oee', 'production', 'maintenance', 'diagnostic',
    'arbre', 'vitesse', 'rpm', 'courant', 'ampere', 'tension', 'volt', 'tx-1250', 'pcl',
    'arrêt', 'défaut', 'anomalie', 'aide', 'help', 'quoi faire', 'comment', 'pourquoi',
    'changer', 'remplacer', 'inspecter', 'mesure', 'capteur', 'rul', 'santé', 'criticité',
    'rapport', 'problème', 'état', 'statut', 'consigne', 'procédure', 'sop', 'sécurité'
  ];

  const hasIndustrialTerm = industrialKeywords.some(k => q.includes(k));
  if (!hasIndustrialTerm && (q.split(/\s+/).length <= 2 || q.length < 12)) {
    return 'OFF_TOPIC';
  }

  return 'TECHNICAL';
}

// ─── Greeting Handler ─────────────────────────────────────────────────────────

function handleGreeting(role: string, targetCode: string, isCritical: boolean, vibRms: number): string {
  const roleName = role === 'INDUSTRIAL_DIRECTOR' ? 'Directeur Industriel' :
                   role === 'MAINTENANCE_MANAGER' ? 'Responsable Maintenance' :
                   role === 'PRODUCTION_MANAGER' ? 'Responsable Production' :
                   role === 'ADMIN' ? 'Administrateur Plateforme' : 'Technicien de Maintenance';

  const statusBadge = isCritical
    ? `⚠️ **ALERTE CRITIQUE** (Vibration : ${vibRms.toFixed(1)} mm/s RMS — Seuil ISO Zone D dépassé)`
    : `✅ **FONCTIONNEMENT NOMINAL**`;

  return `👋 Bonjour ! Je suis **MAINTIX**, votre copilote IA industriel.

Je surveille en continu les équipements de l'usine, notamment la machine active **${targetCode}** :
• **État actuel :** ${statusBadge}

En tant que **${roleName}**, voici ce que vous pouvez me demander :
• 🔍 *"Quel est le diagnostic complet de la machine ${targetCode} ?"*
• 🛠️ *"Quelle est la pièce requise au magasin et sa disponibilité ?"*
• 📋 *"Donne-moi la procédure de consignation LOTO et de réparation."*
• ⚙️ *"Quel est l'impact sur le TRS et la cadence de production ?"*

Comment puis-je vous aider ?`;
}

// ─── Off-Topic / Unclear Message Handler ──────────────────────────────────────

function handleOffTopic(query: string, role: string, targetCode: string, isCritical: boolean, vibRms: number): string {
  return `⚠️ **Demande non reconnue :** "${query}"

Je suis **MAINTIX**, le copilote IA spécialisé exclusivement dans la **maintenance prédictive, la télémétrie des capteurs et les opérations industrielles** de votre usine textile. 
Votre message ne semble pas correspondre à un besoin technique ou opérationnel lié aux machines.

💡 **Comment formuler votre besoin ?**
Sur la machine cible **${targetCode}** ${isCritical ? `(en alerte à ${vibRms.toFixed(1)} mm/s RMS)` : ''}, vous pouvez par exemple demander :
• 📊 *"Analyse la vibration et la température sur ${targetCode}"*
• 🔧 *"Procédure de remplacement du roulement de palier"*
• 📦 *"Vérifier le stock de pièces détachées au magasin"*
• 📉 *"Estimation du RUL (durée de vie restante) et probabilité de défaillance"*

Posez-moi votre question technique et je vous guiderai immédiatement !`;
}

// ─── Contradiction & Fact-Correction Handler ─────────────────────────────────

function handleFactCorrection(
  query: string,
  role: string,
  machine: any,
  liveTel: { vibRMS: number; tempBearing: number; speedRpm: number },
  bearingPart: any
): string {
  const q = query.toLowerCase();
  let specificCorrection = '';

  if (q.includes('va bien') || q.includes('faible vibration') || q.includes('0.') || q.includes('parfait')) {
    specificCorrection = `Votre affirmation selon laquelle la machine va bien ou que les vibrations sont faibles est **FAUSSE**. Les capteurs télémétriques indiquent une vibration RMS réelle de **${liveTel.vibRMS.toFixed(1)} mm/s** (au-delà du seuil ISO 10816-3 Zone D critique de 4.5 mm/s).`;
  } else if (q.includes('augmenter') || q.includes('cadence') || q.includes('forcer') || q.includes('à fond') || q.includes('accélérer')) {
    specificCorrection = `Augmenter la cadence ou forcer la production sur la machine **${machine?.code || 'TX-1250-A'}** dans son état actuel est **EXTRÊMEMENT DANGEREUX**. Avec 11.2 mm/s RMS de vibration, cela provoquerait le grippage immédiat du roulement et la destruction de l'arbre principal (+24 650 $ de dégâts).`;
  } else {
    specificCorrection = `Vos hypothèses contredisent les mesures réelles des capteurs en direct sur la machine ${machine?.code || 'TX-1250-A'}.`;
  }

  if (role === 'PRODUCTION_MANAGER') {
    return `⚠️ **RECTIFICATION & CONSEIL PRODUCTION :**
${specificCorrection}

📊 **État réel des capteurs :**
• Vibration RMS : **${liveTel.vibRMS.toFixed(1)} mm/s RMS** (Seuil critique Zone D dépassé).
• Température palier : **${liveTel.tempBearing.toFixed(1)} °C**.
• Risque production : Rupture brutale en cours de lot, casse de fils et arrêt non planifié de 8h+.

👉 **DÉCISION PRODUCTION RECOMMANDÉE :**
1. **NE PAS forcer la cadence** : appliquer immédiatement la consigne automate de réduction à 1250 RPM (-15%).
2. Coordonner un arrêt court de maintenance préventive de 2 heures avec l'équipe de maintenance.
3. Basculer les lots prioritaires vers la Ligne 3 si le flux de tissage doit être maintenu.`;
  }

  if (role === 'INDUSTRIAL_DIRECTOR') {
    return `⚠️ **SYNTHÈSE DIRECTION & RECTIFICATION :**
${specificCorrection}

📈 **Impact Financier & Risque :**
• Coût intervention préventive immédiate : ~45 € (pièce) + 2h MO.
• Coût d'une casse en fonctionnement : +24 650 $ (remplacement arbre complet, moteur, perte de production).
• Décision requise : Valider l'arrêt préventif programmé sous 24h et l'application temporaire de la consigne automate à 1250 RPM.`;
  }

  return `⚠️ **RECTIFICATION TECHNIQUE & GUIDAGE :**
${specificCorrection}

📊 **Mesures télémétriques réelles sur ${machine?.code || 'TX-1250-A'} :**
• Vibration RMS mesurée : **${liveTel.vibRMS.toFixed(1)} mm/s RMS** (Norme ISO 10816-3 Zone D critique > 4.5 mm/s).
• Température du palier : **${liveTel.tempBearing.toFixed(1)} °C** (Seuil d'alerte : 55.0 °C).
• Diagnostic validé : Écaillage stade 3 piste externe roulement palier gauche.
• Durée de vie résiduelle (RUL) : **${machine?.predictedRulDays || 18} jours**.

👉 **PROCÉDURE EXACTE À SUIVRE :**
1. Appliquer la consigne automate (-15% cadence à 1250 RPM) pour protéger l'arbre.
2. Créer l'Ordre de Travail GMAO pour intervention sous 24h.
3. Réserver le roulement **${bearingPart.name}** (${bearingPart.partNumber}) au magasin (Emplacement : ${bearingPart.location || 'Rayon B-12'}, Stock : ${bearingPart.quantityInStock} unités).
4. Procéder à la consignation LOTO (coupure 400V) avant tout démontage.
5. Monter le roulement chauffé à 110°C par induction et graisser avec 15g SKF LGMT 3.`;
}

// ─── System Prompts for Technical Inferences ──────────────────────────────────

function buildSystemPrompt(role: string): string {
  const base = `Tu es MAINTIX, le copilote IA industriel expert en maintenance prédictive pour l'usine textile connectée.
Tu as un accès direct aux capteurs temps-réel de l'usine, au stock de pièces magasin, aux manuels techniques et aux normes ISO 10816-3.
Tu réponds en français de manière claire, structurée et adaptée au rôle de ton interlocuteur.`;

  const rolePrompts: Record<string, string> = {
    TECHNICIAN: `${base}
Tu t'adresses à un Technicien de Maintenance. Donne des explications techniques concrètes, la référence exacte des pièces au magasin, les outils requis, la procédure LOTO et les normes de tolérance.`,
    MAINTENANCE_MANAGER: `${base}
Tu t'adresses au Responsable Maintenance. Analyse la criticité FMEA, le RUL, la fenêtre d'arrêt recommandée, l'arbitrage coût préventif vs curatif et la politique Safe-RL.`,
    PRODUCTION_MANAGER: `${base}
Tu t'adresses au Responsable Production. Analyse l'impact sur le TRS/OEE, les lots de tissu, et recommande les ajustements de cadence optimaux.`,
    INDUSTRIAL_DIRECTOR: `${base}
Tu t'adresses au Directeur Industriel. Présente une synthèse exécutive, le calcul du ROI des pertes évitées et la décision stratégique recommandée.`,
    ADMIN: `${base}
Tu t'adresses à l'Administrateur Plateforme. Présente les métriques MLOps, l'architecture des modèles et les flux temps réel.`
  };

  return rolePrompts[role] || rolePrompts.TECHNICIAN;
}

// ─── Context Builder ─────────────────────────────────────────────────────────

async function buildMachineContext(
  targetCode: string,
  machine: any,
  spareParts: any[],
  chunks: any[]
): Promise<string> {
  const t = machine?.telemetry?.[0];
  const alarms = machine?.alarms || [];

  const telemetryBlock = t ? `
TÉLÉMÉTRIE CAPTEURS :
- Vibration RMS : ${t.vibRMS?.toFixed(2) ?? '11.20'} mm/s RMS (ISO 10816-3 Zone D Critique)
- Vibration Peak : ${t.vibPeak?.toFixed(2) ?? '14.80'} mm/s
- Température Palier Gauche : ${t.tempBearing?.toFixed(1) ?? '62.5'} °C
- Température Moteur : ${t.tempMotor?.toFixed(1) ?? '48.5'} °C
- Vitesse rotation : ${t.speedRpm?.toFixed(0) ?? '1450'} RPM` : '';

  const machineBlock = machine ? `
MACHINE : ${machine.name} (${machine.code})
- Statut : ${machine.status} (CRITIQUE)
- Santé : ${machine.healthScore?.toFixed(1) ?? '22.0'}/100 | RUL : ${machine.predictedRulDays ?? 18} jours
- Problème : Écaillage stade 3 roulement palier gauche` : '';

  const alarmsBlock = alarms.length > 0 ? `
ALARMES : ${alarms.map((a: any) => `[${a.severity}] ${a.title}`).join(', ')}` : '';

  const partsBlock = spareParts.length > 0 ? `
PIÈCES MAGASIN : ${spareParts.map((p: any) => `${p.name} (Réf: ${p.partNumber}, Stock: ${p.quantityInStock})`).join(' | ')}` : '';

  return `${machineBlock}\n${telemetryBlock}\n${alarmsBlock}\n${partsBlock}`;
}

// ─── Ollama Chat Call ─────────────────────────────────────────────────────────

async function callOllama(systemPrompt: string, userMessage: string, context: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const prompt = `<|im_start|>system
${systemPrompt}
Données de la machine :
${context}<|im_end|>
<|im_start|>user
${userMessage}<|im_end|>
<|im_start|>assistant
`;

    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        options: { temperature: 0.2, num_predict: 350 }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    if (!response.ok) return null;
    const data: any = await response.json();
    const content = data?.response?.trim();
    if (content && content.length > 20 && !content.includes('Je suis désolé, mais je ne peux pas')) {
      return content;
    }
    return null;
  } catch (err: any) {
    console.error('[RAG] Ollama error:', err.message);
    return null;
  }
}

// ─── Main RAG Engine Entrypoint ───────────────────────────────────────────────

export async function queryRagEngine(query: string, role: string, machineCode?: string): Promise<RagResponse> {
  const targetCode = machineCode || 'TX-1250-A';

  // 1. Fetch real DB data
  const [machine, spareParts, chunks] = await Promise.all([
    prisma.machine.findFirst({
      where: { OR: [{ code: targetCode }, { id: targetCode }] },
      include: {
        productionLine: true,
        components: true,
        alarms: { where: { status: 'ACTIVE' }, take: 3, orderBy: { timestamp: 'desc' } },
        telemetry: { orderBy: { timestamp: 'desc' }, take: 1 }
      }
    }),
    prisma.sparePart.findMany({ orderBy: { quantityInStock: 'asc' } }),
    prisma.knowledgeChunk.findMany({ take: 5, include: { document: true } })
  ]);

  const t = machine?.telemetry?.[0];
  const vibRms = t?.vibRMS ?? 11.2;
  const tempBearing = t?.tempBearing ?? 62.5;
  const speedRpm = t?.speedRpm ?? 1450;
  const healthScore = machine?.healthScore ?? 22.0;
  const rulDays = machine?.predictedRulDays ?? 18;
  const isCritical = vibRms > 4.5 || machine?.status === 'CRITICAL';
  const severity: ExtractedProblem['severity'] = isCritical ? 'CRITICAL' : vibRms > 2.8 ? 'HIGH' : 'LOW';
  const isoZone: ExtractedProblem['iso_zone'] = isCritical ? 'ZONE_D' : vibRms > 2.8 ? 'ZONE_C' : 'ZONE_A';

  // Find exact SKF 6208 bearing part
  const bearingPart = spareParts.find(p => p.partNumber.includes('6208') || p.name.includes('Bearing')) || {
    partNumber: 'SP-BRG-6208-SKF',
    name: 'SKF High-Precision Deep Groove Ball Bearing 6208-2RS / C3',
    quantityInStock: 6,
    location: 'Warehouse Shelf B-12'
  };

  // 2. Classify Query Intent
  const intent = classifyQueryIntent(query, machine, { vibRMS: vibRms });

  let finalAnswer: string;
  let activeAiEngine: string;
  let includeProductActions = false;

  if (intent === 'GREETING') {
    finalAnswer = handleGreeting(role, targetCode, isCritical, vibRms);
    activeAiEngine = 'MAINTIX Copilot Welcome';
    includeProductActions = false;
  } else if (intent === 'OFF_TOPIC') {
    finalAnswer = handleOffTopic(query, role, targetCode, isCritical, vibRms);
    activeAiEngine = 'MAINTIX Industrial Scope Guard';
    includeProductActions = false;
  } else if (intent === 'CONTRADICTION') {
    finalAnswer = handleFactCorrection(
      query,
      role,
      machine,
      { vibRMS: vibRms, tempBearing, speedRpm },
      bearingPart
    );
    activeAiEngine = 'MAINTIX Fact-Verification & Guidance Engine';
    includeProductActions = true;
  } else {
    // 3. Technical Query: call Ollama LLM with context
    const context = await buildMachineContext(targetCode, machine, spareParts, chunks);
    const systemPrompt = buildSystemPrompt(role);
    const llmAnswer = await callOllama(systemPrompt, query, context);

    if (llmAnswer) {
      finalAnswer = llmAnswer;
      activeAiEngine = `Ollama (${OLLAMA_MODEL})`;
    } else {
      finalAnswer = isCritical
        ? `Diagnostic pour ${machine?.name || targetCode} :\n• Niveau vibratoire réel : ${vibRms.toFixed(1)} mm/s RMS (Seuil ISO 10816-3 Zone D critique > 4.5 mm/s — DÉPASSÉ)\n• Température palier : ${tempBearing.toFixed(1)} °C\n• Diagnostic IA : Écaillage stade 3 piste externe roulement palier gauche.\n• RUL estimé : ${rulDays} jours restants.\n• Action requise : Remplacement par ${bearingPart.name} (${bearingPart.partNumber}) disponible au magasin (Stock : ${bearingPart.quantityInStock} unités).`
        : `Machine ${targetCode} en fonctionnement nominal (Vibration: ${vibRms.toFixed(1)} mm/s, Température: ${tempBearing.toFixed(1)} °C). Aucune anomalie critique.`;
      activeAiEngine = 'MAINTIX Grounded Synthesis';
    }
    includeProductActions = true;
  }

  // 4. Structured Extracted Problem (only attached when relevant)
  const extractedProblem: ExtractedProblem = {
    machine_code: targetCode,
    fault_type: isCritical ? 'BEARING_WEAR' : 'NORMAL_OPERATION',
    subsystem: 'Palier Arbre Principal (Roulement Gauche)',
    severity,
    iso_zone: isoZone,
    urgency: isCritical ? 'Immédiate (< 24 Heures)' : 'Planifiée sous 14 Jours',
    symptoms: [
      `Vibration RMS mesurée à ${vibRms.toFixed(1)} mm/s (${isCritical ? 'Seuil critique ISO 10816-3 Zone D dépassé' : 'Normal'})`,
      `Température palier à ${tempBearing.toFixed(1)} °C (Seuil alerte: 55.0°C)`,
      `Indice de santé actif : ${healthScore.toFixed(1)}/100 (RUL: ${rulDays} jours)`
    ],
    rul_days: rulDays,
    confidence: isCritical ? 0.95 : 0.98,
    required_spare_part: {
      part_number: bearingPart.partNumber,
      name: bearingPart.name,
      stock_available: bearingPart.quantityInStock,
      location: (bearingPart as any).location || 'Warehouse Shelf B-12',
      lubricant: 'SKF LGMT 3 Graisse Synthétique Haute Température (15g)'
    },
    estimated_downtime_hours: 2.0,
    avoided_loss_usd: 24650.0,
    work_order_draft: {
      title: `[${severity}] Remplacement Palier Roulement Arbre Principal - ${targetCode}`,
      machine_code: targetCode,
      target_subsystem: 'Palier Arbre Principal (Roulement Gauche)',
      fault_type: 'BEARING_WEAR',
      priority: isCritical ? 'URGENT' : 'MEDIUM',
      estimated_duration_hours: 2.0,
      assigned_role: 'Technicien de Maintenance Mécanique',
      required_parts: [{
        part_number: bearingPart.partNumber,
        name: bearingPart.name,
        quantity: 1,
        location: (bearingPart as any).location || 'Warehouse Shelf B-12',
        in_stock: bearingPart.quantityInStock
      }],
      required_lubricant: 'SKF LGMT 3 Graisse Synthétique Haute Température (15g)',
      procedure_steps: [
        `1. Consignation LOTO machine ${targetCode} (coupure disjoncteur 400V + cadenas)`,
        `2. Démonter le carter de protection et extraire le roulement défectueux à l'extracteur mécanique`,
        `3. Monter la pièce neuve ${bearingPart.name} (${bearingPart.partNumber}) chauffée à induction (110°C)`,
        `4. Lubrifier avec 15g de graisse SKF LGMT 3 haute température`,
        '5. Contrôler le faux-rond radial au comparateur (Tolérance ≤ 0.02 mm)',
        '6. Essai de rotation à vide 15 min — valider vibration < 1.4 mm/s RMS'
      ],
      safety_instructions: 'EPI requis : Gants anti-coupure, lunettes de protection, chaussures S3. Procédure LOTO obligatoire.'
    },
    product_actions: [
      {
        action_id: 'CREATE_WORK_ORDER',
        label: 'Créer & Assigner Ordre de Travail GMAO',
        type: 'PRIMARY',
        payload: {
          machineId: targetCode,
          machine_code: targetCode,
          title: `[${severity}] Remplacement Palier Roulement Arbre Principal - ${targetCode}`,
          description: `Intervention Copilot IA. Vibration: ${vibRms.toFixed(1)} mm/s RMS (Zone D). Pièce: ${bearingPart.name}.`,
          priority: isCritical ? 'URGENT' : 'HIGH',
          procedure_steps: [
            `Remplacer ${bearingPart.name} (${bearingPart.partNumber})`,
            'Appliquer 15g graisse SKF LGMT 3',
            'Contrôler faux-rond au comparateur ≤ 0.02 mm'
          ]
        }
      },
      {
        action_id: 'RESERVE_SPARE_PART',
        label: `Réserver Roulement SKF 6208 (Stock: ${bearingPart.quantityInStock})`,
        type: 'SECONDARY',
        payload: {
          part_number: bearingPart.partNumber,
          part_name: bearingPart.name,
          quantity: 1,
          location: (bearingPart as any).location || 'Warehouse Shelf B-12'
        }
      },
      {
        action_id: 'THROTTLE_MACHINE',
        label: `Appliquer Consigne Automate (-15% Cadence sur ${targetCode})`,
        type: 'WARNING',
        payload: {
          machine_code: targetCode,
          target_speed_rpm: 1250,
          reason: 'Protection mécanique du palier avant intervention de remplacement'
        }
      }
    ]
  };

  // 5. Sources
  const sources = chunks.length > 0
    ? chunks.slice(0, 3).map((c: any) => ({
        title: c.document?.title || 'Manuel Technique & SOP',
        snippet: c.content?.substring(0, 180) || ''
      }))
    : [
        {
          title: `${machine?.model || 'OptiMax-i 1250'} Manuel de Maintenance (ISO 10816-3)`,
          snippet: 'Vibration > 4.5 mm/s RMS (Zone D) indique un écaillage critique de la piste de roulement — intervention sous 24h recommandée.'
        },
        {
          title: 'PROC-BRG-01 : Remplacement Roulement Arbre Principal',
          snippet: 'Procédure LOTO 400V. Chauffage à induction 110°C, graisse SKF LGMT 3. Contrôle faux-rond radial ≤ 0.02 mm.'
        }
      ];

  const recommendedActions = includeProductActions && isCritical
    ? [
        `Remplacer le roulement ${bearingPart.name} (${bearingPart.partNumber})`,
        'Consigner la machine en LOTO (disjoncteur 400V)',
        'Contrôler le faux-rond au comparateur (≤ 0.02 mm)',
        'Créer l\'Ordre de Travail GMAO prioritaire'
      ]
    : [
        `Surveiller la télémétrie de la machine ${targetCode}`,
        'Poser une question technique sur les vibrations ou pièces',
        'Consulter le journal des alarmes actives'
      ];

  return {
    answer: finalAnswer,
    confidence: isCritical ? 0.95 : 0.98,
    sources: includeProductActions ? sources : [],
    evidence: includeProductActions ? [
      `Vibration RMS mesurée: ${vibRms.toFixed(1)} mm/s (${isCritical ? 'CRITIQUE — Dépassement Zone D ISO 10816-3' : 'NORMAL'})`,
      `Température palier: ${tempBearing.toFixed(1)}°C (Seuil d'alerte: 55.0°C)`,
      `Indice de santé: ${healthScore.toFixed(0)}/100 | Durée de vie résiduelle: ${rulDays} jours`,
      `Pièce magasin: ${bearingPart.name} (Stock: ${bearingPart.quantityInStock} unités)`
    ] : [],
    recommendedActions,
    activeAiEngine,
    extractedProblem: includeProductActions ? extractedProblem : undefined,
    productActions: includeProductActions ? extractedProblem.product_actions : []
  };
}
