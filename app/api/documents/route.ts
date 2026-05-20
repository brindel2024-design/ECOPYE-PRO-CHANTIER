import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { prisma } from '@/lib/prisma'
import { getSessionOrUnauthorized, requireCompanyId } from '@/lib/api-helpers'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'documents')

function computeStatus(d: { fileUrl: string | null; expiresAt: Date | null; status: string }): string {
  if (d.status === 'MANQUANT' || !d.fileUrl) return 'MANQUANT'
  if (!d.expiresAt) return 'VALIDE'
  const now = Date.now()
  const exp = new Date(d.expiresAt).getTime()
  if (exp < now) return 'EXPIRE'
  if (exp - now < 30 * 86400000) return 'EXPIRE_BIENTOT'
  return 'VALIDE'
}

export async function GET() {
  try {
    const { session, error } = await getSessionOrUnauthorized()
    if (error) return error
    const { companyId, error: companyError } = requireCompanyId(session)
    if (companyError) return companyError

    const docs = await prisma.document.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    })
    const data = docs.map((d) => ({ ...d, status: computeStatus(d) }))
    return NextResponse.json({ data })
  } catch (e) {
    console.error('GET /api/documents error:', e)
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
    const title = formData.get('title') as string | null
    const type = (formData.get('type') as string | null) ?? 'AUTRE'
    const expiresAtStr = formData.get('expiresAt') as string | null
    const notes = formData.get('notes') as string | null

    if (!title) {
      return NextResponse.json({ error: 'Titre requis' }, { status: 400 })
    }

    let fileUrl: string | null = null
    if (file instanceof File && file.size > 0) {
      await mkdir(UPLOAD_DIR, { recursive: true })
      const ext = path.extname(file.name) || ''
      const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`
      const buffer = Buffer.from(await file.arrayBuffer())
      await writeFile(path.join(UPLOAD_DIR, safeName), buffer)
      fileUrl = `/uploads/documents/${safeName}`
    }

    const doc = await prisma.document.create({
      data: {
        companyId,
        type,
        title,
        status: fileUrl ? 'VALIDE' : 'MANQUANT',
        fileUrl,
        expiresAt: expiresAtStr ? new Date(expiresAtStr) : null,
        notes: notes ?? null,
      },
    })

    return NextResponse.json({ success: true, data: { ...doc, status: computeStatus(doc) } }, { status: 201 })
  } catch (e) {
    console.error('POST /api/documents error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { session, error } = await getSessionOrUnauthorized()
    if (error) return error
    const { companyId, error: companyError } = requireCompanyId(session)
    if (companyError) return companyError

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 })

    const doc = await prisma.document.findFirst({ where: { id, companyId } })
    if (!doc) return NextResponse.json({ error: 'Document introuvable' }, { status: 404 })

    await prisma.document.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('DELETE /api/documents error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
