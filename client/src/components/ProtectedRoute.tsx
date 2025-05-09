import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  
  // Mostrar pantalla de carga mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  // Redirigir a la página de login si no está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Renderizar el contenido de la ruta si está autenticado
  return <Outlet />;
};

export default ProtectedRoute;