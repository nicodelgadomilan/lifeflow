import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
    const body = await req.text()
    const sig = req.headers.get('stripe-signature')!

    const stripeKey = process.env.STRIPE_SECRET_KEY
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!stripeKey || stripeKey.includes('xxxxxxx')) {
        return NextResponse.json({ received: true })
    }

    const stripe = new Stripe(stripeKey)

    let event: Stripe.Event
    try {
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret!)
    } catch (err: any) {
        console.error('[Stripe Webhook] Invalid signature:', err.message)
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.user_id
        if (!userId) return NextResponse.json({ received: true })

        const paymentIntent = session.payment_intent as string
        const amountTotal = session.amount_total || 0
        const currency = session.currency || 'usd'

        const now = new Date()
        const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

        await (supabaseAdmin as any).from('profiles').update({
            plan: 'pro',
            plan_expires_at: expiresAt.toISOString(),
            plan_payment_method: 'stripe',
            updated_at: now.toISOString(),
        }).eq('id', userId)

        await (supabaseAdmin as any).from('subscription_payments').insert({
            user_id: userId,
            provider: 'stripe',
            provider_id: paymentIntent || session.id,
            amount: amountTotal / 100,
            currency: currency.toUpperCase(),
            status: 'approved',
            plan: 'pro',
            period_start: now.toISOString(),
            period_end: expiresAt.toISOString(),
            metadata: {
                stripe_session_id: session.id,
                stripe_payment_intent: paymentIntent,
                customer_email: session.customer_email
            }
        })
    }

    return NextResponse.json({ received: true })
}
