'use client'

import { useState } from 'react'
import {
  ShieldCheck,
  Upload,
  AlertTriangle,
  Clock,
  FileX,
  FileQuestion,
  Eye,
  Download,
  RefreshCw,
  Award,
} from 'lucide-react'
import { DocumentType, DocumentStatus, DOCUMENT_TYPE_LABELS } from '@/lib/types'
import { formatDate } from '@/lib/utils'

interface MockDocument {
  id: string
  type: DocumentType
  title: string
  status: DocumentStatus
  expiresAt: Date | null
  fileUrl: string | null
  notes: string
}

const MOCK_DOCUMENTS: MockDocument[] = [
  {
    id: 'doc-1',
    type: 'ASSURANCE_DECENNALE',
    title: 'Assurance Décennale 2024',
    status: 'VALIDE',
    expiresAt: new Date('2025-12-31'),
    fileUrl: '#',
    notes: 'MAF Assurances - Police n°DEC-2024-00892',
  },
  {
    id: 'doc-2',
    type: 'RESPONSABILITE_CIVILE',
    title: 'Responsabilité Civile Professionnelle',
    status: 'EXPIRE_BIENTOT',
    expiresAt: new Date('2024-07-31'),
    fileUrl: '#',
    notes: 'Expire dans 35 jours - Renouveler rapidement',
  },
  {
    id: 'doc-3',
    type: 'ATTESTATION_URSSAF',
    title: 'Attestation URSSAF',
    status: 'VALIDE',
    expiresAt: new Date('2024-09-30'),
    fileUrl: '#',
    notes: "Valable jusqu'en septembre 2024",
  },
  {
    id: 'doc-4',
    type: 'CONDITIONS_GENERALES',
    title: 'CGV 2024 mises à jour',
    status: 'VALIDE',
    expiresAt: null,
    fileUrl: '#',
    notes: 'Version 3.1 - Validées par juriste',
  },
  {
    id: 'doc-5',
    type: 'CHECKLIST_SECURITE',
    title: 'Protocole sécurité chantier',
    status: 'EXPIRE',
    expiresAt: new Date('2024-03-31'),
    fileUrl: '#',
    notes: 'À renouveler - Audit annuel requis',
  },
  {
    id: 'doc-6',
    type: 'ATTESTATION_URSSAF',
    title: 'Attestation fiscale',
    status: 'MANQUANT',
    expiresAt: null,
    fileUrl: null,
    notes: 'Document requis pour sous-traitance',
  },
]

const CERTIFICATIONS = [
  { label: 'RGE Qualibat (Rénovation énergétique)', checked: true },
  { label: 'Qualipac (Pompes à chaleur)', checked: false },
  { label: 'QualiSol', checked: false },
  { label: 'CACES nacelle', checked: true },
]

function StatusBadge({ status }: { status: DocumentStatus }) {
  const configs: Record<DocumentStatus, { label: string; className: string }> = {
    VALIDE: { label: 'Valide', className: 'bg-green-100 text-green-700' },
    EXPIRE_BIENTOT: { label: 'Expire bientôt', className: 'bg-orange-100 text-orange-700' },
    EXPIRE: { label: 'Expiré', className: 'bg-red-100 text-red-700' },
    MANQUANT: { label: 'Manquant', className: 'bg-gray-100 text-gray-600' },
  }
  const cfg = configs[status]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}

export default function DocumentsPage() {
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  const counts = {
    valides: MOCK_DOCUMENTS.filter((d) => d.status === 'VALIDE').length,
    expireBientot: MOCK_DOCUMENTS.filter((d) => d.status === 'EXPIRE_BIENTOT').length,
    expires: MOCK_DOCUMENTS.filter((d) => d.status === 'EXPIRE').length,
    manquants: MOCK_DOCUMENTS.filter((d) => d.status === 'MANQUANT').length,
  }

  const hasExpired = counts.expires > 0
  const hasExpiringSoon = counts.expireBientot > 0

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents &amp; Conformité</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gérez vos documents légaux et certifications</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
            ⚠ Simulation — données fictives
          </span>
          <button
            onClick={() => showToast('Simulation — fonctionnalité disponible en version PRO')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Upload className="h-4 w-4" />
            Ajouter un document
          </button>
        </div>
      </div>

      {/* Alert banners */}
      {hasExpired && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <p className="text-sm font-medium text-red-800">
            ⚠ Document(s) expiré(s) — Votre activité peut être bloquée
          </p>
        </div>
      )}
      {!hasExpired && hasExpiringSoon && (
        <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl p-4">
          <Clock className="h-5 w-5 text-orange-600 flex-shrink-0" />
          <p className="text-sm font-medium text-orange-800">
            ⚠ 1 document expire dans moins de 30 jours
          </p>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Valides</span>
          </div>
          <p className="text-3xl font-bold text-green-700">{counts.valides}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="h-5 w-5 text-orange-600" />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Expire bientôt</span>
          </div>
          <p className="text-3xl font-bold text-orange-700">{counts.expireBientot}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <FileX className="h-5 w-5 text-red-600" />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Expirés</span>
          </div>
          <p className="text-3xl font-bold text-red-700">{counts.expires}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <FileQuestion className="h-5 w-5 text-gray-400" />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Manquants</span>
          </div>
          <p className="text-3xl font-bold text-gray-600">{counts.manquants}</p>
        </div>
      </div>

      {/* Documents table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Mes documents</h2>
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
              {MOCK_DOCUMENTS.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3.5 pr-4">
                    <span className="text-xs text-gray-500 font-medium">
                      {DOCUMENT_TYPE_LABELS[doc.type]}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4">
                    <p className="font-medium text-gray-900">{doc.title}</p>
                    {doc.notes && (
                      <p className="text-xs text-gray-400 mt-0.5">{doc.notes}</p>
                    )}
                  </td>
                  <td className="py-3.5 pr-4">
                    <StatusBadge status={doc.status} />
                  </td>
                  <td className="py-3.5 pr-4">
                    {doc.expiresAt ? (
                      <span className={doc.status === 'EXPIRE_BIENTOT' ? 'text-orange-700 font-medium text-sm' : 'text-gray-600 text-sm'}>
                        {doc.status === 'EXPIRE_BIENTOT' && '⚠ J-35  '}
                        {formatDate(doc.expiresAt)}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        disabled
                        className="flex items-center gap-1 text-xs text-gray-400 cursor-not-allowed"
                        title="Simulation"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Voir
                      </button>
                      <button
                        disabled
                        className="flex items-center gap-1 text-xs text-gray-400 cursor-not-allowed"
                        title="Simulation"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Télécharger
                      </button>
                      {(doc.status === 'EXPIRE' || doc.status === 'EXPIRE_BIENTOT') && (
                        <button
                          onClick={() => showToast('Simulation — fonctionnalité disponible en version PRO')}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          Renouveler
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Certifications section */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Award className="h-5 w-5 text-blue-600" />
          <h2 className="text-base font-semibold text-gray-900">Certifications &amp; Qualifications</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {CERTIFICATIONS.map((cert) => (
            <label key={cert.label} className="flex items-center gap-3 cursor-default">
              <div
                className={`h-5 w-5 rounded flex items-center justify-center flex-shrink-0 ${
                  cert.checked ? 'bg-blue-600' : 'border-2 border-gray-300 bg-white'
                }`}
              >
                {cert.checked && (
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 12 12">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className={`text-sm ${cert.checked ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                {cert.label}
              </span>
            </label>
          ))}
        </div>
        <button
          onClick={() => showToast('Simulation — fonctionnalité disponible en version PRO')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Gérer mes certifications
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm z-50 shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}
