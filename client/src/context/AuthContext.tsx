import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

// Tipos
interface User {
  id: number;
  nombre: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  token: string | null; // Añadir token al contexto
  login: (email: string, password: string) => Promise<void>;
  register: (nombre: string, email: string, password: string, consentTimestamp: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  // Configurar Axios para enviar el token con cada solicitud si está disponible
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token); // Guardar/actualizar en localStorage
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token'); // Eliminar de localStorage
    }
  }, [token]); // Este efecto se ejecuta cada vez que el token cambia

  // Comprobar si el usuario está autenticado al cargar la aplicación
  useEffect(() => {
    const checkAuthStatus = async () => {
      if (token) { // Solo intentar cargar el perfil si hay un token
        setLoading(true);
        try {
          // El token ya está en axios.defaults.headers.common gracias al efecto anterior
          const res = await axios.get(`${API_URL}/auth/profile`);
          if (res.data.success) {
            setUser(res.data.usuario);
          } else {
            // Token podría ser inválido o expirado
            setUser(null);
            setToken(null); // Limpiar token inválido
          }
        } catch (err) {
          setUser(null);
          setToken(null); // Limpiar token si hay error (ej. 401, 403)
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []); // Ejecutar solo una vez al montar, el efecto del token se encarga de las actualizaciones de token

  // Iniciar sesión
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      
      if (res.data.success && res.data.token) {
        setUser(res.data.usuario);
        setToken(res.data.token); // Esto disparará el useEffect para localStorage y axios defaults
      } else {
        // Si no hay token en la respuesta, o success es false
        setError(res.data.message || 'Error al iniciar sesión: Respuesta inesperada del servidor');
        setUser(null);
        setToken(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
      setUser(null);
      setToken(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Registrar nuevo usuario
  const register = async (nombre: string, email: string, password: string, consentTimestamp: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Enviar el timestamp del consentimiento junto con los datos de registro
      await axios.post(`${API_URL}/auth/register`, { 
        nombre, 
        email, 
        password, 
        privacyConsentTimestamp: consentTimestamp 
      });
      // Podrías querer llamar a login() aquí si el backend devuelve un token al registrar
      // o simplemente mostrar un mensaje de éxito para que el usuario inicie sesión.
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrarse');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cerrar sesión
  const logout = async () => {
    try {
      setLoading(true);
      // Opcional: llamar al endpoint de logout del backend si implementa blacklist de tokens
      // await axios.post(`${API_URL}/auth/logout`); 
      setUser(null);
      setToken(null); // Esto disparará el useEffect para localStorage y axios defaults
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cerrar sesión');
      // Aún así, limpiar el estado local
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  // Limpiar errores
  const clearError = () => setError(null);

  const value = {
    user,
    loading,
    isAuthenticated: !!user && !!token, // Autenticado si hay usuario Y token
    token, // Exponer token para quien lo necesite (aunque axios ya lo usa)
    login,
    register,
    logout,
    error,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};