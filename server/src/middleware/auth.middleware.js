// Middleware para verificar si el usuario está autenticado
export const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  
  return res.status(401).json({
    success: false,
    message: 'No autorizado. Por favor, inicie sesión para acceder a este recurso.'
  });
};

// Middleware para verificar si el usuario NO está autenticado (para rutas de login/registro)
export const isNotAuthenticated = (req, res, next) => {
  if (!req.session.userId) {
    return next();
  }
  
  return res.status(400).json({
    success: false,
    message: 'Ya tiene una sesión iniciada.'
  });
};