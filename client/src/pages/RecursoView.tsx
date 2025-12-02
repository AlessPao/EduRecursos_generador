import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../config';
import TextToSpeech from '../components/TextToSpeech';
import { ArrowLeft, Edit, Download, Headphones, PauseCircle } from 'lucide-react';

const RecursoView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [recurso, setRecurso] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showTextToSpeech, setShowTextToSpeech] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    // Usar estas referencias para comunicarse con el componente TextToSpeech
    const textToSpeechRef = useRef<{
        play: () => void;
        pause: () => void;
        resume: () => void;
        stop: () => void;
    } | null>(null);

    useEffect(() => {
        const fetchRecurso = async () => {
            if (!id) return;

            try {
                setLoading(true);
                const res = await axios.get(`${API_URL}/recursos/${id}`);
                if (res.data.success) {
                    setRecurso(res.data.recurso);
                } else {
                    toast.error('Recurso no encontrado');
                    navigate('/recursos');
                }
            } catch (error) {
                console.error('Error al cargar el recurso:', error);
                toast.error('Error al cargar el recurso');
                navigate('/recursos');
            } finally {
                setLoading(false);
            }
        };

        fetchRecurso();
    }, [id, navigate]);

    const handleDownload = async () => {
        if (!id) return;

        try {
            const response = await axios.get(`${API_URL}/recursos/${id}/pdf`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${recurso.titulo}.pdf`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success('Descarga iniciada');
        } catch (error) {
            console.error('Error al descargar el PDF:', error);
            toast.error('No se pudo descargar el PDF');
        }
    };

    // Manejar reproducción de texto desde el botón principal
    const handleTogglePlayback = () => {
        if (!showTextToSpeech) {
            // Si el componente no está visible, mostrarlo primero
            setShowTextToSpeech(true);
            // Utilizar un pequeño timeout para asegurar que el componente se ha montado
            setTimeout(() => {
                if (textToSpeechRef.current) {
                    textToSpeechRef.current.play();
                }
            }, 100);
        } else {
            // Si el componente es visible, controlar reproducción/pausa
            if (isPlaying) {
                if (isPaused) {
                    textToSpeechRef.current?.resume();
                } else {
                    textToSpeechRef.current?.pause();
                }
            } else {
                textToSpeechRef.current?.play();
            }
        }
    };

    // Callback desde el componente TextToSpeech para actualizar el estado
    const handleSpeechStateChange = (playing: boolean, paused: boolean) => {
        setIsPlaying(playing);
        setIsPaused(paused);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!recurso) return null;

    return (
        <div className="pt-24 pb-12 px-4 max-w-5xl mx-auto">
            {/* Header Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="group flex items-center text-slate-500 hover:text-indigo-600 transition-colors"
                >
                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center mr-2 group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-all">
                        <ArrowLeft size={16} />
                    </div>
                    <span className="font-medium">Volver</span>
                </button>

                <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl shadow-sm border border-slate-100">
                    <button
                        onClick={() => navigate(`/recursos/${id}/editar`)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all text-sm font-medium"
                        title="Editar recurso"
                    >
                        <Edit size={18} />
                        <span className="hidden sm:inline">Editar</span>
                    </button>

                    <div className="w-px h-6 bg-slate-200"></div>

                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all text-sm font-medium"
                        title="Descargar PDF"
                    >
                        <Download size={18} />
                        <span className="hidden sm:inline">Descargar</span>
                    </button>

                    <button
                        onClick={handleTogglePlayback}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${isPlaying
                                ? (isPaused ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600')
                                : showTextToSpeech ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                            }`}
                        title={isPlaying ? (isPaused ? 'Reanudar reproducción' : 'Pausar reproducción') : 'Escuchar texto'}
                    >
                        {isPlaying ? (
                            isPaused ? <Headphones size={18} /> : <PauseCircle size={18} />
                        ) : (
                            <Headphones size={18} />
                        )}
                        <span className="hidden sm:inline">
                            {isPlaying ? (isPaused ? 'Reanudar' : 'Pausar') : 'Escuchar'}
                        </span>
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
                {/* Resource Header */}
                <div className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 p-8">
                    <div className="flex flex-wrap gap-3 mb-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 uppercase tracking-wide">
                            {(() => {
                                switch (recurso.tipo) {
                                    case 'comprension': return 'Comprensión lectora';
                                    case 'escritura': return 'Producción escrita';
                                    case 'gramatica': return 'Gramática y ortografía';
                                    case 'oral': return 'Comunicación oral';
                                    default: return 'Recurso';
                                }
                            })()}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                            📅 {new Date(recurso.createdAt).toLocaleDateString()}
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white leading-tight">{recurso.titulo}</h1>
                </div>

                {/* Content */}
                <div className="p-8 md:p-12">
                    <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
                        <p className="whitespace-pre-wrap leading-relaxed text-slate-600 dark:text-slate-300">
                            {typeof recurso.contenido === 'object' ? recurso.contenido.texto : recurso.contenido}
                        </p>
                    </div>

                    {/* Indicador de reproducción cuando el panel de TextToSpeech está oculto */}
                    {isPlaying && !showTextToSpeech && (
                        <div className="mt-8 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-bottom-4">
                            <div className="flex items-center">
                                <div className="relative mr-4">
                                    <span className="absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75 animate-ping"></span>
                                    <div className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></div>
                                </div>
                                <div>
                                    <p className="font-bold text-indigo-900">Reproduciendo texto</p>
                                    <p className="text-sm text-indigo-700">{isPaused ? 'En pausa' : 'Escuchando...'}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowTextToSpeech(true)}
                                className="px-4 py-2 bg-white text-indigo-600 text-sm font-bold rounded-lg shadow-sm hover:bg-indigo-50 transition-colors"
                            >
                                Mostrar controles
                            </button>
                        </div>
                    )}

                    {showTextToSpeech && recurso.contenido && (
                        <div className="mt-8 border-t border-slate-100 pt-8">
                            <TextToSpeech
                                text={typeof recurso.contenido === 'object' ? recurso.contenido.texto : recurso.contenido}
                                ref={textToSpeechRef}
                                onStateChange={handleSpeechStateChange}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecursoView;