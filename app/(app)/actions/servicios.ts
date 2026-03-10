'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addService(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const name = formData.get('name') as string
    const amountStr = formData.get('amount') as string
    const due_date = formData.get('due_date') as string
    const category = formData.get('category') as string || 'General'

    if (!name || !due_date) return { error: 'Nombre del servicio y fecha de vencimiento son obligatorios' }

    const { error } = await supabase
        .from('services')
        .insert({
            user_id: user.id,
            name,
            amount: amountStr ? parseFloat(amountStr) : null,
            due_date,
            category,
            is_paid: false
        } as any)

    if (error) return { error: 'Error al agregar servicio' }

    revalidatePath('/finanzas/servicios')
    revalidatePath('/dashboard')
    return { success: true }
}

export async function deleteService(id: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id)

    if (error) return { error: 'Error al eliminar' }

    revalidatePath('/finanzas/servicios')
    return { success: true }
}

export async function payService(id: string, amountPaid: number, serviceName: string, originalCategory: string, nextDueDate: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const today = new Date().toISOString().split('T')[0]

    // 1. Marcar como pagado
    const { error: updateError } = await (supabase.from('services') as any)
        .update({
            is_paid: true,
            paid_date: today,
            amount: amountPaid
        })
        .eq('id', id)

    if (updateError) return { error: 'Error al marcar como pagado' }

    // 2. Registrar Transacción de tipo Egreso
    await (supabase.from('transactions') as any)
        .insert({
            user_id: user.id,
            type: 'expense',
            category: 'Servicios',
            amount: amountPaid,
            date: today,
            description: `Pago servicio: ${serviceName}`
        })

    // 3. Generar el sugerido para el mes siguiente
    await (supabase.from('services') as any)
        .insert({
            user_id: user.id,
            name: serviceName,
            category: originalCategory,
            amount: amountPaid, // Sugerido en base al último mes
            due_date: nextDueDate,
            is_paid: false
        })

    revalidatePath('/finanzas/servicios')
    revalidatePath('/finanzas/transacciones')
    revalidatePath('/dashboard')

    return { success: true }
}
