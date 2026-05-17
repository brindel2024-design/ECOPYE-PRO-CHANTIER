'use client'

import { ChevronLeft, ChevronRight, Plus, AlertTriangle, Clock } from 'lucide-react'
import { getInitials } from '@/lib/utils'

type EventType = 'CHANTIER' | 'VISITE' | 'RDV' | 'RECEPTION'
type EventColor = 'blue' | 'green' | 'orange' | 'purple' | 'yellow'

interface ScheduleEvent {
  id: string
  date: string
  day: string
  technician: string
  project: string
  time: string
  type: EventType
  color: EventColor
}

const MOCK_SCHEDULE: ScheduleEvent[] = [
  { id: 'ev1', date: '2024-06-24', day: 'Lundi', technician: 'Karim Benali', project: 'Rénovation SDB - Marie Laurent', time: '08h00 - 12h00', type: 'CHANTIER', color: 'blue' },
  { id: 'ev2', date: '2024-06-24', day: 'Lundi', technician: 'Lucas Petit', project: 'Pose carrelage - Nadia Ferrand', time: '09h00 - 17h00', type: 'CHANTIER', color: 'green' },
  { id: 'ev3', date: '2024-06-25', day: 'Mardi', technician: 'Karim Benali', project: 'Rénovation SDB - Marie Laurent', time: '08h00 - 17h00', type: 'CHANTIER', color: 'blue' },
  { id: 'ev4', date: '2024-06-26', day: 'Mercredi', technician: 'Jean Durand', project: 'Visite chantier Marseille', time: '10h00 - 12h00', type: 'VISITE', color: 'orange' },
  { id: 'ev5', date: '2024-06-26', day: 'Mercredi', technician: 'Lucas Petit', project: 'Pose carrelage - Nadia Ferrand', time: '09h00 - 17h00', type: 'CHANTIER', color: 'green' },
  { id: 'ev6', date: '2024-06-27', day: 'Jeudi', technician: 'Karim Benali', project: 'Mise aux normes électrique', time: '08h00 - 16h00', type: 'CHANTIER', color: 'purple' },
  { id: 'ev7', date: '2024-06-27', day: 'Jeudi', technician: 'Jean Durand', project: 'RDV client Marie Laurent', time: '17h00 - 18h00', type: 'RDV', color: 'yellow' },
  { id: 'ev8', date: '2024-06-28', day: 'Vendredi', technician: 'Karim Benali', project: 'Finitions SDB', time: '08h00 - 12h00', type: 'CHANTIER', color: 'blue' },
  { id: 'ev9', date: '2024-06-28', day: 'Vendredi', technician: 'Lucas Petit', project: 'Réception client Toulouse', time: '14h00 - 16h00', type: 'RECEPTION', color: 'green' },
]

const DAYS = [
  { key: 'Lundi', date: '2024-06-24', label: 'Lun 24' },
  { key: 'Mardi', date: '2024-06-25', label: 'Mar 25' },
  { key: 'Mercredi', date: '2024-06-26', label: 'Mer 26' },
  { key: 'Jeudi', date: '2024-06-27', label: 'Jeu 27' },
  { key: 'Vendredi', date: '2024-06-28', label: 'Ven 28' },
]

const COLOR_CLASSES: Record<EventColor, { border: string; bg: string; text: string; badge: string }> = {
  blue: { border: 'border-blue-400', bg: 'bg-blue-50', text: 'text-blue-900', badge: 'bg-blue-100 text-blue-700' },
  green: { border: 'border-green-400', bg: 'bg-green-50', text: 'text-green-900', badge: 'bg-green-100 text-green-700' },
  orange: { border: 'border-orange-400', bg: 'bg-orange-50', text: 'text-orange-900', badge: 'bg-orange-100 text-orange-700' },
  purple: { border: 'border-purple-400', bg: 'bg-purple-50', text: 'text-purple-900', badge: 'bg-purple-100 text-purple-700' },
  yellow: { border: 'border-yellow-400', bg: 'bg-yellow-50', text: 'text-yellow-900', badge: 'bg-yellow-100 text-yellow-700' },
}

const TYPE_LABELS: Record<EventType, string> = {
  CHANTIER: 'Chantier',
  VISITE: 'Visite',
  RDV: 'RDV',
  RECEPTION: 'Réception',
}

function parseHours(time: string): number {
  const start = time.split(' - ')[0]
  const [h, m] = start.replace('h', ':').split(':').map(Number)
  return h + (m || 0) / 60
}

function parseDuration(time: string): number {
  const parts = time.split(' - ')
  const toH = (t: string) => {
    const [h, m] = t.replace('h', ':').split(':').map(Number)
    return h + (m || 0) / 60
  }
  return toH(parts[1]) - toH(parts[0])
}

// Unique technicians
const TECHNICIANS = [...new Set(MOCK_SCHEDULE.map((e) => e.technician))]

function calcTechnicianHours(name: string): number {
  return MOCK_SCHEDULE
    .filter((e) => e.technician === name)
    .reduce((acc, e) => acc + parseDuration(e.time), 0)
}

export default function SchedulePage() {
  const weekLabel = `Semaine du 24 au 28 juin 2024`

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Planning</h1>
          <p className="text-sm text-gray-500 mt-0.5">{weekLabel}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
            <AlertTriangle className="h-3 w-3" />
            Simulation — données fictives
          </span>
          <button
            onClick={() => alert('Simulation — fonctionnalité non disponible')}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Ajouter intervention
          </button>
        </div>
      </div>

      {/* Week selector */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => alert('Simulation — navigation semaine non disponible')}
          className="rounded-lg border border-gray-200 p-1.5 hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        </button>
        <span className="text-sm font-medium text-gray-700">{weekLabel}</span>
        <button
          onClick={() => alert('Simulation — navigation semaine non disponible')}
          className="rounded-lg border border-gray-200 p-1.5 hover:bg-gray-50 transition-colors"
        >
          <ChevronRight className="h-4 w-4 text-gray-600" />
        </button>
      </div>

      {/* Desktop calendar grid */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        {/* Day headers */}
        <div className="grid grid-cols-5 border-b border-gray-100">
          {DAYS.map((day) => (
            <div key={day.key} className="px-3 py-3 text-center">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{day.label}</p>
            </div>
          ))}
        </div>
        {/* Events */}
        <div className="grid grid-cols-5 gap-0 min-h-[300px]">
          {DAYS.map((day) => {
            const events = MOCK_SCHEDULE.filter((e) => e.day === day.key)
            return (
              <div key={day.key} className="p-2 border-r border-gray-50 last:border-r-0 flex flex-col gap-2">
                {events.length === 0 && (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-xs text-gray-300">Libre</p>
                  </div>
                )}
                {events.map((ev) => {
                  const colors = COLOR_CLASSES[ev.color]
                  return (
                    <div
                      key={ev.id}
                      className={`rounded-lg border-l-4 p-2 ${colors.border} ${colors.bg}`}
                    >
                      {/* Technician avatar */}
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className={`h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${colors.badge}`}>
                          {getInitials(ev.technician)}
                        </div>
                        <span className={`text-xs font-medium truncate ${colors.text}`}>{ev.technician}</span>
                      </div>
                      <p className={`text-xs font-medium leading-tight mb-1 ${colors.text}`}>{ev.project}</p>
                      <div className={`flex items-center gap-1 text-xs opacity-70 ${colors.text}`}>
                        <Clock className="h-3 w-3 shrink-0" />
                        {ev.time}
                      </div>
                      <span className={`inline-block mt-1 rounded-full px-1.5 py-0.5 text-xs font-medium ${colors.badge}`}>
                        {TYPE_LABELS[ev.type]}
                      </span>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      {/* Mobile list view */}
      <div className="md:hidden space-y-4 mb-6">
        {DAYS.map((day) => {
          const events = MOCK_SCHEDULE.filter((e) => e.day === day.key)
          if (events.length === 0) return null
          return (
            <div key={day.key}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{day.label}</h3>
              <div className="space-y-2">
                {events.map((ev) => {
                  const colors = COLOR_CLASSES[ev.color]
                  return (
                    <div key={ev.id} className={`rounded-lg border-l-4 p-3 ${colors.border} ${colors.bg}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={`text-sm font-medium ${colors.text}`}>{ev.project}</p>
                          <p className={`text-xs opacity-70 ${colors.text}`}>{ev.technician}</p>
                          <div className={`flex items-center gap-1 text-xs mt-1 opacity-70 ${colors.text}`}>
                            <Clock className="h-3 w-3" />
                            {ev.time}
                          </div>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium shrink-0 ${colors.badge}`}>
                          {TYPE_LABELS[ev.type]}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Workload summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Charge de travail — semaine</h2>
        <div className="space-y-3">
          {TECHNICIANS.map((name) => {
            const hours = calcTechnicianHours(name)
            const maxHours = 40
            const pct = Math.min((hours / maxHours) * 100, 100)
            return (
              <div key={name} className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 shrink-0">
                  {getInitials(name)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span className="font-medium">{name}</span>
                    <span>{hours}h / {maxHours}h</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${pct >= 80 ? 'bg-orange-400' : 'bg-blue-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
