import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BookOpen, List, User, X, ClipboardList, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
    isOpen: boolean;
    closeSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, closeSidebar }) => {
    const { logout } = useAuth();

    // Enlaces del menú
    const menuItems = [
        { path: '/dashboard', label: 'Inicio', icon: <Home size={20} /> },
        { path: '/recursos', label: 'Mis Recursos', icon: <List size={20} /> },
        { path: '/evaluaciones', label: 'Evaluaciones', icon: <ClipboardList size={20} /> },
        { path: '/perfil', label: 'Mi Perfil', icon: <User size={20} /> }
    ];

    // Animación sidebar móvil
    const sidebarVariants = {
        open: {
            x: 0,
            transition: { type: 'spring', stiffness: 300, damping: 30 }
        },
        closed: {
            x: '-100%',
            transition: { type: 'spring', stiffness: 300, damping: 30 }
        }
    };

    // Contenido compartido
    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* HEADER — solo móvil */}
            <div className="flex items-center p-6 border-b border-slate-100 dark:border-slate-700 md:hidden">
                <div className="bg-indigo-600 dark:bg-indigo-500 p-1.5 rounded-lg mr-3">
                    <BookOpen className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">EduRecursos</span>

                <button
                    onClick={closeSidebar}
                    className="ml-auto p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                    <X size={20} />
                </button>
            </div>

            {/* NAVEGACIÓN */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                <div className="mb-2 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Menu Principal
                </div>

                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={closeSidebar}
                        className={({ isActive }) =>
                            `flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 group ${isActive
                                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium shadow-sm'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <span
                                    className={`mr-3 transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                                        }`}
                                >
                                    {item.icon}
                                </span>
                                <span>{item.label}</span>

                                {isActive && (
                                    <motion.div
                                        layoutId="activeIndicator"
                                        className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600"
                                    />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* LOGOUT */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-700">
                <button
                    onClick={logout}
                    className="flex items-center w-full px-4 py-3 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 dark:hover:text-rose-400 transition-colors group"
                >
                    <LogOut
                        size={20}
                        className="mr-3 text-slate-400 dark:text-slate-500 group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors"
                    />
                    <span className="font-medium">Cerrar Sesión</span>
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Overlay móvil */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeSidebar}
                        className="md:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar móvil */}
            <motion.aside
                variants={sidebarVariants}
                initial="closed"
                animate={isOpen ? 'open' : 'closed'}
                className="md:hidden fixed top-16 left-0 z-50 w-72 h-[calc(100vh-64px)] bg-white dark:bg-slate-900 shadow-2xl"
            >
                <SidebarContent />
            </motion.aside>

            {/* Sidebar desktop */}
            <aside className="hidden md:block w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 h-[calc(100vh-64px)]">
                <SidebarContent />
            </aside>
        </>
    );
};

export default Sidebar;
