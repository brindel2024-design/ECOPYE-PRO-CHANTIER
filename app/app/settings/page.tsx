'use client'

import { useState, useEffect } from 'react'
import { TRADE_LABELS } from '@/lib/types'
import { Building2, User, Bell, Shield, CreditCard, Save, Loader2, CheckCircle } from 'lucide-react'

const tabs = [
  { id: 'company', label: 'Entreprise', icon: Building2 },
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Sécurité', icon: Shield },
  { id: 'subscription', label: 'Abonnement', icon: CreditCard },
]

interface Company {
  name: string; ownerName: string; siret: string; trade: string
  address: string; city: string; postalCode: string; phone: string; email: string
  vatNumber: string; insuranceNumber: string; monthlyRevenueTarget: number
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('company')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [company, setCompany] = useState<Company>({
    name: '', ownerName: '', siret: '', trade: 'MULTI_SERVICES',
    address: '', city: '', postalCode: '', phone: '', email: '',
    vatNumber: '', insuranceNumber: '', monthlyRevenueTarget: 0,
  })

  useEffect(() => {
    fetch('/api/company').then(r => r.json()).then(d => {
      if (d.data) setCompany({ ...company, ...d.data })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, []) // eslint-disable-line

  async function handleSave() {
    setSaving(true)
    const res = await fetch('/api/company', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(company),
    })
    setSaving(false)
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
  }

  const field = (label: string, key: keyof Company, type = 'text') => (
    <div key={key}>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input type={type} value={String(company[key] ?? '')}
        onChange={e => setCompany(c => ({ ...c, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
    </div>
  )

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-sm text-gray-500 mt-0.5">Gérez votre entreprise et votre compte</p>
      </div>

      <div className="flex gap-6">
        <div className="w-48 shrink-0">
          <nav className="space-y-1">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-left transition-colors ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                <tab.icon className="h-4 w-4" />{tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1">
          {activeTab === 'company' && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-6">Informations entreprise</h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {field('Nom entreprise', 'name')}
                {field('Nom du gérant', 'ownerName')}
                {field('SIRET', 'siret')}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Corps de métier</label>
                  <select value={company.trade} onChange={e => setCompany(c => ({ ...c, trade: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none">
                    {Object.entries(TRADE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                {field('Adresse', 'address')}
                {field('Ville', 'city')}
                {field('Code postal', 'postalCode')}
                {field('Téléphone', 'phone', 'tel')}
                {field('Email', 'email', 'email')}
                {field('N° TVA', 'vatNumber')}
                {field("N° assurance décennale", 'insuranceNumber')}
                {field('Objectif CA mensuel (€)', 'monthlyRevenueTarget', 'number')}
              </div>
              <div className="mt-6 flex items-center justify-end gap-3">
                {saved && <span className="flex items-center gap-1.5 text-sm text-green-600"><CheckCircle className="h-4 w-4" />Enregistré</span>}
                <button onClick={handleSave} disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </div>
          )}
          {activeTab === 'profile' && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Profil utilisateur</h2>
              <p className="text-sm text-gray-500">Modification du profil disponible dans la prochaine version.</p>
            </div>
          )}
          {activeTab === 'notifications' && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Notifications</h2>
              <div className="space-y-4">
                {['Nouvelles demandes clients', 'Factures en retard', 'Devis acceptés', 'Rappels planning'].map(label => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{label}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'security' && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Sécurité</h2>
              <div className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe actuel</label>
                  <input type="password" placeholder="••••••••" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Nouveau mot de passe</label>
                  <input type="password" placeholder="••••••••" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none" /></div>
                <button className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Changer le mot de passe</button>
              </div>
            </div>
          )}
          {activeTab === 'subscription' && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Abonnement</h2>
              <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 mb-4">
                <p className="text-sm font-semibold text-blue-700">Plan PRO — Essai gratuit</p>
                <p className="text-xs text-blue-600 mt-0.5">14 jours d&apos;essai · 59 €/mois ensuite</p>
              </div>
              <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Gérer l&apos;abonnement</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
