import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBriefcase, 
  FaEye,
  FaTimes,
  FaCalendar,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaTrash,
  FaFileAlt
} from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

import { API_URL } from '../../config/api';
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

interface JobApplicationsManagementProps {
  token: string;
}

const JobApplicationsManagement: React.FC<JobApplicationsManagementProps> = ({ token }) => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);

  useEffect(() => {
    fetchJobApplications();
  }, []);

  const fetchJobApplications = async () => {
    try {
      setLoading(true);
        const response = await axios.get(`${API_URL}/admin/job-applications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching job applications:', error);
      toast.error('Error cargando aplicaciones de trabajo');
    } finally {
      setLoading(false);
    }
  };

  const deleteApplication = async (applicationId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta aplicación?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/admin/job-applications/${applicationId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setApplications(applications.filter(app => app.id !== applicationId));
      toast.success('Aplicación eliminada exitosamente');
      
      if (selectedApplication?.id === applicationId) {
        setSelectedApplication(null);
      }
    } catch (error) {
      console.error('Error deleting application:', error);
      toast.error('Error eliminando aplicación');
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

  const getPositionColor = (position: string) => {
    const colors: { [key: string]: string } = {
      'Barista': 'bg-coffee-100 text-coffee-800',
      'Barista Senior': 'bg-coffee-200 text-coffee-900',
      'Manager': 'bg-blue-100 text-blue-800',
      'Desarrollador/a': 'bg-purple-100 text-purple-800',
      'Marketing': 'bg-pink-100 text-pink-800',
      'Repostero/a': 'bg-yellow-100 text-yellow-800',
      'Atención al Cliente': 'bg-green-100 text-green-800'
    };
    return colors[position] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-coffee-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-coffee-800">Aplicaciones de Trabajo</h3>
          <p className="text-coffee-600">Gestiona las solicitudes de empleo</p>
        </div>
        <div className="bg-blue-100 px-4 py-2 rounded-lg">
          <span className="text-blue-800 font-semibold">{applications.length} aplicaciones</span>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💼</div>
          <h4 className="text-xl font-semibold text-coffee-800 mb-2">No hay aplicaciones</h4>
          <p className="text-coffee-600">Las solicitudes de empleo aparecerán aquí</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {applications.map((application) => (
            <motion.div
              key={application.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.01 }}
              className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {/* Header Info */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <FaBriefcase className="text-blue-600 text-lg" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-coffee-800">{application.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-coffee-600">
                          <span className="flex items-center space-x-1">
                            <FaEnvelope className="text-xs" />
                            <span>{application.email}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <FaPhone className="text-xs" />
                            <span>{application.phone}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPositionColor(application.position)}`}>
                        {application.position}
                      </span>
                    </div>
                  </div>

                  {/* Experience Preview */}
                  <div className="mb-3">
                    <h5 className="font-semibold text-coffee-700 mb-1">Experiencia:</h5>
                    <p className="text-coffee-600 text-sm line-clamp-2">{application.experience}</p>
                  </div>

                  {/* CV Info */}
                  {application.cv_filename && (
                    <div className="flex items-center space-x-2 mb-3">
                      <FaFileAlt className="text-coffee-500 text-sm" />
                      <span className="text-sm text-coffee-600">CV adjunto: {application.cv_filename}</span>
                    </div>
                  )}
                  
                  {/* Date */}
                  <div className="flex items-center space-x-2 text-xs text-coffee-500">
                    <FaCalendar />
                    <span>{formatDate(application.created_at)}</span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => setSelectedApplication(application)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 transition-colors"
                  >
                    <FaEye />
                    <span>Ver detalles</span>
                  </button>
                  <button
                    onClick={() => deleteApplication(application.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Application Detail Modal */}
      <AnimatePresence>
        {selectedApplication && (
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
              className="bg-white rounded-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-coffee-800">
                  Aplicación de Trabajo - {selectedApplication.position}
                </h3>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-6">
                {/* Personal Info */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-bold text-blue-800 mb-3">Información Personal</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-blue-700">Nombre</label>
                      <p className="text-blue-800 font-semibold">{selectedApplication.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-blue-700">Email</label>
                      <p className="text-blue-800">{selectedApplication.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-blue-700">Teléfono</label>
                      <p className="text-blue-800">{selectedApplication.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-blue-700">Posición Deseada</label>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getPositionColor(selectedApplication.position)}`}>
                        {selectedApplication.position}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <label className="text-sm font-semibold text-coffee-700 block mb-2">Experiencia Previa</label>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-coffee-800 whitespace-pre-wrap leading-relaxed">
                      {selectedApplication.experience}
                    </p>
                  </div>
                </div>

                {/* Motivation */}
                <div>
                  <label className="text-sm font-semibold text-coffee-700 block mb-2">Motivación</label>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-coffee-800 whitespace-pre-wrap leading-relaxed">
                      {selectedApplication.motivation}
                    </p>
                  </div>
                </div>

                {/* CV Info */}
                {selectedApplication.cv_filename && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <FaFileAlt className="text-yellow-600" />
                      <span className="font-semibold text-yellow-800">Currículum Vitae</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      El candidato ha enviado su CV: <strong>{selectedApplication.cv_filename}</strong>
                      <br />
                      Revisa tu email para acceder al documento adjunto.
                    </p>
                  </div>
                )}

                {/* Metadata */}
                <div className="text-sm text-coffee-500 bg-coffee-50 p-3 rounded-lg">
                  <p>Aplicación recibida el {formatDate(selectedApplication.created_at)}</p>
                  <p>ID de referencia: #{selectedApplication.id}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      const subject = encodeURIComponent(`Re: Aplicación para ${selectedApplication.position} - Café Demo`);
                      const body = encodeURIComponent(`Hola ${selectedApplication.name},\n\nGracias por tu interés en formar parte del equipo de Café Demo.\n\n`);
                      window.location.href = `mailto:${selectedApplication.email}?subject=${subject}&body=${body}`;
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors"
                  >
                    <FaEnvelope />
                    <span>Contactar Candidato</span>
                  </button>
                  <button
                    onClick={() => deleteApplication(selectedApplication.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-colors"
                  >
                    <FaTrash />
                    <span>Eliminar</span>
                  </button>
                  <button
                    onClick={() => setSelectedApplication(null)}
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
    </div>
  );
};

export default JobApplicationsManagement;
