'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addDocument(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const name = formData.get('name') as string
    const category = formData.get('category') as string
    const expiry_date = formData.get('expiry_date') as string
    const notes = formData.get('notes') as string

    // Fallback file_url ya que es NOT NULL en DB.
    // En fase 3 se reemplazará con la URL de Supabase Storage tras el upload.
    const file_url = '#'

    if (!name || !category) return { error: 'Nombre y categoría son obligatorios' }

    const { error } = await supabase
        .from('documents')
        .insert({
            user_id: user.id,
            name,
            category,
            file_url,
            expiry_date: expiry_date || null,
            notes
        } as any)

    if (error) return { error: 'Error al registrar documento: ' + error.message }

    revalidatePath('/documentos')
    return { success: true }
}

export async function deleteDocument(id: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)

    if (error) return { error: 'Error al eliminar el documento' }

    revalidatePath('/documentos')
    return { success: true }
}
