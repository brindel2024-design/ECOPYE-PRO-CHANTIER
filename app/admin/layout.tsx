'use client'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import {
  Shield,
  BarChart3,
  Building2,
  CreditCard,
  LifeBuoy,
  LogOut,
} from 'lucide-react'
import Link from 'next/link'

const NAV_ITEMS = [
  { href: '/admin', label: "Vue d'ensemble", icon: BarChart3 },
  { href: '/admin/companies', label: 'Entreprises', icon: Building2 },
  { href: '/admin/subscriptions', label: 'Abonnements', icon: CreditCard },
  { href: '/admin/support', label: 'Support', icon: LifeBuoy },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  const role = (session?.user as { role?: string } | undefined)?.role

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    if (role !== 'ECOPYE_ADMIN') {
      router.push('/app/dashboard')
    }
  }, [session, status, role, router])

  if (status === 'loading' || !session || role !== 'ECOPYE_ADMIN') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400 text-sm">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar admin */}
      <aside className="w-64 bg-slate-800 flex flex-col min-h-screen fixed left-0 top-0 z-40">
        {/* En-tête sidebar */}
        <div className="p-5 border-b border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-red-400" />
            <span className="text-white font-bold text-lg">ECOPYE</span>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-md">
            <Shield className="w-3 h-3" />
            ADMIN
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Utilisateur connecté + déconnexion */}
        <div className="p-4 border-t border-slate-700">
          <div className="mb-3 px-3">
            <p className="text-slate-400 text-xs">Connecté en tant que</p>
            <p className="text-white text-sm font-medium truncate">
              {session?.user?.email ?? 'Administrateur'}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-2 w-full px-3 py-2 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 ml-64 min-h-screen">
        {children}
      </main>
    </div>
  )
}
