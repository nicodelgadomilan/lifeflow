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

// Convierte un monto de cualquier moneda a ARS
export function convertToARS(
    amount: number,
    currency: string,
    rates: { usd_rate: number; eur_rate: number; usd_blue_rate?: number }
): number {
    if (currency === 'ARS') return amount
    if (currency === 'USD') return amount * rates.usd_rate
    if (currency === 'USD_BLUE') return amount * (rates.usd_blue_rate || rates.usd_rate)
    if (currency === 'EUR') return amount * rates.eur_rate
    return amount
}

// Formatea un monto con su moneda original y el equivalente en ARS
export function formatAmountWithRate(
    amount: number,
    currency: string,
    rates: { usd_rate: number; eur_rate: number; usd_blue_rate?: number }
): { original: string; ars: string; arsValue: number } {
    const ars = convertToARS(amount, currency, rates)
    return {
        original: currency === 'ARS' ? formatCurrency(amount, 'ARS') : `${currency} ${amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        ars: formatCurrency(ars, 'ARS'),
        arsValue: ars
    }
}

export const CURRENCY_LABELS: Record<string, string> = {
    ARS: '🇦🇷 ARS – Peso',
    USD: '🇺🇸 USD – Dólar oficial',
    USD_BLUE: '💵 USD Blue',
    EUR: '🇪🇺 EUR – Euro'
}

export const CURRENCY_SYMBOLS: Record<string, string> = {
    ARS: '$', USD: 'U$D', USD_BLUE: 'U$D', EUR: '€'
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
