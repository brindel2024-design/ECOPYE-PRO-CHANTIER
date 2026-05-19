import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireEcopyeAdmin } from '@/lib/api-helpers'

export async function GET() {
  const { error } = await requireEcopyeAdmin()
  if (error) return error

  const companies = await prisma.company.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      ownerName: true,
      email: true,
      phone: true,
      city: true,
      trade: true,
      active: true,
      createdAt: true,
      subscription: {
        select: { plan: true, status: true, monthlyPrice: true },
      },
      _count: {
        select: { users: true, clients: true, invoices: true, projects: true },
      },
    },
  })

  return NextResponse.json({ data: companies })
}
