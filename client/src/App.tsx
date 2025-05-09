import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Páginas
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import RecursosList from './pages/RecursosList';
import RecursoForm from './pages/RecursoForm';
import RecursoView from './pages/RecursoView'; // Importar RecursoView
import StudentView from './pages/StudentView'; // Importar StudentView
import Perfil from './pages/Perfil';
import NotFound from './pages/NotFound';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/recursos" element={<RecursosList />} />
            <Route path="/recursos/nuevo/:tipo" element={<RecursoForm />} />
            <Route path="/recursos/:id/editar" element={<RecursoForm />} /> {/* Cambiar ruta para edición */}
            <Route path="/recursos/:id" element={<RecursoView />} /> {/* Agregar ruta para ver el recurso */}
            <Route path="/estudiante/:id" element={<StudentView />} /> {/* Ruta para vista de estudiante */}
            <Route path="/perfil" element={<Perfil />} />
          </Route>
        </Route>
        
        {/* Redirecciones y ruta 404 */}
        <Route path="/dashboard/recursos" element={<Navigate to="/recursos" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;