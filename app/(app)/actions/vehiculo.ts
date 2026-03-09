'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getOrCreateVehicle() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Fetch primary vehicle
    const { data: vehicles } = await supabase
        .from('vehicles')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)

    if (vehicles && vehicles.length > 0) {
        return (vehicles as any[])[0].id
    }

    // Create a default vehicle if none
    const { data: newCar } = await supabase
        .from('vehicles')
        .insert({
            user_id: user.id,
            name: 'Mi Auto principal',
            brand: 'Marca',
            model: 'Modelo'
        } as any)
        .select()
        .single()

    return (newCar as any)?.id
}

// --- MANTENIMIENTOS ---
export async function addMaintenance(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const vehicleId = await getOrCreateVehicle()
    if (!vehicleId) return { error: 'No se pudo obtener vehículo' }

    const type = formData.get('type') as string
    const date = formData.get('date') as string
    const mileage_km = formData.get('mileage_km') as string
    const cost = formData.get('cost') as string
    const next_date = formData.get('next_date') as string
    const notes = formData.get('notes') as string

    if (!type || !date) return { error: 'Faltan campos obligatorios' }

    const { error } = await supabase
        .from('vehicle_maintenances')
        .insert({
            user_id: user.id,
            vehicle_id: vehicleId,
            type,
            date,
            mileage_km: mileage_km ? parseInt(mileage_km) : null,
            cost: cost ? parseFloat(cost) : null,
            next_date: next_date || null,
            notes
        } as any)

    if (error) return { error: 'Error al registrar servicio' }

    revalidatePath('/vehiculo/mantenimiento')
    revalidatePath('/vehiculo')
    return { success: true }
}

// --- REPARACIONES ---
export async function addRepair(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const vehicleId = await getOrCreateVehicle()
    if (!vehicleId) return { error: 'No se pudo obtener vehículo' }

    const description = formData.get('description') as string
    const priority = formData.get('priority') as string || 'medium'
    const estimated_cost = formData.get('estimated_cost') as string

    if (!description) return { error: 'Descripción obligatoria' }

    const { error } = await supabase
        .from('vehicle_repairs')
        .insert({
            user_id: user.id,
            vehicle_id: vehicleId,
            description,
            priority,
            estimated_cost: estimated_cost ? parseFloat(estimated_cost) : null,
            status: 'pending' // starts pending
        } as any)

    if (error) return { error: 'Error al registrar reparación' }

    revalidatePath('/vehiculo/reparaciones')
    revalidatePath('/vehiculo')
    return { success: true }
}

export async function toggleRepairStatus(id: string, newStatus: 'pending' | 'done') {
    const supabase = await createClient()
    const { error } = await (supabase.from('vehicle_repairs') as any)
        .update({ status: newStatus })
        .eq('id', id)

    if (error) return { error: 'Error al cambiar estado' }

    revalidatePath('/vehiculo/reparaciones')
    revalidatePath('/vehiculo')
    return { success: true }
}

export async function deleteRepair(id: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('vehicle_repairs')
        .delete()
        .eq('id', id)

    if (error) return { error: 'Error al eliminar' }

    revalidatePath('/vehiculo/reparaciones')
    revalidatePath('/vehiculo')
    return { success: true }
}

// --- DOCUMENTOS / PAPELES ---
export async function addVehicleDocument(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const vehicleId = await getOrCreateVehicle()
    if (!vehicleId) return { error: 'No se pudo obtener vehículo' }

    const name = formData.get('name') as string
    const expiry_date = formData.get('expiry_date') as string

    if (!name) return { error: 'El nombre es obligatorio' }

    const { error } = await supabase
        .from('vehicle_documents')
        .insert({
            user_id: user.id,
            vehicle_id: vehicleId,
            name,
            expiry_date: expiry_date || null,
        } as any)

    if (error) return { error: 'Error al guardar documento' }

    revalidatePath('/vehiculo/documentos')
    revalidatePath('/vehiculo')
    return { success: true }
}

export async function deleteVehicleDocument(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('vehicle_documents').delete().eq('id', id)
    if (error) return { error: 'Error al eliminar' }

    revalidatePath('/vehiculo/documentos')
    revalidatePath('/vehiculo')
    return { success: true }
}
