import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  ArrowRight, Wallet, CalendarDays, HeartPulse, Target, Briefcase,
  Car, Dumbbell, ShieldCheck, Zap, BarChart3, CheckCircle2,
  TrendingUp, ListChecks, Users, Receipt, Sparkles, Star, ChevronRight
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export const metadata = {
  title: 'LifeHub — El Sistema Operativo para tu Vida',
  description: 'Finanzas, trabajo, salud, deportes, organización y más. LifeHub centraliza todo lo que importa en una sola plataforma diseñada a la perfección.',
  keywords: 'finanzas personales, hábitos, organización, trabajo, salud, lifestyle app',
  openGraph: {
    title: 'LifeHub — El Sistema Operativo para tu Vida',
    description: 'Centraliza finanzas, trabajo, hábitos y más en un solo lugar.',
  }
}

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  const modules = [
    {
      title: "Finanzas Inteligentes",
      description: "Maneja ARS, USD, EUR y Dólar Blue. Controlá suscripciones, tarjetas de crédito, metas de ahorro y monitoreá tu patrimonio neto en tiempo real.",
      icon: Wallet,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-500/15",
      border: "border-emerald-200/60 dark:border-emerald-500/20",
      badge: "Mult-divisa",
      items: ["Ingresos / Egresos", "Tarjetas de crédito", "Metas de ahorro", "Bienes y activos"]
    },
    {
      title: "Centro de Trabajo",
      description: "Tablero Kanban de proyectos, checklist diario de tareas recurrentes, próximas reuniones y gestión de cobranzas y tributación.",
      icon: Briefcase,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-50 dark:bg-indigo-500/15",
      border: "border-indigo-200/60 dark:border-indigo-500/20",
      badge: "Pro",
      items: ["Gestión de proyectos", "Checklist diario", "Cobros y pagos", "Control tributario"]
    },
    {
      title: "Salud y Bienestar",
      description: "Tracker de hábitos segmentado por mañana, tarde y noche. Control de peso con gráfico histórico, citas médicas y métricas corporales.",
      icon: HeartPulse,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-500/15",
      border: "border-rose-200/60 dark:border-rose-500/20",
      badge: "Nuevo",
      items: ["Hábitos diarios", "Control de peso/talla", "Citas médicas", "Métricas corporales"]
    },
    {
      title: "Organización Total",
      description: "Calendario personal y laboral unificados, lista de compras con modo supermercado, tareas pendientes y gestión de documentos importantes.",
      icon: CalendarDays,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-500/15",
      border: "border-blue-200/60 dark:border-blue-500/20",
      badge: "Smart",
      items: ["Calendario unificado", "Lista de compras", "Tareas pendientes", "Documentos importantes"]
    },
    {
      title: "Rendimiento Deportivo",
      description: "Registrá y visualizá tu progreso en el gimnasio. Clases semanales recurrentes, marcas personales y temporizadores de alta precisión.",
      icon: Dumbbell,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-500/15",
      border: "border-orange-200/60 dark:border-orange-500/20",
      badge: "Fitness",
      items: ["Historial de entrenamientos", "Clases recurrentes", "Marcas personales", "Temporizador Pomodoro"]
    },
    {
      title: "Control Vehicular",
      description: "Historial completo de mantenimientos, reparaciones, revisiones técnicas y seguros. Nunca más olvidés el cambio de aceite.",
      icon: Car,
      color: "text-sky-600 dark:text-sky-400",
      bg: "bg-sky-50 dark:bg-sky-500/15",
      border: "border-sky-200/60 dark:border-sky-500/20",
      badge: "Auto",
      items: ["Mantenimiento", "Reparaciones", "VTV y seguros", "Historial de gastos"]
    }
  ]

  const stats = [
    { value: "6+", label: "Módulos integrados", icon: Sparkles },
    { value: "100%", label: "Datos privados y tuyos", icon: ShieldCheck },
    { value: "∞", label: "Registros sin límite", icon: BarChart3 },
    { value: "2+", label: "Temas visuales", icon: Star }
  ]

  return (
    <div className="min-h-screen bg-background overflow-x-hidden font-sans">

      {/* ─── NAVBAR ─────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-primary p-1.5 rounded-lg shadow-sm group-hover:scale-105 transition-transform">
              <Target className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Life<span className="text-primary">Hub</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="#modules" className="hover:text-foreground transition-colors">Módulos</Link>
            <Link href="#features" className="hover:text-foreground transition-colors">Características</Link>
            <Link href="#security" className="hover:text-foreground transition-colors">Seguridad</Link>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {session ? (
              <Link href="/dashboard">
                <Button className="rounded-full shadow-sm bg-primary hover:bg-primary/90 text-white font-semibold px-5 transition-all hover:scale-105 active:scale-95">
                  Mi Dashboard <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button className="rounded-full shadow-sm bg-primary hover:bg-primary/90 text-white font-semibold px-5 transition-all hover:scale-105 active:scale-95">
                  Entrar <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ─── HERO ─────────────────────────────────────────── */}
      <section className="relative pt-32 pb-16 px-5 max-w-7xl mx-auto flex flex-col items-center text-center overflow-hidden animate-fade-in">
        {/* Glow orbs */}
        <div className="absolute top-10 left-1/4 w-96 h-96 rounded-full bg-primary/8 dark:bg-primary/12 blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-indigo-500/8 dark:bg-indigo-500/12 blur-[140px] pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/25 bg-primary/8 text-primary text-sm font-semibold mb-8 cursor-default">
          <Zap className="h-3.5 w-3.5" />
          El Sistema Operativo para tu Vida
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] font-bold tracking-tight max-w-4xl leading-[1.08] mb-6">
          Centraliza todo lo que importa
          <br className="hidden md:block" />
          <span className="gradient-text"> en un solo lugar.</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
          Finanzas multi-divisa, proyectos laborales, rutinas de salud, entrenamientos y tu auto.
          <br className="hidden md:block" />
          LifeHub te da el control total con interfaces diseñadas para durar.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-24 w-full sm:w-auto">
          {session ? (
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" className="rounded-full h-14 px-10 text-base font-bold w-full shadow-xl shadow-primary/25 bg-primary hover:bg-primary/90 text-white transition-all hover:scale-105">
                Ir a mi Dashboard <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" className="rounded-full h-14 px-10 text-base font-bold w-full shadow-xl shadow-primary/25 bg-primary hover:bg-primary/90 text-white transition-all hover:scale-105">
                  Comenzar Gratis <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#modules" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="rounded-full h-14 px-10 text-base font-semibold w-full border-border/50 hover:border-primary/40 hover:bg-muted/50 transition-all">
                  Ver módulos
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Dashboard App Preview */}
        <div className="w-full max-w-5xl rounded-[2rem] border border-border/40 shadow-2xl overflow-hidden bg-card relative group">
          {/* Fade overlay bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none z-10" style={{ top: '60%' }} />
          {/* Browser frame */}
          <div className="h-10 w-full bg-muted/60 border-b border-border/40 flex items-center px-4 gap-3 shrink-0">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500/70" />
              <div className="w-3 h-3 rounded-full bg-amber-500/70" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
            </div>
            <div className="flex-1 mx-4 h-5 bg-background/70 rounded-md border border-border/40 text-[10px] text-muted-foreground/60 flex items-center px-3">
              lifehub.app/dashboard
            </div>
          </div>
          {/* Mock Dashboard */}
          <div className="p-5 md:p-8 grid grid-cols-12 gap-4 bg-background/95 min-h-[380px]">
            {/* Sidebar */}
            <div className="col-span-2 flex flex-col gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/20 mb-3" />
              {[...Array(6)].map((_, i) => (
                <div key={i} className={`h-7 rounded-lg ${i === 0 ? 'bg-primary/20 w-full' : 'bg-muted/50 w-4/5'}`} />
              ))}
            </div>
            {/* Main content */}
            <div className="col-span-10 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { color: 'bg-emerald-500/20', accent: 'bg-emerald-500/60' },
                  { color: 'bg-blue-500/20', accent: 'bg-blue-500/60' },
                  { color: 'bg-rose-500/20', accent: 'bg-rose-500/60' }
                ].map((c, i) => (
                  <div key={i} className={`h-24 rounded-2xl ${c.color} border border-border/20 p-4 flex flex-col justify-between`}>
                    <div className={`w-6 h-6 rounded-lg ${c.accent} opacity-70`} />
                    <div>
                      <div className="w-12 h-2 bg-foreground/10 rounded mb-2" />
                      <div className="w-20 h-4 bg-foreground/20 rounded" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-5 gap-3">
                <div className="col-span-3 h-44 rounded-2xl bg-muted/30 border border-border/20 p-4">
                  <div className="w-24 h-3 bg-foreground/10 rounded mb-4" />
                  <div className="flex items-end gap-1 h-24 mt-2">
                    {[60, 40, 80, 55, 90, 45, 70].map((h, i) => (
                      <div key={i} className={`flex-1 rounded-t-md ${i === 4 ? 'bg-primary/70' : 'bg-primary/20'}`} style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
                <div className="col-span-2 h-44 rounded-2xl bg-muted/30 border border-border/20 p-4 space-y-2">
                  <div className="w-20 h-3 bg-foreground/10 rounded mb-3" />
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-md ${i < 3 ? 'bg-emerald-500/40' : 'bg-border/40'}`} />
                      <div className="flex-1 h-2.5 bg-foreground/10 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS ─────────────────────────────────────── */}
      <section className="py-16 px-5 border-y border-border/30 bg-muted/20">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="flex justify-center mb-2">
                <s.icon className="h-5 w-5 text-primary/70" />
              </div>
              <div className="text-4xl font-black text-foreground mb-1">{s.value}</div>
              <div className="text-sm text-muted-foreground font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── MODULES GRID ─────────────────────────────── */}
      <section id="modules" className="py-24 px-5 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/50 bg-muted/40 text-muted-foreground text-sm font-semibold mb-6">
            <ListChecks className="h-3.5 w-3.5" /> 6 Módulos completos incluidos
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-5">
            Un ecosistema diseñado
            <br className="hidden md:block" />
            <span className="text-primary"> para vos</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Reemplazá decenas de apps fragmentadas con una plataforma integral, cohesiva y estéticamente superior.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((mod, idx) => (
            <div
              key={idx}
              className={`relative bg-card rounded-3xl p-8 border ${mod.border} hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 group`}
            >
              {/* Badge */}
              <span className={`absolute top-5 right-5 text-[10px] font-bold uppercase tracking-widest ${mod.color} ${mod.bg} px-2.5 py-1 rounded-full`}>
                {mod.badge}
              </span>

              <div className={`w-14 h-14 rounded-2xl ${mod.bg} flex items-center justify-center mb-6 border ${mod.border} group-hover:scale-110 transition-transform duration-300`}>
                <mod.icon className={`h-7 w-7 ${mod.color}`} />
              </div>

              <h3 className="text-xl font-bold mb-3">{mod.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm mb-6">{mod.description}</p>

              <ul className="space-y-2">
                {mod.items.map((item, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className={`h-4 w-4 shrink-0 ${mod.color}`} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES LIST ─────────────────────────────── */}
      <section id="features" className="py-24 px-5 bg-muted/10 border-y border-border/30">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-5">
              Todo lo que necesitás está <span className="gradient-text">pensado de antemano</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              LifeHub no es una herramienta genérica. Fue construido para resolver problemas de la vida real con soluciones específicas y un nivel de detalle obsesivo.
            </p>
            <div className="grid gap-4">
              {[
                { icon: TrendingUp, title: "Finanzas multi-divisa", desc: "ARS, USD, EUR, Blue Dollar con tasas de cambio actualizables" },
                { icon: BarChart3, title: "Gráficos de análisis", desc: "Visualizá tu progreso con gráficos claros y contextuales" },
                { icon: Users, title: "Reuniones y agenda laboral", desc: "Coordiná reuniones y tipo de contacto directamente desde el Hub" },
                { icon: Receipt, title: "Tributación y cobros", desc: "Control de impuestos y cuentas por cobrar/pagar" },
              ].map((f, i) => (
                <div key={i} className="flex gap-4 p-4 bg-card rounded-2xl border border-border/40 hover:border-primary/20 transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{f.title}</h4>
                    <p className="text-muted-foreground text-sm">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { title: "Hábitos del día", value: "8/10", sub: "completados hoy", color: "text-emerald-500", bg: "bg-emerald-500/10" },
              { title: "Patrimonio neto", value: "$2.4M", sub: "en ARS equivalente", color: "text-blue-500", bg: "bg-blue-500/10" },
              { title: "Tareas de trabajo", value: "3", sub: "pendientes hoy", color: "text-indigo-500", bg: "bg-indigo-500/10" },
              { title: "Próxima revisión", value: "Dic 20", sub: "service del vehículo", color: "text-orange-500", bg: "bg-orange-500/10" },
            ].map((card, i) => (
              <div key={i} className={`p-6 rounded-3xl border border-border/40 bg-card hover:border-primary/20 transition-all shadow-sm hover:shadow-md`}>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest mb-3">{card.title}</p>
                <p className={`text-3xl font-black ${card.color} mb-1`}>{card.value}</p>
                <p className="text-xs text-muted-foreground">{card.sub}</p>
              </div>
            ))}
            <div className="col-span-2 p-6 rounded-3xl border border-primary/20 bg-primary/5 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="font-bold mb-1">Todo sincronizado en tiempo real</p>
                <p className="text-sm text-muted-foreground">Cada cambio se refleja instantáneamente en todos tus dispositivos.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECURITY CTA ──────────────────────────────── */}
      <section id="security" className="py-24 px-5">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-8">
            <ShieldCheck className="h-10 w-10 text-primary" />
          </div>

          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-5">
            Privado. Seguro. <span className="gradient-text">Exclusivamente tuyo.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
            Tus datos están cifrados, no se venden ni se usan para entrenar modelos de IA.
            Sin publicidad invasiva, sin analíticas de terceros. Solo vos y tu información.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 text-sm">
            {[
              { icon: ShieldCheck, text: "Datos cifrados en tránsito y en reposo" },
              { icon: CheckCircle2, text: "Sin venta de datos a terceros" },
              { icon: Zap, text: "Infraestructura sobre Supabase & Vercel" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border/40">
                <f.icon className="h-5 w-5 text-primary shrink-0" />
                <span className="text-muted-foreground font-medium">{f.text}</span>
              </div>
            ))}
          </div>

          <Link href="/login">
            <Button size="lg" className="rounded-full h-16 px-12 text-lg font-bold shadow-xl shadow-primary/25 bg-primary hover:bg-primary/90 text-white transition-all hover:scale-105 active:scale-95">
              Crear Cuenta Gratis
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-4">Sin tarjeta de crédito. Sin compromiso.</p>
        </div>
      </section>

      {/* ─── FOOTER ────────────────────────────────────── */}
      <footer className="py-10 px-5 border-t border-border/40 bg-muted/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <Target className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-foreground">LifeHub</span>
          </Link>

          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} LifeHub. El epicentro de tu rendimiento personal.
          </p>

          <div className="flex items-center gap-5 text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-foreground transition-colors">Iniciar Sesión</Link>
            <Link href="#features" className="hover:text-foreground transition-colors">Características</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
