'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// --- HÁBITOS ---
export async function addHabit(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const name = formData.get('name') as string
    const time_of_day = formData.get('time_of_day') as string || 'any'

    if (!name) return { error: 'El nombre es obligatorio' }

    const { error } = await supabase
        .from('habits')
        .insert({
            user_id: user.id,
            name,
            time_of_day
        } as any)

    if (error) {
        console.error('[addHabit] error:', error)
        return { error: error.message || 'Error al crear hábito' }
    }

    revalidatePath('/salud/habitos')
    return { success: true }
}

export async function toggleHabitLog(habitId: string, date: string, isCurrentlyCompleted: boolean) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    // Check if log exists for this date
    const { data: existingLog } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('habit_id', habitId)
        .eq('date', date)
        .single()

    if (existingLog) {
        // Toggle or delete if we uncheck
        if (isCurrentlyCompleted) {
            // Delete the log completely if they uncheck it
            await supabase.from('habit_logs').delete().eq('id', (existingLog as any).id)
        } else {
            await (supabase.from('habit_logs') as any).update({ completed: true }).eq('id', (existingLog as any).id)
        }
    } else {
        // Insert new log
        await supabase.from('habit_logs').insert({
            user_id: user.id,
            habit_id: habitId,
            date,
            completed: true
        } as any)
    }

    revalidatePath('/salud/habitos')
    revalidatePath('/salud')
    return { success: true }
}

// --- CITAS MÉDICAS ---
export async function addAppointment(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const doctor = formData.get('doctor') as string
    const type = formData.get('type') as string
    const date = formData.get('date') as string

    if (!doctor || !date || !type) return { error: 'Faltan campos obligatorios' }

    const { error } = await supabase
        .from('health_appointments')
        .insert({
            user_id: user.id,
            doctor,
            type,
            date: new Date(date).toISOString()
        } as any)

    if (error) return { error: 'Error al guardar cita' }

    revalidatePath('/salud/citas')
    revalidatePath('/salud')
    return { success: true }
}

export async function deleteAppointment(id: string) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return { error: 'No autenticado' }

    const { error } = await supabase.from('health_appointments').delete().eq('id', id).eq('user_id', user.id)
    if (error) return { error: 'Error al eliminar' }

    revalidatePath('/salud/citas')
    revalidatePath('/salud')
    return { success: true }
}

// --- MÉTRICAS ---
export async function addHealthMetric(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const type = formData.get('type') as string
    const valueStr = formData.get('value') as string
    const unit = formData.get('unit') as string
    const date = formData.get('date') as string

    if (!type || !valueStr || !unit || !date) return { error: 'Faltan datos' }

    const { error } = await supabase
        .from('health_metrics')
        .insert({
            user_id: user.id,
            type,
            value: parseFloat(valueStr),
            unit,
            date
        } as any)

    if (error) return { error: 'Error al agregar métrica' }

    revalidatePath('/salud/metricas')
    revalidatePath('/salud')
    return { success: true }
}

export async function updatePhysicalProfile(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const heightStr = formData.get('height') as string
    const gender = formData.get('gender') as string

    if (!heightStr || !gender) return { error: 'Faltan datos' }

    const { error } = await supabase
        .from('health_metrics')
        .insert({
            user_id: user.id,
            type: 'PerfilFisico',
            value: parseFloat(heightStr),
            unit: gender,
            date: new Date().toISOString().slice(0, 10)
        } as any)

    if (error) return { error: 'Error al actualizar perfil físico' }

    revalidatePath('/salud/metricas')
    revalidatePath('/salud')
    return { success: true }
}
