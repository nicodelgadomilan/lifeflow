'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// --- TAREAS ---
export async function addTask(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const title = formData.get('title') as string
    const category = formData.get('category') as string || 'personal'
    const priority = formData.get('priority') as string || 'medium'
    const due_date = formData.get('due_date') as string

    if (!title) return { error: 'El título es obligatorio' }

    const { error } = await supabase
        .from('tasks')
        .insert({
            user_id: user.id,
            title,
            category,
            priority,
            due_date: due_date || null
        } as any)

    if (error) {
        console.error('Error insertando tarea:', error)
        return { error: 'Ocurrió un error al guardar la tarea.' }
    }

    revalidatePath('/organizacion')
    return { success: true }
}

export async function toggleTaskStatus(id: string, currentStatus: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    // toggle: pending -> in_progress -> done -> pending
    let newStatus = 'done'
    if (currentStatus === 'pending') newStatus = 'in_progress'
    else if (currentStatus === 'in_progress') newStatus = 'done'
    else if (currentStatus === 'done') newStatus = 'pending'

    const { error } = await (supabase.from('tasks') as any)
        .update({ status: newStatus })
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) return { error: 'No se pudo actualizar la tarea' }

    revalidatePath('/organizacion')
    return { success: true }
}

export async function deleteTask(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const { error } = await supabase.from('tasks').delete().eq('id', id).eq('user_id', user.id)
    if (error) return { error: 'No se pudo eliminar la tarea' }

    revalidatePath('/organizacion')
    return { success: true }
}

// --- NOTAS ---
export async function addNote(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const color = formData.get('color') as string || '#fbbf24' // Default yellow
    const is_pinned = formData.get('is_pinned') === 'on'

    if (!title) return { error: 'El título es obligatorio' }

    const { error } = await supabase
        .from('notes')
        .insert({
            user_id: user.id,
            title,
            content,
            color,
            is_pinned
        } as any)

    if (error) {
        console.error('Error insertando nota:', error)
        return { error: 'Error al guardar la nota.' }
    }

    revalidatePath('/organizacion')
    return { success: true }
}

export async function deleteNote(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const { error } = await supabase.from('notes').delete().eq('id', id).eq('user_id', user.id)
    if (error) return { error: 'No se pudo eliminar la nota' }

    revalidatePath('/organizacion')
    return { success: true }
}
