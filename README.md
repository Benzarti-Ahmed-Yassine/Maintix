# Maintix

Maintix est une plateforme de gestion et de supervision de machines industrielles. Elle rassemble le parc d'équipements, les données de capteurs, les alertes, l'assistance par IA et le suivi des interventions de maintenance.

> **À propos de la caméra :** elle sert à photographier la plaque signalétique pour aider à renseigner la fiche d'un équipement. Elle ne filme pas la machine en continu et ne remplace pas les capteurs utilisés pour la supervision.

## Fonctionnalités

### Parc et création des machines

- Ajouter une machine manuellement ou à partir d'une plaque signalétique photographiée.
- Utiliser le scanner de plaque lorsque l'écran, le navigateur et l'appareil le permettent ; l'import d'une image est également disponible dans les parcours concernés.
- Préremplir les informations lisibles de la plaque, telles que le constructeur, le modèle, le numéro de série et certaines caractéristiques nominales.
- Vérifier et corriger les informations extraites, compléter le code, le nom et l'emplacement, puis rattacher l'équipement à une ligne de production.
- Retrouver les équipements dans le parc et ouvrir leur vue de suivi.

Les informations extraites automatiquement doivent être vérifiées avant l'enregistrement. La reconnaissance peut dépendre de la qualité de l'image et du service configuré.

### Supervision, alertes et diagnostic

- Consulter les données disponibles pour une machine, notamment les mesures de vibration, de température, de courant et de vitesse.
- Afficher les indicateurs de santé, l'historique de télémétrie et les alertes lorsqu'ils sont disponibles.
- Recevoir des mises à jour en temps réel via WebSocket lorsque la connexion est active ; certaines vues peuvent afficher un instantané ou des données de démonstration.
- Examiner les diagnostics, les éléments justificatifs et les recommandations destinés à aider les équipes à évaluer une anomalie.

La supervision repose sur la télémétrie des capteurs et les intégrations configurées, pas sur la caméra du scanner de plaque. Une recommandation ou une estimation de l'IA ne constitue pas une garantie de panne ; les résultats doivent être vérifiés par une personne qualifiée.

### Copilote IA et maintenance

- Poser des questions en langage naturel au Copilote IA, avec un contexte de rôle, de machine et de télémétrie disponible.
- Consulter les réponses, sources, indices de confiance et actions recommandées retournés par le service IA.
- Créer et suivre des ordres de travail associés aux machines, avec description, priorité, affectation et état selon les données disponibles.
- Générer une checklist d'intervention assistée par IA, suivre les étapes, saisir des notes et enregistrer la cause constatée.
- Consulter les pièces de rechange, les plans de maintenance, les risques, l'historique et les exports disponibles.

Certaines actions proposées par l'IA peuvent modifier des données métier ou concerner la production. Vérifiez leur contenu, les autorisations et les intégrations avant de les exécuter.

### Notifications

Le service de notification peut enregistrer un message dans la base de données et le diffuser aux clients connectés par WebSocket. Il prévoit également l'envoi par courriel ou WhatsApp si les fournisseurs correspondants sont configurés. Un lien WhatsApp direct peut être proposé lorsque l'envoi automatisé n'est pas configuré.

La présence d'une notification dans l'application, la génération d'un lien et la livraison effective d'un courriel ou d'un message sont des résultats différents. La livraison externe dépend de la configuration du fournisseur et doit être vérifiée séparément.

### Rôles et espaces de travail

- **Technicien** : machines, inspections, capteurs, alertes, diagnostics et ordres de travail.
- **Responsable maintenance** : supervision maintenance, risques, plans, techniciens et historique des interventions.
- **Responsable production** : suivi des lignes, performances, qualité, ordres et arrêts de production.
- **Directeur industriel** : indicateurs, opérations, coûts et synthèses de direction.
- **Administrateur** : gestion du parc, des comptes, des intégrations et des outils de démonstration.

Les vues et permissions accessibles dépendent du rôle et de la configuration de l'application.

### Scénarios de démonstration

Le panneau administrateur permet d'illustrer des scénarios de télémétrie, notamment le fonctionnement normal, la dégradation d'un roulement, la surchauffe d'un moteur, une anomalie de vibration, une surintensité, une défaillance de capteur, une panne de machine et la récupération après maintenance.

Ces scénarios servent à la démonstration : ils ne doivent pas être présentés comme des mesures ou des incidents réels. Le dépôt comprend également un simulateur indépendant.

## Architecture du dépôt

```text
.
├── backend/             API Node.js/Express, Prisma, services IA et WebSocket
├── frontend/            Application web React, TypeScript et Vite
├── simulator/           Simulateur de télémétrie et intégration MQTT
├── firmware/            Projets firmware et passerelles de périphériques
├── ml/                  Modèles et outils de machine learning
├── data/                Données et ressources de démonstration
├── infrastructure/      Configuration Docker, supervision et déploiement
├── tests/               Tests et documentation de tests
├── docker-compose.yml   Orchestration des services
└── package.json         Workspaces et commandes racine npm
```

Le dépôt contient aussi des dossiers `apps/` avec des services et documents complémentaires. Les commandes npm de développement décrites ci-dessous utilisent les workspaces racine `frontend`, `backend` et `simulator`.

## Prérequis

- Node.js 18 ou ultérieur et npm.
- Une base SQLite, utilisée par défaut par le schéma Prisma.
- Docker et Docker Compose uniquement si vous choisissez le démarrage conteneurisé.

Certains services optionnels, comme l'analyse de plaque par IA, le Copilote IA, les notifications externes, MQTT ou des intégrations industrielles, nécessitent leurs propres variables d'environnement et services.

## Installation et configuration

Depuis la racine du dépôt :

```bash
npm install
```

Configurez les variables d'environnement locales à partir du modèle fourni, si nécessaire :

```powershell
Copy-Item .env.example .env
```

Complétez ensuite uniquement les variables nécessaires à votre environnement. En particulier, configurez `DATABASE_URL` pour Prisma et les URL des fournisseurs externes si vous souhaitez activer les notifications par courriel ou WhatsApp. Les variables préfixées `VITE_` sont utilisées par le frontend. Ne placez aucune vraie clé, aucun mot de passe ni identifiant privé dans le dépôt ou dans une variable `VITE_` : ces dernières peuvent être exposées au navigateur.

## Démarrage local

### Initialiser la base de données

Le schéma Prisma du backend utilise SQLite. Après avoir configuré `DATABASE_URL`, synchronisez le schéma et, si vous le souhaitez, chargez les données de démonstration :

```bash
npm run db:push --workspace=backend
npm run db:seed --workspace=backend
```

### Démarrer l'ensemble de développement

```bash
npm run dev
```

Cette commande démarre le backend, le frontend et le simulateur en parallèle. Le frontend utilise le proxy configuré par Vite pour accéder au backend ; l'API écoute par défaut sur le port `4000`.

Vous pouvez aussi démarrer les composants séparément dans des terminaux distincts :

```bash
npm run dev:backend
npm run dev:frontend
npm run dev:simulator
```

Le simulateur est facultatif. Pour une supervision réelle, configurez les capteurs, le broker et les intégrations adaptés à votre installation plutôt que de confondre les données simulées avec des mesures de production.

## Démonstration et développement

Le backend propose des commandes de démonstration supplémentaires :

```bash
npm run demo:scenario --workspace=backend
npm run demo:start --workspace=backend
npm run demo:stop --workspace=backend
```

Consultez les scripts du `backend/package.json` et la configuration locale avant de lancer un scénario ou le simulateur. Utilisez un environnement de démonstration pour toute donnée synthétique.

## Vérifications

Compiler les applications backend et frontend :

```bash
npm run build
```

Les manifestes backend et frontend ne définissent actuellement pas de script `test`. Les tests automatisés ne peuvent donc pas être lancés avec la commande racine `npm test` tant que ces scripts ne sont pas ajoutés.

## Sécurité et exploitation

- N'utilisez pas les paramètres de démonstration en production.
- Gardez les fichiers `.env` et les identifiants hors de Git ; utilisez des secrets configurés dans l'environnement de déploiement.
- Confirmez la disponibilité et la provenance des données avant de les interpréter comme des mesures en temps réel.
- Faites valider par un opérateur qualifié les recommandations d'IA et toute action pouvant influencer une machine ou une ligne de production.
- Configurez et testez séparément les fournisseurs de notification : leur absence signifie qu'une livraison externe n'est pas garantie.
- Pour la prise de photo, utilisez un contexte navigateur sécurisé et accordez l'autorisation de caméra uniquement si le parcours le requiert.

## Licence

Consultez le fichier [`LICENSE`](./LICENSE) pour les conditions d'utilisation et de distribution.
