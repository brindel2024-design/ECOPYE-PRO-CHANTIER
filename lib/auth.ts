import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

// Comptes de démonstration — aucune base de données requise
const DEMO_USERS = [
  {
    id: 'user-1',
    name: 'Jean Durand',
    email: 'jean.durand@durand-renovation.fr',
    password: 'password123',
    role: 'OWNER',
    companyId: 'company-1',
  },
  {
    id: 'user-2',
    name: 'Sarah Martin',
    email: 'sarah.martin@durand-renovation.fr',
    password: 'password123',
    role: 'ADMIN_COMPANY',
    companyId: 'company-1',
  },
  {
    id: 'admin-1',
    name: 'Admin ECOPYE',
    email: 'admin@ecopye.fr',
    password: 'admin123',
    role: 'ECOPYE_ADMIN',
    companyId: null,
  },
]

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET ?? 'ecopye-demo-secret-fallback-key-32c',
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

        const user = DEMO_USERS.find(
          u => u.email === credentials.email && u.password === credentials.password
        )

        if (!user) return null

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
        token.id = user.id
        token.role = (user as any).role
        token.companyId = (user as any).companyId
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.companyId = token.companyId as string
      }
      return session
    },
  },
}
