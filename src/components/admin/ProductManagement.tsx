import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaFilter,
  FaTimes,
  FaCheck,
  FaEye,
  FaImage,
  FaUpload
} from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

import { API_URL } from '../../config/api';
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  created_at: string;
}

interface ProductManagementProps {
  token: string;
}

const ProductManagement: React.FC<ProductManagementProps> = ({ token }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error cargando productos');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Error cargando categorías');
    }
  };

  const handleCreateProduct = async () => {
    try {
      const response = await axios.post(`${API_URL}/admin/products`, formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setProducts([response.data, ...products]);
      toast.success('¡Producto creado exitosamente!');
      handleCloseModal();
    } catch (error: any) {
      console.error('Error creating product:', error);
      toast.error(error.response?.data?.detail || 'Error creando producto');
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    
    try {
      const response = await axios.put(
        `${API_URL}/admin/products/${editingProduct.id}`, 
        formData,
        { headers: { 'Authorization': `Bearer ${token}` }}
      );
      setProducts(products.map(p => p.id === editingProduct.id ? response.data : p));
      toast.success('¡Producto actualizado exitosamente!');
      handleCloseModal();
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast.error(error.response?.data?.detail || 'Error actualizando producto');
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return;
    
    try {
      await axios.delete(`${API_URL}/admin/products/${productId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setProducts(products.filter(p => p.id !== productId));
      toast.success('¡Producto eliminado exitosamente!');
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error(error.response?.data?.detail || 'Error eliminando producto');
    }
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: categories.length > 0 ? categories[0].id : 'bebidas',
        image: 'default.jpg',
        available: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({});
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor selecciona un archivo de imagen válido');
        return;
      }
      
      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen debe ser menor a 5MB');
        return;
      }

      setSelectedImage(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Subir imagen al servidor
      await uploadImage(file);
    }
  };

  const uploadImage = async (file: File) => {
    try {
      setUploadingImage(true);
      
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      
      const response = await axios.post(`${API_URL}/admin/upload-image`, formDataUpload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        // Actualizar formData con el nombre de archivo del servidor
        setFormData(prev => ({ ...prev, image: response.data.filename }));
        toast.success('¡Imagen subida exitosamente!');
      }
      
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.response?.data?.detail || 'Error subiendo imagen');
      // Limpiar la imagen seleccionada en caso de error
      setSelectedImage(null);
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };


  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setFormData({...formData, image: 'default.jpg'});
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-16 h-16 border-4 border-coffee-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-coffee-800">Gestión de Productos</h2>
          <p className="text-coffee-600">Administra tu menú y productos</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleOpenModal()}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 shadow-lg"
        >
          <FaPlus />
          <span>Nuevo Producto</span>
        </motion.button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
            />
          </div>
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
            >
              <option value="all">Todas las categorías</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.icon ? `${cat.icon} ${cat.name}` : cat.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className="h-48 bg-gradient-to-br from-coffee-100 to-coffee-200 flex items-center justify-center relative">
              <span className="text-6xl">
                {product.category === 'bebidas' ? '☕' : 
                 product.category === 'postres' ? '🍰' : '🥐'}
              </span>
              <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${
                product.available ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}>
                {product.available ? 'Disponible' : 'No disponible'}
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-bold text-coffee-800 mb-2">{product.name}</h3>
              <p className="text-coffee-600 text-sm mb-3 line-clamp-2">{product.description}</p>
              
              <div className="flex justify-between items-center mb-4">
                <span className="text-2xl font-bold text-green-600">€{product.price.toFixed(2)}</span>
                <span className="px-3 py-1 bg-coffee-100 text-coffee-600 rounded-full text-sm capitalize">
                  {product.category}
                </span>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleOpenModal(product)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold flex items-center justify-center space-x-1 transition-colors"
                >
                  <FaEdit className="text-sm" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-coffee-800 mb-2">No se encontraron productos</h3>
          <p className="text-coffee-600">Intenta cambiar los filtros o crear un nuevo producto</p>
        </motion.div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
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
              className="bg-white rounded-xl max-w-md w-full p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-coffee-800">
                  {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                editingProduct ? handleUpdateProduct() : handleCreateProduct();
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-coffee-700 mb-1">
                    Nombre del producto
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                    placeholder="Ej: Cappuccino Clásico"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-coffee-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                    placeholder="Describe el producto..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-coffee-700 mb-1">
                      Precio (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.price || ''}
                      onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-coffee-700 mb-1">
                      Categoría
                    </label>
                    <select
                      required
                      value={formData.category || (categories.length > 0 ? categories[0].id : 'bebidas')}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.icon ? `${cat.icon} ${cat.name}` : cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-coffee-700 mb-1">
                    Imagen del producto
                  </label>
                  <div className="space-y-3">
                    {imagePreview ? (
                      <div className="relative">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-full h-32 object-cover rounded-lg border border-coffee-200"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
                        >
                          <FaTimes className="text-xs" />
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-coffee-200 rounded-lg p-6 text-center hover:border-coffee-400 transition-colors">
                        <FaImage className="mx-auto text-3xl text-coffee-400 mb-3" />
                        <p className="text-sm text-coffee-600 mb-2">Selecciona una imagen</p>
                        <p className="text-xs text-coffee-500">PNG, JPG hasta 5MB</p>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <label className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                        <div className={`px-4 py-2 rounded-lg font-medium cursor-pointer transition-colors flex items-center justify-center space-x-2 ${
                          uploadingImage 
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                            : 'bg-coffee-100 hover:bg-coffee-200 text-coffee-700'
                        }`}>
                          {uploadingImage ? (
                            <>
                              <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                              <span>Subiendo...</span>
                            </>
                          ) : (
                            <>
                              <FaUpload />
                              <span>Subir imagen</span>
                            </>
                          )}
                        </div>
                      </label>
                      {selectedImage && (
                        <button
                          type="button"
                          onClick={removeImage}
                          className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg transition-colors"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="available"
                    checked={formData.available !== false}
                    onChange={(e) => setFormData({...formData, available: e.target.checked})}
                    className="w-4 h-4 text-coffee-600 rounded focus:ring-coffee-500"
                  />
                  <label htmlFor="available" className="text-sm font-medium text-coffee-700">
                    Producto disponible
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-coffee-600 hover:bg-coffee-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                  >
                    <FaCheck />
                    <span>{editingProduct ? 'Actualizar' : 'Crear'}</span>
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

export default ProductManagement;
