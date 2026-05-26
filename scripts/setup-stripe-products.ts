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

async function ensurePrice(
  productId: string,
  lookupKey: string,
  amountEuros: number,
  interval: 'month' | 'year',
  plan: (typeof PLANS)[keyof typeof PLANS]
) {
  const existing = await stripe.prices.list({
    lookup_keys: [lookupKey],
    active: true,
    limit: 1,
  })
  if (existing.data.length > 0) {
    console.log(`  ✓ ${plan.name} (${interval}) déjà configuré — price=${existing.data[0].id}`)
    return
  }
  const price = await stripe.prices.create({
    product: productId,
    unit_amount: amountEuros * 100,
    currency: plan.currency,
    recurring: { interval },
    lookup_key: lookupKey,
    metadata: { plan_key: plan.key, period: interval },
  })
  console.log(`  + ${plan.name} (${interval}) créé — price=${price.id}`)
}

async function ensureProductAndPrices(plan: (typeof PLANS)[keyof typeof PLANS]) {
  const product = await stripe.products.create({
    name: `ECOPYE Pro Chantier — ${plan.name}`,
    description: plan.description,
    metadata: { plan_key: plan.key },
  })
  await ensurePrice(product.id, plan.lookupKeyMonthly, plan.priceMonthly, 'month', plan)
  await ensurePrice(product.id, plan.lookupKeyYearly, plan.priceYearly, 'year', plan)
}

async function main() {
  console.log('Configuration des plans Stripe…\n')
  for (const plan of Object.values(PLANS)) {
    await ensureProductAndPrices(plan)
  }
  console.log('\n✓ Setup terminé')
}

main().catch((e) => {
  console.error('Erreur :', e.message)
  process.exit(1)
})
