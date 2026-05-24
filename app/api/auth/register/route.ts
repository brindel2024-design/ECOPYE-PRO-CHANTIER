import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { TRIAL_DAYS, PLANS } from '@/lib/plans'

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  companyName: z.string().min(2),
  trade: z.string(),
  city: z.string().min(2),
  phone: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = registerSchema.parse(body)

    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé.' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(data.password, 12)

    const company = await prisma.company.create({
      data: {
        name: data.companyName,
        ownerName: data.name,
        siret: null,
        trade: data.trade as any,
        address: '',
        city: data.city,
        postalCode: '',
        phone: data.phone ?? '',
        email: data.email,
        monthlyRevenueTarget: 0,
      },
    })

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: 'OWNER',
        companyId: company.id,
      },
    })

    await prisma.subscription.create({
      data: {
        companyId: company.id,
        plan: 'STARTER',
        status: 'ESSAI',
        monthlyPrice: PLANS.STARTER.priceMonthly,
        trialEndsAt: new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000),
      },
    })

    return NextResponse.json({ success: true, userId: user.id })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données invalides.' }, { status: 400 })
    }
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
