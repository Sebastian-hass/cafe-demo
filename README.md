# Café Demo ☕

> Frontend desplegado en Vercel, Backend en Render

Una aplicación web moderna para un café que utiliza React + TypeScript en el frontend y FastAPI + SQLite en el backend.

## 🚀 Cómo ejecutar la aplicación

### Opción 1: Scripts rápidos (Recomendado)

1. **Iniciar el backend:**
   - Hacer doble clic en `start-backend.bat` 
   - O ejecutar: `cd backend && python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload`

2. **Iniciar el frontend (en otra terminal):**
   - Hacer doble clic en `start-frontend.bat`
   - O ejecutar: `npm run dev`

3. **Abrir el navegador en:** http://localhost:5173/

### Opción 2: Manual

1. **Backend:**
   ```bash
   cd backend
   pip install fastapi uvicorn
   python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
   ```

2. **Frontend (en otra terminal):**
   ```bash
   npm install
   npm run dev
   ```

## 🔧 Solución de problemas

### Página en blanco
Si ves una página en blanco:
1. Verifica que el backend esté ejecutándose en http://localhost:8000
2. Verifica que el frontend esté ejecutándose en http://localhost:5173
3. Abre F12 en el navegador y revisa la consola para errores

### Error "Special not found"
- Este problema se ha solucionado definiendo tipos localmente en los componentes
- Si persiste, limpia la caché del navegador (Ctrl+F5)

## 📚 Endpoints de la API

- **Documentación:** http://localhost:8000/docs
- **Especiales:** http://localhost:8000/specials
- **Productos:** http://localhost:8000/products
- **Categorías:** http://localhost:8000/categories

## 🛠️ Tecnologías utilizadas

- **Frontend:** React 19, TypeScript, Tailwind CSS, React Query, React Router
- **Backend:** FastAPI, SQLite, Python 3.10+
- **Build:** Vite

## ✨ Características

- ✅ Interfaz responsive y moderna
- ✅ API REST con documentación automática
- ✅ Base de datos SQLite con datos de ejemplo
- ✅ Sistema de especiales y descuentos
- ✅ Integración con WhatsApp
- ✅ Gestión de estados con React Query
