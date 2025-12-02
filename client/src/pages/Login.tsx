import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { BookOpen, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

// Tipo para los datos del formulario
interface LoginFormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const { login, isAuthenticated, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Configuración de React Hook Form
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

  // Redirigir al dashboard si ya está autenticado
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  // Manejar envío del formulario
  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true);
      clearError();
      await login(data.email, data.password);
      toast.success('¡Inicio de sesión exitoso!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      toast.error('No se pudo iniciar sesión. Verifica tus credenciales.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50 dark:bg-slate-950">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link to="/" className="flex items-center">
            <BookOpen className="h-10 w-10 text-blue-600" />
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900 dark:text-white">
          Iniciar Sesión
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-slate-400">
          ¿No tienes una cuenta?{' '}
          <Link to="/register" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
            Regístrate
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-slate-900 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200 dark:border-slate-700"
        >
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 p-4 rounded-md flex items-start border border-red-200 dark:border-red-800">
              <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5 mr-2" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="form-label">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={`form-input ${errors.email ? 'border-red-500' : ''}`}                {...register('email', {
                  required: 'El correo electrónico es requerido',
                  pattern: {
                    value: /^[a-zA-Z0-9][a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]*(\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9][a-zA-Z0-9-]*(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/i,
                    message: 'Ingresa un correo electrónico válido'
                  },
                  validate: {
                    noStartWithDot: value => !value.startsWith('.') || 'El correo no puede empezar con punto',
                    noConsecutiveDots: value => !value.includes('..') || 'El correo no puede tener puntos consecutivos',
                    validLength: value => value.length <= 320 || 'El correo es demasiado largo (máx. 320 caracteres)',
                    validLocalLength: value => value.split('@')[0]?.length <= 64 || 'La parte local del correo es demasiado larga',
                    validDomainLength: value => value.split('@')[1]?.length <= 255 || 'El dominio del correo es demasiado largo'
                  }
                })}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className={`form-input ${errors.password ? 'border-red-500' : ''}`}
                {...register('password', {
                  required: 'La contraseña es requerida',
                  minLength: {
                    value: 6,
                    message: 'La contraseña debe tener al menos 6 caracteres'
                  }
                })}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link
                  to="/request-password-reset"
                  className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Iniciando sesión...
                  </span>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;