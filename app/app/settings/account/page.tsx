'use client'

import { useState } from 'react'
import { Download, KeyRound, Trash2, Loader2, AlertTriangle } from 'lucide-react'

export default function AccountPage() {
  const [pwdBusy, setPwdBusy] = useState(false)
  const [pwdMsg, setPwdMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' })

  const [delOpen, setDelOpen] = useState(false)
  const [delPwd, setDelPwd] = useState('')
  const [delConfirm, setDelConfirm] = useState('')
  const [delBusy, setDelBusy] = useState(false)
  const [delErr, setDelErr] = useState('')

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwdMsg(null)
    if (pwd.next !== pwd.confirm) {
      setPwdMsg({ ok: false, text: 'Les deux nouveaux mots de passe ne correspondent pas.' })
      return
    }
    if (pwd.next.length < 8) {
      setPwdMsg({ ok: false, text: '8 caractères minimum pour le nouveau mot de passe.' })
      return
    }
    setPwdBusy(true)
    const r = await fetch('/api/account/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: pwd.current, newPassword: pwd.next }),
    })
    const j = await r.json().catch(() => ({}))
    setPwdBusy(false)
    if (r.ok) {
      setPwdMsg({ ok: true, text: 'Mot de passe mis à jour.' })
      setPwd({ current: '', next: '', confirm: '' })
    } else {
      setPwdMsg({ ok: false, text: j.error || 'Échec du changement de mot de passe.' })
    }
  }

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault()
    setDelErr('')
    setDelBusy(true)
    const r = await fetch('/api/account/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: delPwd, confirm: delConfirm }),
    })
    const j = await r.json().catch(() => ({}))
    setDelBusy(false)
    if (r.ok) {
      window.location.href = '/api/auth/signout?callbackUrl=/'
    } else {
      setDelErr(j.error || 'Échec de la suppression.')
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mon compte</h1>
        <p className="text-sm text-gray-500 mt-0.5">Sécurité, RGPD, suppression du compte.</p>
      </div>

      {/* Mot de passe */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <KeyRound className="w-5 h-5 text-gray-500" />
          <h2 className="text-base font-semibold text-gray-900">Changer mon mot de passe</h2>
        </div>
        <form onSubmit={changePassword} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Mot de passe actuel</label>
            <input type="password" value={pwd.current} onChange={(e) => setPwd((p) => ({ ...p, current: e.target.value }))}
              autoComplete="current-password" required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nouveau mot de passe</label>
              <input type="password" value={pwd.next} onChange={(e) => setPwd((p) => ({ ...p, next: e.target.value }))}
                autoComplete="new-password" required minLength={8}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Confirmation</label>
              <input type="password" value={pwd.confirm} onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))}
                autoComplete="new-password" required minLength={8}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          {pwdMsg && (
            <p className={`text-sm ${pwdMsg.ok ? 'text-green-700' : 'text-red-600'}`}>{pwdMsg.text}</p>
          )}
          <button type="submit" disabled={pwdBusy}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 inline-flex items-center gap-2">
            {pwdBusy && <Loader2 className="w-4 h-4 animate-spin" />}
            Mettre à jour
          </button>
        </form>
      </section>

      {/* Export RGPD */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-2">
          <Download className="w-5 h-5 text-gray-500" />
          <h2 className="text-base font-semibold text-gray-900">Exporter mes données (RGPD)</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Téléchargez l&apos;ensemble des données de votre entreprise dans un fichier JSON (clients, devis, factures, chantiers, photos, paiements). Conformément à l&apos;article 20 du RGPD (droit à la portabilité).
        </p>
        <a href="/api/account/export" download
          className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium">
          <Download className="w-4 h-4" />
          Télécharger l&apos;export complet
        </a>
      </section>

      {/* Suppression */}
      <section className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <Trash2 className="w-5 h-5 text-red-600" />
          <h2 className="text-base font-semibold text-red-900">Supprimer mon compte</h2>
        </div>
        <p className="text-sm text-red-800 mb-4">
          Action <strong>définitive et irréversible</strong>. Toutes vos données (clients, devis, factures, photos, abonnement, etc.) seront effacées de nos serveurs sous 30 jours.{' '}
          <strong>Pensez à exporter vos données avant.</strong> Les factures sont légalement à conserver 10 ans — c&apos;est à vous de les archiver hors plateforme.
        </p>
        {!delOpen ? (
          <button onClick={() => setDelOpen(true)}
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            <Trash2 className="w-4 h-4" />
            Demander la suppression
          </button>
        ) : (
          <form onSubmit={handleDelete} className="space-y-3 bg-white border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2 text-sm text-red-900">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>Cette action est définitive. Confirmez avec votre mot de passe et tapez le mot SUPPRIMER en majuscules.</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Mot de passe</label>
              <input type="password" value={delPwd} onChange={(e) => setDelPwd(e.target.value)}
                autoComplete="current-password" required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Tapez « SUPPRIMER »</label>
              <input type="text" value={delConfirm} onChange={(e) => setDelConfirm(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            {delErr && <p className="text-sm text-red-700">{delErr}</p>}
            <div className="flex gap-2">
              <button type="button" onClick={() => { setDelOpen(false); setDelErr(''); setDelPwd(''); setDelConfirm('') }}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm">Annuler</button>
              <button type="submit" disabled={delBusy || delConfirm !== 'SUPPRIMER'}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 inline-flex items-center gap-2">
                {delBusy && <Loader2 className="w-4 h-4 animate-spin" />}
                Supprimer définitivement
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  )
}
