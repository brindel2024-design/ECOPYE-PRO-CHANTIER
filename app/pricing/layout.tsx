import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tarifs logiciel artisan BTP',
  description:
    "Comparez les offres Starter, Pro et Premium d'ECOPYE Pro Chantier. Essai gratuit 14 jours, sans carte bancaire et sans engagement.",
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Tarifs logiciel artisan BTP | ECOPYE Pro Chantier',
    description:
      'Comparez les offres ECOPYE Pro Chantier et démarrez un essai gratuit de 14 jours.',
    url: '/pricing',
  },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
