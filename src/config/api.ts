// Configuración de la API
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  // Timeout para las peticiones
  TIMEOUT: 30000,
};

// URL completa para hacer peticiones
export const API_URL = API_CONFIG.BASE_URL;
