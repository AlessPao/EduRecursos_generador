/**
 * Utilidades para formatear fechas y horas
 */

/**
 * Formatea una fecha a hora en formato 24h (HH:MM:SS)
 * @param {Date|string} fecha - Fecha a formatear
 * @returns {string|null} Hora formateada o null
 */
export const formatearSoloHora = (fecha) => {
  if (!fecha) return null;
  
  const date = fecha instanceof Date ? fecha : new Date(fecha);
  
  return date.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

/**
 * Formatea una fecha completa (DD/MM/YYYY HH:MM:SS)
 * @param {Date|string} fecha - Fecha a formatear
 * @returns {string|null} Fecha y hora formateadas o null
 */
export const formatearFechaHora = (fecha) => {
  if (!fecha) return null;
  
  const date = fecha instanceof Date ? fecha : new Date(fecha);
  
  const fechaStr = date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  const horaStr = date.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  return `${fechaStr} ${horaStr}`;
};

/**
 * Formatea una fecha a solo fecha (DD/MM/YYYY)
 * @param {Date|string} fecha - Fecha a formatear
 * @returns {string|null} Fecha formateada o null
 */
export const formatearSoloFecha = (fecha) => {
  if (!fecha) return null;
  
  const date = fecha instanceof Date ? fecha : new Date(fecha);
  
  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Calcula la diferencia en segundos entre dos fechas
 * @param {Date|string} inicio - Fecha de inicio
 * @param {Date|string} fin - Fecha de fin
 * @returns {number} Diferencia en segundos
 */
export const calcularDiferenciaSegundos = (inicio, fin) => {
  if (!inicio || !fin) return 0;
  
  const dateInicio = inicio instanceof Date ? inicio : new Date(inicio);
  const dateFin = fin instanceof Date ? fin : new Date(fin);
  
  return Math.floor((dateFin - dateInicio) / 1000);
};

/**
 * Formatea segundos a formato legible (HH:MM:SS o MM:SS)
 * @param {number} segundos - Segundos a formatear
 * @returns {string} Tiempo formateado
 */
export const formatearSegundos = (segundos) => {
  if (!segundos || segundos < 0) return '00:00';
  
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  const segs = Math.floor(segundos % 60);
  
  if (horas > 0) {
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  }
  
  return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
};
