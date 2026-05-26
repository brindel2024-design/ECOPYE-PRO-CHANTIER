import type { MetadataRoute } from 'next'
import { getPublishedBlogPosts } from '@/lib/blog-posts'

export const dynamic = 'force-dynamic'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://pro.ecopye.fr'

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date('2026-05-26'), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/pricing`, lastModified: new Date('2026-05-26'), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: new Date('2026-05-26'), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/mentions-legales`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${baseUrl}/confidentialite`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${baseUrl}/cgu`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${baseUrl}/cgv`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${baseUrl}/contact`, changeFrequency: 'yearly', priority: 0.3 },
  ]

  return [
    ...staticPages,
    ...getPublishedBlogPosts().map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.publishedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]
}
