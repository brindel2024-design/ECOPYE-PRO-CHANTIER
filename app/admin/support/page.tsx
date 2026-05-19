'use client'
import { useEffect, useState } from 'react'
import { LifeBuoy, Loader2 } from 'lucide-react'

interface AdminTicket {
  id: string
  subject: string
  message: string
  status: string
  priority: string
  response: string | null
  createdAt: string
  company: { name: string }
  user: { name: string; email: string }
}

const PRIORITY_STYLE: Record<string, string> = {
  URGENT: 'bg-red-100 text-red-700',
  ELEVE: 'bg-orange-100 text-orange-700',
  NORMAL: 'bg-blue-100 text-blue-700',
  FAIBLE: 'bg-gray-100 text-gray-600',
}

const STATUS_STYLE: Record<string, string> = {
  OUVERT: 'bg-red-100 text-red-700',
  EN_COURS: 'bg-blue-100 text-blue-700',
  RESOLU: 'bg-green-100 text-green-700',
  FERME: 'bg-gray-100 text-gray-500',
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<AdminTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [savingId, setSavingId] = useState<string | null>(null)

  function load() {
    fetch('/api/admin/tickets')
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error || 'Erreur')
        return r.json()
      })
      .then((j) => setTickets(j.data ?? []))
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function changeStatus(id: string, status: string) {
    setSavingId(id)
    await fetch('/api/admin/tickets', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    setSavingId(null)
    load()
  }

  const open = tickets.filter((t) => t.status === 'OUVERT').length

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-1">
        <LifeBuoy className="w-6 h-6 text-slate-700" />
        <h1 className="text-2xl font-bold text-slate-900">Support</h1>
      </div>
      <p className="text-slate-500 text-sm mb-6">
        {loading ? '…' : `${tickets.length} ticket(s) · ${open} ouvert(s)`}
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-7 h-7 animate-spin text-slate-400" />
        </div>
      ) : err ? (
        <p className="text-red-600 text-sm py-8 text-center">{err}</p>
      ) : tickets.length === 0 ? (
        <p className="text-slate-400 text-sm py-12 text-center bg-white rounded-xl border border-gray-100">
          Aucun ticket de support
        </p>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <div key={t.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-slate-900">{t.subject}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_STYLE[t.priority] ?? PRIORITY_STYLE.NORMAL}`}>
                      {t.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">
                    {t.company.name} · {t.user.name} ({t.user.email}) · {new Date(t.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">{t.message}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[t.status] ?? STATUS_STYLE.OUVERT}`}>
                    {t.status}
                  </span>
                  <select
                    disabled={savingId === t.id}
                    value={t.status}
                    onChange={(e) => changeStatus(t.id, e.target.value)}
                    className="border border-gray-200 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <option value="OUVERT">Ouvert</option>
                    <option value="EN_COURS">En cours</option>
                    <option value="RESOLU">Résolu</option>
                    <option value="FERME">Fermé</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
