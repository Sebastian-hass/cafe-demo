# 🚀 Café Demo Backend

API completa para la cafetería con integración de ChatBot OpenAI, sistema de notificaciones y SMTP.

## 🏗️ Arquitectura

- **FastAPI** - Framework web moderno y rápido
- **SQLite** - Base de datos ligera para desarrollo
- **OpenAI API** - ChatBot inteligente 
- **JWT** - Autenticación segura para admin
- **SMTP** - Sistema de emails (opcional)

## 🚀 Configuración Rápida

### 1. Instalar dependencias
```bash
pip install -r requirements.txt
```

### 2. Configurar variables de entorno
```bash
# Copia el archivo de ejemplo
cp .env.example .env

# Edita .env y configura tu OpenAI API Key
# OPENAI_API_KEY=sk-tu-clave-real-aqui
```

### 3. Ejecutar servidor
```bash
# Desarrollo
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# O usando start script
./start.sh
```

### 4. Acceder a la API
- 📖 Documentación: http://localhost:8000/docs
- 🤖 Estado ChatBot: http://localhost:8000/chatbot/status
- 🔧 Admin login: `admin` / `admin123`

## ⚙️ Variables de Entorno

### Requeridas
```bash
SECRET_KEY=tu_secret_key_para_jwt
ADMIN_USERNAME=admin
ADMIN_PASSWORD=tu_contraseña_segura
OPENAI_API_KEY=sk-tu-api-key-de-openai
```

### Opcionales
```bash
# Configuración SMTP para emails reales
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=tu_contraseña_de_aplicacion
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587

# CORS
FRONTEND_URL=http://localhost:5173
```

## 🧪 Endpoints Principales

### ChatBot
- `GET /chatbot/status` - Estado de configuración
- `POST /chat` - Chat directo con el bot
- `POST /chatbot/test` - Testing del bot

### Admin
- `POST /admin/login` - Login de administrador
- `GET /admin/dashboard` - Estadísticas 
- `GET /admin/notifications/unread` - Notificaciones pendientes

### Público
- `GET /products` - Lista de productos
- `GET /specials` - Especiales del día
- `POST /contact` - Formulario de contacto
- `POST /newsletter/subscribe` - Suscripción newsletter
- `POST /reservations` - Crear reserva

## 🔧 Diagnósticos

### Verificar ChatBot
```bash
curl http://localhost:8000/chatbot/status
```

### Probar Chat
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hola, ¿qué productos tienen?"}'
```

## 📦 Despliegue en Render

### Variables de entorno en producción:
```bash
SECRET_KEY=clave_secreta_fuerte_para_produccion
ADMIN_USERNAME=admin
ADMIN_PASSWORD=contraseña_segura_admin
OPENAI_API_KEY=sk-tu-api-key-real
APP_NAME=Cafe Demo
PHONE_CONTACT=+34 611 59 46 43
ADDRESS=Carretera Bordeta 61, Barcelona
HOURS=Lunes a Domingo 7:00-22:00
FRONTEND_URL=https://tu-frontend.vercel.app

# Opcional para emails
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=tu_contraseña_de_aplicacion
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
```

## 🐛 Solución de Problemas

### ChatBot no responde
1. Verificar `OPENAI_API_KEY` en `/chatbot/status`
2. Comprobar saldo en cuenta OpenAI
3. Revisar logs del servidor

### Emails no se envían
- Sin credenciales SMTP → Modo simulado (logs)
- Con credenciales → Envío real

### Notificaciones no aparecen
- Verificar endpoint `/admin/notifications/unread`
- El frontend debe hacer polling para actualizaciones

## 📋 Funcionalidades

✅ **ChatBot OpenAI** - Respuestas inteligentes  
✅ **Panel Admin** - Gestión completa  
✅ **Notificaciones** - Sistema de alertas  
✅ **SMTP** - Emails reales o simulados  
✅ **Reservas** - Sistema de reservas  
✅ **Productos** - CRUD completo  
✅ **Newsletter** - Suscripciones  
✅ **Formularios** - Contacto y trabajo  
✅ **JWT Auth** - Seguridad robusta  

## 🔒 Seguridad

- El archivo `.env` NO se sube a GitHub (incluido en .gitignore)
- JWT tokens para autenticación admin
- Credenciales de API encriptadas
- CORS configurado para dominios específicos

## 📞 Soporte

Para problemas o dudas, revisar:
1. Logs del servidor
2. Endpoint `/chatbot/status` 
3. Documentación en `/docs`
