import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
FaEnvelope, 
FaUsers, 
FaPaperPlane,
FaEye,
FaTimes,
FaCalendar,
FaUser,
FaEdit,
FaNewspaper,
FaCheck,
FaBriefcase,
FaPhone,
FaTrash
} from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

interface NewsletterSubscriber {
  id: number;
  email: string;
  name: string;
  subscribed_at: string;
  active: boolean;
}

interface JobApplication {
  id: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  experience: string;
  motivation: string;
  cv_filename: string | null;
  created_at: string;
}

interface ContactNewsletterManagementProps {
  token: string;
}

const ContactNewsletterManagement: React.FC<ContactNewsletterManagementProps> = ({ token }) => {
  const [activeTab, setActiveTab] = useState<'contacts' | 'newsletter'>('contacts');
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<ContactMessage | null>(null);
  const [showNewsletterModal, setShowNewsletterModal] = useState(false);
  const [newsletterData, setNewsletterData] = useState({
    subject: '',
    content: ''
  });

  useEffect(() => {
    if (activeTab === 'contacts') {
      fetchContacts();
    } else {
      fetchSubscribers();
    }
  }, [activeTab]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/admin/contacts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setContacts(response.data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Error cargando mensajes de contacto');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/admin/newsletter/subscribers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSubscribers(response.data);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      toast.error('Error cargando suscriptores');
    } finally {
      setLoading(false);
    }
  };

  const sendNewsletter = async () => {
    try {
      const response = await axios.post('http://localhost:8000/admin/newsletter/send', newsletterData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      toast.success(response.data.message);
      setShowNewsletterModal(false);
      setNewsletterData({ subject: '', content: '' });
    } catch (error: any) {
      console.error('Error sending newsletter:', error);
      toast.error(error.response?.data?.detail || 'Error enviando newsletter');
    }
  };

  const deleteContact = async (contactId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este mensaje?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8000/admin/contacts/${contactId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setContacts(contacts.filter(contact => contact.id !== contactId));
      toast.success('Mensaje eliminado exitosamente');
      
      if (selectedContact?.id === contactId) {
        setSelectedContact(null);
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Error eliminando mensaje');
    }
  };

  const deleteSubscriber = async (subscriberId: number) => {
    if (!confirm('¿Estás seguro de que quieres desactivar esta suscripción?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8000/admin/newsletter/subscribers/${subscriberId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setSubscribers(subscribers.filter(sub => sub.id !== subscriberId));
      toast.success('Suscriptor desactivado exitosamente');
    } catch (error) {
      console.error('Error deleting subscriber:', error);
      toast.error('Error desactivando suscriptor');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const ContactsView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-coffee-800">Mensajes de Contacto</h3>
          <p className="text-coffee-600">Gestiona las consultas de tus clientes</p>
        </div>
        <div className="bg-coffee-100 px-4 py-2 rounded-lg">
          <span className="text-coffee-800 font-semibold">{contacts.length} mensajes</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-coffee-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📬</div>
          <h4 className="text-xl font-semibold text-coffee-800 mb-2">No hay mensajes</h4>
          <p className="text-coffee-600">Los mensajes de contacto aparecerán aquí</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {contacts.map((contact) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.01 }}
              className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-coffee-500"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-coffee-100 rounded-full flex items-center justify-center">
                      <FaUser className="text-coffee-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-coffee-800">{contact.name}</h4>
                      <p className="text-coffee-600 text-sm">{contact.email}</p>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <FaEdit className="text-coffee-500 text-sm" />
                      <span className="font-semibold text-coffee-700">{contact.subject}</span>
                    </div>
                    <p className="text-coffee-600 text-sm line-clamp-2">{contact.message}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-xs text-coffee-500">
                    <FaCalendar />
                    <span>{formatDate(contact.created_at)}</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedContact(contact)}
                    className="bg-coffee-600 hover:bg-coffee-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 transition-colors"
                  >
                    <FaEye />
                    <span>Ver</span>
                  </button>
                  <button
                    onClick={() => deleteContact(contact.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors"
                    title="Eliminar mensaje"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const NewsletterView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-coffee-800">Newsletter</h3>
          <p className="text-coffee-600">Gestiona tus suscriptores y envía newsletters</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-green-100 px-4 py-2 rounded-lg">
            <span className="text-green-800 font-semibold">{subscribers.length} suscriptores</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNewsletterModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 shadow-lg"
          >
            <FaPaperPlane />
            <span>Enviar Newsletter</span>
          </motion.button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-coffee-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : subscribers.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📰</div>
          <h4 className="text-xl font-semibold text-coffee-800 mb-2">No hay suscriptores</h4>
          <p className="text-coffee-600">Los suscriptores al newsletter aparecerán aquí</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-coffee-50 px-6 py-4 border-b">
            <h4 className="text-lg font-bold text-coffee-800">Suscriptores Activos</h4>
          </div>
          <div className="divide-y divide-gray-100">
            {subscribers.map((subscriber, index) => (
              <motion.div
                key={subscriber.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="px-6 py-4 hover:bg-coffee-25 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-coffee-100 to-coffee-200 rounded-full flex items-center justify-center">
                      <FaEnvelope className="text-coffee-600" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-coffee-800">
                        {subscriber.name || 'Sin nombre'}
                      </h5>
                      <p className="text-coffee-600 text-sm">{subscriber.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="flex items-center space-x-2 text-sm text-green-600">
                        <FaCheck />
                        <span>Activo</span>
                      </div>
                      <p className="text-xs text-coffee-500 mt-1">
                        {formatDate(subscriber.subscribed_at)}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteSubscriber(subscriber.id)}
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
                      title="Desactivar suscripción"
                    >
                      <FaTrash className="text-sm" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('contacts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'contacts'
                ? 'border-coffee-500 text-coffee-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } transition-colors`}
          >
            <div className="flex items-center space-x-2">
              <FaEnvelope />
              <span>Mensajes de Contacto</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('newsletter')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'newsletter'
                ? 'border-coffee-500 text-coffee-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } transition-colors`}
          >
            <div className="flex items-center space-x-2">
              <FaUsers />
              <span>Newsletter</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'contacts' ? <ContactsView /> : <NewsletterView />}

      {/* Contact Detail Modal */}
      <AnimatePresence>
        {selectedContact && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-coffee-800">Mensaje de Contacto</h3>
                <button
                  onClick={() => setSelectedContact(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-coffee-50 p-4 rounded-lg">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-coffee-700">Nombre</label>
                      <p className="text-coffee-800">{selectedContact.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-coffee-700">Email</label>
                      <p className="text-coffee-800">{selectedContact.email}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-coffee-700">Asunto</label>
                  <p className="text-lg font-semibold text-coffee-800 mt-1">{selectedContact.subject}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-coffee-700">Mensaje</label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    <p className="text-coffee-800 whitespace-pre-wrap leading-relaxed">
                      {selectedContact.message}
                    </p>
                  </div>
                </div>

                <div className="text-sm text-coffee-500">
                  <p>Recibido el {formatDate(selectedContact.created_at)}</p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => {
                      window.location.href = `mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`;
                    }}
                    className="flex-1 bg-coffee-600 hover:bg-coffee-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors"
                  >
                    <FaEnvelope />
                    <span>Responder</span>
                  </button>
                  <button
                    onClick={() => deleteContact(selectedContact.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-colors"
                  >
                    <FaTrash />
                    <span>Eliminar</span>
                  </button>
                  <button
                    onClick={() => setSelectedContact(null)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Newsletter Modal */}
      <AnimatePresence>
        {showNewsletterModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-xl max-w-lg w-full p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-coffee-800">Enviar Newsletter</h3>
                <button
                  onClick={() => setShowNewsletterModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                sendNewsletter();
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-coffee-700 mb-1">
                    Asunto del newsletter
                  </label>
                  <input
                    type="text"
                    required
                    value={newsletterData.subject}
                    onChange={(e) => setNewsletterData({...newsletterData, subject: e.target.value})}
                    className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                    placeholder="Ej: Nuevas ofertas de la semana"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-coffee-700 mb-1">
                    Contenido
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={newsletterData.content}
                    onChange={(e) => setNewsletterData({...newsletterData, content: e.target.value})}
                    className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                    placeholder="Escribe el contenido de tu newsletter aquí..."
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <FaNewspaper className="text-blue-600" />
                    <span className="font-semibold text-blue-800">Vista previa</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Se enviará a {subscribers.length} suscriptores activos
                  </p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowNewsletterModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                  >
                    <FaPaperPlane />
                    <span>Enviar Newsletter</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContactNewsletterManagement;
