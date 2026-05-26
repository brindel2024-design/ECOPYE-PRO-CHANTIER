'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, MapPin, Calendar, CheckCircle2, Circle, XCircle, Phone,
  FileText, Image as ImageIcon, StickyNote, Loader2, TrendingUp, Trash2,
} from 'lucide-react'
import { PROJECT_STATUS_LABELS, ProjectStatus } from '@/lib/types'
import { formatCurrency, formatDate, getRiskColor } from '@/lib/utils'
import { ProofDossier } from '@/components/ProofDossier'
import { ReceptionSection } from '@/components/ReceptionSection'
import { ProfitabilitySection } from '@/components/ProfitabilitySection'

const STATUS_COLORS: Record<string, string> = {
  EN_COURS: 'text-blue-700 bg-blue-100',
  PREPARATION: 'text-yellow-700 bg-yellow-100',
  LITIGE_POTENTIEL: 'text-red-700 bg-red-100',
  EN_ATTENTE_ACOMPTE: 'text-orange-700 bg-orange-100',
  TERMINE: 'text-green-700 bg-green-100',
  CONTROLE_QUALITE: 'text-purple-700 bg-purple-100',
  RECEPTION_CLIENT: 'text-teal-700 bg-teal-100',
  ANNULE: 'text-gray-600 bg-gray-100',
}

const STEP_STATUS_LABELS: Record<string, string> = {
  EN_ATTENTE: 'En attente', EN_COURS: 'En cours', TERMINE: 'Terminé',
  VALIDE_CLIENT: 'Validé client', PROBLEME: 'Problème',
}

const STEP_STATUS_COLORS: Record<string, string> = {
  EN_ATTENTE: 'text-gray-500 bg-gray-100',
  EN_COURS: 'text-blue-700 bg-blue-100',
  TERMINE: 'text-green-700 bg-green-100',
  VALIDE_CLIENT: 'text-green-700 bg-green-100',
  PROBLEME: 'text-red-700 bg-red-100',
}

function StepIcon({ status }: { status: string }) {
  if (status === 'VALIDE_CLIENT' || status === 'TERMINE') {
    return <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100"><CheckCircle2 className="h-4 w-4 text-green-600" /></span>
  }
  if (status === 'EN_COURS') {
    return <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100"><span className="h-3 w-3 rounded-full bg-blue-500 animate-pulse" /></span>
  }
  if (status === 'PROBLEME') {
    return <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100"><XCircle className="h-4 w-4 text-red-600" /></span>
  }
  return <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100"><Circle className="h-4 w-4 text-gray-400" /></span>
}

interface ProjectStep {
  id: string; title: string; status: string; order: number; validatedByClient: boolean
}

interface ProjectData {
  id: string; title: string; description: string | null
  status: string; riskLevel: string; progress: number
  address: string; city: string; postalCode: string
  plannedBudget: number; actualBudget: number
  startDate: string | null; endDate: string | null; notes: string | null
  client: { id: string; firstName: string; lastName: string; phone: string; city: string } | null
  steps: ProjectStep[]
  _count: { photos: number }
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [deleting, setDeleting] = useState(false)
  const [proofKey, setProofKey] = useState(0)
  const [project, setProject] = useState<ProjectData | null>(null)
  const [company, setCompany] = useState<{ name: string; siret: string | null; address: string; city: string; phone: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [noteSaving, setNoteSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const [pRes, cRes] = await Promise.all([
      fetch(`/api/projects/${id}`),
      fetch('/api/company'),
    ])
    if (pRes.ok) { const d = await pRes.json(); setProject(d.data) }
    if (cRes.ok) { const d = await cRes.json(); setCompany(d.data) }
    setLoading(false)
  }, [id])

  async function handleDelete() {
    if (!confirm('Supprimer définitivement ce chantier ? Les photos et étapes associées seront aussi supprimées.')) return
    setDeleting(true)
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/app/projects')
    } else {
      const j = await res.json().catch(() => ({}))
      setToast(j.error || 'Suppression impossible'); setTimeout(() => setToast(null), 3000)
      setDeleting(false)
    }
  }

  function openNoteModal() {
    setNoteText(project?.notes ?? '')
    setShowNoteModal(true)
  }

  async function handleSaveNote() {
    if (!project) return
    setNoteSaving(true)
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: noteText }),
    })
    setNoteSaving(false)
    if (res.ok) {
      setShowNoteModal(false)
      load()
      setToast('Note enregistrée'); setTimeout(() => setToast(null), 3000)
    } else {
      setToast('Erreur lors de l\'enregistrement'); setTimeout(() => setToast(null), 3000)
    }
  }

  async function handleGenerateReport() {
    if (!project) return
    if (!company) { setToast('Données entreprise indisponibles'); setTimeout(() => setToast(null), 3000); return }
    const { generateProjectReportPdf } = await import('@/lib/generate-pdf')
    await generateProjectReportPdf({
      title: project.title,
      description: project.description,
      status: project.status,
      progress: project.progress,
      address: project.address,
      city: project.city,
      postalCode: project.postalCode,
      plannedBudget: project.plannedBudget,
      actualBudget: project.actualBudget,
      startDate: project.startDate,
      endDate: project.endDate,
      notes: project.notes,
      client: project.client,
      company: {
        name: company.name,
        siret: company.siret,
        address: company.address,
        city: company.city,
        phone: company.phone,
      },
      steps: (project.steps ?? []).map(s => ({
        title: s.title,
        status: s.status,
        validatedByClient: s.validatedByClient,
      })),
    })
  }

  useEffect(() => { load() }, [load])

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
  }

  if (!project) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Link href="/app/projects" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="h-4 w-4" /> Retour aux chantiers
        </Link>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
          <p className="text-lg font-medium">Chantier introuvable</p>
        </div>
      </div>
    )
  }

  const statusColor = STATUS_COLORS[project.status] || 'text-gray-600 bg-gray-100'
  const riskColor = getRiskColor(project.riskLevel)
  const overBudget = project.actualBudget > 0 && project.actualBudget > project.plannedBudget
  const budgetDiff = project.actualBudget > 0 ? Math.abs(project.actualBudget - project.plannedBudget) : null
  const steps = [...(project.steps ?? [])].sort((a, b) => a.order - b.order)

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm">
          {toast}
        </div>
      )}

      <Link href="/app/projects" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="h-4 w-4" /> Retour aux chantiers
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{project.title}</h1>
            {project.description && <p className="text-sm text-gray-500 mt-1">{project.description}</p>}
            <div className="flex items-center gap-1.5 mt-2 text-sm text-gray-500">
              <MapPin className="h-4 w-4" />
              {project.address}, {project.postalCode} {project.city}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              Du {project.startDate ? formatDate(project.startDate) : '—'} au {project.endDate ? formatDate(project.endDate) : '—'}
            </div>
          </div>
          <div className="flex flex-col gap-2 items-start sm:items-end">
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor}`}>
              {PROJECT_STATUS_LABELS[project.status as ProjectStatus] || project.status}
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${riskColor}`}>
              Risque {project.riskLevel.toLowerCase()}
            </span>
          </div>
        </div>
        <div className="mt-5">
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-gray-600 font-medium">Avancement global</span>
            <span className="font-bold text-gray-900">{project.progress}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${project.progress}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Budget</h2>
          <div className="flex gap-8">
            <div>
              <p className="text-xs text-gray-400 mb-1">Budget prévu</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(project.plannedBudget)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Réalisé à ce jour</p>
              <p className={`text-2xl font-bold ${overBudget ? 'text-red-600' : project.actualBudget > 0 ? 'text-green-600' : 'text-gray-300'}`}>
                {project.actualBudget > 0 ? formatCurrency(project.actualBudget) : '—'}
              </p>
            </div>
          </div>
          {budgetDiff !== null && (
            <p className={`mt-3 text-sm font-medium flex items-center gap-1 ${overBudget ? 'text-red-600' : 'text-green-600'}`}>
              <TrendingUp className="h-4 w-4" />
              {overBudget ? `Dépassement de ${formatCurrency(budgetDiff)}` : `Économie de ${formatCurrency(budgetDiff)}`}
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Client</h2>
          {project.client ? (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">
                  {project.client.firstName[0]}{project.client.lastName[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{project.client.firstName} {project.client.lastName}</p>
                  <p className="text-xs text-gray-400">{project.client.city}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-2">
                <Phone className="h-3.5 w-3.5" />{project.client.phone}
              </div>
              <Link href={`/app/clients/${project.client.id}`} className="text-xs text-blue-600 hover:underline mt-2 block">
                Voir la fiche client →
              </Link>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Aucun client associé</p>
          )}
        </div>
      </div>

      {steps.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-5">Étapes du chantier</h2>
          <div className="space-y-0">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <StepIcon status={step.status} />
                  {idx < steps.length - 1 && <div className="w-px flex-1 bg-gray-100 my-1" style={{ minHeight: 16 }} />}
                </div>
                <div className="pb-4 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-sm font-medium ${step.status === 'EN_ATTENTE' ? 'text-gray-400' : 'text-gray-800'}`}>
                      {step.title}
                    </p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STEP_STATUS_COLORS[step.status] || 'text-gray-500 bg-gray-100'}`}>
                      {STEP_STATUS_LABELS[step.status] || step.status}
                    </span>
                    {step.validatedByClient && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle2 className="h-3 w-3" /> Validé client
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {project.notes && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Notes</h2>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{project.notes}</p>
        </div>
      )}

      <div className="mb-6 space-y-4">
        <ProofDossier key={proofKey} projectId={project.id} />
        <ProfitabilitySection projectId={project.id} />
        <ReceptionSection projectId={project.id} onChange={() => setProofKey((k) => k + 1)} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href={`/app/photos?projectId=${project.id}`}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
        >
          <ImageIcon className="h-4 w-4 text-gray-500" aria-hidden="true" />
          Photos du chantier {project._count.photos > 0 && `(${project._count.photos})`}
        </Link>
        <button
          onClick={openNoteModal}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
        >
          <StickyNote className="h-4 w-4 text-gray-500" />{project.notes ? 'Modifier la note' : 'Ajouter une note'}
        </button>
        <button
          onClick={handleGenerateReport}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
        >
          <FileText className="h-4 w-4 text-gray-500" />Générer rapport
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 shadow-sm disabled:opacity-50 sm:ml-auto"
        >
          {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}Supprimer le chantier
        </button>
      </div>

      {showNoteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <h2 className="text-base font-bold text-gray-900">Note du chantier</h2>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={6}
              placeholder="Observations, points de vigilance, échanges client..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNoteModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveNote}
                disabled={noteSaving}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium flex items-center gap-2 disabled:opacity-50"
              >
                {noteSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
