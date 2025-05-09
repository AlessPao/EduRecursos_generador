import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API_URL } from '../config';
import { formatDate } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { User } from 'lucide-react';

const Perfil: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    total: 0,
    comprension: 0,
    escritura: 0,
    gramatica: 0,
    oral: 0
  });
  
  // Cargar datos del perfil y estadísticas
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        
        // Cargar perfil
        const profileRes = await axios.get(`${API_URL}/auth/profile`);
        if (profileRes.data.success) {
          setProfile(profileRes.data.usuario);
        }
        
        // Cargar recursos para estadísticas
        const recursosRes = await axios.get(`${API_URL}/recursos`);
        if (recursosRes.data.success) {
          const recursos = recursosRes.data.recursos;
          
          // Calcular estadísticas
          setStats({
            total: recursos.length,
            comprension: recursos.filter((r: any) => r.tipo === 'comprension').length,
            escritura: recursos.filter((r: any) => r.tipo === 'escritura').length,
            gramatica: recursos.filter((r: any) => r.tipo === 'gramatica').length,
            oral: recursos.filter((r: any) => r.tipo === 'oral').length
          });
        }
      } catch (error) {
        console.error('Error al cargar datos del perfil:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="pt-20 pb-6">
      <h1 className="text-2xl font-bold mb-6">Mi Perfil</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información del perfil */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-2"
        >
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start mb-6">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                <User size={32} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{profile?.nombre}</h2>
                <p className="text-gray-600">{profile?.email}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Miembro desde {formatDate(profile?.createdAt)}
                </p>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-3">Información de la cuenta</h3>
              
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="text-sm text-gray-500">Nombre completo</div>
                  <div>{profile?.nombre}</div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="text-sm text-gray-500">Correo electrónico</div>
                  <div>{profile?.email}</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Estadísticas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Mis estadísticas</h3>
            
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-gray-600">Recursos totales</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <div className="text-lg font-semibold text-blue-600">{stats.comprension}</div>
                  <div className="text-xs text-gray-600">Comprensión lectora</div>
                </div>
                
                <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                  <div className="text-lg font-semibold text-green-600">{stats.escritura}</div>
                  <div className="text-xs text-gray-600">Producción escrita</div>
                </div>
                
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                  <div className="text-lg font-semibold text-orange-600">{stats.gramatica}</div>
                  <div className="text-xs text-gray-600">Gramática y ortografía</div>
                </div>
                
                <div className="bg-violet-50 p-3 rounded-lg border border-violet-100">
                  <div className="text-lg font-semibold text-violet-600">{stats.oral}</div>
                  <div className="text-xs text-gray-600">Comunicación oral</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Perfil;