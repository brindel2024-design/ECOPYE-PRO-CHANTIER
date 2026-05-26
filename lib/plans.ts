export type PlanKey = 'STARTER' | 'PRO' | 'PREMIUM'
export type BillingPeriod = 'monthly' | 'yearly'

export interface Plan {
  key: PlanKey
  name: string
  /** Prix facturé au mois (engagement mensuel), en euros HT. */
  priceMonthly: number
  /** Prix facturé à l'année (engagement annuel), en euros HT. */
  priceYearly: number
  currency: 'eur'
  lookupKeyMonthly: string
  lookupKeyYearly: string
  description: string
  features: string[]
  highlight?: boolean
  badge?: string
}

export const TRIAL_DAYS = 14

export const PLANS: Record<PlanKey, Plan> = {
  STARTER: {
    key: 'STARTER',
    name: 'Starter',
    priceMonthly: 15,
    priceYearly: 144,
    currency: 'eur',
    lookupKeyMonthly: 'ecopye_pro_starter_monthly',
    lookupKeyYearly: 'ecopye_pro_starter_yearly',
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
    priceMonthly: 29,
    priceYearly: 288,
    currency: 'eur',
    lookupKeyMonthly: 'ecopye_pro_pro_monthly',
    lookupKeyYearly: 'ecopye_pro_pro_yearly',
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
    badge: 'Le choix des artisans',
  },
  PREMIUM: {
    key: 'PREMIUM',
    name: 'Premium',
    priceMonthly: 59,
    priceYearly: 588,
    currency: 'eur',
    lookupKeyMonthly: 'ecopye_pro_premium_monthly',
    lookupKeyYearly: 'ecopye_pro_premium_yearly',
    description: 'Pour les structures établies, multi-équipes',
    features: [
      'Tout ce qui est inclus dans Pro',
      'Jusqu’à 10 utilisateurs',
      'API access pour intégrations',
      'Customisation des PDF (logo, couleurs)',
      'Support téléphonique dédié',
      'Support prioritaire et session d’accompagnement',
    ],
  },
}

export const PLAN_ORDER: PlanKey[] = ['STARTER', 'PRO', 'PREMIUM']

export function getPlan(key: string | null | undefined): Plan {
  if (key && key in PLANS) return PLANS[key as PlanKey]
  return PLANS.STARTER
}

/** Prix mensuel équivalent quand on paie à l'année (arrondi). */
export function yearlyPerMonth(plan: Plan): number {
  return Math.round(plan.priceYearly / 12)
}

/** Prix facturé selon la période choisie. */
export function priceFor(plan: Plan, period: BillingPeriod): number {
  return period === 'yearly' ? plan.priceYearly : plan.priceMonthly
}

/** lookup_key Stripe selon la période choisie. */
export function lookupKeyFor(plan: Plan, period: BillingPeriod): string {
  return period === 'yearly' ? plan.lookupKeyYearly : plan.lookupKeyMonthly
}
