function handleGreeting(role, targetCode, isCritical) {
  const roleName = role === 'INDUSTRIAL_DIRECTOR' ? 'Directeur Industriel' :
                   role === 'MAINTENANCE_MANAGER' ? 'Responsable Maintenance' :
                   role === 'PRODUCTION_MANAGER' ? 'Responsable Production' :
                   role === 'ADMIN' ? 'Administrateur' : 'Technicien';

  return `👋 Bonjour ! Je suis MAINTIX, votre copilote d'intelligence artificielle industrielle.

Je surveille en temps réel les équipements de l'usine, notamment la machine cible **${targetCode}** (Statut : ${isCritical ? '⚠️ ALERTE CRITIQUE — Vibration 11.2 mm/s RMS' : 'NORMAL'}).

En tant que **${roleName}**, voici ce que vous pouvez me demander :
• 🔍 *"Quel est le diagnostic actuel sur la machine ${targetCode} ?"*
• 🛠️ *"Quelle est la pièce requise au magasin et sa disponibilité ?"*
• 📋 *"Donne-moi la procédure de consignation LOTO et de remplacement."*
• ⚙️ *"Quel est l'impact sur le TRS et la cadence de production ?"*

Comment puis-je vous aider aujourd'hui ?`;
}

function handleOffTopic(query, role, targetCode) {
  return `⚠️ Demande non reconnue : "${query}"

Je suis **MAINTIX**, le copilote IA spécialisé dans la **maintenance prédictive et les opérations industrielles** de votre usine textile. 
Votre message ne semble pas correspondre à un besoin technique lié aux machines ou aux opérations de production.

💡 **Comment formuler votre besoin ?**
Pour analyser la machine **${targetCode}** ou vos équipements, vous pouvez par exemple demander :
• 📊 *"Analyse la vibration et la température sur ${targetCode}"*
• 🔧 *"Procédure de remplacement du roulement de palier"*
• 📦 *"Vérifier le stock de pièces détachées au magasin"*
• 📉 *"Estimation du RUL (durée de vie restante) et probabilité de panne"*

Posez-moi votre question technique et je vous guiderai étape par étape !`;
}

console.log('=== GREETING RESPONSE ===');
console.log(handleGreeting('TECHNICIAN', 'TX-1250-A', true));
console.log('\n=== OFF-TOPIC RESPONSE ===');
console.log(handleOffTopic('briquet', 'TECHNICIAN', 'TX-1250-A'));
