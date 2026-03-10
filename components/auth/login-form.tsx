'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export function LoginForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsLoading(true)

        // Debugging env variable (will appear in browser console)
        console.log('Supabase URL detectada en el cliente:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configurada' : 'Faltante')

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            toast.success('Sesión iniciada correctamente')

            if (email === 'master@gmail.com') {
                router.push('/admin')
            } else {
                router.push('/dashboard')
            }
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || 'Error al iniciar sesión')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-background/50 border-input/50 focus:border-primary"
                    />
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">Contraseña</Label>
                        <Link
                            href="/forgot-password"
                            className="text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="bg-background/50 border-input/50 focus:border-primary"
                    />
                </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Iniciando sesión...
                    </>
                ) : (
                    'Iniciar Sesión'
                )}
            </Button>
        </form>
    )
}
