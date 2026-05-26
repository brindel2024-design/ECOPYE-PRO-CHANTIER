export type BlogPost = {
  slug: string
  title: string
  description: string
  excerpt: string
  publishedAt: string
  readTime: string
  category: string
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'devis-artisan-clair-professionnel',
    title: 'Comment créer un devis artisan clair et professionnel',
    description:
      "Découvrez les informations utiles d'un devis artisan, les bonnes pratiques de présentation et comment centraliser devis et suivi de chantier.",
    excerpt:
      "Un devis bien structuré simplifie les échanges avec le client et facilite le suivi du chantier, de la proposition jusqu'à la facture.",
    publishedAt: '2026-05-26',
    readTime: '5 min de lecture',
    category: 'Devis artisan',
  },
]

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug)
}
