'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { HardHat, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { PLANS, PLAN_ORDER, type PlanKey } from '@/lib/plans'
import { formatCurrency } from '@/lib/utils'

const trades = [
  { value: 'PLOMBIER', label: 'Plombier' },
  { value: 'CHAUFFAGISTE', label: 'Chauffagiste' },
  { value: 'ELECTRICIEN', label: 'Électricien' },
  { value: 'RENOVATION_SALLE_DE_BAIN', label: 'Rénovation salle de bain' },
  { value: 'MACON', label: 'Maçon' },
  { value: 'PEINTRE', label: 'Peintre' },
  { value: 'CARRELEUR', label: 'Carreleur' },
  { value: 'MENUISIER', label: 'Menuisier' },
  { value: 'MULTI_SERVICES', label: 'Multi-services' },
  { value: 'ENTREPRISE_GENERALE_BTP', label: 'Entreprise générale BTP' },
]

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
    trade: 'PLOMBIER',
    city: '',
    phone: '',
  })
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [plan, setPlan] = useState<PlanKey>('PRO')

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (step === 1) {
      setStep(2)
      return
    }

    if (step === 2) {
      if (!acceptTerms) {
        setError('Vous devez accepter les CGU et la politique de confidentialité pour créer un compte.')
        return
      }
      setStep(3)
      return
    }

    // Étape 3 : création du compte → connexion → paiement (carte + essai 14 j)
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, plan }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Erreur lors de la création du compte.')
        setLoading(false)
        return
      }

      // Connexion automatique
      const signinRes = await signIn('credentials', {
        redirect: false,
        email: form.email,
        password: form.password,
      })
      if (signinRes?.error) {
        setError('Compte créé, mais connexion automatique impossible. Connectez-vous puis choisissez votre formule.')
        setLoading(false)
        return
      }

      // Redirection vers le paiement Stripe (carte obligatoire, essai 14 jours)
      const co = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, successPath: '/app/dashboard?welcome=1' }),
      })
      const coData = await co.json()
      if (co.ok && coData.url) {
        window.location.href = coData.url
        return
      }
      setError(coData.error ?? "Impossible de démarrer le paiement. Réessayez depuis votre espace.")
      setLoading(false)
    } catch {
      setError('Erreur réseau. Veuillez réessayer.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
              <HardHat className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-gray-900">ECOPYE</span>
              <span className="ml-1.5 text-lg text-blue-600 font-bold">Pro Chantier</span>
            </div>
          </div>

          {(
            <>
              {/* Indicateur d'étape */}
              <div className="flex items-center gap-2 mb-8">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center gap-2 flex-1">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${s <= step ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      {s}
                    </div>
                    <span className={`text-xs font-medium ${s <= step ? 'text-blue-600' : 'text-gray-400'}`}>
                      {s === 1 ? 'Profil' : s === 2 ? 'Entreprise' : 'Formule'}
                    </span>
                    {s < 3 && <div className="flex-1 h-px bg-gray-200" />}
                  </div>
                ))}
              </div>

              <h1 className="text-xl font-bold text-gray-900 mb-1">
                {step === 1 ? 'Créez votre compte' : step === 2 ? 'Votre entreprise' : 'Choisissez votre formule'}
              </h1>
              <p className="text-sm text-gray-500 mb-6">
                {step === 1
                  ? 'Vos informations personnelles'
                  : step === 2
                  ? 'Informations de votre entreprise'
                  : 'Essai gratuit 14 jours — carte requise, sans engagement, résiliable à tout moment'}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-100 px-4 py-3">
                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {step === 1 && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Prénom et nom</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => update('name', e.target.value)}
                        required
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Jean Durand"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Email professionnel</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => update('email', e.target.value)}
                        required
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="jean@mon-entreprise.fr"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
                      <input
                        type="password"
                        value={form.password}
                        onChange={(e) => update('password', e.target.value)}
                        required
                        minLength={8}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Minimum 8 caractères"
                      />
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom de l&apos;entreprise</label>
                      <input
                        type="text"
                        value={form.companyName}
                        onChange={(e) => update('companyName', e.target.value)}
                        required
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Durand Rénovation Services"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Votre métier</label>
                      <select
                        value={form.trade}
                        onChange={(e) => update('trade', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        {trades.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Ville</label>
                      <input
                        type="text"
                        value={form.city}
                        onChange={(e) => update('city', e.target.value)}
                        required
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Lyon"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => update('phone', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="06 12 34 56 78"
                      />
                    </div>
                  </>
                )}

                {step === 2 && (
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-xs text-gray-600 leading-relaxed">
                      J&apos;ai lu et j&apos;accepte les{' '}
                      <Link href="/cgu" target="_blank" className="text-blue-600 hover:underline">CGU</Link>,
                      les{' '}
                      <Link href="/cgv" target="_blank" className="text-blue-600 hover:underline">CGV</Link>{' '}
                      et la{' '}
                      <Link href="/confidentialite" target="_blank" className="text-blue-600 hover:underline">politique de confidentialité (RGPD)</Link>.
                      Mes données seront traitées conformément à cette politique pour gérer mon compte et la facturation.
                    </span>
                  </label>
                )}

                {step === 3 && (
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
                          <p className="mt-1 text-xs text-gray-500">{p.description}</p>
                        </button>
                      )
                    })}
                    <p className="text-xs text-gray-500 text-center pt-1 leading-relaxed">
                      Carte demandée maintenant, mais <strong>aucun prélèvement avant 14 jours</strong>. Résiliable à tout moment avant la fin de l&apos;essai. Paiement sécurisé par Stripe.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || (step === 2 && !acceptTerms)}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />Redirection vers le paiement…</>
                  ) : step === 3 ? (
                    'Créer mon compte et activer l’essai'
                  ) : (
                    'Continuer →'
                  )}
                </button>

                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    ← Retour
                  </button>
                )}
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Déjà un compte ?{' '}
                  <Link href="/login" className="font-medium text-blue-600 hover:underline">
                    Se connecter
                  </Link>
                </p>
              </div>
            </>
          )}

        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-slate-400 hover:text-slate-300">
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
