'use client'

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { Card, CardContent } from '@/components/ui/card'

interface ChartDataPoint {
    name: string
    Ingresos: number
    Egresos: number
}

interface DashboardChartProps {
    data: ChartDataPoint[]
}

export function DashboardChart({ data }: DashboardChartProps) {
    if (!data || data.length === 0) {
        return (
            <CardContent className="flex flex-col items-center justify-center p-6 h-full opacity-50 text-center">
                <p className="text-sm text-muted-foreground mt-2 max-w-sm">No hay suficientes datos para generar el gráfico este mes.</p>
            </CardContent>
        )
    }

    return (
        <CardContent className="p-6 h-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                        dataKey="name"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                        cursor={{ fill: 'hsl(var(--muted))' }}
                        contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    />
                    <Bar dataKey="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="Egresos" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
            </ResponsiveContainer>
        </CardContent>
    )
}
