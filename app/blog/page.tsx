import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BookOpen } from 'lucide-react'
import { formatBlogDate, getPublishedBlogPosts } from '@/lib/blog-posts'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Conseils chantier et gestion pour artisans',
  description:
    'Guides pratiques pour mieux gérer devis, chantiers, photos, factures et paiements dans une activité artisanale.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Conseils chantier et gestion pour artisans | ECOPYE Pro',
    description:
      'Guides pratiques pour mieux gérer devis, chantiers, photos, factures et paiements.',
    url: '/blog',
  },
}

export default function BlogPage() {
  const posts = getPublishedBlogPosts()

  return (
    <main>
      <section className="bg-slate-900 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-sm text-blue-200">
            <BookOpen className="h-4 w-4" />
            Conseils ECOPYE Pro
          </span>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Conseils de gestion de chantier pour artisans
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-300">
            Des articles utiles pour organiser les devis, le suivi terrain, la facturation et
            les paiements dans votre activité.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-900">Derniers articles</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <article key={post.slug} className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">{post.category}</span>
                <time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt)}</time>
              </div>
              <h3 className="mt-5 text-xl font-semibold text-gray-900">
                <Link href={`/blog/${post.slug}`} className="hover:text-blue-700">
                  {post.title}
                </Link>
              </h3>
              <p className="mt-3 text-sm leading-7 text-gray-600">{post.excerpt}</p>
              <Link
                href={`/blog/${post.slug}`}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800"
              >
                Lire l&apos;article
                <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
