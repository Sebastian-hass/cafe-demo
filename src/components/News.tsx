import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaUser, FaArrowRight, FaSearch, FaTags } from 'react-icons/fa';
import axios from 'axios';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import NewsletterForm from './NewsletterForm';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  image: string | null;
  author: string;
  created_at: string;
  updated_at: string;
  published: boolean;
  featured: boolean;
  tags: string[];
  category: string;
}

const News: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  
  const itemsPerPage = 6;
  const categories = ['all', 'promociones', 'eventos', 'nuevo-menu', 'comunidad'];

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/news');
      // Filtrar solo noticias publicadas
      const publishedNews = response.data.filter((item: NewsItem) => item.published);
      setNews(publishedNews);
    } catch (error) {
      console.error('Error fetching news:', error);
      setError('Error al cargar las noticias');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar noticias
  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Paginación
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedNews = filteredNews.slice(startIndex, startIndex + itemsPerPage);

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'all': 'Todas',
      'promociones': 'Promociones',
      'eventos': 'Eventos',
      'nuevo-menu': 'Nuevo Menú',
      'comunidad': 'Comunidad'
    };
    return labels[category] || category;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d 'de' MMMM, yyyy", { locale: es });
    } catch {
      return dateString;
    }
  };

  const openNewsModal = (newsItem: NewsItem) => {
    setSelectedNews(newsItem);
  };

  const closeNewsModal = () => {
    setSelectedNews(null);
  };

  const NewsCard = ({ item }: { item: NewsItem }) => (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 cursor-pointer"
      onClick={() => openNewsModal(item)}
    >
      {item.image && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={`http://localhost:8000${item.image}`}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          />
          <div className="absolute top-4 left-4">
            <span className="bg-coffee-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
              {getCategoryLabel(item.category)}
            </span>
          </div>
        </div>
      )}
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 hover:text-coffee-600 transition-colors">
          {item.title}
        </h3>
        
        <p className="text-gray-600 mb-4 line-clamp-3">
          {item.excerpt}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <FaUser className="mr-1" />
              <span>{item.author}</span>
            </div>
            <div className="flex items-center">
              <FaCalendarAlt className="mr-1" />
              <span>{formatDate(item.created_at)}</span>
            </div>
          </div>
          {item.featured && (
            <div className="flex items-center">
              <span className="text-yellow-500 mr-1">⭐</span>
              <span className="text-xs">Destacado</span>
            </div>
          )}
        </div>
        
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {item.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="bg-coffee-50 text-coffee-600 px-2 py-1 rounded-full text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
        
        <div className="flex items-center text-coffee-600 font-semibold group">
          <span>Leer más</span>
          <FaArrowRight className="ml-2 transform transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </motion.article>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-coffee-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-coffee-600 text-lg">Cargando noticias...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error al cargar</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchNews}
            className="mt-4 bg-coffee-600 text-white px-6 py-2 rounded-lg hover:bg-coffee-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-display font-bold text-gray-800 mb-4"
          >
            Noticias y Novedades ☕
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600"
          >
            Mantente al día con las últimas noticias de nuestro café
          </motion.p>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar noticias, temas o etiquetas..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {getCategoryLabel(category)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Mostrando {filteredNews.length} noticia{filteredNews.length !== 1 ? 's' : ''}
          </div>
        </motion.div>

        {/* News Grid */}
        {paginatedNews.length > 0 ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
            >
              {paginatedNews.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <NewsCard item={item} />
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      currentPage === page
                        ? 'bg-coffee-600 text-white'
                        : 'bg-white text-coffee-600 hover:bg-coffee-50 border border-coffee-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 text-6xl mb-4">📰</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No hay noticias disponibles</h3>
            <p className="text-gray-600">
              {searchTerm || selectedCategory !== 'all'
                ? 'No se encontraron noticias que coincidan con los filtros aplicados.'
                : 'Aún no hay noticias publicadas. ¡Vuelve pronto!'}
            </p>
          </motion.div>
        )}
      </div>

      {/* Newsletter Subscription Section */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-coffee-600 to-coffee-800 text-white py-12 mt-16 rounded-xl mx-4"
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">📧 ¡Mantente informado!</h2>
          <p className="text-lg opacity-90 mb-8">
            Suscríbete a nuestro newsletter y recibe las últimas noticias, ofertas especiales y eventos directamente en tu email.
          </p>
          <NewsletterForm />
          <p className="text-sm opacity-75 mt-6">
            ✨ Sin spam • 📅 Solo contenido relevante • 🚫 Puedes darte de baja en cualquier momento
          </p>
        </div>
      </motion.section>

      {/* News Modal */}
      {selectedNews && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Noticia Completa</h2>
              <button
                onClick={closeNewsModal}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              {selectedNews.image && (
                <img
                  src={`http://localhost:8000${selectedNews.image}`}
                  alt={selectedNews.title}
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
              )}
              
              <div className="flex items-center space-x-4 mb-4">
                <span className="bg-coffee-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {getCategoryLabel(selectedNews.category)}
                </span>
                <div className="flex items-center text-gray-500 text-sm">
                  <FaCalendarAlt className="mr-1" />
                  <span>{formatDate(selectedNews.created_at)}</span>
                </div>
                <div className="flex items-center text-gray-500 text-sm">
                  <FaUser className="mr-1" />
                  <span>{selectedNews.author}</span>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-800 mb-4">{selectedNews.title}</h1>
              
              <div 
                className="prose prose-lg max-w-none text-gray-700 mb-6"
                dangerouslySetInnerHTML={{ __html: selectedNews.content }}
              />
              
              {selectedNews.tags.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center mb-2">
                    <FaTags className="mr-2 text-coffee-600" />
                    <span className="font-semibold text-gray-800">Etiquetas:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedNews.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-coffee-50 text-coffee-600 px-3 py-1 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default News;
