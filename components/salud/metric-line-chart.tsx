'use client'

import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts'
import { formatDate } from '@/lib/utils/formatters'

interface MetricPoint {
    date: string
    value: number
    unit: string
    notes?: string
}

interface Props {
    metrics: MetricPoint[]
    type: string
    color?: string
}

export function MetricLineChart({ metrics, type, color = '#6366f1' }: Props) {
    const data = useMemo(() => {
        return [...metrics]
            .filter(m => m.value != null)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(m => ({
                name: new Date(m.date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }),
                value: Number(m.value),
                unit: m.unit,
            }))
    }, [metrics])

    if (data.length < 2) {
        return (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm opacity-50">
                Necesitás al menos 2 registros para ver la evolución
            </div>
        )
    }

    const avg = data.reduce((s, d) => s + d.value, 0) / data.length
    const unit = data[0]?.unit || ''

    return (
        <div>
            <p className="text-xs text-muted-foreground mb-3">
                Promedio: <span className="font-bold text-foreground">{avg.toFixed(1)} {unit}</span>
            </p>
            <ResponsiveContainer width="100%" height={180}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" domain={['auto', 'auto']} />
                    <Tooltip
                        contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                        formatter={(v: any) => [`${v} ${unit}`, type]}
                    />
                    <ReferenceLine y={avg} stroke={color} strokeDasharray="4 4" strokeOpacity={0.5} />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: color }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}
