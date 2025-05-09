import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BookOpen, List, User, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, closeSidebar }) => {
  // Enlaces del menú
  const menuItems = [
    { path: '/dashboard', label: 'Inicio', icon: <Home size={20} /> },
    { path: '/recursos', label: 'Mis Recursos', icon: <List size={20} /> },
    { path: '/perfil', label: 'Mi Perfil', icon: <User size={20} /> }
  ];
  
  // Variantes de animación
  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      x: '-100%',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    }
  };
  
  return (
    <>
      {/* Overlay para móviles */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="md:hidden fixed inset-0 z-20 bg-black bg-opacity-50"
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar para móviles */}
      <motion.aside
        variants={sidebarVariants}
        initial="closed"
        animate={isOpen ? 'open' : 'closed'}
        className="md:hidden fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg overflow-y-auto"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <BookOpen className="h-7 w-7 text-blue-600" />
            <span className="ml-2 text-lg font-bold">EduRecursos</span>
          </div>
          <button 
            onClick={closeSidebar}
            className="p-1 rounded-full text-gray-700 hover:text-blue-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="mt-4 px-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeSidebar}
              className={({ isActive }) => 
                `flex items-center px-4 py-3 mb-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              {item.icon}
              <span className="ml-3">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </motion.aside>
      
      {/* Sidebar para desktop */}
      <aside className="hidden md:block w-64 bg-white shadow-sm overflow-y-auto">
        <div className="flex items-center p-4 border-b">
          <BookOpen className="h-6 w-6 text-blue-600" />
          <span className="ml-2 text-lg font-bold">EduRecursos</span>
        </div>
        
        <nav className="mt-4 px-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center px-4 py-3 mb-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              {item.icon}
              <span className="ml-3">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;