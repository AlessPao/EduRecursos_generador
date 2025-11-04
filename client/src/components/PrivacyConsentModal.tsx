import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface PrivacyConsentModalProps {
  isOpen: boolean;
  onAccept: (timestamp: string) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const PrivacyConsentModal: React.FC<PrivacyConsentModalProps> = ({ 
  isOpen, 
  onAccept, 
  onCancel,
  isSubmitting = false
}) => {
  const [consentAccepted, setConsentAccepted] = useState(false);

  const handleAccept = () => {
    if (!consentAccepted) return;
    
    // Capturar la fecha y hora exactas del consentimiento
    const timestamp = new Date().toISOString();
    onAccept(timestamp);
  };

  const handleCancel = () => {
    setConsentAccepted(false);
    onCancel();
  };

  // Resetear el checkbox cuando se cierra el modal
  React.useEffect(() => {
    if (!isOpen) {
      setConsentAccepted(false);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay de fondo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={handleCancel}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Shield className="h-8 w-8 text-white" />
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Aviso de Privacidad y Consentimiento Informado
                    </h2>
                    <p className="text-blue-100 text-sm">EduRecursos</p>
                  </div>
                </div>
                <button
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="text-white hover:bg-blue-800 rounded-full p-1 transition-colors disabled:opacity-50"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Contenido scrolleable */}
              <div className="px-6 py-6 overflow-y-auto max-h-[calc(90vh-280px)]">
                <div className="space-y-6">
                  <div className="bg-blue-50 border-l-4 border-blue-600 p-4">
                    <p className="text-sm text-gray-800 leading-relaxed">
                      Para completar tu registro en <strong>EduRecursos</strong>, necesitamos tu consentimiento explícito para el tratamiento de tus datos personales, conforme a la <strong>Ley N.º 29733 – Ley de Protección de Datos Personales</strong>.
                    </p>
                  </div>

                  {/* Sección 1 */}
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 flex items-center mb-3">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-600 mr-3 text-sm font-bold">1</span>
                      ¿Qué datos recolectamos?
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed ml-10">
                      Recolectamos únicamente la información indispensable para el funcionamiento del sistema:
                    </p>
                    <ul className="list-disc list-inside ml-10 mt-2 text-sm text-gray-700 space-y-1">
                      <li>Nombre</li>
                      <li>Correo electrónico</li>
                      <li>Credenciales (contraseña)</li>
                    </ul>
                  </div>

                  {/* Sección 2 */}
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 flex items-center mb-3">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-600 mr-3 text-sm font-bold">2</span>
                      ¿Con qué propósito?
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed ml-10">
                      Tus datos serán utilizados exclusivamente para:
                    </p>
                    <ul className="list-disc list-inside ml-10 mt-2 text-sm text-gray-700 space-y-1">
                      <li>Autenticación y gestión de tu cuenta de usuario.</li>
                      <li>Personalización de los recursos educativos que generes en la plataforma.</li>
                    </ul>
                  </div>

                  {/* Sección 3 */}
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 flex items-center mb-3">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-600 mr-3 text-sm font-bold">3</span>
                      Transferencia Internacional de Datos
                    </h3>
                    <div className="ml-10 bg-amber-50 border border-amber-200 rounded-md p-3">
                      <p className="text-sm text-gray-800 leading-relaxed">
                        Tus datos personales (nombre, correo y credenciales) serán almacenados en los servidores de <strong>Railway</strong>, ubicados en <strong>Virginia, Estados Unidos (EE. UU.)</strong>
                      </p>
                      <p className="text-sm text-gray-800 leading-relaxed mt-2">
                        Esta transferencia es necesaria para garantizar el alojamiento y correcto funcionamiento del sistema.
                      </p>
                    </div>
                  </div>

                  {/* Sección 4 */}
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 flex items-center mb-3">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-600 mr-3 text-sm font-bold">4</span>
                      Tus Derechos (ARCO)
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed ml-10">
                      Como titular de los datos, puedes ejercer tus derechos de <strong>Acceso, Rectificación, Cancelación u Oposición (ARCO)</strong> en cualquier momento.
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed ml-10 mt-2">
                      Podrás modificar tus datos o solicitar la eliminación de tu cuenta desde tu perfil o comunicándote con soporte.
                    </p>
                  </div>

                  {/* Sección 5 */}
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 flex items-center mb-3">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-600 mr-3 text-sm font-bold">5</span>
                      Más Información
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed ml-10">
                      Para conocer en detalle cómo tratamos tu información, consulta nuestra{' '}
                      <a href="#" className="text-blue-600 hover:text-blue-700 font-medium underline">
                        Política de Privacidad y Términos de Uso
                      </a>
                      {' '}(enlace pendiente de agregar).
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer con checkbox y botones */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                {/* Checkbox de aceptación */}
                <div className="mb-4">
                  <div className="flex items-start">
                    <div className="flex items-center h-6">
                      <input
                        id="consent-modal"
                        name="consent-modal"
                        type="checkbox"
                        checked={consentAccepted}
                        onChange={(e) => setConsentAccepted(e.target.checked)}
                        disabled={isSubmitting}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer disabled:opacity-50"
                      />
                    </div>
                    <div className="ml-3">
                      <label htmlFor="consent-modal" className="text-sm font-medium text-gray-900 cursor-pointer select-none">
                        Acepto el tratamiento de mis datos personales y autorizo su transferencia internacional a los servidores de Railway (EE. UU.).
                      </label>
                    </div>
                  </div>

                  {consentAccepted && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.2 }}
                      className="mt-3 flex items-center text-sm text-green-700 bg-green-50 p-2 rounded-md"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>Tu consentimiento será registrado con fecha y hora exactas.</span>
                    </motion.div>
                  )}

                  {!consentAccepted && !isSubmitting && (
                    <div className="mt-3 flex items-start text-xs text-gray-600">
                      <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Debes aceptar el tratamiento de tus datos para completar el registro.</span>
                    </div>
                  )}
                </div>

                {/* Botones */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleAccept}
                    disabled={!consentAccepted || isSubmitting}
                    className={`flex-1 py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                      ${(!consentAccepted || isSubmitting)
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                      } 
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Registrando...
                      </span>
                    ) : (
                      'Aceptar y registrarme'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PrivacyConsentModal;
