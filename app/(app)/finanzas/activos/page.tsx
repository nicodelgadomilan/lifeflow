export default function ActivosPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 animate-fade-in">
            <div className="bg-primary/10 p-4 rounded-full">
                <span className="text-4xl text-primary">📈</span>
            </div>
            <h1 className="text-3xl font-bold">Activos e Inversiones</h1>
            <p className="text-muted-foreground max-w-md">
                Un resumen de tu patrimonio neto. Tus inmuebles, criptomonedas, acciones o bienes de valor.
            </p>
            <div className="mt-8 p-4 border border-dashed rounded-xl bg-muted/30">
                <p className="text-sm font-medium">Próximamente 🚧</p>
            </div>
        </div>
    )
}
