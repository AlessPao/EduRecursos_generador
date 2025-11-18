import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../config';
import ResourceItem from '../components/ResourceItem';
import DeleteConfirmation from '../components/DeleteConfirmation';
import { Search, Plus } from 'lucide-react';
import jsPDF from 'jspdf';

const RecursosList: React.FC = () => {
  const navigate = useNavigate();
  const [recursos, setRecursos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [deleteModal, setDeleteModal] = useState({ open: false, id: 0, title: '' });
  
  // Cargar recursos
  const fetchRecursos = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/recursos`);
      if (res.data.success) {
        setRecursos(res.data.recursos);
      }
    } catch (error) {
      console.error('Error al cargar recursos:', error);
      toast.error('No se pudieron cargar los recursos');
    } finally {
      setLoading(false);
    }
  };
  
  // Cargar recursos al montar el componente
  useEffect(() => {
    fetchRecursos();
  }, []);
  
  // Filtrar recursos
  const filteredRecursos = recursos.filter(recurso => {
    // Filtrar por término de búsqueda
    const matchesTerm = recurso.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtrar por tipo
    const matchesTipo = tipoFiltro ? recurso.tipo === tipoFiltro : true;
    
    return matchesTerm && matchesTipo;
  });
  
  // Abrir modal de confirmación para eliminar
  const confirmDelete = (id: number, title: string) => {
    setDeleteModal({ open: true, id, title });
  };
  
  // Eliminar recurso
  const handleDelete = async () => {
    try {
      const res = await axios.delete(`${API_URL}/recursos/${deleteModal.id}`);
      if (res.data.success) {
        setRecursos(recursos.filter(r => r.id !== deleteModal.id));
        toast.success('Recurso eliminado correctamente');
      }
    } catch (error) {
      console.error('Error al eliminar recurso:', error);
      toast.error('No se pudo eliminar el recurso');
    } finally {
      setDeleteModal({ open: false, id: 0, title: '' });
    }
  };
  
  // Descargar recurso como PDF (generado en el frontend)
  const handleDownload = (id: number) => {
    try {
      const recurso = recursos.find(r => r.id === id);
      if (!recurso) {
        toast.error('Recurso no encontrado');
        return;
      }

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let yPos = margin;

      // Colores profesionales (sutiles)
      const colorPrincipal = [37, 99, 235]; // Azul
      const colorTexto = [30, 30, 30]; // Gris muy oscuro (casi negro pero más suave)
      const colorSecundario = [100, 116, 139]; // Gris medio

      // Configuración de colores por tipo
      const tiposColores: Record<string, number[]> = {
        comprension: [59, 130, 246],
        escritura: [16, 185, 129],
        gramatica: [249, 115, 22],
        oral: [139, 92, 246],
        drag_and_drop: [236, 72, 153],
        ice_breakers: [14, 165, 233]
      };

      const colorTipo = tiposColores[recurso.tipo] || colorPrincipal;

      // Función para agregar nueva página si es necesario
      const checkNewPage = (espacioNecesario: number) => {
        if (yPos + espacioNecesario > pageHeight - margin) {
          doc.addPage();
          yPos = margin;
          return true;
        }
        return false;
      };

      // ENCABEZADO con barra de color
      doc.setFillColor(colorTipo[0], colorTipo[1], colorTipo[2]);
      doc.rect(0, 0, pageWidth, 25, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(recurso.titulo, margin, 15);

      // Tipo de recurso
      const tipoNombre = recurso.tipo.charAt(0).toUpperCase() + recurso.tipo.slice(1).replace('_', ' ');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(tipoNombre, margin, 21);

      yPos = 35;

      // Contenido
      doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2]);
      const contenido = recurso.contenido;

      // COMPRENSIÓN LECTORA
      if (recurso.tipo === 'comprension' && contenido.texto) {
        // Caja de texto
        doc.setFillColor(248, 250, 252);
        const textLines = doc.splitTextToSize(contenido.texto, pageWidth - 2 * margin - 10);
        const boxHeight = textLines.length * 6 + 20;
        
        checkNewPage(boxHeight + 10);
        doc.roundedRect(margin, yPos, pageWidth - 2 * margin, boxHeight, 3, 3, 'F');
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(colorTipo[0], colorTipo[1], colorTipo[2]);
        doc.text('Texto de Lectura', margin + 5, yPos + 10);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2]);
        doc.text(textLines, margin + 5, yPos + 18);
        
        yPos += boxHeight + 15;

        // Preguntas
        if (contenido.preguntas && Array.isArray(contenido.preguntas)) {
          checkNewPage(30);
          
          doc.setFontSize(13);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(colorTipo[0], colorTipo[1], colorTipo[2]);
          doc.text('Preguntas de Comprension', margin, yPos);
          yPos += 10;

          contenido.preguntas.forEach((pregunta: any, index: number) => {
            checkNewPage(50);

            // Número con círculo
            doc.setFillColor(colorTipo[0], colorTipo[1], colorTipo[2]);
            doc.circle(margin + 4, yPos, 4, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text(`${index + 1}`, margin + 4, yPos + 2, { align: 'center' });
            
            // Pregunta
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2]);
            const preguntaLines = doc.splitTextToSize(pregunta.pregunta, pageWidth - 2 * margin - 15);
            doc.text(preguntaLines, margin + 12, yPos + 2);
            yPos += preguntaLines.length * 6 + 4;

            // Opciones
            if (pregunta.opciones && Array.isArray(pregunta.opciones)) {
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(10);
              
              pregunta.opciones.forEach((opcion: string, idx: number) => {
                const letra = String.fromCharCode(65 + idx);
                const esCorrecta = pregunta.respuesta === letra;
                
                checkNewPage(15);
                
                const opcionLines = doc.splitTextToSize(opcion, pageWidth - 2 * margin - 30);
                
                // Fondo verde suave para respuesta correcta
                if (esCorrecta) {
                  doc.setFillColor(220, 252, 231);
                  doc.roundedRect(margin + 12, yPos - 3, pageWidth - 2 * margin - 12, opcionLines.length * 5 + 4, 2, 2, 'F');
                }
                
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(esCorrecta ? 5 : 80, esCorrecta ? 150 : 80, esCorrecta ? 105 : 80);
                doc.text(`${letra})`, margin + 15, yPos + 1);
                
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(esCorrecta ? 5 : 60, esCorrecta ? 150 : 60, esCorrecta ? 105 : 60);
                doc.text(opcionLines, margin + 24, yPos + 1);
                
                yPos += opcionLines.length * 5 + 2;
              });
            }

            // Indicador de respuesta correcta
            if (pregunta.respuesta) {
              yPos += 2;
              doc.setFontSize(9);
              doc.setFont('helvetica', 'bold');
              doc.setTextColor(5, 150, 105);
              doc.text(`Respuesta correcta: ${pregunta.respuesta}`, margin + 15, yPos);
              yPos += 3;
            }

            yPos += 8;
          });
        }
      }

      // GRAMÁTICA Y ESCRITURA
      if ((recurso.tipo === 'gramatica' || recurso.tipo === 'escritura') && contenido.ejercicios) {
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(colorTipo[0], colorTipo[1], colorTipo[2]);
        doc.text('Ejercicios', margin, yPos);
        yPos += 10;

        contenido.ejercicios.forEach((ejercicio: any, index: number) => {
          checkNewPage(40);

          // Número
          doc.setFillColor(colorTipo[0], colorTipo[1], colorTipo[2]);
          doc.circle(margin + 4, yPos, 4, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.text(`${index + 1}`, margin + 4, yPos + 2, { align: 'center' });

          // Ejercicio
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2]);
          const ejercicioTexto = ejercicio.oracion || ejercicio.tema || ejercicio.consigna;
          const ejercicioLines = doc.splitTextToSize(ejercicioTexto, pageWidth - 2 * margin - 15);
          doc.text(ejercicioLines, margin + 12, yPos + 2);
          yPos += ejercicioLines.length * 5 + 3;

          // Respuesta
          if (ejercicio.respuesta) {
            const respuestaLines = doc.splitTextToSize(ejercicio.respuesta, pageWidth - 2 * margin - 20);
            
            doc.setFillColor(220, 252, 231);
            doc.roundedRect(margin + 12, yPos, pageWidth - 2 * margin - 12, respuestaLines.length * 5 + 8, 2, 2, 'F');
            
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.setTextColor(5, 150, 105);
            doc.text('Respuesta:', margin + 15, yPos + 4);
            
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.text(respuestaLines, margin + 15, yPos + 9);
            yPos += respuestaLines.length * 5 + 10;
          }

          yPos += 5;
        });
      }

      // COMUNICACIÓN ORAL
      if (recurso.tipo === 'oral' && contenido.temas) {
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(colorTipo[0], colorTipo[1], colorTipo[2]);
        doc.text('Temas de Conversacion', margin, yPos);
        yPos += 10;

        contenido.temas.forEach((tema: any, index: number) => {
          const temaTexto = tema.tema || tema;
          const temaLines = doc.splitTextToSize(temaTexto, pageWidth - 2 * margin - 20);
          let boxHeight = temaLines.length * 6 + 15;
          
          if (tema.pautas) {
            const pautasLines = doc.splitTextToSize(tema.pautas, pageWidth - 2 * margin - 25);
            boxHeight += pautasLines.length * 5 + 8;
          }

          checkNewPage(boxHeight + 10);

          // Caja del tema
          doc.setFillColor(248, 250, 252);
          doc.setDrawColor(colorTipo[0], colorTipo[1], colorTipo[2]);
          doc.setLineWidth(0.5);
          doc.roundedRect(margin, yPos, pageWidth - 2 * margin, boxHeight, 3, 3, 'FD');

          // Número
          doc.setFillColor(colorTipo[0], colorTipo[1], colorTipo[2]);
          doc.circle(margin + 8, yPos + 8, 4, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.text(`${index + 1}`, margin + 8, yPos + 10, { align: 'center' });

          // Tema
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2]);
          doc.text(temaLines, margin + 16, yPos + 10);

          // Pautas
          if (tema.pautas) {
            const innerY = yPos + 10 + temaLines.length * 6 + 3;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(colorSecundario[0], colorSecundario[1], colorSecundario[2]);
            const pautasLines = doc.splitTextToSize(tema.pautas, pageWidth - 2 * margin - 25);
            doc.text(pautasLines, margin + 10, innerY);
          }

          yPos += boxHeight + 8;
        });
      }

      // PIE DE PÁGINA
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `EduRecursos - ${new Date().toLocaleDateString('es-ES')}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );

      // Guardar
      const fileName = `${recurso.titulo.replace(/[^a-z0-9]/gi, '_')}.pdf`;
      doc.save(fileName);
      
      toast.success('PDF descargado correctamente');
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      toast.error('No se pudo generar el PDF');
    }
  };
  
  // Navegar a la vista del recurso
  const handleViewResource = (id: number) => {
    navigate(`/recursos/${id}`);
  };
  
  // Ir al dashboard para crear un nuevo recurso
  const handleNewResource = () => {
    navigate('/dashboard');
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="pt-20 pb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Mis Recursos</h1>
          <p className="text-gray-600">
            {filteredRecursos.length} recursos disponibles
          </p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <button
            onClick={handleNewResource}
            className="btn btn-primary"
          >
            <Plus size={16} className="mr-2" />
            Nuevo recurso
          </button>
        </div>
      </div>
      
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="form-input pl-10"
                placeholder="Buscar recursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="md:w-64">
            <select
              className="form-select"
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value)}
            >
              <option value="">Todos los tipos</option>
              <option value="comprension">Comprensión lectora</option>
              <option value="escritura">Producción escrita</option>
              <option value="gramatica">Gramática y ortografía</option>
              <option value="oral">Comunicación oral</option>
              <option value="drag_and_drop">Juegos interactivos</option>
              <option value="ice_breakers">Ice Breakers</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Lista de recursos */}
      {filteredRecursos.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {filteredRecursos.map((recurso) => (
            <ResourceItem
              key={recurso.id}
              id={recurso.id}
              tipo={recurso.tipo}
              titulo={recurso.titulo}
              createdAt={recurso.createdAt}
              onViewResource={handleViewResource}
              onDelete={(id) => confirmDelete(id, recurso.titulo)}
              onDownload={handleDownload}
            />
          ))}
        </motion.div>
      ) : (
        <div className="bg-gray-50 rounded-lg border p-8 text-center">
          <p className="text-gray-600 mb-4">No se encontraron recursos</p>
          {tipoFiltro || searchTerm ? (
            <button
              onClick={() => {
                setTipoFiltro('');
                setSearchTerm('');
              }}
              className="btn btn-secondary"
            >
              Limpiar filtros
            </button>
          ) : (
            <button
              onClick={handleNewResource}
              className="btn btn-primary"
            >
              Crear mi primer recurso
            </button>
          )}
        </div>
      )}
      
      {/* Modal de confirmación para eliminar */}
      <DeleteConfirmation
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ ...deleteModal, open: false })}
        onConfirm={handleDelete}
        title={deleteModal.title}
      />
    </div>
  );
};

export default RecursosList;