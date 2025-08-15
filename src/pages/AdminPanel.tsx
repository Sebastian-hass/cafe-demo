import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSignOutAlt, FaCog, FaUser } from 'react-icons/fa';
import { Toaster } from 'react-hot-toast';
import Login from '../components/admin/Login';
import Dashboard from '../components/admin/Dashboard';
import NotificationCenter from '../components/admin/NotificationCenter';

const AdminPanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un token guardado al cargar la página
    checkExistingAuth();
  }, []);

  const checkExistingAuth = () => {
    const savedToken = localStorage.getItem('admin_token');
    const savedUser = localStorage.getItem('admin_user');

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        clearAuth();
      }
    }
    
    setLoading(false);
  };

  const handleLogin = (newToken: string, userData: any) => {
    setToken(newToken);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    clearAuth();
    setIsAuthenticated(false);
  };

  const clearAuth = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setToken(null);
    setUser(null);
  };

  // Navbar del admin
  const AdminNavbar = () => (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white shadow-lg border-b border-gray-200"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo y título */}
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-coffee-600 to-coffee-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">☕</span>
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-gray-800">
                Panel de Administración
              </h1>
              <p className="text-sm text-gray-500">Café Demo</p>
            </div>
          </div>

          {/* User menu */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
              <FaUser className="text-coffee-600" />
              <span className="text-sm font-medium text-gray-700">
                {user?.username}
              </span>
            </div>

            {/* Notification Center */}
            <NotificationCenter token={token!} />

            <button className="p-2 text-gray-500 hover:text-coffee-600 transition-colors">
              <FaCog className="text-lg" />
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
            >
              <FaSignOutAlt />
              <span className="text-sm font-medium">Salir</span>
            </button>
          </div>
        </div>
      </div>
    </motion.nav>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-coffee-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-coffee-600 font-medium">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 4000,
          style: {
            background: '#8b4513',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '14px',
          },
        }}
      />
      
      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Login onLogin={handleLogin} />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen"
          >
            <AdminNavbar />
            <Dashboard token={token!} user={user} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPanel;
