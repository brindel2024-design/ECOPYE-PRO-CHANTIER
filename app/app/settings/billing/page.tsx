'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, AlertCircle, Loader2, ArrowRight, ExternalLink } from 'lucide-react'
import { PLANS, PLAN_ORDER, PlanKey } from '@/lib/plans'

interface BillingState {
  plan: PlanKey
  planName: string
  status: string
  monthlyPrice: number
  startedAt: string
  trialEndsAt: string | null
  trialDaysLeft: number | null
  trialExpired: boolean
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  hasStripeSubscription: boolean
}

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  ESSAI: { label: 'Essai gratuit', cls: 'bg-yellow-100 text-yellow-800' },
  ACTIF: { label: 'Actif', cls: 'bg-green-100 text-green-800' },
  SUSPENDU: { label: 'Suspendu', cls: 'bg-red-100 text-red-800' },
  ANNULE: { label: 'Annulé', cls: 'bg-gray-100 text-gray-700' },
  EN_RETARD: { label: 'En retard', cls: 'bg-orange-100 text-orange-800' },
}

export default function BillingPage() {
  const [state, setState] = useState<BillingState | null>(null)
  const [loading, setLoading] = useState(true)
  const [busyPlan, setBusyPlan] = useState<PlanKey | null>(null)
  const [busyPortal, setBusyPortal] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  function showToast(m: string) { setToast(m); setTimeout(() => setToast(null), 3500) }

  async function load() {
    const r = await fetch('/api/billing/me')
    if (r.ok) {
      const j = await r.json()
      setState(j.data)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    if (q.get('subscribed') === '1') {
      showToast('Abonnement activé — merci !')
      window.history.replaceState({}, '', window.location.pathname)
      setTimeout(load, 2000)
    }
  }, [])

  async function subscribe(plan: PlanKey) {
    setBusyPlan(plan)
    const r = await fetch('/api/billing/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
    const j = await r.json().catch(() => ({}))
    if (r.ok && j.url) {
      window.location.href = j.url
    } else {
      showToast(j.error || 'Impossible de lancer le paiement')
      setBusyPlan(null)
    }
  }

  async function openPortal() {
    setBusyPortal(true)
    const r = await fetch('/api/billing/portal', { method: 'POST' })
    const j = await r.json().catch(() => ({}))
    if (r.ok && j.url) {
      window.location.href = j.url
    } else {
      showToast(j.error || 'Impossible d\'ouvrir le portail')
      setBusyPortal(false)
    }
  }

  if (loading) {
    return <div className="p-6 flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
  }

  if (!state) {
    return <div className="p-6 text-sm text-gray-500">Données d&apos;abonnement indisponibles.</div>
  }

  const cfg = STATUS_CFG[state.status] ?? STATUS_CFG.ESSAI

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm">
          {toast}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mon abonnement</h1>
        <p className="text-sm text-gray-500 mt-0.5">Gérez votre formule, votre carte et vos factures ECOPYE.</p>
      </div>

      {/* État actuel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Formule actuelle</p>
            <p className="text-2xl font-bold text-gray-900">{state.planName}</p>
            <p className="text-sm text-gray-500 mt-0.5">{state.monthlyPrice} € HT / mois</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${cfg.cls}`}>{cfg.label}</span>
        </div>

        {state.status === 'ESSAI' && state.trialDaysLeft !== null && !state.trialExpired && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-sm text-yellow-900">
            ⏳ Votre essai gratuit prend fin dans <strong>{state.trialDaysLeft} jour(s)</strong>. Choisissez une formule ci-dessous pour continuer sans interruption.
          </div>
        )}
        {state.trialExpired && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5" />
            <span>Votre essai gratuit est terminé. Souscrivez maintenant pour réactiver vos données.</span>
          </div>
        )}
        {state.cancelAtPeriodEnd && state.currentPeriodEnd && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4 text-sm text-orange-900">
            Annulation programmée — votre abonnement reste actif jusqu&apos;au {new Date(state.currentPeriodEnd).toLocaleDateString('fr-FR')}.
          </div>
        )}

        {state.hasStripeSubscription ? (
          <button
            onClick={openPortal}
            disabled={busyPortal}
            className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {busyPortal ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
            Gérer mon abonnement (Stripe)
          </button>
        ) : (
          <p className="text-xs text-gray-400">
            Choisissez une formule ci-dessous pour activer le paiement automatique.
          </p>
        )}
      </div>

      {/* Choix de formule */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          {state.hasStripeSubscription ? 'Changer de formule' : 'Choisir une formule payante'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLAN_ORDER.map((key) => {
            const plan = PLANS[key]
            const isCurrent = state.plan === key && state.hasStripeSubscription
            const isLoading = busyPlan === key
            return (
              <div
                key={key}
                className={`bg-white rounded-xl border p-5 flex flex-col ${
                  isCurrent ? 'border-blue-500 ring-1 ring-blue-100' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-900">{plan.name}</h3>
                  {isCurrent && (
                    <span className="text-xs text-blue-600 font-medium">Plan actuel</span>
                  )}
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{plan.priceMonthly} €<span className="text-xs font-normal text-gray-500"> HT/mois</span></p>
                <p className="text-xs text-gray-500 mb-4">{plan.description}</p>
                <ul className="space-y-1.5 mb-4 text-xs text-gray-600 flex-1">
                  {plan.features.slice(0, 4).map((f) => (
                    <li key={f} className="flex items-start gap-1.5">
                      <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => subscribe(key)}
                  disabled={isCurrent || isLoading}
                  className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                  {isCurrent ? 'Formule actuelle' : (state.hasStripeSubscription ? `Passer en ${plan.name}` : `Souscrire ${plan.name}`)}
                  {!isCurrent && !isLoading && <ArrowRight className="w-3 h-3" />}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">
        Paiement sécurisé Stripe · TVA en sus · Résiliation à tout moment · <Link href="/pricing" className="underline">Détail des formules</Link>
      </p>
    </div>
  )
}
