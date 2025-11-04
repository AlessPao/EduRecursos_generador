/**
 * Utilidades para formatear fechas y horas en zona horaria de Perú (UTC-5)
 */

// Zona horaria de Perú
const TIMEZONE_PERU = 'America/Lima'; // UTC-5

/**
 * Convierte una fecha a la zona horaria de Perú
 * @param {Date|string} fecha - Fecha a convertir
 * @returns {Date} Fecha en zona horaria de Perú
 */
export const convertirAHoraPeru = (fecha) => {
  if (!fecha) return null;
  
  const date = fecha instanceof Date ? fecha : new Date(fecha);
  
  // Obtener los componentes de la fecha en zona horaria de Perú
  const peruTimeString = date.toLocaleString('en-US', { 
    timeZone: TIMEZONE_PERU,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  // Crear un nuevo Date con la hora de Perú (esto crea un Date en UTC que representa la hora de Perú)
  return new Date(peruTimeString);
};

/**
 * Obtiene la fecha y hora actual en Perú como objeto Date
 * Retorna un Date que representa la hora actual en UTC
 * PostgreSQL lo interpretará con el timezone configurado (America/Lima)
 * @returns {Date} Fecha actual
 */
export const obtenerFechaHoraPeru = () => {
  return new Date();
};

/**
 * Formatea una fecha a hora en formato 24h (HH:MM:SS) en zona horaria de Perú
 * @param {Date|string} fecha - Fecha a formatear
 * @returns {string|null} Hora formateada o null
 */
export const formatearSoloHora = (fecha) => {
  if (!fecha) return null;
  
  const date = fecha instanceof Date ? fecha : new Date(fecha);
  
  return date.toLocaleTimeString('es-PE', {
    timeZone: TIMEZONE_PERU,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

/**
 * Formatea una fecha completa (DD/MM/YYYY HH:MM:SS) en zona horaria de Perú
 * @param {Date|string} fecha - Fecha a formatear
 * @returns {string|null} Fecha y hora formateadas o null
 */
export const formatearFechaHora = (fecha) => {
  if (!fecha) return null;
  
  const date = fecha instanceof Date ? fecha : new Date(fecha);
  
  const fechaStr = date.toLocaleDateString('es-PE', {
    timeZone: TIMEZONE_PERU,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  const horaStr = date.toLocaleTimeString('es-PE', {
    timeZone: TIMEZONE_PERU,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  return `${fechaStr} ${horaStr}`;
};

/**
 * Formatea una fecha a solo fecha (DD/MM/YYYY) en zona horaria de Perú
 * @param {Date|string} fecha - Fecha a formatear
 * @returns {string|null} Fecha formateada o null
 */
export const formatearSoloFecha = (fecha) => {
  if (!fecha) return null;
  
  const date = fecha instanceof Date ? fecha : new Date(fecha);
  
  return date.toLocaleDateString('es-PE', {
    timeZone: TIMEZONE_PERU,
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

/**
 * Formatea una fecha ISO 8601 a formato timestamp de PostgreSQL con zona horaria de Perú
 * Formato: YYYY-MM-DD HH:MM:SS.mmm-05 (similar a createdAt/updatedAt)
 * @param {string} isoString - String en formato ISO 8601 (ej: 2025-11-03T22:52:05.496Z)
 * @returns {string} Timestamp formateado (ej: 2025-11-03 17:52:05.496-05)
 */
export const formatearTimestampConsentimiento = (isoString) => {
  if (!isoString) return null;
  
  const date = new Date(isoString);
  
  // Obtener la fecha/hora en formato UTC
  const utcYear = date.getUTCFullYear();
  const utcMonth = String(date.getUTCMonth() + 1).padStart(2, '0');
  const utcDay = String(date.getUTCDate()).padStart(2, '0');
  const utcHour = date.getUTCHours();
  const utcMinute = String(date.getUTCMinutes()).padStart(2, '0');
  const utcSecond = String(date.getUTCSeconds()).padStart(2, '0');
  const millisecond = String(date.getUTCMilliseconds()).padStart(3, '0');
  
  // Perú está en UTC-5 (sin horario de verano)
  // Restar 5 horas a UTC
  const peruHour = utcHour - 5;
  
  // Manejar cambio de día si la hora es negativa
  let finalYear = utcYear;
  let finalMonth = utcMonth;
  let finalDay = utcDay;
  let finalHour = peruHour;
  
  if (peruHour < 0) {
    // Si la hora es negativa, retroceder un día
    const tempDate = new Date(date);
    tempDate.setUTCHours(tempDate.getUTCHours() - 5);
    
    finalYear = tempDate.getUTCFullYear();
    finalMonth = String(tempDate.getUTCMonth() + 1).padStart(2, '0');
    finalDay = String(tempDate.getUTCDate()).padStart(2, '0');
    finalHour = tempDate.getUTCHours();
  }
  
  const finalHourStr = String(finalHour).padStart(2, '0');
  const timezone = '-05';
  
  // Formato: YYYY-MM-DD HH:MM:SS.mmm-05
  return `${finalYear}-${finalMonth}-${finalDay} ${finalHourStr}:${utcMinute}:${utcSecond}.${millisecond}${timezone}`;
};
