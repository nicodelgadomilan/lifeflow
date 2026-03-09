'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addCalendarEvent(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const title = formData.get('title') as string
    const type = formData.get('type') as string || 'event'
    const startDateStr = formData.get('start_date') as string
    const endDateStr = formData.get('end_date') as string
    const all_day = formData.get('all_day') === 'on'

    // Convert to ISO if present
    const start_date = startDateStr ? new Date(startDateStr).toISOString() : new Date().toISOString()
    const end_date = endDateStr ? new Date(endDateStr).toISOString() : null

    if (!title) return { error: 'El título es obligatorio' }

    const { error } = await supabase
        .from('calendar_events')
        .insert({
            user_id: user.id,
            title,
            type,
            start_date,
            end_date,
            all_day
        } as any)

    if (error) {
        console.error('Error insertando evento:', error)
        return { error: 'Ocurrió un error al guardar el evento.' }
    }

    revalidatePath('/organizacion/calendario')
    revalidatePath('/organizacion') // also update dashboard upcoming events
    return { success: true }
}

export async function deleteCalendarEvent(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const { error } = await supabase.from('calendar_events').delete().eq('id', id).eq('user_id', user.id)
    if (error) return { error: 'No se pudo eliminar el evento' }

    revalidatePath('/organizacion/calendario')
    revalidatePath('/organizacion')
    return { success: true }
}
