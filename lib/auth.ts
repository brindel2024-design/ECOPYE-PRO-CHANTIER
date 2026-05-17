import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

// Mode démo : comptes en dur utilisés uniquement si DEMO_MODE=true
// (pour les captures d'écran / environnements sans base de données).
const DEMO_USERS = [
  {
    id: 'cmp9mru7b0005jl54odrl68iu',
    name: 'Jean Durand',
    email: 'jean.durand@durand-renovation.fr',
    password: 'password123',
    role: 'OWNER',
    companyId: 'cmp9mrstz0000jl54dvih1g2x',
  },
  {
    id: 'cmp9mru7a0004jl54ymite7zk',
    name: 'Sarah Martin',
    email: 'sarah.martin@durand-renovation.fr',
    password: 'password123',
    role: 'ADMIN_COMPANY',
    companyId: 'cmp9mrstz0000jl54dvih1g2x',
  },
  {
    id: 'cmp9mru7e0006jl54tnymo1ov',
    name: 'Admin ECOPYE',
    email: 'admin@ecopye.fr',
    password: 'admin123',
    role: 'ECOPYE_ADMIN',
    companyId: null as string | null,
  },
]

const isDemoMode = process.env.DEMO_MODE === 'true'

const secret = process.env.NEXTAUTH_SECRET
if (!secret) {
  throw new Error('NEXTAUTH_SECRET est requis. Définissez-le dans .env.local')
}

export const authOptions: NextAuthOptions = {
  secret,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const email = credentials.email.trim().toLowerCase()

        if (isDemoMode) {
          const demoUser = DEMO_USERS.find(
            u => u.email === email && u.password === credentials.password
          )
          if (!demoUser) return null
          return {
            id: demoUser.id,
            name: demoUser.name,
            email: demoUser.email,
            role: demoUser.role,
            companyId: demoUser.companyId,
          }
        }

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user || !user.active) return null

        const passwordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )
        if (!passwordValid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          companyId: user.companyId,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const authUser = user as unknown as {
          id: string
          role: string
          companyId: string | null
        }
        token.id = authUser.id
        token.role = authUser.role
        token.companyId = authUser.companyId
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.companyId = token.companyId as string | undefined
      }
      return session
    },
  },
}
