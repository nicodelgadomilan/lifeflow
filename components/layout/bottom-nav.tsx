'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Wallet, CalendarDays, Dumbbell, HeartPulse } from 'lucide-react'

const navItems = [
    { name: 'Inicio', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Finanzas', href: '/finanzas', icon: Wallet },
    { name: 'Org', href: '/organizacion', icon: CalendarDays },
    { name: 'Deportes', href: '/deportes', icon: Dumbbell },
    { name: 'Salud', href: '/salud', icon: HeartPulse },
]

export function BottomNav() {
    const pathname = usePathname()

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-[calc(68px+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] bg-background/90 backdrop-blur-lg border-t border-border/50 flex items-center justify-around px-2 z-50">
            {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            'flex flex-col items-center justify-center w-full h-full space-y-1 transition-all rounded-xl hover:bg-muted/50 active:scale-95',
                            isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        <item.icon className={cn('h-5 w-5', isActive && 'text-primary drop-shadow-sm')} strokeWidth={isActive ? 2.5 : 2} />
                        <span className={cn("text-[10px] font-medium", isActive && "font-semibold")}>{item.name}</span>
                    </Link>
                )
            })}
        </div>
    )
}
