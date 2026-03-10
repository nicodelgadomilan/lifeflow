'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface ExchangeRates {
    usd_rate: number
    eur_rate: number
    usd_blue_rate: number
}

const DEFAULT_RATES: ExchangeRates = {
    usd_rate: 1000,
    eur_rate: 1100,
    usd_blue_rate: 1200,
}

/**
 * Carga las tasas de cambio del usuario desde user_settings.
 * Fallback a valores por defecto si no existen.
 */
export function useExchangeRates() {
    const [rates, setRates] = useState<ExchangeRates>(DEFAULT_RATES)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const supabase = createClient()
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) { setLoading(false); return }
            ; (supabase as any)
                .from('user_settings')
                .select('usd_rate, eur_rate, usd_blue_rate')
                .eq('user_id', user.id)
                .single()
                .then(({ data }: any) => {
                    if (data) {
                        setRates({
                            usd_rate: Number(data.usd_rate) || DEFAULT_RATES.usd_rate,
                            eur_rate: Number(data.eur_rate) || DEFAULT_RATES.eur_rate,
                            usd_blue_rate: Number(data.usd_blue_rate) || DEFAULT_RATES.usd_blue_rate,
                        })
                    }
                    setLoading(false)
                })
        })
    }, [])

    return { rates, loading }
}
