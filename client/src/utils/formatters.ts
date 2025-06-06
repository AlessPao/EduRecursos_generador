/**
 * Formatea una fecha ISO a un formato legible
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  
  // Opciones para el formato de fecha
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return new Intl.DateTimeFormat('es-ES', options).format(date);
};

/**
 * Formatea un tipo de recurso a un nombre legible
 */
export const formatTipoRecurso = (tipo: string): string => {
  switch (tipo) {
    case 'comprension':
      return 'Comprensión lectora';
    case 'escritura':
      return 'Producción escrita';
    case 'gramatica':
      return 'Gramática y ortografía';
    case 'oral':
      return 'Comunicación oral';
    case 'drag_and_drop':
      return 'Juegos interactivos';
    case 'ice_breakers':
      return 'Ice Breakers';
    default:
      return tipo;
  }
};