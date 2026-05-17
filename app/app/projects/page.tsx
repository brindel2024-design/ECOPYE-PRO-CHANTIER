'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Search, Plus, Building2, Calendar, TrendingUp, TrendingDown, Loader2 } from 'lucide-react'
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

const FILTER_OPTIONS = [
  { value: 'tous', label: 'Tous' },
  { value: 'EN_COURS', label: 'En cours' },
  { value: 'PREPARATION', label: 'Préparation' },
  { value: 'LITIGE_POTENTIEL', label: 'Litige potentiel' },
  { value: 'EN_ATTENTE_ACOMPTE', label: 'Attente acompte' },
  { value: 'TERMINE', label: 'Terminé' },
]

interface Project {
  id: string
  title: string
  city: string
  status: string
  riskLevel: string
  progress: number
  plannedBudget: number
  actualBudget: number
  startDate: string | null
  endDate: string | null
  client?: { firstName: string; lastName: string }
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('tous')

  const fetch_ = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (statusFilter !== 'tous') params.set('status', statusFilter)
    const res = await fetch(`/api/projects?${params}`)
    if (res.ok) { const d = await res.json(); setProjects(d.data ?? []) }
    setLoading(false)
  }, [search, statusFilter])

  useEffect(() => { fetch_() }, [fetch_])

  const stats = [
    { label: 'En cours', value: projects.filter(p => p.status === 'EN_COURS').length, color: 'text-blue-600' },
    { label: 'En préparation', value: projects.filter(p => p.status === 'PREPARATION').length, color: 'text-yellow-600' },
    { label: 'Litige', value: projects.filter(p => p.status === 'LITIGE_POTENTIEL').length, color: 'text-red-600' },
    { label: 'Attente acompte', value: projects.filter(p => p.status === 'EN_ATTENTE_ACOMPTE').length, color: 'text-orange-600' },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chantiers</h1>
          <p className="text-sm text-gray-500 mt-0.5">{projects.length} chantier{projects.length > 1 ? 's' : ''} au total</p>
        </div>
        <Link href="/app/projects/new" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" />Nouveau chantier
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Rechercher un chantier..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none">
          {FILTER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Building2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm mb-3">Aucun chantier trouvé</p>
          <Link href="/app/projects/new" className="text-sm text-blue-600 hover:underline">Créer un chantier</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {projects.map(project => {
            const clientName = project.client ? `${project.client.firstName} ${project.client.lastName}` : '—'
            const overBudget = project.actualBudget > 0 && project.actualBudget > project.plannedBudget
            return (
              <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-gray-900 text-sm leading-tight">{project.title}</h2>
                    <p className="text-xs text-gray-500 mt-0.5">{clientName} · {project.city}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[project.status] ?? 'text-gray-600 bg-gray-100'}`}>
                      {PROJECT_STATUS_LABELS[project.status as ProjectStatus] ?? project.status}
                    </span>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${getRiskColor(project.riskLevel)}`}>
                      Risque {project.riskLevel.toLowerCase()}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Avancement</span><span className="font-medium">{project.progress}%</span></div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${project.progress}%` }} />
                  </div>
                </div>
                <div className="flex gap-4 text-sm">
                  <div><p className="text-xs text-gray-400">Budget prévu</p><p className="font-medium text-gray-900">{formatCurrency(project.plannedBudget)}</p></div>
                  <div><p className="text-xs text-gray-400">Réalisé</p>
                    <p className={`font-medium flex items-center gap-1 ${overBudget ? 'text-red-600' : project.actualBudget > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                      {project.actualBudget > 0 ? <>{overBudget ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}{formatCurrency(project.actualBudget)}</> : '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{project.startDate ? formatDate(project.startDate) : '—'} → {project.endDate ? formatDate(project.endDate) : '—'}</span>
                  </div>
                  <Link href={`/app/projects/${project.id}`} className="text-xs font-medium text-blue-600 hover:underline">Voir le chantier →</Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
