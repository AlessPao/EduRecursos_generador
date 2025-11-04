import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Shield, CheckCircle2, AlertCircle } from 'lucide-react';

const PrivacyConsent: React.FC = () => {
  const navigate = useNavigate();
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!consentAccepted) {
      return;
    }

    setIsSubmitting(true);
    
    // Obtener la fecha y hora exactas del consentimiento
    const consentTimestamp = new Date().toISOString();
    
    // Guardar el timestamp en localStorage para pasarlo al registro
    localStorage.setItem('privacyConsentTimestamp', consentTimestamp);
    
    // Redirigir al formulario de registro
    setTimeout(() => {
      navigate('/register');
    }, 300);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-3xl">
        <div className="flex justify-center">
          <Link to="/" className="flex items-center">
            <BookOpen className="h-10 w-10 text-blue-600" />
          </Link>
        </div>
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Aviso de Privacidad y Consentimiento Informado
          </h1>
          <h2 className="text-xl text-gray-700 mt-2">
            EduRecursos
          </h2>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white py-8 px-6 shadow-lg sm:rounded-lg sm:px-10"
        >
          <div className="prose prose-sm max-w-none">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6">
              <p className="text-sm text-gray-800 leading-relaxed">
                Para crear tu cuenta de docente en <strong>EduRecursos</strong>, necesitamos tu consentimiento explícito para el tratamiento de tus datos personales, conforme a la <strong>Ley N.º 29733 – Ley de Protección de Datos Personales</strong>.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 mr-3 text-sm font-bold">1</span>
                  ¿Qué datos recolectamos?
                </h3>
                <p className="text-gray-700 leading-relaxed ml-11">
                  Recolectamos únicamente la información indispensable para el funcionamiento del sistema:
                </p>
                <ul className="list-disc list-inside ml-11 mt-2 text-gray-700 space-y-1">
                  <li>Nombre</li>
                  <li>Correo electrónico</li>
                  <li>Credenciales (contraseña)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 mr-3 text-sm font-bold">2</span>
                  ¿Con qué propósito?
                </h3>
                <p className="text-gray-700 leading-relaxed ml-11">
                  Tus datos serán utilizados exclusivamente para:
                </p>
                <ul className="list-disc list-inside ml-11 mt-2 text-gray-700 space-y-1">
                  <li>Autenticación y gestión de tu cuenta de usuario.</li>
                  <li>Personalización de los recursos educativos que generes en la plataforma.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 mr-3 text-sm font-bold">3</span>
                  Transferencia Internacional de Datos
                </h3>
                <div className="ml-11 bg-amber-50 border border-amber-200 rounded-md p-4">
                  <p className="text-gray-800 leading-relaxed">
                    Tus datos personales (nombre, correo y credenciales) serán almacenados en los servidores de <strong>Railway</strong>, ubicados en <strong>Virginia, Estados Unidos (EE. UU.)</strong>
                  </p>
                  <p className="text-gray-800 leading-relaxed mt-2">
                    Esta transferencia es necesaria para garantizar el alojamiento y correcto funcionamiento del sistema.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 mr-3 text-sm font-bold">4</span>
                  Tus Derechos (ARCO)
                </h3>
                <p className="text-gray-700 leading-relaxed ml-11">
                  Como titular de los datos, puedes ejercer tus derechos de <strong>Acceso, Rectificación, Cancelación u Oposición (ARCO)</strong> en cualquier momento.
                </p>
                <p className="text-gray-700 leading-relaxed ml-11 mt-2">
                  Podrás modificar tus datos o solicitar la eliminación de tu cuenta desde tu perfil o comunicándote con soporte.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 mr-3 text-sm font-bold">5</span>
                  Más Información
                </h3>
                <p className="text-gray-700 leading-relaxed ml-11">
                  Para conocer en detalle cómo tratamos tu información, consulta nuestra{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-700 font-medium underline">
                    Política de Privacidad y Términos de Uso
                  </a>
                  {' '}(enlace pendiente de agregar).
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-8">
              <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6">
                <div className="flex items-start">
                  <div className="flex items-center h-6">
                    <input
                      id="consent"
                      name="consent"
                      type="checkbox"
                      checked={consentAccepted}
                      onChange={(e) => setConsentAccepted(e.target.checked)}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                    />
                  </div>
                  <div className="ml-4">
                    <label htmlFor="consent" className="text-base font-medium text-gray-900 cursor-pointer select-none">
                      Acepto el tratamiento de mis datos personales y autorizo su transferencia internacional a los servidores de Railway (EE. UU.).
                    </label>
                  </div>
                </div>

                {consentAccepted && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 flex items-center text-sm text-green-700 bg-green-50 p-3 rounded-md"
                  >
                    <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span>Tu consentimiento será registrado con fecha y hora exactas.</span>
                  </motion.div>
                )}

                {!consentAccepted && (
                  <div className="mt-4 flex items-start text-sm text-gray-600">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Debes aceptar el tratamiento de tus datos para continuar con el registro.</span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!consentAccepted || isSubmitting}
                  className={`flex-1 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                    ${(!consentAccepted || isSubmitting)
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                    } 
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Procesando...
                    </span>
                  ) : (
                    'Aceptar y continuar'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ¿Ya tienes una cuenta?{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Inicia sesión
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-6 text-center text-xs text-gray-500">
        <p>© {new Date().getFullYear()} EduRecursos. Todos los derechos reservados.</p>
        <p className="mt-1">Cumplimiento de Ley N.º 29733 – Ley de Protección de Datos Personales (Perú)</p>
      </div>
    </div>
  );
};

export default PrivacyConsent;
