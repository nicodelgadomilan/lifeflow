'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addCard(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const name = formData.get('name') as string
    const bank = formData.get('bank') as string
    const limit_amount = parseFloat(formData.get('limit_amount') as string)
    const used_amount = parseFloat(formData.get('used_amount') as string) || 0
    const interest_rate = parseFloat(formData.get('interest_rate') as string) || 0
    const due_date = formData.get('due_date') as string || null

    if (!name || isNaN(limit_amount)) {
        return { error: 'Nombre de tarjeta y Límite (cupo) son obligatorios' }
    }

    const { error } = await supabase
        .from('credit_cards')
        .insert({
            user_id: user.id,
            name,
            bank,
            limit_amount,
            used_amount,
            interest_rate,
            due_date
        } as any)

    if (error) {
        console.error(error)
        return { error: 'Error al agregar tarjeta' }
    }

    revalidatePath('/finanzas/tarjetas')
    revalidatePath('/dashboard')
    return { success: true }
}

export async function deleteCard(id: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('credit_cards')
        .delete()
        .eq('id', id)

    if (error) return { error: 'Error al eliminar tarjeta' }

    revalidatePath('/finanzas/tarjetas')
    return { success: true }
}

export async function payCard(id: string, payAmount: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    // Obtenemos la tarjeta para ver su deuda actual
    const { data: card } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('id', id)
        .single()

    if (!card) return { error: 'Tarjeta no encontrada' }

    const newUsedAmount = Math.max(0, (card as any).used_amount - payAmount)

    // 1. Descontar la deuda de la tarjeta
    const { error: updateError } = await (supabase.from('credit_cards') as any)
        .update({
            used_amount: newUsedAmount
        })
        .eq('id', id)

    if (updateError) return { error: 'Error al actualizar saldo de la tarjeta' }

    // 2. Registrar el pago en transacciones para que descuente saldo global
    const today = new Date().toISOString().split('T')[0]
    await (supabase.from('transactions') as any)
        .insert({
            user_id: user.id,
            type: 'expense',
            category: 'Tarjetas',
            amount: payAmount,
            date: today,
            description: `Pago de Tarjeta: ${(card as any).name}`
        })

    revalidatePath('/finanzas/tarjetas')
    revalidatePath('/finanzas/transacciones')
    revalidatePath('/dashboard')
    return { success: true }
}
