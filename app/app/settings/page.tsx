'use client'

import { useState } from 'react'
import { MOCK_COMPANY, MOCK_USERS } from '@/lib/mock-data'
import { TRADE_LABELS } from '@/lib/types'
import { Building2, User, Bell, Shield, CreditCard, Save } from 'lucide-react'

const tabs = [
  { id: 'company', label: 'Entreprise', icon: Building2 },
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Sécurité', icon: Shield },
  { id: 'subscription', label: 'Abonnement', icon: CreditCard },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('company')
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-sm text-gray-500 mt-0.5">Gérez votre entreprise et votre compte</p>
      </div>

      <div className="flex gap-6">
        {/* Tabs latéraux */}
        <div className="w-48 shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Contenu */}
        <div className="flex-1">
          {activeTab === 'company' && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-6">Informations entreprise</h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {[
                  { label: 'Nom entreprise', value: MOCK_COMPANY.name },
                  { label: 'Nom dirigeant', value: MOCK_COMPANY.ownerName },
                  { label: 'SIRET', value: MOCK_COMPANY.siret },
                  { label: 'Métier', value: TRADE_LABELS[MOCK_COMPANY.trade as keyof typeof TRADE_LABELS] },
                  { label: 'Email', value: MOCK_COMPANY.email },
                  { label: 'Téléphone', value: MOCK_COMPANY.phone },
                  { label: 'Ville', value: MOCK_COMPANY.city },
                  { label: 'Code postal', value: MOCK_COMPANY.postalCode },
                  { label: 'N° assurance décennale', value: MOCK_COMPANY.insuranceNumber ?? '—' },
                  { label: 'N° TVA', value: MOCK_COMPANY.vatNumber ?? '—' },
                ].map((field) => (
                  <div key={field.label}>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{field.label}</label>
                    <input
                      type="text"
                      defaultValue={field.value}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Objectif mensuel (€)</label>
                  <input
                    type="number"
                    defaultValue={MOCK_COMPANY.monthlyRevenueTarget}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between">
                {saved && <p className="text-sm text-green-600 font-medium">✓ Enregistré</p>}
                <button
                  onClick={handleSave}
                  className="ml-auto flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <Save className="h-4 w-4" />
                  Enregistrer
                </button>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-6">Équipe et utilisateurs</h2>
              <div className="space-y-3">
                {MOCK_USERS.map((user) => (
                  <div key={user.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                        {user.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
                      {user.role === 'OWNER' ? 'Dirigeant' : user.role === 'ADMIN_COMPANY' ? 'Administrateur' : 'Technicien'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'subscription' && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-6">Mon abonnement</h2>
              <div className="rounded-xl bg-blue-50 border border-blue-100 p-6 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-blue-900">Plan Pro</span>
                  <span className="rounded-full bg-green-100 text-green-700 px-3 py-1 text-xs font-medium">Actif</span>
                </div>
                <p className="text-2xl font-bold text-blue-800">59 €<span className="text-sm font-normal text-blue-600">/mois</span></p>
                <p className="text-sm text-blue-600 mt-1">Renouvellement le 1er juillet 2024</p>
              </div>
              <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
                <p className="text-sm text-amber-700">
                  ⚠ <strong>Mode démo</strong> — Aucun paiement réel. Les abonnements sont simulés dans ce prototype.
                </p>
              </div>
            </div>
          )}

          {(activeTab === 'notifications' || activeTab === 'security') && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                {activeTab === 'notifications' ? 'Notifications' : 'Sécurité'}
              </h2>
              <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
                <p className="text-sm text-amber-700">
                  ⚠ Cette section sera disponible dans la version commerciale avec email, SMS et 2FA.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
