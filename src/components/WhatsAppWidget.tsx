import React, { useState } from 'react';

import { API_URL } from '../config/api';
interface WhatsAppWidgetProps {
  phoneNumber?: string;
  message?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'small' | 'medium' | 'large';
  showTooltip?: boolean;
}

const WhatsAppWidget: React.FC<WhatsAppWidgetProps> = ({
  phoneNumber = '+14422338644', // Número de Twilio configurado en el .env
  message = '¡Hola! Me gustaría saber más sobre Café Demo',
  position = 'bottom-right',
  size = 'medium',
  showTooltip = true
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-14 h-14',
    large: 'w-16 h-16'
  };

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };

  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleTestChatbot = async () => {
    try {
      const response = await fetch(`${API_URL}/chatbot/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: 'Hola, ¿cómo estás?' })
      });

      if (response.ok) {
        const data = await response.json();
        alert(`🤖 Respuesta del chatbot: ${data.bot_response}`);
      } else {
        alert('❌ Error probando el chatbot');
      }
    } catch (error) {
      alert('❌ Error de conexión con el chatbot');
    }
  };

  return (
    <div className={`fixed z-50 ${positionClasses[position]}`}>
      {/* Tooltip */}
      {showTooltip && isHovered && (
        <div className={`absolute mb-2 ${position.includes('right') ? 'right-0' : 'left-0'} ${position.includes('bottom') ? 'bottom-full' : 'top-full'}`}>
          <div className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg">
            ¡Chatea con nosotros! 💬
            <div className={`absolute w-2 h-2 bg-gray-800 transform rotate-45 ${position.includes('bottom') ? '-bottom-1' : '-top-1'} ${position.includes('right') ? 'right-4' : 'left-4'}`}></div>
          </div>
        </div>
      )}

      {/* Popup de opciones */}
      {showPopup && (
        <div className={`absolute mb-2 ${position.includes('right') ? 'right-0' : 'left-0'} ${position.includes('bottom') ? 'bottom-full' : 'top-full'}`}>
          <div className="bg-white rounded-lg shadow-xl p-4 w-64 border">
            <h3 className="font-semibold text-gray-800 mb-3">¿Cómo te gustaría contactarnos?</h3>
            
            <button
              onClick={handleWhatsAppClick}
              className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg mb-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
              Enviar WhatsApp
            </button>

            <button
              onClick={handleTestChatbot}
              className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg mb-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 2.98.97 4.29L1 23l6.71-1.97C9.02 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.25 0-2.45-.2-3.57-.57L7 20l-1.43-.43C4.2 18.45 4 17.25 4 16c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              Probar Chatbot
            </button>

            <button
              onClick={() => setShowPopup(false)}
              className="w-full text-gray-600 hover:text-gray-800 text-sm py-2 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Botón principal */}
      <button
        onClick={() => setShowPopup(!showPopup)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          ${sizeClasses[size]}
          bg-green-500 hover:bg-green-600 
          text-white 
          rounded-full 
          shadow-lg hover:shadow-xl 
          flex items-center justify-center 
          transition-all duration-300 
          hover:scale-110
          animate-pulse
          group
        `}
        title="Chatea con nosotros"
      >
        <svg 
          className={`${size === 'small' ? 'w-6 h-6' : size === 'medium' ? 'w-7 h-7' : 'w-8 h-8'} group-hover:scale-110 transition-transform`} 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
        </svg>
        
        {/* Indicador de notificación */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-ping"></div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
      </button>
    </div>
  );
};

export default WhatsAppWidget;
