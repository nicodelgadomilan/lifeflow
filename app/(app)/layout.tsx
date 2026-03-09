import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

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
                <main className="relative flex-1 overflow-y-auto focus:outline-none custom-scrollbar">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 py-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
