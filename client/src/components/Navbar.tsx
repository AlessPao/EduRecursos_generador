import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, BookOpen, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
  };
  
  return (
    <nav className="bg-white fixed w-full z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <button 
              onClick={toggleSidebar}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-500 hover:bg-gray-100 focus:outline-none"
            >
              <Menu size={24} />
            </button>
            
            <Link to="/dashboard" className="flex-shrink-0 flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900 hidden sm:block">EduRecursos</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center">
            <div className="ml-4 flex items-center md:ml-6">
              <Link 
                to="/perfil" 
                className="ml-3 p-1 rounded-full text-gray-700 hover:text-blue-500 hover:bg-gray-100"
              >
                <User size={20} />
              </Link>
              
              <button
                onClick={handleLogout}
                className="ml-4 p-1 rounded-full text-gray-700 hover:text-blue-500 hover:bg-gray-100"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
          
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-500 hover:bg-gray-100 focus:outline-none"
            >
              {menuOpen ? <X size={24} /> : <User size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Menú móvil */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-md">
          <div className="pt-2 pb-3 space-y-1 border-t">
            <Link
              to="/perfil"
              className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-500"
              onClick={() => setMenuOpen(false)}
            >
              Mi Perfil
            </Link>
            
            <button
              onClick={() => {
                setMenuOpen(false);
                handleLogout();
              }}
              className="block w-full text-left px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-500"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;