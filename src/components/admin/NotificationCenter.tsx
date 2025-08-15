import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBell, 
  FaCheck, 
  FaTimes, 
  FaTrash, 
  FaEnvelope, 
  FaNewspaper,
  FaCalendarAlt,
  FaShoppingCart,
  FaCircle
} from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

import { API_URL } from '../../config/api';
interface NotificationCenterProps {
  token: string;
}

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  related_id?: number;
  is_read: boolean;
  created_at: string;
}

interface UnreadCounts {
  total_unread: number;
  by_type: Record<string, number>;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ token }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<UnreadCounts>({ total_unread: 0, by_type: {} });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUnreadCounts();
    // Actualizar cada 30 segundos
    const interval = setInterval(fetchUnreadCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/admin/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCounts = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/notifications/unread`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUnreadCounts(response.data);
    } catch (error) {
      console.error('Error fetching unread counts:', error);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await axios.put(`${API_URL}/admin/notifications/${notificationId}/read`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Actualizar el estado local
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
      fetchUnreadCounts();
      toast.success('Notificación marcada como leída');
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Error al marcar como leída');
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(`${API_URL}/admin/notifications/mark-all-read`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      fetchUnreadCounts();
      toast.success('Todas las notificaciones marcadas como leídas');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Error al marcar todas como leídas');
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      await axios.delete(`${API_URL}/admin/notifications/${notificationId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      fetchUnreadCounts();
      toast.success('Notificación eliminada');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Error al eliminar notificación');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'contact':
        return <FaEnvelope className="text-blue-500" />;
      case 'newsletter':
        return <FaNewspaper className="text-green-500" />;
      case 'reservation':
        return <FaCalendarAlt className="text-purple-500" />;
      case 'order':
        return <FaShoppingCart className="text-orange-500" />;
      default:
        return <FaBell className="text-gray-500" />;
    }
  };

  const formatTime = (dateString: string) => {
    const now = new Date();
    const notifTime = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - notifTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes}min`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `Hace ${hours}h`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `Hace ${days}d`;
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && notifications.length === 0) {
      fetchNotifications();
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon with Badge */}
      <button
        onClick={handleToggle}
        className="relative p-2 text-gray-600 hover:text-coffee-600 transition-colors"
      >
        <FaBell className="text-xl" />
        {unreadCounts.total_unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
          >
            {unreadCounts.total_unread > 99 ? '99+' : unreadCounts.total_unread}
          </motion.span>
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-bold text-gray-800 flex items-center">
                  <FaBell className="mr-2 text-coffee-600" />
                  Notificaciones
                  {unreadCounts.total_unread > 0 && (
                    <span className="ml-2 bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs">
                      {unreadCounts.total_unread}
                    </span>
                  )}
                </h3>
                
                {unreadCounts.total_unread > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-coffee-600 hover:text-coffee-700 font-medium"
                  >
                    Marcar todas como leídas
                  </button>
                )}
              </div>

              {/* Type Badges */}
              {Object.keys(unreadCounts.by_type).length > 0 && (
                <div className="p-3 bg-gray-50 border-b border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(unreadCounts.by_type).map(([type, count]) => (
                      <span
                        key={type}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-coffee-100 text-coffee-700"
                      >
                        {getNotificationIcon(type)}
                        <span className="ml-1 capitalize">{type}: {count}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center">
                    <div className="w-6 h-6 border-2 border-coffee-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Cargando...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <FaBell className="text-3xl text-gray-300 mx-auto mb-2" />
                    <p>No hay notificaciones</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-3 hover:bg-gray-50 transition-colors ${
                          !notification.is_read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            {/* Icon */}
                            <div className="flex-shrink-0 mt-0.5">
                              {getNotificationIcon(notification.type)}
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold text-gray-800 truncate">
                                  {notification.title}
                                  {!notification.is_read && (
                                    <FaCircle className="inline text-blue-500 ml-1 text-xs" />
                                  )}
                                </p>
                                <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                  {formatTime(notification.created_at)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center space-x-1 ml-2">
                            {!notification.is_read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                                title="Marcar como leída"
                              >
                                <FaCheck className="text-xs" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Eliminar"
                            >
                              <FaTrash className="text-xs" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-200 text-center">
                  <p className="text-xs text-gray-500">
                    Mostrando {notifications.length} notificaciones
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;
