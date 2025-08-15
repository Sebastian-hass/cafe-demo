import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaTimes, 
  FaSave, 
  FaFile,
  FaGlobe,
  FaSearch,
  FaFilter,
  FaEye,
  FaCode,
  FaAlignLeft,
  FaHome,
  FaEnvelope,
  FaUtensils,
  FaNewspaper,
  FaInfoCircle
} from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

import { API_URL } from '../../config/api';
interface PageContent {
  id: string;
  title: string;
  content: string;
  section: string;
  page: string;
  updated_at: string;
}

interface PageContentManagementProps {
  token: string;
}

const PageContentManagement: React.FC<PageContentManagementProps> = ({ token }) => {
  const [contents, setContents] = useState<PageContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingContent, setEditingContent] = useState<PageContent | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPage, setFilterPage] = useState('all');
  const [filterSection, setFilterSection] = useState('all');
  const [previewMode, setPreviewMode] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    content: '',
    section: '',
    page: '',
  });

  // Predefined pages and sections for the cafe website
  const pages = [
    { id: 'home', name: 'Inicio', icon: <FaHome /> },
    { id: 'menu', name: 'Menú', icon: <FaUtensils /> },
    { id: 'about', name: 'Nosotros', icon: <FaInfoCircle /> },
    { id: 'contact', name: 'Contacto', icon: <FaEnvelope /> },
    { id: 'news', name: 'Noticias', icon: <FaNewspaper /> },
  ];

  const sections = [
    { id: 'hero', name: 'Sección Principal', description: 'Títulos y textos principales de la página' },
    { id: 'features', name: 'Características', description: 'Puntos destacados o features' },
    { id: 'description', name: 'Descripción', description: 'Textos descriptivos y párrafos' },
    { id: 'footer', name: 'Pie de página', description: 'Contenido del footer' },
    { id: 'cta', name: 'Call to Action', description: 'Botones y llamadas a la acción' },
    { id: 'benefits', name: 'Beneficios', description: 'Lista de beneficios o ventajas' },
    { id: 'testimonials', name: 'Testimonios', description: 'Reseñas y testimonios' },
    { id: 'faq', name: 'Preguntas Frecuentes', description: 'FAQ y ayuda' },
  ];

  // Common content templates for cafe
  const contentTemplates = [
    {
      id: 'home-hero-title',
      title: 'Título Principal - Inicio',
      content: 'Bienvenido a Café Demo',
      section: 'hero',
      page: 'home'
    },
    {
      id: 'home-hero-subtitle',
      title: 'Subtítulo Principal - Inicio',
      content: 'El mejor café de la ciudad con productos frescos y ambiente acogedor',
      section: 'hero',
      page: 'home'
    },
    {
      id: 'about-description',
      title: 'Descripción - Nosotros',
      content: 'Somos una cafetería familiar dedicada a servir el mejor café con productos locales de alta calidad.',
      section: 'description',
      page: 'about'
    },
    {
      id: 'menu-intro',
      title: 'Introducción - Menú',
      content: 'Descubre nuestra selección de bebidas y alimentos preparados con amor y los mejores ingredientes.',
      section: 'description',
      page: 'menu'
    }
  ];

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/content`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setContents(response.data);
    } catch (error: any) {
      console.error('Error fetching page contents:', error);
      toast.error('Error al cargar contenidos de la página');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.id || !formData.title || !formData.content || !formData.section || !formData.page) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      if (editingContent) {
        await axios.put(
          `${API_URL}/admin/content/${editingContent.id}`,
          formData,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        toast.success('Contenido actualizado correctamente');
      } else {
        await axios.post(`${API_URL}/admin/content`, formData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        toast.success('Contenido creado correctamente');
      }

      fetchContents();
      resetForm();
      setShowModal(false);
    } catch (error: any) {
      console.error('Error saving page content:', error);
      if (error.response?.status === 400) {
        toast.error('Ya existe contenido con ese ID. Use un ID único.');
      } else {
        toast.error('Error al guardar el contenido');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este contenido?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/admin/content/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success('Contenido eliminado correctamente');
      fetchContents();
    } catch (error: any) {
      console.error('Error deleting page content:', error);
      toast.error('Error al eliminar el contenido');
    }
  };

  const handleEdit = (content: PageContent) => {
    setEditingContent(content);
    setFormData({
      id: content.id,
      title: content.title,
      content: content.content,
      section: content.section,
      page: content.page,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingContent(null);
    setFormData({
      id: '',
      title: '',
      content: '',
      section: '',
      page: '',
    });
    setPreviewMode(false);
  };

  const loadTemplate = (template: any) => {
    setFormData({
      id: template.id,
      title: template.title,
      content: template.content,
      section: template.section,
      page: template.page,
    });
  };

  // Filter contents
  const filteredContents = contents.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPage = filterPage === 'all' || content.page === filterPage;
    const matchesSection = filterSection === 'all' || content.section === filterSection;

    return matchesSearch && matchesPage && matchesSection;
  });

  // Get unique pages and sections from data
  const uniquePages = [...new Set(contents.map(c => c.page))];
  const uniqueSections = [...new Set(contents.map(c => c.section))];

  const getPageName = (pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    return page ? page.name : pageId;
  };

  const getSectionName = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    return section ? section.name : sectionId;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-coffee-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-coffee-600">Cargando contenidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <FaFile className="mr-3 text-coffee-600" />
            Gestión de Contenidos
          </h2>
          <p className="text-gray-600">Administra todos los textos editables del sitio web</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="bg-coffee-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 hover:bg-coffee-700 transition-colors shadow-lg"
        >
          <FaPlus />
          <span>Nuevo Contenido</span>
        </motion.button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar contenidos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-coffee-500 focus:border-coffee-500"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Página
            </label>
            <select
              value={filterPage}
              onChange={(e) => setFilterPage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-coffee-500 focus:border-coffee-500"
            >
              <option value="all">Todas las páginas</option>
              {uniquePages.map(page => (
                <option key={page} value={page}>{getPageName(page)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sección
            </label>
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-coffee-500 focus:border-coffee-500"
            >
              <option value="all">Todas las secciones</option>
              {uniqueSections.map(section => (
                <option key={section} value={section}>{getSectionName(section)}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              {filteredContents.length} de {contents.length} contenidos
            </div>
          </div>
        </div>
      </div>

      {/* Contents List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {filteredContents.length === 0 ? (
          <div className="text-center py-12">
            <FaFile className="mx-auto text-6xl text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg mb-4">No hay contenidos para mostrar</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-coffee-600 text-white px-6 py-2 rounded-lg hover:bg-coffee-700 transition-colors"
            >
              Crear primer contenido
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID / Título
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contenido
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Página
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sección
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Última Actualización
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContents.map((content) => (
                  <motion.tr
                    key={content.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{content.title}</div>
                        <div className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                          {content.id}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-md">
                        <div className="line-clamp-2">{content.content}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {content.content.length} caracteres
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {pages.find(p => p.id === content.page)?.icon || <FaGlobe />}
                        <span className="ml-2 text-sm text-gray-900">
                          {getPageName(content.page)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-coffee-100 text-coffee-800">
                        {getSectionName(content.section)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(content.updated_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleEdit(content)}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors"
                          title="Editar"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(content.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Eliminar"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Create/Edit */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowModal(false);
                resetForm();
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">
                    {editingContent ? 'Editar Contenido' : 'Nuevo Contenido'}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setPreviewMode(!previewMode)}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                        previewMode 
                          ? 'bg-coffee-600 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <FaEye className="mr-1" />
                      Vista Previa
                    </button>
                    <button
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>

                {/* Templates (only for new content) */}
                {!editingContent && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                      <FaAlignLeft className="mr-2" />
                      Plantillas Rápidas
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {contentTemplates.map(template => (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() => loadTemplate(template)}
                          className="text-left p-2 bg-white rounded border border-blue-200 hover:border-blue-400 transition-colors text-sm"
                        >
                          <div className="font-medium text-blue-900">{template.title}</div>
                          <div className="text-blue-600 text-xs">{getPageName(template.page)} - {getSectionName(template.section)}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ID único *
                      </label>
                      <input
                        type="text"
                        value={formData.id}
                        onChange={(e) => setFormData({...formData, id: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-coffee-500 focus:border-coffee-500 font-mono text-sm"
                        placeholder="ej: home-hero-title"
                        pattern="[a-z0-9-_]+"
                        title="Solo letras minúsculas, números, guiones y guiones bajos"
                        required
                        disabled={!!editingContent}
                      />
                      <p className="text-xs text-gray-500 mt-1">Solo letras minúsculas, números, - y _</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Título descriptivo *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-coffee-500 focus:border-coffee-500"
                        placeholder="Título para identificar el contenido"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Página *
                      </label>
                      <select
                        value={formData.page}
                        onChange={(e) => setFormData({...formData, page: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-coffee-500 focus:border-coffee-500"
                        required
                      >
                        <option value="">Seleccionar página</option>
                        {pages.map(page => (
                          <option key={page.id} value={page.id}>{page.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sección *
                      </label>
                      <select
                        value={formData.section}
                        onChange={(e) => setFormData({...formData, section: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-coffee-500 focus:border-coffee-500"
                        required
                      >
                        <option value="">Seleccionar sección</option>
                        {sections.map(section => (
                          <option key={section.id} value={section.id}>
                            {section.name} - {section.description}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contenido *
                    </label>
                    {previewMode ? (
                      <div className="w-full min-h-[200px] p-4 border border-gray-300 rounded-lg bg-gray-50">
                        <div className="prose max-w-none">
                          <div dangerouslySetInnerHTML={{ __html: formData.content.replace(/\n/g, '<br>') }} />
                        </div>
                        {!formData.content && (
                          <p className="text-gray-400 italic">Vista previa aparecerá aquí...</p>
                        )}
                      </div>
                    ) : (
                      <textarea
                        value={formData.content}
                        onChange={(e) => setFormData({...formData, content: e.target.value})}
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-coffee-500 focus:border-coffee-500"
                        placeholder="Contenido del texto. Puedes usar HTML básico como <strong>, <em>, <br>, etc."
                        required
                      />
                    )}
                    <div className="flex justify-between mt-2">
                      <p className="text-xs text-gray-500">Admite HTML básico y saltos de línea</p>
                      <p className="text-xs text-gray-500">{formData.content.length} caracteres</p>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-6 border-t">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="px-6 py-3 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 transition-colors flex items-center space-x-2"
                    >
                      <FaSave />
                      <span>{editingContent ? 'Actualizar' : 'Crear'} Contenido</span>
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PageContentManagement;
