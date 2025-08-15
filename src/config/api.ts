// Configuración de la API
export const API_CONFIG = {
  // Forzar uso de Render en producción
  BASE_URL: import.meta.env.VITE_API_URL || 'https://cafe-demo-bydt.onrender.com',
  // Timeout para las peticiones
  TIMEOUT: 30000,
};

// URL completa para hacer peticiones
export const API_URL = API_CONFIG.BASE_URL;

console.log('🔧 API URL configurada:', API_URL);
