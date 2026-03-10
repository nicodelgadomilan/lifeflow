import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Wallet, CalendarDays, HeartPulse, Target, Briefcase, Car, Dumbbell, ShieldCheck, Zap } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  const features = [
    {
      title: "Finanzas Inteligentes",
      description: "Maneja múltiples divisas, controla suscripciones, tarjetas de crédito, metas de ahorro y monitorea tu patrimonio en tiempo real.",
      icon: Wallet,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
      border: "border-emerald-500/20"
    },
    {
      title: "Organización Absoluta",
      description: "Calendarios unificados, gestión de tareas pendientes y modo supermercado inteligente para que no olvides nada.",
      icon: CalendarDays,
      color: "text-blue-500",
      bg: "bg-blue-500/10 dark:bg-blue-500/20",
      border: "border-blue-500/20"
    },
    {
      title: "Centro de Trabajo",
      description: "Supervisa proyectos, tareas laborales, próximas reuniones y lleva un control estricto de cobranzas y tributos.",
      icon: Briefcase,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10 dark:bg-indigo-500/20",
      border: "border-indigo-500/20"
    },
    {
      title: "Salud y Bienestar",
      description: "Tracker de hábitos hiper detallado por momentos del día, citas médicas y métricas corporales para tu cuerpo.",
      icon: HeartPulse,
      color: "text-rose-500",
      bg: "bg-rose-500/10 dark:bg-rose-500/20",
      border: "border-rose-500/20"
    },
    {
      title: "Rendimiento Deportivo",
      description: "Registra tus medidas de gimnasio, clases recurrentes y utiliza temporizadores enfocados para rutinas.",
      icon: Dumbbell,
      color: "text-orange-500",
      bg: "bg-orange-500/10 dark:bg-orange-500/20",
      border: "border-orange-500/20"
    },
    {
      title: "Control Vehicular",
      description: "Historial completo de mantenimiento, reparaciones y gastos vinculados a tu vehículo y seguros.",
      icon: Car,
      color: "text-sky-500",
      bg: "bg-sky-500/10 dark:bg-sky-500/20",
      border: "border-sky-500/20"
    }
  ]

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30 selection:text-primary overflow-hidden relative font-sans">

      {/* Elementos de fondo decorativos */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 dark:bg-primary/10 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] right-[-10%] w-[30%] h-[30%] rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-[120px] pointer-events-none -z-10" />

      {/* Navegación Suprema */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/40 glass-panel bg-background/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg shadow-sm">
              <Target className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              Life<span className="text-primary">Hub</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {session ? (
              <Link href="/dashboard">
                <Button className="rounded-full shadow-md bg-primary hover:bg-primary/90 text-white font-medium px-6 transition-all hover:scale-105 active:scale-95">
                  Ir al Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button className="rounded-full shadow-md bg-primary hover:bg-primary/90 text-white font-medium px-6 transition-all hover:scale-105 active:scale-95">
                  Iniciar Sesión <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Héroe Principal */}
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center animate-fade-in">

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-primary/20 bg-primary/5 text-primary text-sm font-semibold mb-8 hover:bg-primary/10 transition-colors cursor-default">
          <Zap className="h-4 w-4" />
          El Sistema Operativo para tu Vida
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight text-foreground max-w-4xl leading-[1.1] mb-6">
          Centraliza todo tu caos <br className="hidden md:block" />
          <span className="gradient-text">en un solo lugar.</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed font-medium">
          Finanzas, trabajo, rutinas saludables, tareas pendientes y hasta el mantenimiento de tu auto.
          LifeHub consolida todo lo que importa en interfaces diseñadas a la perfección.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-20 w-full sm:w-auto">
          {session ? (
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" className="rounded-full h-14 px-8 text-lg w-full shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-white transition-all hover:scale-105">
                Entrar a mi Hub <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" className="rounded-full h-14 px-8 text-lg w-full shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-white transition-all hover:scale-105">
                  Comienza Gratis
                </Button>
              </Link>
              <Link href="#features" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="rounded-full h-14 px-8 text-lg w-full border-border/60 hover:bg-muted/50 bg-background/50 backdrop-blur-md">
                  Descubrir módulos
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Muestra Previa de Dashboard (Visual Falso) */}
        <div className="w-full max-w-5xl rounded-3xl border border-border/40 shadow-2xl overflow-hidden glass-panel relative group animate-fade-in-delay-1">
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent z-10" />

          <div className="h-10 w-full bg-muted/40 border-b border-border/40 flex items-center px-4 gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
          </div>
          <div className="bg-background/80 w-full h-[400px] md:h-[600px] p-4 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-70 group-hover:opacity-100 transition-opacity duration-700">
            {/* Mock de UI */}
            <div className="md:col-span-2 space-y-4">
              <div className="h-32 rounded-2xl bg-primary/5 border border-primary/10 flex p-6 flex-col justify-center">
                <div className="w-32 h-4 bg-primary/20 rounded mb-4" />
                <div className="w-48 h-8 bg-primary/40 rounded" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-48 rounded-2xl border border-border/40 bg-card p-4 space-y-3">
                  <div className="w-8 h-8 rounded bg-rose-500/10" />
                  <div className="w-full h-2 bg-muted rounded" />
                  <div className="w-2/3 h-2 bg-muted rounded" />
                </div>
                <div className="h-48 rounded-2xl border border-border/40 bg-card p-4 space-y-3">
                  <div className="w-8 h-8 rounded bg-emerald-500/10" />
                  <div className="w-full h-2 bg-muted rounded" />
                  <div className="w-2/3 h-2 bg-muted rounded" />
                </div>
              </div>
            </div>
            <div className="h-full rounded-2xl border border-border/40 bg-card p-6 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-full border border-primary/20 flex items-center justify-center mb-2 mx-auto mt-4">
                <div className="w-10 h-10 rounded-full bg-primary/20" />
              </div>
              <div className="w-24 h-4 bg-muted mx-auto rounded mb-4" />
              <div className="flex-1 space-y-3">
                {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-full h-10 rounded-xl bg-muted/30" />)}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Grid de Features */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto relative relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Un ecosistema diseñado para <span className="text-primary">vos</span></h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Sustituye decenas de aplicaciones fragmentadas con una plataforma estéticamente superior y conceptualmente completa.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div key={idx} className={`bg-card rounded-3xl p-8 border border-border/40 hover:border-primary/30 transition-all shadow-sm hover:shadow-xl hover:shadow-primary/5 group`}>
              <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 border ${feature.border} group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`h-7 w-7 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Cierre / Llamado a la Acción */}
      <section className="py-24 px-6 relative z-10 border-t border-border/40 bg-muted/10">
        <div className="max-w-4xl mx-auto bg-card rounded-[3rem] p-10 md:p-20 text-center border border-border/40 glass-panel relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -z-10" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 blur-[100px] -z-10" />

          <ShieldCheck className="h-16 w-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Privado, Seguro y Tuyo</h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Todos tus datos están guardados cifrados sin analíticas invasivas. El control de tu vida pertenece solo a vos.
          </p>
          <Link href="/login">
            <Button size="lg" className="rounded-full h-16 px-10 text-xl font-bold shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-white transition-all hover:scale-105 active:scale-95">
              Crear Cuenta Ahora
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer minimalista */}
      <footer className="py-8 text-center text-muted-foreground border-t border-border/40 relative z-10 bg-background">
        <p className="font-medium">© {new Date().getFullYear()} LifeHub. El epicentro de tu rendimiento.</p>
      </footer>
    </div>
  )
}
