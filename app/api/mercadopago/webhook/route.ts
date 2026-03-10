import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Supabase admin client para webhooks (service role)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        console.log('[MP Webhook]', JSON.stringify(body, null, 2))

        // MercadoPago envía distintos tipos de eventos
        if (body.type !== 'payment') {
            return NextResponse.json({ received: true })
        }

        const paymentId = body.data?.id
        if (!paymentId) return NextResponse.json({ received: true })

        // Consultar estado real del pago a la API de MP
        const mpResponse = await fetch(`https://api.mercadolibre.com/payments/${paymentId}`, {
            headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` }
        })
        if (!mpResponse.ok) {
            console.error('[MP Webhook] Error consultando pago', mpResponse.status)
            return NextResponse.json({ error: 'Error consultando pago' }, { status: 500 })
        }

        const payment = await mpResponse.json()
        const userId = payment.external_reference || payment.metadata?.user_id
        if (!userId) return NextResponse.json({ received: true })

        if (payment.status === 'approved') {
            // Activar plan Pro por 30 días
            const now = new Date()
            const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

            await supabaseAdmin.from('profiles').update({
                plan: 'pro',
                plan_expires_at: expiresAt.toISOString(),
                plan_payment_method: 'mercadopago',
                updated_at: now.toISOString(),
            } as any).eq('id', userId)

            await (supabaseAdmin as any).from('subscription_payments').insert({
                user_id: userId,
                provider: 'mercadopago',
                provider_id: String(paymentId),
                amount: payment.transaction_amount,
                currency: payment.currency_id || 'ARS',
                status: 'approved',
                plan: 'pro',
                period_start: now.toISOString(),
                period_end: expiresAt.toISOString(),
                metadata: { mp_payment_id: paymentId, status_detail: payment.status_detail }
            })
        }

        return NextResponse.json({ received: true })
    } catch (error: any) {
        console.error('[MP Webhook Error]', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
