/**
 * Crée ou met à jour les Products + Prices Stripe pour les plans ECOPYE Pro Chantier.
 * Idempotent : utilise les lookup_keys pour retrouver les Prices existants.
 *
 * Usage :
 *   STRIPE_SECRET_KEY=sk_live_... npx tsx scripts/setup-stripe-products.ts
 */

import Stripe from 'stripe'
import { PLANS } from '../lib/plans'

const key = process.env.STRIPE_SECRET_KEY
if (!key) {
  console.error('STRIPE_SECRET_KEY manquant')
  process.exit(1)
}
const stripe = new Stripe(key)

async function ensureProductAndPrice(plan: (typeof PLANS)[keyof typeof PLANS]) {
  // 1. Cherche un Price existant par lookup_key (mécanisme idempotent de Stripe)
  const existing = await stripe.prices.list({
    lookup_keys: [plan.lookupKey],
    active: true,
    limit: 1,
  })

  if (existing.data.length > 0) {
    const price = existing.data[0]
    console.log(`  ✓ ${plan.name} déjà configuré — price=${price.id}`)
    return price.id
  }

  // 2. Créé un nouveau Product
  const product = await stripe.products.create({
    name: `ECOPYE Pro Chantier — ${plan.name}`,
    description: plan.description,
    metadata: { plan_key: plan.key },
  })

  // 3. Créé un nouveau Price récurrent mensuel attaché au Product, avec lookup_key
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: plan.priceMonthly * 100, // en centimes
    currency: plan.currency,
    recurring: { interval: 'month' },
    lookup_key: plan.lookupKey,
    metadata: { plan_key: plan.key },
  })

  console.log(`  + ${plan.name} créé — product=${product.id} price=${price.id}`)
  return price.id
}

async function main() {
  console.log('Configuration des plans Stripe…\n')
  for (const plan of Object.values(PLANS)) {
    await ensureProductAndPrice(plan)
  }
  console.log('\n✓ Setup terminé')
}

main().catch((e) => {
  console.error('Erreur :', e.message)
  process.exit(1)
})
