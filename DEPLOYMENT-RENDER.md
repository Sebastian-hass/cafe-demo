# 🚀 Guía de Despliegue - Render + Vercel

Esta guía te ayudará a desplegar tu proyecto café-demo usando **Render** para el backend y **Vercel** para el frontend.

## 📋 Requisitos Previos

- Cuenta en GitHub
- Cuenta en [Render](https://render.com) 
- Cuenta en [Vercel](https://vercel.com)
- Tu proyecto subido a un repositorio GitHub

---

## 🛠️ PASO 1: Desplegar Backend en Render

### 1.1 Crear cuenta y servicio

1. Ve a [render.com](https://render.com)
2. Regístrate con GitHub
3. Click en **"New +"** → **"Web Service"**
4. Conecta tu repositorio `cafe-demo`
5. Configura los siguientes parámetros:

### 1.2 Configuración del servicio

| Campo | Valor |
|-------|-------|
| **Name** | `cafe-demo-backend` |
| **Environment** | `Python 3` |
| **Region** | `Oregon (us-west)` o la más cercana |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn main:app --host 0.0.0.0 --port $PORT` |

### 1.3 Variables de entorno (MUY IMPORTANTE)

En la sección **Environment Variables**, añade:

```bash
SECRET_KEY=tu_clave_jwt_super_secreta_y_larga_aqui_123456789
ADMIN_USERNAME=admin
ADMIN_PASSWORD=tu_nueva_contraseña_admin_segura
```

**⚠️ CRÍTICO:**
- Cambia `SECRET_KEY` por una clave aleatoria fuerte de al menos 32 caracteres
- Cambia `ADMIN_PASSWORD` por una contraseña segura
- **NO uses las mismas credenciales que en local**

### 1.4 Desplegar

1. Click **"Create Web Service"**
2. Espera 5-10 minutos para que termine el build
3. Una vez terminado, obtendrás una URL como: `https://cafe-demo-backend.onrender.com`

### 1.5 Verificar despliegue

Prueba estos endpoints:
- `https://tu-backend.onrender.com/` → Debe mostrar `{"message": "☕ Café Demo API"}`
- `https://tu-backend.onrender.com/health` → Debe mostrar `{"status": "healthy"}`

---

## 🌐 PASO 2: Desplegar Frontend en Vercel

### 2.1 Crear proyecto

1. Ve a [vercel.com](https://vercel.com)
2. Regístrate con GitHub
3. Click **"New Project"**
4. Importa tu repositorio `cafe-demo`

### 2.2 Configuración del proyecto

| Campo | Valor |
|-------|-------|
| **Framework Preset** | `Vite` |
| **Root Directory** | `.` (raíz del proyecto) |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

### 2.3 Variables de entorno (CRÍTICO)

En **Environment Variables** añade:

```bash
VITE_API_URL=https://tu-backend-render.onrender.com
```

⚠️ **Reemplaza** `tu-backend-render.onrender.com` con la URL real que obtuviste de Render.

### 2.4 Desplegar

1. Click **"Deploy"**
2. Espera 2-3 minutos para el build
3. Obtendrás una URL como: `https://cafe-demo-git-main-username.vercel.app`

---

## 🔗 PASO 3: Configurar CORS (IMPORTANTE)

### 3.1 Actualizar CORS en Render

1. Ve a tu servicio en Render
2. En **Environment Variables**, añade:

```bash
FRONTEND_URL=https://tu-url-real-de-vercel.vercel.app
```

3. Click **"Save Changes"**
4. Render redesplegará automáticamente

### 3.2 Verificar conexión

1. Ve a tu frontend en Vercel
2. Intenta hacer login en `/admin`
3. Deberías poder usar las credenciales que configuraste en Render

---

## ⚡ PASO 4: Configuración de Auto-Deploy

### 4.1 En Render
- Los deployments automáticos están habilitados por defecto
- Cada `git push` a `main` redesplegará el backend

### 4.2 En Vercel
- Los deployments automáticos están habilitados por defecto
- Cada `git push` redesplegará el frontend

---

## ✅ PASO 5: Verificación Final

### URLs de tu proyecto:
- **Frontend:** `https://tu-proyecto.vercel.app`
- **Backend:** `https://tu-backend.onrender.com`
- **API Docs:** `https://tu-backend.onrender.com/docs`
- **Admin Panel:** `https://tu-proyecto.vercel.app/admin`

### Pruebas rápidas:
1. ✅ Frontend carga correctamente
2. ✅ API responde en `/health`
3. ✅ Login admin funciona
4. ✅ CORS configurado (no errores en consola)

---

## 📊 Resumen de lo que obtienes

✅ **Frontend ultra-rápido en Vercel**
✅ **Backend confiable en Render** 
✅ **Todas las funcionalidades funcionando**
✅ **HTTPS automático en ambos**
✅ **Variables de entorno seguras**
✅ **Deploy automático con git push**
✅ **Panel admin completamente funcional**

## 💰 Costos

- **Vercel:** Gratis (plan Hobby)
- **Render:** Gratis por 750 horas/mes (plan Free)

---

## 🔧 Solución de Problemas

### ❌ Error: "Environment variables required"
**Solución:** Asegúrate de configurar todas las variables de entorno en Render.

### ❌ Error de CORS
**Solución:** Verifica que `FRONTEND_URL` en Render coincida exactamente con tu URL de Vercel.

### ❌ Login admin no funciona
**Solución:** Revisa que `ADMIN_USERNAME` y `ADMIN_PASSWORD` estén configurados en Render.

### ❌ El backend se "duerme"
**Solución:** El plan gratuito de Render "duerme" después de 15 minutos de inactividad. Se despierta automáticamente con la primera petición.

---

## 🚀 Próximos pasos

1. **Configurar dominio personalizado** (opcional)
2. **Configurar email SMTP** para notificaciones reales
3. **Añadir monitoreo** con herramientas como UptimeRobot
4. **Configurar backups** de la base de datos

---

## 📞 ¿Necesitas ayuda?

Si encuentras problemas:
1. Revisa los logs en Render Dashboard
2. Verifica las variables de entorno
3. Asegúrate de que el repositorio esté actualizado
4. Consulta la documentación oficial de [Render](https://render.com/docs) y [Vercel](https://vercel.com/docs)

¡Tu aplicación café-demo está lista para el mundo! ☕✨
