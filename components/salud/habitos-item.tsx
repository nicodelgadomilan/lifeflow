'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Check, Flame, Leaf } from 'lucide-react'
import { toggleHabitLog } from '@/app/(app)/actions/salud'
import { toast } from 'sonner'
import { Checkbox } from '@/components/ui/checkbox'

interface HabitProps {
    habit: any
    todayCompleted: boolean
    todayDateStr: string
}

export function HabitItem({ habit, todayCompleted, todayDateStr }: HabitProps) {
    const [loading, setLoading] = useState(false)
    const [checked, setChecked] = useState(todayCompleted)

    async function handleToggle() {
        setLoading(true)
        const toastId = toast.loading('Guardando...')
        const newStatus = !checked
        setChecked(newStatus)
        const res = await toggleHabitLog(habit.id, todayDateStr, !newStatus)
        setLoading(false)
        if (res.error) {
            toast.error(res.error, { id: toastId })
            setChecked(!newStatus) // revert
        } else {
            toast.success(newStatus ? '¡Día completado!' : 'Hábito desmarcado', { id: toastId })
        }
    }

    const timeLabels: Record<string, string> = {
        morning: 'Mañana',
        afternoon: 'Tarde',
        evening: 'Noche',
        any: 'Cualquier momento'
    }

    return (
        <Card className={`bg-card shadow-sm hover:shadow-md transition-all border-border/40 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
            <CardContent className="p-4 pl-6 flex justify-between items-center group cursor-pointer" onClick={handleToggle}>
                <div className="flex items-center gap-4">
                    <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${checked ? 'bg-emerald-500 text-white shadow-sm' : 'bg-muted/50 text-emerald-600/60 dark:text-emerald-500/50 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20'}`}
                    >
                        {checked ? <Check className="h-5 w-5" /> : <Leaf className="h-5 w-5" />}
                    </div>
                    <div>
                        <h3 className={`font-semibold ${checked ? 'line-through text-muted-foreground/50' : 'text-foreground'}`}>{habit.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{timeLabels[habit.time_of_day] || 'Cualquier momento'}</p>
                    </div>
                </div>

                <div onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                        checked={checked}
                        onCheckedChange={handleToggle}
                        className={`h-6 w-6 rounded-md transition-colors ${checked ? 'data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 data-[state=checked]:text-white' : 'border-border/60 hover:border-emerald-500/50'}`}
                    />
                </div>
            </CardContent>
        </Card>
    )
}
