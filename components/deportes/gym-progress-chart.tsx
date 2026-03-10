'use client'

import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'

interface WorkoutSet {
    date: string
    exercise_name: string
    weight_kg: number | null
    reps: number | null
}

interface Props {
    sets: WorkoutSet[]
}

export function GymProgressChart({ sets }: Props) {
    // Get unique exercises that have weight data
    const exercises = useMemo(() => {
        const map: Record<string, { date: string; weight: number }[]> = {}
        sets.filter(s => s.weight_kg && s.weight_kg > 0).forEach(s => {
            const name = s.exercise_name
            if (!map[name]) map[name] = []
            map[name].push({ date: s.date, weight: Number(s.weight_kg) })
        })
        // Pick top 4 exercises by frequency
        return Object.entries(map)
            .sort((a, b) => b[1].length - a[1].length)
            .slice(0, 4)
            .map(([name, pts]) => ({
                name,
                data: pts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map(p => ({
                        date: new Date(p.date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }),
                        kg: p.weight
                    }))
            }))
    }, [sets])

    if (exercises.length === 0) {
        return (
            <div className="flex items-center justify-center h-40 text-muted-foreground text-sm opacity-50">
                Registrá ejercicios con peso para ver la progresión
            </div>
        )
    }

    const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444']

    // Merge all dates
    const allDates = Array.from(new Set(exercises.flatMap(e => e.data.map(d => d.date)))).sort()
    const chartData = allDates.map(date => {
        const point: any = { date }
        exercises.forEach(ex => {
            const found = ex.data.findLast(d => d.date === date)
            if (found) point[ex.name] = found.kg
        })
        return point
    })

    return (
        <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" unit=" kg" />
                <Tooltip
                    contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '11px' }}
                    formatter={(v: any) => [`${v} kg`]}
                />
                <Legend formatter={(v) => <span className="text-xs">{v}</span>} />
                {exercises.map((ex, i) => (
                    <Line
                        key={ex.name}
                        type="monotone"
                        dataKey={ex.name}
                        stroke={COLORS[i % COLORS.length]}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        connectNulls
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    )
}
