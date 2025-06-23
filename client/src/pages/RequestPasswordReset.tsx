import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { BookOpen, Mail, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { API_URL } from '../config';

interface RequestResetFormData {
  email: string;
}

const RequestPasswordReset: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<RequestResetFormData>();
  
  const onSubmit = async (data: RequestResetFormData) => {
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`${API_URL}/auth/request-password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setEmailSent(true);
        toast.success('Si el correo está registrado, recibirás un código de recuperación');
      } else {
        toast.error(result.message || 'Error al solicitar recuperación');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl"
        >
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Código enviado
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Si el correo está registrado, recibirás un código de recuperación en unos minutos.
            </p>
          </div>
          
          <div className="space-y-4">
            <Link
              to="/reset-password"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Ingresar código de recuperación
            </Link>
            
            <Link
              to="/login"
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al login
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl"
      >
        <div className="text-center">
          <Link to="/" className="inline-flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-blue-600" />
            <span className="ml-2 text-2xl font-bold text-gray-900">Educa Recursos</span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Recuperar contraseña
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ingresa tu correo electrónico y te enviaremos un código para recuperar tu cuenta.
          </p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="tu-email@ejemplo.com"
              className={`mt-1 appearance-none relative block w-full px-3 py-3 border ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors`}              {...register('email', {
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
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar código de recuperación'}
            </button>
          </div>
          
          <div className="text-center">
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors inline-flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver al login
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default RequestPasswordReset;
