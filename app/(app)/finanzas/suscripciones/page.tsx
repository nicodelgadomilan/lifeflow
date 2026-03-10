import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { SubscriptionFormDialog } from '@/components/finanzas/subscription-form'
import { SuscripcionesClient } from '@/components/finanzas/suscripciones-client'

export default async function SuscripcionesPage() {
    const supabase = await createClient()

    const { data: subscriptions, error } = await supabase
        .from('subscriptions')
        .select('*')
        .order('is_active', { ascending: false })
        .order('next_date', { ascending: true })

    if (error) {
        console.error('Error cargando suscripciones:', error)
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Suscripciones</h1>
                    <p className="text-muted-foreground mt-1">
                        Revisá tus pagos recurrentes · multimoneda
                    </p>
                </div>
                <SubscriptionFormDialog>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Nueva Suscripción
                    </Button>
                </SubscriptionFormDialog>
            </div>

            <SuscripcionesClient subscriptions={(subscriptions || []) as any} />
        </div>
    )
}
