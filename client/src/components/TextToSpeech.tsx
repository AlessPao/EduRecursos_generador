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

    // Renderizado condicional basado en estado
    const renderControls = () => {
        if (error) {
            return (
                <div className="bg-red-50 p-3 rounded-md border border-red-200 text-red-700 text-sm mb-3">
                    <p className="font-medium">Error</p>
                    <p>{error}</p>
                </div>
            );
        }

        return (
            <>
                <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="voice" className="block text-sm font-medium text-gray-700 mb-1">
                            Voz
                        </label>
                        <select 
                            id="voice"
                            className="form-select w-full rounded-md border-gray-300" 
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
                        <label htmlFor="rate" className="block text-sm font-medium text-gray-700 mb-1">
                            Velocidad: {rate}x
                        </label>
                        <input 
                            id="rate"
                            type="range" 
                            min="0.5" 
                            max="2" 
                            step="0.1" 
                            value={rate} 
                            onChange={handleRateChange}
                            className="w-full"
                            disabled={isPlaying || isLoading}
                        />
                    </div>
                </div>
                
                <div className="flex gap-2">
                    {!isPlaying ? (
                        <button 
                            onClick={handlePlay}
                            className="btn btn-primary flex items-center gap-2"
                            disabled={!utterance || isLoading}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                            Reproducir
                        </button>
                    ) : isPaused ? (
                        <button 
                            onClick={handleResume}
                            className="btn btn-primary flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                            Reanudar
                        </button>
                    ) : (
                        <button 
                            onClick={handlePause}
                            className="btn btn-secondary flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Pausar
                        </button>
                    )}
                    
                    {isPlaying && (
                        <button 
                            onClick={handleStop}
                            className="btn btn-danger flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                            </svg>
                            Detener
                        </button>
                    )}
                </div>
            </>
        );
    };

    // Mostrar estado de carga
    if (isLoading) {
        return (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
                <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Cargando voces disponibles...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium">Escuchar texto</h3>
                <div className="text-sm">
                    {isPlaying && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full ${isPaused ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                            {isPaused ? "En pausa" : "Reproduciendo"}
                        </span>
                    )}
                </div>
            </div>
            
            {renderControls()}
            
            {/* Indicador visual de progreso */}
            {isPlaying && (
                <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            )}
        </div>
    );
});

export default TextToSpeech;