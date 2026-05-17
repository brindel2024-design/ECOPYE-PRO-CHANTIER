'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Plus, Clock, Loader2, X } from 'lucide-react'

const DAY_NAMES = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
const DAY_NAMES_FULL = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

interface ScheduleEvent {
  id: string; title: string; description: string | null
  startDate: string; endDate: string; status: string
  location: string | null; color: string
  project: { id: string; title: string; city: string } | null
  technician: { id: string; firstName: string; lastName: string } | null
}

function getWeekRange(date: Date): { start: Date; end: Date; days: Date[] } {
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  const start = new Date(date.getFullYear(), date.getMonth(), diff)
  const end = new Date(date.getFullYear(), date.getMonth(), diff + 6)
  const days = Array.from({ length: 7 }, (_, i) => new Date(date.getFullYear(), date.getMonth(), diff + i))
  return { start, end, days }
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}h${String(d.getMinutes()).padStart(2, '0')}`
}

function isSameDay(d1: Date, iso: string): boolean {
  const d2 = new Date(iso)
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate()
}

export default function SchedulePage() {
  const [weekDate, setWeekDate] = useState(new Date())
  const [events, setEvents] = useState<ScheduleEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', startDate: '', endDate: '', location: '', color: '#3b82f6' })
  const [saving, setSaving] = useState(false)

  const { start, end, days } = getWeekRange(weekDate)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({
      start: start.toISOString(),
      end: new Date(end.getTime() + 86400000).toISOString(),
    })
    const res = await fetch(`/api/schedule?${params}`)
    if (res.ok) { const d = await res.json(); setEvents(d.data ?? []) }
    setLoading(false)
  }, [start.toISOString(), end.toISOString()]) // eslint-disable-line

  useEffect(() => { load() }, [load])

  function prevWeek() { setWeekDate(d => new Date(d.getTime() - 7 * 86400000)) }
  function nextWeek() { setWeekDate(d => new Date(d.getTime() + 7 * 86400000)) }

  async function handleAdd() {
    if (!form.title || !form.startDate || !form.endDate) return
    setSaving(true)
    await fetch('/api/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: form.title, startDate: form.startDate, endDate: form.endDate, location: form.location || null, color: form.color }),
    })
    setSaving(false)
    setShowModal(false)
    setForm({ title: '', startDate: '', endDate: '', location: '', color: '#3b82f6' })
    load()
  }

  const weekLabel = `Semaine du ${start.getDate()} au ${end.getDate()} ${start.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Planning</h1>
          <p className="text-sm text-gray-500 mt-0.5">{weekLabel}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />Ajouter intervention
        </button>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <button onClick={prevWeek} className="rounded-lg border border-gray-200 p-1.5 hover:bg-gray-50">
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        </button>
        <span className="text-sm font-medium text-gray-700">{weekLabel}</span>
        <button onClick={nextWeek} className="rounded-lg border border-gray-200 p-1.5 hover:bg-gray-50">
          <ChevronRight className="h-4 w-4 text-gray-600" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
      ) : (
        <>
          {/* Desktop grid */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="grid grid-cols-7 border-b border-gray-100">
              {days.map((day) => (
                <div key={day.toISOString()} className="px-2 py-3 text-center">
                  <p className="text-xs font-semibold text-gray-500 uppercase">{DAY_NAMES[day.getDay()]} {day.getDate()}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 min-h-[300px]">
              {days.map((day) => {
                const dayEvents = events.filter(e => isSameDay(day, e.startDate))
                return (
                  <div key={day.toISOString()} className="p-2 border-r border-gray-50 last:border-r-0 flex flex-col gap-2">
                    {dayEvents.length === 0 && (
                      <div className="h-full flex items-center justify-center"><p className="text-xs text-gray-300">Libre</p></div>
                    )}
                    {dayEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className="rounded-lg border-l-4 p-2"
                        style={{ borderColor: ev.color, backgroundColor: ev.color + '18' }}
                      >
                        <p className="text-xs font-medium leading-tight mb-0.5" style={{ color: ev.color }}>{ev.title}</p>
                        {ev.project && <p className="text-xs opacity-70" style={{ color: ev.color }}>{ev.project.title}</p>}
                        {ev.technician && <p className="text-xs opacity-60" style={{ color: ev.color }}>{ev.technician.firstName} {ev.technician.lastName}</p>}
                        <div className="flex items-center gap-1 text-xs opacity-70 mt-0.5" style={{ color: ev.color }}>
                          <Clock className="h-3 w-3 shrink-0" />
                          {formatTime(ev.startDate)} - {formatTime(ev.endDate)}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Mobile list */}
          <div className="md:hidden space-y-4 mb-6">
            {days.map((day) => {
              const dayEvents = events.filter(e => isSameDay(day, e.startDate))
              if (dayEvents.length === 0) return null
              return (
                <div key={day.toISOString()}>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    {DAY_NAMES_FULL[day.getDay()]} {day.getDate()}
                  </h3>
                  <div className="space-y-2">
                    {dayEvents.map((ev) => (
                      <div key={ev.id} className="rounded-lg border-l-4 p-3" style={{ borderColor: ev.color, backgroundColor: ev.color + '18' }}>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium" style={{ color: ev.color }}>{ev.title}</p>
                            {ev.project && <p className="text-xs opacity-70" style={{ color: ev.color }}>{ev.project.title}</p>}
                            {ev.technician && <p className="text-xs opacity-60" style={{ color: ev.color }}>{ev.technician.firstName} {ev.technician.lastName}</p>}
                            <div className="flex items-center gap-1 text-xs mt-1 opacity-70" style={{ color: ev.color }}>
                              <Clock className="h-3 w-3" />{formatTime(ev.startDate)} - {formatTime(ev.endDate)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
            {events.length === 0 && (
              <p className="text-center text-sm text-gray-400 py-12">Aucune intervention cette semaine</p>
            )}
          </div>

          {events.length === 0 && (
            <div className="hidden md:flex items-center justify-center py-12 text-sm text-gray-400">
              Aucune intervention planifiée cette semaine
            </div>
          )}
        </>
      )}

      {/* Add event modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">Nouvelle intervention</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Titre *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: Pose carrelage" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Début *</label>
                  <input type="datetime-local" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Fin *</label>
                  <input type="datetime-local" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Lieu</label>
                <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Adresse du chantier" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Couleur</label>
                <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                  className="h-9 w-full rounded-lg border border-gray-200 cursor-pointer" />
              </div>
            </div>
            <button onClick={handleAdd} disabled={saving || !form.title || !form.startDate || !form.endDate}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Ajouter
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
