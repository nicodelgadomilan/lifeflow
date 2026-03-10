'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface ExchangeRates {
    usd_rate: number
    eur_rate: number
    usd_blue_rate: number
    display_currency: string
    rates_updated_at: string
}

const DEFAULT_RATES: ExchangeRates = {
    usd_rate: 1000,
    eur_rate: 1100,
    usd_blue_rate: 1200,
    display_currency: 'ARS',
    rates_updated_at: new Date().toISOString()
}

export async function getUserSettings(): Promise<ExchangeRates> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return DEFAULT_RATES

    const { data } = await (supabase as any)
        .from('user_settings')
        .select('usd_rate, eur_rate, usd_blue_rate, display_currency, rates_updated_at')
        .eq('user_id', user.id)
        .single()

    if (!data) {
        // Crea settings por defecto si no existen
        await (supabase as any).from('user_settings').insert({ user_id: user.id, ...DEFAULT_RATES })
        return DEFAULT_RATES
    }

    return {
        usd_rate: Number(data.usd_rate) || DEFAULT_RATES.usd_rate,
        eur_rate: Number(data.eur_rate) || DEFAULT_RATES.eur_rate,
        usd_blue_rate: Number(data.usd_blue_rate) || DEFAULT_RATES.usd_blue_rate,
        display_currency: data.display_currency || 'ARS',
        rates_updated_at: data.rates_updated_at || new Date().toISOString()
    }
}

export async function updateExchangeRates(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const usd_rate = parseFloat(formData.get('usd_rate') as string)
    const eur_rate = parseFloat(formData.get('eur_rate') as string)
    const usd_blue_rate = parseFloat(formData.get('usd_blue_rate') as string)
    const display_currency = formData.get('display_currency') as string

    if (!usd_rate || usd_rate <= 0) return { error: 'El tipo de cambio USD debe ser mayor a 0' }

    const { error } = await (supabase as any)
        .from('user_settings')
        .upsert({
            user_id: user.id,
            usd_rate,
            eur_rate: eur_rate || usd_rate * 1.1,
            usd_blue_rate: usd_blue_rate || usd_rate * 1.1,
            display_currency: display_currency || 'ARS',
            rates_updated_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })

    if (error) { console.error('[updateExchangeRates]', error); return { error: error.message } }

    revalidatePath('/configuracion')
    revalidatePath('/finanzas')
    revalidatePath('/dashboard')
    revalidatePath('/trabajo/cobros')
    revalidatePath('/trabajo/pagos')
    revalidatePath('/trabajo/tributacion')
    return { success: true }
}
