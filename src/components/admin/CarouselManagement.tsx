import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaTimes, 
  FaSave, 
  FaImages,
  FaUpload,
  FaEye,
  FaEyeSlash,
  FaArrowUp,
  FaArrowDown,
  FaLink,
  FaToggleOn,
  FaToggleOff,
  FaSort
} from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

interface CarouselImage {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  link?: string;
  active: boolean;
  order_position: number;
  created_at: string;
}

interface CarouselManagementProps {
  token: string;
}

const CarouselManagement: React.FC<CarouselManagementProps> = ({ token }) => {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingImage, setEditingImage] = useState<CarouselImage | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    image: '',
    link: '',
    active: true,
    order_position: 0,
  });

  const [imageUploading, setImageUploading] = useState(false);
  const [draggedItem, setDraggedItem] = useState<CarouselImage | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await axios.get('http://localhost:8000/admin/carousel', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setImages(response.data.sort((a: CarouselImage, b: CarouselImage) => a.order_position - b.order_position));
    } catch (error: any) {
      console.error('Error fetching carousel images:', error);
      toast.error('Error al cargar imágenes del carrusel');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.image) {
      toast.error('Por favor completa los campos obligatorios (título e imagen)');
      return;
    }

    try {
      // Si es nueva imagen y no se especificó posición, usar la siguiente disponible
      if (!editingImage && formData.order_position === 0) {
        const maxPosition = Math.max(...images.map(img => img.order_position), 0);
        formData.order_position = maxPosition + 1;
      }

      if (editingImage) {
        await axios.put(
          `http://localhost:8000/admin/carousel/${editingImage.id}`,
          formData,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        toast.success('Imagen actualizada correctamente');
      } else {
        await axios.post('http://localhost:8000/admin/carousel', formData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        toast.success('Imagen agregada correctamente');
      }

      fetchImages();
      resetForm();
      setShowModal(false);
    } catch (error: any) {
      console.error('Error saving carousel image:', error);
      toast.error('Error al guardar la imagen');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta imagen del carrusel?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8000/admin/carousel/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success('Imagen eliminada correctamente');
      fetchImages();
    } catch (error: any) {
      console.error('Error deleting carousel image:', error);
      toast.error('Error al eliminar la imagen');
    }
  };

  const handleEdit = (image: CarouselImage) => {
    setEditingImage(image);
    setFormData({
      title: image.title,
      subtitle: image.subtitle || '',
      description: image.description || '',
      image: image.image,
      link: image.link || '',
      active: image.active,
      order_position: image.order_position,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingImage(null);
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      image: '',
      link: '',
      active: true,
      order_position: 0,
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/admin/upload-image', uploadFormData, {
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

  const toggleActive = async (image: CarouselImage) => {
    try {
      await axios.put(
        `http://localhost:8000/admin/carousel/${image.id}`,
        { active: !image.active },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      toast.success(`Imagen ${!image.active ? 'activada' : 'desactivada'}`);
      fetchImages();
    } catch (error: any) {
      console.error('Error toggling active status:', error);
      toast.error('Error al cambiar el estado de la imagen');
    }
  };

  const moveImage = async (imageId: number, direction: 'up' | 'down') => {
    const sortedImages = [...images].sort((a, b) => a.order_position - b.order_position);
    const currentIndex = sortedImages.findIndex(img => img.id === imageId);
    
    if (
      (direction === 'up' && currentIndex === 0) || 
      (direction === 'down' && currentIndex === sortedImages.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const currentImage = sortedImages[currentIndex];
    const swapImage = sortedImages[newIndex];

    try {
      // Intercambiar posiciones
      await axios.put(
        `http://localhost:8000/admin/carousel/${currentImage.id}`,
        { order_position: swapImage.order_position },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      await axios.put(
        `http://localhost:8000/admin/carousel/${swapImage.id}`,
        { order_position: currentImage.order_position },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      toast.success('Orden actualizado');
      fetchImages();
    } catch (error: any) {
      console.error('Error reordering images:', error);
      toast.error('Error al reordenar las imágenes');
    }
  };

  const reorderImages = async () => {
    try {
      // Reordenar todas las imágenes para tener posiciones consecutivas
      const sortedImages = [...images].sort((a, b) => a.order_position - b.order_position);
      
      for (let i = 0; i < sortedImages.length; i++) {
        const newPosition = i + 1;
        if (sortedImages[i].order_position !== newPosition) {
          await axios.put(
            `http://localhost:8000/admin/carousel/${sortedImages[i].id}`,
            { order_position: newPosition },
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
        }
      }

      toast.success('Orden reorganizado correctamente');
      fetchImages();
    } catch (error: any) {
      console.error('Error reordering all images:', error);
      toast.error('Error al reorganizar las imágenes');
    }
  };

  // Filter images
  const filteredImages = images.filter(image => {
    const matchesSearch = image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (image.subtitle && image.subtitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (image.description && image.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesActive = filterActive === 'all' || 
                         (filterActive === 'active' && image.active) ||
                         (filterActive === 'inactive' && !image.active);

    return matchesSearch && matchesActive;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-coffee-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-coffee-600">Cargando carrusel...</p>
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
            <FaImages className="mr-3 text-coffee-600" />
            Gestión del Carrusel
          </h2>
          <p className="text-gray-600">Administra las imágenes del carrusel principal del sitio web</p>
        </div>
        <div className="flex space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={reorderImages}
            className="bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold flex items-center space-x-2 hover:bg-blue-700 transition-colors"
          >
            <FaSort />
            <span>Reorganizar</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)}
            className="bg-coffee-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 hover:bg-coffee-700 transition-colors shadow-lg"
          >
            <FaPlus />
            <span>Nueva Imagen</span>
          </motion.button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <input
              type="text"
              placeholder="Buscar imágenes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-coffee-500 focus:border-coffee-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-coffee-500 focus:border-coffee-500"
            >
              <option value="all">Todas</option>
              <option value="active">Activas</option>
              <option value="inactive">Inactivas</option>
            </select>
          </div>
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              {filteredImages.length} de {images.length} imágenes
            </div>
          </div>
        </div>
      </div>

      {/* Images Grid */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {filteredImages.length === 0 ? (
          <div className="text-center py-12">
            <FaImages className="mx-auto text-6xl text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No hay imágenes en el carrusel</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 bg-coffee-600 text-white px-6 py-2 rounded-lg hover:bg-coffee-700 transition-colors"
            >
              Agregar primera imagen
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
            {filteredImages
              .sort((a, b) => a.order_position - b.order_position)
              .map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:border-coffee-300 transition-all duration-200 hover:shadow-lg"
              >
                {/* Image */}
                <div className="relative">
                  <img
                    src={`http://localhost:8000${image.image}`}
                    alt={image.title}
                    className="w-full h-48 object-cover"
                  />
                  
                  {/* Order badge */}
                  <div className="absolute top-3 left-3 bg-coffee-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                    {image.order_position}
                  </div>

                  {/* Status badge */}
                  <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
                    image.active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {image.active ? 'Activa' : 'Inactiva'}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">{image.title}</h3>
                  
                  {image.subtitle && (
                    <p className="text-coffee-600 text-sm font-medium mb-2">{image.subtitle}</p>
                  )}
                  
                  {image.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{image.description}</p>
                  )}

                  {image.link && (
                    <div className="flex items-center text-xs text-blue-600 mb-3">
                      <FaLink className="mr-1" />
                      <span className="truncate">{image.link}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => moveImage(image.id, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-coffee-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Subir"
                      >
                        <FaArrowUp />
                      </button>
                      <button
                        onClick={() => moveImage(image.id, 'down')}
                        disabled={index === filteredImages.length - 1}
                        className="p-1 text-gray-400 hover:text-coffee-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Bajar"
                      >
                        <FaArrowDown />
                      </button>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => toggleActive(image)}
                        className={`text-lg ${
                          image.active ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'
                        } transition-colors`}
                        title={image.active ? 'Desactivar' : 'Activar'}
                      >
                        {image.active ? <FaEye /> : <FaEyeSlash />}
                      </button>
                      <button
                        onClick={() => handleEdit(image)}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors"
                        title="Editar"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(image.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Eliminar"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
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
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">
                    {editingImage ? 'Editar Imagen del Carrusel' : 'Nueva Imagen del Carrusel'}
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Imagen *
                    </label>
                    <div className="flex space-x-2 mb-3">
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
                      <div className="mt-3">
                        <img
                          src={`http://localhost:8000${formData.image}`}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-coffee-500 focus:border-coffee-500"
                      placeholder="Título principal de la imagen"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subtítulo
                    </label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-coffee-500 focus:border-coffee-500"
                      placeholder="Subtítulo opcional"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-coffee-500 focus:border-coffee-500"
                      placeholder="Descripción adicional de la imagen..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enlace (URL)
                    </label>
                    <input
                      type="url"
                      value={formData.link}
                      onChange={(e) => setFormData({...formData, link: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-coffee-500 focus:border-coffee-500"
                      placeholder="https://ejemplo.com (opcional)"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Posición en el carrusel
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.order_position}
                        onChange={(e) => setFormData({...formData, order_position: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-coffee-500 focus:border-coffee-500"
                        placeholder="Orden de aparición"
                      />
                    </div>

                    <div className="flex items-center">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.active}
                          onChange={(e) => setFormData({...formData, active: e.target.checked})}
                          className="mr-3 w-4 h-4 text-coffee-600 border-gray-300 rounded focus:ring-coffee-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Imagen activa en el carrusel
                        </span>
                      </label>
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
                      <span>{editingImage ? 'Actualizar' : 'Crear'} Imagen</span>
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

export default CarouselManagement;
