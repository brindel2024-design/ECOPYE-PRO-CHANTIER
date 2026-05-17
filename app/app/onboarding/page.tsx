'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { HardHat, CheckCircle2, Building2, User, Briefcase, Loader2 } from 'lucide-react'

const trades = [
  { value: 'PLOMBIER', label: 'Plombier', emoji: '🔧' },
  { value: 'CHAUFFAGISTE', label: 'Chauffagiste', emoji: '🔥' },
  { value: 'ELECTRICIEN', label: 'Électricien', emoji: '⚡' },
  { value: 'RENOVATION_SALLE_DE_BAIN', label: 'Rénovation SDB', emoji: '🚿' },
  { value: 'MACON', label: 'Maçon', emoji: '🧱' },
  { value: 'PEINTRE', label: 'Peintre', emoji: '🎨' },
  { value: 'CARRELEUR', label: 'Carreleur', emoji: '◼️' },
  { value: 'MENUISIER', label: 'Menuisier', emoji: '🪵' },
  { value: 'MULTI_SERVICES', label: 'Multi-services', emoji: '🏗️' },
  { value: 'ENTREPRISE_GENERALE_BTP', label: 'Entreprise générale BTP', emoji: '🏢' },
]

const steps = [
  { id: 1, title: 'Votre entreprise', icon: Building2 },
  { id: 2, title: 'Votre métier', icon: Briefcase },
  { id: 3, title: 'Vos objectifs', icon: User },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    companyName: '',
    siret: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
    trade: '',
    insuranceNumber: '',
    monthlyTarget: '15000',
    teamSize: '1',
  })

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleFinish() {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1500))
    router.push('/app/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
            <HardHat className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-gray-900">ECOPYE</span>
            <span className="ml-1.5 text-xl text-blue-600 font-bold">Pro Chantier</span>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Configurez votre espace</h1>
          <p className="text-gray-500 mt-1">Quelques informations pour personnaliser ECOPYE Pro à votre activité</p>
        </div>

        {/* Étapes */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${currentStep >= step.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                {currentStep > step.id ? <CheckCircle2 className="h-5 w-5" /> : step.id}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'}`}>
                {step.title}
              </span>
              {i < steps.length - 1 && (
                <div className={`h-px w-8 sm:w-16 ${currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          {/* Étape 1 */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom de l&apos;entreprise *</label>
                <input
                  type="text"
                  value={form.companyName}
                  onChange={(e) => update('companyName', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Durand Rénovation Services"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">SIRET (fictif)</label>
                <input
                  type="text"
                  value={form.siret}
                  onChange={(e) => update('siret', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="82394710200013"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Ville *</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => update('city', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Lyon"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Code postal *</label>
                  <input
                    type="text"
                    value={form.postalCode}
                    onChange={(e) => update('postalCode', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="69003"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone professionnel</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="04 78 12 34 56"
                />
              </div>
            </div>
          )}

          {/* Étape 2 */}
          {currentStep === 2 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-4">Quel est votre métier principal ? *</p>
              <div className="grid grid-cols-2 gap-3">
                {trades.map((trade) => (
                  <button
                    key={trade.value}
                    type="button"
                    onClick={() => update('trade', trade.value)}
                    className={`flex items-center gap-2 rounded-xl border-2 p-3 text-left transition-all ${
                      form.trade === trade.value
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-lg">{trade.emoji}</span>
                    <span className={`text-sm font-medium ${form.trade === trade.value ? 'text-blue-700' : 'text-gray-700'}`}>
                      {trade.label}
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-5">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Numéro assurance décennale (fictif)
                </label>
                <input
                  type="text"
                  value={form.insuranceNumber}
                  onChange={(e) => update('insuranceNumber', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="DEC-2024-00892"
                />
              </div>
            </div>
          )}

          {/* Étape 3 */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Objectif mensuel de chiffre d&apos;affaires
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={form.monthlyTarget}
                    onChange={(e) => update('monthlyTarget', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="15000"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">€</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Taille de votre équipe</label>
                <div className="flex gap-3">
                  {['1', '2-3', '4-5', '6-10', '+10'].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => update('teamSize', size)}
                      className={`flex-1 rounded-lg border-2 py-2 text-sm font-medium transition-all ${
                        form.teamSize === size
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Résumé */}
              <div className="rounded-xl bg-green-50 border border-green-100 p-4 mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <p className="text-sm font-semibold text-green-800">Votre espace est prêt !</p>
                </div>
                <div className="space-y-1 text-xs text-green-700">
                  <p>✓ Tableau de bord personnalisé</p>
                  <p>✓ Données de démonstration chargées</p>
                  <p>✓ Modèles de devis pour votre métier</p>
                  <p>✓ Prêt à créer votre premier devis</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((s) => s - 1)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                ← Retour
              </button>
            ) : (
              <div />
            )}
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((s) => s + 1)}
                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Continuer →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Chargement...</> : 'Accéder à mon espace →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
