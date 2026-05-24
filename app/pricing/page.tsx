'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, HardHat, Loader2 } from 'lucide-react'
import { PLANS, PLAN_ORDER, PlanKey, TRIAL_DAYS } from '@/lib/plans'

export default function PricingPage() {
  const { data: session, status } = useSession()
  const [loadingPlan, setLoadingPlan] = useState<PlanKey | null>(null)
  const [err, setErr] = useState('')

  async function subscribe(plan: PlanKey) {
    setErr('')
    if (status !== 'authenticated') {
      window.location.href = `/register?plan=${plan}`
      return
    }
    setLoadingPlan(plan)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const json = await res.json().catch(() => ({}))
      if (res.ok && json.url) {
        window.location.href = json.url
      } else {
        setErr(json.error || 'Impossible de lancer le paiement.')
      }
    } catch {
      setErr('Erreur réseau.')
    }
    setLoadingPlan(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
              <HardHat className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-base font-bold text-gray-900">ECOPYE</span>
              <span className="ml-1 text-base text-blue-600 font-bold">Pro Chantier</span>
            </div>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            {status === 'authenticated' ? (
              <Link href={(session?.user as { role?: string })?.role === 'ECOPYE_ADMIN' ? '/admin' : '/app/dashboard'}
                className="text-gray-700 hover:text-gray-900">
                Mon espace →
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-gray-900">Se connecter</Link>
                <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium">
                  Essai gratuit
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Des tarifs simples, sans engagement</h1>
          <p className="text-gray-600">{TRIAL_DAYS} jours d&apos;essai gratuit. Sans carte requise pour démarrer.</p>
          {err && <p className="mt-4 text-sm text-red-600">{err}</p>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {PLAN_ORDER.map((key) => {
            const plan = PLANS[key]
            const isLoading = loadingPlan === key
            return (
              <div
                key={key}
                className={`relative bg-white rounded-2xl border ${
                  plan.highlight ? 'border-blue-500 shadow-xl ring-1 ring-blue-100' : 'border-gray-200 shadow-sm'
                } p-7 flex flex-col`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Le plus populaire
                  </span>
                )}

                <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
                <p className="text-sm text-gray-500 mt-1 mb-5">{plan.description}</p>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{plan.priceMonthly} €</span>
                  <span className="text-sm text-gray-500 ml-1">/mois HT</span>
                </div>

                <ul className="space-y-3 mb-7 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => subscribe(key)}
                  disabled={isLoading || status === 'loading'}
                  className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
                    plan.highlight
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {status === 'authenticated' ? `Passer en ${plan.name}` : `Démarrer avec ${plan.name}`}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )
          })}
        </div>

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Paiement sécurisé via Stripe · Résiliation à tout moment depuis votre espace · TVA en sus</p>
        </div>
      </main>
    </div>
  )
}
