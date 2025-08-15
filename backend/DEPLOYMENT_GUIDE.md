# 🚀 Guía de Despliegue - Café Demo Backend

## 📋 Resumen

Esta guía te ayudará a resolver todos los problemas que mencionaste:

1. **Chatbot OpenAI**: Configurar la API Key correctamente
2. **Notificaciones del panel admin**: Verificar funcionamiento en tiempo real
3. **Sistema SMTP**: Configurar envío de emails real con Gmail

## ⚙️ Variables de Entorno Requeridas

### Configuración básica (Ya configuradas)
```bash
SECRET_KEY="tu_clave_secreta_para_jwt"
ADMIN_USERNAME="admin" 
ADMIN_PASSWORD="admin123"
FRONTEND_URL="https://tu-frontend.vercel.app"
```

### ✅ Para Chatbot OpenAI
```bash
OPENAI_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
APP_NAME="Café Demo"
PHONE_CONTACT="+34 611 59 46 43"
ADDRESS="Calle Mayor 123, Madrid"
```

### ✅ Para Sistema SMTP (Gmail)
```bash
SMTP_USER="jesussebastianalonsoarias@gmail.com"
SMTP_PASSWORD="xxxx xxxx xxxx xxxx"  # Contraseña de aplicación
SMTP_SERVER="smtp.gmail.com"
SMTP_PORT="587"
```

## 🔧 Configuración paso a paso

### 1. Configurar OpenAI API Key

1. Ve a [OpenAI Platform](https://platform.openai.com/api-keys)
2. Crea una nueva API Key
3. Cópiala y configúrala en Render como variable de entorno `OPENAI_API_KEY`

**⚠️ IMPORTANTE**: 
- Asegúrate de que no hay espacios antes/después de la clave
- La clave debe empezar con "sk-"
- Verifica que tienes saldo en tu cuenta OpenAI

### 2. Configurar Gmail SMTP

1. **Activar autenticación en 2 pasos** en tu cuenta de Gmail
2. **Generar contraseña de aplicación**:
   - Ve a [Configuración de Google Account](https://myaccount.google.com/security)
   - Busca "Contraseñas de aplicaciones"
   - Genera una nueva para "Correo"
   - Usa esta contraseña (16 caracteres) como `SMTP_PASSWORD`

3. **Configurar en Render**:
   ```bash
   SMTP_USER=jesussebastianalonsoarias@gmail.com
   SMTP_PASSWORD=abcd efgh ijkl mnop  # Tu contraseña de aplicación
   SMTP_SERVER=smtp.gmail.com
   SMTP_PORT=587
   ```

### 3. Verificar configuración

1. **Chatbot Status**:
   ```bash
   curl https://tu-backend.onrender.com/chatbot/status
   ```

2. **Probar email** (desde el frontend):
   - Envía un mensaje de contacto
   - Suscríbete al newsletter
   - Crea una reserva

## 🎯 Endpoints de Diagnóstico

### Verificar Chatbot
```bash
GET /chatbot/status
```
Respuesta esperada:
```json
{
  "chatbot_active": true,
  "configuration": {
    "openai_configured": true,
    "app_name_configured": true,
    "contact_info_configured": true
  },
  "debug_info": {
    "openai_key_present": true,
    "openai_key_length": 51,
    "environment_vars": {
      "OPENAI_API_KEY": "✅ Configurada"
    }
  },
  "message": "Chatbot configurado correctamente"
}
```

### Probar Chat
```bash
POST /chat
Content-Type: application/json

{
  "message": "Hola, ¿qué productos tienen?"
}
```

### Notificaciones Admin
```bash
GET /admin/notifications/unread
Authorization: Bearer tu_token_jwt
```

## 🐛 Troubleshooting

### Chatbot no funciona
1. Verifica `OPENAI_API_KEY` en `/chatbot/status`
2. Comprueba saldo en OpenAI
3. Revisa logs en Render
4. Prueba con `/chatbot/test`

### Emails no se envían
1. Verifica que `SMTP_USER` y `SMTP_PASSWORD` están configuradas
2. Comprueba que la contraseña de aplicación es correcta
3. Sin credenciales SMTP → modo simulado (logs en consola)
4. Con credenciales → envío real

### Notificaciones no aparecen
1. Verifica que se crean en la base de datos:
   ```sql
   SELECT * FROM admin_notifications ORDER BY created_at DESC LIMIT 10;
   ```
2. Comprueba endpoint `/admin/notifications/unread`
3. El frontend debe hacer polling o usar WebSockets

## 📱 Testing Completo

### 1. Formulario de Contacto
- Debe crear notificación en admin
- Debe enviar email si SMTP está configurado
- Verificar en `/admin/contacts`

### 2. Newsletter
- Debe crear notificación en admin  
- Debe enviar email de confirmación
- Verificar en `/admin/newsletter/subscribers`

### 3. Reservas
- Debe crear notificación en admin
- Debe enviar email de confirmación
- Verificar en `/admin/reservations`

### 4. Chatbot
- Probar desde `/chat` 
- Verificar respuestas coherentes
- Debe funcionar tanto en desarrollo como producción

## 🚀 Checklist de Producción

- [ ] `OPENAI_API_KEY` configurada y validada
- [ ] `SMTP_USER` y `SMTP_PASSWORD` configuradas
- [ ] Endpoint `/chatbot/status` devuelve configuración completa
- [ ] Envío de emails funciona (test con formulario de contacto)
- [ ] Notificaciones se crean correctamente
- [ ] Logs en Render no muestran errores
- [ ] Frontend puede consumir todos los endpoints
- [ ] Autenticación JWT funciona

## 🆘 Errores Comunes

### "Chatbot no configurado"
- La `OPENAI_API_KEY` no está presente o es inválida
- Solución: Verifica en `/chatbot/status`

### "Servicio no disponible"
- La API de OpenAI está fallando
- Sin saldo en cuenta OpenAI
- Clave API incorrecta o revocada

### "Email simulado"
- No se han configurado las credenciales SMTP
- Funciona para desarrollo, configurar SMTP para producción

### Notificaciones no se ven
- El frontend no está consultando `/admin/notifications`
- La base de datos no se está actualizando
- Problema de autenticación JWT

## 📞 Soporte

Si tienes problemas:

1. Revisa logs en Render
2. Verifica endpoints de diagnóstico
3. Comprueba variables de entorno
4. Prueba endpoints individualmente con Postman/curl

¡El backend ya está preparado para funcionar correctamente en producción! 🎉
