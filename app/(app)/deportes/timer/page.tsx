import { SportsTimer } from '@/components/deportes/timer-client'

export default function TimerPage() {
    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pt-4 md:pt-10">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-orange-500 mb-2">Centro de Entrenamiento</h1>
                <p className="text-muted-foreground">
                    Elige el modo según tu rutina: Tiempo libre, cuenta regresiva o intervalos Tabata.
                </p>
            </div>

            <SportsTimer />

            <div className="text-center mt-12 opacity-60">
                <p className="text-sm border-orange-500/20 bg-orange-500/5 text-orange-500 max-w-sm mx-auto p-4 rounded-xl border border-dashed">
                    Mantén la pantalla encendida mientras el temporizador esté corriendo para evitar que se detenga en móviles.
                </p>
            </div>
        </div>
    )
}
