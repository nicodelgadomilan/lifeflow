export default function ServiciosPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 animate-fade-in">
            <div className="bg-primary/10 p-4 rounded-full">
                <span className="text-4xl text-primary">💡</span>
            </div>
            <h1 className="text-3xl font-bold">Servicios</h1>
            <p className="text-muted-foreground max-w-md">
                Acá vas a poder gestionar el pago de tus servicios, ver próximos vencimientos y guardar los comprobantes.
            </p>
            <div className="mt-8 p-4 border border-dashed rounded-xl bg-muted/30">
                <p className="text-sm font-medium">Fase 1 - En desarrollo 🚧</p>
            </div>
        </div>
    )
}
