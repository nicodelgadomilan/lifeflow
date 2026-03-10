'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addSavingsGoal(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const name = formData.get('name') as string
    const goal_amount = parseFloat(formData.get('goal_amount') as string)
    const current_amount = parseFloat(formData.get('current_amount') as string) || 0
    const location = formData.get('location') as string
    const location_detail = formData.get('location_detail') as string || ''
    const target_date = formData.get('target_date') as string || null
    const notes = formData.get('notes') as string || ''

    if (!name || isNaN(goal_amount)) {
        return { error: 'Nombre y meta de ahorro son obligatorios' }
    }

    // location field combines type and detail: e.g. "Banco - Santander"
    const locationFull = location_detail ? `${location} — ${location_detail}` : location

    const { error } = await supabase
        .from('savings_goals')
        .insert({
            user_id: user.id,
            name,
            goal_amount,
            current_amount,
            location: locationFull,
            target_date,
            notes
        } as any)

    if (error) {
        console.error(error)
        return { error: 'Error al crear el objetivo de ahorro' }
    }

    revalidatePath('/finanzas/ahorros')
    return { success: true }
}

export async function deleteSavingsGoal(id: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('savings_goals')
        .delete()
        .eq('id', id)

    if (error) return { error: 'Error al eliminar' }

    revalidatePath('/finanzas/ahorros')
    return { success: true }
}

export async function addSavingsMovement(
    goalId: string,
    amount: number,
    type: 'deposit' | 'withdrawal',
    notes?: string
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    // Get current goal
    const { data: goal } = await supabase
        .from('savings_goals')
        .select('current_amount, name')
        .eq('id', goalId)
        .single()

    if (!goal) return { error: 'Objetivo no encontrado' }

    const current = Number((goal as any).current_amount) || 0
    const newAmount = type === 'deposit' ? current + amount : Math.max(0, current - amount)

    // Update goal balance
    await (supabase.from('savings_goals') as any)
        .update({ current_amount: newAmount })
        .eq('id', goalId)

    // Insert movement record
    const today = new Date().toISOString().split('T')[0]
    await supabase.from('savings_movements').insert({
        user_id: user.id,
        goal_id: goalId,
        amount,
        type,
        date: today,
        notes: notes || null
    } as any)

    revalidatePath('/finanzas/ahorros')
    revalidatePath('/dashboard')
    return { success: true }
}
