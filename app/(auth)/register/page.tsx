'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { HardHat, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

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
  const router = useRouter()
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

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (step < 2) {
      setStep(2)
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Erreur lors de la création du compte.')
        setLoading(false)
        return
      }

      setStep(3)
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

          {/* Étape succès */}
          {step === 3 ? (
            <div className="text-center py-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Compte créé !</h2>
              <p className="text-sm text-gray-500 mb-6">
                Votre espace artisan est prêt. Connectez-vous pour commencer.
              </p>
              <button
                onClick={() => router.push('/login')}
                className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                Se connecter
              </button>
            </div>
          ) : (
            <>
              {/* Indicateur d'étape */}
              <div className="flex items-center gap-2 mb-8">
                {[1, 2].map((s) => (
                  <div key={s} className="flex items-center gap-2 flex-1">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${s <= step ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      {s}
                    </div>
                    <span className={`text-xs font-medium ${s <= step ? 'text-blue-600' : 'text-gray-400'}`}>
                      {s === 1 ? 'Votre profil' : 'Votre entreprise'}
                    </span>
                    {s < 2 && <div className="flex-1 h-px bg-gray-200" />}
                  </div>
                ))}
              </div>

              <h1 className="text-xl font-bold text-gray-900 mb-1">
                {step === 1 ? 'Créez votre compte' : 'Votre entreprise'}
              </h1>
              <p className="text-sm text-gray-500 mb-6">
                {step === 1 ? 'Vos informations personnelles' : 'Informations de votre entreprise'}
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />Création en cours...</>
                  ) : step === 1 ? (
                    'Continuer →'
                  ) : (
                    'Créer mon compte'
                  )}
                </button>

                {step === 2 && (
                  <button
                    type="button"
                    onClick={() => setStep(1)}
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

          <div className="mt-4 text-center">
            <p className="text-xs text-amber-600">⚠ Prototype — Données fictives</p>
          </div>
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
