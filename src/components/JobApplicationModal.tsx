import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaBriefcase, FaUser, FaEnvelope, FaPhone, FaFileUpload } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

import { API_URL } from '../config/api';
interface JobApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface JobApplicationData {
  name: string;
  email: string;
  phone: string;
  position: string;
  experience: string;
  motivation: string;
  cv_filename?: string;
}

const JobApplicationModal: React.FC<JobApplicationModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<JobApplicationData>({
    name: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    motivation: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const positions = [
    'Barista',
    'Barista Senior',
    'Encargado/a de Turno',
    'Repostero/a',
    'Atención al Cliente',
    'Limpieza',
    'Manager',
    'Desarrollador/a',
    'Marketing',
    'Otro'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post(`${API_URL}/jobs/apply`, formData);
      
      if (response.data.success) {
        toast.success('¡Aplicación enviada correctamente! Te contactaremos pronto.');
        setFormData({
          name: '',
          email: '',
          phone: '',
          position: '',
          experience: '',
          motivation: ''
        });
        onClose();
      }
    } catch (error: any) {
      console.error('Error enviando aplicación:', error);
      toast.error(error.response?.data?.detail || 'Error enviando aplicación');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-coffee-700 to-coffee-900 text-white p-6 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold font-display mb-2">
                  🤝 Únete al Equipo
                </h2>
                <p className="text-coffee-100">
                  Forma parte de la familia Café Demo
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-coffee-200 text-2xl p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Personal Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-coffee-700 mb-2">
                  <FaUser className="inline mr-2" />
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-coffee-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                  placeholder="Tu nombre completo"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-coffee-700 mb-2">
                  <FaEnvelope className="inline mr-2" />
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-coffee-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-coffee-700 mb-2">
                  <FaPhone className="inline mr-2" />
                  Teléfono *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-coffee-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                  placeholder="+34 123 456 789"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-coffee-700 mb-2">
                  <FaBriefcase className="inline mr-2" />
                  Posición Deseada *
                </label>
                <select
                  name="position"
                  required
                  value={formData.position}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-coffee-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                >
                  <option value="">Selecciona una posición</option>
                  {positions.map((position) => (
                    <option key={position} value={position}>
                      {position}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-semibold text-coffee-700 mb-2">
                Experiencia Previa *
              </label>
              <textarea
                name="experience"
                required
                rows={4}
                value={formData.experience}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-coffee-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-transparent resize-none"
                placeholder="Cuéntanos sobre tu experiencia laboral relevante, habilidades y conocimientos..."
              />
            </div>

            {/* Motivation */}
            <div>
              <label className="block text-sm font-semibold text-coffee-700 mb-2">
                ¿Por qué quieres trabajar con nosotros? *
              </label>
              <textarea
                name="motivation"
                required
                rows={4}
                value={formData.motivation}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-coffee-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-transparent resize-none"
                placeholder="Explícanos qué te motiva a formar parte del equipo de Café Demo..."
              />
            </div>

            {/* CV Upload Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <FaFileUpload className="text-blue-600" />
                <span className="font-semibold text-blue-800">CV / Currículum</span>
              </div>
              <p className="text-sm text-blue-700">
                Puedes enviar tu CV a <strong>jesussebastianalonsoarias@gmail.com</strong> indicando 
                tu nombre y la posición a la que aplicas. ¡No olvides mencionar que vienes de la web!
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-coffee-600 to-coffee-700 hover:from-coffee-700 hover:to-coffee-800 text-white rounded-lg font-semibold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <FaBriefcase />
                    <span>Enviar Aplicación</span>
                  </>
                )}
              </motion.button>
            </div>

            {/* Footer Note */}
            <div className="text-center text-sm text-coffee-500 pt-4 border-t">
              <p>
                Al enviar esta aplicación, aceptas que procesemos tus datos para fines de reclutamiento. 
                Te contactaremos solo si tu perfil coincide con nuestras necesidades actuales.
              </p>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default JobApplicationModal;
