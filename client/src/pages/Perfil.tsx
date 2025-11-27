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

    // Ejecutar eliminación directamente
    try {
      setDeleteLoading(true);

      const response = await axios.delete(`${API_URL}/auth/account`, {
        data: {
          password: deleteForm.password,
          confirmationText: deleteForm.confirmationText
        }
      });

      if (response.data.success) {
        // Cerrar modal
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
    <div className="pb-12 max-w-6xl mx-auto">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header Section with Blobs */}
      <div className="mb-10 relative">
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-indigo-100 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-100 rounded-full blur-3xl opacity-60"></div>

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Mi Perfil</h1>
            <p className="text-lg text-slate-600">Gestiona tu información y revisa tus estadísticas</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Información del perfil */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-2 space-y-8"
        >
          {/* Tarjeta Principal de Perfil */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8">
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center">
                  <div className="w-20 h-20 rounded-2xl bg-indigo-50 flex items-center justify-center mr-5 border border-indigo-100">
                    <User size={36} className="text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{profile?.nombre}</h2>
                    <p className="text-slate-500 font-medium">{profile?.email}</p>
                    <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                      Miembro desde {formatDate(profile?.createdAt)}
                    </div>
                  </div>
                </div>

                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 
                             text-slate-700 text-sm font-medium rounded-xl transition-all duration-200 shadow-sm"
                  >
                    <Edit2 size={16} className="mr-2" />
                    Editar
                  </button>
                )}
              </div>

              {/* Formulario de edición */}
              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Editar información</h3>

                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          Nombre completo
                        </label>
                        <input
                          type="text"
                          value={editForm.nombre}
                          onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          Correo electrónico
                        </label>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div className="border-t border-slate-200 pt-5">
                      <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2"></span>
                        Cambiar contraseña (opcional)
                      </h4>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1.5">
                            Contraseña actual
                          </label>
                          <input
                            type="password"
                            value={editForm.currentPassword}
                            onChange={(e) => setEditForm({ ...editForm, currentPassword: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            placeholder="Necesaria para guardar cambios de contraseña"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1.5">
                              Nueva contraseña
                            </label>
                            <input
                              type="password"
                              value={editForm.newPassword}
                              onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                              placeholder="Mínimo 6 caracteres"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1.5">
                              Confirmar nueva contraseña
                            </label>
                            <input
                              type="password"
                              value={editForm.confirmPassword}
                              onChange={(e) => setEditForm({ ...editForm, confirmPassword: e.target.value })}
                              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={editLoading}
                        className="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 
                                 disabled:bg-indigo-300 text-white font-medium rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        <Save size={18} className="mr-2" />
                        {editLoading ? 'Guardando...' : 'Guardar cambios'}
                      </button>

                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={editLoading}
                        className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 
                                 font-medium rounded-xl transition-all duration-200"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Nombre completo</div>
                    <div className="text-slate-800 font-medium">{profile?.nombre}</div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Correo electrónico</div>
                    <div className="text-slate-800 font-medium">{profile?.email}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Sección de Reporte de calidad lingüística */}
            <div className="border-t border-slate-100 p-8 bg-gradient-to-b from-white to-slate-50">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center">
                    <BarChart3 size={20} className="text-indigo-500 mr-2" />
                    Reporte de Calidad Lingüística
                  </h3>
                  <p className="text-slate-600 text-sm max-w-xl">
                    Genera un análisis detallado de la calidad gramatical y riqueza léxica de todos tus recursos educativos creados hasta el momento.
                  </p>
                </div>
                <button
                  onClick={handleSemanticAnalysis}
                  disabled={analysisLoading || stats.total === 0}
                  className="inline-flex items-center px-4 py-2.5 bg-white border border-indigo-200 text-indigo-700 
                           hover:bg-indigo-50 hover:border-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed
                           font-medium rounded-xl transition-all duration-200 shadow-sm"
                >
                  {analysisLoading ? (
                    <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <FileText size={18} className="mr-2" />
                  )}
                  {analysisLoading ? 'Analizando...' : 'Generar Reporte'}
                </button>
              </div>

              {stats.total === 0 && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-center text-amber-800 text-sm">
                  <AlertTriangle size={16} className="mr-2 flex-shrink-0" />
                  Necesitas crear al menos un recurso para generar este reporte.
                </div>
              )}
            </div>
          </div>

          {/* Sección de eliminar cuenta - ARCO */}
          {!isEditing && (
            <div className="bg-white rounded-2xl border border-rose-100 shadow-sm overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-bold text-rose-700 mb-2 flex items-center">
                  <AlertTriangle size={20} className="mr-2" />
                  Zona de Peligro
                </h3>
                <p className="text-slate-600 text-sm mb-6">
                  Si eliminas tu cuenta, perderás acceso a todos tus recursos y evaluaciones. Esta acción es irreversible.
                </p>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="inline-flex items-center px-4 py-2.5 bg-rose-50 border border-rose-200 
                           text-rose-700 hover:bg-rose-100 hover:border-rose-300 hover:text-rose-800
                           font-medium rounded-xl transition-all duration-200"
                >
                  <Trash2 size={18} className="mr-2" />
                  Eliminar mi cuenta permanentemente
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Estadísticas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
              <BarChart3 size={20} className="text-slate-400 mr-2" />
              Estadísticas
            </h3>

            <div className="space-y-4">
              <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-5 rounded-2xl text-white shadow-lg shadow-indigo-200">
                <div className="text-3xl font-bold mb-1">{stats.total}</div>
                <div className="text-indigo-100 text-sm font-medium">Recursos Totales</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-indigo-100 transition-colors">
                  <div className="text-2xl font-bold text-slate-800">{stats.comprension}</div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Lectura</div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-emerald-100 transition-colors">
                  <div className="text-2xl font-bold text-slate-800">{stats.escritura}</div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Escritura</div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-orange-100 transition-colors">
                  <div className="text-2xl font-bold text-slate-800">{stats.gramatica}</div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Gramática</div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-violet-100 transition-colors">
                  <div className="text-2xl font-bold text-slate-800">{stats.oral}</div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Oral</div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-pink-100 transition-colors">
                  <div className="text-2xl font-bold text-slate-800">{stats.juegosInteractivos}</div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Juegos</div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-indigo-100 transition-colors">
                  <div className="text-2xl font-bold text-slate-800">{stats.iceBreakers}</div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Ice Breakers</div>
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
                  Reporte de calidad lingüística
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
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-blue-600">
                          {analysisData.summary.totalResources}
                        </div>
                        <div className="text-sm text-gray-600">Recursos</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-green-600">
                          {analysisData.summary.averageGrammaticalCorrectness}%
                        </div>
                        <div className="text-sm text-gray-600">Gramática</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-purple-600">
                          {analysisData.summary.averageLexicalRichness}
                        </div>
                        <div className="text-sm text-gray-600">TTR Promedio</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="text-lg font-bold text-orange-600">
                          {analysisData.summary.overallQuality}
                        </div>
                        <div className="text-sm text-gray-600">Calidad</div>
                      </div>
                    </div>
                  </div>

                  {/* Botones de Acción */}
                  <div className="flex flex-wrap justify-end gap-3 pt-4 border-t">
                    <button
                      onClick={downloadReportPDF}
                      className="inline-flex items-center px-4 py-2 bg-rose-600 hover:bg-rose-700 
                               text-white font-medium rounded-lg transition-colors duration-200"
                    >
                      <FileText size={20} className="mr-2" />
                      Descargar PDF
                    </button>
                    <button
                      onClick={downloadReportTXT}
                      className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 
                               text-white font-medium rounded-lg transition-colors duration-200"
                    >
                      <FileText size={20} className="mr-2" />
                      Descargar TXT
                    </button>
                    <button
                      onClick={() => setShowAnalysis(false)}
                      className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg 
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
                <h2 className="text-2xl font-bold text-rose-600 flex items-center">
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

              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg">
                <p className="text-sm text-rose-800 font-semibold mb-2">
                  ⚠️ ADVERTENCIA: Esta acción es irreversible
                </p>
                <p className="text-sm text-rose-700">
                  Al eliminar tu cuenta se borrarán permanentemente:
                </p>
                <ul className="text-sm text-rose-700 list-disc list-inside mt-2 space-y-1">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    disabled={deleteLoading}
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={deleteLoading || deleteForm.confirmationText !== 'ELIMINAR MI CUENTA'}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-rose-600 hover:bg-rose-700 
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
    </div>
  );
};

export default Perfil;