# 🗄️ Migración de SQLite a PostgreSQL

Esta guía te ayudará a migrar tu aplicación Café Demo de SQLite a PostgreSQL para solucionar el problema "database is locked" en producción.

## 🎯 ¿Por qué migrar?

- **Problema actual**: SQLite no maneja bien la concurrencia en producción → "database is locked"
- **Solución**: PostgreSQL es una base de datos robusta diseñada para aplicaciones multi-usuario
- **Beneficios**: Mayor estabilidad, mejor rendimiento, sin bloqueos de base de datos

## 📋 Pasos de la Migración

### 1. Crear Base de Datos PostgreSQL en Render

1. **Ir a Render Dashboard**: https://dashboard.render.com
2. **Crear nueva base de datos**:
   - Click en "New +" → "PostgreSQL"
   - **Name**: `cafe-demo-db`
   - **Database**: `cafe_demo`
   - **User**: Se genera automáticamente
   - **Region**: Same as your backend
   - **Plan**: Free (desarrollo) o Starter (producción)

3. **Copiar URL de conexión**: La encontrarás en la sección "Connections"
   - Formato: `postgresql://usuario:password@hostname:port/database`

### 2. Actualizar Variables de Entorno en Render

Ve a tu servicio backend en Render → Settings → Environment:

```bash
# Nueva variable requerida
DATABASE_URL=postgresql://tu-usuario:password@hostname:port/database

# Variables existentes (mantener)
SECRET_KEY=tu_secret_key_seguro
ADMIN_USERNAME=admin
ADMIN_PASSWORD=tu_contraseña_admin
OPENAI_API_KEY=sk-tu-api-key
APP_NAME=Café Demo
PHONE_CONTACT=+34 611 59 46 43
ADDRESS=Carretera Bordeta 61, Barcelona
HOURS=Lunes a Domingo 7:00-22:00
FRONTEND_URL=https://tu-frontend.vercel.app
```

### 3. Desplegar Código Actualizado

Los archivos nuevos que hemos creado:

- `database.py` - Configuración SQLAlchemy
- `main_new.py` - API actualizada con PostgreSQL
- `utils.py` - Utilidades para notificaciones
- `init_data.py` - Datos iniciales
- `endpoints_products.py` - Endpoints de productos
- `endpoints_notifications.py` - Endpoints de notificaciones (soluciona el problema)
- `migrate_data.py` - Script de migración opcional

### 4. Activar los Nuevos Archivos

**Opción A: Reemplazar archivos existentes**
```bash
# Respaldar el main.py original
cp main.py main_old.py

# Activar la nueva versión
cp main_new.py main.py
```

**Opción B: Usar directamente (recomendado)**
- Cambiar en Render el comando de inicio de `python main.py` a `python main_new.py`

### 5. Probar Localmente (Opcional pero Recomendado)

```bash
# Instalar nuevas dependencias
pip install sqlalchemy psycopg2-binary alembic

# Crear archivo .env local
cp .env.example.new .env
# Editar .env con tus configuraciones locales

# Probar con PostgreSQL local (opcional)
# DATABASE_URL=postgresql://usuario:password@localhost/cafe_demo_test

# O probar con SQLite (sin DATABASE_URL configurada)
python main_new.py
```

## 🔧 Verificación Post-Migración

### 1. Verificar Conexión
```bash
curl https://tu-backend.render.com/health
```

**Respuesta esperada:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-16T10:30:00",
  "database": {
    "type": "PostgreSQL",
    "connected": true
  }
}
```

### 2. Probar Notificaciones
- Ve al panel admin: `https://tu-frontend.vercel.app/admin`
- Envía un mensaje de contacto desde el frontend
- Verifica que aparezca la notificación sin errores "database is locked"

### 3. Verificar API
```bash
# Productos
curl https://tu-backend.render.com/products

# Especiales
curl https://tu-backend.render.com/specials

# Notificaciones admin (requiere token)
curl -H "Authorization: Bearer tu-token" https://tu-backend.render.com/admin/notifications/unread
```

## 🚨 Solución de Problemas

### Error de Conexión PostgreSQL
1. Verifica que DATABASE_URL esté correctamente configurada
2. Asegúrate de que la base de datos PostgreSQL esté activa en Render
3. Revisa los logs: Render Dashboard → tu servicio → Logs

### Datos Perdidos
- Los datos se crearán automáticamente con `init_data.py`
- Si tenías datos importantes en SQLite, usa el script `migrate_data.py`

### Error "No such module: database"
```bash
# Asegúrate de que todos los archivos estén en el directorio correcto
ls -la *.py
```

### Notificaciones Siguen Fallando
- Verifica que uses `main_new.py` (no el antiguo `main.py`)
- Los endpoints de notificaciones usan SQLAlchemy que evita los bloqueos

## 📊 Diferencias Principales

| Aspecto | SQLite (Anterior) | PostgreSQL (Nuevo) |
|---------|------------------|-------------------|
| **Concurrencia** | ❌ Bloqueos frecuentes | ✅ Multi-usuario robusto |
| **Notificaciones** | ❌ "database is locked" | ✅ Sin bloqueos |
| **Conexiones** | Una a la vez | ✅ Pool de conexiones |
| **Transacciones** | Básicas | ✅ ACID completas |
| **Rendimiento** | ❌ Degrada con carga | ✅ Optimizado para producción |

## 🎉 Resultado Esperado

Después de la migración:

✅ **Sin errores "database is locked"**
✅ **Notificaciones funcionan correctamente**
✅ **Mejor rendimiento en producción**
✅ **Sistema más escalable**
✅ **Compatibilidad con desarrollo local (SQLite) y producción (PostgreSQL)**

## 🔒 Seguridad

- La nueva configuración usa variables de entorno para credenciales
- Pool de conexiones seguro
- Transacciones ACID para integridad de datos
- Mejor manejo de errores

## 📞 Soporte

Si encuentras algún problema:

1. **Revisa los logs** en Render Dashboard
2. **Verifica variables de entorno** en Render Settings
3. **Prueba endpoints básicos** como `/health` y `/`
4. **Compara configuración** con `.env.example.new`

**¡La migración debería resolver completamente el problema de las notificaciones!** 🚀
