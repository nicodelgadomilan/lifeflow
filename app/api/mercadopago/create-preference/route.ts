import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { createClient } from '@/lib/supabase/server'

const MP_PRICE_ARS = 9900
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single()

        const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
        if (!accessToken || accessToken.includes('xxxxxxx')) {
            return NextResponse.json({
                error: 'MERCADOPAGO_ACCESS_TOKEN no configurado',
                setup_required: true
            }, { status: 503 })
        }

        const client = new MercadoPagoConfig({ accessToken })
        const preference = new Preference(client)

        const result = await preference.create({
            body: {
                items: [{
                    id: 'lifehub-pro-monthly',
                    title: 'LifeHub Pro – Suscripción Mensual',
                    description: 'Acceso completo a todas las funcionalidades de LifeHub',
                    quantity: 1,
                    currency_id: 'ARS',
                    unit_price: MP_PRICE_ARS,
                }],
                payer: {
                    email: user.email,
                    name: (profile as any)?.full_name || undefined,
                },
                back_urls: {
                    success: `${APP_URL}/configuracion/suscripcion/success?provider=mercadopago`,
                    failure: `${APP_URL}/configuracion/suscripcion?error=payment_failed`,
                    pending: `${APP_URL}/configuracion/suscripcion?status=pending`,
                },
                auto_return: 'approved',
                external_reference: user.id,
                metadata: {
                    user_id: user.id,
                    plan: 'pro',
                },
                notification_url: `${APP_URL}/api/mercadopago/webhook`,
            }
        })

        return NextResponse.json({
            init_point: result.init_point,
            sandbox_init_point: result.sandbox_init_point,
            id: result.id
        })
    } catch (error: any) {
        console.error('[MP create-preference]', error)
        return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 })
    }
}
