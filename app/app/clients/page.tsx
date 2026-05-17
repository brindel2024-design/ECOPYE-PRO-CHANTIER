'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Users, Plus, Search, Star, Phone, Mail, MapPin, Loader2 } from 'lucide-react'
import { formatDate, getInitials } from '@/lib/utils'
import { EmptyState } from '@/components/EmptyState'

interface Client {
  id: string
  firstName: string
  lastName: string
  type: string
  email: string
  phone: string
  city: string
  postalCode: string
  trustScore: number
  createdAt: string
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'tous' | 'PARTICULIER' | 'PROFESSIONNEL'>('tous')

  const fetchClients = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (filter !== 'tous') params.set('type', filter)
    const res = await fetch(`/api/clients?${params}`)
    if (res.ok) {
      const data = await res.json()
      setClients(data.data ?? [])
    }
    setLoading(false)
  }, [search, filter])

  useEffect(() => { fetchClients() }, [fetchClients])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500 mt-0.5">{clients.length} client{clients.length > 1 ? 's' : ''} enregistré{clients.length > 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/app/clients/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Nouveau client
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div className="flex rounded-lg border border-gray-300 bg-white overflow-hidden">
          {(['tous', 'PARTICULIER', 'PROFESSIONNEL'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              {f === 'tous' ? 'Tous' : f === 'PARTICULIER' ? 'Particuliers' : 'Professionnels'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucun client trouvé"
          description="Ajoutez votre premier client pour commencer à créer des devis."
          actionLabel="Ajouter un client"
          actionHref="/app/clients/new"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Link
              key={client.id}
              href={`/app/clients/${client.id}`}
              className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shrink-0">
                    {getInitials(`${client.firstName} ${client.lastName}`)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{client.firstName} {client.lastName}</p>
                    <span className="text-xs text-gray-400">{client.type === 'PARTICULIER' ? 'Particulier' : 'Professionnel'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className={`h-3.5 w-3.5 ${client.trustScore >= 7 ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                  <span className="text-xs font-medium text-gray-600">{client.trustScore}/10</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-gray-500"><Mail className="h-3.5 w-3.5" /><span className="truncate">{client.email}</span></div>
                <div className="flex items-center gap-2 text-xs text-gray-500"><Phone className="h-3.5 w-3.5" /><span>{client.phone}</span></div>
                <div className="flex items-center gap-2 text-xs text-gray-500"><MapPin className="h-3.5 w-3.5" /><span>{client.city} {client.postalCode}</span></div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400">Client depuis le {formatDate(client.createdAt)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
