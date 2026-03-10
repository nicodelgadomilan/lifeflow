import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

import { BottomNav } from '@/components/layout/bottom-nav'

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Obtener perfil del usuario
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar />
            <div className="flex w-0 flex-1 flex-col overflow-hidden">
                <Header user={user} profile={profile} />
                <main className="relative flex-1 overflow-y-auto focus:outline-none custom-scrollbar pb-[calc(68px+env(safe-area-inset-bottom))] md:pb-0">
                    <div className="mx-auto max-w-7xl p-3 sm:p-6 md:p-8">
                        {children}
                    </div>
                </main>
                <BottomNav />
            </div>
        </div>
    )
}

