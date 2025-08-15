# ✅ Checklist de Verificación Post-Despliegue

## 🚀 Backend (Railway)

### URLs de Verificación:
- [ ] **Health Check**: `https://tu-backend.railway.app/health`
- [ ] **API Status**: `https://tu-backend.railway.app/`
- [ ] **API Docs**: `https://tu-backend.railway.app/docs`

### Funcionalidades a probar:
- [ ] **Productos**: `GET /products` devuelve lista de productos
- [ ] **Categorías**: `GET /categories` devuelve categorías
- [ ] **Especiales**: `GET /specials` devuelve ofertas del día
- [ ] **Admin Login**: `POST /admin/login` con `admin`/`admin123`
- [ ] **CORS**: No hay errores de CORS en la consola del navegador

## 🌐 Frontend (Vercel)

### Páginas principales:
- [ ] **Home**: `/` - Página principal carga correctamente
- [ ] **Menú**: `/menu` - Lista de productos se muestra
- [ ] **Reservas**: `/reservations` - Formulario funciona
- [ ] **Contacto**: `/contact` - Formulario envía mensajes
- [ ] **Admin**: `/admin` - Login funciona

### Funcionalidades críticas:
- [ ] **API Connection**: Los productos se cargan desde el backend
- [ ] **Admin Panel**: Login y dashboard funcionan
- [ ] **Responsive**: La app se ve bien en móvil y desktop
- [ ] **Newsletter**: Suscripción funciona
- [ ] **WhatsApp Widget**: Botón redirige correctamente

## 📧 Comunicación

### Formularios:
- [ ] **Contacto**: Mensajes se guardan en BD y se envían (logs)
- [ ] **Newsletter**: Suscripciones se registran
- [ ] **Reservas**: Se crean correctamente
- [ ] **Aplicaciones de trabajo**: Se guardan en BD

## 🔒 Seguridad

### Admin:
- [ ] **Login**: Credenciales `admin`/`admin123` funcionan
- [ ] **JWT**: Tokens se generan correctamente
- [ ] **Protección**: Rutas admin protegidas sin token
- [ ] **CORS**: Solo orígenes permitidos pueden acceder

## 📱 UX/UI

### Experiencia de usuario:
- [ ] **Navegación**: Menús y enlaces funcionan
- [ ] **Loading**: Estados de carga se muestran
- [ ] **Errores**: Mensajes de error son claros
- [ ] **Success**: Confirmaciones se muestran
- [ ] **Responsive**: Funciona en diferentes tamaños de pantalla

## 🛠️ Comandos de Verificación Rápida

```bash
# Verificar backend
curl https://tu-backend.railway.app/health

# Verificar productos
curl https://tu-backend.railway.app/products

# Verificar CORS (desde la consola del navegador)
fetch('https://tu-backend.railway.app/products')
```

## 🚨 Solución de Problemas Comunes

### Backend no responde:
1. Verificar logs en Railway
2. Revisar variables de entorno
3. Comprobar que el puerto es `$PORT`

### Frontend no conecta:
1. Verificar `VITE_API_URL` en Vercel
2. Revisar configuración de CORS en backend
3. Comprobar que las URLs usan HTTPS

### CORS Errors:
1. Añadir URL específica de Vercel al CORS
2. Verificar que no haya URLs con barras finales (`/`)
3. Comprobar que el wildcard `*.vercel.app` esté incluido

## 📊 Métricas de Éxito

- ✅ Tiempo de carga inicial < 3 segundos
- ✅ API responses < 1 segundo
- ✅ Sin errores 404/500 en producción
- ✅ Admin panel completamente funcional
- ✅ Todos los formularios funcionando

## 🎉 Todo Listo

Una vez que todos los items estén marcados, tu aplicación Café Demo está completamente desplegada y funcional.
