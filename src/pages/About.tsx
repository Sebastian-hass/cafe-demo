import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaHeart, FaCoffee, FaLeaf, FaUsers, FaAward, FaHandshake } from 'react-icons/fa';
import JobApplicationModal from '../components/JobApplicationModal';
import { Toaster } from 'react-hot-toast';

const About: React.FC = () => {
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);

  // Función para abrir Google Maps con la dirección de la cafetería
  const handleVisitUsClick = () => {
    // Coordenadas de ejemplo para Madrid, España (puedes cambiarlas por tu ubicación real)
    const latitude = 40.4168;
    const longitude = -3.7038;
    const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}&ll=${latitude},${longitude}&z=15`;
    
    window.open(googleMapsUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-coffee-700 to-coffee-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="text-6xl mb-6">☕</div>
            <h1 className="text-5xl md:text-6xl font-display font-bold mb-6">
              Nuestra Historia
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
              Desde 2010, construyendo comunidades una taza a la vez
            </p>
          </motion.div>
        </div>
      </section>

      {/* Historia */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="w-full h-96 bg-gradient-to-br from-coffee-100 to-coffee-200 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-8xl">🏪</span>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <h2 className="text-4xl font-display font-bold text-coffee-900">
                El Comienzo de un Sueño
              </h2>
              <p className="text-lg text-coffee-600 leading-relaxed">
                Todo comenzó en 2010, cuando María y José decidieron abrir un pequeño café 
                en el corazón de la ciudad. Su visión era simple pero poderosa: crear un 
                espacio donde las personas pudieran conectarse, relajarse y disfrutar del 
                mejor café de la región.
              </p>
              <p className="text-lg text-coffee-600 leading-relaxed">
                Lo que empezó como un local de 30m² con solo 6 mesas, se ha convertido en 
                una referencia gastronómica que combina la calidez tradicional con la 
                innovación tecnológica.
              </p>
              <div className="flex items-center space-x-4 pt-4">
                <div className="w-12 h-12 bg-coffee-600 rounded-full flex items-center justify-center">
                  <FaHeart className="text-white text-xl" />
                </div>
                <span className="text-lg font-semibold text-coffee-800">
                  Hecho con amor desde 2010
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-20 bg-gradient-to-b from-cream-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-display font-bold mb-4 text-coffee-900">
              🌟 Nuestros Valores
            </h2>
            <p className="text-xl text-coffee-600 max-w-3xl mx-auto">
              Los principios que guían cada decisión que tomamos y cada taza que servimos
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <FaCoffee className="text-3xl" />,
                title: "Calidad Premium",
                description: "Seleccionamos los mejores granos de café de origen único, tostados artesanalmente para garantizar el sabor excepcional en cada taza.",
                color: "from-coffee-400 to-coffee-600"
              },
              {
                icon: <FaLeaf className="text-3xl" />,
                title: "Sostenibilidad",
                description: "Comprometidos con el medio ambiente, trabajamos directamente con productores que practican agricultura sostenible y comercio justo.",
                color: "from-green-400 to-green-600"
              },
              {
                icon: <FaUsers className="text-3xl" />,
                title: "Comunidad",
                description: "Creamos espacios inclusivos donde las personas se sienten como en casa, fomentando conexiones auténticas y momentos memorables.",
                color: "from-blue-400 to-blue-600"
              }
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className={`w-20 h-20 bg-gradient-to-r ${value.color} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg text-white`}>
                  {value.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-coffee-800">{value.title}</h3>
                <p className="text-coffee-600 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Logros */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-display font-bold mb-4 text-coffee-900">
              🏆 Nuestros Logros
            </h2>
            <p className="text-xl text-coffee-600 max-w-3xl mx-auto">
              Reconocimientos que reflejan nuestro compromiso con la excelencia
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: "🥇",
                number: "2023",
                title: "Mejor Café",
                subtitle: "Premio Ciudad"
              },
              {
                icon: "⭐",
                number: "4.9/5",
                title: "Calificación",
                subtitle: "Google Reviews"
              },
              {
                icon: "👥",
                number: "15K+",
                title: "Clientes Felices",
                subtitle: "Y creciendo"
              },
              {
                icon: "🌱",
                number: "100%",
                title: "Café Sostenible",
                subtitle: "Comercio Justo"
              }
            ].map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="text-center p-6 bg-gradient-to-br from-coffee-50 to-cream-50 rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <div className="text-5xl mb-4">{achievement.icon}</div>
                <div className="text-3xl font-bold text-coffee-800 mb-2">{achievement.number}</div>
                <h3 className="text-lg font-semibold text-coffee-700 mb-1">{achievement.title}</h3>
                <p className="text-sm text-coffee-500">{achievement.subtitle}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Equipo */}
      <section className="py-20 bg-gradient-to-b from-cream-50 to-coffee-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-display font-bold mb-4 text-coffee-900">
              👨‍👩‍👧‍👦 Nuestro Equipo
            </h2>
            <p className="text-xl text-coffee-600 max-w-3xl mx-auto">
              Las personas apasionadas que hacen posible la magia de Café Demo cada día
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "María González",
                role: "Fundadora & CEO",
                emoji: "👩‍💼",
                description: "Visionaria y apasionada del café, lidera con el corazón"
              },
              {
                name: "José Rodríguez",
                role: "Maestro Tostador",
                emoji: "👨‍🍳",
                description: "Artista del café con 20 años de experiencia en tostado"
              },
              {
                name: "Ana Martín",
                role: "Barista Senior",
                emoji: "👩‍🎓",
                description: "Campeona nacional de latte art y experta en café especial"
              },
              {
                name: "Carlos López",
                role: "Manager de Experiencia",
                emoji: "👨‍💻",
                description: "Garantiza que cada cliente viva una experiencia única"
              },
              {
                name: "Sofia Chen",
                role: "Desarrolladora",
                emoji: "👩‍💻",
                description: "Ingeniera detrás de nuestra innovación tecnológica"
              },
              {
                name: "Luis Moreno",
                role: "Sommelier de Café",
                emoji: "👨‍🔬",
                description: "Experto en catación y selección de granos premium"
              }
            ].map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all"
              >
                <div className="text-6xl mb-4">{member.emoji}</div>
                <h3 className="text-xl font-bold text-coffee-800 mb-2">{member.name}</h3>
                <p className="text-coffee-600 font-semibold mb-3">{member.role}</p>
                <p className="text-coffee-500 text-sm">{member.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-coffee-700 to-coffee-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-6xl mb-6">🤝</div>
            <h2 className="text-4xl font-bold mb-4">¿Quieres ser parte de nuestra historia?</h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Te invitamos a visitarnos y descubrir por qué miles de personas 
              han hecho de Café Demo su segundo hogar
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleVisitUsClick}
                className="bg-white text-coffee-700 px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all inline-flex items-center space-x-2"
              >
                <FaHandshake className="text-xl" />
                <span>Visítanos Hoy</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsJobModalOpen(true)}
                className="border-2 border-white text-white hover:bg-white hover:text-coffee-700 px-8 py-4 rounded-full font-bold text-lg transition-all inline-flex items-center space-x-2"
              >
                <FaAward className="text-xl" />
                <span>Únete al Equipo</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Toast notifications */}
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 4000,
          style: {
            background: '#8b4513',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '16px',
          },
        }}
      />

      {/* Job Application Modal */}
      <JobApplicationModal 
        isOpen={isJobModalOpen} 
        onClose={() => setIsJobModalOpen(false)} 
      />
    </div>
  );
};

export default About;
