'use client'

import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid,
    ReferenceLine,
} from 'recharts'
import { TrendingUp } from 'lucide-react'

interface ChartDataPoint {
    name: string
    Ingresos: number
    Egresos: number
}

interface DashboardChartProps {
    data: ChartDataPoint[]
}

const MONTH_SHORT: Record<string, string> = {
    '01': 'Ene', '02': 'Feb', '03': 'Mar', '04': 'Abr',
    '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Ago',
    '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dic',
}

function formatLabel(name: string) {
    if (!name || !name.includes('-')) return name
    const [, month] = name.split('-')
    return MONTH_SHORT[month] || name
}

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-zinc-900/95 border border-zinc-700 rounded-xl p-3 shadow-2xl backdrop-blur-sm min-w-[160px]">
            <p className="text-zinc-400 text-xs font-semibold mb-2 uppercase tracking-wider">{formatLabel(label)}</p>
            {payload.map((p: any) => (
                <div key={p.dataKey} className="flex items-center justify-between gap-4 text-sm">
                    <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full inline-block" style={{ background: p.color }} />
                        <span className="text-zinc-400 font-medium">{p.dataKey}</span>
                    </span>
                    <span className="font-bold text-white tabular-nums">
                        ${Number(p.value).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                    </span>
                </div>
            ))}
        </div>
    )
}

function CustomDot(props: any) {
    const { cx, cy, stroke } = props
    return (
        <circle
            cx={cx} cy={cy} r={4}
            fill="#111" stroke={stroke} strokeWidth={2}
        />
    )
}

function CustomLegend() {
    return (
        <div className="flex items-center gap-6 mt-4 ml-1">
            <span className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                <svg width="24" height="10">
                    <line x1="0" y1="5" x2="24" y2="5" stroke="white" strokeWidth="2" />
                </svg>
                Entradas
            </span>
            <span className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                <svg width="24" height="10">
                    <line x1="0" y1="5" x2="24" y2="5" stroke="#6b7280" strokeWidth="2" strokeDasharray="5 3" />
                </svg>
                Salidas
            </span>
        </div>
    )
}

export function DashboardChart({ data }: DashboardChartProps) {
    const formatted = (data || []).map(d => ({
        ...d,
        name: formatLabel(d.name),
    }))

    const empty = formatted.length === 0

    return (
        <div className="relative w-full h-full flex flex-col">
            {/* Header inside chart panel */}
            <div className="flex items-center gap-2 mb-4 px-1">
                <TrendingUp className="h-4 w-4 text-rose-400" />
                <span className="font-bold text-sm text-rose-400">Evolución en los últimos 6 meses</span>
            </div>

            {empty ? (
                <div className="flex-1 flex items-center justify-center opacity-40 text-center">
                    <p className="text-sm text-zinc-400">Sin datos suficientes para el gráfico</p>
                </div>
            ) : (
                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={formatted}
                            margin={{ top: 10, right: 8, left: -24, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="gradIngresos" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#ffffff" stopOpacity={0.15} />
                                    <stop offset="100%" stopColor="#ffffff" stopOpacity={0.01} />
                                </linearGradient>
                                <linearGradient id="gradEgresos" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6b7280" stopOpacity={0.15} />
                                    <stop offset="100%" stopColor="#6b7280" stopOpacity={0.01} />
                                </linearGradient>
                            </defs>

                            <CartesianGrid
                                vertical={false}
                                stroke="rgba(255,255,255,0.04)"
                                strokeDasharray="0"
                            />

                            <XAxis
                                dataKey="name"
                                tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }}
                                tickLine={false}
                                axisLine={false}
                                dy={8}
                            />

                            <YAxis
                                tick={{ fill: '#6b7280', fontSize: 11 }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                            />

                            <Tooltip content={<CustomTooltip />} />

                            {/* Egresos first (behind) */}
                            <Area
                                type="monotone"
                                dataKey="Egresos"
                                stroke="#6b7280"
                                strokeWidth={2}
                                strokeDasharray="6 4"
                                fill="url(#gradEgresos)"
                                dot={<CustomDot stroke="#6b7280" />}
                                activeDot={{ r: 6, fill: '#6b7280', stroke: '#111', strokeWidth: 2 }}
                            />

                            {/* Ingresos on top (bright white) */}
                            <Area
                                type="monotone"
                                dataKey="Ingresos"
                                stroke="#ffffff"
                                strokeWidth={2.5}
                                fill="url(#gradIngresos)"
                                dot={<CustomDot stroke="#ffffff" />}
                                activeDot={{ r: 6, fill: '#ffffff', stroke: '#111', strokeWidth: 2 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}

            <CustomLegend />
        </div>
    )
}
