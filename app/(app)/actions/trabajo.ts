'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Helper: supabase con any para tablas nuevas no tipadas
async function db() {
    return (await createClient()) as any
}

// ═══════════════════════════════════════════
// PROYECTOS
// ═══════════════════════════════════════════
export async function addProject(formData: FormData) {
    const supabase = await db()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const name = formData.get('name') as string
    const client = formData.get('client') as string
    const status = formData.get('status') as string || 'active'
    const priority = formData.get('priority') as string || 'medium'
    const deadline = formData.get('deadline') as string
    const budget = formData.get('budget') as string
    const color = formData.get('color') as string || '#6366f1'
    const notes = formData.get('notes') as string

    if (!name) return { error: 'El nombre es obligatorio' }

    const { error } = await supabase.from('work_projects').insert({
        user_id: user.id, name, client, status, priority,
        deadline: deadline || null,
        budget: budget ? parseFloat(budget) : null,
        color, notes
    })

    if (error) { console.error('[addProject]', error); return { error: error.message } }
    revalidatePath('/trabajo/proyectos')
    revalidatePath('/trabajo')
    return { success: true }
}

export async function updateProjectStatus(id: string, status: string) {
    const supabase = await db()
    const { error } = await supabase.from('work_projects').update({ status }).eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/trabajo/proyectos')
    revalidatePath('/trabajo')
    return { success: true }
}

export async function deleteProject(id: string) {
    const supabase = await db()
    const { error } = await supabase.from('work_projects').delete().eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/trabajo/proyectos')
    revalidatePath('/trabajo')
    return { success: true }
}

// ═══════════════════════════════════════════
// TAREAS DE TRABAJO
// ═══════════════════════════════════════════
export async function addWorkTask(formData: FormData) {
    const supabase = await db()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const title = formData.get('title') as string
    const project_id = formData.get('project_id') as string
    const priority = formData.get('priority') as string || 'medium'
    const due_date = formData.get('due_date') as string
    const estimated_hours = formData.get('estimated_hours') as string
    const description = formData.get('description') as string

    if (!title) return { error: 'El título es obligatorio' }

    const { error } = await supabase.from('work_tasks').insert({
        user_id: user.id, title, priority, description,
        project_id: project_id || null,
        due_date: due_date || null,
        estimated_hours: estimated_hours ? parseFloat(estimated_hours) : null,
        status: 'todo'
    })

    if (error) { console.error('[addWorkTask]', error); return { error: error.message } }
    revalidatePath('/trabajo/tareas')
    revalidatePath('/trabajo')
    return { success: true }
}

export async function updateWorkTaskStatus(id: string, status: string) {
    const supabase = await db()
    const { error } = await supabase.from('work_tasks').update({ status }).eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/trabajo/tareas')
    return { success: true }
}

export async function deleteWorkTask(id: string) {
    const supabase = await db()
    const { error } = await supabase.from('work_tasks').delete().eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/trabajo/tareas')
    return { success: true }
}

// ═══════════════════════════════════════════
// REUNIONES
// ═══════════════════════════════════════════
export async function addMeeting(formData: FormData) {
    const supabase = await db()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const title = formData.get('title') as string
    const with_whom = formData.get('with_whom') as string
    const meeting_date = formData.get('meeting_date') as string
    const meeting_time = formData.get('meeting_time') as string
    const duration_min = formData.get('duration_min') as string
    const location = formData.get('location') as string
    const type = formData.get('type') as string || 'virtual'
    const agenda = formData.get('agenda') as string
    const project_id = formData.get('project_id') as string

    if (!title || !meeting_date) return { error: 'Título y fecha son obligatorios' }

    const { error } = await supabase.from('work_meetings').insert({
        user_id: user.id, title, with_whom, meeting_date,
        meeting_time: meeting_time || null,
        duration_min: duration_min ? parseInt(duration_min) : 60,
        location, type, agenda,
        project_id: project_id || null,
        status: 'scheduled'
    })

    if (error) { console.error('[addMeeting]', error); return { error: error.message } }
    revalidatePath('/trabajo/reuniones')
    revalidatePath('/trabajo')
    return { success: true }
}

export async function updateMeetingStatus(id: string, status: string) {
    const supabase = await db()
    const { error } = await supabase.from('work_meetings').update({ status }).eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/trabajo/reuniones')
    return { success: true }
}

export async function deleteMeeting(id: string) {
    const supabase = await db()
    const { error } = await supabase.from('work_meetings').delete().eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/trabajo/reuniones')
    return { success: true }
}

// ═══════════════════════════════════════════
// COBROS PENDIENTES
// ═══════════════════════════════════════════
export async function addReceivable(formData: FormData) {
    const supabase = await db()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const client = formData.get('client') as string
    const concept = formData.get('concept') as string
    const amount = formData.get('amount') as string
    const currency = formData.get('currency') as string || 'ARS'
    const due_date = formData.get('due_date') as string
    const invoice_number = formData.get('invoice_number') as string
    const project_id = formData.get('project_id') as string
    const notes = formData.get('notes') as string

    if (!client || !concept || !amount) return { error: 'Cliente, concepto y monto son obligatorios' }

    const { error } = await supabase.from('work_receivables').insert({
        user_id: user.id, client, concept,
        amount: parseFloat(amount),
        currency, invoice_number,
        due_date: due_date || null,
        project_id: project_id || null,
        notes, status: 'pending', paid_amount: 0
    })

    if (error) { console.error('[addReceivable]', error); return { error: error.message } }
    revalidatePath('/trabajo/cobros')
    revalidatePath('/trabajo')
    return { success: true }
}

export async function markReceivablePaid(id: string) {
    const supabase = await db()
    const { data } = await supabase.from('work_receivables').select('amount').eq('id', id).single()
    await supabase.from('work_receivables').update({ status: 'paid', paid_amount: data?.amount }).eq('id', id)
    revalidatePath('/trabajo/cobros')
    return { success: true }
}

export async function deleteReceivable(id: string) {
    const supabase = await db()
    const { error } = await supabase.from('work_receivables').delete().eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/trabajo/cobros')
    return { success: true }
}

// ═══════════════════════════════════════════
// PAGOS PENDIENTES
// ═══════════════════════════════════════════
export async function addPayable(formData: FormData) {
    const supabase = await db()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const vendor = formData.get('vendor') as string
    const concept = formData.get('concept') as string
    const amount = formData.get('amount') as string
    const currency = formData.get('currency') as string || 'ARS'
    const due_date = formData.get('due_date') as string
    const project_id = formData.get('project_id') as string
    const notes = formData.get('notes') as string

    if (!vendor || !concept || !amount) return { error: 'Proveedor, concepto y monto son obligatorios' }

    const { error } = await supabase.from('work_payables').insert({
        user_id: user.id, vendor, concept,
        amount: parseFloat(amount),
        currency, due_date: due_date || null,
        project_id: project_id || null,
        notes, status: 'pending'
    })

    if (error) { console.error('[addPayable]', error); return { error: error.message } }
    revalidatePath('/trabajo/pagos')
    revalidatePath('/trabajo')
    return { success: true }
}

export async function markPayablePaid(id: string) {
    const supabase = await db()
    await supabase.from('work_payables').update({ status: 'paid' }).eq('id', id)
    revalidatePath('/trabajo/pagos')
    return { success: true }
}

export async function deletePayable(id: string) {
    const supabase = await db()
    const { error } = await supabase.from('work_payables').delete().eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/trabajo/pagos')
    return { success: true }
}

// ═══════════════════════════════════════════
// TRIBUTACIÓN
// ═══════════════════════════════════════════
export async function addTax(formData: FormData) {
    const supabase = await db()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const name = formData.get('name') as string
    const type = formData.get('type') as string || 'periodic'
    const amount = formData.get('amount') as string
    const due_date = formData.get('due_date') as string
    const period = formData.get('period') as string
    const category = formData.get('category') as string || 'national'
    const notes = formData.get('notes') as string

    if (!name || !due_date) return { error: 'Nombre y fecha son obligatorios' }

    const { error } = await supabase.from('work_taxes').insert({
        user_id: user.id, name, type,
        amount: amount ? parseFloat(amount) : null,
        due_date, period, category, notes, status: 'pending'
    })

    if (error) { console.error('[addTax]', error); return { error: error.message } }
    revalidatePath('/trabajo/tributacion')
    revalidatePath('/trabajo')
    return { success: true }
}

export async function markTaxPaid(id: string) {
    const supabase = await db()
    await supabase.from('work_taxes').update({ status: 'paid' }).eq('id', id)
    revalidatePath('/trabajo/tributacion')
    return { success: true }
}

export async function deleteTax(id: string) {
    const supabase = await db()
    const { error } = await supabase.from('work_taxes').delete().eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/trabajo/tributacion')
    return { success: true }
}

// ═══════════════════════════════════════════
// CHECKLIST DIARIO (WORK ROUTINES)
// ═══════════════════════════════════════════
export async function addWorkRoutine(name: string, time_of_day: string = 'any') {
    const supabase = await db()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    if (!name.trim()) return { error: 'El nombre es obligatorio' }

    const { error } = await supabase.from('work_routines').insert({
        user_id: user.id,
        name: name.trim(),
        time_of_day
    })

    if (error) { console.error('[addWorkRoutine]', error); return { error: error.message } }
    revalidatePath('/trabajo')
    return { success: true }
}

export async function toggleWorkRoutineLog(routineId: string, dateStr: string, completed: boolean) {
    const supabase = await db()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    if (completed) {
        // Insert (o si ya existe fallará silenciosamente por Unique o ON CONFLICT)
        const { error } = await supabase.from('work_routine_logs').upsert({
            routine_id: routineId,
            user_id: user.id,
            date: dateStr,
            completed: true
        }, { onConflict: 'routine_id, date' })
        if (error) return { error: error.message }
    } else {
        // Delete logs for that date
        const { error } = await supabase.from('work_routine_logs')
            .delete()
            .match({ routine_id: routineId, user_id: user.id, date: dateStr })
        if (error) return { error: error.message }
    }

    revalidatePath('/trabajo')
    return { success: true }
}

export async function deleteWorkRoutine(id: string) {
    const supabase = await db()
    const { error } = await supabase.from('work_routines').delete().eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/trabajo')
    return { success: true }
}
