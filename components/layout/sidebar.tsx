'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    Wallet,
    CalendarDays,
    Dumbbell,
    HeartPulse,
    Car,
    Files,
    Target,
    ChevronDown
} from 'lucide-react'
import { useState } from 'react'

const mainNavigation = [
    { name: 'Documentos', href: '/documentos', icon: Files },
    { name: 'Metas', href: '/metas', icon: Target },
]

const financeLinks = [
    { name: 'Resumen', href: '/finanzas' },
    { name: 'Transacciones', href: '/finanzas/transacciones' },
    { name: 'Suscripciones', href: '/finanzas/suscripciones' },
    { name: 'Servicios', href: '/finanzas/servicios' },
    { name: 'Tarjetas', href: '/finanzas/tarjetas' },
    { name: 'Ahorros', href: '/finanzas/ahorros' },
    { name: 'Activos', href: '/finanzas/activos' },
]

const orgLinks = [
    { name: 'Resumen', href: '/organizacion' },
    { name: 'Tareas', href: '/organizacion/tareas' },
    { name: 'Calendario', href: '/organizacion/calendario' },
    { name: 'Listado de Compras', href: '/organizacion/compras' },
]

const sportsLinks = [
    { name: 'Resumen', href: '/deportes' },
    { name: 'Clases Fijas', href: '/deportes/clases' },
    { name: 'Gimnasio', href: '/deportes/gimnasio' },
    { name: 'Temporizadores', href: '/deportes/timer' },
]

const healthLinks = [
    { name: 'Resumen', href: '/salud' },
    { name: 'Citas Médicas', href: '/salud/citas' },
    { name: 'Hábitos Diario', href: '/salud/habitos' },
    { name: 'Métricas', href: '/salud/metricas' },
]

const vehicleLinks = [
    { name: 'Resumen', href: '/vehiculo' },
    { name: 'Mantenimiento', href: '/vehiculo/mantenimiento' },
    { name: 'Reparaciones', href: '/vehiculo/reparaciones' },
    { name: 'Papeles', href: '/vehiculo/documentos' },
]

export function Sidebar() {
    const pathname = usePathname()
    // Finanzas State
    const isFinanceActive = pathname.startsWith('/finanzas')
    const [isFinanceOpen, setIsFinanceOpen] = useState(isFinanceActive)

    // Org State
    const isOrgActive = pathname.startsWith('/organizacion')
    const [isOrgOpen, setIsOrgOpen] = useState(isOrgActive)

    // Sports State
    const isSportsActive = pathname.startsWith('/deportes')
    const [isSportsOpen, setIsSportsOpen] = useState(isSportsActive)

    // Health State
    const isHealthActive = pathname.startsWith('/salud')
    const [isHealthOpen, setIsHealthOpen] = useState(isHealthActive)

    // Vehicle State
    const isVehicleActive = pathname.startsWith('/vehiculo')
    const [isVehicleOpen, setIsVehicleOpen] = useState(isVehicleActive)

    return (
        <div className="hidden md:flex md:w-64 md:flex-col glass border-r border-border/50">
            <div className="flex h-16 flex-shrink-0 items-center px-6 border-b border-border/50">
                <div className="flex items-center gap-2">
                    <div className="bg-primary/20 p-1.5 rounded-lg">
                        <Target className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                        LifeHub
                    </span>
                </div>
            </div>

            <div className="flex flex-grow flex-col overflow-y-auto">
                <nav className="flex-1 space-y-1 px-3 py-6">
                    <Link
                        href="/dashboard"
                        className={cn(
                            pathname === '/dashboard'
                                ? 'bg-primary/10 text-primary border-primary/30'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                            'group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all border border-transparent'
                        )}
                    >
                        <LayoutDashboard className={cn(
                            pathname === '/dashboard' ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                            'mr-3 flex-shrink-0 h-5 w-5'
                        )} />
                        Dashboard
                    </Link>

                    {/* Módulo Finanzas Acordeón */}
                    <div className="pt-2">
                        <button
                            onClick={() => setIsFinanceOpen(!isFinanceOpen)}
                            className={cn(
                                isFinanceActive
                                    ? 'bg-primary/5 text-primary'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                'group flex w-full items-center justify-between px-3 py-2.5 text-sm font-medium rounded-xl transition-all'
                            )}
                        >
                            <div className="flex items-center">
                                <Wallet className={cn(
                                    isFinanceActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                                    'mr-3 flex-shrink-0 h-5 w-5'
                                )} />
                                Finanzas
                            </div>
                            <ChevronDown className={cn(
                                "h-4 w-4 transition-transform",
                                isFinanceOpen ? "rotate-180" : ""
                            )} />
                        </button>

                        {isFinanceOpen && (
                            <div className="mt-1 space-y-1 px-3 pl-11 pb-2 animate-fade-in">
                                {financeLinks.map((item) => {
                                    const isActive = pathname === item.href
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                isActive
                                                    ? 'text-primary font-semibold'
                                                    : 'text-muted-foreground hover:text-foreground',
                                                'group flex items-center px-3 py-1.5 text-sm transition-all rounded-md'
                                            )}
                                        >
                                            {item.name}
                                        </Link>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Módulo Organización Acordeón */}
                    <div className="pt-2">
                        <button
                            onClick={() => setIsOrgOpen(!isOrgOpen)}
                            className={cn(
                                isOrgActive
                                    ? 'bg-primary/5 text-primary'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                'group flex w-full items-center justify-between px-3 py-2.5 text-sm font-medium rounded-xl transition-all'
                            )}
                        >
                            <div className="flex items-center">
                                <CalendarDays className={cn(
                                    isOrgActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                                    'mr-3 flex-shrink-0 h-5 w-5'
                                )} />
                                Organización
                            </div>
                            <ChevronDown className={cn(
                                "h-4 w-4 transition-transform",
                                isOrgOpen ? "rotate-180" : ""
                            )} />
                        </button>

                        {isOrgOpen && (
                            <div className="mt-1 space-y-1 px-3 pl-11 pb-2 animate-fade-in">
                                {orgLinks.map((item) => {
                                    const isActive = pathname === item.href
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                isActive
                                                    ? 'text-primary font-semibold'
                                                    : 'text-muted-foreground hover:text-foreground',
                                                'group flex items-center px-3 py-1.5 text-sm transition-all rounded-md'
                                            )}
                                        >
                                            {item.name}
                                        </Link>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Módulo Deportes Acordeón */}
                    <div className="pt-2">
                        <button
                            onClick={() => setIsSportsOpen(!isSportsOpen)}
                            className={cn(
                                isSportsActive
                                    ? 'bg-primary/5 text-primary'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                'group flex w-full items-center justify-between px-3 py-2.5 text-sm font-medium rounded-xl transition-all'
                            )}
                        >
                            <div className="flex items-center">
                                <Dumbbell className={cn(
                                    isSportsActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                                    'mr-3 flex-shrink-0 h-5 w-5'
                                )} />
                                Deportes
                            </div>
                            <ChevronDown className={cn(
                                "h-4 w-4 transition-transform",
                                isSportsOpen ? "rotate-180" : ""
                            )} />
                        </button>

                        {isSportsOpen && (
                            <div className="mt-1 space-y-1 px-3 pl-11 pb-2 animate-fade-in">
                                {sportsLinks.map((item) => {
                                    const isActive = pathname === item.href
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                isActive
                                                    ? 'text-primary font-semibold'
                                                    : 'text-muted-foreground hover:text-foreground',
                                                'group flex items-center px-3 py-1.5 text-sm transition-all rounded-md'
                                            )}
                                        >
                                            {item.name}
                                        </Link>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Módulo Salud Acordeón */}
                    <div className="pt-2">
                        <button
                            onClick={() => setIsHealthOpen(!isHealthOpen)}
                            className={cn(
                                isHealthActive
                                    ? 'bg-primary/5 text-primary'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                'group flex w-full items-center justify-between px-3 py-2.5 text-sm font-medium rounded-xl transition-all'
                            )}
                        >
                            <div className="flex items-center">
                                <HeartPulse className={cn(
                                    isHealthActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                                    'mr-3 flex-shrink-0 h-5 w-5'
                                )} />
                                Salud
                            </div>
                            <ChevronDown className={cn(
                                "h-4 w-4 transition-transform",
                                isHealthOpen ? "rotate-180" : ""
                            )} />
                        </button>

                        {isHealthOpen && (
                            <div className="mt-1 space-y-1 px-3 pl-11 pb-2 animate-fade-in">
                                {healthLinks.map((item) => {
                                    const isActive = pathname === item.href
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                isActive
                                                    ? 'text-primary font-semibold'
                                                    : 'text-muted-foreground hover:text-foreground',
                                                'group flex items-center px-3 py-1.5 text-sm transition-all rounded-md'
                                            )}
                                        >
                                            {item.name}
                                        </Link>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Módulo Vehículo Acordeón */}
                    <div className="pt-2">
                        <button
                            onClick={() => setIsVehicleOpen(!isVehicleOpen)}
                            className={cn(
                                isVehicleActive
                                    ? 'bg-primary/5 text-primary'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                'group flex w-full items-center justify-between px-3 py-2.5 text-sm font-medium rounded-xl transition-all'
                            )}
                        >
                            <div className="flex items-center">
                                <Car className={cn(
                                    isVehicleActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                                    'mr-3 flex-shrink-0 h-5 w-5'
                                )} />
                                Vehículo
                            </div>
                            <ChevronDown className={cn(
                                "h-4 w-4 transition-transform",
                                isVehicleOpen ? "rotate-180" : ""
                            )} />
                        </button>

                        {isVehicleOpen && (
                            <div className="mt-1 space-y-1 px-3 pl-11 pb-2 animate-fade-in">
                                {vehicleLinks.map((item) => {
                                    const isActive = pathname === item.href
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                isActive
                                                    ? 'text-primary font-semibold'
                                                    : 'text-muted-foreground hover:text-foreground',
                                                'group flex items-center px-3 py-1.5 text-sm transition-all rounded-md'
                                            )}
                                        >
                                            {item.name}
                                        </Link>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    <div className="pt-2 space-y-1">
                        {mainNavigation.map((item) => {
                            const isActive = pathname.startsWith(item.href)
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        isActive
                                            ? 'bg-primary/10 text-primary border-primary/30'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                        'group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all border border-transparent opacity-70 hover:opacity-100' // Opacidad baja indicando que son MVP Fase > 1
                                    )}
                                >
                                    <item.icon
                                        className={cn(
                                            isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                                            'mr-3 flex-shrink-0 h-5 w-5'
                                        )}
                                        aria-hidden="true"
                                    />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </div>
                </nav>
            </div>
        </div>
    )
}
