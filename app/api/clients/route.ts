import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrUnauthorized, requireCompanyId } from '@/lib/api-helpers'

export async function GET(request: Request) {
  try {
    const { session, error } = await getSessionOrUnauthorized()
    if (error) return error
    const { companyId, error: companyError } = requireCompanyId(session)
    if (companyError) return companyError

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.trim()
    const type = searchParams.get('type')

    const data = await prisma.client.findMany({
      where: {
        companyId,
        active: true,
        ...(type ? { type } : {}),
        ...(search
          ? {
              OR: [
                { firstName: { contains: search } },
                { lastName: { contains: search } },
                { email: { contains: search } },
                { companyName: { contains: search } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data, total: data.length })
  } catch (e) {
    console.error('GET /api/clients error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { session, error } = await getSessionOrUnauthorized()
    if (error) return error
    const { companyId, error: companyError } = requireCompanyId(session)
    if (companyError) return companyError

    const body = await request.json()
    const {
      type,
      firstName,
      lastName,
      companyName,
      siret,
      vatNumber,
      email,
      phone,
      address,
      city,
      postalCode,
      notes,
    } = body

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'Champs requis manquants (firstName, lastName, email)' },
        { status: 400 }
      )
    }

    const data = await prisma.client.create({
      data: {
        companyId,
        type: type ?? 'PARTICULIER',
        firstName,
        lastName,
        companyName: companyName ?? null,
        siret: siret ?? null,
        vatNumber: vatNumber ?? null,
        email,
        phone: phone ?? '',
        address: address ?? '',
        city: city ?? '',
        postalCode: postalCode ?? '',
        notes: notes ?? null,
      },
    })

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (e) {
    console.error('POST /api/clients error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
