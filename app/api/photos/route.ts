import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { prisma } from '@/lib/prisma'
import { getSessionOrUnauthorized, requireCompanyId } from '@/lib/api-helpers'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'photos')

export async function GET(request: Request) {
  try {
    const { session, error } = await getSessionOrUnauthorized()
    if (error) return error
    const { companyId, error: companyError } = requireCompanyId(session)
    if (companyError) return companyError

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    if (!projectId) {
      return NextResponse.json(
        { error: 'Paramètre requis manquant (projectId)' },
        { status: 400 }
      )
    }

    // Vérifie que le chantier appartient bien à la company.
    const project = await prisma.project.findFirst({
      where: { id: projectId, companyId },
    })
    if (!project) {
      return NextResponse.json(
        { error: 'Chantier introuvable' },
        { status: 404 }
      )
    }

    const data = await prisma.photoProof.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data, total: data.length })
  } catch (e) {
    console.error('GET /api/photos error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { session, error } = await getSessionOrUnauthorized()
    if (error) return error
    const { companyId, error: companyError } = requireCompanyId(session)
    if (companyError) return companyError

    const formData = await request.formData()
    const file = formData.get('file')
    const projectId = formData.get('projectId') as string | null
    const category = (formData.get('category') as string | null) ?? 'PENDANT'
    const caption = formData.get('caption') as string | null

    if (!projectId) {
      return NextResponse.json(
        { error: 'Champ requis manquant (projectId)' },
        { status: 400 }
      )
    }
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'Fichier manquant ou invalide' },
        { status: 400 }
      )
    }

    const project = await prisma.project.findFirst({
      where: { id: projectId, companyId },
    })
    if (!project) {
      return NextResponse.json(
        { error: 'Chantier introuvable' },
        { status: 404 }
      )
    }

    await mkdir(UPLOAD_DIR, { recursive: true })
    const ext = path.extname(file.name) || '.jpg'
    const safeName = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(path.join(UPLOAD_DIR, safeName), buffer)
    const url = `/uploads/photos/${safeName}`

    const data = await prisma.photoProof.create({
      data: {
        projectId,
        uploadedById: session.user.id,
        category,
        url,
        caption: caption ?? null,
      },
    })

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (e) {
    console.error('POST /api/photos error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
