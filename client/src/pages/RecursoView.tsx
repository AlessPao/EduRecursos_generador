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
        <div className="pt-20 pb-6 px-4 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <button 
                    onClick={() => navigate(-1)} 
                    className="btn btn-secondary flex items-center gap-2"
                >
                    <ArrowLeft size={18} />
                    Volver
                </button>
                
                <div className="flex gap-2">
                    <button 
                        onClick={() => navigate(`/recursos/${id}/editar`)} 
                        className="btn btn-secondary flex items-center gap-2"
                        title="Editar recurso"
                    >
                        <Edit size={18} />
                        <span className="hidden md:inline">Editar</span>
                    </button>
                    
                    <button 
                        onClick={handleDownload} 
                        className="btn btn-secondary flex items-center gap-2"
                        title="Descargar PDF"
                    >
                        <Download size={18} />
                        <span className="hidden md:inline">Descargar</span>
                    </button>
                    
                    <button 
                        onClick={handleTogglePlayback} 
                        className={`btn ${isPlaying ? (isPaused ? 'btn-warning' : 'btn-primary') : showTextToSpeech ? 'btn-primary' : 'btn-secondary'} flex items-center gap-2`}
                        title={isPlaying ? (isPaused ? 'Reanudar reproducción' : 'Pausar reproducción') : 'Escuchar texto'}
                    >
                        {isPlaying ? (
                            isPaused ? <Headphones size={18} /> : <PauseCircle size={18} />
                        ) : (
                            <Headphones size={18} />
                        )}
                        <span className="hidden md:inline">
                            {isPlaying ? (isPaused ? 'Reanudar' : 'Pausar') : 'Escuchar'}
                        </span>
                    </button>
                </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="mb-4">
                    <div className="text-sm text-gray-500 mb-1">
                        {(() => {
                            switch(recurso.tipo) {
                                case 'comprension': return 'Comprensión lectora';
                                case 'escritura': return 'Producción escrita';
                                case 'gramatica': return 'Gramática y ortografía';
                                case 'oral': return 'Comunicación oral';
                                default: return 'Recurso';
                            }
                        })()}
                    </div>
                    <h1 className="text-2xl font-bold">{recurso.titulo}</h1>
                    <div className="text-sm text-gray-500 mt-1">
                        Creado: {new Date(recurso.createdAt).toLocaleDateString()}
                    </div>
                </div>
                
                <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{typeof recurso.contenido === 'object' ? recurso.contenido.texto : recurso.contenido}</p>
                </div>
                
                {/* Indicador de reproducción cuando el panel de TextToSpeech está oculto */}
                {isPlaying && !showTextToSpeech && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="animate-pulse mr-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414-1.414m0 0l-2.828-2.828m2.828 2.828l-4.243 4.243m0 0L3 19.757m0 0l-1.414 1.414M3 16.757l-1.414 1.414m9.9-2.828a5 5 0 010-7.072m0 0l2.828 2.828m-2.828-2.828L9.172 6.343m0 0l-1.414-1.414M12.728 3l1.414-1.414m0 0L12.728 0m1.414 1.414L19.757 7.7" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-medium">Reproduciendo texto</p>
                                <p className="text-sm text-blue-700">{isPaused ? 'En pausa' : 'Escuchando...'}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowTextToSpeech(true)}
                            className="btn btn-sm btn-secondary"
                        >
                            Mostrar controles
                        </button>
                    </div>
                )}
                
                {showTextToSpeech && recurso.contenido && (
    <TextToSpeech 
        text={typeof recurso.contenido === 'object' ? recurso.contenido.texto : recurso.contenido} 
        ref={textToSpeechRef}
        onStateChange={handleSpeechStateChange}
    />
)}
            </div>
        </div>
    );
};

export default RecursoView;