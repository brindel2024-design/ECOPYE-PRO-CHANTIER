export type PlanKey = 'STARTER' | 'PRO' | 'PREMIUM'

export interface Plan {
  key: PlanKey
  name: string
  priceMonthly: number
  currency: 'eur'
  lookupKey: string
  description: string
  features: string[]
  highlight?: boolean
}

export const TRIAL_DAYS = 14

export const PLANS: Record<PlanKey, Plan> = {
  STARTER: {
    key: 'STARTER',
    name: 'Starter',
    priceMonthly: 19,
    currency: 'eur',
    lookupKey: 'ecopye_pro_starter_monthly',
    description: "L'essentiel pour démarrer son activité d'artisan",
    features: [
      "Jusqu'à 10 chantiers actifs",
      "Jusqu'à 50 clients",
      'Devis & factures illimités',
      'Photos chantier (jusqu’à 100 par mois)',
      'Copilote IA basique',
      'Support par email',
    ],
  },
  PRO: {
    key: 'PRO',
    name: 'Pro',
    priceMonthly: 39,
    currency: 'eur',
    lookupKey: 'ecopye_pro_pro_monthly',
    description: 'Pour les artisans qui veulent passer à la vitesse supérieure',
    features: [
      'Chantiers, clients et photos illimités',
      'Copilote IA avancé (modèle Claude Sonnet)',
      'Jusqu’à 3 utilisateurs dans l’entreprise',
      'Paiement carte Stripe pour vos clients',
      'Rapports PDF personnalisés',
      'Support prioritaire',
    ],
    highlight: true,
  },
  PREMIUM: {
    key: 'PREMIUM',
    name: 'Premium',
    priceMonthly: 79,
    currency: 'eur',
    lookupKey: 'ecopye_pro_premium_monthly',
    description: 'Pour les structures établies, multi-équipes',
    features: [
      'Tout ce qui est inclus dans Pro',
      'Utilisateurs et techniciens illimités',
      'API access pour intégrations',
      'Customisation des PDF (logo, couleurs)',
      'Support téléphonique dédié',
      'Account manager personnel',
    ],
  },
}

export const PLAN_ORDER: PlanKey[] = ['STARTER', 'PRO', 'PREMIUM']

export function getPlan(key: string | null | undefined): Plan {
  if (key && key in PLANS) return PLANS[key as PlanKey]
  return PLANS.STARTER
}
