'use client'
import { updateMeetingStatus, deleteMeeting } from '@/app/(app)/actions/trabajo'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Video, MapPin, Phone, Clock, Trash2, CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const TYPE_ICONS: Record<string, any> = { virtual: Video, presencial: MapPin, telefonica: Phone }
const TYPE_COLORS: Record<string, string> = { virtual: 'text-blue-400', presencial: 'text-emerald-400', telefonica: 'text-amber-400' }

export function MeetingItem({ meeting }: { meeting: any }) {
    const router = useRouter()
    const isDone = meeting.status === 'done'
    const TypeIcon = TYPE_ICONS[meeting.type] || Video

    async function markDone() {
        await updateMeetingStatus(meeting.id, 'done')
        toast.success('Reunión marcada como realizada')
        router.refresh()
    }

    async function del() {
        if (!confirm('¿Eliminar reunión?')) return
        await deleteMeeting(meeting.id)
        router.refresh()
    }

    return (
        <Card className={`glass border-border/40 ${isDone ? 'opacity-60' : ''}`}>
            <CardContent className="p-4 flex items-center gap-4">
                {/* Fecha */}
                <div className="bg-violet-500/10 p-3 rounded-xl text-center min-w-[54px]">
                    <p className="text-xs font-bold text-violet-400">
                        {new Date(meeting.meeting_date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                    </p>
                    {meeting.meeting_time && (
                        <p className="text-[10px] text-muted-foreground font-mono">{meeting.meeting_time.substring(0, 5)}</p>
                    )}
                </div>

                <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className={`font-semibold ${isDone ? 'line-through' : ''}`}>{meeting.title}</p>
                        <span className={`flex items-center gap-1 text-[10px] font-semibold ${TYPE_COLORS[meeting.type] || 'text-muted-foreground'}`}>
                            <TypeIcon className="h-3 w-3" /> {meeting.type}
                        </span>
                    </div>
                    <div className="flex gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                        {meeting.with_whom && <span>👥 {meeting.with_whom}</span>}
                        {meeting.duration_min && <span><Clock className="h-3 w-3 inline" /> {meeting.duration_min}min</span>}
                        {meeting.location && <span>📍 {meeting.location}</span>}
                        {meeting.work_projects && <span>📁 {meeting.work_projects.name}</span>}
                    </div>
                </div>

                <div className="flex gap-1">
                    {!isDone && (
                        <button onClick={markDone} className="p-1.5 rounded-lg hover:bg-emerald-500/20 text-muted-foreground hover:text-emerald-400 transition-colors">
                            <CheckCircle2 className="h-4 w-4" />
                        </button>
                    )}
                    <button onClick={del} className="p-1.5 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </CardContent>
        </Card>
    )
}
