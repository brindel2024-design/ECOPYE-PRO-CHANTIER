'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  FileText,
  Receipt,
  CreditCard,
  FolderKanban,
  Camera,
  CalendarDays,
  FileCheck,
  BookOpen,
  TrendingUp,
  Sparkles,
  Settings,
  LogOut,
  HardHat,
  X,
  ChevronRight,
} from 'lucide-react'

const navigation = [
  { name: 'Tableau de bord', href: '/app/dashboard', icon: LayoutDashboard },
  { name: 'Clients', href: '/app/clients', icon: Users },
  { name: 'Devis', href: '/app/quotes', icon: FileText },
  { name: 'Chantiers', href: '/app/projects', icon: FolderKanban },
  { name: 'Photos preuves', href: '/app/photos', icon: Camera },
  { name: 'Planning', href: '/app/schedule', icon: CalendarDays },
  { name: 'Factures', href: '/app/invoices', icon: Receipt },
  { name: 'Paiements', href: '/app/payments', icon: CreditCard },
  { name: 'Trésorerie', href: '/app/treasury', icon: TrendingUp },
  { name: 'Documents', href: '/app/documents', icon: FileCheck },
  { name: 'Bibliothèque', href: '/app/library', icon: BookOpen },
  { name: 'Copilote IA', href: '/app/ai', icon: Sparkles },
]

const settingsNav = [
  { name: 'Paramètres', href: '/app/settings', icon: Settings },
]

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col bg-slate-900 text-white">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-700">
        <Link href="/app/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <HardHat className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-sm font-bold text-white">ECOPYE</span>
            <span className="block text-xs text-slate-400 leading-none">Pro Chantier</span>
          </div>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation principale */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <item.icon
                className={cn(
                  'h-4 w-4 shrink-0',
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                )}
              />
              <span className="flex-1">{item.name}</span>
              {isActive && <ChevronRight className="h-3 w-3" />}
            </Link>
          )
        })}
      </nav>

      {/* Bas de la sidebar */}
      <div className="border-t border-slate-700 px-3 py-3 space-y-0.5">
        {settingsNav.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <item.icon className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-white" />
              {item.name}
            </Link>
          )
        })}

        {/* Alerte simulation */}
        <div className="mx-1 my-2 rounded-lg bg-amber-900/30 border border-amber-700/30 px-3 py-2">
          <p className="text-xs text-amber-400 font-medium">⚠ Mode démonstration</p>
          <p className="text-xs text-amber-300/70 mt-0.5">Données fictives — aucun paiement réel</p>
        </div>

        {/* Déconnexion */}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-150"
        >
          <LogOut className="h-4 w-4 text-slate-400" />
          Se déconnecter
        </button>
      </div>
    </div>
  )
}
