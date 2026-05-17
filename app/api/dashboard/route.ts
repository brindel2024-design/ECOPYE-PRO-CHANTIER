import { NextResponse } from 'next/server'
import {
  MOCK_DASHBOARD_STATS,
  MOCK_REVENUE_DATA,
  MOCK_QUOTE_RATE_DATA,
} from '@/lib/mock-data'

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      stats: MOCK_DASHBOARD_STATS,
      revenueData: MOCK_REVENUE_DATA,
      quoteRateData: MOCK_QUOTE_RATE_DATA,
    },
  })
}
