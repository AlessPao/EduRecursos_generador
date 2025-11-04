import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
  title?: string;
}

const Toast: React.FC<ToastProps> = ({ 
  message, 
  type, 
  onClose, 
  duration = 4000,
  title 
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const config = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-500',
      textColor: 'text-green-900',
      iconColor: 'text-green-500',
      titleColor: 'text-green-900',
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-500',
      textColor: 'text-red-900',
      iconColor: 'text-red-500',
      titleColor: 'text-red-900',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-500',
      textColor: 'text-yellow-900',
      iconColor: 'text-yellow-500',
      titleColor: 'text-yellow-900',
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-900',
      iconColor: 'text-blue-500',
      titleColor: 'text-blue-900',
    },
  };

  const { icon: Icon, bgColor, borderColor, textColor, iconColor, titleColor } = config[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      className={`${bgColor} ${borderColor} border-l-4 rounded-lg shadow-lg p-4 mb-3 max-w-md w-full`}
    >
      <div className="flex items-start">
        <Icon className={`${iconColor} mt-0.5 mr-3 flex-shrink-0`} size={24} />
        <div className="flex-1">
          {title && (
            <h4 className={`${titleColor} font-semibold mb-1`}>{title}</h4>
          )}
          <p className={`${textColor} text-sm`}>{message}</p>
        </div>
        <button
          onClick={onClose}
          className={`${textColor} hover:opacity-70 ml-3 flex-shrink-0`}
        >
          <X size={20} />
        </button>
      </div>
    </motion.div>
  );
};

interface ToastContainerProps {
  toasts: Array<{
    id: string;
    message: string;
    type: ToastType;
    title?: string;
    duration?: number;
  }>;
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-20 right-4 z-[100] space-y-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            title={toast.title}
            duration={toast.duration}
            onClose={() => onRemove(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Hook personalizado para manejar toasts
export const useToast = () => {
  const [toasts, setToasts] = React.useState<Array<{
    id: string;
    message: string;
    type: ToastType;
    title?: string;
    duration?: number;
  }>>([]);

  const addToast = (
    message: string, 
    type: ToastType = 'info', 
    title?: string, 
    duration?: number
  ) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type, title, duration }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return {
    toasts,
    addToast,
    removeToast,
    success: (message: string, title?: string) => addToast(message, 'success', title),
    error: (message: string, title?: string) => addToast(message, 'error', title),
    warning: (message: string, title?: string) => addToast(message, 'warning', title),
    info: (message: string, title?: string) => addToast(message, 'info', title),
  };
};

export default Toast;
