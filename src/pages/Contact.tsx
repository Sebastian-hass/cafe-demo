import React, { useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const contactInfo = {
    phone: '+34 123 456 789',
    email: 'info@cafeDemo.com',
    address: 'Calle Principal 123, 28001 Madrid, España',
    hours: {
      weekdays: 'Lunes - Viernes: 7:00 - 22:00',
      weekend: 'Sábado - Domingo: 8:00 - 23:00'
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/contact', formData);
      
      if (response.data.success) {
        toast.success('¡Mensaje enviado correctamente! Te responderemos pronto.');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        throw new Error('Error en el servidor');
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error('Error al enviar el mensaje. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-cream-50">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#8B4513',
            color: '#fff',
          },
          success: {
            duration: 6000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 6000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      {/* Header */}
      <section className="bg-gradient-to-r from-coffee-800 to-coffee-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-display font-bold mb-4">📞 Contacto</h1>
          <p className="text-lg opacity-90">Estamos aquí para atenderte</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Información de contacto */}
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-display font-bold text-coffee-900 mb-6">
                Información de Contacto
              </h2>
              
              <div className="space-y-6">
                {/* Teléfono */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-coffee-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">📞</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-coffee-800 mb-1">Teléfono</h3>
                    <p className="text-coffee-600">{contactInfo.phone}</p>
                    <p className="text-sm text-coffee-500">Disponible durante horarios de atención</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-coffee-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">✉️</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-coffee-800 mb-1">Email</h3>
                    <p className="text-coffee-600">{contactInfo.email}</p>
                    <p className="text-sm text-coffee-500">Respuesta en 24 horas</p>
                  </div>
                </div>

                {/* Dirección */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-coffee-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">📍</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-coffee-800 mb-1">Dirección</h3>
                    <p className="text-coffee-600">{contactInfo.address}</p>
                    <p className="text-sm text-coffee-500">Cerca del metro Plaza de España</p>
                  </div>
                </div>

                {/* Horarios */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-coffee-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">🕒</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-coffee-800 mb-2">Horarios</h3>
                    <div className="space-y-1">
                      <p className="text-coffee-600">{contactInfo.hours.weekdays}</p>
                      <p className="text-coffee-600">{contactInfo.hours.weekend}</p>
                    </div>
                    <p className="text-sm text-coffee-500 mt-1">Festivos: consultar horarios especiales</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Asistente IA */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-4">🤖 Asistente IA 24/7</h2>
              <p className="mb-6 opacity-90">
                ¿Necesitas ayuda inmediata? Nuestro asistente virtual está disponible las 24 horas para:
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center space-x-2">
                  <span>✅</span>
                  <span>Consultar el menú y precios</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span>✅</span>
                  <span>Información sobre ingredientes</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span>✅</span>
                  <span>Horarios y ubicación</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span>✅</span>
                  <span>Reservas y pedidos</span>
                </li>
              </ul>
              <button
                onClick={() => {
                  // Enviar evento personalizado para abrir el chatbot
                  const event = new CustomEvent('openChatBot');
                  window.dispatchEvent(event);
                }}
                className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
              >
                <span>🤖</span>
                <span>Iniciar Chat IA</span>
              </button>
            </div>
          </div>

          {/* Mapa y formulario */}
          <div className="space-y-8">
            {/* Mapa placeholder */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-display font-bold text-coffee-900 mb-6">
                Cómo Llegar
              </h2>
              
              {/* Placeholder del mapa */}
              <div className="w-full h-64 bg-gradient-to-br from-coffee-100 to-coffee-200 rounded-lg flex flex-col items-center justify-center mb-4">
                <span className="text-4xl mb-2">🗺️</span>
                <p className="text-coffee-600 text-center">
                  Mapa interactivo<br/>
                  <span className="text-sm">(En versión de producción se integraría Google Maps)</span>
                </p>
              </div>

              <div className="text-center">
                <button 
                  onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(contactInfo.address)}`, '_blank')}
                  className="bg-coffee-600 hover:bg-coffee-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center space-x-2"
                >
                  <span>🧭</span>
                  <span>Ver en Google Maps</span>
                </button>
              </div>
            </div>

            {/* Formulario de contacto */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-display font-bold text-coffee-900 mb-6">
                Envíanos un Mensaje
              </h2>
              
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-coffee-700 mb-1">
                      Nombre
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                      placeholder="Tu nombre"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-coffee-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-coffee-700 mb-1">
                    Asunto
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                    placeholder="¿En qué podemos ayudarte?"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-coffee-700 mb-1">
                    Mensaje
                  </label>
                  <textarea
                    rows={4}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                    placeholder="Escribe tu mensaje aquí..."
                    required
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-coffee-600 hover:bg-coffee-700 text-white'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <span>📧</span>
                      <span>Enviar Mensaje</span>
                    </>
                  )}
                </button>
              </form>
              
              <p className="text-sm text-coffee-500 mt-4 text-center">
                💡 <strong>Tip:</strong> Para respuestas más rápidas, usa nuestro asistente IA
              </p>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-12 bg-coffee-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-display font-bold text-coffee-900 mb-4">
            ¿Vienes por primera vez?
          </h2>
          <p className="text-coffee-700 mb-6">
            Te recomendamos probar nuestros especiales del día y no olvides preguntar por nuestras opciones veganas y sin gluten.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <span className="text-2xl mb-2 block">🅿️</span>
              <p className="text-sm font-medium text-coffee-800">Parking público</p>
              <p className="text-xs text-coffee-600">a 100m</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <span className="text-2xl mb-2 block">♿</span>
              <p className="text-sm font-medium text-coffee-800">Acceso completo</p>
              <p className="text-xs text-coffee-600">para personas con movilidad reducida</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <span className="text-2xl mb-2 block">🐕</span>
              <p className="text-sm font-medium text-coffee-800">Pet-friendly</p>
              <p className="text-xs text-coffee-600">terrazas admiten mascotas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
