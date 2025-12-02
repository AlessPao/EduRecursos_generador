import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";

interface TextToSpeechProps {
    text: string;
    onStateChange?: (isPlaying: boolean, isPaused: boolean) => void;
}

// Definir el tipo de ref para exponer métodos
export interface TextToSpeechRef {
    play: () => void;
    pause: () => void;
    resume: () => void;
    stop: () => void;
}

const TextToSpeech = forwardRef<TextToSpeechRef, TextToSpeechProps>(({ text, onStateChange }, ref) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<string>("");
    const [rate, setRate] = useState(1);
    const [progress, setProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const synth = useRef(window.speechSynthesis || null);
    const progressInterval = useRef<NodeJS.Timeout | null>(null);

    // Verificar si la API está disponible
    useEffect(() => {
        if (!synth.current) {
            setError("Tu navegador no soporta la API de síntesis de voz");
            setIsLoading(false);
        }
    }, []);

    // Cargar voces disponibles
    useEffect(() => {
        if (!synth.current) return;

        const loadVoices = () => {
            try {
                setIsLoading(true);
                const availableVoices = synth.current?.getVoices() || [];

                if (availableVoices.length === 0) {
                    setError("No se encontraron voces disponibles en tu navegador");
                    setIsLoading(false);
                    return;
                }

                setVoices(availableVoices);

                // Intentar encontrar una voz en español
                const spanishVoice = availableVoices.find(
                    voice => voice.lang.includes('es')
                );

                if (spanishVoice) {
                    setSelectedVoice(spanishVoice.name);
                } else if (availableVoices.length > 0) {
                    setSelectedVoice(availableVoices[0].name);
                }

                setIsLoading(false);
                setError(null);
            } catch (err) {
                console.error("Error al cargar voces:", err);
                setError("Error al cargar las voces disponibles");
                setIsLoading(false);
            }
        };

        loadVoices();

        // Chrome requiere este evento para cargar las voces
        if (synth.current?.onvoiceschanged !== undefined) {
            synth.current.onvoiceschanged = loadVoices;
        }

        return () => {
            synth.current?.cancel();
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
        };
    }, []);

    // Actualizar el estado del componente padre
    useEffect(() => {
        if (onStateChange) {
            onStateChange(isPlaying, isPaused);
        }
    }, [isPlaying, isPaused, onStateChange]);

    // Crear una nueva utterance cuando cambia el texto o la voz seleccionada
    useEffect(() => {
        if (!text || !synth.current) return;

        try {
            const u = new SpeechSynthesisUtterance(text);

            // Configurar voz seleccionada
            if (selectedVoice) {
                const voice = voices.find(v => v.name === selectedVoice);
                if (voice) {
                    u.voice = voice;
                }
            }

            u.rate = rate;

            // Eventos para controlar el estado
            u.onstart = () => {
                setIsPlaying(true);
                setIsPaused(false);
                setProgress(0);

                // Iniciar intervalo para actualizar progreso
                if (progressInterval.current) {
                    clearInterval(progressInterval.current);
                }

                progressInterval.current = setInterval(() => {
                    const charIndex = synth.current?.speaking
                        ? Math.floor((Date.now() - startTime.current) / (estimatedDuration.current / text.length))
                        : 0;

                    const calculatedProgress = Math.min(100, Math.max(0, (charIndex / text.length) * 100));
                    setProgress(calculatedProgress);
                }, 100);
            };

            u.onend = () => {
                setIsPlaying(false);
                setIsPaused(false);
                setProgress(100);

                if (progressInterval.current) {
                    clearInterval(progressInterval.current);
                    progressInterval.current = null;
                }
            };

            u.onpause = () => setIsPaused(true);
            u.onresume = () => setIsPaused(false);
            u.onerror = (event) => {
                console.error("Error en síntesis de voz:", event);
                setError("Error en la reproducción de voz");
                setIsPlaying(false);
                setIsPaused(false);

                if (progressInterval.current) {
                    clearInterval(progressInterval.current);
                    progressInterval.current = null;
                }
            };

            setUtterance(u);

            // Cancelar la síntesis anterior al actualizar
            synth.current?.cancel();
            setIsPlaying(false);
            setIsPaused(false);
            setProgress(0);

            if (progressInterval.current) {
                clearInterval(progressInterval.current);
                progressInterval.current = null;
            }

        } catch (err) {
            console.error("Error al crear utterance:", err);
            setError("Error al preparar la síntesis de voz");
        }
    }, [text, selectedVoice, rate, voices]);

    // Variables para el cálculo aproximado del progreso
    const startTime = useRef<number>(0);
    const estimatedDuration = useRef<number>(0);

    // Exponer métodos a través del ref
    useImperativeHandle(ref, () => ({
        play: () => {
            handlePlay();
        },
        pause: () => {
            handlePause();
        },
        resume: () => {
            handleResume();
        },
        stop: () => {
            handleStop();
        }
    }));

    const handlePlay = () => {
        if (!synth.current || !utterance) return;

        try {
            synth.current.cancel();
            synth.current.speak(utterance);

            setIsPlaying(true);
            setIsPaused(false);
            setError(null);

            // Estimar duración basada en longitud del texto y velocidad
            // (aproximadamente 5 caracteres por segundo a velocidad normal)
            startTime.current = Date.now();
            estimatedDuration.current = (text.length / (5 * rate)) * 1000;

        } catch (err) {
            console.error("Error al reproducir:", err);
            setError("Error al iniciar la reproducción");
        }
    };

    const handlePause = () => {
        if (!synth.current) return;

        try {
            if (synth.current.speaking) {
                synth.current.pause();
                setIsPaused(true);

                if (progressInterval.current) {
                    clearInterval(progressInterval.current);
                }
            }
        } catch (err) {
            console.error("Error al pausar:", err);
            setError("Error al pausar la reproducción");
        }
    };

    const handleResume = () => {
        if (!synth.current) return;

        try {
            if (synth.current.speaking && isPaused) {
                synth.current.resume();
                setIsPaused(false);

                // Reiniciar intervalo de progreso
                if (progressInterval.current) {
                    clearInterval(progressInterval.current);
                }

                progressInterval.current = setInterval(() => {
                    const elapsedTime = Date.now() - startTime.current;
                    const calculatedProgress = Math.min(100, (elapsedTime / estimatedDuration.current) * 100);
                    setProgress(calculatedProgress);
                }, 100);
            }
        } catch (err) {
            console.error("Error al reanudar:", err);
            setError("Error al reanudar la reproducción");
        }
    };

    const handleStop = () => {
        if (!synth.current) return;

        try {
            synth.current.cancel();
            setIsPlaying(false);
            setIsPaused(false);
            setProgress(0);

            if (progressInterval.current) {
                clearInterval(progressInterval.current);
                progressInterval.current = null;
            }
        } catch (err) {
            console.error("Error al detener:", err);
            setError("Error al detener la reproducción");
        }
    };

    const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedVoice(e.target.value);
    };

    const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRate(parseFloat(e.target.value));
    };

    // Estado para mostrar/ocultar configuración
    const [showSettings, setShowSettings] = useState(false);

    // Renderizado condicional basado en estado
    const renderControls = () => {
        if (error) {
            return (
                <div className="bg-red-50 p-3 rounded-xl border border-red-200 text-red-700 text-sm mb-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                </div>
            );
        }

        return (
            <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center space-x-2">
                        {!isPlaying ? (
                            <button
                                onClick={handlePlay}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                                disabled={!utterance || isLoading}
                                title="Reproducir"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-0.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                            </button>
                        ) : isPaused ? (
                            <button
                                onClick={handleResume}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                                title="Reanudar"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-0.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                            </button>
                        ) : (
                            <button
                                onClick={handlePause}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                                title="Pausar"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </button>
                        )}

                        {isPlaying && (
                            <button
                                onClick={handleStop}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-1"
                                title="Detener"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                                </svg>
                            </button>
                        )}
                    </div>

                    <div className="flex-grow mx-4">
                        {/* Indicador visual de progreso */}
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-300 ${isPlaying ? 'bg-indigo-500' : 'bg-slate-300'}`}
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`p-2 rounded-lg transition-colors ${showSettings ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                        title="Configuración de voz"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                {showSettings && (
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm animate-fadeIn">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="voice" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    Voz
                                </label>
                                <select
                                    id="voice"
                                    className="form-select w-full rounded-lg border-slate-200 text-sm"
                                    value={selectedVoice}
                                    onChange={handleVoiceChange}
                                    disabled={isPlaying || isLoading}
                                >
                                    {voices.length === 0 && (
                                        <option value="">No hay voces disponibles</option>
                                    )}
                                    {voices.map(voice => (
                                        <option key={voice.name} value={voice.name}>
                                            {voice.name} ({voice.lang})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="rate" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    Velocidad: {rate}x
                                </label>
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs text-slate-400">0.5x</span>
                                    <input
                                        id="rate"
                                        type="range"
                                        min="0.5"
                                        max="2"
                                        step="0.1"
                                        value={rate}
                                        onChange={handleRateChange}
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                        disabled={isPlaying || isLoading}
                                    />
                                    <span className="text-xs text-slate-400">2x</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Mostrar estado de carga
    if (isLoading) {
        return (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-4">
                <div className="flex items-center justify-center py-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                    <span className="ml-3 text-sm font-medium text-slate-600">Cargando motor de voz...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-4">
            <div className="flex justify-between items-center mb-3 px-1">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                    </svg>
                    Escuchar texto
                </h3>
                <div className="text-xs font-medium">
                    {isPlaying && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md ${isPaused ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                            {isPaused ? "En pausa" : "Reproduciendo"}
                        </span>
                    )}
                </div>
            </div>

            {renderControls()}
        </div>
    );
});

export default TextToSpeech;