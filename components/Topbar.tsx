'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Bell, Menu, Search, HardHat } from 'lucide-react'
import { getInitials } from '@/lib/utils'

interface TopbarProps {
  onMenuClick: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { data: session } = useSession()
  const [companyName, setCompanyName] = useState<string>('')

  useEffect(() => {
    fetch('/api/company')
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j?.data?.name) setCompanyName(j.data.name)
      })
      .catch(() => {})
  }, [])

  return (
    <header className="flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 lg:px-6">
      {/* Bouton menu mobile */}
      <button
        onClick={onMenuClick}
        aria-label="Ouvrir le menu de navigation"
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Logo mobile */}
      <div className="flex items-center gap-2 lg:hidden">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
          <HardHat className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-bold text-gray-900">ECOPYE Pro</span>
      </div>

      {/* Recherche */}
      <div className="hidden flex-1 max-w-md lg:flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
        <Search className="h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un client, chantier, devis..."
          className="flex-1 bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">

        {/* Notifications */}
        <button aria-label="Notifications" className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" aria-hidden="true" />
        </button>

        {/* Avatar utilisateur */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white" aria-hidden="true">
            {session?.user?.name ? getInitials(session.user.name) : '–'}
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-medium text-gray-900">
              {session?.user?.name ?? session?.user?.email ?? 'Mon compte'}
            </p>
            {companyName && (
              <p className="text-xs text-gray-500 truncate max-w-[180px]">{companyName}</p>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
