import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaChevronRight, FaStar, FaHeart, FaPlay, FaClock, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import NewsletterForm from '../components/NewsletterForm';

// Tipos definidos localmente para evitar problemas de importación
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

const API_BASE = 'http://localhost:8000';

// Componente para el carrusel de héroe
const HeroCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      id: 1,
      title: "☕ Café Demo",
      subtitle: "El mejor café de la ciudad",
      description: "Experiencia premium con tecnología avanzada",
      background: "from-coffee-700 to-coffee-900",
      emoji: "☕"
    },
    {
      id: 2,
      title: "🌅 Buenos Días",
      subtitle: "Comienza tu día perfecto",
      description: "Desayunos frescos y café recién hecho",
      background: "from-orange-400 to-red-500",
      emoji: "🥐"
    },
    {
      id: 3,
      title: "🌿 Ingredientes Naturales",
      subtitle: "Calidad premium",
      description: "Solo los mejores ingredientes orgánicos",
      background: "from-green-400 to-teal-500",
      emoji: "🌱"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.8 }}
          className={`absolute inset-0 bg-gradient-to-r ${slides[currentSlide].background} flex items-center justify-center text-white`}
        >
          <div className="text-center z-10 px-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="text-8xl mb-6"
            >
              {slides[currentSlide].emoji}
            </motion.div>
            <motion.h1
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-6xl md:text-7xl font-display font-bold mb-4"
            >
              {slides[currentSlide].title}
            </motion.h1>
            <motion.h2
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-2xl md:text-3xl mb-4 font-light"
            >
              {slides[currentSlide].subtitle}
            </motion.h2>
            <motion.p
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-xl mb-8 opacity-90"
            >
              {slides[currentSlide].description}
            </motion.p>
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1 }}
              className="space-x-4"
            >
              <Link 
                to="/menu" 
                className="bg-white text-coffee-700 hover:bg-cream-100 px-8 py-4 rounded-full text-lg font-bold transition-all transform hover:scale-105 inline-flex items-center space-x-2 shadow-lg"
              >
                <span>Ver Menú</span>
                <FaPlay className="text-sm" />
              </Link>
              <Link 
                to="/reservations"
                className="border-2 border-white text-white hover:bg-white hover:text-coffee-700 px-8 py-4 rounded-full text-lg font-bold transition-all transform hover:scale-105 inline-block"
              >
                Reservar Mesa
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controles del carrusel */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-4 h-4 rounded-full transition-all ${
              index === currentSlide 
                ? 'bg-white scale-125' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>
      
      {/* Flechas de navegación */}
      <button
        onClick={() => setCurrentSlide((prev) => prev === 0 ? slides.length - 1 : prev - 1)}
        className="absolute left-8 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-3 transition-all z-20"
      >
        <FaChevronLeft className="text-white text-xl" />
      </button>
      <button
        onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
        className="absolute right-8 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-3 transition-all z-20"
      >
        <FaChevronRight className="text-white text-xl" />
      </button>
    </div>
  );
};

// Componente para carrusel de especiales
const SpecialsCarousel: React.FC<{ specials: Special[] }> = ({ specials }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % specials.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => prev === 0 ? specials.length - 1 : prev - 1);
  };

  const toggleFavorite = (id: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
        toast.success('♥️ Eliminado de favoritos');
      } else {
        newFavorites.add(id);
        toast.success('❤️ Añadido a favoritos');
      }
      return newFavorites;
    });
  };

  if (specials.length === 0) return null;

  return (
    <div className="relative max-w-4xl mx-auto">
      <div className="overflow-hidden rounded-2xl shadow-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-white to-cream-50 p-8 relative"
          >
            {/* Badge de descuento */}
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="absolute -top-4 -right-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg z-10"
            >
              -{specials[currentIndex].discount}% OFF
            </motion.div>

            {/* Botón de favorito */}
            <button
              onClick={() => toggleFavorite(specials[currentIndex].id)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all transform hover:scale-110 z-10"
            >
              <FaHeart 
                className={`text-xl ${
                  favorites.has(specials[currentIndex].id) 
                    ? 'text-red-500' 
                    : 'text-gray-300'
                }`} 
              />
            </button>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Imagen del producto */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <div className="w-full h-64 bg-gradient-to-br from-coffee-100 to-coffee-200 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                  <motion.span 
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                    className="text-8xl"
                  >
                    {specials[currentIndex].product.category === 'bebidas' ? '☕' : 
                     specials[currentIndex].product.category === 'postres' ? '🍰' : '🥐'}
                  </motion.span>
                </div>
                
                {/* Estrellas de calidad */}
                <div className="flex justify-center mt-4 space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400 text-lg" />
                  ))}
                </div>
              </motion.div>

              {/* Información del producto */}
              <div className="space-y-4">
                <motion.h3 
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="text-3xl font-bold text-coffee-800"
                >
                  {specials[currentIndex].product.name}
                </motion.h3>
                
                <motion.p
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-coffee-600 text-lg leading-relaxed"
                >
                  {specials[currentIndex].product.description}
                </motion.p>
                
                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center space-x-4"
                >
                  <span className="text-4xl font-bold text-green-600">
                    €{(specials[currentIndex].product.price * (1 - specials[currentIndex].discount / 100)).toFixed(2)}
                  </span>
                  <span className="text-2xl text-gray-400 line-through">
                    €{specials[currentIndex].product.price.toFixed(2)}
                  </span>
                </motion.div>
                
                <motion.button
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toast.success('🚀 ¡Añadido al carrito!')}
                  className="bg-coffee-600 hover:bg-coffee-700 text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg transition-all flex items-center space-x-2"
                >
                  <span>Ordenar Ahora</span>
                  <span>📍</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controles del carrusel */}
      <div className="flex justify-center items-center mt-8 space-x-6">
        <button
          onClick={prevSlide}
          className="bg-coffee-600 hover:bg-coffee-700 text-white p-4 rounded-full shadow-lg transition-all transform hover:scale-110"
        >
          <FaChevronLeft className="text-xl" />
        </button>
        
        <div className="flex space-x-2">
          {specials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-coffee-600 scale-125' 
                  : 'bg-coffee-300 hover:bg-coffee-400'
              }`}
            />
          ))}
        </div>
        
        <button
          onClick={nextSlide}
          className="bg-coffee-600 hover:bg-coffee-700 text-white p-4 rounded-full shadow-lg transition-all transform hover:scale-110"
        >
          <FaChevronRight className="text-xl" />
        </button>
      </div>
    </div>
  );
};

const Home: React.FC = () => {
  const { data: specials = [], isLoading, error } = useQuery<Special[]>({
    queryKey: ['specials'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE}/specials`);
      return response.data;
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white">
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 3000,
          style: {
            background: '#8b4513',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '16px',
          },
        }}
      />
      
      {/* Hero Carousel */}
      <HeroCarousel />
      
      {/* Especiales del Día con Carrusel */}
      <section className="py-20 bg-gradient-to-b from-white to-cream-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-display font-bold mb-4 text-coffee-900">
              🌟 Especiales de Hoy
            </h2>
            <p className="text-xl text-coffee-600 max-w-2xl mx-auto">
              Descubre nuestras ofertas especiales, cuidadosamente seleccionadas para brindarte 
              la mejor experiencia de sabor al mejor precio
            </p>
          </motion.div>
          
          {isLoading && (
            <div className="text-center py-20">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="inline-block w-16 h-16 border-4 border-coffee-600 border-t-transparent rounded-full"
              />
              <p className="mt-4 text-coffee-700 text-lg">Cargando especiales...</p>
            </div>
          )}

          {error && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-700 px-8 py-6 rounded-xl max-w-md mx-auto"
            >
              <div className="text-4xl mb-4">😢</div>
              <p className="font-semibold mb-2">Oops! Algo salió mal</p>
              <p className="text-sm opacity-75">No pudimos cargar los especiales. ¿Está el backend funcionando?</p>
            </motion.div>
          )}

          {specials.length > 0 ? (
            <SpecialsCarousel specials={specials} />
          ) : !isLoading && !error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="text-8xl mb-6">💭</div>
              <p className="text-2xl text-coffee-600 mb-4">No hay especiales disponibles hoy</p>
              <p className="text-lg text-coffee-400">¡Vuelve mañana para nuevas ofertas!</p>
            </motion.div>
          )}
        </div>
      </section>
      
      {/* Sección de Características Mejorada */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-coffee-50 to-transparent opacity-50" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-display font-bold mb-4 text-coffee-900">
              🏆 ¿Por qué elegir Café Demo?
            </h2>
            <p className="text-xl text-coffee-600 max-w-3xl mx-auto">
              Combinamos la tradición del buen café con la innovación tecnológica para ofrecerte 
              una experiencia única e inolvidable
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🚀",
                title: "Tecnología Avanzada",
                description: "Sistema moderno con API REST, actualizaciones en tiempo real y una experiencia digital sin igual",
                color: "from-blue-400 to-purple-500"
              },
              {
                icon: "⚡",
                title: "Rápido y Eficiente",
                description: "Interfaz optimizada, pedidos instantáneos y un servicio que se adapta a tu ritmo de vida",
                color: "from-yellow-400 to-orange-500"
              },
              {
                icon: "📱",
                title: "Responsive Design",
                description: "Funciona perfectamente en móvil, tablet y desktop. Tu experiencia, sin límites",
                color: "from-green-400 to-teal-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className={`w-20 h-20 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                  <span className="text-3xl">{feature.icon}</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-coffee-800">{feature.title}</h3>
                <p className="text-coffee-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Información de Contacto Rápida */}
      <section className="py-16 bg-gradient-to-r from-coffee-100 to-coffee-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white p-6 rounded-xl shadow-md"
            >
              <FaClock className="text-4xl text-coffee-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-coffee-800 mb-2">Horario</h3>
              <p className="text-coffee-600">Lun - Dom<br />7:00 AM - 10:00 PM</p>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white p-6 rounded-xl shadow-md"
            >
              <FaMapMarkerAlt className="text-4xl text-coffee-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-coffee-800 mb-2">Ubicación</h3>
              <p className="text-coffee-600">Calle Principal 123<br />Centro de la Ciudad</p>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white p-6 rounded-xl shadow-md"
            >
              <FaPhone className="text-4xl text-coffee-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-coffee-800 mb-2">Teléfono</h3>
              <p className="text-coffee-600">+34 123 456 789<br />Atención 24/7</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Newsletter Subscription Section */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="py-20 bg-gradient-to-r from-coffee-600 to-coffee-800 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-black opacity-10" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="text-6xl mb-6">📧</div>
            <h2 className="text-4xl font-bold mb-4">¡Mantente informado!</h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Suscríbete a nuestro newsletter y recibe las últimas noticias, ofertas especiales 
              y eventos directamente en tu email.
            </p>
            
            {/* Newsletter Form */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="max-w-lg mx-auto"
            >
              <NewsletterForm className="mb-6" />
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-sm opacity-75"
            >
              ✨ Sin spam • 📅 Solo contenido relevante • 🚫 Puedes darte de baja en cualquier momento
            </motion.p>
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Chatbot Web Mejorado */}
      <section className="py-20 bg-gradient-to-r from-green-400 to-green-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-6xl mb-6">🤖</div>
            <h2 className="text-4xl font-bold mb-4">¿Preguntas sobre nuestro menú?</h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Nuestro asistente virtual con inteligencia artificial está disponible 24/7 
              para ayudarte con cualquier consulta
            </p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                toast.success('🚀 Abriendo chat con nuestro asistente...');
                // El ChatBot component maneja la apertura automáticamente
                // Enviar evento personalizado para abrir el chat
                setTimeout(() => {
                  const event = new CustomEvent('openChatBot');
                  window.dispatchEvent(event);
                }, 500);
              }}
              className="bg-white text-green-600 px-10 py-4 rounded-full font-bold text-xl shadow-xl hover:shadow-2xl transition-all inline-flex items-center space-x-3"
            >
              <span>🤖</span>
              <span>Chatear con IA</span>
              <span className="animate-pulse">✨</span>
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
