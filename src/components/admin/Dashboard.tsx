import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaUsers, 
  FaBoxOpen, 
  FaStar, 
  FaTags, 
  FaChartLine, 
  FaClock, 
  FaPlus,
  FaEye,
  FaHome,
  FaEnvelope,
  FaBriefcase,
  FaShoppingCart,
  FaCalendarAlt,
  FaNewspaper
} from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';
import toast from 'react-hot-toast';
import ProductManagement from './ProductManagement';
import SpecialsManagement from './SpecialsManagement';
import ContactNewsletterManagement from './ContactNewsletterManagement';
import JobApplicationsManagement from './JobApplicationsManagement';
import OrdersManagement from './OrdersManagement';
import CategoriesManagement from './CategoriesManagement';
import ReservationsManagement from './ReservationsManagement';
import NewsManagement from './NewsManagement';

import { API_URL } from '../../config/api';
interface DashboardProps {
  token: string;
  user: any;
}

interface DashboardStats {
  total_products: number;
  active_specials: number;
  total_categories: number;
  recent_activity: Array<{
    action: string;
    item: string;
    time: string;
  }>;
}

const Dashboard: React.FC<DashboardProps> = ({ token, user }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'dashboard' | 'products' | 'specials' | 'contacts' | 'jobs' | 'orders' | 'categories' | 'reservations' | 'news'>('dashboard');

  // Datos de ejemplo para los gráficos
  const salesData = [
    { name: 'Lun', ventas: 65, pedidos: 12 },
    { name: 'Mar', ventas: 78, pedidos: 15 },
    { name: 'Mie', ventas: 82, pedidos: 18 },
    { name: 'Jue', ventas: 95, pedidos: 22 },
    { name: 'Vie', ventas: 110, pedidos: 25 },
    { name: 'Sab', ventas: 125, pedidos: 28 },
    { name: 'Dom', ventas: 88, pedidos: 20 },
  ];

  const categoryData = [
    { name: 'Bebidas', value: 45, color: '#8b4513' },
    { name: 'Panadería', value: 30, color: '#d2691e' },
    { name: 'Postres', value: 25, color: '#deb887' },
  ];

  const productData = [
    { name: 'Cappuccino', ventas: 89 },
    { name: 'Americano', ventas: 76 },
    { name: 'Latte', ventas: 65 },
    { name: 'Croissant', ventas: 54 },
    { name: 'Brownie', ventas: 43 },
  ];

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setStats(response.data);
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      toast.error('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon, title, value, color, change }: any) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={`bg-gradient-to-br ${color} p-6 rounded-xl shadow-lg text-white relative overflow-hidden`}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 bg-white/20 rounded-lg`}>
            {icon}
          </div>
          {change && (
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
              {change}
            </span>
          )}
        </div>
        <h3 className="text-lg font-semibold opacity-90">{title}</h3>
        <p className="text-3xl font-bold">{value}</p>
      </div>
      <div className="absolute -bottom-4 -right-4 text-6xl opacity-10">
        {icon}
      </div>
    </motion.div>
  );

  const QuickActionCard = ({ icon, title, description, onClick, color }: any) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 cursor-pointer hover:shadow-xl transition-all"
    >
      <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-coffee-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-coffee-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  // Navegación de secciones
  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <FaHome /> },
    { id: 'products', name: 'Productos', icon: <FaBoxOpen /> },
    { id: 'categories', name: 'Categorías', icon: <FaTags /> },
    { id: 'specials', name: 'Especiales', icon: <FaStar /> },
    { id: 'orders', name: 'Pedidos', icon: <FaShoppingCart /> },
    { id: 'reservations', name: 'Reservas', icon: <FaCalendarAlt /> },
    { id: 'news', name: 'Noticias', icon: <FaNewspaper /> },
    { id: 'contacts', name: 'Contactos', icon: <FaEnvelope /> },
    { id: 'jobs', name: 'Solicitudes', icon: <FaBriefcase /> }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'products':
        return <ProductManagement token={token} />;
      case 'categories':
        return <CategoriesManagement token={token} />;
      case 'specials':
        return <SpecialsManagement token={token} />;
      case 'orders':
        return <OrdersManagement token={token} />;
      case 'reservations':
        return <ReservationsManagement token={token} />;
      case 'contacts':
        return <ContactNewsletterManagement token={token} />;
      case 'jobs':
        return <JobApplicationsManagement token={token} />;
      case 'news':
        return <NewsManagement token={token} />;
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <>
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<FaBoxOpen className="text-2xl" />}
          title="Productos"
          value={stats?.total_products || 0}
          color="from-blue-500 to-blue-600"
          change="+5 esta semana"
        />
        <StatCard
          icon={<FaStar className="text-2xl" />}
          title="Especiales"
          value={stats?.active_specials || 0}
          color="from-green-500 to-green-600"
          change="Activos hoy"
        />
        <StatCard
          icon={<FaTags className="text-2xl" />}
          title="Categorías"
          value={stats?.total_categories || 0}
          color="from-purple-500 to-purple-600"
          change="Completas"
        />
        <StatCard
          icon={<FaUsers className="text-2xl" />}
          title="Visitas Hoy"
          value="234"
          color="from-orange-500 to-orange-600"
          change="+15%"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-lg"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <FaChartLine className="mr-2 text-coffee-600" />
            Ventas Semanales
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="ventas" 
                stroke="#8b4513" 
                strokeWidth={3}
                dot={{ fill: '#8b4513' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-xl shadow-lg"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <FaTags className="mr-2 text-coffee-600" />
            Distribución por Categoría
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-lg"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <FaStar className="mr-2 text-coffee-600" />
            Productos Más Vendidos
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="ventas" fill="#8b4513" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-xl shadow-lg"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <FaClock className="mr-2 text-coffee-600" />
            Actividad Reciente
          </h3>
          <div className="space-y-4">
            {stats?.recent_activity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-coffee-600 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    {activity.action}: <span className="text-coffee-600">{activity.item}</span>
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white p-6 rounded-xl shadow-lg"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-6">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <QuickActionCard
            icon={<FaPlus className="text-white text-xl" />}
            title="Nuevo Producto"
            description="Agregar un producto al menú"
            color="bg-green-500"
            onClick={() => setActiveSection('products')}
          />
          <QuickActionCard
            icon={<FaStar className="text-white text-xl" />}
            title="Crear Especial"
            description="Configurar oferta especial"
            color="bg-yellow-500"
            onClick={() => setActiveSection('specials')}
          />
          <QuickActionCard
            icon={<FaEye className="text-white text-xl" />}
            title="Ver Sitio Web"
            description="Previsualizar el sitio público"
            color="bg-blue-500"
            onClick={() => window.open('/', '_blank')}
          />
          <QuickActionCard
            icon={<FaEnvelope className="text-white text-xl" />}
            title="Gestionar Contactos"
            description="Ver mensajes y newsletter"
            color="bg-purple-500"
            onClick={() => setActiveSection('contacts')}
          />
          <QuickActionCard
            icon={<FaBriefcase className="text-white text-xl" />}
            title="Ver Solicitudes"
            description="Gestionar aplicaciones de empleo"
            color="bg-indigo-500"
            onClick={() => setActiveSection('jobs')}
          />
        </div>
      </motion.div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-display font-bold text-gray-800 mb-2"
          >
            ¡Bienvenido, {user.username}! ☕
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600"
          >
            Panel de administración - Café Demo
          </motion.p>
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <nav className="bg-white p-2 rounded-xl shadow-lg">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:flex xl:flex-wrap gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as any)}
                  className={`flex items-center justify-center xl:justify-start space-x-2 px-3 py-2 xl:px-4 xl:py-3 rounded-lg font-semibold transition-all text-sm xl:text-base ${
                    activeSection === item.id
                      ? 'bg-coffee-600 text-white shadow-lg'
                      : 'text-coffee-600 hover:bg-coffee-50'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="hidden sm:inline">{item.name}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;
