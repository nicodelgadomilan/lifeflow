import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminLoginForm } from '@/components/admin/admin-login-form'
import { Shield } from 'lucide-react'

export default async function AdminLoginPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user?.email === 'master@gmail.com') {
        redirect('/admin')
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
            {/* Glowing background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
                <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Card */}
                <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-8 backdrop-blur shadow-2xl">
                    {/* Header */}
                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="h-16 w-16 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center mb-4">
                            <Shield className="h-8 w-8 text-red-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Panel de Administración</h1>
                        <p className="text-sm text-zinc-400 mt-2">Acceso restringido — Solo administradores</p>
                    </div>

                    <AdminLoginForm />
                </div>

                <p className="text-center text-xs text-zinc-600 mt-6">
                    LifeHub Master Panel · Acceso controlado
                </p>
            </div>
        </div>
    )
}
