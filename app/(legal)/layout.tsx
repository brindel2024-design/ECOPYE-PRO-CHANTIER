import Link from 'next/link'
import { HardHat } from 'lucide-react'

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
              <HardHat className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-base font-bold text-gray-900">ECOPYE</span>
              <span className="ml-1 text-base text-blue-600 font-bold">Pro Chantier</span>
            </div>
          </Link>
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">← Retour à l&apos;accueil</Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-12">
        <article className="prose prose-slate max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-xl prose-h2:mt-8 prose-h3:text-base prose-p:text-gray-700 prose-li:text-gray-700">
          {children}
        </article>
        <div className="mt-12 pt-6 border-t border-gray-200 flex flex-wrap gap-4 text-xs text-gray-500">
          <Link href="/mentions-legales" className="hover:text-gray-700">Mentions légales</Link>
          <Link href="/confidentialite" className="hover:text-gray-700">Confidentialité (RGPD)</Link>
          <Link href="/cgu" className="hover:text-gray-700">CGU</Link>
          <Link href="/cgv" className="hover:text-gray-700">CGV</Link>
          <Link href="/contact" className="hover:text-gray-700">Contact</Link>
        </div>
      </main>
    </div>
  )
}
