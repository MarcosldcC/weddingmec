import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'

export async function POST(request: NextRequest) {
  const accessToken = process.env.MP_ACCESS_TOKEN
  if (!accessToken) {
    return NextResponse.json({ error: 'MP_ACCESS_TOKEN não configurado' }, { status: 500 })
  }

  try {
    const { contributor_name, amount_brl } = await request.json()

    if (!contributor_name || !amount_brl || amount_brl <= 0) {
      return NextResponse.json({ error: 'Nome e valor são obrigatórios' }, { status: 400 })
    }

    const client = new MercadoPagoConfig({ accessToken })
    const payment = new Payment(client)

    const result = await payment.create({
      body: {
        transaction_amount: parseFloat(amount_brl),
        description: `Contribuição de ${contributor_name}`,
        payment_method_id: 'pix',
        payer: {
          email: 'convidado@casamento.com',
          first_name: contributor_name,
        },
      },
    })

    const pixData = result.point_of_interaction?.transaction_data

    return NextResponse.json({
      payment_id: result.id,
      qr_code: pixData?.qr_code,
      qr_code_base64: pixData?.qr_code_base64,
      status: result.status,
    })
  } catch (error: any) {
    console.error('Erro ao criar pagamento PIX:', error)
    return NextResponse.json(
      { error: error?.message || 'Falha ao gerar PIX' },
      { status: 500 }
    )
  }
}
