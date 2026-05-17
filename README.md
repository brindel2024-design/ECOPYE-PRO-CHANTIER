# ECOPYE Pro Chantier

> **Devis, chantier, photos, factures et paiements dans une seule application.**
> Le SaaS vertical pour les artisans et PME du BTP français.

---

## Présentation

ECOPYE Pro Chantier est un SaaS B2B complet destiné aux artisans et petites entreprises du bâtiment (plombiers, électriciens, maçons, carreleurs, peintres, menuisiers, etc.).

**Stack technique :**
- Next.js 14 (App Router)
- TypeScript strict
- Tailwind CSS
- Prisma ORM + PostgreSQL
- NextAuth v4 (JWT)
- Recharts

> ⚠️ **Mode démonstration** — Toutes les données sont fictives. Aucun paiement réel n'est effectué.

---

## Démarrage rapide

```bash
cd C:\Users\brindel2024\ECOPYE-PRO-CHANTIER

# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement
cp .env.example .env.local
# Éditer .env.local avec vos valeurs

# 3. Lancer en développement
npm run dev
```

Accéder à : http://localhost:3001

---

## Compte de démonstration

| Champ | Valeur |
|-------|--------|
| Email | `jean.durand@durand-renovation.fr` |
| Mot de passe | `password123` |
| Rôle | Propriétaire (OWNER) |
| Entreprise | Durand Rénovation Services — Lyon |

**Admin ECOPYE :**
- Email : `admin@ecopye.fr`
- Mot de passe : `admin123`
- Accès : `/admin`

---

## Variables d'environnement

Créer `.env.local` :

```env
# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/ecopye_pro"

# NextAuth
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="your-secret-here-32-chars-min"

# Port (optionnel)
PORT=3001
```

---

## Structure du projet

```
ECOPYE-PRO-CHANTIER/
├── app/
│   ├── (app)/                    # Pages protégées (artisan connecté)
│   │   ├── dashboard/            # Tableau de bord
│   │   ├── clients/              # Gestion clients
│   │   ├── quotes/               # Devis (liste, création, détail)
│   │   ├── projects/             # Chantiers (liste, détail + timeline)
│   │   ├── photos/               # Photos avant/pendant/après
│   │   ├── schedule/             # Planning hebdomadaire
│   │   ├── invoices/             # Factures
│   │   ├── payments/             # Simulateur de paiement
│   │   ├── treasury/             # Trésorerie & prévisionnel
│   │   ├── documents/            # Documents & conformité
│   │   ├── library/              # Bibliothèque technique
│   │   ├── ai/                   # Copilote IA
│   │   ├── settings/             # Paramètres entreprise
│   │   └── onboarding/           # Wizard d'onboarding
│   ├── (auth)/                   # Pages publiques auth
│   │   ├── login/
│   │   └── register/
│   ├── admin/                    # Interface admin ECOPYE
│   │   ├── page.tsx              # Dashboard admin
│   │   └── companies/            # Liste des entreprises
│   ├── client-portal/[token]/    # Portail client (lien magique)
│   ├── api/                      # Routes API REST
│   │   ├── auth/                 # NextAuth
│   │   ├── clients/
│   │   ├── companies/
│   │   ├── dashboard/
│   │   ├── invoices/
│   │   ├── payments/simulate/
│   │   ├── projects/
│   │   └── quotes/
│   ├── pricing/                  # Page tarifs publique
│   └── page.tsx                  # Landing page
├── components/
│   ├── ui/                       # Composants UI de base
│   ├── charts/                   # Recharts (Revenue, QuoteRate)
│   ├── Sidebar.tsx
│   ├── Topbar.tsx
│   ├── StatCard.tsx
│   ├── EmptyState.tsx
│   └── StatusBadge.tsx
├── lib/
│   ├── mock-data.ts              # Toutes les données fictives
│   ├── types.ts                  # Types TypeScript + labels FR
│   ├── utils.ts                  # formatCurrency, formatDate, etc.
│   ├── auth.ts                   # Config NextAuth
│   └── db.ts                     # Client Prisma
├── prisma/
│   ├── schema.prisma             # 16 modèles, 24 enums
│   └── seed.ts                   # Données initiales
└── middleware.ts                 # Protection des routes
```

---

## Modules disponibles

| Module | Route | Description |
|--------|-------|-------------|
| Dashboard | `/app/dashboard` | KPIs, graphiques CA, alertes |
| Clients | `/app/clients` | Gestion + score de confiance |
| Devis | `/app/quotes` | Création avec Copilote IA |
| Chantiers | `/app/projects` | Timeline + budget + risques |
| Photos | `/app/photos` | Galerie avant/pendant/après |
| Planning | `/app/schedule` | Calendrier hebdomadaire équipe |
| Factures | `/app/invoices` | Facturation + suivi paiements |
| Paiements | `/app/payments` | Simulateur multi-méthodes |
| Trésorerie | `/app/treasury` | Prévisionnel 90 jours |
| Documents | `/app/documents` | Conformité + alertes expiration |
| Bibliothèque | `/app/library` | DTU, prix, fournisseurs |
| Copilote IA | `/app/ai` | 9 fonctions IA simulées |
| Paramètres | `/app/settings` | Entreprise, équipe, abonnement |
| Portail client | `/client-portal/{token}` | Vue client (lien magique) |
| Admin ECOPYE | `/admin` | Gestion plateforme |

---

## Données de démonstration

**Entreprise :** Durand Rénovation Services (Lyon, SIRET 82394710200013)

**Clients :** 8 clients fictifs (Lyon, Marseille, Paris, Toulouse, etc.)

**Chantiers actifs :**
- Rénovation SDB Marie Laurent — EN COURS (65%)
- Remplacement chaudière Ahmed Rahmani — PRÉPARATION
- Mise aux normes électrique Sophie Moreau — LITIGE POTENTIEL
- Pose carrelage Nadia Ferrand — EN ATTENTE ACOMPTE

**Devis :** 5 devis (DEV-2024-0001 à 0005)

**Factures :** 3 factures dont 1 en retard

---

## Plans tarifaires

| Plan | Prix | Cible |
|------|------|-------|
| Starter | 29 €/mois | Auto-entrepreneur |
| Pro | 79 €/mois | Artisan avec équipe |
| Premium | 149 €/mois | PME BTP |
| Entreprise | Sur devis | Grand compte |

Essai gratuit 14 jours — sans engagement — sans CB.

---

## Roadmap

- [ ] Signature électronique des devis (DocuSign)
- [ ] Intégration comptabilité (Pennylane, Sage)
- [ ] Application mobile (React Native)
- [ ] Paiement réel (Stripe Connect)
- [ ] Reconnaissance vocale sur chantier
- [ ] OCR factures fournisseurs

---

*ECOPYE Pro Chantier — © 2024 ECOPYE — Données fictives de démonstration*
