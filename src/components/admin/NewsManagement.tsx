import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaTimes, 
  FaSave, 
  FaNewspaper,
  FaCalendarAlt,
  FaUser,
  FaTags,
  FaImage,
  FaToggleOn,
  FaToggleOff,
  FaStar,
  FaStarHalfAlt
} from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

interface NewsArticle {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  featured: boolean;
  image?: string;
  tags: string[];
  published: boolean;
  created_at: string;
  updated_at: string;
}

interface NewsManagementProps {
  token: string;
}

const NewsManagement: React.FC<NewsManagementProps> = ({ token }) => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPublished, setFilterPublished] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    author: '',
    category: '',
    featured: false,
    image: '',
    tags: [] as string[],
    published: true,
  });

  const [currentTag, setCurrentTag] = useState('');
  const [imageUploading, setImageUploading] = useState(false);

  const categories = [
    'Noticias',
    'Eventos',
    'Productos',
    'Ofertas',
    'Comunidad',
    'Recetas',
    'Tips',
    'Actualizaciones'
  ];

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await axios.get('http://localhost:8000/admin/news', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setArticles(response.data);
    } catch (error: any) {
      console.error('Error fetching articles:', error);
      toast.error('Error al cargar noticias');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.excerpt || !formData.content || !formData.author) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      const articleData = {
        ...formData,
        tags: formData.tags,
      };

      if (editingArticle) {
        await axios.put(
          `http://localhost:8000/admin/news/${editingArticle.id}`,
          articleData,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        toast.success('Noticia actualizada correctamente');
      } else {
        await axios.post('http://localhost:8000/admin/news', articleData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        toast.success('Noticia creada correctamente');
      }

      fetchArticles();
      resetForm();
      setShowModal(false);
    } catch (error: any) {
      console.error('Error saving article:', error);
      toast.error('Error al guardar la noticia');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta noticia?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8000/admin/news/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success('Noticia eliminada correctamente');
      fetchArticles();
    } catch (error: any) {
      console.error('Error deleting article:', error);
      toast.error('Error al eliminar la noticia');
    }
  };

  const handleEdit = (article: NewsArticle) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      author: article.author,
      category: article.category,
      featured: article.featured,
      image: article.image || '',
      tags: article.tags,
      published: article.published,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingArticle(null);
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      author: '',
      category: '',
      featured: false,
      image: '',
      tags: [],
      published: true,
    });
    setCurrentTag('');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/admin/upload-image', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setFormData(prev => ({ ...prev, image: response.data.url }));
      toast.success('Imagen subida correctamente');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error('Error al subir la imagen');
    } finally {
      setImageUploading(false);
    }
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const togglePublished = async (article: NewsArticle) => {
    try {
      await axios.put(
        `http://localhost:8000/admin/news/${article.id}`,
        { published: !article.published },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      toast.success(`Noticia ${!article.published ? 'publicada' : 'despublicada'}`);
      fetchArticles();
    } catch (error: any) {
      console.error('Error toggling published status:', error);
      toast.error('Error al cambiar el estado de publicación');
    }
  };

  const toggleFeatured = async (article: NewsArticle) => {
    try {
      await axios.put(
        `http://localhost:8000/admin/news/${article.id}`,
        { featured: !article.featured },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      toast.success(`Noticia ${!article.featured ? 'marcada' : 'desmarcada'} como destacada`);
      fetchArticles();
    } catch (error: any) {
      console.error('Error toggling featured status:', error);
      toast.error('Error al cambiar el estado destacado');
    }
  };

  // Filter articles
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || article.category === filterCategory;
    
    const matchesPublished = filterPublished === 'all' || 
                           (filterPublished === 'published' && article.published) ||
                           (filterPublished === 'draft' && !article.published);

    return matchesSearch && matchesCategory && matchesPublished;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-coffee-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-coffee-600">Cargando noticias...</p>
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
            <FaNewspaper className="mr-3 text-coffee-600" />
            Gestión de Noticias
          </h2>
          <p className="text-gray-600">Administra las noticias y artículos del sitio web</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="bg-coffee-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 hover:bg-coffee-700 transition-colors shadow-lg"
        >
          <FaPlus />
          <span>Nueva Noticia</span>
        </motion.button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <input
              type="text"
              placeholder="Buscar noticias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-coffee-500 focus:border-coffee-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-coffee-500 focus:border-coffee-500"
            >
              <option value="all">Todas las categorías</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={filterPublished}
              onChange={(e) => setFilterPublished(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-coffee-500 focus:border-coffee-500"
            >
              <option value="all">Todos</option>
              <option value="published">Publicadas</option>
              <option value="draft">Borradores</option>
            </select>
          </div>
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              {filteredArticles.length} de {articles.length} noticias
            </div>
          </div>
        </div>
      </div>

      {/* Articles List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <FaNewspaper className="mx-auto text-6xl text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No hay noticias para mostrar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Artículo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Autor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredArticles.map((article) => (
                  <motion.tr
                    key={article.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {article.image && (
                          <img
                            src={`http://localhost:8000${article.image}`}
                            alt={article.title}
                            className="w-12 h-12 rounded-lg object-cover mr-4"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            {article.title}
                            {article.featured && (
                              <FaStar className="ml-2 text-yellow-500" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{article.excerpt.slice(0, 100)}...</div>
                          <div className="flex items-center mt-1 space-x-1">
                            {article.tags.map(tag => (
                              <span key={tag} className="inline-block bg-coffee-100 text-coffee-800 text-xs px-2 py-1 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <FaUser className="mr-2 text-gray-400" />
                        {article.author}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {article.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => togglePublished(article)}
                          className={`flex items-center text-sm font-medium ${
                            article.published ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {article.published ? <FaToggleOn className="mr-1" /> : <FaToggleOff className="mr-1" />}
                          {article.published ? 'Publicada' : 'Borrador'}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <FaCalendarAlt className="mr-2" />
                        {new Date(article.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => toggleFeatured(article)}
                          className={`${
                            article.featured ? 'text-yellow-600' : 'text-gray-400'
                          } hover:text-yellow-700 transition-colors`}
                          title={article.featured ? 'Quitar de destacados' : 'Marcar como destacado'}
                        >
                          <FaStar />
                        </button>
                        <button
                          onClick={() => handleEdit(article)}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(article.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
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
                    {editingArticle ? 'Editar Noticia' : 'Nueva Noticia'}
                  </h3>
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

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Título *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-coffee-500 focus:border-coffee-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Autor *
                      </label>
                      <input
                        type="text"
                        value={formData.author}
                        onChange={(e) => setFormData({...formData, author: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-coffee-500 focus:border-coffee-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resumen/Extracto *
                    </label>
                    <textarea
                      value={formData.excerpt}
                      onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-coffee-500 focus:border-coffee-500"
                      required
                      placeholder="Breve descripción de la noticia..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contenido *
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({...formData, content: e.target.value})}
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-coffee-500 focus:border-coffee-500"
                      required
                      placeholder="Contenido completo de la noticia..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Categoría
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-coffee-500 focus:border-coffee-500"
                      >
                        <option value="">Seleccionar categoría</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Imagen
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={imageUploading}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-coffee-500 focus:border-coffee-500"
                        />
                        {imageUploading && (
                          <div className="px-3 py-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-coffee-600"></div>
                          </div>
                        )}
                      </div>
                      {formData.image && (
                        <img
                          src={`http://localhost:8000${formData.image}`}
                          alt="Preview"
                          className="mt-2 w-24 h-24 object-cover rounded-lg"
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Etiquetas
                    </label>
                    <div className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        placeholder="Agregar etiqueta..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-coffee-500 focus:border-coffee-500"
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        className="px-4 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 transition-colors"
                      >
                        <FaPlus />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map(tag => (
                        <span key={tag} className="inline-flex items-center bg-coffee-100 text-coffee-800 px-3 py-1 rounded-full text-sm">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-2 text-coffee-600 hover:text-coffee-800"
                          >
                            <FaTimes />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.published}
                        onChange={(e) => setFormData({...formData, published: e.target.checked})}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Publicar inmediatamente</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Marcar como destacado</span>
                    </label>
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
                      <span>{editingArticle ? 'Actualizar' : 'Crear'} Noticia</span>
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

export default NewsManagement;
