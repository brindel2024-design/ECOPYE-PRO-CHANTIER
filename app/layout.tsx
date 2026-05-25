import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { Providers } from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'ECOPYE Pro Chantier',
    template: '%s | ECOPYE Pro Chantier',
  },
  description:
    'Devis, chantier, photos, factures et paiements dans une seule application. Le SaaS des artisans français.',
  keywords: ['artisan', 'devis', 'chantier', 'facture', 'BTP', 'plombier', 'électricien', 'rénovation'],
  authors: [{ name: 'ECOPYE' }],
  creator: 'ECOPYE',
  metadataBase: new URL('https://pro.ecopye.fr'),
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://pro.ecopye.fr',
    title: 'ECOPYE Pro Chantier',
    description: 'Devis, chantier, photos, factures et paiements dans une seule application.',
    siteName: 'ECOPYE Pro Chantier',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Pro Chantier',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <meta name="theme-color" content="#2563eb" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <Script id="register-sw" strategy="afterInteractive">{`
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(() => {});
          }
        `}</Script>
      </body>
    </html>
  )
}
