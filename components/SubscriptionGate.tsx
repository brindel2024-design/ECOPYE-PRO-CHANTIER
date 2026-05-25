'use client'

import { useEffect, useState } from 'react'
import { Loader2, CreditCard, CheckCircle2 } from 'lucide-react'
import { PLANS, PLAN_ORDER, type PlanKey } from '@/lib/plans'
import { formatCurrency } from '@/lib/utils'

/**
 * Bloque l'accès à l'application tant qu'aucune carte n'est enregistrée
 * (paiement d'inscription abandonné). L'admin (sans entreprise) n'est pas bloqué.
 */
export function SubscriptionGate() {
  const [state, setState] = useState<'loading' | 'ok' | 'blocked'>('loading')
  const [plan, setPlan] = useState<PlanKey>('PRO')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    async function check(attempt = 0) {
      try {
        const res = await fetch('/api/billing/me')
        if (!res.ok) {
          if (active) setState('ok') // admin / pas d'entreprise → on ne bloque pas
          return
        }
        const { data } = await res.json()
        if (!data || data.hasStripeSubscription) {
          if (active) setState('ok')
          return
        }
        // Pas de carte : on retente une fois après 4 s (délai du webhook Stripe)
        if (attempt === 0) {
          setTimeout(() => active && check(1), 4000)
          return
        }
        if (active) setState('blocked')
      } catch {
        if (active) setState('ok')
      }
    }
    check()
    return () => {
      active = false
    }
  }, [])

  async function startCheckout() {
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, successPath: '/app/dashboard?welcome=1' }),
      })
      const d = await res.json()
      if (res.ok && d.url) {
        window.location.href = d.url
        return
      }
      setError(d.error ?? 'Une erreur est survenue. Réessayez.')
      setSubmitting(false)
    } catch {
      setError('Erreur réseau. Réessayez.')
      setSubmitting(false)
    }
  }

  if (state !== 'blocked') return null

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/80 flex items-start sm:items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 my-8 shadow-2xl">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-bold text-gray-900">Activez votre abonnement</h2>
        </div>
        <p className="text-sm text-gray-500 mb-5">
          Pour accéder à votre espace, enregistrez votre moyen de paiement. <strong>Aucun prélèvement avant 14 jours</strong> — résiliable à tout moment pendant l&apos;essai.
        </p>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <div className="space-y-3">
          {PLAN_ORDER.map((key) => {
            const p = PLANS[key]
            const selected = plan === key
            return (
              <button
                type="button"
                key={key}
                onClick={() => setPlan(key)}
                className={`w-full text-left rounded-xl border-2 p-4 transition-colors ${selected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${selected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`}>
                      {selected && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                    </span>
                    <span className="font-semibold text-gray-900">{p.name}</span>
                    {p.highlight && (
                      <span className="text-[10px] font-bold uppercase tracking-wide bg-blue-600 text-white px-1.5 py-0.5 rounded">Populaire</span>
                    )}
                  </div>
                  <div className="text-right whitespace-nowrap">
                    <span className="text-lg font-bold text-gray-900">{formatCurrency(p.priceMonthly)}</span>
                    <span className="text-xs text-gray-500"> /mois</span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <button
          onClick={startCheckout}
          disabled={submitting}
          className="mt-5 w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {submitting ? <><Loader2 className="h-4 w-4 animate-spin" />Redirection…</> : "Enregistrer ma carte et activer l’essai"}
        </button>
        <p className="mt-3 text-center text-xs text-gray-400">Paiement sécurisé par Stripe</p>
      </div>
    </div>
  )
}
