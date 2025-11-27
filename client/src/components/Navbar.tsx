import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, BookOpen, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md fixed w-full z-30 border-b border-slate-200 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 focus:outline-none transition-colors"
            >
              <Menu size={24} />
            </button>

            <Link to="/dashboard" className="flex-shrink-0 flex items-center ml-2 md:ml-0 group">
              <div className="bg-indigo-600 p-1.5 rounded-lg mr-2 group-hover:bg-indigo-700 transition-colors">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800 tracking-tight group-hover:text-indigo-700 transition-colors">EduRecursos</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center">
            <div className="ml-4 flex items-center md:ml-6">
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-50 transition-colors focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                    {user?.nombre?.charAt(0) || 'U'}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{user?.nombre || 'Usuario'}</span>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.1 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 ring-1 ring-black ring-opacity-5 focus:outline-none"
                    >
                      <Link
                        to="/perfil"
                        className="flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                        onClick={() => setProfileOpen(false)}
                      >
                        <User size={16} className="mr-2" />
                        Mi Perfil
                      </Link>
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          handleLogout();
                        }}
                        className="flex w-full items-center px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut size={16} className="mr-2" />
                        Cerrar Sesión
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 focus:outline-none transition-colors"
            >
              {menuOpen ? <X size={24} /> : <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">{user?.nombre?.charAt(0) || 'U'}</div>}
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-200 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              <div className="flex items-center px-4 py-3 mb-2 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200 mr-3">
                  {user?.nombre?.charAt(0) || 'U'}
                </div>
                <div>
                  <div className="font-medium text-slate-900">{user?.nombre || 'Usuario'}</div>
                  <div className="text-xs text-slate-500">{user?.email || 'usuario@email.com'}</div>
                </div>
              </div>

              <Link
                to="/perfil"
                className="flex items-center px-4 py-3 text-base font-medium text-slate-600 rounded-xl hover:bg-slate-50 hover:text-indigo-600"
                onClick={() => setMenuOpen(false)}
              >
                <User size={20} className="mr-3" />
                Mi Perfil
              </Link>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="flex w-full items-center px-4 py-3 text-base font-medium text-rose-600 rounded-xl hover:bg-rose-50"
              >
                <LogOut size={20} className="mr-3" />
                Cerrar Sesión
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;