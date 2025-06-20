import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../config';

const EvaluationForm: React.FC = () => {
  const navigate = useNavigate();
  const [titulo, setTitulo] = useState('');
  const [tema, setTema] = useState('');
  const [longitud, setLongitud] = useState('100');
  const [numLiteral, setNumLiteral] = useState(5);
  const [loading, setLoading] = useState(false);  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación adicional
    if (numLiteral < 1 || numLiteral > 10) {
      toast.error('El número de preguntas debe estar entre 1 y 10');
      return;
    }
    
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/exams`, { 
        titulo, 
        tipoTexto: 'narrativo', 
        tema, 
        longitud, 
        numLiteral 
      });
      if (res.data.success) {
        toast.success('Examen creado');
        // Redirigir a detalle para mostrar link y contenido
        const slug = res.data.data.slug;
        navigate(`/evaluaciones/${slug}/detalle`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al crear examen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-20 p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Crear Examen</h1>      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block">Título</label>
          <input value={titulo} onChange={e => setTitulo(e.target.value)} className="form-input w-full" required />
        </div>
        <div>
          <label className="block">Tema</label>
          <input value={tema} onChange={e => setTema(e.target.value)} className="form-input w-full" required />
        </div>
        <div>
          <label className="block">Longitud (palabras)</label>
          <select value={longitud} onChange={e => setLongitud(e.target.value)} className="form-select w-full">
            <option value="100">100 palabras</option>
            <option value="200">200 palabras</option>
            <option value="300">300 palabras</option>
          </select>
        </div>        <div>
          <label className="block">Número de preguntas literales</label>
          <input 
            type="number" 
            value={numLiteral} 
            onChange={e => setNumLiteral(parseInt(e.target.value))} 
            className="form-input w-full" 
            required 
            min={1} 
            max={10}
          />
          <p className="text-sm text-gray-500 mt-1">Máximo 10 preguntas</p>
        </div>
        <button
          type="submit"
          className="btn btn-primary flex items-center justify-center"
          disabled={loading}
        >
          {loading && <span className="animate-spin h-5 w-5 mr-2 border-2 border-white rounded-full border-t-transparent"></span>}
          {loading ? 'Generando...' : 'Generar examen'}
        </button>
      </form>
    </div>
  );
};

export default EvaluationForm;
