import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaShoppingCart, 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaEye, 
  FaTrash,
  FaPhone,
  FaEnvelope,
  FaCalendarAlt,
  FaEuroSign
} from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

interface OrderItem {
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  notes?: string;
}

interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  items: OrderItem[];
  total_amount: number;
  notes?: string;
  status: string;
  created_at: string;
}

interface OrdersManagementProps {
  token: string;
}

const OrdersManagement: React.FC<OrdersManagementProps> = ({ token }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stats, setStats] = useState({
    total_orders: 0,
    pending_orders: 0,
    completed_orders: 0,
    total_revenue: 0
  });

  const statusOptions = [
    { value: 'all', label: 'Todos los pedidos', color: 'bg-gray-500' },
    { value: 'pending', label: 'Pendientes', color: 'bg-orange-500' },
    { value: 'processing', label: 'En proceso', color: 'bg-blue-500' },
    { value: 'completed', label: 'Completados', color: 'bg-green-500' },
    { value: 'cancelled', label: 'Cancelados', color: 'bg-red-500' }
  ];

  useEffect(() => {
    fetchOrders();
    fetchOrderStats();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:8000/admin/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setOrders(response.data);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast.error('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderStats = async () => {
    try {
      const response = await axios.get('http://localhost:8000/admin/orders/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setStats(response.data);
    } catch (error: any) {
      console.error('Error fetching order stats:', error);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      await axios.put(`http://localhost:8000/admin/orders/${orderId}/status`, 
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      toast.success('Estado del pedido actualizado');
      fetchOrderStats(); // Actualizar estadísticas
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast.error('Error al actualizar el estado del pedido');
    }
  };

  const deleteOrder = async (orderId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este pedido?')) return;

    try {
      await axios.delete(`http://localhost:8000/admin/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setOrders(orders.filter(order => order.id !== orderId));
      setSelectedOrder(null);
      toast.success('Pedido eliminado');
      fetchOrderStats(); // Actualizar estadísticas
    } catch (error: any) {
      console.error('Error deleting order:', error);
      toast.error('Error al eliminar el pedido');
    }
  };

  const getStatusColor = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.color : 'bg-gray-500';
  };

  const getStatusLabel = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.label.replace('s', '') : status;
  };

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-coffee-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-coffee-600">Cargando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-xl shadow-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-coffee-800 flex items-center">
            <FaShoppingCart className="mr-3" />
            Gestión de Pedidos
          </h2>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FaShoppingCart className="text-blue-500 text-2xl mr-3" />
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Pedidos</p>
                <p className="text-2xl font-bold text-blue-800">{stats.total_orders}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FaClock className="text-orange-500 text-2xl mr-3" />
              <div>
                <p className="text-sm text-orange-600 font-medium">Pendientes</p>
                <p className="text-2xl font-bold text-orange-800">{stats.pending_orders}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FaCheckCircle className="text-green-500 text-2xl mr-3" />
              <div>
                <p className="text-sm text-green-600 font-medium">Completados</p>
                <p className="text-2xl font-bold text-green-800">{stats.completed_orders}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FaEuroSign className="text-purple-500 text-2xl mr-3" />
              <div>
                <p className="text-sm text-purple-600 font-medium">Ingresos</p>
                <p className="text-2xl font-bold text-purple-800">€{stats.total_revenue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {statusOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === option.value
                  ? `${option.color} text-white`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Orders List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Table */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">
              Pedidos Recientes ({filteredOrders.length})
            </h3>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {filteredOrders.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FaShoppingCart className="text-4xl mx-auto mb-4 opacity-50" />
                <p>No hay pedidos para mostrar</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedOrder?.id === order.id ? 'bg-coffee-50 border-r-4 border-coffee-600' : ''
                    }`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-gray-800">
                            Pedido #{order.id}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium text-white rounded-full ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </div>
                        
                        <p className="text-sm font-medium text-coffee-600 mb-1">
                          {order.customer_name}
                        </p>
                        
                        <div className="flex items-center text-xs text-gray-500 space-x-3">
                          <span className="flex items-center">
                            <FaCalendarAlt className="mr-1" />
                            {formatDate(order.created_at)}
                          </span>
                          <span className="font-semibold text-coffee-600">
                            €{order.total_amount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                          }}
                          className="p-1 text-coffee-600 hover:text-coffee-800 transition-colors"
                          title="Ver detalles"
                        >
                          <FaEye className="text-sm" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteOrder(order.id);
                          }}
                          className="p-1 text-red-500 hover:text-red-700 transition-colors"
                          title="Eliminar"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Order Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-lg"
        >
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">
              {selectedOrder ? `Detalles del Pedido #${selectedOrder.id}` : 'Selecciona un pedido'}
            </h3>
          </div>
          
          <div className="p-6">
            {selectedOrder ? (
              <div className="space-y-6">
                {/* Customer Info */}
                <div>
                  <h4 className="font-semibold text-coffee-800 mb-3">Información del Cliente</h4>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center">
                      <span className="font-medium w-20">Nombre:</span>
                      <span>{selectedOrder.customer_name}</span>
                    </p>
                    <p className="flex items-center">
                      <FaEnvelope className="mr-2 text-gray-500" />
                      <span>{selectedOrder.customer_email}</span>
                    </p>
                    {selectedOrder.customer_phone && (
                      <p className="flex items-center">
                        <FaPhone className="mr-2 text-gray-500" />
                        <span>{selectedOrder.customer_phone}</span>
                      </p>
                    )}
                    <p className="flex items-center">
                      <FaCalendarAlt className="mr-2 text-gray-500" />
                      <span>{formatDate(selectedOrder.created_at)}</span>
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h4 className="font-semibold text-coffee-800 mb-3">Productos</h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{item.product_name}</p>
                          <p className="text-sm text-gray-600">
                            {item.quantity}x €{item.price.toFixed(2)} = €{(item.quantity * item.price).toFixed(2)}
                          </p>
                          {item.notes && (
                            <p className="text-xs text-gray-500 mt-1">Nota: {item.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div>
                    <h4 className="font-semibold text-coffee-800 mb-2">Notas del pedido</h4>
                    <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
                      {selectedOrder.notes}
                    </p>
                  </div>
                )}

                {/* Total */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-coffee-600">€{selectedOrder.total_amount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Status Update */}
                <div>
                  <h4 className="font-semibold text-coffee-800 mb-3">Estado del Pedido</h4>
                  <div className="flex flex-wrap gap-2">
                    {statusOptions.filter(opt => opt.value !== 'all').map(option => (
                      <button
                        key={option.value}
                        onClick={() => updateOrderStatus(selectedOrder.id, option.value)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedOrder.status === option.value
                            ? `${option.color} text-white`
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {option.label.replace('s', '')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <FaShoppingCart className="text-4xl mx-auto mb-4 opacity-50" />
                <p>Selecciona un pedido de la lista para ver los detalles</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrdersManagement;
