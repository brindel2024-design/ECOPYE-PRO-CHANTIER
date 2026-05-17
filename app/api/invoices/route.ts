import { NextResponse } from 'next/server'
import { MOCK_INVOICES } from '@/lib/mock-data'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  let data = MOCK_INVOICES
  if (status) {
    data = data.filter((i) => i.status === status)
  }

  return NextResponse.json({ success: true, data, total: data.length })
}
