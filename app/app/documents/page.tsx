'use client'

import { useEffect, useState, useRef } from 'react'
import {
  ShieldCheck,
  Upload,
  AlertTriangle,
  Clock,
  FileX,
  FileQuestion,
  Download,
  Trash2,
  Loader2,
  X,
} from 'lucide-react'
import { DocumentType, DocumentStatus, DOCUMENT_TYPE_LABELS } from '@/lib/types'

interface DocItem {
  id: string
  type: DocumentType
  title: string
  status: DocumentStatus
  fileUrl: string | null
  expiresAt: string | null
  notes: string | null
  createdAt: string
}

const STATUS_CFG: Record<DocumentStatus, { label: string; cls: string }> = {
  VALIDE: { label: 'Valide', cls: 'bg-green-100 text-green-700' },
  EXPIRE_BIENTOT: { label: 'Expire bientôt', cls: 'bg-orange-100 text-orange-700' },
  EXPIRE: { label: 'Expiré', cls: 'bg-red-100 text-red-700' },
  MANQUANT: { label: 'Manquant', cls: 'bg-gray-100 text-gray-600' },
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR')
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<DocItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [form, setForm] = useState<{ title: string; type: DocumentType; expiresAt: string; notes: string }>({
    title: '',
    type: 'ASSURANCE_DECENNALE',
    expiresAt: '',
    notes: '',
  })
  const fileRef = useRef<HTMLInputElement>(null)

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3500) }

  async function load() {
    setLoading(true)
    try {
      const r = await fetch('/api/documents')
      const j = await r.json()
      setDocs(r.ok ? (j.data ?? []) : [])
    } catch { setDocs([]) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleUpload() {
    if (!form.title.trim()) { showToast('Titre requis'); return }
    setUploading(true)
    const fd = new FormData()
    const file = fileRef.current?.files?.[0]
    if (file) fd.append('file', file)
    fd.append('title', form.title.trim())
    fd.append('type', form.type)
    if (form.expiresAt) fd.append('expiresAt', form.expiresAt)
    if (form.notes) fd.append('notes', form.notes)
    try {
      const r = await fetch('/api/documents', { method: 'POST', body: fd })
      const j = await r.json().catch(() => ({}))
      if (r.ok) {
        setShowUpload(false)
        setForm({ title: '', type: 'ASSURANCE_DECENNALE', expiresAt: '', notes: '' })
        if (fileRef.current) fileRef.current.value = ''
        showToast('Document ajouté')
        load()
      } else {
        showToast(j.error || 'Échec du téléversement')
      }
    } catch { showToast('Échec du téléversement') }
    setUploading(false)
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Supprimer définitivement "${title}" ?`)) return
    const r = await fetch(`/api/documents?id=${id}`, { method: 'DELETE' })
    if (r.ok) { showToast('Document supprimé'); load() } else { showToast('Échec de la suppression') }
  }

  const counts = {
    valides: docs.filter((d) => d.status === 'VALIDE').length,
    expireBientot: docs.filter((d) => d.status === 'EXPIRE_BIENTOT').length,
    expires: docs.filter((d) => d.status === 'EXPIRE').length,
    manquants: docs.filter((d) => d.status === 'MANQUANT').length,
  }

  const hasExpired = counts.expires > 0
  const hasExpiringSoon = counts.expireBientot > 0

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm">
          {toast}
        </div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents &amp; Conformité</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gérez vos documents légaux et certifications</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          <Upload className="h-4 w-4" />
          Ajouter un document
        </button>
      </div>

      {hasExpired && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <p className="text-sm font-medium text-red-800">
            ⚠ {counts.expires} document(s) expiré(s) — Votre activité peut être bloquée
          </p>
        </div>
      )}
      {!hasExpired && hasExpiringSoon && (
        <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl p-4">
          <Clock className="h-5 w-5 text-orange-600 flex-shrink-0" />
          <p className="text-sm font-medium text-orange-800">
            ⚠ {counts.expireBientot} document(s) expire(nt) dans moins de 30 jours
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { Icon: ShieldCheck, label: 'Valides', value: counts.valides, color: 'text-green-700' },
          { Icon: Clock, label: 'Expire bientôt', value: counts.expireBientot, color: 'text-orange-700' },
          { Icon: FileX, label: 'Expirés', value: counts.expires, color: 'text-red-700' },
          { Icon: FileQuestion, label: 'Manquants', value: counts.manquants, color: 'text-gray-600' },
        ].map(({ Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-2">
              <Icon className={`h-5 w-5 ${color}`} />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
            </div>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Mes documents</h2>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
          </div>
        ) : docs.length === 0 ? (
          <p className="text-sm text-gray-400 py-10 text-center">
            Aucun document — cliquez sur « Ajouter un document » pour téléverser votre attestation décennale, RC pro, URSSAF…
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs text-gray-500 font-medium pb-3 pr-4">Type</th>
                  <th className="text-left text-xs text-gray-500 font-medium pb-3 pr-4">Titre</th>
                  <th className="text-left text-xs text-gray-500 font-medium pb-3 pr-4">Statut</th>
                  <th className="text-left text-xs text-gray-500 font-medium pb-3 pr-4">Expiration</th>
                  <th className="text-left text-xs text-gray-500 font-medium pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {docs.map((d) => {
                  const cfg = STATUS_CFG[d.status] ?? STATUS_CFG.MANQUANT
                  return (
                    <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3.5 pr-4 text-xs text-gray-500 font-medium">
                        {DOCUMENT_TYPE_LABELS[d.type] ?? d.type}
                      </td>
                      <td className="py-3.5 pr-4">
                        <p className="font-medium text-gray-900">{d.title}</p>
                        {d.notes && <p className="text-xs text-gray-400 mt-0.5">{d.notes}</p>}
                      </td>
                      <td className="py-3.5 pr-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>{cfg.label}</span>
                      </td>
                      <td className="py-3.5 pr-4 text-sm text-gray-600">{fmtDate(d.expiresAt)}</td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-3">
                          {d.fileUrl ? (
                            <a href={d.fileUrl} download className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800">
                              <Download className="h-3.5 w-3.5" />
                              Télécharger
                            </a>
                          ) : (
                            <span className="text-xs text-gray-400">Pas de fichier</span>
                          )}
                          <button
                            onClick={() => handleDelete(d.id, d.title)}
                            className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showUpload && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">Nouveau document</h2>
              <button onClick={() => setShowUpload(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Titre *</label>
                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Ex: Décennale 2026"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as DocumentType }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {(Object.keys(DOCUMENT_TYPE_LABELS) as DocumentType[]).map((t) => (
                    <option key={t} value={t}>{DOCUMENT_TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Expire le</label>
                <input type="date" value={form.expiresAt} onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Fichier (PDF/image)</label>
                <input ref={fileRef} type="file" accept="application/pdf,image/*"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="N° police, assureur..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <button onClick={handleUpload} disabled={uploading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Enregistrer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
