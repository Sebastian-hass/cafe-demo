import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';

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

interface Category {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

interface OrderData {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  items: {
    product_id: number;
    product_name: string;
    quantity: number;
    price: number;
    notes?: string;
  }[];
  notes?: string;
}

const API_BASE = 'http://localhost:8000';

const Menu: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderForm, setOrderForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    notes: ''
  });

  // Query para obtener categorías
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE}/categories`);
      return response.data;
    },
  });

  // Query para obtener productos
  const { data: products = [], isLoading, error } = useQuery<Product[]>({
    queryKey: ['products', selectedCategory],
    queryFn: async () => {
      const url = selectedCategory 
        ? `${API_BASE}/products?category=${selectedCategory}`
        : `${API_BASE}/products`;
      const response = await axios.get(url);
      return response.data;
    },
  });

  // Mutación para crear pedido
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: OrderData) => {
      const response = await axios.post(`${API_BASE}/orders`, orderData);
      return response.data;
    },
    onSuccess: (data) => {
      alert(`¡Pedido #${data.id} confirmado! Te enviaremos una confirmación por email.`);
      setCart([]);
      setShowOrderModal(false);
      setOrderForm({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        notes: ''
      });
    },
    onError: (error: any) => {
      console.error('Error creando pedido:', error);
      alert('Error al crear el pedido. Por favor intenta de nuevo.');
    }
  });

  // Funciones del carrito
  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { product, quantity: 1 }];
      }
    });
  };

  const updateCartItemQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.product.id === productId
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  const removeFromCart = (productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderForm.customer_name.trim() || !orderForm.customer_email.trim()) {
      alert('Por favor completa los campos obligatorios (nombre y email)');
      return;
    }
    
    if (cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    const orderData: OrderData = {
      customer_name: orderForm.customer_name,
      customer_email: orderForm.customer_email,
      customer_phone: orderForm.customer_phone || undefined,
      notes: orderForm.notes || undefined,
      items: cart.map(item => ({
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        notes: item.notes
      }))
    };

    createOrderMutation.mutate(orderData);
  };

  const getCategoryEmoji = (category: string, categoryIcon?: string) => {
    if (categoryIcon) return categoryIcon;
    
    switch (category) {
      case 'bebidas': return '☕';
      case 'panaderia': return '🥐';
      case 'postres': return '🍰';
      default: return '🍽️';
    }
  };

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-coffee-800 to-coffee-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-display font-bold mb-4">📋 Nuestro Menú</h1>
          <p className="text-lg opacity-90">Descubre nuestras deliciosas opciones</p>
        </div>
      </section>

      {/* Filtros de Categoría */}
      <section className="bg-white shadow-sm sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full transition-colors ${
                selectedCategory === null
                  ? 'bg-coffee-600 text-white'
                  : 'bg-coffee-100 text-coffee-800 hover:bg-coffee-200'
              }`}
            >
              🍽️ Todos
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-coffee-600 text-white'
                    : 'bg-coffee-100 text-coffee-800 hover:bg-coffee-200'
                }`}
              >
                {getCategoryEmoji(category.id, category.icon)} {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Contenido Principal */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* Estados de carga y error */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-coffee-600"></div>
              <p className="mt-2 text-coffee-700">Cargando menú...</p>
            </div>
          )}

          {error && (
            <div className="text-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
              <p>Error al cargar el menú. ¿Está el backend funcionando?</p>
            </div>
          )}

          {/* Lista de productos */}
          {products.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4"
                >
                  {/* Imagen del producto */}
                  <div className="w-full h-40 bg-gradient-to-br from-coffee-100 to-coffee-200 rounded-lg mb-4 overflow-hidden relative">
                    <img 
                      src={`${API_BASE}/uploads/products/${product.image}`}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Si la imagen no se puede cargar, mostrar placeholder
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.emoji-placeholder')) {
                          const placeholder = document.createElement('div');
                          placeholder.className = 'emoji-placeholder absolute inset-0 flex items-center justify-center text-4xl';
                          const categoryData = categories.find(c => c.id === product.category);
                          placeholder.textContent = getCategoryEmoji(product.category, categoryData?.icon);
                          parent.appendChild(placeholder);
                        }
                      }}
                    />
                    {/* Fallback emoji que se muestra si no hay imagen */}
                    <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-20">
                      {getCategoryEmoji(product.category, categories.find(c => c.id === product.category)?.icon)}
                    </div>
                  </div>

                  {/* Información del producto */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-coffee-800 text-lg leading-tight">
                        {product.name}
                      </h3>
                      <span className="text-xs bg-coffee-100 text-coffee-700 px-2 py-1 rounded-full whitespace-nowrap ml-2">
                        {categories.find(c => c.id === product.category)?.name || product.category}
                      </span>
                    </div>
                    
                    <p className="text-coffee-600 text-sm line-clamp-2">
                      {product.description}
                    </p>
                    
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-2xl font-bold text-coffee-700">
                        €{product.price.toFixed(2)}
                      </span>
                      
                      <button 
                        onClick={() => addToCart(product)}
                        className="bg-coffee-600 hover:bg-coffee-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                      >
                        <span>🛒</span>
                        <span>Añadir</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Mensaje cuando no hay productos */}
          {!isLoading && !error && products.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-xl text-coffee-600 mb-2">
                No se encontraron productos
                {selectedCategory && (
                  <span> en la categoría "{categories.find(c => c.id === selectedCategory)?.name}"</span>
                )}
              </p>
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-coffee-600 hover:text-coffee-800 underline"
                >
                  Ver todos los productos
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Footer informativo */}
      <section className="bg-coffee-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-xl font-semibold mb-4">¿Necesitas ayuda para decidir?</h3>
          <p className="mb-6 opacity-90">
            Nuestro asistente IA puede recomendarte opciones según tus preferencias
          </p>
          <button
            onClick={() => {
              // Enviar evento personalizado para abrir el chatbot
              const event = new CustomEvent('openChatBot');
              window.dispatchEvent(event);
            }}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
          >
            <span>🤖</span>
            <span>Chatear con Asistente IA</span>
          </button>
        </div>
      </section>

      {/* Botón del carrito flotante */}
      {cart.length > 0 && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-6 right-6 bg-coffee-600 hover:bg-coffee-700 text-white p-4 rounded-full shadow-lg z-50 transition-colors"
        >
          <div className="relative">
            <span className="text-2xl">🛒</span>
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
              {getCartItemsCount()}
            </span>
          </div>
        </button>
      )}

      {/* Modal del carrito */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-coffee-800">Tu Pedido</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {cart.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between py-4 border-b">
                  <div className="flex-1">
                    <h3 className="font-semibold text-coffee-800">{item.product.name}</h3>
                    <p className="text-sm text-coffee-600">€{item.product.price.toFixed(2)} cada uno</p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => updateCartItemQuantity(item.product.id, item.quantity - 1)}
                      className="bg-coffee-100 hover:bg-coffee-200 text-coffee-800 w-8 h-8 rounded-full flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateCartItemQuantity(item.product.id, item.quantity + 1)}
                      className="bg-coffee-100 hover:bg-coffee-200 text-coffee-800 w-8 h-8 rounded-full flex items-center justify-center"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      🗑️
                    </button>
                  </div>
                  
                  <div className="text-right ml-4">
                    <p className="font-bold text-coffee-800">
                      €{(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-6 border-t bg-coffee-50">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-bold text-coffee-800">Total:</span>
                <span className="text-2xl font-bold text-coffee-800">€{getCartTotal().toFixed(2)}</span>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCart(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-medium transition-colors"
                >
                  Seguir comprando
                </button>
                <button
                  onClick={() => {
                    setShowCart(false);
                    setShowOrderModal(true);
                  }}
                  className="flex-1 bg-coffee-600 hover:bg-coffee-700 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Hacer pedido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal del formulario de pedido */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-coffee-800">Datos del cliente</h2>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <form onSubmit={handleOrderSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-coffee-700 mb-2">
                    Nombre completo *
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={orderForm.customer_name}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, customer_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                    placeholder="Tu nombre completo"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-coffee-700 mb-2">
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={orderForm.customer_email}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, customer_email: e.target.value }))}
                    className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                    placeholder="tu@email.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-coffee-700 mb-2">
                    Teléfono (opcional)
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={orderForm.customer_phone}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, customer_phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                    placeholder="123 456 789"
                  />
                </div>
                
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-coffee-700 mb-2">
                    Notas adicionales (opcional)
                  </label>
                  <textarea
                    id="notes"
                    value={orderForm.notes}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                    rows={3}
                    placeholder="Instrucciones especiales, alergias, etc."
                  >
                  </textarea>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-coffee-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-coffee-700">Total a pagar:</span>
                  <span className="text-xl font-bold text-coffee-800">€{getCartTotal().toFixed(2)}</span>
                </div>
                <p className="text-sm text-coffee-600">Te contactaremos cuando esté listo</p>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createOrderMutation.isPending}
                  className="flex-1 bg-coffee-600 hover:bg-coffee-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {createOrderMutation.isPending ? 'Procesando...' : 'Confirmar pedido'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;
