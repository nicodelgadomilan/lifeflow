'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addTransaction(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'No autenticado' }
    }

    const type = formData.get('type') as string
    const amount = parseFloat(formData.get('amount') as string)
    const category = formData.get('category') as string
    const description = formData.get('description') as string
    const date = formData.get('date') as string
    const currency = (formData.get('currency') as string) || 'ARS'
    const amount_ars_raw = formData.get('amount_ars') as string
    const amount_ars = amount_ars_raw ? parseFloat(amount_ars_raw) : amount

    if (!type || !amount || !category || !date) {
        return { error: 'Faltan campos obligatorios' }
    }

    const { error } = await supabase
        .from('transactions')
        .insert({
            user_id: user.id,
            type,
            amount,
            category,
            description,
            date,
            currency,
            amount_ars
        } as any)

    if (error) {
        console.error('Error insertando transaccion:', error)
        return { error: 'Ocurrió un error al guardar la transacción. Revisa los datos.' }
    }

    revalidatePath('/finanzas')
    revalidatePath('/finanzas/transacciones')
    revalidatePath('/dashboard')

    return { success: true }
}

export async function deleteTransaction(id: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'No autenticado' }
    }

    const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        return { error: 'No se pudo eliminar' }
    }

    revalidatePath('/finanzas/transacciones')
    revalidatePath('/finanzas')
    return { success: true }
}

export async function updateTransaction(id: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const amount = parseFloat(formData.get('amount') as string)
    const currency = (formData.get('currency') as string) || 'ARS'
    const category = formData.get('category') as string
    const description = formData.get('description') as string
    const date = formData.get('date') as string
    const type = formData.get('type') as string
    const amount_ars_raw = formData.get('amount_ars') as string
    const amount_ars = amount_ars_raw ? parseFloat(amount_ars_raw) : amount

    if (!amount || !category || !date) return { error: 'Faltan campos obligatorios' }

    const { error } = await (supabase.from('transactions') as any)
        .update({ amount, currency, amount_ars, category, description, date, type })
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) return { error: 'Error al actualizar la transacción' }

    revalidatePath('/finanzas/transacciones')
    revalidatePath('/finanzas')
    return { success: true }
}
