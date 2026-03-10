'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, LogIn, Eye, EyeOff } from 'lucide-react'

export function AdminLoginForm() {
    const [email, setEmail] = useState('master@gmail.com')
    const [password, setPassword] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError('')

        if (email !== 'master@gmail.com') {
            setError('Este panel es solo para administradores')
            return
        }

        setLoading(true)
        const supabase = createClient()
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        setLoading(false)

        if (signInError) {
            if (signInError.message.includes('Invalid login')) {
                setError('Email o contraseña incorrectos')
            } else if (signInError.message.includes('Email not confirmed')) {
                setError('La cuenta no está confirmada aún')
            } else {
                setError(signInError.message)
            }
        } else {
            router.push('/admin')
            router.refresh()
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
                    Email de Administrador
                </label>
                <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/30 transition-all"
                    placeholder="master@gmail.com"
                />
            </div>

            <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
                    Contraseña Maestra
                </label>
                <div className="relative">
                    <input
                        type={showPass ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/30 transition-all"
                        placeholder="••••••••••••"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPass(s => !s)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                        {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 transition-all text-sm"
            >
                {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Verificando...</>
                ) : (
                    <><LogIn className="h-4 w-4" /> Acceder al Panel</>
                )}
            </button>
        </form>
    )
}
