import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Video, MapPin, Phone } from 'lucide-react'
import { MeetingForm } from '@/components/trabajo/meeting-form'
import { MeetingItem } from '@/components/trabajo/meeting-item'

export default async function ReunionesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const [{ data: meetData }, { data: projectsData }] = await Promise.all([
        supabase.from('work_meetings').select('*, work_projects(name, color)').eq('user_id', user.id).order('meeting_date', { ascending: true }),
        supabase.from('work_projects').select('id, name, color').eq('user_id', user.id).eq('status', 'active'),
    ])

    const meetings = (meetData || []) as any[]
    const projects = (projectsData || []) as any[]

    const today = new Date().toISOString().split('T')[0]
    const upcoming = meetings.filter(m => m.meeting_date >= today && m.status === 'scheduled')
    const past = meetings.filter(m => m.meeting_date < today || m.status === 'done')

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pt-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Users className="h-7 w-7 text-violet-400" /> Reuniones
                    </h1>
                    <p className="text-muted-foreground mt-1">{upcoming.length} próximas</p>
                </div>
                <MeetingForm projects={projects} />
            </div>

            {/* Próximas */}
            <div>
                <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">Próximas</h2>
                {upcoming.length === 0 ? (
                    <div className="glass rounded-xl p-10 text-center border border-dashed border-border/50">
                        <Users className="h-10 w-10 mx-auto text-violet-400 opacity-30 mb-3" />
                        <p className="text-muted-foreground text-sm">No hay reuniones programadas.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {upcoming.map(m => <MeetingItem key={m.id} meeting={m} />)}
                    </div>
                )}
            </div>

            {/* Pasadas */}
            {past.length > 0 && (
                <div>
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">Historial</h2>
                    <div className="space-y-3 opacity-60">
                        {past.slice(0, 10).map(m => <MeetingItem key={m.id} meeting={m} />)}
                    </div>
                </div>
            )}
        </div>
    )
}
