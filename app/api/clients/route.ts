import { NextResponse } from 'next/server'
import { MOCK_CLIENTS } from '@/lib/mock-data'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')?.toLowerCase()
  const type = searchParams.get('type')

  let data = MOCK_CLIENTS
  if (search) {
    data = data.filter(
      (c) =>
        c.firstName.toLowerCase().includes(search) ||
        c.lastName.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search)
    )
  }
  if (type) {
    data = data.filter((c) => c.type === type)
  }

  return NextResponse.json({ success: true, data, total: data.length })
}
