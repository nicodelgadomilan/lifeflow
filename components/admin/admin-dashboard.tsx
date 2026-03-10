'use client'

import { useState, useMemo } from 'react'
import {
    Users, UserCheck, UserX, CreditCard, Search, ChevronDown, ChevronUp,
    Activity, Calendar, ShieldCheck, ShieldOff, TrendingUp, RefreshCw,
    CircleCheck, CircleX, AlertCircle, Loader2, Crown, Plus, Pencil, Trash2
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { toggleUserStatus, assignPlatformPlan, removePlatformSub } from '@/app/admin/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface User {
    id: string
    email: string
    created_at: string
    last_sign_in_at: string | null
    email_confirmed_at: string | null
    is_enabled: boolean
    disabled_reason: string | null
    platform_subs: any[]
    subscriptions: any[]
    recent_tx: any[]
}

interface Stats {
    totalUsers: number
    activeUsers: number
    totalSubs: number
    newUsersThisWeek: number
}

interface Props {
    users: User[]
    stats: Stats
}

const PLAN_LABELS: Record<string, { label: string; color: string }> = {
    free: { label: 'Free', color: 'text-zinc-400 border-zinc-600 bg-zinc-800' },
    pro: { label: 'Pro', color: 'text-blue-400 border-blue-500/40 bg-blue-500/10' },
    premium: { label: 'Premium', color: 'text-amber-400 border-amber-500/40 bg-amber-500/10' },
}

function RelativeTime({ date }: { date: string | null }) {
    if (!date) return <span className="text-zinc-600">—</span>
    return (
        <span className="text-zinc-400 text-xs">
            {formatDistanceToNow(new Date(date), { locale: es, addSuffix: true })}
        </span>
    )
}

function MetricCard({ icon: Icon, label, value, sub, color }: {
    icon: any; label: string; value: number | string; sub?: string; color: string
}) {
    return (
        <div className={`bg-zinc-900 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden`}>
            <div className={`absolute -right-4 -bottom-4 opacity-5`}>
                <Icon className="h-24 w-24" strokeWidth={1} />
            </div>
            <div className={`h-10 w-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
                <Icon className="h-5 w-5" />
            </div>
            <p className="text-3xl font-black text-white">{value}</p>
            <p className="text-sm text-zinc-400 mt-0.5">{label}</p>
            {sub && <p className="text-xs text-zinc-600 mt-1">{sub}</p>}
        </div>
    )
}

function AssignPlanModal({ userId, current, onClose, onSaved }: {
    userId: string; current?: string; onClose: () => void; onSaved: () => void
}) {
    const [plan, setPlan] = useState(current || 'free')
    const [amount, setAmount] = useState('')
    const [notes, setNotes] = useState('')
    const [saving, setSaving] = useState(false)

    async function handleSave() {
        setSaving(true)
        const res = await assignPlatformPlan(userId, plan, parseFloat(amount) || 0, notes)
        setSaving(false)
        if (res.error) toast.error(res.error)
        else { toast.success('Plan actualizado'); onSaved() }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-400" /> Asignar Plan
                </h3>
                <div className="space-y-3">
                    <div>
                        <label className="text-xs text-zinc-400 font-semibold uppercase tracking-widest block mb-1">Plan</label>
                        <div className="flex gap-2">
                            {['free', 'pro', 'premium'].map(p => (
                                <button
                                    key={p}
                                    onClick={() => setPlan(p)}
                                    className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-all capitalize
                                        ${plan === p ? PLAN_LABELS[p].color + ' border-current' : 'text-zinc-500 border-zinc-700 hover:border-zinc-500'}`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-zinc-400 font-semibold uppercase tracking-widest block mb-1">Monto (opcional)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-zinc-400 font-semibold uppercase tracking-widest block mb-1">Notas</label>
                        <input
                            type="text"
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Observaciones opcionales..."
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                        />
                    </div>
                </div>
                <div className="flex gap-2 mt-5">
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-zinc-700 text-zinc-400 hover:border-zinc-500 transition-colors">
                        Cancelar
                    </button>
                    <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
                        {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    )
}

function UserRow({ user, onRefresh }: { user: User; onRefresh: () => void }) {
    const [expanded, setExpanded] = useState(false)
    const [toggling, setToggling] = useState(false)
    const [showPlanModal, setShowPlanModal] = useState(false)
    const router = useRouter()

    const activePlan = user.platform_subs.find(s => s.status === 'active')
    const planKey = activePlan?.plan || 'free'
    const planConfig = PLAN_LABELS[planKey] || PLAN_LABELS.free

    const activeSubs = user.subscriptions.filter(s => s.is_active).length
    const totalTx = user.recent_tx.length

    async function handleToggle() {
        setToggling(true)
        const reason = !user.is_enabled ? null : prompt('Razón de deshabilitación (opcional):')
        const res = await toggleUserStatus(user.id, user.is_enabled, reason || null)
        setToggling(false)
        if (res.error) toast.error(res.error)
        else {
            toast.success(user.is_enabled ? 'Usuario deshabilitado' : 'Usuario habilitado')
            router.refresh()
        }
    }

    return (
        <>
            <div className={`bg-zinc-900 border rounded-xl overflow-hidden transition-all ${!user.is_enabled ? 'border-red-900/50 bg-red-950/10' : 'border-zinc-800 hover:border-zinc-700'}`}>
                {/* Main Row */}
                <div className="flex items-center gap-4 p-4">
                    {/* Avatar */}
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 uppercase ${user.is_enabled ? 'bg-zinc-700 text-white' : 'bg-red-900/30 text-red-400'}`}>
                        {user.email.substring(0, 1)}
                    </div>

                    {/* Email + Meta */}
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-sm truncate">{user.email}</p>
                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                            {/* Estado */}
                            {user.is_enabled ? (
                                <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                                    <CircleCheck className="h-3 w-3" /> Habilitado
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-[10px] text-red-400">
                                    <CircleX className="h-3 w-3" /> Deshabilitado
                                    {user.disabled_reason && <span className="text-zinc-600">— {user.disabled_reason}</span>}
                                </span>
                            )}
                            {/* Email confirmado */}
                            {!user.email_confirmed_at && (
                                <span className="flex items-center gap-1 text-[10px] text-amber-400">
                                    <AlertCircle className="h-3 w-3" /> Email sin confirmar
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Plan Badge */}
                    <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${planConfig.color}`}>
                            {planConfig.label}
                        </span>
                    </div>

                    {/* Stats chips */}
                    <div className="hidden md:flex items-center gap-3 shrink-0">
                        <div className="text-center">
                            <p className="text-xs font-bold text-white">{activeSubs}</p>
                            <p className="text-[10px] text-zinc-500">Suscrips.</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs font-bold text-white">{totalTx}</p>
                            <p className="text-[10px] text-zinc-500">Transac.</p>
                        </div>
                    </div>

                    {/* Last activity */}
                    <div className="hidden lg:block text-right shrink-0">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Último acceso</p>
                        <RelativeTime date={user.last_sign_in_at} />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={() => setShowPlanModal(true)}
                            className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
                            title="Asignar plan"
                        >
                            <Crown className="h-3.5 w-3.5" />
                        </button>
                        <button
                            onClick={handleToggle}
                            disabled={toggling}
                            className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${user.is_enabled
                                ? 'text-zinc-400 hover:text-red-400 hover:bg-red-400/10'
                                : 'text-emerald-400 hover:bg-emerald-400/10'
                                }`}
                            title={user.is_enabled ? 'Deshabilitar usuario' : 'Habilitar usuario'}
                        >
                            {toggling
                                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                : user.is_enabled
                                    ? <ShieldOff className="h-3.5 w-3.5" />
                                    : <ShieldCheck className="h-3.5 w-3.5" />
                            }
                        </button>
                        <button
                            onClick={() => setExpanded(e => !e)}
                            className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                        >
                            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </button>
                    </div>
                </div>

                {/* Expanded Detail */}
                {expanded && (
                    <div className="border-t border-zinc-800 bg-zinc-950/50 p-5 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {/* Info básica */}
                        <div>
                            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-3">Información de cuenta</p>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Registrado</span>
                                    <span className="text-zinc-300 text-xs">{new Date(user.created_at).toLocaleDateString('es-AR')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Email</span>
                                    <span className={`text-xs ${user.email_confirmed_at ? 'text-emerald-400' : 'text-amber-400'}`}>
                                        {user.email_confirmed_at ? '✓ Confirmado' : '⚠ Pendiente'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">User ID</span>
                                    <span className="text-zinc-600 text-xs font-mono">{user.id.substring(0, 8)}…</span>
                                </div>
                            </div>
                        </div>

                        {/* Suscripciones de servicios */}
                        <div>
                            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-3">
                                Suscripciones ({user.subscriptions.length})
                            </p>
                            {user.subscriptions.length === 0 ? (
                                <p className="text-xs text-zinc-600">Sin suscripciones</p>
                            ) : (
                                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                                    {user.subscriptions.map(s => (
                                        <div key={s.id} className="flex items-center justify-between text-xs">
                                            <span className={`truncate max-w-[120px] ${s.is_active ? 'text-zinc-300' : 'text-zinc-600 line-through'}`}>
                                                {s.name}
                                            </span>
                                            <span className="text-zinc-500 shrink-0 ml-2">
                                                {s.currency !== 'ARS' ? `${s.currency} ` : '$ '}{Number(s.amount).toLocaleString('es-AR')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Plan / pagos de plataforma */}
                        <div>
                            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-3">
                                Plan plataforma
                            </p>
                            {user.platform_subs.length === 0 ? (
                                <div className="space-y-2">
                                    <p className="text-xs text-zinc-600">Sin plan asignado (Free)</p>
                                    <button
                                        onClick={() => setShowPlanModal(true)}
                                        className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors"
                                    >
                                        <Plus className="h-3 w-3" /> Asignar plan
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-1.5">
                                    {user.platform_subs.map(s => (
                                        <div key={s.id} className="flex items-center justify-between text-xs bg-zinc-800 rounded-lg px-3 py-2">
                                            <div>
                                                <span className={`font-bold capitalize ${PLAN_LABELS[s.plan]?.color?.split(' ')[0] || 'text-white'}`}>
                                                    {s.plan}
                                                </span>
                                                {s.notes && <span className="text-zinc-600 ml-2 text-[10px]">{s.notes}</span>}
                                            </div>
                                            <span className="text-zinc-400">
                                                {s.amount > 0 ? `$${Number(s.amount).toLocaleString('es-AR')}` : 'Gratis'}
                                            </span>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => setShowPlanModal(true)}
                                        className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mt-1"
                                    >
                                        <Pencil className="h-3 w-3" /> Modificar
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {showPlanModal && (
                <AssignPlanModal
                    userId={user.id}
                    current={activePlan?.plan}
                    onClose={() => setShowPlanModal(false)}
                    onSaved={() => { setShowPlanModal(false); router.refresh() }}
                />
            )}
        </>
    )
}

export function AdminDashboard({ users, stats }: Props) {
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState<'all' | 'enabled' | 'disabled'>('all')
    const [sortBy, setSortBy] = useState<'created' | 'activity' | 'subs'>('activity')
    const router = useRouter()

    const filtered = useMemo(() => {
        let list = users.filter(u => {
            const matchSearch = !search || u.email.toLowerCase().includes(search.toLowerCase())
            const matchFilter = filter === 'all'
                || (filter === 'enabled' && u.is_enabled)
                || (filter === 'disabled' && !u.is_enabled)
            return matchSearch && matchFilter
        })

        if (sortBy === 'created') list = list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        if (sortBy === 'activity') list = list.sort((a, b) => {
            const da = a.last_sign_in_at ? new Date(a.last_sign_in_at).getTime() : 0
            const db = b.last_sign_in_at ? new Date(b.last_sign_in_at).getTime() : 0
            return db - da
        })
        if (sortBy === 'subs') list = list.sort((a, b) => b.subscriptions.length - a.subscriptions.length)

        return list
    }, [users, search, filter, sortBy])

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white">Panel de Control</h1>
                    <p className="text-zinc-400 mt-1 text-sm">Gestión global de usuarios · LifeHub Admin</p>
                </div>
                <button
                    onClick={() => router.refresh()}
                    className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-lg transition-all"
                >
                    <RefreshCw className="h-3.5 w-3.5" /> Actualizar
                </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    icon={Users}
                    label="Usuarios Totales"
                    value={stats.totalUsers}
                    sub="Excluyendo admin"
                    color="bg-blue-500/10 text-blue-400"
                />
                <MetricCard
                    icon={UserCheck}
                    label="Usuarios Activos"
                    value={stats.activeUsers}
                    sub="Cuentas habilitadas"
                    color="bg-emerald-500/10 text-emerald-400"
                />
                <MetricCard
                    icon={CreditCard}
                    label="Suscripciones"
                    value={stats.totalSubs}
                    sub="Servicios activos"
                    color="bg-violet-500/10 text-violet-400"
                />
                <MetricCard
                    icon={TrendingUp}
                    label="Nuevos esta semana"
                    value={stats.newUsersThisWeek}
                    sub="Registros 7 días"
                    color="bg-amber-500/10 text-amber-400"
                />
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Buscar por email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    {(['all', 'enabled', 'disabled'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all capitalize
                                ${filter === f
                                    ? 'bg-white text-zinc-900 border-white'
                                    : 'text-zinc-400 border-zinc-700 hover:border-zinc-500'
                                }`}
                        >
                            {f === 'all' ? 'Todos' : f === 'enabled' ? 'Habilitados' : 'Deshabilitados'}
                        </button>
                    ))}
                </div>
                <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as any)}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-400 focus:outline-none focus:border-zinc-600"
                >
                    <option value="activity">Por actividad</option>
                    <option value="created">Por registro</option>
                    <option value="subs">Por suscripciones</option>
                </select>
            </div>

            {/* Users List */}
            <div className="space-y-3">
                <p className="text-xs text-zinc-500 font-semibold uppercase tracking-widest">
                    {filtered.length} usuario{filtered.length !== 1 ? 's' : ''}
                </p>

                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Users className="h-12 w-12 text-zinc-700 mb-4" />
                        <p className="text-zinc-400 font-semibold">No hay usuarios que coincidan</p>
                        <p className="text-zinc-600 text-sm mt-1">Ajustá los filtros de búsqueda</p>
                    </div>
                ) : (
                    filtered.map(user => (
                        <UserRow key={user.id} user={user} onRefresh={() => router.refresh()} />
                    ))
                )}
            </div>
        </div>
    )
}
