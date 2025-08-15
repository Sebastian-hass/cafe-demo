import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaUsers, 
  FaPhone,
  FaEnvelope,
  FaCheckCircle, 
  FaTimesCircle, 
  FaEye, 
  FaTrash,
  FaEdit,
  FaBan,
  FaUserCheck
} from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

import { API_URL } from '../../config/api';
interface Reservation {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  party_size: number;
  reservation_date: string;
  reservation_time: string;
  notes?: string;
  status: string;
  created_at: string;
}

interface ReservationsManagementProps {
  token: string;
}

const ReservationsManagement: React.FC<ReservationsManagementProps> = ({ token }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stats, setStats] = useState({
    total_reservations: 0,
    pending_reservations: 0,
    confirmed_reservations: 0,
    today_reservations: 0
  });

  const statusOptions = [
    { value: 'all', label: 'Todas las reservas', color: 'bg-gray-500' },
    { value: 'pending', label: 'Pendientes', color: 'bg-orange-500' },
    { value: 'confirmed', label: 'Confirmadas', color: 'bg-green-500' },
    { value: 'cancelled', label: 'Canceladas', color: 'bg-red-500' },
    { value: 'completed', label: 'Completadas', color: 'bg-blue-500' },
    { value: 'no_show', label: 'No se presentaron', color: 'bg-gray-600' }
  ];

  useEffect(() => {
    fetchReservations();
    fetchReservationStats();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/reservations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setReservations(response.data);
    } catch (error: any) {
      console.error('Error fetching reservations:', error);
      toast.error('Error al cargar reservas');
    } finally {
      setLoading(false);
    }
  };

  const fetchReservationStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/reservations/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setStats(response.data);
    } catch (error: any) {
      console.error('Error fetching reservation stats:', error);
    }
  };

  const updateReservationStatus = async (reservationId: number, newStatus: string) => {
    try {
      await axios.put(`${API_URL}/admin/reservations/${reservationId}/status`, 
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setReservations(reservations.map(reservation => 
        reservation.id === reservationId ? { ...reservation, status: newStatus } : reservation
      ));
      
      if (selectedReservation && selectedReservation.id === reservationId) {
        setSelectedReservation({ ...selectedReservation, status: newStatus });
      }
      
      toast.success('Estado de la reserva actualizado');
      fetchReservationStats(); // Actualizar estadísticas
    } catch (error: any) {
      console.error('Error updating reservation status:', error);
      toast.error('Error al actualizar el estado de la reserva');
    }
  };

  const deleteReservation = async (reservationId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta reserva?')) return;

    try {
      await axios.delete(`${API_URL}/admin/reservations/${reservationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setReservations(reservations.filter(reservation => reservation.id !== reservationId));
      setSelectedReservation(null);
      toast.success('Reserva eliminada');
      fetchReservationStats(); // Actualizar estadísticas
    } catch (error: any) {
      console.error('Error deleting reservation:', error);
      toast.error('Error al eliminar la reserva');
    }
  };

  const getStatusColor = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.color : 'bg-gray-500';
  };

  const getStatusLabel = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.label.replace('s', '').replace('as', '') : status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <FaCheckCircle />;
      case 'cancelled': return <FaTimesCircle />;
      case 'completed': return <FaUserCheck />;
      case 'no_show': return <FaBan />;
      default: return <FaClock />;
    }
  };

  const filteredReservations = statusFilter === 'all' 
    ? reservations 
    : reservations.filter(reservation => reservation.status === statusFilter);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
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
          <p className="text-coffee-600">Cargando reservas...</p>
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
            <FaCalendarAlt className="mr-3" />
            Gestión de Reservas
          </h2>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FaCalendarAlt className="text-blue-500 text-2xl mr-3" />
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Reservas</p>
                <p className="text-2xl font-bold text-blue-800">{stats.total_reservations}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FaClock className="text-orange-500 text-2xl mr-3" />
              <div>
                <p className="text-sm text-orange-600 font-medium">Pendientes</p>
                <p className="text-2xl font-bold text-orange-800">{stats.pending_reservations}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FaCheckCircle className="text-green-500 text-2xl mr-3" />
              <div>
                <p className="text-sm text-green-600 font-medium">Confirmadas</p>
                <p className="text-2xl font-bold text-green-800">{stats.confirmed_reservations}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FaCalendarAlt className="text-purple-500 text-2xl mr-3" />
              <div>
                <p className="text-sm text-purple-600 font-medium">Hoy</p>
                <p className="text-2xl font-bold text-purple-800">{stats.today_reservations}</p>
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

      {/* Reservations List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reservations Table */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">
              Reservas ({filteredReservations.length})
            </h3>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {filteredReservations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FaCalendarAlt className="text-4xl mx-auto mb-4 opacity-50" />
                <p>No hay reservas para mostrar</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredReservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedReservation?.id === reservation.id ? 'bg-coffee-50 border-r-4 border-coffee-600' : ''
                    }`}
                    onClick={() => setSelectedReservation(reservation)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-gray-800">
                            Reserva #{reservation.id}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium text-white rounded-full ${getStatusColor(reservation.status)} flex items-center space-x-1`}>
                            {getStatusIcon(reservation.status)}
                            <span>{getStatusLabel(reservation.status)}</span>
                          </span>
                        </div>
                        
                        <p className="text-sm font-medium text-coffee-600 mb-1">
                          {reservation.customer_name}
                        </p>
                        
                        <div className="flex items-center text-xs text-gray-500 space-x-3">
                          <span className="flex items-center">
                            <FaCalendarAlt className="mr-1" />
                            {formatDate(reservation.reservation_date)}
                          </span>
                          <span className="flex items-center">
                            <FaClock className="mr-1" />
                            {reservation.reservation_time}
                          </span>
                          <span className="flex items-center">
                            <FaUsers className="mr-1" />
                            {reservation.party_size}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReservation(reservation);
                          }}
                          className="p-1 text-coffee-600 hover:text-coffee-800 transition-colors"
                          title="Ver detalles"
                        >
                          <FaEye className="text-sm" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteReservation(reservation.id);
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

        {/* Reservation Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-lg"
        >
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">
              {selectedReservation ? `Detalles de la Reserva #${selectedReservation.id}` : 'Selecciona una reserva'}
            </h3>
          </div>
          
          <div className="p-6">
            {selectedReservation ? (
              <div className="space-y-6">
                {/* Customer Info */}
                <div>
                  <h4 className="font-semibold text-coffee-800 mb-3">Información del Cliente</h4>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center">
                      <span className="font-medium w-20">Nombre:</span>
                      <span>{selectedReservation.customer_name}</span>
                    </p>
                    <p className="flex items-center">
                      <FaEnvelope className="mr-2 text-gray-500" />
                      <span>{selectedReservation.customer_email}</span>
                    </p>
                    <p className="flex items-center">
                      <FaPhone className="mr-2 text-gray-500" />
                      <span>{selectedReservation.customer_phone}</span>
                    </p>
                  </div>
                </div>

                {/* Reservation Details */}
                <div>
                  <h4 className="font-semibold text-coffee-800 mb-3">Detalles de la Reserva</h4>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center">
                      <FaCalendarAlt className="mr-2 text-gray-500" />
                      <span className="font-medium">Fecha:</span>
                      <span className="ml-2">{formatDate(selectedReservation.reservation_date)}</span>
                    </p>
                    <p className="flex items-center">
                      <FaClock className="mr-2 text-gray-500" />
                      <span className="font-medium">Hora:</span>
                      <span className="ml-2">{selectedReservation.reservation_time}</span>
                    </p>
                    <p className="flex items-center">
                      <FaUsers className="mr-2 text-gray-500" />
                      <span className="font-medium">Personas:</span>
                      <span className="ml-2">{selectedReservation.party_size}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Creada: {formatDateTime(selectedReservation.created_at)}
                    </p>
                  </div>
                </div>

                {/* Notes */}
                {selectedReservation.notes && (
                  <div>
                    <h4 className="font-semibold text-coffee-800 mb-2">Notas</h4>
                    <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
                      {selectedReservation.notes}
                    </p>
                  </div>
                )}

                {/* Status Update */}
                <div>
                  <h4 className="font-semibold text-coffee-800 mb-3">Estado de la Reserva</h4>
                  <div className="flex flex-wrap gap-2">
                    {statusOptions.filter(opt => opt.value !== 'all').map(option => (
                      <button
                        key={option.value}
                        onClick={() => updateReservationStatus(selectedReservation.id, option.value)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${
                          selectedReservation.status === option.value
                            ? `${option.color} text-white`
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {getStatusIcon(option.value)}
                        <span>{option.label.replace('s', '').replace('as', '')}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <FaCalendarAlt className="text-4xl mx-auto mb-4 opacity-50" />
                <p>Selecciona una reserva de la lista para ver los detalles</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ReservationsManagement;
