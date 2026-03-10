import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const USD_PRICE = 1000 // 10 USD en centavos
const ARS_PRICE = 990000 // 9900 ARS en centavos
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

        const stripeKey = process.env.STRIPE_SECRET_KEY
        if (!stripeKey || stripeKey.includes('xxxxxxx')) {
            return NextResponse.json({
                error: 'STRIPE_SECRET_KEY no configurado',
                setup_required: true
            }, { status: 503 })
        }

        const { currency } = await req.json() as { currency: 'usd' | 'ars' }

        const stripe = new Stripe(stripeKey)

        // Verificar si ya tiene customer_id en Stripe
        const { data: profile } = await supabase
            .from('profiles')
            .select('stripe_customer_id, full_name')
            .eq('id', user.id)
            .single()

        let customerId = (profile as any)?.stripe_customer_id

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email!,
                name: (profile as any)?.full_name || undefined,
                metadata: { supabase_user_id: user.id }
            })
            customerId = customer.id
            await (supabase as any).from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)
        }

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            mode: 'payment', // único pago mensual (no subscription de Stripe)
            line_items: [{
                price_data: {
                    currency: currency === 'usd' ? 'usd' : 'ars',
                    product_data: {
                        name: 'LifeHub Pro – Suscripción Mensual',
                        description: 'Acceso completo por 30 días a todas las funciones de LifeHub',
                        images: [`${APP_URL}/og-image.png`],
                    },
                    unit_amount: currency === 'usd' ? USD_PRICE : ARS_PRICE,
                },
                quantity: 1,
            }],
            success_url: `${APP_URL}/configuracion/suscripcion/success?provider=stripe&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${APP_URL}/configuracion/suscripcion?error=cancelled`,
            metadata: {
                user_id: user.id,
                plan: 'pro',
                currency: currency,
            },
            allow_promotion_codes: true,
            billing_address_collection: 'required',
        })

        return NextResponse.json({ url: session.url, session_id: session.id })
    } catch (error: any) {
        console.error('[Stripe create-session]', error)
        return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 })
    }
}
