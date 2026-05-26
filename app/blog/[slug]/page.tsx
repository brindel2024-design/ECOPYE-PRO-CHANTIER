import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { notFound } from 'next/navigation'
import { BLOG_POSTS, getBlogPost } from '@/lib/blog-posts'

type Props = { params: { slug: string } }

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }))
}

export function generateMetadata({ params }: Props): Metadata {
  const post = getBlogPost(params.slug)
  if (!post) return {}

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title: `${post.title} | ECOPYE Pro`,
      description: post.description,
      url: `/blog/${post.slug}`,
      publishedTime: post.publishedAt,
    },
  }
}

export default function BlogArticlePage({ params }: Props) {
  const post = getBlogPost(params.slug)
  if (!post) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    inLanguage: 'fr-FR',
    author: { '@type': 'Organization', name: 'ECOPYE' },
    publisher: { '@type': 'Organization', name: 'ECOPYE' },
    mainEntityOfPage: `https://pro.ecopye.fr/blog/${post.slug}`,
  }

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="mx-auto max-w-3xl px-6 py-14">
        <Link href="/blog" className="text-sm font-medium text-blue-700 hover:text-blue-800">
          Conseils ECOPYE Pro
        </Link>
        <div className="mt-5 flex items-center gap-3 text-sm text-gray-500">
          <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">{post.category}</span>
          <time dateTime={post.publishedAt}>26 mai 2026</time>
          <span>{post.readTime}</span>
        </div>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900">{post.title}</h1>
        <p className="mt-5 text-xl leading-8 text-gray-600">
          Un devis clair aide un artisan à présenter son intervention, cadrer les attentes du
          client et démarrer le chantier sur de bonnes bases.
        </p>

        <div className="mt-12 space-y-9 text-base leading-8 text-gray-700">
          <section>
            <h2 className="text-2xl font-bold text-gray-900">Que doit permettre un devis bien organisé ?</h2>
            <p className="mt-4">
              Avant l&apos;acceptation, le client doit comprendre la prestation proposée, son prix et
              les prochaines étapes. Pour l&apos;artisan, le devis doit rester accessible pendant la
              relation client, notamment lorsque le chantier évolue ou qu&apos;une facture doit être préparée.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>Regrouper les coordonnées du client et les informations du chantier.</li>
              <li>Présenter les prestations et les montants de façon lisible.</li>
              <li>Retrouver facilement le devis accepté.</li>
              <li>Relier le devis au suivi du chantier et aux documents suivants.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">Éviter la dispersion des documents</h2>
            <p className="mt-4">
              Un devis rédigé dans un fichier isolé, envoyé par message puis archivé ailleurs peut
              vite devenir difficile à suivre. Les photos, informations client et factures risquent
              alors d&apos;être séparées du document d&apos;origine.
            </p>
            <p className="mt-4">
              Centraliser le travail permet de conserver une vue simple : le devis lance le dossier,
              les informations de suivi restent rattachées au chantier et la facturation peut s&apos;appuyer
              sur les éléments déjà renseignés.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">Du devis au suivi du chantier</h2>
            <p className="mt-4">
              Le devis n&apos;est pas seulement une étape commerciale. Une fois accepté, il peut servir
              de référence pour suivre les prestations, documenter l&apos;avancement et retrouver les
              échanges utiles.
            </p>
            <p className="mt-4">
              ECOPYE Pro Chantier présente des fonctions de devis, suivi chantier, photos,
              facturation et paiements au sein d&apos;une seule application. Le site indique également
              proposer un essai de 14 jours sans carte bancaire.
            </p>
          </section>

          <section className="rounded-2xl bg-blue-50 p-7">
            <h2 className="text-2xl font-bold text-gray-900">Démarrer avec ECOPYE Pro Chantier</h2>
            <p className="mt-4">
              Explorez les offres et testez une organisation plus centralisée de vos devis et chantiers.
            </p>
            <Link
              href="/register"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Démarrer gratuitement
              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">Questions fréquentes</h2>
            <h3 className="mt-5 text-lg font-semibold text-gray-900">ECOPYE Pro Chantier fonctionne-t-il sur mobile ?</h3>
            <p className="mt-2">
              Le site officiel indique que l&apos;application peut être installée directement sur
              smartphone et fonctionne sur Android et iPhone.
            </p>
            <h3 className="mt-5 text-lg font-semibold text-gray-900">Peut-on essayer le service ?</h3>
            <p className="mt-2">
              Le site affiche un essai gratuit de 14 jours, sans carte bancaire et sans engagement.
            </p>
          </section>
        </div>
      </article>
    </main>
  )
}
