'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addShoppingItem(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const name = formData.get('name') as string
    const category = formData.get('category') as string || 'General'
    const priceRaw = formData.get('price') as string
    const price = priceRaw ? parseFloat(priceRaw) : null

    if (!name) return { error: 'El nombre es obligatorio' }

    const { error } = await supabase
        .from('shopping_items')
        .insert({
            user_id: user.id,
            name,
            category,
            price
        } as any)

    if (error) {
        console.error('Error insertando item:', error)
        return { error: 'Error al agregar a la lista.' }
    }

    revalidatePath('/organizacion/compras')
    return { success: true }
}

export async function toggleShoppingItem(id: string, currentStatus: boolean) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const { error } = await (supabase.from('shopping_items') as any)
        .update({ is_checked: !currentStatus })
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) return { error: 'No se pudo actualizar el estado' }

    revalidatePath('/organizacion/compras')
    return { success: true }
}

export async function deleteShoppingItem(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const { error } = await supabase.from('shopping_items').delete().eq('id', id).eq('user_id', user.id)
    if (error) return { error: 'No se pudo eliminar el ítem' }

    revalidatePath('/organizacion/compras')
    return { success: true }
}

export async function clearCheckedItems() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const { error } = await supabase
        .from('shopping_items')
        .delete()
        .eq('user_id', user.id)
        .eq('is_checked', true)

    if (error) return { error: 'No se pudieron limpiar los ítems' }

    revalidatePath('/organizacion/compras')
    return { success: true }
}
