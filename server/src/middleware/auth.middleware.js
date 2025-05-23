import jwt from 'jsonwebtoken';

// Middleware para verificar si el usuario está autenticado
export const isAuthenticated = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado. Token no proporcionado.'
      });
    }

    try {
      // Verificar el token usando la misma clave secreta que para firmarlo
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Usar JWT_SECRET
      req.user = decoded; // Adjuntar el payload del token a req.user
      next();
    } catch (error) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado. Token inválido o expirado.',
        error: error.message
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'No autorizado. Encabezado de autorización ausente o malformado.'
    });
  }
};

// Middleware para verificar si el usuario NO está autenticado (para rutas de login/registro)
// Comentado ya que con JWT, la gestión de acceso a /login o /register 
// suele manejarse más en el lado del cliente o con lógicas diferentes.
/*
export const isNotAuthenticated = (req, res, next) => {
  // Esta lógica necesitaría ser adaptada para JWT si se decide mantenerla.
  // Por ejemplo, verificar la ausencia de un token válido.
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  const token = authHeader.split(' ')[1];
  try {
    jwt.verify(token, process.env.SESSION_SECRET);
    // Si el token es válido, significa que el usuario ya está autenticado
    return res.status(400).json({
      success: false,
      message: 'Ya tiene una sesión iniciada (token válido presente).'
    });
  } catch (error) {
    // Si el token es inválido o no existe, permite el acceso
    return next();
  }
};
*/