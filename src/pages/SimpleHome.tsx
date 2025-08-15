import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

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

const SimpleHome: React.FC = () => {
  const { data: specials = [], isLoading, error } = useQuery<Special[]>({
    queryKey: ['specials'],
    queryFn: async () => {
      console.log('🔍 Haciendo request a especiales...');
      try {
        const response = await axios.get('http://localhost:8000/specials', {
          timeout: 5000  // 5 segundos de timeout
        });
        console.log('✅ Datos recibidos:', response.data);
        return response.data;
      } catch (error) {
        console.error('❌ Error al hacer request:', error);
        throw error;
      }
    },
    retry: 2,
    retryDelay: 1000
  });

  console.log('🏠 SimpleHome render - isLoading:', isLoading, 'error:', error, 'specials:', specials);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', padding: '30px', borderRadius: '10px' }}>
        <h1 style={{ color: '#8b4513', textAlign: 'center' }}>☕ Café Demo - Página Simple</h1>
        <p style={{ textAlign: 'center', color: '#666' }}>Test de conectividad con el backend</p>
        
        <div style={{ margin: '30px 0', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h2>🌟 Especiales del Día</h2>
          
          {isLoading && (
            <div style={{ color: '#2563eb', textAlign: 'center', padding: '20px' }}>
              <p>🔄 Cargando especiales...</p>
            </div>
          )}

          {error && (
            <div style={{ color: '#dc2626', backgroundColor: '#fef2f2', padding: '15px', borderRadius: '8px', margin: '10px 0' }}>
              <h3>❌ Error al cargar especiales</h3>
              <p>No se pudo conectar con el backend</p>
              <details style={{ marginTop: '10px' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Ver detalles del error</summary>
                <pre style={{ fontSize: '12px', overflow: 'auto', marginTop: '10px', backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px' }}>
                  {JSON.stringify(error, null, 2)}
                </pre>
              </details>
            </div>
          )}

          {!isLoading && !error && specials.length === 0 && (
            <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
              <p>📭 No hay especiales disponibles hoy</p>
            </div>
          )}

          {specials.length > 0 && (
            <div>
              <p style={{ color: '#16a34a', fontWeight: 'bold' }}>✅ {specials.length} especiales cargados correctamente</p>
              
              {specials.map((special) => (
                <div 
                  key={special.id}
                  style={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '20px',
                    margin: '15px 0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ color: '#8b4513', margin: '0 0 10px 0' }}>
                        {special.product.name}
                      </h3>
                      <p style={{ color: '#666', margin: '0 0 10px 0', fontSize: '14px' }}>
                        {special.product.description}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#16a34a' }}>
                          €{(special.product.price * (1 - special.discount / 100)).toFixed(2)}
                        </span>
                        <span style={{ fontSize: '14px', color: '#9ca3af', textDecoration: 'line-through' }}>
                          €{special.product.price.toFixed(2)}
                        </span>
                        <span style={{ backgroundColor: '#dc2626', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>
                          -{special.discount}%
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <div style={{ fontSize: '40px' }}>
                        {special.product.category === 'bebidas' ? '☕' : 
                         special.product.category === 'postres' ? '🍰' : '🥐'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                        {special.product.category}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <h2>🔗 Enlaces de Prueba</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
            <a 
              href="http://localhost:8000/docs" 
              target="_blank"
              style={{ 
                backgroundColor: '#8b4513', 
                color: 'white', 
                padding: '10px 15px', 
                textDecoration: 'none', 
                borderRadius: '5px',
                fontSize: '14px'
              }}
            >
              📚 API Docs
            </a>
            <a 
              href="http://localhost:8000/specials" 
              target="_blank"
              style={{ 
                backgroundColor: '#16a34a', 
                color: 'white', 
                padding: '10px 15px', 
                textDecoration: 'none', 
                borderRadius: '5px',
                fontSize: '14px'
              }}
            >
              🌟 Ver JSON Especiales
            </a>
            <a 
              href="/debug" 
              style={{ 
                backgroundColor: '#2563eb', 
                color: 'white', 
                padding: '10px 15px', 
                textDecoration: 'none', 
                borderRadius: '5px',
                fontSize: '14px'
              }}
            >
              🔧 Debug Page
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleHome;
