# État du projet ECOPYE Pro Chantier — point de reprise

> Document de reprise — résume tout ce qui a été fait sur ce stretch et ce qui
> reste à faire à votre retour. Voir aussi `AUDIT_CONCURRENTIEL.md` pour la
> stratégie produit (positionnement anti-litige / preuve / conformité).

## 1. Vue d'ensemble — tout est en production

L'**intégralité de la feuille de route P0/P1 + différenciation** est livrée et
déployée sur `https://pro.ecopye.fr`. Le Factur-X est validé par une PDP. Il ne
reste qu'à brancher les **clés sandbox Iopole** (à créer par vous) et à
renseigner vos **données légales réelles** pour passer en commercial 100 %.

## 2. Détail des fonctionnalités livrées

### Tarification (livrée)
- Tarifs : **Starter 15 € / Pro 29 € / Premium 59 €** mensuel
  (annuel 144 / 288 / 588, soit ~12/24/49 €/mois).
- Sélecteur **Mensuel / Annuel** sur `/pricing` + espace abonnement, badge
  « Le choix des artisans » sur Pro, mention « Tarifs fondateurs (12 mois) ».
- **Inscription sans carte** (essai 14 jours), `Stripe LIVE` pour les abonnements.
- Stripe migré : nouveaux prix actifs (lookup_keys transférés), anciens archivés.

### P0 — Conformité & blocages (livré ✅)
| # | Sujet | Implémentation |
|---|---|---|
| P0.3 | Contrôles bloquants avant envoi | `lib/api-helpers.ts` → `assertCompanyLegalReady()` appliqué à : envoi devis, relance facture, lien paiement facture. |
| P0.4 | Affichage mobile factures 390 px | Liste + fiche détail en cartes verticales. |
| P0.1 | Socle Factur-X | `lib/facturx.ts` — XML CII EN16931 + BT-23 (BusinessProcess A1) + champs B2B client (SIRET/TVA) + endpoint `/api/invoices/[id]/facturx` + carte UI. **Validé par le Validateur Iopole** (schéma + Schematron verts). |

### Différenciation anti-litige (livré ✅)
| # | Sujet | Implémentation |
|---|---|---|
| D13 | Copilote IA de **sécurisation avant envoi** | `lib/risk-checks.ts` + composant `PreSendCheck` sur fiches devis/facture. Signale bloquant / à vérifier / conseil. |
| D9/D10 | **Dossier de preuve** anti-litige + check-list | Photos avant/pendant/après horodatées + score de protection + check-list intelligente + **export PDF du dossier de preuve** (`lib/proof-pdf.ts`, `components/ProofDossier.tsx`). |
| D11 / P0.2 | **Signature électronique devis + portail client réel** | Token public sur le devis, page `/client-portal/[token]` reconstruite (plus de simulation), API `/api/portal/[token]` + `/sign` (signature horodatée + IP). Carte « Portail client » côté artisan. |
| D12 | **Réception de chantier avec réserves** | Modèle `Reserve`, champs réception sur `Project`, composant `ReceptionSection`, intégré au score de protection. |

### P1 — Parité marché (livré ✅)
| # | Sujet | Implémentation |
|---|---|---|
| P1.5 | **Bibliothèque d'ouvrages** | Modèle `CatalogItem`, onglet « Mes ouvrages » dans `/app/library`, insertion en 1 clic dans la création de devis. |
| P1.6 | **Rentabilité chantier** | Champs coûts (matériaux/MO/sous-traitance/frais) sur `Project`, endpoint `/api/projects/[id]/profitability`, composant `ProfitabilitySection` (coût/marge/bénéfice en € et %). |
| P1.7 | **Export comptable CSV** | `/api/accounting/export` (CSV `;` UTF-8 pour Excel FR), bouton sur la liste factures. |
| P1.8 | **Situations / avoirs / retenue de garantie** | Champ `retentionPct` sur Invoice (déduit du montant à payer), `situationPct` à la création depuis un devis (scale des lignes), type AVOIR ajouté. |

### Autres livrés
- **Icône PWA** (casque de chantier sur fond bleu + nom).
- Email réel via **Resend** : domaine `ecopye.fr` vérifié, expéditeur
  `pro.chantier@ecopye.fr` testé en envoi réel.
- Bandeau IA honnête (« brouillons à vérifier »), Copilote IA **gratuit**
  (modèles `:free` OpenRouter + repli auto).
- `AUDIT_CONCURRENTIEL.md` — positionnement vs Costructor/Obat/Batappli/Extrabat.

## 3. État de l'intégration Iopole (facturation électronique)

| Brique | Statut |
|---|---|
| Génération XML CII EN16931 + BT-23 | ✅ **validée par le Validateur Iopole** |
| Champs B2B client (SIRET / TVA) | ✅ |
| Connecteur auth OAuth2 client_credentials + `customer-id` | ✅ `lib/iopole.ts` |
| Cartographie des endpoints (émission, génération Factur-X, statuts, réception, annuaire) | ✅ |
| **Câblage final + test contre sandbox** | ⏳ **bloqué** sur vos **clés sandbox Iopole** |

### Ce que vous devez créer dans **Iopole Labs** (`labs.iopole.io`)
1. Créer un environnement **sandbox** (« Bac à sable »).
2. **Paramètres → Identifiant unique** → copier le **`customer-id`**.
3. **Clés API / Client OAuth** → créer un client → récupérer
   **`client_id`** + **`client_secret`** (le secret n'est affiché qu'une fois).
4. Dans la doc PPD (`docs.ppd.iopole.fr → Démarrage rapide`), repérer l'**URL
   token Keycloak** du PPD (du type
   `https://…ppd.iopole.fr/realms/iopole/protocol/openid-connect/token`).

### À votre retour, vous me transmettez les 4 valeurs ; je m'occupe de :
- Les placer en **variables d'environnement** sur le VPS
  (`IOPOLE_TOKEN_URL`, `IOPOLE_CLIENT_ID`, `IOPOLE_CLIENT_SECRET`,
  `IOPOLE_CUSTOMER_ID`, `IOPOLE_API_BASE=https://api.ppd.iopole.fr`).
- Câbler `emitInvoiceXml()` contre le sandbox + tester en réel.
- Brancher la **génération du Factur-X PDF/A-3** via
  `POST /v1/tools/facturx/generate` (la PDP fabrique le PDF, on n'a pas à le
  coder).
- Câbler **suivi des statuts** + **webhook** `/api/iopole/webhook` pour
  réception des événements de cycle de vie.
- Câbler la **réception** des factures fournisseurs (obligation 01/09/2026).

## 4. À votre retour — ce qui dépend uniquement de vous

1. **Clés sandbox Iopole** (ci-dessus) → me les transmettre, je branche.
2. **Mentions légales réelles** à compléter sur `/mentions-legales` et dans
   le profil entreprise (Paramètres) — j'attends de vous :
   raison sociale + forme juridique, SIRET, adresse du siège, n° TVA intracom.
   (ou mention art. 293 B), capital social, directeur de la publication,
   assurance décennale (assureur + n° police), médiateur de la consommation.
3. **Faire tourner les clés API** ayant circulé en clair (Stripe `sk_live_`,
   `whsec_`, Resend `re_`, OpenRouter `sk-or-v1-...`) par sécurité — c'est
   votre seule action sensible restante.

## 5. Comptes / accès / liens utiles

- App : <https://pro.ecopye.fr>
- Admin : <https://pro.ecopye.fr/admin> — compte `admin@ecopye.fr` /
  `admin123` ⚠️ **à changer dès que possible** (mot de passe par défaut).
- Dépôt git : `brindel2024-design/ECOPYE-PRO-CHANTIER` branche `master`.
- VPS : `187.124.53.4` (Hostinger), PM2 `ecopye-pro` sur port 3002, Nginx + Let's Encrypt.
- Resend : domaine `ecopye.fr` vérifié, expéditeur `pro.chantier@ecopye.fr`.
- Stripe : LIVE, prix mensuels (`ecopye_pro_*_monthly`) + annuels
  (`ecopye_pro_*_yearly`) en place.
- Iopole : `labs.iopole.io` (sandbox UI) ; docs PPD `docs.ppd.iopole.fr`,
  prod `docs.iopole.com` ; API PPD `https://api.ppd.iopole.fr`, prod
  `https://api.iopole.com`.

## 6. Commits clés de la session (sur `origin/master`)

- Tarifs mensuel/annuel + sélecteur + tarifs fondateurs.
- `feat(P0.3)` garde-fou légal centralisé avant envoi devis/facture.
- `feat(D13)` Copilote de sécurisation avant envoi.
- `feat(D9/D10)` dossier preuve + check-list + export PDF.
- `feat(P0.2/D11)` signature devis + portail client réel.
- `feat(D12)` réception de chantier avec réserves.
- `feat(P1.5/P1.6)` bibliothèque d'ouvrages + rentabilité chantier.
- `feat(P1.7/P1.8)` export comptable + retenue de garantie + situations + avoirs.
- `feat(P0.1)` socle Factur-X (XML CII + champs B2B + readiness).
- `fix(facturx)` profil EN16931, ajout BT-23 → **validé Iopole**.
- `feat(iopole)` connecteur auth OAuth2 + cartographie endpoints.
- `docs` `AUDIT_CONCURRENTIEL.md` + `ETAT_PROJET.md` (ce fichier).

À tout à l'heure.
