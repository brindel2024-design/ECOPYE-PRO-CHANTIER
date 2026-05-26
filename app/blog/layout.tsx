import Link from 'next/link'
import { HardHat } from 'lucide-react'

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
              <HardHat className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-base font-bold text-gray-900">ECOPYE</span>
              <span className="ml-1 text-base font-bold text-blue-600">Pro Chantier</span>
            </div>
          </Link>
          <nav className="flex items-center gap-5 text-sm">
            <Link href="/blog" className="font-medium text-blue-600">Conseils</Link>
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900">Tarifs</Link>
            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
            >
              Démarrer gratuitement
            </Link>
          </nav>
        </div>
      </header>
      {children}
      <footer className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p>ECOPYE Pro Chantier - le SaaS des artisans du BTP.</p>
          <div className="flex gap-4">
            <Link href="/mentions-legales" className="hover:text-gray-800">Mentions légales</Link>
            <Link href="/confidentialite" className="hover:text-gray-800">Confidentialité</Link>
            <Link href="/contact" className="hover:text-gray-800">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
