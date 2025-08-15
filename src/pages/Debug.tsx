import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { API_URL } from '../config/api';
const Debug: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['debug-test'],
    queryFn: async () => {
      console.log('🔍 Haciendo request a la API...');
      const response = await axios.get(`${API_URL}/health`);
      console.log('✅ Respuesta recibida:', response.data);
      return response.data;
    },
  });

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">🔧 Página de Debug</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Estado de la Conexión API</h2>
          
          {isLoading && (
            <div className="text-blue-600">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              Conectando con el backend...
            </div>
          )}

          {error && (
            <div className="text-red-600 bg-red-50 p-4 rounded-lg">
              <h3 className="font-bold mb-2">❌ Error de Conexión:</h3>
              <p className="mb-2">No se puede conectar con el backend</p>
              <details className="text-sm">
                <summary className="cursor-pointer">Ver detalles del error</summary>
                <pre className="mt-2 text-xs overflow-auto">
                  {JSON.stringify(error, null, 2)}
                </pre>
              </details>
              
              <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <h4 className="font-medium text-yellow-800">💡 Posibles soluciones:</h4>
                <ul className="list-disc list-inside text-yellow-700 mt-2 space-y-1">
                  <li>Verifica que el backend esté corriendo en <code>{API_URL}</code></li>
                  <li>Revisa la consola del navegador para errores de CORS</li>
                  <li>Asegúrate de que no haya un firewall bloqueando la conexión</li>
                </ul>
              </div>
            </div>
          )}

          {data && (
            <div className="text-green-600 bg-green-50 p-4 rounded-lg">
              <h3 className="font-bold mb-2">✅ Conexión Exitosa!</h3>
              <p className="mb-2">Backend respondió correctamente</p>
              <pre className="text-sm bg-green-100 p-2 rounded overflow-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">🌐 URLs de Prueba</h3>
            <div className="space-y-2">
              <a 
                href={`${API_URL}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-blue-600 hover:underline"
              >
                {API_URL} - API Root
              </a>
              <a 
                href={`${API_URL}/docs`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-blue-600 hover:underline"
              >
                {API_URL}/docs - API Documentation
              </a>
              <a 
                href={`${API_URL}/health`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-blue-600 hover:underline"
              >
                {API_URL}/health - Health Check
              </a>
              <a 
                href={`${API_URL}/specials`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-blue-600 hover:underline"
              >
                {API_URL}/specials - Especiales del día
              </a>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">🛠️ Información del Sistema</h3>
            <div className="text-sm space-y-1">
              <p><strong>Frontend:</strong> {window.location.origin}</p>
              <p><strong>Backend:</strong> {API_URL}</p>
              <p><strong>User Agent:</strong> {navigator.userAgent}</p>
              <p><strong>Fecha:</strong> {new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Debug;
