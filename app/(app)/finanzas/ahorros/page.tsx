export default function AhorrosPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 animate-fade-in">
            <div className="bg-emerald-500/10 p-4 rounded-full">
                <span className="text-4xl text-emerald-500">💰</span>
            </div>
            <h1 className="text-3xl font-bold">Objetivos de Ahorro</h1>
            <p className="text-muted-foreground max-w-md">
                Creá y hacele seguimiento a tus metas financieras. Te mostraremos el progreso para comprar ese auto o irte de viaje.
            </p>
            <div className="mt-8 p-4 border border-dashed text-emerald-500 border-emerald-500/30 rounded-xl bg-emerald-500/5">
                <p className="text-sm font-medium">Próximamente 🚧</p>
            </div>
        </div>
    )
}
