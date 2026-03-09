import { format, formatDistanceToNow, isToday, isTomorrow, differenceInDays } from 'date-fns'
import { es } from 'date-fns/locale'

export function formatCurrency(amount: number, currency: string = 'ARS'): string {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount)
}

export function formatDate(date: string | Date): string {
    return format(new Date(date), 'dd MMM yyyy', { locale: es })
}

export function formatDateShort(date: string | Date): string {
    return format(new Date(date), 'dd/MM/yyyy')
}

export function formatRelativeDate(date: string | Date): string {
    const d = new Date(date)
    if (isToday(d)) return 'Hoy'
    if (isTomorrow(d)) return 'Mañana'
    const days = differenceInDays(d, new Date())
    if (days > 0 && days <= 7) return `En ${days} días`
    if (days < 0) return `Hace ${Math.abs(days)} días`
    return formatDistanceToNow(d, { locale: es, addSuffix: true })
}

export function formatSeconds(seconds: number): string {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}h ${m}m`
    if (m > 0) return `${m}m ${s}s`
    return `${s}s`
}

export function formatTimer(seconds: number): string {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    const pad = (n: number) => n.toString().padStart(2, '0')
    if (h > 0) return `${h}:${pad(m)}:${pad(s)}`
    return `${pad(m)}:${pad(s)}`
}

export function getDaysUntil(date: string | Date): number {
    return differenceInDays(new Date(date), new Date())
}

export function getMonthName(monthIndex: number): string {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    return months[monthIndex]
}
