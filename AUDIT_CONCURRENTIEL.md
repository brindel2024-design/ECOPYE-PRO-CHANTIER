# Audit concurrentiel fonctionnel — ECOPYE Pro Chantier

> Comparaison vs **Costructor, Obat, Batappli, Extrabat**.
> Objectif : ne pas copier le marché ni casser les prix, mais faire d'ECOPYE
> **l'outil bâtiment spécialisé dans la preuve chantier, la conformité et la
> prévention des litiges**.
>
> ⚠️ Méthode : la colonne ECOPYE reflète l'état **réel du code**. Les colonnes
> concurrents sont basées sur une connaissance générale du marché et doivent être
> **vérifiées** (démos, sites éditeurs) avant toute communication publique.

---

## 1. Positionnement

**Les 4 concurrents** sont des suites « devis-factures BTP » matures : bibliothèque
d'ouvrages, situations, export comptable, CRM/planning pour certains. Ils se battent
sur l'exhaustivité et le prix. Vouloir les rattraper poste par poste serait long et
sans avantage défensif.

**Angle ECOPYE (à tenir) :** *« Le logiciel des artisans qui protège vos chantiers,
vos paiements et vos preuves client. »* — la **preuve**, la **conformité** et
l'**anti-litige** comme cœur produit, là où les autres traitent ces sujets en option.

---

## 2. Matrice fonctionnelle (synthèse)

Légende : ✅ présent · 🟡 partiel · ❌ absent · ❓ à vérifier (concurrents)

| Domaine | ECOPYE (réel) | Costructor | Obat | Batappli | Extrabat |
|---|---|---|---|---|---|
| Devis / factures | ✅ | ✅ | ✅ | ✅ | ✅ |
| Bibliothèque d'ouvrages + prix perso | ❌ | ✅❓ | ✅❓ | ✅❓ | ✅❓ |
| Factures de situation | 🟡 (types ACOMPTE/INTERMEDIAIRE/FINALE) | ✅❓ | ✅❓ | ✅❓ | ✅❓ |
| Avoirs | 🟡 (type AVOIR existe, flux à finaliser) | ✅❓ | ✅❓ | ✅❓ | ✅❓ |
| Retenue de garantie | ❌ | ❓ | ✅❓ | ✅❓ | ❓ |
| Calcul de rentabilité chantier | ❌ | 🟡❓ | ❓ | ❓ | 🟡❓ |
| Export comptable / accès expert-comptable | ❌ | ❓ | ✅❓ | ✅❓ | ✅❓ |
| Facturation électronique (Factur-X / PDP) | ❌ (à préparer) | en cours❓ | en cours❓ | en cours❓ | en cours❓ |
| Signature électronique des devis | ❌ | ❓ | ✅❓ | ❓ | ✅❓ |
| Portail client | 🟡 (route `/client-portal/[token]`) | ❓ | 🟡❓ | ❓ | ✅❓ |
| Suivi de chantier + photos | ✅ | 🟡❓ | ❓ | ❓ | ✅❓ |
| **Dossier preuve anti-litige** | 🟡 (briques: photos, projets) | ❌ | ❌ | ❌ | ❌ |
| **Check-list preuves manquantes** | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Copilote IA de sécurisation** | 🟡 (IA brouillons) | ❌ | ❌ | ❌ | ❌ |
| Réception de chantier + réserves | ❌ | ❓ | ❓ | ❓ | ❓ |
| Paiement en ligne client (Stripe) | ✅ | ❓ | ❓ | ❓ | ❓ |
| Mentions légales / contrôles avant PDF | 🟡 (mentions PDF, modèles légaux) | ❓ | ✅❓ | ✅❓ | ✅❓ |

**Lecture :** ECOPYE est déjà au niveau sur devis/factures/paiement/photos, **en retard**
sur bibliothèque d'ouvrages, rentabilité, export compta, e-invoicing, signature — et
**seul à pouvoir prendre une vraie avance** sur les 3 lignes en gras (preuve, check-list,
IA de sécurisation), que personne ne traite frontalement.

---

## 3. État réel d'ECOPYE (base de départ, dans le code)

- **Devis** : création, lignes, TVA (20/10/5,5 avec avertissement), acompte, brouillon,
  édition brouillon, PDF, expiration (`expiresAt`). Numérotation par entreprise.
- **Factures** : types ACOMPTE/INTERMEDIAIRE/FINALE/AVOIR, échéance, relance email,
  PDF avec mentions légales, paiement Stripe client, vue mobile en cartes.
- **Chantiers** : étapes, dates (sélecteur Jour/Mois/Année fiabilisé), budget prévu,
  progression, **photos preuves** (modèle `PhotoProof`).
- **IA** : Copilote OpenRouter (modèle gratuit), règles anti-invention de données légales.
- **Légal** : pages mentions/CGU/CGV/confidentialité (modèles), pied de page PDF avec
  pénalités L.441-10, indemnité 40 €, assurance, franchise TVA 293 B.
- **Abonnement** : Stripe (essai 14 j), plans Starter/Pro/Premium.
- **Portail client** : route `/client-portal/[token]` existante (à étoffer).

Ces briques rendent la différenciation **réaliste** : la « preuve chantier » s'appuie
sur des photos déjà modélisées ; l'« IA de sécurisation » sur le Copilote déjà branché.

---

## 4. Feuille de route priorisée

### P0 — Conformité & blocages (à faire avant d'ouvrir en grand)

**P0.1 — Préparer la facturation électronique française**
- Calendrier (officiel) : **réception obligatoire pour toutes les entreprises au
  01/09/2026** ; **émission obligatoire PME/TPE/micro au 01/09/2027** (grandes
  entreprises & ETI : émission au 01/09/2026).
- Exigences techniques : formats **structurés du socle** — **Factur-X** (PDF/A-3 +
  XML CII embarqué), **UBL**, **CII** ; transmission via une **PDP (Plateforme de
  Dématérialisation Partenaire) agréée** ; **e-reporting** (transactions B2C / hors
  France) en complément.
- Plan ECOPYE :
  1. **Génération Factur-X dès maintenant** : enrichir le PDF facture d'un XML CII
     embarqué (PDF/A-3). C'est faisable sans PDP et prépare le terrain.
  2. **Modèle de données** : compléter les champs obligatoires (SIRET émetteur **et**
     client, n° TVA, conditions de paiement, mentions, codes unités/TVA).
  3. **Intégration PDP** : choisir une plateforme agréée (ex. typologie : opérateurs
     de dématérialisation immatriculés) et brancher API d'émission/réception.
  4. **Réception** : prévoir l'ingestion de factures fournisseurs au format structuré.
- ⚠️ **Communication** : ne **rien** afficher comme « conforme » / « facturation
  électronique » tant que la PDP n'est pas réellement intégrée et testée.

**P0.2 — Signature électronique des devis**
- Permettre au client de **signer le devis en ligne** (depuis le portail) :
  horodatage, traçabilité (IP, date, identité déclarée), case « bon pour accord »,
  archivage de la version signée (PDF figé + preuve).
- Démarrer en **signature simple** (suffisante juridiquement pour un devis BTP B2C/B2B
  courant), évolutif vers un prestataire eIDAS si besoin de niveau avancé.
- S'appuie sur le portail client (P-diff 11).

**P0.3 — Mentions légales & contrôles obligatoires avant PDF/envoi**
- **Compléter les mentions réelles** (raison sociale, SIRET, TVA, assurance décennale,
  médiateur conso) — données client + validation juriste.
- **Contrôles bloquants avant émission** : refuser/avertir si SIRET manquant, assurance
  manquante, TVA non vérifiée, mentions obligatoires absentes (le pied de page PDF gère
  déjà « DOCUMENT INCOMPLET » → en faire un **garde-fou actif** à l'envoi).

**P0.4 — Affichage mobile des factures à 390 px**
- ✅ Déjà repris (liste factures en cartes). **Reverifier** sur la fiche facture détail
  et l'aperçu PDF à 390 px, puis clore définitivement.

### P1 — Parité marché (rattraper sans surenchère)

**P1.5 — Bibliothèque d'ouvrages métier + prix personnalisables**
- Catalogue d'ouvrages/prestations réutilisables (libellé, unité, prix HT, TVA, main
  d'œuvre/fourniture), **modifiable par l'artisan**, insertion en 1 clic dans un devis.
- Pré-remplir par métier (les modèles devis actuels deviennent une base de catalogue).

**P1.6 — Calcul de rentabilité chantier**
- Par chantier : **matériaux + temps (main d'œuvre) + sous-traitance + frais** →
  coût de revient, **marge** et **bénéfice** vs montant facturé. Tableau de bord par
  chantier (le modèle `Project` a déjà budget prévu/réel).

**P1.7 — Export comptable / accès expert-comptable**
- Export **FEC**/CSV des factures & encaissements, et/ou **accès lecture** dédié
  expert-comptable. Brancher éventuellement un format compatible logiciels compta.

**P1.8 — Situations, avoirs, retenue de garantie**
- **Situations** : facturation à l'avancement (% ou montant par étape de chantier).
- **Avoirs** : finaliser le flux (type AVOIR déjà présent) avec impact sur le solde.
- **Retenue de garantie** : 5 % retenus, échéance de libération, suivi.

### Différenciation ECOPYE (l'avantage défendable)

**D9 — Dossier preuve anti-litige** *(cœur de la promesse)*
- Par chantier : photos **avant / pendant / après** horodatées + géoloc optionnelle,
  documents (devis signé, bons, échanges), **validation client**, **export PDF unique**
  « dossier de preuve » daté et structuré. S'appuie sur `PhotoProof`.

**D10 — Check-list intelligente des preuves manquantes**
- Détecte ce qui manque pour être protégé : « pas de photo avant », « devis non signé »,
  « réception sans réserves enregistrées », « facture sans preuve de livraison »…
  Score de « protection du chantier ».

**D11 — Portail client sécurisé** *(route déjà amorcée)*
- Lien sécurisé (token) : **signature du devis**, **paiement de l'acompte** (Stripe déjà
  en place), **suivi partagé** (avancement, photos), **validation de réception**.

**D12 — Réception de chantier avec réserves**
- PV de réception : réserves listées + **photos des réserves**, signature client,
  date de levée des réserves, génération PDF du PV.

**D13 — Copilote IA de sécurisation** *(transformer l'IA existante)*
- Avant tout envoi : l'IA **signale les risques** — mentions légales manquantes, **TVA à
  vérifier**, **preuves absentes**, devis non signé, incohérences. Passe d'« assistant de
  rédaction » à **« assistant de sécurisation / anti-litige »** — différenciant fort,
  cohérent avec les règles anti-invention déjà en place.

---

## 5. Séquencement conseillé

1. **P0.4** (clore mobile) + **P0.3** (contrôles avant envoi) → rapides, crédibilité.
2. **P0.2 signature devis** + **D11 portail** → font levier ensemble (signature = dans le portail).
3. **D9 dossier preuve** + **D10 check-list** + **D13 IA sécurisation** → la différenciation, à pousser tôt car c'est l'argument de vente unique.
4. **P0.1 Factur-X** (génération) maintenant ; **intégration PDP** planifiée pour tenir 09/2026 (réception) → 09/2027 (émission).
5. **P1.5 → P1.8** en continu pour la parité (bibliothèque, rentabilité, export compta, situations).

---

## 6. Garde-fous marketing (à respecter)

- Promesse : *« protège vos chantiers, vos paiements et vos preuves client »* — vendable
  **dès aujourd'hui** car adossée à des fonctions réelles (photos, paiement, portail).
- **Ne jamais** afficher « conforme facturation électronique » / « certifié » avant
  intégration PDP **opérationnelle et testée**. Utiliser au mieux « **compatible
  Factur-X / en préparation pour la réforme 2026-2027** » une fois la génération en place.
- Pas de promesse de conformité juridique sans validation par un professionnel du droit.
