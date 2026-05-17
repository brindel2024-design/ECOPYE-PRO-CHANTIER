'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, AlertTriangle, MapPin, Calendar, CheckCircle2,
  Circle, XCircle, Phone, FileText, Image, StickyNote
} from 'lucide-react'
import { MOCK_PROJECTS, MOCK_CLIENTS } from '@/lib/mock-data'
import { PROJECT_STATUS_LABELS, ProjectStatus } from '@/lib/types'
import { formatCurrency, formatDate, getRiskColor } from '@/lib/utils'

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

function StepIcon({ status }: { status: string }) {
  switch (status) {
    case 'VALIDE_CLIENT':
    case 'TERMINE':
      return (
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        </span>
      )
    case 'EN_COURS':
      return (
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100">
          <span className="h-3 w-3 rounded-full bg-blue-500 animate-pulse" />
        </span>
      )
    case 'PROBLEME':
      return (
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100">
          <XCircle className="h-4 w-4 text-red-600" />
        </span>
      )
    default:
      return (
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100">
          <Circle className="h-4 w-4 text-gray-400" />
        </span>
      )
  }
}

const STEP_STATUS_LABELS: Record<string, string> = {
  EN_ATTENTE: 'En attente',
  EN_COURS: 'En cours',
  TERMINE: 'Terminé',
  VALIDE_CLIENT: 'Validé client',
  PROBLEME: 'Problème',
}

const STEP_STATUS_COLORS: Record<string, string> = {
  EN_ATTENTE: 'text-gray-500 bg-gray-100',
  EN_COURS: 'text-blue-700 bg-blue-100',
  TERMINE: 'text-green-700 bg-green-100',
  VALIDE_CLIENT: 'text-green-700 bg-green-100',
  PROBLEME: 'text-red-700 bg-red-100',
}

export default function ProjectDetailPage() {
  const params = useParams()
  const id = params?.id as string

  const project = MOCK_PROJECTS.find((p) => p.id === id)
  if (!project) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Link href="/app/projects" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="h-4 w-4" /> Retour aux chantiers
        </Link>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
          <p className="text-lg font-medium">Chantier introuvable</p>
          <p className="text-sm mt-1">L&apos;identifiant {id} ne correspond à aucun chantier.</p>
        </div>
      </div>
    )
  }

  const client = MOCK_CLIENTS.find((c) => c.id === project.clientId)
  const statusColor = STATUS_COLORS[project.status] || 'text-gray-600 bg-gray-100'
  const riskColor = getRiskColor(project.riskLevel)
  const overBudget = project.actualBudget > 0 && project.actualBudget > project.plannedBudget
  const budgetDiff = project.actualBudget > 0 ? Math.abs(project.actualBudget - project.plannedBudget) : null
  const steps = project.steps ?? []

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back */}
      <Link href="/app/projects" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="h-4 w-4" /> Retour aux chantiers
      </Link>

      {/* Simulation badge */}
      <div className="flex justify-end mb-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
          <AlertTriangle className="h-3 w-3" />
          Simulation — données fictives
        </span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{project.title}</h1>
            {project.description && (
              <p className="text-sm text-gray-500 mt-1">{project.description}</p>
            )}
            <div className="flex items-center gap-1.5 mt-2 text-sm text-gray-500">
              <MapPin className="h-4 w-4" />
              {project.address}, {project.postalCode} {project.city}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              Du {formatDate(project.startDate)} au {formatDate(project.endDate)}
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

        {/* Progress */}
        <div className="mt-5">
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-gray-600 font-medium">Avancement global</span>
            <span className="font-bold text-gray-900">{project.progress}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Budget */}
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
            <p className={`mt-3 text-sm font-medium ${overBudget ? 'text-red-600' : 'text-green-600'}`}>
              {overBudget ? `⚠ Dépassement de ${formatCurrency(budgetDiff)}` : `✓ Économie de ${formatCurrency(budgetDiff)}`}
            </p>
          )}
        </div>

        {/* Client */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Client</h2>
          {client ? (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">
                  {client.firstName[0]}{client.lastName[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{client.firstName} {client.lastName}</p>
                  <p className="text-xs text-gray-400">{client.city}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-2">
                <Phone className="h-3.5 w-3.5" />
                {client.phone}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Client introuvable</p>
          )}
        </div>
      </div>

      {/* Steps timeline */}
      {steps.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-5">Étapes du chantier</h2>
          <div className="space-y-0">
            {steps.sort((a, b) => a.order - b.order).map((step, idx) => (
              <div key={step.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <StepIcon status={step.status} />
                  {idx < steps.length - 1 && (
                    <div className="w-px flex-1 bg-gray-100 my-1" style={{ minHeight: 16 }} />
                  )}
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

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        {[
          { icon: Image, label: 'Photos du chantier' },
          { icon: StickyNote, label: 'Ajouter une note' },
          { icon: FileText, label: 'Générer rapport' },
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            onClick={() => alert('Simulation — fonctionnalité non disponible')}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
          >
            <Icon className="h-4 w-4 text-gray-500" />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
