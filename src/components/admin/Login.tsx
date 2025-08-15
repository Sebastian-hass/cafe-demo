import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaCoffee } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

interface LoginProps {
  onLogin: (token: string, user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/admin/login', credentials);
      
      if (response.data.access_token) {
        localStorage.setItem('admin_token', response.data.access_token);
        localStorage.setItem('admin_user', JSON.stringify(response.data.user));
        
        toast.success('¡Bienvenido al panel de administrador!');
        onLogin(response.data.access_token, response.data.user);
      }
    } catch (error: any) {
      console.error('Error de login:', error);
      toast.error(error.response?.data?.detail || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-100 via-cream-50 to-coffee-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-coffee-900/5 via-transparent to-coffee-900/5" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative z-10"
      >
        {/* Logo y título */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-coffee-600 to-coffee-800 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
            <FaCoffee className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-display font-bold text-coffee-900 mb-2">
            Panel de Admin
          </h1>
          <p className="text-coffee-600">
            Accede al sistema de gestión
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campo Usuario */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-sm font-semibold text-coffee-700 mb-2">
              Usuario
            </label>
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-coffee-400" />
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({
                  ...credentials,
                  username: e.target.value
                })}
                className="w-full pl-10 pr-4 py-3 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent transition-all outline-none"
                placeholder="Ingresa tu usuario"
                required
              />
            </div>
          </motion.div>

          {/* Campo Contraseña */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label className="block text-sm font-semibold text-coffee-700 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-coffee-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={credentials.password}
                onChange={(e) => setCredentials({
                  ...credentials,
                  password: e.target.value
                })}
                className="w-full pl-10 pr-12 py-3 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent transition-all outline-none"
                placeholder="Ingresa tu contraseña"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-coffee-400 hover:text-coffee-600 transition-colors"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </motion.div>

          {/* Información de demo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-coffee-50 border border-coffee-200 rounded-lg p-4"
          >
            <p className="text-sm text-coffee-700 text-center">
              <strong>Demo:</strong> admin / admin123
            </p>
          </motion.div>

          {/* Botón de login */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || !credentials.username || !credentials.password}
            className="w-full bg-gradient-to-r from-coffee-600 to-coffee-700 text-white py-3 px-6 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Accediendo...</span>
              </>
            ) : (
              <>
                <span>Iniciar Sesión</span>
                <FaCoffee />
              </>
            )}
          </motion.button>
        </form>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center text-sm text-coffee-500"
        >
          <p>© 2024 Café Demo - Panel de Administración</p>
        </motion.div>
      </motion.div>

      {/* Elementos decorativos */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-coffee-200 rounded-full opacity-20 animate-pulse" />
      <div className="absolute bottom-10 right-10 w-16 h-16 bg-coffee-300 rounded-full opacity-30 animate-bounce" />
      <div className="absolute top-1/2 left-5 w-8 h-8 bg-coffee-400 rounded-full opacity-25" />
    </div>
  );
};

export default Login;
