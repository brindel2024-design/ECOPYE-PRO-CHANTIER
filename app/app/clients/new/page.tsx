'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

type ClientType = 'PARTICULIER' | 'PROFESSIONNEL'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function NewClientPage() {
  const router = useRouter()
  const [type, setType] = useState<ClientType>('PARTICULIER')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  function validate(): string | null {
    if (!firstName.trim()) return 'Le prénom est obligatoire'
    if (!lastName.trim()) return 'Le nom est obligatoire'
    if (type === 'PROFESSIONNEL' && !companyName.trim())
      return "Le nom de l'entreprise est obligatoire pour un professionnel"
    if (!email.trim()) return "L'email est obligatoire"
    if (!EMAIL_REGEX.test(email.trim())) return "L'email n'est pas valide"
    if (phone.trim() && phone.trim().replace(/[\s.+-]/g, '').length < 8)
      return "Le numéro de téléphone n'est pas valide"
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          companyName: type === 'PROFESSIONNEL' ? companyName.trim() : undefined,
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
          postalCode: postalCode.trim(),
          notes: notes.trim() || undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erreur lors de la création du client')
      setToast('Client créé')
      setTimeout(() => router.push('/app/clients'), 700)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du client')
      setSaving(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          {toast}
        </div>
      )}

      <Link href="/app/clients" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-4 w-4" />Retour aux clients
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nouveau client</h1>
        <p className="text-sm text-gray-500 mt-0.5">Ajoutez un client pour créer devis et factures</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-6 space-y-5">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Type de client</label>
          <div className="flex rounded-lg border border-gray-300 overflow-hidden w-fit">
            {(['PARTICULIER', 'PROFESSIONNEL'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  type === t ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t === 'PARTICULIER' ? 'Particulier' : 'Professionnel'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Prénom *</label>
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Nom *</label>
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} />
          </div>
        </div>

        {type === 'PROFESSIONNEL' && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Nom de l&apos;entreprise *</label>
            <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputClass} />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Email *</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="client@exemple.fr" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Téléphone</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="06 12 34 56 78" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Adresse</label>
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Ville</label>
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Code postal</label>
            <input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className={inputClass} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Notes (optionnel)</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={inputClass} placeholder="Informations complémentaires..." />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/app/clients" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Annuler
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Enregistrement...</> : 'Créer le client'}
          </button>
        </div>
      </form>
    </div>
  )
}
