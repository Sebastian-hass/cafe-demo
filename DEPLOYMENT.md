# 🚀 Guía de Despliegue - Café Demo

Esta aplicación usa una arquitectura híbrida:
- **Frontend**: Desplegado en Vercel (React/Vite)
- **Backend**: Desplegado en Railway (FastAPI/Python)

## 📋 Prerrequisitos

1. Cuenta en [Vercel](https://vercel.com/)
2. Cuenta en [Railway](https://railway.app/)
3. Repositorio en GitHub con tu código

## 🎯 Paso 1: Desplegar Backend en Railway

### 1.1 Conectar Railway con GitHub

1. Inicia sesión en [Railway](https://railway.app/)
2. Crea un nuevo proyecto
3. Selecciona "Deploy from GitHub repo"
4. Autoriza Railway para acceder a tu repositorio
5. Selecciona tu repositorio `cafe-demo`

### 1.2 Configurar el Proyecto en Railway

1. Railway detectará automáticamente que es un proyecto Python
2. Asegúrate de que esté usando la carpeta `backend/` como root
3. Si no es automático, ve a Settings → Service Settings → Root Directory: `backend`

### 1.3 Variables de Entorno en Railway

Ve a Variables en el dashboard de Railway y añade:

```
SECRET_KEY=tu_clave_secreta_muy_segura_aqui_123!
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### 1.4 Desplegar

1. Railway comenzará el build automáticamente
2. Espera a que termine el despliegue
3. Anota la URL que Railway te proporciona (algo como: `https://tu-app-production.up.railway.app`)

## 🎯 Paso 2: Desplegar Frontend en Vercel

### 2.1 Conectar Vercel con GitHub

1. Inicia sesión en [Vercel](https://vercel.com/)
2. Clic en "New Project"
3. Import tu repositorio de GitHub
4. Selecciona tu repositorio `cafe-demo`

### 2.2 Configurar el Proyecto en Vercel

1. **Framework Preset**: Vite
2. **Root Directory**: Dejar como está (la raíz del proyecto)
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`

### 2.3 Variables de Entorno en Vercel

En la sección "Environment Variables" añade:

```
VITE_API_URL=https://tu-backend-url.railway.app
```

⚠️ **Importante**: Reemplaza `tu-backend-url.railway.app` con la URL real que obtuviste de Railway.

### 2.4 Desplegar

1. Clic en "Deploy"
2. Vercel build y desplegará automáticamente
3. Anota la URL que Vercel te proporciona

## 🔗 Paso 3: Configurar CORS

Una vez que tengas la URL de Vercel, actualiza el archivo `backend/main.py`:

```python
allow_origins=[
    "http://localhost:5173", 
    "http://localhost:5174", 
    "http://localhost:3000",
    "https://*.vercel.app",
    "https://tu-app.vercel.app",  # 👈 Añade tu URL específica aquí
],
```

Después de hacer este cambio:
1. Haz commit y push a tu repositorio
2. Railway re-desplegará automáticamente el backend

## ✅ Verificación

### Backend (Railway)
- Ve a: `https://tu-backend.railway.app/`
- Deberías ver: `{"message":"☕ Café Demo API","status":"running","docs":"/docs"}`
- API docs en: `https://tu-backend.railway.app/docs`

### Frontend (Vercel)
- Ve a tu URL de Vercel
- La aplicación debería cargar completamente
- Prueba hacer login en admin: `admin` / `admin123`

## 🛠️ Comandos Útiles

### Desarrollo Local
```bash
# Backend
cd backend
uvicorn main:app --reload

# Frontend (en otra terminal)
npm run dev
```

### Logs y Debug
- **Railway**: Ve a Deployments → View Logs
- **Vercel**: Ve a Functions → View Function Logs

## 📝 Notas Importantes

1. **Base de datos**: SQLite se recrea en cada despliegue en Railway. Para datos persistentes, considera usar PostgreSQL.
2. **Archivos subidos**: Los archivos se perderán en cada redeploy. Considera usar un servicio de almacenamiento como Cloudinary.
3. **HTTPS**: Tanto Vercel como Railway usan HTTPS automáticamente.
4. **Dominios personalizados**: Ambos servicios permiten configurar dominios personalizados.

## 🔧 Solución de Problemas

### Error de CORS
- Verifica que la URL de Vercel esté en la lista `allow_origins` del backend
- Asegúrate de que `VITE_API_URL` en Vercel apunte a la URL correcta de Railway

### Backend no responde
- Verifica que las variables de entorno estén configuradas en Railway
- Revisa los logs de Railway para errores

### Frontend no conecta con backend
- Verifica `VITE_API_URL` en las variables de entorno de Vercel
- Asegúrate de incluir `https://` en la URL del backend

## 🎉 ¡Listo!

Tu aplicación Café Demo ahora está desplegada y accesible desde cualquier parte del mundo:

- **Frontend**: https://tu-app.vercel.app
- **Backend**: https://tu-backend.railway.app
- **Admin Panel**: https://tu-app.vercel.app/admin

¡Disfruta tu café virtual! ☕
