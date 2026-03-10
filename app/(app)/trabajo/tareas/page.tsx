import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckSquare, Clock, AlertTriangle } from 'lucide-react'
import { WorkTaskForm } from '@/components/trabajo/work-task-form'
import { WorkTaskItem } from '@/components/trabajo/work-task-item'

const STATUS_COLS = [
    { key: 'todo', label: 'Por Hacer', color: 'border-muted/50 bg-muted/5' },
    { key: 'in_progress', label: 'En Progreso', color: 'border-blue-500/20 bg-blue-500/5' },
    { key: 'review', label: 'En Revisión', color: 'border-amber-500/20 bg-amber-500/5' },
    { key: 'done', label: 'Completadas', color: 'border-emerald-500/20 bg-emerald-500/5' },
]

export default async function WorkTareasPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const [{ data: tasksData }, { data: projectsData }] = await Promise.all([
        supabase.from('work_tasks').select('*, work_projects(name, color)').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('work_projects').select('id, name, color').eq('user_id', user.id).eq('status', 'active'),
    ])

    const tasks = (tasksData || []) as any[]
    const projects = (projectsData || []) as any[]

    const grouped: Record<string, any[]> = { todo: [], in_progress: [], review: [], done: [] }
    for (const t of tasks) {
        if (grouped[t.status]) grouped[t.status].push(t)
    }

    const pending = tasks.filter(t => t.status !== 'done').length
    const urgent = tasks.filter(t => t.priority === 'urgent' && t.status !== 'done').length

    return (
        <div className="space-y-6 animate-fade-in pt-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <CheckSquare className="h-7 w-7 text-blue-400" /> Tareas de Trabajo
                    </h1>
                    <p className="text-muted-foreground mt-1">{pending} pendientes{urgent > 0 ? ` · ${urgent} urgentes` : ''}</p>
                </div>
                <WorkTaskForm projects={projects} />
            </div>

            {/* Tablero Kanban */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {STATUS_COLS.map(col => (
                    <div key={col.key} className={`rounded-xl border p-4 space-y-3 ${col.color}`}>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-sm">{col.label}</h3>
                            <span className="text-xs bg-muted/30 px-2 py-0.5 rounded-full text-muted-foreground">
                                {grouped[col.key].length}
                            </span>
                        </div>
                        {grouped[col.key].length === 0 ? (
                            <p className="text-xs text-muted-foreground/40 text-center py-4">Vacío</p>
                        ) : (
                            grouped[col.key].map(task => (
                                <WorkTaskItem key={task.id} task={task} />
                            ))
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
