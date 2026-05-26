import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { notFound } from 'next/navigation'
import { formatBlogDate, getBlogPost } from '@/lib/blog-posts'

type Props = { params: { slug: string } }

export const dynamic = 'force-dynamic'

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
          <time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt)}</time>
          <span>{post.readTime}</span>
        </div>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900">{post.title}</h1>
        <p className="mt-5 text-xl leading-8 text-gray-600">{post.intro}</p>

        <div className="mt-12 space-y-9 text-base leading-8 text-gray-700">
          {post.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-2xl font-bold text-gray-900">{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mt-4">
                  {paragraph}
                </p>
              ))}
              {section.bullets ? (
                <ul className="mt-4 list-disc space-y-2 pl-6">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}

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
            {post.faq.map((item) => (
              <div key={item.question}>
                <h3 className="mt-5 text-lg font-semibold text-gray-900">{item.question}</h3>
                <p className="mt-2">{item.answer}</p>
              </div>
            ))}
          </section>
        </div>
      </article>
    </main>
  )
}
