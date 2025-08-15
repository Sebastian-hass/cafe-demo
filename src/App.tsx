import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navbar from './components/Navbar';
import ChatBot from './components/ChatBot';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Contact from './pages/Contact';
import Debug from './pages/Debug';
import SimpleHome from './pages/SimpleHome';
import About from './pages/About';
import News from './pages/News';
import AdminPanel from './pages/AdminPanel';
import Reservations from './pages/Reservations';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Admin panel - sin navbar */}
          <Route path="/admin" element={<AdminPanel />} />
          
          {/* Páginas públicas - con navbar */}
          <Route path="/*" element={
            <div className="min-h-screen bg-cream-50">
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/simple" element={<SimpleHome />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/reservations" element={<Reservations />} />
                <Route path="/about" element={<About />} />
                <Route path="/news" element={<News />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/debug" element={<Debug />} />
              </Routes>
              {/* ChatBot integrado - solo en páginas públicas */}
              <ChatBot 
                position="bottom-left"
                primaryColor="#10b981"
                title="Café Demo Assistant"
                subtitle="Pregúntame sobre nuestro menú ☕"
                placeholder="Escribe tu mensaje aquí..."
                welcomeMessage="¡Hola! Soy el asistente virtual de Café Demo. ¿En qué puedo ayudarte hoy?"
              />
            </div>
          } />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;