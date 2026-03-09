import { Metadata } from 'next'
import Link from 'next/link'
import { RegisterForm } from '@/components/auth/register-form'
import { Target } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Crear cuenta | LifeHub',
    description: 'Crea una nueva cuenta en LifeHub',
}

export default function RegisterPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-0" />

            <div className="w-full max-w-md space-y-8 z-10 glass p-8 rounded-2xl animate-fade-in">
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="bg-primary/20 p-3 rounded-full mb-4">
                        <Target className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">
                        Comienza tu viaje
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Crea tu cuenta gratis en LifeHub hoy
                    </p>
                </div>

                <RegisterForm />

                <p className="text-center text-sm text-muted-foreground">
                    ¿Ya tienes una cuenta?{' '}
                    <Link href="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                        Inicia sesión
                    </Link>
                </p>
            </div>
        </div>
    )
}
