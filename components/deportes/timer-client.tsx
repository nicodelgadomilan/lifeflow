'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, Pause, Square, RotateCcw, Timer, Activity, Hourglass } from 'lucide-react'

export function SportsTimer() {
    const [mode, setMode] = useState<'stopwatch' | 'countdown' | 'tabata'>('stopwatch')

    // Stopwatch State
    const [swTime, setSwTime] = useState(0)
    const [swIsRunning, setSwIsRunning] = useState(false)

    // Countdown State
    const [cdInputMinutes, setCdInputMinutes] = useState(5)
    const [cdTime, setCdTime] = useState(5 * 60)
    const [cdIsRunning, setCdIsRunning] = useState(false)

    // Tabata State
    const [tbWork, setTbWork] = useState(20)
    const [tbRest, setTbRest] = useState(10)
    const [tbRounds, setTbRounds] = useState(8)

    const [tbCurrentTime, setTbCurrentTime] = useState(20)
    const [tbCurrentRound, setTbCurrentRound] = useState(1)
    const [tbPhase, setTbPhase] = useState<'work' | 'rest'>('work')
    const [tbIsRunning, setTbIsRunning] = useState(false)

    // Interval Ref
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    // Format helpers
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0')
        const s = (seconds % 60).toString().padStart(2, '0')
        return `${m}:${s}`
    }

    const formatMs = (ms: number) => {
        const m = Math.floor(ms / 60000).toString().padStart(2, '0')
        const s = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0')
        const msPart = Math.floor((ms % 1000) / 10).toString().padStart(2, '0')
        return `${m}:${s}.${msPart}`
    }

    // --- STOPWATCH LOGIC ---
    useEffect(() => {
        if (mode === 'stopwatch' && swIsRunning) {
            intervalRef.current = setInterval(() => setSwTime(prev => prev + 10), 10)
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current)
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
    }, [swIsRunning, mode])

    const startStopwatch = () => setSwIsRunning(!swIsRunning)
    const resetStopwatch = () => {
        setSwIsRunning(false)
        setSwTime(0)
    }

    // --- COUNTDOWN LOGIC ---
    useEffect(() => {
        if (mode === 'countdown' && cdIsRunning && cdTime > 0) {
            intervalRef.current = setInterval(() => setCdTime(prev => prev - 1), 1000)
        } else if (cdTime === 0 && cdIsRunning) {
            setCdIsRunning(false)
            // Beep logic could be added here
        }
        if (!cdIsRunning && intervalRef.current) clearInterval(intervalRef.current)
        return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
    }, [cdIsRunning, cdTime, mode])

    const startCountdown = () => setCdIsRunning(!cdIsRunning)
    const resetCountdown = () => {
        setCdIsRunning(false)
        setCdTime(cdInputMinutes * 60)
    }

    // --- TABATA LOGIC ---
    useEffect(() => {
        if (mode === 'tabata' && tbIsRunning) {
            intervalRef.current = setInterval(() => {
                setTbCurrentTime(prev => {
                    if (prev > 0) return prev - 1

                    // Phase change
                    if (tbPhase === 'work') {
                        setTbPhase('rest')
                        return tbRest
                    } else {
                        // End of rest = next round
                        if (tbCurrentRound < tbRounds) {
                            setTbCurrentRound(r => r + 1)
                            setTbPhase('work')
                            return tbWork
                        } else {
                            // Finished all rounds
                            setTbIsRunning(false)
                            return 0
                        }
                    }
                })
            }, 1000)
        }
        if (!tbIsRunning && intervalRef.current) clearInterval(intervalRef.current)
        return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
    }, [tbIsRunning, mode, tbPhase, tbCurrentRound, tbRounds, tbWork, tbRest])

    const startTabata = () => setTbIsRunning(!tbIsRunning)
    const resetTabata = () => {
        setTbIsRunning(false)
        setTbCurrentTime(tbWork)
        setTbPhase('work')
        setTbCurrentRound(1)
    }

    // Handlers to clear timers when switching modes
    const handleModeSwitch = (newMode: 'stopwatch' | 'countdown' | 'tabata') => {
        if (swIsRunning) startStopwatch()
        if (cdIsRunning) startCountdown()
        if (tbIsRunning) startTabata()
        setMode(newMode)
    }

    return (
        <Card className="glass overflow-hidden border-orange-500/20">
            {/* TABS */}
            <div className="flex border-b border-border/50 bg-muted/5">
                <button
                    className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${mode === 'stopwatch' ? 'text-orange-500 border-b-2 border-orange-500 bg-orange-500/5' : 'text-muted-foreground hover:bg-muted/10'}`}
                    onClick={() => handleModeSwitch('stopwatch')}
                >
                    <Timer className="h-4 w-4" /> Cronómetro
                </button>
                <button
                    className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${mode === 'countdown' ? 'text-orange-500 border-b-2 border-orange-500 bg-orange-500/5' : 'text-muted-foreground hover:bg-muted/10'}`}
                    onClick={() => handleModeSwitch('countdown')}
                >
                    <Hourglass className="h-4 w-4" /> Temporizador
                </button>
                <button
                    className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${mode === 'tabata' ? 'text-orange-500 border-b-2 border-orange-500 bg-orange-500/5' : 'text-muted-foreground hover:bg-muted/10'}`}
                    onClick={() => handleModeSwitch('tabata')}
                >
                    <Activity className="h-4 w-4" /> Tabata
                </button>
            </div>

            <CardContent className="p-8 md:p-12 flex flex-col items-center justify-center min-h-[400px]">

                {/* --- STOPWATCH VIEW --- */}
                {mode === 'stopwatch' && (
                    <div className="flex flex-col items-center animate-fade-in">
                        <div className="font-mono text-7xl md:text-9xl font-bold tracking-tighter text-foreground tabular-nums">
                            {formatMs(swTime)}
                        </div>
                        <div className="flex gap-4 mt-12">
                            <Button
                                size="lg"
                                className={`h-16 w-32 rounded-2xl text-lg ${swIsRunning ? 'bg-amber-500 hover:bg-amber-600 text-black' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}
                                onClick={startStopwatch}
                            >
                                {swIsRunning ? <><Pause className="mr-2" /> Pausar</> : <><Play className="mr-2" /> Iniciar</>}
                            </Button>
                            <Button size="lg" variant="outline" className="h-16 w-32 rounded-2xl text-lg" onClick={resetStopwatch}>
                                <RotateCcw className="mr-2" /> Cero
                            </Button>
                        </div>
                    </div>
                )}

                {/* --- COUNTDOWN VIEW --- */}
                {mode === 'countdown' && (
                    <div className="flex flex-col items-center animate-fade-in w-full max-w-sm">
                        {!cdIsRunning && cdTime === cdInputMinutes * 60 && (
                            <div className="mb-8 w-full flex items-center justify-center gap-4">
                                <label className="text-sm font-medium">Minutos:</label>
                                <input
                                    type="number"
                                    className="bg-muted text-center w-24 p-2 rounded-lg text-lg font-bold"
                                    value={cdInputMinutes}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value) || 1
                                        setCdInputMinutes(val)
                                        setCdTime(val * 60)
                                    }}
                                    min="1"
                                    max="120"
                                />
                            </div>
                        )}

                        <div className={`font-mono text-8xl md:text-9xl font-bold tracking-tighter tabular-nums ${cdTime === 0 ? 'text-destructive blink animate-pulse' : 'text-foreground'}`}>
                            {formatTime(cdTime)}
                        </div>

                        <div className="flex gap-4 mt-12">
                            <Button
                                size="lg"
                                className={`h-16 w-32 rounded-2xl text-lg ${cdIsRunning ? 'bg-amber-500 hover:bg-amber-600 text-black' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}
                                onClick={startCountdown}
                            >
                                {cdIsRunning ? <><Pause className="mr-2" /> Pausar</> : <><Play className="mr-2" /> Iniciar</>}
                            </Button>
                            <Button size="lg" variant="outline" className="h-16 w-32 rounded-2xl text-lg" onClick={resetCountdown}>
                                <Square className="mr-2" /> Reset
                            </Button>
                        </div>
                    </div>
                )}

                {/* --- TABATA VIEW --- */}
                {mode === 'tabata' && (
                    <div className="flex flex-col items-center animate-fade-in w-full">

                        {/* Config Panel */}
                        {!tbIsRunning && tbCurrentTime === tbWork && tbCurrentRound === 1 && (
                            <div className="grid grid-cols-3 gap-4 w-full max-w-md mb-8">
                                <div className="flex flex-col items-center bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                                    <span className="text-xs font-semibold text-emerald-500 uppercase">Trabajo (s)</span>
                                    <input type="number" value={tbWork} onChange={e => { setTbWork(parseInt(e.target.value) || 1); setTbCurrentTime(parseInt(e.target.value) || 1) }} className="w-16 bg-transparent text-center font-bold text-xl outline-none mt-1" />
                                </div>
                                <div className="flex flex-col items-center bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
                                    <span className="text-xs font-semibold text-blue-500 uppercase">Descanso (s)</span>
                                    <input type="number" value={tbRest} onChange={e => setTbRest(parseInt(e.target.value) || 1)} className="w-16 bg-transparent text-center font-bold text-xl outline-none mt-1" />
                                </div>
                                <div className="flex flex-col items-center bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                                    <span className="text-xs font-semibold text-amber-500 uppercase">Rondas</span>
                                    <input type="number" value={tbRounds} onChange={e => setTbRounds(parseInt(e.target.value) || 1)} className="w-16 bg-transparent text-center font-bold text-xl outline-none mt-1" />
                                </div>
                            </div>
                        )}

                        {/* Status Heading */}
                        <div className={`text-2xl md:text-4xl font-black uppercase tracking-widest mt-4 ${tbPhase === 'work' ? 'text-emerald-500' : 'text-blue-500'}`}>
                            {tbIsRunning || tbCurrentRound > 1 ? (tbPhase === 'work' ? '¡TRABAJO!' : 'DESCANSO') : 'LISTO'}
                        </div>

                        {/* Main Timer */}
                        <div className={`font-mono text-8xl md:text-[10rem] font-bold tracking-tighter tabular-nums leading-none my-4 ${tbPhase === 'work' ? 'text-emerald-500' : 'text-blue-500'}`}>
                            {tbCurrentTime}
                        </div>

                        {/* Rounds */}
                        <div className="text-xl font-medium text-muted-foreground uppercase tracking-widest border border-border px-6 py-2 rounded-full mb-8">
                            Ronda {tbCurrentRound} <span className="opacity-50 mx-2">/</span> {tbRounds}
                        </div>

                        {/* Controls */}
                        <div className="flex gap-4">
                            <Button
                                size="lg"
                                className={`h-16 w-32 rounded-2xl text-lg ${tbIsRunning ? 'bg-amber-500 hover:bg-amber-600 text-black' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}
                                onClick={startTabata}
                            >
                                {tbIsRunning ? <><Pause className="mr-2" /> Pausa</> : <><Play className="mr-2" /> GO!</>}
                            </Button>
                            <Button size="lg" variant="outline" className="h-16 w-32 rounded-2xl text-lg hover:bg-destructive hover:text-white" onClick={resetTabata}>
                                <RotateCcw className="mr-2" /> Reset
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
