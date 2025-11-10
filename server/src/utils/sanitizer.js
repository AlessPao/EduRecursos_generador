/**
 * Utilidades de sanitización para prevenir XSS y ataques de inyección
 * 
 * SEGURIDAD IMPLEMENTADA:
 * - Prevención de XSS (Cross-Site Scripting)
 * - Sanitización de HTML/Scripts maliciosos
 * - Limpieza de caracteres peligrosos
 */

/**
 * Sanitiza un string eliminando tags HTML y scripts peligrosos
 * @param {string} input - Texto a sanitizar
 * @returns {string} - Texto limpio
 */
export const sanitizeString = (input) => {
  if (typeof input !== 'string') return input;
  
  // Eliminar tags HTML/XML
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // Eliminar caracteres de control peligrosos
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Eliminar secuencias de escape peligrosas
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, ''); // onclick=, onerror=, etc.
  
  return sanitized.trim();
};

/**
 * Sanitiza un objeto completo recursivamente
 * @param {Object} obj - Objeto a sanitizar
 * @returns {Object} - Objeto sanitizado
 */
export const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return typeof obj === 'string' ? sanitizeString(obj) : obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitizeObject(value);
  }
  
  return sanitized;
};

/**
 * Middleware para sanitizar automáticamente req.body
 */
export const sanitizeMiddleware = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }
  
  next();
};
