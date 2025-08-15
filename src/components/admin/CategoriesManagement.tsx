import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaTags, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSave,
  FaTimes,
  FaBoxOpen
} from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  created_at: string;
}

interface CategoriesManagementProps {
  token: string;
}

const CategoriesManagement: React.FC<CategoriesManagementProps> = ({ token }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    id: '',
    name: '',
    description: '',
    icon: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:8000/admin/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setCategories(response.data);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      toast.error('Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryForm.id.trim() || !categoryForm.name.trim()) {
      toast.error('ID y nombre son obligatorios');
      return;
    }

    try {
      await axios.post('http://localhost:8000/admin/categories', 
        {
          id: categoryForm.id,
          name: categoryForm.name,
          description: categoryForm.description || undefined,
          icon: categoryForm.icon || undefined
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      toast.success('Categoría creada exitosamente');
      setShowCreateModal(false);
      setCategoryForm({ id: '', name: '', description: '', icon: '' });
      fetchCategories();
    } catch (error: any) {
      console.error('Error creating category:', error);
      const errorMessage = error.response?.data?.detail || 'Error al crear la categoría';
      toast.error(errorMessage);
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingCategory || !categoryForm.name.trim()) {
      toast.error('Nombre es obligatorio');
      return;
    }

    try {
      await axios.put(`http://localhost:8000/admin/categories/${editingCategory.id}`, 
        {
          name: categoryForm.name,
          description: categoryForm.description || undefined,
          icon: categoryForm.icon || undefined
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      toast.success('Categoría actualizada exitosamente');
      setEditingCategory(null);
      setCategoryForm({ id: '', name: '', description: '', icon: '' });
      fetchCategories();
    } catch (error: any) {
      console.error('Error updating category:', error);
      const errorMessage = error.response?.data?.detail || 'Error al actualizar la categoría';
      toast.error(errorMessage);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8000/admin/categories/${categoryId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      toast.success('Categoría eliminada exitosamente');
      fetchCategories();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      const errorMessage = error.response?.data?.detail || 'Error al eliminar la categoría';
      toast.error(errorMessage);
    }
  };

  const startEdit = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      id: category.id,
      name: category.name,
      description: category.description || '',
      icon: category.icon || ''
    });
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setCategoryForm({ id: '', name: '', description: '', icon: '' });
  };

  const getCategoryEmoji = (categoryId: string) => {
    switch (categoryId) {
      case 'bebidas': return '☕';
      case 'panaderia': return '🥐';
      case 'postres': return '🍰';
      default: return '🍽️';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-coffee-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-coffee-600">Cargando categorías...</p>
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
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-coffee-800 flex items-center">
            <FaTags className="mr-3" />
            Gestión de Categorías
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-coffee-600 hover:bg-coffee-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <FaPlus />
            <span>Nueva Categoría</span>
          </button>
        </div>
      </motion.div>

      {/* Categories List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">
            Categorías ({categories.length})
          </h3>
        </div>
        
        {categories.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FaTags className="text-4xl mx-auto mb-4 opacity-50" />
            <p>No hay categorías disponibles</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {categories.map((category) => (
              <div key={category.id} className="p-4 hover:bg-gray-50 transition-colors">
                {editingCategory?.id === category.id ? (
                  // Edit form
                  <form onSubmit={handleUpdateCategory} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-coffee-700 mb-1">
                          ID (no editable)
                        </label>
                        <input
                          type="text"
                          value={categoryForm.id}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-coffee-700 mb-1">
                          Nombre *
                        </label>
                        <input
                          type="text"
                          required
                          value={categoryForm.name}
                          onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                          placeholder="Nombre de la categoría"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-coffee-700 mb-1">
                        Descripción
                      </label>
                      <textarea
                        value={categoryForm.description}
                        onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                        placeholder="Descripción opcional"
                        rows={2}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-coffee-700 mb-1">
                        Icono
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {['☕', '🥐', '🍰', '🥗', '🍕', '🍔', '🌮', '🍜', '🧋', '🥤'].map(emoji => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setCategoryForm(prev => ({ ...prev, icon: emoji }))}
                            className={`p-2 text-2xl border rounded-lg transition-colors ${
                              categoryForm.icon === emoji 
                                ? 'border-coffee-500 bg-coffee-50' 
                                : 'border-gray-300 hover:border-coffee-300'
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={categoryForm.icon}
                        onChange={(e) => setCategoryForm(prev => ({ ...prev, icon: e.target.value }))}
                        className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                        placeholder="O escribe un emoji personalizado"
                        maxLength={2}
                      />
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-1"
                      >
                        <FaSave />
                        <span>Guardar</span>
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-1"
                      >
                        <FaTimes />
                        <span>Cancelar</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  // Display mode
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="text-3xl">
                        {category.icon || getCategoryEmoji(category.id)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-gray-800 text-lg">
                            {category.name}
                          </span>
                          <span className="text-xs bg-coffee-100 text-coffee-700 px-2 py-1 rounded-full">
                            ID: {category.id}
                          </span>
                        </div>
                        
                        {category.description && (
                          <p className="text-sm text-gray-600 mb-2">
                            {category.description}
                          </p>
                        )}
                        
                        <div className="flex items-center text-xs text-gray-500">
                          <span>Creado: {new Date(category.created_at).toLocaleDateString('es-ES')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => startEdit(category)}
                        className="p-2 text-coffee-600 hover:text-coffee-800 transition-colors"
                        title="Editar categoría"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-2 text-red-500 hover:text-red-700 transition-colors"
                        title="Eliminar categoría"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Create Category Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-md w-full"
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-coffee-800">Nueva Categoría</h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setCategoryForm({ id: '', name: '', description: '', icon: '' });
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <form onSubmit={handleCreateCategory} className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="categoryId" className="block text-sm font-medium text-coffee-700 mb-1">
                    ID de la categoría *
                  </label>
                  <input
                    id="categoryId"
                    type="text"
                    required
                    value={categoryForm.id}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, id: e.target.value.toLowerCase() }))}
                    className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                    placeholder="ej: nueva-categoria"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Usar solo letras minúsculas, números y guiones. No se puede cambiar después.
                  </p>
                </div>
                
                <div>
                  <label htmlFor="categoryName" className="block text-sm font-medium text-coffee-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    id="categoryName"
                    type="text"
                    required
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                    placeholder="Nombre visible de la categoría"
                  />
                </div>
                
                <div>
                  <label htmlFor="categoryDescription" className="block text-sm font-medium text-coffee-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    id="categoryDescription"
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                    placeholder="Descripción opcional"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-coffee-700 mb-1">
                    Icono
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {['☕', '🥐', '🍰', '🥗', '🍕', '🍔', '🌮', '🍜', '🧋', '🥤'].map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setCategoryForm(prev => ({ ...prev, icon: emoji }))}
                        className={`p-2 text-2xl border rounded-lg transition-colors ${
                          categoryForm.icon === emoji 
                            ? 'border-coffee-500 bg-coffee-50' 
                            : 'border-gray-300 hover:border-coffee-300'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={categoryForm.icon}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, icon: e.target.value }))}
                    className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                    placeholder="O escribe un emoji personalizado"
                    maxLength={2}
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setCategoryForm({ id: '', name: '', description: '', icon: '' });
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-coffee-600 hover:bg-coffee-700 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Crear Categoría
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CategoriesManagement;
