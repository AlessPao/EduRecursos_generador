import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { BookOpen, AlertCircle, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

// Tipo para los datos del formulario
interface RegisterFormData {
  nombre: string;
  email: string;
  password: string;
}

const Register: React.FC = () => {
  const { register: registerUser, isAuthenticated, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [password, setPassword] = useState('');
  
  // Configuración de React Hook Form
  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterFormData>();
  
  // Vigilar campos para validación en tiempo real
  const watchedPassword = watch('password', '');
  const watchedNombre = watch('nombre', '');
  const watchedEmail = watch('email', '');
  
  // Funciones de validación de nombre
  const nombreValidations = {
    notEmpty: watchedNombre.trim().length > 0,
    minLength: watchedNombre.length >= 3,
    maxLength: watchedNombre.length <= 50,
    onlyValidChars: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(watchedNombre.trim()),
    noNumbers: !/\d/.test(watchedNombre),
    noSpecialChars: !/[!@#$%^&*(),.?":{}|<>[\]\\\/+=_-]/.test(watchedNombre),
    noScriptTags: !/<script|<\/script>/i.test(watchedNombre)
  };
  
  const isNombreValid = Object.values(nombreValidations).every(Boolean);
  
  // Validación mejorada de email
  const emailValidations = {
    notEmpty: watchedEmail.trim().length > 0,
    validFormat: (() => {
      if (!watchedEmail || watchedEmail.trim().length === 0) return false;
      
      const email = watchedEmail.trim();
      
      // Verificar longitud total (máx. 320 caracteres)
      if (email.length > 320) return false;
      
      // Verificar que contiene exactamente un @
      const atCount = email.split('@').length - 1;
      if (atCount !== 1) return false;
      
      const [localPart, domain] = email.split('@');
      
      // Validar parte local
      if (!localPart || localPart.length === 0 || localPart.length > 64) return false;
      if (localPart.startsWith('.') || localPart.endsWith('.')) return false;
      if (localPart.includes('..')) return false;
      if (!/^[a-zA-Z0-9][a-zA-Z0-9!#$%&'*+/=?^_`{|}~.-]*[a-zA-Z0-9]$|^[a-zA-Z0-9]$/.test(localPart)) return false;
      
      // Validar dominio (MEJORADO)
      if (!domain || domain.length === 0 || domain.length > 255) return false;
      if (domain.startsWith('.') || domain.endsWith('.')) return false;
      if (domain.startsWith('-') || domain.endsWith('-')) return false;
      if (domain.includes('..')) return false;
      if (domain.includes('--')) return false;
      
      // El dominio SOLO puede contener letras, números, puntos y guiones
      // NO se permiten símbolos especiales como !, @, #, $, %, etc.
      if (!/^[a-zA-Z0-9.-]+$/.test(domain)) return false;
      
      // Validar cada parte del dominio separada por puntos
      const domainParts = domain.split('.');
      if (domainParts.length < 2) return false;
      
      for (const part of domainParts) {
        if (part.length === 0) return false;
        if (part.startsWith('-') || part.endsWith('-')) return false;
        // Cada parte solo puede contener letras, números y guiones (NO puntos)
        if (!/^[a-zA-Z0-9-]+$/.test(part)) return false;
      }
      
      // La última parte (TLD) debe tener al menos 2 caracteres y solo letras
      const tld = domainParts[domainParts.length - 1];
      if (tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) return false;
      
      return true;
    })(),
    commonDomains: /\.(com|edu|org|net|gov|co|pe|es|mx|ar|cl|uy|bo|ec|ve|py|cr|gt|hn|ni|pa|sv|do|cu|pr|info|biz|mil|int)$/i.test(watchedEmail)
  };

  const isEmailValid = Object.values(emailValidations).every(Boolean);
  
  // Funciones de validación de contraseña
  const passwordValidations = {
    minLength: watchedPassword.length >= 8,
    hasUpperCase: /[A-Z]/.test(watchedPassword),
    hasLowerCase: /[a-z]/.test(watchedPassword),
    hasNumber: /\d/.test(watchedPassword),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(watchedPassword)
  };
  
  const isPasswordValid = Object.values(passwordValidations).every(Boolean);
  
  const isFormValid = isNombreValid && isEmailValid && isPasswordValid;
  
  // Redirigir al dashboard si ya está autenticado
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }
  
  // Manejar envío del formulario
  const onSubmit = async (data: RegisterFormData) => {
    // Verificar que todos los campos cumplan con los requisitos
    if (!isFormValid) {
      toast.error('Por favor, completa todos los campos correctamente.');
      return;
    }

    try {
      setIsSubmitting(true);
      clearError();
      await registerUser(data.nombre, data.email, data.password);
      toast.success('¡Registro exitoso! Ahora puedes iniciar sesión.');
      navigate('/login');
    } catch (err) {
      console.error('Error al registrarse:', err);
      toast.error('No se pudo completar el registro. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link to="/" className="flex items-center">
            <BookOpen className="h-10 w-10 text-blue-600" />
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Crear una cuenta
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Inicia sesión
          </Link>
        </p>
      </div>
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10"
        >
          {error && (
            <div className="mb-4 bg-red-50 p-4 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="nombre" className="form-label">
                🔒 Nombre completo
              </label>
              <input
                id="nombre"
                type="text"
                autoComplete="name"
                className={`form-input ${errors.nombre ? 'border-red-500' : watchedNombre && isNombreValid ? 'border-green-500' : ''}`}
                {...register('nombre', { 
                  required: 'El nombre es requerido',
                  validate: () => isNombreValid || 'El nombre no cumple con los requisitos de seguridad'
                })}
              />
              {errors.nombre && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.nombre.message}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="form-label">
                📧 Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={`form-input ${errors.email ? 'border-red-500' : watchedEmail && isEmailValid ? 'border-green-500' : ''}`}
                {...register('email', { 
                  required: 'El correo electrónico es requerido',
                  validate: () => isEmailValid || 'El correo electrónico no es válido'
                })}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
              
              {/* Validaciones visuales de email - Solo las 3 solicitadas */}
              {watchedEmail && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md border">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Requisitos de email:
                  </p>
                  <div className="space-y-1">
                    <div className="flex items-center text-xs">
                      {emailValidations.notEmpty ? (
                        <Check className="h-3 w-3 text-green-500 mr-2" />
                      ) : (
                        <X className="h-3 w-3 text-red-500 mr-2" />
                      )}
                      <span className={emailValidations.notEmpty ? 'text-green-600' : 'text-red-600'}>
                        No debe estar vacío
                      </span>
                    </div>
                    
                    <div className="flex items-center text-xs">
                      {emailValidations.validFormat ? (
                        <Check className="h-3 w-3 text-green-500 mr-2" />
                      ) : (
                        <X className="h-3 w-3 text-red-500 mr-2" />
                      )}
                      <span className={emailValidations.validFormat ? 'text-green-600' : 'text-red-600'}>
                        Formato de email válido
                      </span>
                    </div>
                    
                    <div className="flex items-center text-xs">
                      {emailValidations.commonDomains ? (
                        <Check className="h-3 w-3 text-green-500 mr-2" />
                      ) : (
                        <X className="h-3 w-3 text-red-500 mr-2" />
                      )}
                      <span className={emailValidations.commonDomains ? 'text-green-600' : 'text-red-600'}>
                        Dominio común (.com, .edu, .org, etc.)
                      </span>
                    </div>
                  </div>
                  
                  {/* Indicador general de validez para email */}
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="flex items-center text-xs">
                      {isEmailValid ? (
                        <>
                          <Check className="h-3 w-3 text-green-500 mr-2" />
                          <span className="text-green-600 font-medium">
                            ¡Email válido!
                          </span>
                        </>
                      ) : (
                        <>
                          <X className="h-3 w-3 text-red-500 mr-2" />
                          <span className="text-red-600 font-medium">
                            Completa todos los requisitos
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="form-label">
                🔐 Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                className={`form-input ${errors.password ? 'border-red-500' : watchedPassword && isPasswordValid ? 'border-green-500' : ''}`}
                {...register('password', { 
                  required: 'La contraseña es requerida',
                  validate: () => isPasswordValid || 'La contraseña no cumple con los requisitos de seguridad'
                })}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isSubmitting || !isFormValid}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                  ${(isSubmitting || !isFormValid) 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                  } 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registrando...
                  </span>
                ) : (
                  'Registrarse'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;