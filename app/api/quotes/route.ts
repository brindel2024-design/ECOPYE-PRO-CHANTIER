import { NextResponse } from 'next/server'
import { MOCK_QUOTES } from '@/lib/mock-data'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  let data = MOCK_QUOTES
  if (status) {
    data = data.filter((q) => q.status === status)
  }

  return NextResponse.json({ success: true, data, total: data.length })
}
