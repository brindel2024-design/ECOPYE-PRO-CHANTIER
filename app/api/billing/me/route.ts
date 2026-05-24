import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrUnauthorized, requireCompanyId } from '@/lib/api-helpers'
import { PLANS, PlanKey, TRIAL_DAYS } from '@/lib/plans'

export async function GET() {
  const { session, error } = await getSessionOrUnauthorized()
  if (error) return error
  const { companyId, error: companyError } = requireCompanyId(session)
  if (companyError) return companyError

  const sub = await prisma.subscription.findUnique({ where: { companyId } })
  if (!sub) {
    return NextResponse.json({ data: null })
  }

  const planDef = PLANS[(sub.plan as PlanKey) in PLANS ? (sub.plan as PlanKey) : 'STARTER']
  const now = Date.now()
  const trialDaysLeft = sub.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(sub.trialEndsAt).getTime() - now) / 86400000))
    : null
  const trialExpired = sub.status === 'ESSAI' && sub.trialEndsAt
    ? new Date(sub.trialEndsAt).getTime() < now
    : false

  return NextResponse.json({
    data: {
      plan: sub.plan,
      planName: planDef.name,
      status: sub.status,
      monthlyPrice: sub.monthlyPrice,
      startedAt: sub.startedAt,
      trialEndsAt: sub.trialEndsAt,
      trialDaysLeft,
      trialExpired,
      currentPeriodEnd: sub.currentPeriodEnd,
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
      hasStripeSubscription: Boolean(sub.stripeSubscriptionId),
      trialDuration: TRIAL_DAYS,
    },
  })
}
