function checkUserContradiction(query, machine, liveTel) {
  const q = query.toLowerCase();
  const isCritical = (liveTel.vibRMS > 4.5) || (machine.status === 'CRITICAL');
  
  // Contradiction signals: user says machine is fine / low vibration / speed up when critical
  const thinksHealthy = q.includes('va bien') || q.includes('très bien') || q.includes('parfait') || q.includes('faible') || q.includes('normal') || q.includes('aucun problème') || q.includes('pas de problème');
  const wantsSpeedUp = q.includes('augmenter') || q.includes('monter la cadence') || q.includes('forcer') || q.includes('à fond') || q.includes('accélérer') || q.includes('plus vite');
  const wrongNumber = (q.includes('0.') || q.includes('1.') || q.includes('2.')) && isCritical;

  if (isCritical && (thinksHealthy || wantsSpeedUp || wrongNumber)) {
    return `⚠️ RECTIFICATION FACTUELLE IMPORTANTE :
Votre affirmation contredit les mesures réelles des capteurs de la machine ${machine.code} :
• Niveau vibratoire réel : ${liveTel.vibRMS.toFixed(1)} mm/s RMS (Seuil ISO 10816-3 Zone D critique > 4.5 mm/s dépassé).
• Température palier : ${liveTel.tempBearing.toFixed(1)} °C (Seuil d'alerte : 55.0 °C).
• Statut machine : CRITIQUE (Écaillage stade 3 roulement de palier gauche).
• Danger : Augmenter la cadence ou ignorer ce niveau vibratoire provoquerait la casse immédiate de l'arbre principal (+24 650 $ de pertes).

👉 DÉMARCHE CORRECTE À SUIVRE :
1. Ne pas augmenter la cadence — Appliquer la consigne automate de réduction (-15% à 1250 RPM).
2. Créer l'Ordre de Travail GMAO pour intervention sous 24h.
3. Réserver le roulement SKF 6208-2RS au magasin (Rayon B-12, Stock : 6 unités).
4. Procéder à la consignation LOTO 400V avant tout démontage.`;
  }
  return null;
}

const query = 'La machine TX-1250-A va très bien, la vibration est faible (0.8 mm/s), on peut monter la cadence à 2000 RPM ?';
const machine = { code: 'TX-1250-A', status: 'CRITICAL' };
const tel = { vibRMS: 11.2, tempBearing: 62.5 };

const result = checkUserContradiction(query, machine, tel);
console.log('CONTRADICTION DETECTED:', !!result);
console.log(result);
