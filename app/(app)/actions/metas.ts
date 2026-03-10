'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addGoal(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const type = formData.get('type') as string || 'goal'
    const target_date = formData.get('target_date') as string

    if (!title) return { error: 'El nombre de la meta es obligatorio' }

    const { error } = await supabase
        .from('goals')
        .insert({
            user_id: user.id,
            title,
            description,
            type,
            target_date: target_date || null
        } as any)

    if (error) return { error: 'Error al registrar la meta' }

    revalidatePath('/metas')
    return { success: true }
}

export async function toggleGoalStatus(id: string, newStatus: string) {
    const supabase = await createClient()
    const { error } = await (supabase.from('goals') as any)
        .update({ status: newStatus })
        .eq('id', id)

    if (error) return { error: 'Error al cambiar estado' }

    revalidatePath('/metas')
    return { success: true }
}

export async function deleteGoal(id: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)

    if (error) return { error: 'Error al eliminar la meta' }

    revalidatePath('/metas')
    return { success: true }
}

export async function updateGoalProgress(id: string, progress: number) {
    const supabase = await createClient()
    const { error } = await (supabase.from('goals') as any)
        .update({ progress })
        .eq('id', id)

    if (error) return { error: 'Error al actualizar progreso' }

    revalidatePath('/metas')
    return { success: true }
}

export async function addMilestone(goalId: string, title: string, dueDate?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }
    if (!title.trim()) return { error: 'El título es obligatorio' }

    const { error } = await supabase
        .from('goal_milestones')
        .insert({
            user_id: user.id,
            goal_id: goalId,
            title: title.trim(),
            due_date: dueDate || null
        } as any)

    if (error) return { error: 'Error al crear el hito' }
    revalidatePath('/metas')
    return { success: true }
}

export async function toggleMilestone(id: string, isDone: boolean) {
    const supabase = await createClient()
    const { error } = await (supabase.from('goal_milestones') as any)
        .update({ is_done: isDone })
        .eq('id', id)

    if (error) return { error: 'Error al actualizar el hito' }
    revalidatePath('/metas')
    return { success: true }
}

export async function deleteMilestone(id: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('goal_milestones')
        .delete()
        .eq('id', id)

    if (error) return { error: 'Error al eliminar el hito' }
    revalidatePath('/metas')
    return { success: true }
}
