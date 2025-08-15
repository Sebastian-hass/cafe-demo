import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlus, 
  FaTrash, 
  FaStar,
  FaTimes,
  FaCheck,
  FaCalendarAlt,
  FaPercent
} from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
}

interface Special {
  id: number;
  product: Product;
  discount: number;
  date: string;
}

interface SpecialsManagementProps {
  token: string;
}

const SpecialsManagement: React.FC<SpecialsManagementProps> = ({ token }) => {
  const [specials, setSpecials] = useState<Special[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    product_id: '',
    discount: 0,
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchSpecials();
    fetchProducts();
  }, []);

  const fetchSpecials = async () => {
    try {
      const response = await axios.get('http://localhost:8000/admin/specials', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSpecials(response.data);
    } catch (error) {
      console.error('Error fetching specials:', error);
      toast.error('Error cargando especiales');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:8000/admin/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setProducts(response.data.filter((p: Product) => p.available));
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error cargando productos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSpecial = async () => {
    try {
      const response = await axios.post('http://localhost:8000/admin/specials', formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success('¡Especial creado exitosamente!');
      handleCloseModal();
      fetchSpecials(); // Refresh the list
    } catch (error: any) {
      console.error('Error creating special:', error);
      toast.error(error.response?.data?.detail || 'Error creando especial');
    }
  };

  const handleDeleteSpecial = async (specialId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este especial?')) return;
    
    try {
      await axios.delete(`http://localhost:8000/admin/specials/${specialId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSpecials(specials.filter(s => s.id !== specialId));
      toast.success('¡Especial eliminado exitosamente!');
    } catch (error: any) {
      console.error('Error deleting special:', error);
      toast.error(error.response?.data?.detail || 'Error eliminando especial');
    }
  };

  const handleOpenModal = () => {
    setFormData({
      product_id: products.length > 0 ? products[0].id.toString() : '',
      discount: 10,
      date: new Date().toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      product_id: '',
      discount: 0,
      date: new Date().toISOString().split('T')[0]
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
          <h2 className="text-3xl font-bold text-coffee-800">Gestión de Especiales</h2>
          <p className="text-coffee-600">Administra ofertas y promociones especiales</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleOpenModal}
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 shadow-lg"
        >
          <FaPlus />
          <span>Nuevo Especial</span>
        </motion.button>
      </div>

      {/* Specials Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {specials.map((special) => (
          <motion.div
            key={special.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-white to-yellow-50 rounded-xl shadow-lg overflow-hidden border-2 border-yellow-200"
          >
            {/* Discount Badge */}
            <div className="relative">
              <div className="h-48 bg-gradient-to-br from-coffee-100 to-coffee-200 flex items-center justify-center">
                <span className="text-6xl">
                  {special.product.category === 'bebidas' ? '☕' : 
                   special.product.category === 'postres' ? '🍰' : '🥐'}
                </span>
              </div>
              <div className="absolute -top-2 -right-2 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg transform rotate-12">
                -{special.discount}%
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-2">
                <FaStar className="text-yellow-500" />
                <span className="text-yellow-700 font-semibold text-sm">ESPECIAL DEL DÍA</span>
              </div>
              
              <h3 className="text-xl font-bold text-coffee-800 mb-2">{special.product.name}</h3>
              <p className="text-coffee-600 text-sm mb-3 line-clamp-2">{special.product.description}</p>
              
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-lg text-gray-400 line-through">€{special.product.price.toFixed(2)}</span>
                  <span className="text-2xl font-bold text-green-600">
                    €{(special.product.price * (1 - special.discount / 100)).toFixed(2)}
                  </span>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                  -{special.discount}%
                </span>
              </div>
              
              <div className="flex items-center space-x-2 mb-4 text-sm text-coffee-500">
                <FaCalendarAlt />
                <span>{formatDate(special.date)}</span>
              </div>
              
              <button
                onClick={() => handleDeleteSpecial(special.id)}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors"
              >
                <FaTrash />
                <span>Eliminar Especial</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {specials.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-6xl mb-4">⭐</div>
          <h3 className="text-xl font-semibold text-coffee-800 mb-2">No hay especiales activos</h3>
          <p className="text-coffee-600">Crea tu primer especial para atraer más clientes</p>
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
                  Nuevo Especial
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
                handleCreateSpecial();
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-coffee-700 mb-1">
                    Producto
                  </label>
                  <select
                    required
                    value={formData.product_id}
                    onChange={(e) => setFormData({...formData, product_id: e.target.value})}
                    className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                  >
                    <option value="">Selecciona un producto</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} - €{product.price.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-coffee-700 mb-1">
                    Descuento (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="90"
                      required
                      value={formData.discount}
                      onChange={(e) => setFormData({...formData, discount: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 pr-10"
                      placeholder="10"
                    />
                    <FaPercent className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Descuento del 1% al 90%</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-coffee-700 mb-1">
                    Fecha del especial
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 pr-10"
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* Preview */}
                {formData.product_id && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-coffee-800 mb-2">Vista previa:</h4>
                    {(() => {
                      const selectedProduct = products.find(p => p.id.toString() === formData.product_id);
                      if (selectedProduct) {
                        const originalPrice = selectedProduct.price;
                        const discountedPrice = originalPrice * (1 - formData.discount / 100);
                        return (
                          <div className="text-sm">
                            <p><strong>{selectedProduct.name}</strong></p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="line-through text-gray-500">€{originalPrice.toFixed(2)}</span>
                              <span className="font-bold text-green-600">€{discountedPrice.toFixed(2)}</span>
                              <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">-{formData.discount}%</span>
                            </div>
                            <p className="text-gray-600 mt-1">
                              Ahorro: €{(originalPrice - discountedPrice).toFixed(2)}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                )}

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
                    disabled={!formData.product_id || formData.discount <= 0}
                    className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                  >
                    <FaCheck />
                    <span>Crear Especial</span>
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

export default SpecialsManagement;
