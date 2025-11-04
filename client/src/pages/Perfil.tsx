import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API_URL } from '../config';
import { formatDate } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, BarChart3, Download, FileText, FileSpreadsheet, Edit2, Trash2, X, Save, AlertTriangle } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useToast, ToastContainer } from '../components/Toast';

const Perfil: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toasts, addToast, removeToast, success, error, warning, info } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  
  // Estados para edición de perfil
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    nombre: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  
  // Estados para eliminar cuenta
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFinalConfirmation, setShowFinalConfirmation] = useState(false);
  const [deleteForm, setDeleteForm] = useState({
    password: '',
    confirmationText: ''
  });
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const [stats, setStats] = useState({
    total: 0,
    comprension: 0,
    escritura: 0,
    gramatica: 0,
    oral: 0,
    juegosInteractivos: 0,
    iceBreakers: 0
  });
  
  // Cargar datos del perfil y estadísticas
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        
        // Cargar perfil
        const profileRes = await axios.get(`${API_URL}/auth/profile`);
        if (profileRes.data.success) {
          setProfile(profileRes.data.usuario);
          // Inicializar formulario de edición
          setEditForm({
            nombre: profileRes.data.usuario.nombre,
            email: profileRes.data.usuario.email,
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
        }
        
        // Cargar recursos para estadísticas
        const recursosRes = await axios.get(`${API_URL}/recursos`);
        if (recursosRes.data.success) {
          const recursos = recursosRes.data.recursos;
          
          // Calcular estadísticas
          setStats({
            total: recursos.length,
            comprension: recursos.filter((r: any) => r.tipo === 'comprension').length,
            escritura: recursos.filter((r: any) => r.tipo === 'escritura').length,
            gramatica: recursos.filter((r: any) => r.tipo === 'gramatica').length,
            oral: recursos.filter((r: any) => r.tipo === 'oral').length,
            juegosInteractivos: recursos.filter((r: any) => r.tipo === 'drag_and_drop').length,
            iceBreakers: recursos.filter((r: any) => r.tipo === 'ice_breakers').length
          });
        }
      } catch (error) {
        console.error('Error al cargar datos del perfil:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, []);

  // Función para actualizar el perfil
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (editForm.newPassword && editForm.newPassword !== editForm.confirmPassword) {
      error('Las contraseñas no coinciden');
      return;
    }
    
    if (editForm.newPassword && editForm.newPassword.length < 6) {
      error('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    try {
      setEditLoading(true);
      
      const dataToUpdate: any = {};
      
      // Solo incluir campos que cambiaron
      if (editForm.nombre !== profile.nombre) {
        dataToUpdate.nombre = editForm.nombre;
      }
      
      if (editForm.email !== profile.email) {
        dataToUpdate.email = editForm.email;
      }
      
      if (editForm.newPassword) {
        dataToUpdate.currentPassword = editForm.currentPassword;
        dataToUpdate.newPassword = editForm.newPassword;
      }
      
      // Si no hay cambios
      if (Object.keys(dataToUpdate).length === 0) {
        info('No hay cambios para guardar');
        setIsEditing(false);
        return;
      }
      
      const response = await axios.put(`${API_URL}/auth/profile`, dataToUpdate);
      
      if (response.data.success) {
        setProfile(response.data.usuario);
        setEditForm({
          nombre: response.data.usuario.nombre,
          email: response.data.usuario.email,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setIsEditing(false);
        success('Perfil actualizado correctamente', '¡Éxito!');
      }
    } catch (err: any) {
      console.error('Error al actualizar perfil:', err);
      const errorMsg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Error al actualizar el perfil';
      error(errorMsg, 'Error');
    } finally {
      setEditLoading(false);
    }
  };

  // Función para cancelar la edición
  const handleCancelEdit = () => {
    setEditForm({
      nombre: profile.nombre,
      email: profile.email,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setIsEditing(false);
  };

  // Función para eliminar cuenta
  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (deleteForm.confirmationText !== 'ELIMINAR MI CUENTA') {
      error('Debe escribir exactamente "ELIMINAR MI CUENTA" para confirmar');
      return;
    }
    
    if (!deleteForm.password) {
      error('Debe ingresar su contraseña');
      return;
    }
    
    // Mostrar confirmación final personalizada
    setShowFinalConfirmation(true);
  };

  // Función para ejecutar la eliminación final
  const confirmFinalDeletion = async () => {
    try {
      setDeleteLoading(true);
      
      const response = await axios.delete(`${API_URL}/auth/account`, {
        data: {
          password: deleteForm.password,
          confirmationText: deleteForm.confirmationText
        }
      });
      
      if (response.data.success) {
        // Cerrar modales
        setShowFinalConfirmation(false);
        setShowDeleteModal(false);
        
        // Mostrar mensaje de éxito
        success(
          'Todos tus datos han sido borrados permanentemente. Serás redirigido a la página de inicio.',
          'Cuenta eliminada correctamente'
        );
        
        // Esperar un momento antes de redirigir
        setTimeout(() => {
          logout();
          navigate('/');
        }, 2000);
      }
    } catch (err: any) {
      console.error('Error al eliminar cuenta:', err);
      const errorMsg = err.response?.data?.message || 'Error al eliminar la cuenta';
      error(errorMsg, 'Error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Función para realizar análisis semántico
  const handleSemanticAnalysis = async () => {
    try {
      setAnalysisLoading(true);
      setShowAnalysis(true);
      
      // Usar el endpoint batch con filtro de usuario que devuelve estructura completa
      const response = await axios.get(`${API_URL}/semantics/batch?usuarioId=${user?.id}&limit=100`);
      
      if (response.data.success) {
        setAnalysisData(response.data.data);
      } else {
        throw new Error('Error en el análisis');
      }
    } catch (err) {
      console.error('Error al realizar análisis semántico:', err);
      error('Error al realizar el análisis. Por favor, intenta de nuevo.', 'Error');
      setShowAnalysis(false);
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Función para descargar reporte en PDF
  const downloadReportPDF = () => {
    if (!analysisData) return;
    
    try {
      const doc = new jsPDF();
      
      // Configuración de colores
      const primaryColor: [number, number, number] = [41, 128, 185]; // Azul
      const secondaryColor: [number, number, number] = [52, 73, 94]; // Gris oscuro
      const accentColor: [number, number, number] = [231, 76, 60]; // Rojo para alertas
      
      // Header con logo/título
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 25, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('REPORTE DE CALIDAD LINGÜÍSTICA', 105, 17, { align: 'center' });
      
      // Información del usuario
      doc.setTextColor(...secondaryColor);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('INFORMACIÓN DEL USUARIO', 20, 40);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(`Nombre: ${profile?.nombre || 'N/A'}`, 20, 50);
      doc.text(`Fecha de reporte: ${new Date().toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, 20, 58);
      doc.text(`Total de recursos analizados: ${analysisData.summary.totalResources}`, 20, 66);
      
      // Línea separadora
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.5);
      doc.line(20, 75, 190, 75);
      
      // Resumen General
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('RESUMEN GENERAL', 20, 88);
      
      // Caja de resumen con fondo
      doc.setFillColor(245, 247, 250);
      doc.rect(20, 95, 170, 45, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.rect(20, 95, 170, 45, 'S');
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(...secondaryColor);
      
      // Columna izquierda
      doc.text('Corrección Gramatical:', 25, 107);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      doc.text(`${analysisData.summary.averageGrammaticalCorrectness}%`, 90, 107);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...secondaryColor);
      doc.text('Riqueza Léxica (TTR):', 25, 117);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      doc.text(`${analysisData.summary.averageLexicalRichness}`, 90, 117);
      
      // Columna derecha
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...secondaryColor);
      doc.text('TTR Global:', 110, 107);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      doc.text(`${analysisData.aggregatedMetrics.globalTTR}`, 145, 107);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...secondaryColor);
      doc.text('Calidad General:', 110, 117);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      doc.text(`${analysisData.summary.overallQuality}`, 145, 117);
      
      // Explicación de TTR
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text('TTR Promedio: Media de TTR individuales | TTR Global: TTR calculado sobre todo el corpus', 25, 130);
      
      // Métricas Detalladas
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...secondaryColor);
      doc.text('MÉTRICAS DETALLADAS', 20, 155);
      
      // Tabla de métricas
      const tableData = [
        ['Métrica', 'Valor', 'Descripción'],
        ['Textos analizados', analysisData.aggregatedMetrics.totalTexts.toString(), 'Fragmentos de texto procesados'],
        ['Oraciones totales', analysisData.aggregatedMetrics.totalSentences.toString(), 'Total de oraciones encontradas'],
        ['Oraciones correctas', analysisData.aggregatedMetrics.totalCorrectSentences.toString(), 'Oraciones gramaticalmente correctas'],
        ['Palabras totales', analysisData.aggregatedMetrics.totalTokens.toString(), 'Total de palabras (tokens)'],
        ['Palabras únicas', analysisData.aggregatedMetrics.totalUniqueTypes.toString(), 'Vocabulario único utilizado'],
        ['Corrección global', `${analysisData.aggregatedMetrics.globalGrammaticalPercentage}%`, 'Porcentaje de corrección general']
      ];
      
      // Dibujar tabla
      let yPos = 165;
      const colWidths = [60, 35, 75];
      const rowHeight = 8;
      
      // Header de tabla
      doc.setFillColor(...primaryColor);
      doc.rect(20, yPos, 170, rowHeight, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      
      let xPos = 25;
      tableData[0].forEach((header, i) => {
        doc.text(header, xPos, yPos + 5);
        xPos += colWidths[i];
      });
      
      // Filas de datos
      yPos += rowHeight;
      doc.setTextColor(...secondaryColor);
      doc.setFont('helvetica', 'normal');
      
      for (let i = 1; i < tableData.length; i++) {
        if (i % 2 === 0) {
          doc.setFillColor(245, 247, 250);
          doc.rect(20, yPos, 170, rowHeight, 'F');
        }
        
        xPos = 25;
        tableData[i].forEach((cell, j) => {
          if (j === 1) { // Valores numéricos en negrita
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...primaryColor);
          } else {
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...secondaryColor);
          }
          doc.text(cell, xPos, yPos + 5);
          xPos += colWidths[j];
        });
        yPos += rowHeight;
      }
      
      // Análisis por tipo de recurso
      if (analysisData.resourceTypes && Object.keys(analysisData.resourceTypes).length > 0) {
        // Nueva página para análisis por tipo
        doc.addPage();
        
        // Header de la segunda página
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, 210, 25, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('CALIDAD POR TIPO DE RECURSO', 105, 17, { align: 'center' });
        
        doc.setTextColor(...secondaryColor);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('DESGLOSE POR CATEGORÍAS', 20, 40);
        
        yPos = 55;
        Object.entries(analysisData.resourceTypes).forEach(([tipo, data]: [string, any]) => {
          // Caja para cada tipo
          doc.setFillColor(248, 249, 250);
          doc.rect(20, yPos - 5, 170, 35, 'F');
          doc.setDrawColor(...primaryColor);
          doc.rect(20, yPos - 5, 170, 35, 'S');
          
          // Título del tipo
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.setTextColor(...primaryColor);
          doc.text(tipo.toUpperCase().replace(/_/g, ' '), 25, yPos + 5);
          
          // Métricas en columnas
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.setTextColor(...secondaryColor);
          
          doc.text(`Recursos: ${data.count}`, 25, yPos + 15);
          doc.text(`Gramática: ${data.avgGrammatical}%`, 70, yPos + 15);
          doc.text(`TTR: ${data.avgLexical}`, 130, yPos + 15);
          
          yPos += 45;
          
          // Nueva página si se queda sin espacio
          if (yPos > 250) {
            doc.addPage();
            yPos = 30;
          }
        });
      }
      
      // Footer en todas las páginas
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Página ${i} de ${pageCount}`, 105, 285, { align: 'center' });
        doc.text('Sistema de Recursos Educativos - Reporte de calidad lingüística', 105, 290, { align: 'center' });
      }
      
      const fileName = `reporte-calidad-linguistica-${profile?.nombre?.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
    } catch (err) {
      console.error('Error generando PDF:', err);
      warning('Error al generar el PDF. Descargando como texto...', 'Advertencia');
      downloadReportTXT();
    }
  };

  // Función para descargar reporte en TXT
  const downloadReportTXT = () => {
    if (!analysisData) return;
    
    const reportContent = `
REPORTE DE CALIDAD LINGÜÍSTICA
==============================

INFORMACIÓN DEL USUARIO:
- Nombre: ${profile?.nombre || 'N/A'}
- Fecha de reporte: ${new Date().toLocaleDateString('es-ES', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}
- Total de recursos analizados: ${analysisData.summary.totalResources}

==============================
RESUMEN GENERAL:
==============================
• Corrección gramatical promedio: ${analysisData.summary.averageGrammaticalCorrectness}%
• Riqueza léxica (TTR) promedio: ${analysisData.summary.averageLexicalRichness}
• TTR global: ${analysisData.aggregatedMetrics.globalTTR}
• Calidad general: ${analysisData.summary.overallQuality}

EXPLICACIÓN TTR:
- TTR Promedio: Media de TTR individuales de cada recurso
- TTR Global: TTR calculado sobre todo el corpus conjunto
- El TTR Global suele ser menor por palabras repetidas entre recursos

==============================
MÉTRICAS DETALLADAS:
==============================
• Textos analizados: ${analysisData.aggregatedMetrics.totalTexts}
• Oraciones totales: ${analysisData.aggregatedMetrics.totalSentences}
• Oraciones correctas: ${analysisData.aggregatedMetrics.totalCorrectSentences}
• Corrección global: ${analysisData.aggregatedMetrics.globalGrammaticalPercentage}%
• Palabras totales: ${analysisData.aggregatedMetrics.totalTokens}
• Palabras únicas: ${analysisData.aggregatedMetrics.totalUniqueTypes}

==============================
CALIDAD POR TIPO DE RECURSO:
==============================
${analysisData.resourceTypes ? Object.entries(analysisData.resourceTypes).map(([tipo, data]: [string, any]) => `
${tipo.toUpperCase().replace(/_/g, ' ')}:
- Cantidad de recursos: ${data.count}
- Gramática promedio: ${data.avgGrammatical}%
- TTR promedio: ${data.avgLexical}
`).join('') : 'No hay datos disponibles por tipo'}

==============================
INTERPRETACIÓN DE RESULTADOS:
==============================
• Gramática (0-100%): 
  - 90-100%: Excelente
  - 80-89%: Buena
  - 70-79%: Regular
  - <70%: Necesita mejora

• TTR (0.0-1.0):
  - 0.8-1.0: Excelente diversidad
  - 0.6-0.79: Buena diversidad
  - 0.4-0.59: Diversidad media
  - <0.4: Diversidad básica

==============================
Reporte generado el ${new Date().toLocaleString('es-ES')}
Sistema de Recursos Educativos - Reporte de calidad lingüística
    `;
    
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-calidad-linguistica-${profile?.nombre?.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Función para descargar reporte (mantener la original como TXT)
  const downloadReport = () => {
    downloadReportPDF(); // Por defecto descargar PDF
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
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      <h1 className="text-2xl font-bold mb-6">Mi Perfil</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información del perfil */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-2"
        >
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <User size={32} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{profile?.nombre}</h2>
                  <p className="text-gray-600">{profile?.email}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Miembro desde {formatDate(profile?.createdAt)}
                  </p>
                </div>
              </div>
              
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 
                           text-white text-sm font-medium rounded-lg transition-colors duration-200"
                >
                  <Edit2 size={16} className="mr-2" />
                  Editar perfil
                </button>
              )}
            </div>
            
            {/* Formulario de edición */}
            {isEditing ? (
              <form onSubmit={handleUpdateProfile} className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Editar información de la cuenta</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      value={editForm.nombre}
                      onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div className="border-t pt-4 mt-4">
                    <h4 className="text-md font-semibold mb-3">Cambiar contraseña (opcional)</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contraseña actual
                        </label>
                        <input
                          type="password"
                          value={editForm.currentPassword}
                          onChange={(e) => setEditForm({ ...editForm, currentPassword: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Dejar vacío si no deseas cambiar la contraseña"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nueva contraseña
                        </label>
                        <input
                          type="password"
                          value={editForm.newPassword}
                          onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Mínimo 6 caracteres"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirmar nueva contraseña
                        </label>
                        <input
                          type="password"
                          value={editForm.confirmPassword}
                          onChange={(e) => setEditForm({ ...editForm, confirmPassword: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={editLoading}
                      className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 
                               disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200"
                    >
                      <Save size={20} className="mr-2" />
                      {editLoading ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={editLoading}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 
                               text-white font-medium rounded-lg transition-colors duration-200"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-3">Información de la cuenta</h3>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="text-sm text-gray-500">Nombre completo</div>
                    <div>{profile?.nombre}</div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="text-sm text-gray-500">Correo electrónico</div>
                    <div>{profile?.email}</div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Sección de Reporte de calidad lingüística */}
            <div className="border-t mt-6 pt-6">
              <h3 className="text-lg font-semibold mb-3">Reporte de calidad lingüística de mis Recursos</h3>
              <p className="text-gray-600 mb-4">
                Analiza la calidad gramatical y riqueza léxica de todos tus recursos educativos.
              </p>
              
              <button
                onClick={handleSemanticAnalysis}
                disabled={analysisLoading || stats.total === 0}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 
                         text-white font-medium rounded-lg transition-colors duration-200"
              >
                <BarChart3 size={20} className="mr-2" />
                {analysisLoading ? 'Analizando...' : 'Generar Reporte de Calidad'}
              </button>
              
              {stats.total === 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  Necesitas tener al menos un recurso para generar el reporte.
                </p>
              )}
            </div>
            
            {/* Sección de eliminar cuenta - ARCO */}
            {!isEditing && (
              <div className="border-t border-red-200 mt-6 pt-6 bg-red-50 -mx-6 -mb-6 px-6 pb-6 rounded-b-lg">
                <h3 className="text-lg font-semibold mb-2 text-red-900 flex items-center">
                  <AlertTriangle size={20} className="mr-2" />
                  Zona de peligro
                </h3>
                <p className="text-sm text-red-700 mb-4">
                  Una vez eliminada tu cuenta, no hay vuelta atrás. Todos tus datos serán borrados permanentemente.
                </p>
                
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 
                           text-white font-medium rounded-lg transition-colors duration-200"
                >
                  <Trash2 size={20} className="mr-2" />
                  Eliminar mi cuenta
                </button>
              </div>
            )}
          </div>
        </motion.div>
        
        {/* Estadísticas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Mis estadísticas</h3>
            
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-gray-600">Recursos totales</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <div className="text-lg font-semibold text-blue-600">{stats.comprension}</div>
                  <div className="text-xs text-gray-600">Comprensión lectora</div>
                </div>
                
                <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                  <div className="text-lg font-semibold text-green-600">{stats.escritura}</div>
                  <div className="text-xs text-gray-600">Producción escrita</div>
                </div>
                
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                  <div className="text-lg font-semibold text-orange-600">{stats.gramatica}</div>
                  <div className="text-xs text-gray-600">Gramática y ortografía</div>
                </div>
                
                <div className="bg-violet-50 p-3 rounded-lg border border-violet-100">
                  <div className="text-lg font-semibold text-violet-600">{stats.oral}</div>
                  <div className="text-xs text-gray-600">Comunicación oral</div>
                </div>
                
                <div className="bg-pink-50 p-3 rounded-lg border border-pink-100">
                  <div className="text-lg font-semibold text-pink-600">{stats.juegosInteractivos}</div>
                  <div className="text-xs text-gray-600">Juegos interactivos</div>
                </div>
                
                <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                  <div className="text-lg font-semibold text-indigo-600">{stats.iceBreakers}</div>
                  <div className="text-xs text-gray-600">Ice breakers</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Modal de Análisis Semántico */}
      {showAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Reporte de calidad lingüística de tus Recursos
                </h2>
                <button
                  onClick={() => setShowAnalysis(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              
              {analysisLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mr-4"></div>
                  <span className="text-lg text-gray-600">Analizando tus recursos...</span>
                </div>
              ) : analysisData ? (
                <div className="space-y-6">
                  {/* Resumen General */}
                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <h3 className="text-xl font-semibold text-blue-900 mb-4">Resumen General</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {analysisData.summary.totalResources}
                        </div>
                        <div className="text-sm text-gray-600">Recursos analizados</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {analysisData.summary.averageGrammaticalCorrectness}%
                        </div>
                        <div className="text-sm text-gray-600">Corrección gramatical</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {analysisData.summary.averageLexicalRichness}
                        </div>
                        <div className="text-sm text-gray-600">Riqueza léxica (TTR)</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <div className="text-lg font-bold text-orange-600">
                          {analysisData.summary.overallQuality}
                        </div>
                        <div className="text-sm text-gray-600">Calidad general</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Métricas Detalladas */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Métricas Detalladas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="text-lg font-semibold">{analysisData.aggregatedMetrics.totalTexts}</div>
                        <div className="text-sm text-gray-600">Textos analizados</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="text-lg font-semibold">{analysisData.aggregatedMetrics.totalSentences}</div>
                        <div className="text-sm text-gray-600">Oraciones totales</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="text-lg font-semibold">{analysisData.aggregatedMetrics.totalTokens}</div>
                        <div className="text-sm text-gray-600">Palabras totales</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="text-lg font-semibold">{analysisData.aggregatedMetrics.totalUniqueTypes}</div>
                        <div className="text-sm text-gray-600">Palabras únicas</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="text-lg font-semibold">{analysisData.aggregatedMetrics.globalGrammaticalPercentage}%</div>
                        <div className="text-sm text-gray-600">Corrección global</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="text-lg font-semibold">{analysisData.aggregatedMetrics.globalTTR}</div>
                        <div className="text-sm text-gray-600">TTR global</div>
                      </div>
                    </div>
                    
                    {/* Explicación de TTR */}
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Explicación de TTR:</h4>
                      <div className="text-sm text-blue-800 space-y-1">
                        <div><strong>TTR Promedio ({analysisData.summary.averageLexicalRichness}):</strong> Media de la diversidad léxica individual de cada recurso</div>
                        <div><strong>TTR Global ({analysisData.aggregatedMetrics.globalTTR}):</strong> Diversidad léxica calculada sobre todas las palabras juntas</div>
                        <div className="text-xs text-blue-600 italic">El TTR Global suele ser menor porque hay palabras repetidas entre diferentes recursos</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Análisis por Tipo de Recurso */}
                  {analysisData.resourceTypes && Object.keys(analysisData.resourceTypes).length > 0 && (
                    <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                      <h3 className="text-xl font-semibold text-green-900 mb-4">Calidad por Tipo de Recurso</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(analysisData.resourceTypes).map(([tipo, data]: [string, any]) => (
                          <div key={tipo} className="bg-white p-4 rounded-lg border">
                            <h4 className="font-semibold text-gray-900 mb-2 capitalize">
                              {tipo.replace('_', ' ')}
                            </h4>
                            <div className="space-y-1 text-sm">
                              <div>Recursos: <span className="font-semibold">{data.count}</span></div>
                              <div>Gramática: <span className="font-semibold text-green-600">{data.avgGrammatical}%</span></div>
                              <div>TTR: <span className="font-semibold text-purple-600">{data.avgLexical}</span></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Explicación de TTR */}
                  <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                    <h3 className="text-xl font-semibold text-yellow-900 mb-4">💡 Explicación de Métricas TTR</h3>
                    <div className="space-y-3 text-sm text-yellow-800">
                      <div className="flex items-start space-x-2">
                        <span className="font-semibold min-w-[140px]">TTR Promedio ({analysisData.summary.averageLexicalRichness}):</span>
                        <span>Promedio de la diversidad léxica individual de cada recurso</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="font-semibold min-w-[140px]">TTR Global ({analysisData.aggregatedMetrics.globalTTR}):</span>
                        <span>Diversidad léxica calculada sobre todas las palabras juntas</span>
                      </div>
                      <div className="bg-yellow-100 p-3 rounded border-l-4 border-yellow-400">
                        <p className="font-medium">¿Por qué son diferentes?</p>
                        <p>El TTR Global es menor porque al combinar todos los recursos, muchas palabras se repiten entre diferentes recursos, reduciendo la diversidad relativa del vocabulario total.</p>
                      </div>
                      <div>
                        <p className="font-medium">Escala de interpretación:</p>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                          <span>0.0-0.3: Básico</span>
                          <span>0.3-0.6: Medio</span>
                          <span>0.6-0.8: Bueno</span>
                          <span>0.8+: Excelente</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Botones de Acción */}
                  <div className="flex flex-wrap justify-end gap-3 pt-4 border-t">
                    <button
                      onClick={downloadReportPDF}
                      className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 
                               text-white font-medium rounded-lg transition-colors duration-200"
                    >
                      <FileText size={20} className="mr-2" />
                      Descargar PDF
                    </button>
                    <button
                      onClick={downloadReportTXT}
                      className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 
                               text-white font-medium rounded-lg transition-colors duration-200"
                    >
                      <FileText size={20} className="mr-2" />
                      Descargar TXT
                    </button>
                    <button
                      onClick={() => setShowAnalysis(false)}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg 
                               transition-colors duration-200"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">No se pudo cargar el análisis. Intenta de nuevo.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Modal de confirmación para eliminar cuenta */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-red-600 flex items-center">
                  <AlertTriangle size={28} className="mr-2" />
                  Eliminar cuenta
                </h2>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteForm({ password: '', confirmationText: '' });
                  }}
                  disabled={deleteLoading}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 font-semibold mb-2">
                  ⚠️ ADVERTENCIA: Esta acción es irreversible
                </p>
                <p className="text-sm text-red-700">
                  Al eliminar tu cuenta se borrarán permanentemente:
                </p>
                <ul className="text-sm text-red-700 list-disc list-inside mt-2 space-y-1">
                  <li>Tu información personal</li>
                  <li>Todos tus recursos educativos</li>
                  <li>Todos tus exámenes creados</li>
                  <li>Todos los resultados de exámenes</li>
                </ul>
              </div>
              
              <form onSubmit={handleDeleteAccount} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Para confirmar, escribe exactamente: <span className="font-bold">ELIMINAR MI CUENTA</span>
                  </label>
                  <input
                    type="text"
                    value={deleteForm.confirmationText}
                    onChange={(e) => setDeleteForm({ ...deleteForm, confirmationText: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="ELIMINAR MI CUENTA"
                    disabled={deleteLoading}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ingresa tu contraseña para confirmar
                  </label>
                  <input
                    type="password"
                    value={deleteForm.password}
                    onChange={(e) => setDeleteForm({ ...deleteForm, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    disabled={deleteLoading}
                    required
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={deleteLoading || deleteForm.confirmationText !== 'ELIMINAR MI CUENTA'}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 
                             disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200"
                  >
                    <Trash2 size={20} className="mr-2" />
                    {deleteLoading ? 'Procesando...' : 'Continuar'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteForm({ password: '', confirmationText: '' });
                    }}
                    disabled={deleteLoading}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 
                             text-white font-medium rounded-lg transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de confirmación final */}
      {showFinalConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow-2xl max-w-lg w-full border-4 border-red-600"
          >
            <div className="p-8">
              {/* Icono de advertencia animado */}
              <div className="flex justify-center mb-6">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, -5, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 0.5,
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                  className="bg-red-600 rounded-full p-4"
                >
                  <AlertTriangle size={48} className="text-white" />
                </motion.div>
              </div>

              <h2 className="text-3xl font-bold text-red-900 text-center mb-4">
                ⚠️ ADVERTENCIA FINAL ⚠️
              </h2>
              
              <div className="bg-white rounded-lg p-6 mb-6 border-2 border-red-300">
                <p className="text-lg font-semibold text-red-900 mb-3 text-center">
                  Esta acción es IRREVERSIBLE
                </p>
                <p className="text-red-800 mb-3">
                  Se eliminarán permanentemente:
                </p>
                <ul className="text-red-800 space-y-2">
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2 font-bold">✗</span>
                    <span>Tu cuenta de usuario</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2 font-bold">✗</span>
                    <span>Todos tus recursos educativos</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2 font-bold">✗</span>
                    <span>Todos tus exámenes</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2 font-bold">✗</span>
                    <span>Todos los resultados asociados</span>
                  </li>
                </ul>
                <p className="text-red-900 font-bold mt-4 text-center">
                  NO HAY FORMA DE RECUPERAR ESTOS DATOS
                </p>
              </div>

              <p className="text-center text-red-900 font-semibold mb-6 text-lg">
                ¿Estás COMPLETAMENTE SEGURO de que deseas continuar?
              </p>
              
              <div className="flex gap-4">
                <button
                  onClick={() => setShowFinalConfirmation(false)}
                  disabled={deleteLoading}
                  className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 
                           text-white font-bold rounded-lg transition-colors duration-200 text-lg"
                >
                  ← No, cancelar
                </button>
                <button
                  onClick={confirmFinalDeletion}
                  disabled={deleteLoading}
                  className="flex-1 px-6 py-3 bg-red-700 hover:bg-red-800 disabled:bg-gray-400 
                           text-white font-bold rounded-lg transition-colors duration-200 text-lg
                           shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {deleteLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Eliminando...
                    </span>
                  ) : (
                    'Sí, eliminar permanentemente →'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Perfil;