'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// --- CLASES FIJAS ---
export async function addSportClass(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const day_of_week = parseInt(formData.get('day_of_week') as string)
    const start_time = formData.get('start_time') as string
    const end_time = formData.get('end_time') as string || null
    const location = formData.get('location') as string

    if (!name || isNaN(day_of_week) || !start_time) {
        return { error: 'Nombre, día y hora de inicio son obligatorios' }
    }

    const { error } = await supabase
        .from('sport_classes')
        .insert({
            user_id: user.id,
            name,
            description,
            day_of_week,
            start_time,
            end_time,
            location
        } as any)

    if (error) {
        console.error('Error insertando clase:', error)
        return { error: 'Ocurrió un error al guardar la clase.' }
    }

    revalidatePath('/deportes/clases')
    revalidatePath('/deportes')
    return { success: true }
}

export async function deleteSportClass(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const { error } = await supabase.from('sport_classes').delete().eq('id', id).eq('user_id', user.id)
    if (error) return { error: 'No se pudo eliminar la clase' }

    revalidatePath('/deportes/clases')
    revalidatePath('/deportes')
    return { success: true }
}

// --- GIMNASIO LOG Y SERIES ---
export async function logGymSession(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const date = formData.get('date') as string
    const duration_min = parseInt(formData.get('duration_min') as string) || null
    const notes = formData.get('notes') as string

    if (!date) return { error: 'La fecha es obligatoria' }

    const { error } = await supabase
        .from('gym_sessions')
        .insert({
            user_id: user.id,
            date,
            duration_min,
            notes
        } as any)

    if (error) return { error: 'Ocurrió un error al guardar' }

    revalidatePath('/deportes/gimnasio')
    return { success: true }
}
