import { redirect } from 'next/navigation'
import { verifyAdminAccess } from '@/lib/supabase/server'
import { Shield } from 'lucide-react'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const isAdmin = await verifyAdminAccess()

    if (!isAdmin) {
        redirect('/admin/login')
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            {/* Admin Top Bar */}
            <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-red-500/20 rounded-lg flex items-center justify-center border border-red-500/30">
                            <Shield className="h-4 w-4 text-red-400" />
                        </div>
                        <div>
                            <span className="font-bold text-sm text-white">LifeHub Admin</span>
                            <div className="text-[10px] text-red-400 font-semibold tracking-widest uppercase">Panel Master</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-zinc-400">master@gmail.com</span>
                        <Link
                            href="/api/auth/signout"
                            className="text-xs text-zinc-400 hover:text-white transition-colors px-3 py-1.5 rounded-md border border-zinc-700 hover:border-zinc-500"
                        >
                            Salir
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {children}
            </main>
        </div>
    )
}
