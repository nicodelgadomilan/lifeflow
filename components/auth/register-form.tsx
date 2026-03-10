'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function RegisterForm() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsLoading(true)

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                    },
                },
            })

            if (error) throw error

            toast.success('Cuenta creada exitosamente', {
                description: 'Ya puedes acceder a tu dashboard.'
            })
            if (email === 'master@gmail.com') {
                router.push('/admin')
            } else {
                router.push('/dashboard')
            }
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || 'Error al registrar cuenta')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Nombre completo</Label>
                    <Input
                        id="name"
                        type="text"
                        placeholder="Juan Pérez"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="bg-background/50 border-input/50 focus:border-primary"
                    />
                </div>
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
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="bg-background/50 border-input/50 focus:border-primary"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                        Mínimo 6 caracteres
                    </p>
                </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creando cuenta...
                    </>
                ) : (
                    'Registrarse'
                )}
            </Button>
        </form>
    )
}
