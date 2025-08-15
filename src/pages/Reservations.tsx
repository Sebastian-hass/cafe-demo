import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery } from '@tanstack/react-query';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaUsers, 
  FaPhone,
  FaEnvelope,
  FaCheckCircle,
  FaUser,
  FaStickyNote
} from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

interface ReservationCreate {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  party_size: number;
  reservation_date: string;
  reservation_time: string;
  notes?: string;
}

interface AvailabilitySlot {
  time: string;
  available: boolean;
  current_reservations: number;
}

const API_BASE = 'http://localhost:8000';

const Reservations: React.FC = () => {
  const [reservationForm, setReservationForm] = useState<ReservationCreate>({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    party_size: 2,
    reservation_date: '',
    reservation_time: '',
    notes: ''
  });
  const [selectedDate, setSelectedDate] = useState('');
  const [showAvailability, setShowAvailability] = useState(false);

  // Establecer fecha mínima (hoy)
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    setReservationForm(prev => ({ ...prev, reservation_date: today }));
  }, []);

  // Query para obtener disponibilidad
  const { data: availability, isLoading: loadingAvailability } = useQuery({
    queryKey: ['availability', selectedDate],
    queryFn: async () => {
      if (!selectedDate) return null;
      const response = await axios.get(`${API_BASE}/reservations/availability/${selectedDate}`);
      return response.data;
    },
    enabled: !!selectedDate,
  });

  // Mutación para crear reserva
  const createReservationMutation = useMutation({
    mutationFn: async (reservationData: ReservationCreate) => {
      const response = await axios.post(`${API_BASE}/reservations`, reservationData);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`¡Reserva #${data.id} confirmada! Te hemos enviado una confirmación por email.`);
      setReservationForm({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        party_size: 2,
        reservation_date: selectedDate,
        reservation_time: '',
        notes: ''
      });
    },
    onError: (error: any) => {
      console.error('Error creando reserva:', error);
      const errorMessage = error.response?.data?.detail || 'Error al crear la reserva. Por favor intenta de nuevo.';
      toast.error(errorMessage);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!reservationForm.customer_name.trim()) {
      toast.error('Por favor ingresa tu nombre');
      return;
    }
    
    if (!reservationForm.customer_email.trim()) {
      toast.error('Por favor ingresa tu email');
      return;
    }
    
    if (!reservationForm.customer_phone.trim()) {
      toast.error('Por favor ingresa tu teléfono');
      return;
    }
    
    if (!reservationForm.reservation_date) {
      toast.error('Por favor selecciona una fecha');
      return;
    }
    
    if (!reservationForm.reservation_time) {
      toast.error('Por favor selecciona una hora');
      return;
    }
    
    if (reservationForm.party_size < 1 || reservationForm.party_size > 20) {
      toast.error('El número de personas debe estar entre 1 y 20');
      return;
    }

    createReservationMutation.mutate(reservationForm);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setReservationForm(prev => ({ ...prev, reservation_date: date, reservation_time: '' }));
    setShowAvailability(true);
  };

  const handleTimeSelection = (time: string) => {
    setReservationForm(prev => ({ ...prev, reservation_time: time }));
  };

  const getMinDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 60); // 60 días en el futuro
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-coffee-800 to-coffee-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-display font-bold mb-4"
          >
            🍽️ Reserva tu Mesa
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg opacity-90"
          >
            Asegura tu lugar en nuestro acogedor café
          </motion.p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className="p-8">
              <h2 className="text-2xl font-bold text-coffee-800 mb-6 flex items-center">
                <FaCalendarAlt className="mr-3" />
                Información de la Reserva
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Información del Cliente */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-coffee-700 mb-2">
                      <FaUser className="inline mr-2" />
                      Nombre completo *
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={reservationForm.customer_name}
                      onChange={(e) => setReservationForm(prev => ({ ...prev, customer_name: e.target.value }))}
                      className="w-full px-4 py-3 border border-coffee-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                      placeholder="Tu nombre completo"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-coffee-700 mb-2">
                      <FaEnvelope className="inline mr-2" />
                      Email *
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={reservationForm.customer_email}
                      onChange={(e) => setReservationForm(prev => ({ ...prev, customer_email: e.target.value }))}
                      className="w-full px-4 py-3 border border-coffee-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                      placeholder="tu@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-coffee-700 mb-2">
                      <FaPhone className="inline mr-2" />
                      Teléfono *
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      value={reservationForm.customer_phone}
                      onChange={(e) => setReservationForm(prev => ({ ...prev, customer_phone: e.target.value }))}
                      className="w-full px-4 py-3 border border-coffee-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                      placeholder="+34 123 456 789"
                    />
                  </div>

                  <div>
                    <label htmlFor="party_size" className="block text-sm font-medium text-coffee-700 mb-2">
                      <FaUsers className="inline mr-2" />
                      Número de personas *
                    </label>
                    <select
                      id="party_size"
                      value={reservationForm.party_size}
                      onChange={(e) => setReservationForm(prev => ({ ...prev, party_size: parseInt(e.target.value) }))}
                      className="w-full px-4 py-3 border border-coffee-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                    >
                      {[...Array(20)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} persona{i !== 0 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Fecha y Hora */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-coffee-700 mb-2">
                      <FaCalendarAlt className="inline mr-2" />
                      Fecha de la reserva *
                    </label>
                    <input
                      id="date"
                      type="date"
                      required
                      min={getMinDate()}
                      max={getMaxDate()}
                      value={selectedDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="w-full px-4 py-3 border border-coffee-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-coffee-700 mb-2">
                      <FaClock className="inline mr-2" />
                      Hora de la reserva *
                    </label>
                    {loadingAvailability ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-coffee-600"></div>
                        <span className="ml-2 text-coffee-600">Cargando horarios...</span>
                      </div>
                    ) : (
                      <div className="max-h-32 overflow-y-auto border border-coffee-200 rounded-lg p-2">
                        <div className="grid grid-cols-3 gap-2">
                          {availability?.available_times?.map((slot: AvailabilitySlot) => (
                            <button
                              key={slot.time}
                              type="button"
                              disabled={!slot.available}
                              onClick={() => handleTimeSelection(slot.time)}
                              className={`px-3 py-2 text-sm rounded transition-colors ${
                                reservationForm.reservation_time === slot.time
                                  ? 'bg-coffee-600 text-white'
                                  : slot.available
                                  ? 'bg-coffee-100 text-coffee-700 hover:bg-coffee-200'
                                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              }`}
                              title={slot.available ? 'Disponible' : 'No disponible'}
                            >
                              {slot.time}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notas */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-coffee-700 mb-2">
                    <FaStickyNote className="inline mr-2" />
                    Notas adicionales (opcional)
                  </label>
                  <textarea
                    id="notes"
                    value={reservationForm.notes}
                    onChange={(e) => setReservationForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-4 py-3 border border-coffee-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                    rows={3}
                    placeholder="Cualquier petición especial, celebración, alergias, etc."
                  />
                </div>

                {/* Resumen */}
                {reservationForm.reservation_date && reservationForm.reservation_time && (
                  <div className="bg-coffee-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-coffee-800 mb-2">Resumen de tu reserva:</h3>
                    <div className="text-sm text-coffee-700 space-y-1">
                      <p><strong>Fecha:</strong> {new Date(reservationForm.reservation_date).toLocaleDateString('es-ES', { 
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                      })}</p>
                      <p><strong>Hora:</strong> {reservationForm.reservation_time}</p>
                      <p><strong>Personas:</strong> {reservationForm.party_size}</p>
                      <p><strong>Nombre:</strong> {reservationForm.customer_name || 'Por completar'}</p>
                    </div>
                  </div>
                )}

                {/* Botón de envío */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={createReservationMutation.isPending}
                    className="w-full bg-coffee-600 hover:bg-coffee-700 text-white py-4 px-6 rounded-lg font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {createReservationMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Confirmando reserva...</span>
                      </>
                    ) : (
                      <>
                        <FaCheckCircle />
                        <span>Confirmar Reserva</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>

          {/* Información adicional */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6 mt-8"
          >
            <h3 className="text-xl font-bold text-coffee-800 mb-4">📋 Política de Reservas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-coffee-600">
              <div>
                <h4 className="font-semibold mb-2">⏰ Horarios de reserva:</h4>
                <p>• Lunes a Domingo: 9:00 - 22:00</p>
                <p>• Reservas cada 30 minutos</p>
                <p>• Máximo 20 personas por mesa</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">📞 Cancelaciones:</h4>
                <p>• Notificar con al menos 2 horas</p>
                <p>• Llamar al +34 123 456 789</p>
                <p>• O responder al email de confirmación</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Reservations;
