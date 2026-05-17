import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  const { invoiceId, amount, method } = body

  // Simulate payment processing delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const receiptNumber = `REC-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 900 + 100)}`

  return NextResponse.json({
    success: true,
    data: {
      receiptNumber,
      invoiceId,
      amount,
      method,
      status: 'REUSSI',
      simulatedAt: new Date().toISOString(),
      message: 'Paiement simulé avec succès',
    },
  })
}
