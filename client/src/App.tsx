import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Páginas
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import RequestPasswordReset from './pages/RequestPasswordReset';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import RecursosList from './pages/RecursosList';
import RecursoForm from './pages/RecursoForm';
import RecursoView from './pages/RecursoView'; // Importar RecursoView
import StudentView from './pages/StudentView'; // Importar StudentView
import Perfil from './pages/Perfil';
import NotFound from './pages/NotFound';
import EvaluationsList from './pages/EvaluationsList';
import EvaluationForm from './pages/EvaluationForm';
import ExamPublic from './pages/ExamPublic';
import ExamDetail from './pages/ExamDetail'; // Detalle de examen para el docente
import JuegosInteractivos from './pages/JuegosInteractivos';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/request-password-reset" element={<RequestPasswordReset />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* Ruta pública de examen */}
        <Route path="/evaluaciones/:slug" element={<ExamPublic />} />
        <Route path="/juegos/:id" element={<JuegosInteractivos />} />
        
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
            <Route path="/evaluaciones" element={<EvaluationsList />} />
            <Route path="/evaluaciones/new" element={<EvaluationForm />} />
            <Route path="/evaluaciones/:slug/detalle" element={<ExamDetail />} />
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