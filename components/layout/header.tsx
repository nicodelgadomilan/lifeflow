'use client'

import { useState } from 'react'
import { MobileSidebar } from '@/components/layout/sidebar'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Bell, LogOut, Menu, UserCircle } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { toast } from 'sonner'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types/database'

interface HeaderProps {
    user: User
    profile: Profile | null
}

export function Header({ user, profile }: HeaderProps) {
    const router = useRouter()
    const supabase = createClient()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const handleSignOut = async () => {
        try {
            await supabase.auth.signOut()
            router.push('/login')
            toast.success('Sesión cerrada')
        } catch (error) {
            toast.error('Error al cerrar sesión')
        }
    }

    const getInitials = (name: string | null | undefined) => {
        if (!name) return 'U'
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2)
    }

    return (
        <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-background/80 backdrop-blur-md border-b border-border/50">
            <div className="flex flex-1 items-center justify-between px-4 sm:px-6 md:px-8">

                {/* Mobile menu button */}
                <div className="flex items-center md:hidden">
                    <Button variant="ghost" size="icon" className="text-muted-foreground mr-2" onClick={() => setMobileMenuOpen(true)}>
                        <Menu className="h-6 w-6" />
                    </Button>
                    <span className="font-bold text-lg">LifeHub</span>
                </div>

                {/* Desktop breadcrumb slot / Title */}
                <div className="hidden md:flex flex-1">
                    {/* Aquí se podría inyectar el título de la página activa */}
                </div>

                <div className="ml-4 flex items-center gap-2 md:gap-4 md:ml-6">
                    <ThemeToggle />

                    <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                        <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-primary" />
                        <Bell className="h-5 w-5" />
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center max-w-xs rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background cursor-pointer">
                            <Avatar className="h-9 w-9 border border-border/50">
                                <AvatarImage src={profile?.avatar_url || ''} />
                                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                    {getInitials(profile?.full_name || user.email)}
                                </AvatarFallback>
                            </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 glass">
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{profile?.full_name || 'Usuario'}</p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {user.email}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer">
                                <UserCircle className="mr-2 h-4 w-4" />
                                <span>Mi Perfil</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Cerrar sesión</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <MobileSidebar open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />
        </header>
    )
}
