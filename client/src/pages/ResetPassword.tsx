import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { BookOpen, ArrowLeft, Check, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { API_URL } from '../config';

interface ResetPasswordFormData {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [password, setPassword] = useState('');
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<ResetPasswordFormData>();
  
  // Vigilar el campo de contraseña para validación en tiempo real
  const watchedPassword = watch('newPassword', '');
  const watchedConfirmPassword = watch('confirmPassword', '');
  
  // Funciones de validación de contraseña
  const passwordValidations = {
    minLength: watchedPassword.length >= 8,
    hasUpperCase: /[A-Z]/.test(watchedPassword),
    hasLowerCase: /[a-z]/.test(watchedPassword),
    hasNumber: /\d/.test(watchedPassword),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(watchedPassword)
  };
  
  const isPasswordValid = Object.values(passwordValidations).every(Boolean);
  const passwordsMatch = watchedPassword === watchedConfirmPassword && watchedPassword !== '';
  
  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!isPasswordValid) {
      toast.error('La contraseña debe cumplir con todos los requisitos de seguridad.');
      return;
    }
    
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Las contraseñas no coinciden.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: data.email,
          code: data.code,
          newPassword: data.newPassword
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Contraseña actualizada correctamente');
        navigate('/login', { 
          state: { message: 'Contraseña actualizada. Inicia sesión con tu nueva contraseña.' }
        });
      } else {
        if (result.errors && result.errors.length > 0) {
          result.errors.forEach((error: any) => {
            toast.error(error.msg);
          });
        } else {
          toast.error(result.message || 'Error al actualizar la contraseña');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700"
      >
        <div className="text-center">
          <Link to="/" className="inline-flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            <span className="ml-2 text-2xl font-bold text-gray-900 dark:text-white">Educa Recursos</span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Nueva contraseña
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
            Ingresa el código que recibiste por correo y tu nueva contraseña.
          </p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-slate-300">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="tu-email@ejemplo.com"
              className={`mt-1 appearance-none relative block w-full px-3 py-3 border ${
                errors.email ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-slate-600'
              } placeholder-gray-500 dark:placeholder-slate-500 text-gray-900 dark:text-white bg-white dark:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 focus:z-10 sm:text-sm transition-colors`}              {...register('email', {
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
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-slate-300">
              Código de recuperación
            </label>
            <input
              id="code"
              type="text"
              maxLength={6}
              placeholder="123456"
              className={`mt-1 appearance-none relative block w-full px-3 py-3 border ${
                errors.code ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-slate-600'
              } placeholder-gray-500 dark:placeholder-slate-500 text-gray-900 dark:text-white bg-white dark:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 focus:z-10 sm:text-sm transition-colors text-center text-xl font-mono tracking-widest`}
              {...register('code', {
                required: 'El código es requerido',
                pattern: {
                  value: /^\d{6}$/,
                  message: 'El código debe tener 6 dígitos'
                }
              })}
            />
            {errors.code && (
              <p className="mt-1 text-sm text-red-600">
                {errors.code.message}
              </p>
            )}
          </div>
          
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-slate-300">
              Nueva contraseña
            </label>
            <input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              className={`mt-1 appearance-none relative block w-full px-3 py-3 border ${
                errors.newPassword ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-slate-600'
              } placeholder-gray-500 dark:placeholder-slate-500 text-gray-900 dark:text-white bg-white dark:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 focus:z-10 sm:text-sm transition-colors`}
              {...register('newPassword', { 
                required: 'La contraseña es requerida',
                validate: () => isPasswordValid || 'La contraseña no cumple con los requisitos de seguridad'
              })}
            />
            {errors.newPassword && (
              <p className="mt-1 text-sm text-red-600">
                {errors.newPassword.message}
              </p>
            )}
            
            {/* Validaciones visuales de contraseña */}
            {watchedPassword && (
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-600 dark:text-slate-400 font-medium">Requisitos de contraseña:</p>
                <div className="grid grid-cols-1 gap-1 text-xs">
                  <div className={`flex items-center ${passwordValidations.minLength ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                    {passwordValidations.minLength ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
                    Mínimo 8 caracteres
                  </div>
                  <div className={`flex items-center ${passwordValidations.hasUpperCase ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                    {passwordValidations.hasUpperCase ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
                    Una letra mayúscula
                  </div>
                  <div className={`flex items-center ${passwordValidations.hasLowerCase ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                    {passwordValidations.hasLowerCase ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
                    Una letra minúscula
                  </div>
                  <div className={`flex items-center ${passwordValidations.hasNumber ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                    {passwordValidations.hasNumber ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
                    Un número
                  </div>
                  <div className={`flex items-center ${passwordValidations.hasSpecialChar ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                    {passwordValidations.hasSpecialChar ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
                    Un carácter especial
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-slate-300">
              Confirmar nueva contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              className={`mt-1 appearance-none relative block w-full px-3 py-3 border ${
                errors.confirmPassword ? 'border-red-500 dark:border-red-400' : passwordsMatch ? 'border-green-500 dark:border-green-400' : 'border-gray-300 dark:border-slate-600'
              } placeholder-gray-500 dark:placeholder-slate-500 text-gray-900 dark:text-white bg-white dark:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 focus:z-10 sm:text-sm transition-colors`}
              {...register('confirmPassword', {
                required: 'Confirma tu contraseña',
                validate: (value) => value === watchedPassword || 'Las contraseñas no coinciden'
              })}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {errors.confirmPassword.message}
              </p>
            )}
            {passwordsMatch && watchedConfirmPassword && (
              <p className="mt-1 text-sm text-green-600 dark:text-green-400 flex items-center">
                <Check className="h-4 w-4 mr-1" />
                Las contraseñas coinciden
              </p>
            )}
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isSubmitting || !isPasswordValid || !passwordsMatch}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Actualizando...' : 'Actualizar contraseña'}
            </button>
          </div>
          
          <div className="flex justify-between text-sm">
            <Link
              to="/request-password-reset"
              className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
            >
              ¿No recibiste el código?
            </Link>
            <Link
              to="/login"
              className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors inline-flex items-center"
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

export default ResetPassword;
