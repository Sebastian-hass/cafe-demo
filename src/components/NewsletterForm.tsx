import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaPaperPlane } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

interface NewsletterFormProps {
  className?: string;
}

const NewsletterForm: React.FC<NewsletterFormProps> = ({ className = "" }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Por favor ingresa tu email');
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:8000/newsletter/subscribe', {
        email,
        name: name || undefined
      });
      
      if (response.data.success) {
        if (response.data.already_subscribed) {
          toast.success('¡Ya estás suscrito a nuestro newsletter!');
        } else {
          toast.success('¡Suscripción exitosa! Te mantendremos informado.');
        }
        setEmail('');
        setName('');
      }
    } catch (error: any) {
      console.error('Error suscribing to newsletter:', error);
      toast.error(error.response?.data?.detail || 'Error al suscribirse al newsletter');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Tu nombre (opcional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 px-6 py-3 rounded-full text-coffee-800 border-0 focus:ring-4 focus:ring-coffee-300 outline-none"
            disabled={loading}
          />
          <input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 px-6 py-3 rounded-full text-coffee-800 border-0 focus:ring-4 focus:ring-coffee-300 outline-none"
            disabled={loading}
          />
        </div>
        
        <motion.button
          type="submit"
          whileHover={{ scale: loading ? 1 : 1.05 }}
          whileTap={{ scale: loading ? 1 : 0.95 }}
          disabled={loading}
          className={`w-full bg-white text-coffee-700 px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 ${
            loading ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-coffee-700 border-t-transparent rounded-full animate-spin"></div>
              <span>Suscribiendo...</span>
            </>
          ) : (
            <>
              <FaPaperPlane />
              <span>Suscribirse</span>
            </>
          )}
        </motion.button>
      </form>
    </div>
  );
};

export default NewsletterForm;
