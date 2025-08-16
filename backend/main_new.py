"""
Café Demo API - Versión con SQLAlchemy y soporte PostgreSQL/SQLite
"""
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import json
from datetime import datetime, date, timedelta
import hashlib
import jwt
import os
import shutil

# Importar módulos locales
import chatbot
from database import (
    get_db, create_tables, get_database_info,
    Product, Special, ProductCategory, NewsArticle, CarouselImage,
    PageContent, ContactMessage, NewsletterSubscriber, JobApplication,
    Order, Reservation, AdminNotification
)
from utils import create_admin_notification, get_unread_notifications_count, send_email, serialize_json, deserialize_json
from init_data import init_sample_data

# ================================
# MODELOS PYDANTIC (MANTENER IGUAL)
# ================================

class ProductResponse(BaseModel):
    id: int
    name: str
    description: str
    price: float
    category: str
    image: str
    available: bool

class SpecialResponse(BaseModel):
    id: int
    product: ProductResponse
    discount: float
    date: str

# Modelos para Administración
class AdminLogin(BaseModel):
    username: str
    password: str

class AdminUser(BaseModel):
    username: str
    role: str = "admin"

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category: str
    image: str
    available: bool = True

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    image: Optional[str] = None
    available: Optional[bool] = None

class SpecialCreate(BaseModel):
    product_id: int
    date: str
    discount: float

# Modelos para Noticias
class NewsArticleCreate(BaseModel):
    title: str
    excerpt: str
    content: str
    author: str
    category: str
    featured: bool = False
    image: Optional[str] = None
    tags: List[str] = []
    published: bool = True

class NewsArticleUpdate(BaseModel):
    title: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    author: Optional[str] = None
    category: Optional[str] = None
    featured: Optional[bool] = None
    image: Optional[str] = None
    tags: Optional[List[str]] = None
    published: Optional[bool] = None

class NewsArticleResponse(BaseModel):
    id: int
    title: str
    excerpt: str
    content: str
    author: str
    category: str
    featured: bool
    image: Optional[str]
    tags: List[str]
    published: bool
    created_at: str
    updated_at: str

# Modelos para Carrusel
class CarouselImageCreate(BaseModel):
    title: str
    subtitle: Optional[str] = None
    description: Optional[str] = None
    image: str
    link: Optional[str] = None
    active: bool = True
    order_position: int = 0

class CarouselImageUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    link: Optional[str] = None
    active: Optional[bool] = None
    order_position: Optional[int] = None

class CarouselImageResponse(BaseModel):
    id: int
    title: str
    subtitle: Optional[str]
    description: Optional[str]
    image: str
    link: Optional[str]
    active: bool
    order_position: int
    created_at: str

# Modelos para Contenido de Página
class PageContentCreate(BaseModel):
    id: str
    title: str
    content: str
    section: str
    page: str

class PageContentUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    section: Optional[str] = None
    page: Optional[str] = None

class PageContentResponse(BaseModel):
    id: str
    title: str
    content: str
    section: str
    page: str
    updated_at: str

class ContactMessageModel(BaseModel):
    name: str
    email: str
    subject: str
    message: str

class NewsletterSubscription(BaseModel):
    email: str
    name: Optional[str] = None

class JobApplicationModel(BaseModel):
    id: Optional[int] = None
    name: str
    email: str
    phone: str
    position: str
    experience: str
    motivation: str
    cv_filename: Optional[str] = None
    created_at: Optional[str] = None

class DashboardStats(BaseModel):
    total_products: int
    active_specials: int
    total_categories: int
    recent_activity: List[dict]

# Modelos para Categorías
class CategoryCreate(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None

class CategoryResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    created_at: str

# Modelos para Pedidos
class OrderItem(BaseModel):
    product_id: int
    product_name: str
    quantity: int
    price: float
    notes: Optional[str] = None

class OrderCreate(BaseModel):
    customer_name: str
    customer_email: str
    customer_phone: Optional[str] = None
    items: List[OrderItem]
    notes: Optional[str] = None

class OrderResponse(BaseModel):
    id: int
    customer_name: str
    customer_email: str
    customer_phone: Optional[str] = None
    items: List[OrderItem]
    total_amount: float
    notes: Optional[str] = None
    status: str
    created_at: str

# Modelos para Reservas
class ReservationCreate(BaseModel):
    customer_name: str
    customer_email: str
    customer_phone: str
    party_size: int
    reservation_date: str  # YYYY-MM-DD
    reservation_time: str  # HH:MM
    notes: Optional[str] = None

class ReservationUpdate(BaseModel):
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None
    party_size: Optional[int] = None
    reservation_date: Optional[str] = None
    reservation_time: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None

class ReservationResponse(BaseModel):
    id: int
    customer_name: str
    customer_email: str
    customer_phone: str
    party_size: int
    reservation_date: str
    reservation_time: str
    notes: Optional[str] = None
    status: str
    created_at: str

# Modelo para respuesta de notificaciones
class NotificationResponse(BaseModel):
    id: int
    type: str
    title: str
    message: str
    related_id: Optional[int] = None
    is_read: bool
    created_at: str

# Modelo para respuesta del admin
class AdminReplyModel(BaseModel):
    recipient_email: str
    subject: str
    message: str
    reference_id: Optional[int] = None

# ================================
# CONFIGURACIÓN DE LA APP
# ================================

# Hash de contraseña
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

# Configuración JWT - Variables de entorno requeridas
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable is required")
    
ALGORITHM = "HS256"
security = HTTPBearer()

# Configuración Admin - Variables de entorno requeridas
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")
if not ADMIN_USERNAME or not ADMIN_PASSWORD:
    raise ValueError("ADMIN_USERNAME and ADMIN_PASSWORD environment variables are required")

ADMIN_PASSWORD_HASH = hash_password(ADMIN_PASSWORD)

# Función para crear tokens JWT
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Función para verificar tokens
def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Token inválido")
        return username
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

# Inicializar carpeta de uploads
def init_uploads():
    os.makedirs("uploads/products", exist_ok=True)
    print("📁 Carpeta de uploads inicializada")

# ================================
# INICIALIZAR APLICACIÓN
# ================================

# Crear app FastAPI
app = FastAPI(title="Café Demo API", version="2.0.0")

# Inicializar base de datos
create_tables()
init_uploads()

# Inicializar datos de muestra
try:
    init_sample_data()
except Exception as e:
    print(f"⚠️ Error inicializando datos de muestra: {e}")

print("✅ Base de datos inicializada con SQLAlchemy")
print("🗄️ Información de BD:", get_database_info())
print("🚀 API corriendo en http://localhost:8000")
print("📚 Documentación en http://localhost:8000/docs")

# Configurar CORS
allowed_origins = [
    "http://localhost:5173", 
    "http://localhost:5174", 
    "http://localhost:3000",
    "https://*.vercel.app",
]

frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Servir archivos estáticos
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ================================
# ENDPOINTS BÁSICOS
# ================================

@app.get("/", summary="API Status")
async def root():
    db_info = get_database_info()
    return {
        "message": "☕ Café Demo API v2.0", 
        "status": "running",
        "database": db_info["type"],
        "docs": "/docs"
    }

@app.get("/health", summary="Health Check")
async def health_check():
    return {
        "status": "healthy", 
        "timestamp": datetime.now().isoformat(),
        "database": get_database_info()
    }

# ================================
# INTEGRAR TODOS LOS ENDPOINTS
# ================================

from endpoints_products import setup_products_routes
from endpoints_notifications import setup_notifications_routes
from endpoints_additional import setup_additional_routes

# Configurar rutas
setup_products_routes(app)
setup_notifications_routes(app)
setup_additional_routes(app)

# ================================
# ENDPOINTS ADICIONALES
# ================================

@app.post("/contact", summary="Enviar mensaje de contacto")
async def send_contact_message(message: ContactMessageModel, db: Session = Depends(get_db)):
    """Endpoint para recibir mensajes de contacto"""
    try:
        # Guardar mensaje en la base de datos
        contact_msg = ContactMessage(
            name=message.name,
            email=message.email,
            subject=message.subject,
            message=message.message
        )
        db.add(contact_msg)
        db.commit()
        db.refresh(contact_msg)
        
        # Crear notificación para el admin
        create_admin_notification(
            db=db,
            notification_type="contact",
            title=f"Nuevo mensaje: {message.subject}",
            message=f"De: {message.name} ({message.email})",
            related_id=contact_msg.id
        )
        
        # Enviar email de confirmación al usuario
        user_email_subject = f"Confirmación: {message.subject} - Café Demo ☕"
        user_email_body = f"""¡Hola {message.name}!

¡Gracias por contactar con Café Demo! ☕

Hemos recibido tu mensaje correctamente:

📋 **Detalles de tu consulta:**
Asunto: {message.subject}
Fecha: {datetime.now().strftime('%d/%m/%Y %H:%M')}

💬 **Tu mensaje:**
\"{message.message}\"

⏰ **¿Qué sigue?**
Nuestro equipo revisará tu mensaje y te responderemos en un máximo de 24 horas durante días laborables.

Si necesitas una respuesta más inmediata, puedes:
📞 Llamarnos al +34 123 456 789
💬 Usar nuestro asistente IA en la web (disponible 24/7)

¡Gracias por elegirnos!

Con cariño,
El equipo de Café Demo

---
ID de referencia: #{contact_msg.id}
Email: {message.email}"""
        
        # Enviar email de notificación al admin
        admin_email_subject = f"Nuevo mensaje de contacto: {message.subject}"
        admin_email_body = f"""📧 **NUEVO MENSAJE DE CONTACTO**

👤 **Cliente:**
Nombre: {message.name}
Email: {message.email}

📋 **Consulta:**
Asunto: {message.subject}
Fecha: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}
ID: #{contact_msg.id}

💬 **Mensaje completo:**
\"{message.message}\"

---
⚡ **Acción requerida:**
Responder al cliente en menos de 24 horas.

Puedes gestionar este mensaje desde el panel de administración.

Café Demo - Sistema de Gestión"""
        
        # Enviar ambos correos
        user_email_sent = send_email(
            to_email=message.email,
            subject=user_email_subject,
            body=user_email_body
        )
        
        admin_email_sent = send_email(
            to_email="jesussebastianalonsoarias@gmail.com",  # Email del admin
            subject=admin_email_subject,
            body=admin_email_body
        )
        
        return {
            "success": True,
            "message": "Mensaje enviado correctamente",
            "id": contact_msg.id,
            "user_email_sent": user_email_sent,
            "admin_email_sent": admin_email_sent
        }
        
    except Exception as e:
        print(f"Error procesando contacto: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.post("/newsletter/subscribe", summary="Suscribirse al newsletter")
async def subscribe_newsletter(subscription: NewsletterSubscription, db: Session = Depends(get_db)):
    """Endpoint para suscribirse al newsletter"""
    try:
        # Verificar si ya está suscrito
        existing = db.query(NewsletterSubscriber).filter(
            NewsletterSubscriber.email == subscription.email
        ).first()
        
        if existing:
            if existing.active:
                return {"message": "Ya estás suscrito al newsletter", "subscribed": True}
            else:
                # Reactivar suscripción
                existing.active = True
                existing.name = subscription.name
                db.commit()
                return {"message": "Suscripción reactivada exitosamente", "subscribed": True}
        
        # Crear nueva suscripción
        subscriber = NewsletterSubscriber(
            email=subscription.email,
            name=subscription.name,
            active=True
        )
        db.add(subscriber)
        db.commit()
        db.refresh(subscriber)
        
        # Crear notificación para el admin
        create_admin_notification(
            db=db,
            notification_type="newsletter",
            title="Nueva suscripción al newsletter",
            message=f"{subscription.name or subscription.email} se suscribió",
            related_id=subscriber.id
        )
        
        # Enviar email de bienvenida al usuario
        user_welcome_subject = "¡Bienvenido al Newsletter de Café Demo! ☕"
        user_welcome_body = f"""¡Hola {subscription.name or 'amigo cafetero'}!

¡Te damos la bienvenida al newsletter de Café Demo! ☕

Ahora recibirás:
✅ Ofertas exclusivas y descuentos especiales
✅ Noticias sobre nuevos productos y eventos
✅ Tips y curiosidades del mundo del café
✅ Invitaciones a eventos especiales

¡Gracias por unirte a nuestra comunidad cafetera!

Con cariño,
El equipo de Café Demo

---
Email: {subscription.email}
Fecha: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}

Si no deseas recibir más newsletters, puedes darte de baja respondiendo a este email."""
        
        # Enviar notificación al admin
        admin_newsletter_subject = "Nueva suscripción al newsletter - Café Demo"
        admin_newsletter_body = f"""📧 **NUEVA SUSCRIPCIÓN AL NEWSLETTER**

👤 **Suscriptor:**
Email: {subscription.email}
Nombre: {subscription.name or 'No proporcionado'}
Fecha: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}

📊 **Estadísticas:**
ID de suscripción: #{subscriber.id}
Estado: Activo

---
⚡ **Acción sugerida:**
Puedes gestionar las suscripciones desde el panel de administración.

Café Demo - Sistema de Gestión"""
        
        # Enviar ambos correos
        user_email_sent = send_email(
            to_email=subscription.email,
            subject=user_welcome_subject,
            body=user_welcome_body
        )
        
        admin_email_sent = send_email(
            to_email="jesussebastianalonsoarias@gmail.com",  # Email del admin
            subject=admin_newsletter_subject,
            body=admin_newsletter_body
        )
        
        return {
            "success": True,
            "message": "Suscripción exitosa al newsletter",
            "id": subscriber.id,
            "subscribed": True,
            "user_email_sent": user_email_sent,
            "admin_email_sent": admin_email_sent
        }
        
    except Exception as e:
        print(f"Error en suscripción: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

# ================================
# ADMIN UPLOAD ENDPOINT
# ================================

@app.post("/admin/upload-image", summary="[ADMIN] Subir imagen de producto")
async def upload_product_image(file: UploadFile = File(...), current_user: str = Depends(verify_token)):
    try:
        # Validar tipo de archivo
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="El archivo debe ser una imagen")
        
        # Validar tamaño (max 5MB)
        file_content = await file.read()
        if len(file_content) > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="La imagen debe ser menor a 5MB")
        
        # Generar nombre único
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
        unique_filename = f"{int(datetime.now().timestamp())}_{file.filename}"
        file_path = f"uploads/products/{unique_filename}"
        
        # Crear directorio si no existe
        os.makedirs("uploads/products", exist_ok=True)
        
        # Guardar archivo
        with open(file_path, "wb") as f:
            f.write(file_content)
        
        # Retornar URL relativa para usar en el frontend
        return {
            "success": True,
            "filename": unique_filename,
            "url": f"/uploads/products/{unique_filename}",
            "message": "Imagen subida exitosamente"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error subiendo imagen: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

# ================================
# CHATBOT ENDPOINTS
# ================================

@app.get("/chatbot/status", summary="Estado del chatbot")
async def get_chatbot_status():
    """
    Endpoint para verificar el estado de configuración del chatbot.
    """
    openai_key = os.getenv('OPENAI_API_KEY')
    config_status = chatbot.validate_config()
    
    debug_info = {
        "openai_key_present": bool(openai_key),
        "openai_key_length": len(openai_key) if openai_key else 0,
        "openai_key_prefix": openai_key[:10] + "..." if openai_key else None,
        "environment_vars": {
            "OPENAI_API_KEY": "✅ Configurada" if openai_key else "❌ No configurada",
            "APP_NAME": os.getenv('APP_NAME', 'Default'),
            "PHONE_CONTACT": os.getenv('PHONE_CONTACT', 'Default'),
            "ADDRESS": os.getenv('ADDRESS', 'Default')
        }
    }
    
    return {
        "chatbot_active": True,
        "configuration": config_status,
        "debug_info": debug_info,
        "message": "Chatbot configurado correctamente" if all(config_status.values()) else "Configuración incompleta"
    }

@app.post("/chat", summary="Chat con el bot")
async def chat_with_bot(message_data: dict):
    """Endpoint principal para chatear con el bot"""
    user_message = message_data.get('message', '')
    
    if not user_message.strip():
        raise HTTPException(status_code=400, detail="El mensaje no puede estar vacío")
    
    try:
        # Usar el chatbot para generar respuesta
        response = chatbot.get_chat_response(user_message)
        
        return {
            "message": response,
            "status": "success",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"Error en chat: {e}")
        return {
            "message": "Lo siento, estoy experimentando dificultades técnicas. Por favor, intenta más tarde.",
            "status": "error",
            "error": str(e)
        }

# ================================
# ENDPOINTS ADMIN FALTANTES
# ================================

@app.get("/admin/contacts", summary="[ADMIN] Obtener mensajes de contacto")
async def get_admin_contacts(current_user: str = Depends(verify_token), db: Session = Depends(get_db)):
    """Obtener todos los mensajes de contacto para el admin"""
    contacts = db.query(ContactMessage).order_by(ContactMessage.created_at.desc()).all()
    
    return [
        {
            "id": contact.id,
            "name": contact.name,
            "email": contact.email,
            "subject": contact.subject,
            "message": contact.message,
            "created_at": contact.created_at.isoformat()
        }
        for contact in contacts
    ]

@app.get("/admin/newsletter/subscribers", summary="[ADMIN] Obtener suscriptores del newsletter")
async def get_admin_newsletter_subscribers(current_user: str = Depends(verify_token), db: Session = Depends(get_db)):
    """Obtener todos los suscriptores del newsletter para el admin"""
    subscribers = db.query(NewsletterSubscriber).filter(
        NewsletterSubscriber.active == True
    ).order_by(NewsletterSubscriber.subscribed_at.desc()).all()
    
    return [
        {
            "id": sub.id,
            "email": sub.email,
            "name": sub.name,
            "subscribed_at": sub.subscribed_at.isoformat(),
            "active": sub.active
        }
        for sub in subscribers
    ]

@app.get("/admin/orders/stats", summary="[ADMIN] Estadísticas de pedidos")
async def get_orders_stats(current_user: str = Depends(verify_token), db: Session = Depends(get_db)):
    """Obtener estadísticas de pedidos para el dashboard admin"""
    from sqlalchemy import func
    
    # Contar pedidos por estado
    orders_by_status = db.query(
        Order.status, func.count(Order.id).label('count')
    ).group_by(Order.status).all()
    
    # Total de pedidos
    total_orders = db.query(func.count(Order.id)).scalar()
    
    # Ingresos totales
    total_revenue = db.query(func.sum(Order.total_amount)).scalar() or 0
    
    # Pedidos de hoy
    today = datetime.now().date()
    today_orders = db.query(func.count(Order.id)).filter(
        func.date(Order.created_at) == today
    ).scalar()
    
    return {
        "total_orders": total_orders,
        "total_revenue": float(total_revenue),
        "today_orders": today_orders,
        "orders_by_status": [
            {"status": status, "count": count} 
            for status, count in orders_by_status
        ]
    }

@app.get("/admin/reservations/stats", summary="[ADMIN] Estadísticas de reservas")
async def get_reservations_stats(current_user: str = Depends(verify_token), db: Session = Depends(get_db)):
    """Obtener estadísticas de reservas para el dashboard admin"""
    from sqlalchemy import func
    
    # Contar reservas por estado
    reservations_by_status = db.query(
        Reservation.status, func.count(Reservation.id).label('count')
    ).group_by(Reservation.status).all()
    
    # Total de reservas
    total_reservations = db.query(func.count(Reservation.id)).scalar()
    
    # Reservas de hoy
    today = datetime.now().date()
    today_reservations = db.query(func.count(Reservation.id)).filter(
        func.date(Reservation.created_at) == today
    ).scalar()
    
    # Reservas para hoy (fecha de reserva)
    reservations_for_today = db.query(func.count(Reservation.id)).filter(
        Reservation.reservation_date == today.isoformat()
    ).scalar()
    
    return {
        "total_reservations": total_reservations,
        "today_reservations": today_reservations,
        "reservations_for_today": reservations_for_today,
        "reservations_by_status": [
            {"status": status, "count": count} 
            for status, count in reservations_by_status
        ]
    }

@app.put("/admin/orders/{order_id}/status", summary="[ADMIN] Actualizar estado de pedido")
async def update_order_status(
    order_id: int, 
    status_data: dict, 
    current_user: str = Depends(verify_token), 
    db: Session = Depends(get_db)
):
    """Actualizar el estado de un pedido"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    
    new_status = status_data.get("status")
    if not new_status:
        raise HTTPException(status_code=400, detail="Estado requerido")
    
    # Validar estados permitidos
    allowed_statuses = ["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"]
    if new_status not in allowed_statuses:
        raise HTTPException(status_code=400, detail="Estado no válido")
    
    order.status = new_status
    db.commit()
    
    # Crear notificación
    create_admin_notification(
        db=db,
        notification_type="order_update",
        title=f"Pedido #{order_id} actualizado",
        message=f"Estado cambiado a: {new_status}",
        related_id=order_id
    )
    
    return {
        "success": True,
        "message": f"Estado del pedido actualizado a {new_status}",
        "order_id": order_id,
        "new_status": new_status
    }

@app.put("/admin/reservations/{reservation_id}/status", summary="[ADMIN] Actualizar estado de reserva")
async def update_reservation_status(
    reservation_id: int, 
    status_data: dict, 
    current_user: str = Depends(verify_token), 
    db: Session = Depends(get_db)
):
    """Actualizar el estado de una reserva"""
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    
    new_status = status_data.get("status")
    if not new_status:
        raise HTTPException(status_code=400, detail="Estado requerido")
    
    # Validar estados permitidos
    allowed_statuses = ["pending", "confirmed", "cancelled", "completed"]
    if new_status not in allowed_statuses:
        raise HTTPException(status_code=400, detail="Estado no válido")
    
    reservation.status = new_status
    db.commit()
    
    # Crear notificación
    create_admin_notification(
        db=db,
        notification_type="reservation_update",
        title=f"Reserva #{reservation_id} actualizada",
        message=f"Estado cambiado a: {new_status}",
        related_id=reservation_id
    )
    
    return {
        "success": True,
        "message": f"Estado de la reserva actualizado a {new_status}",
        "reservation_id": reservation_id,
        "new_status": new_status
    }

# ================================
# ENDPOINT APLICACIONES DE TRABAJO
# ================================

@app.post("/jobs/apply", summary="Enviar aplicación de trabajo")
async def submit_job_application(application: JobApplicationModel, db: Session = Depends(get_db)):
    """Endpoint para enviar aplicaciones de trabajo"""
    try:
        # Crear aplicación de trabajo
        job_app = JobApplication(
            name=application.name,
            email=application.email,
            phone=application.phone,
            position=application.position,
            experience=application.experience,
            motivation=application.motivation,
            cv_filename=application.cv_filename
        )
        
        db.add(job_app)
        db.commit()
        db.refresh(job_app)
        
        # Crear notificación para el admin
        create_admin_notification(
            db=db,
            notification_type="job_application",
            title=f"Nueva solicitud: {application.position}",
            message=f"{application.name} se postuló para {application.position}",
            related_id=job_app.id
        )
        
        # Email al aplicante
        applicant_email_subject = f"Confirmación de aplicación - {application.position} - Café Demo ☕"
        applicant_email_body = f"""¡Hola {application.name}!

Gracias por tu interés en unirte a nuestro equipo como {application.position}.

Hemos recibido tu aplicación correctamente:

💼 **Detalles de tu aplicación:**
Posición: {application.position}
Fecha: {datetime.now().strftime('%d/%m/%Y %H:%M')}
ID: #{job_app.id}

⏰ **¿Qué sigue?**
Nuestro equipo de recursos humanos revisará tu aplicación y nos pondremos en contacto contigo en los próximos días si tu perfil se ajusta a lo que estamos buscando.

📋 **Tu experiencia nos interesa:**
\"{application.experience[:200]}{'...' if len(application.experience) > 200 else ''}\"

¡Gracias por considerar trabajar con nosotros!

Saludos,
Equipo de Recursos Humanos - Café Demo

---
ID de aplicación: #{job_app.id}
Email: {application.email}"""
        
        # Email al admin
        admin_job_subject = f"Nueva aplicación de trabajo: {application.position}"
        admin_job_body = f"""💼 **NUEVA APLICACIÓN DE TRABAJO**

👤 **Candidato:**
Nombre: {application.name}
Email: {application.email}
Teléfono: {application.phone}

💼 **Posición:**
{application.position}

📊 **Experiencia:**
{application.experience}

💖 **Motivación:**
{application.motivation}

---
Fecha: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}
ID: #{job_app.id}

⚡ **Acción requerida:**
Revisar la aplicación desde el panel de administración.

Café Demo - Sistema de Gestión"""
        
        # Enviar correos
        user_email_sent = send_email(
            to_email=application.email,
            subject=applicant_email_subject,
            body=applicant_email_body
        )
        
        admin_email_sent = send_email(
            to_email="jesussebastianalonsoarias@gmail.com",
            subject=admin_job_subject,
            body=admin_job_body
        )
        
        return {
            "success": True,
            "message": "Aplicación enviada exitosamente",
            "id": job_app.id,
            "user_email_sent": user_email_sent,
            "admin_email_sent": admin_email_sent
        }
        
    except Exception as e:
        print(f"Error procesando aplicación de trabajo: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

# ================================
# ENDPOINTS DELETE PARA ADMIN
# ================================

@app.delete("/admin/contacts/{contact_id}", summary="[ADMIN] Eliminar mensaje de contacto")
async def delete_contact_message(contact_id: int, current_user: str = Depends(verify_token), db: Session = Depends(get_db)):
    """Eliminar un mensaje de contacto"""
    contact = db.query(ContactMessage).filter(ContactMessage.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Mensaje no encontrado")
    
    db.delete(contact)
    db.commit()
    
    return {"success": True, "message": "Mensaje eliminado exitosamente"}

@app.delete("/admin/newsletter/subscribers/{subscriber_id}", summary="[ADMIN] Eliminar suscriptor del newsletter")
async def delete_newsletter_subscriber(subscriber_id: int, current_user: str = Depends(verify_token), db: Session = Depends(get_db)):
    """Eliminar un suscriptor del newsletter"""
    subscriber = db.query(NewsletterSubscriber).filter(NewsletterSubscriber.id == subscriber_id).first()
    if not subscriber:
        raise HTTPException(status_code=404, detail="Suscriptor no encontrado")
    
    db.delete(subscriber)
    db.commit()
    
    return {"success": True, "message": "Suscriptor eliminado exitosamente"}

@app.delete("/admin/job-applications/{application_id}", summary="[ADMIN] Eliminar aplicación de trabajo")
async def delete_job_application(application_id: int, current_user: str = Depends(verify_token), db: Session = Depends(get_db)):
    """Eliminar una aplicación de trabajo"""
    application = db.query(JobApplication).filter(JobApplication.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Aplicación no encontrada")
    
    db.delete(application)
    db.commit()
    
    return {"success": True, "message": "Aplicación eliminada exitosamente"}

# ================================
# SISTEMA DE RESPUESTAS ADMIN
# ================================

@app.post("/admin/reply", summary="[ADMIN] Enviar respuesta por email")
async def admin_send_reply(reply: AdminReplyModel, current_user: str = Depends(verify_token), db: Session = Depends(get_db)):
    """Endpoint para que el admin envíe respuestas por email"""
    try:
        # Plantilla profesional para respuesta del admin
        admin_reply_subject = f"Re: {reply.subject} - Café Demo ☕"
        admin_reply_body = f"""¡Hola!

Gracias por contactar con Café Demo. Hemos revisado tu mensaje y queremos responderte personalmente:

{reply.message}

---

Si tienes más preguntas, no dudes en contactarnos:
📞 Teléfono: +34 123 456 789
✉️ Email: info@cafedemo.com
💬 Chat IA: Disponible 24/7 en nuestra web

¡Esperamos verte pronto en nuestro café!

Saludos cordiales,
El equipo de Café Demo

---
Este mensaje fue enviado desde el panel de administración.
Fecha: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}"""
        
        # Enviar email
        email_sent = send_email(
            to_email=reply.recipient_email,
            subject=admin_reply_subject,
            body=admin_reply_body
        )
        
        # Crear notificación de seguimiento
        create_admin_notification(
            db=db,
            notification_type="admin_reply",
            title=f"Respuesta enviada a {reply.recipient_email}",
            message=f"Asunto: {reply.subject}",
            related_id=reply.reference_id
        )
        
        return {
            "success": True,
            "message": "Respuesta enviada exitosamente",
            "email_sent": email_sent,
            "recipient": reply.recipient_email
        }
        
    except Exception as e:
        print(f"Error enviando respuesta del admin: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

# ================================
# FUNCIÓN AUXILIAR NEWSLETTER
# ================================

async def send_newsletter_to_subscribers(subject: str, content: str, db: Session):
    """
    Función para enviar newsletter a todos los suscriptores activos
    """
    try:
        # Obtener todos los suscriptores activos
        subscribers = db.query(NewsletterSubscriber).filter(
            NewsletterSubscriber.active == True
        ).all()
        
        if not subscribers:
            return {"sent": 0, "message": "No hay suscriptores activos"}
        
        sent_count = 0
        failed_count = 0
        
        for subscriber in subscribers:
            try:
                # Plantilla personalizada para cada suscriptor
                newsletter_body = f"""¡Hola {subscriber.name or 'amigo cafetero'}!

¡Tenemos noticias emocionantes desde Café Demo! ☕

{content}

¡No te lo pierdas! Ven a visitarnos y disfruta de la experiencia completa.

📍 **¿Dónde encontrarnos?**
Calle Principal 123, Madrid
📞 Teléfono: +34 123 456 789
⏰ Horarios: Lunes a Domingo, 7:00 - 22:00

¡Gracias por ser parte de nuestra comunidad cafetera!

Con cariño,
El equipo de Café Demo

---
Email: {subscriber.email}
Fecha: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}

Si no deseas recibir más newsletters, puedes darte de baja respondiendo a este email."""
                
                success = send_email(
                    to_email=subscriber.email,
                    subject=subject,
                    body=newsletter_body
                )
                
                if success:
                    sent_count += 1
                else:
                    failed_count += 1
                    
            except Exception as e:
                print(f"Error enviando newsletter a {subscriber.email}: {e}")
                failed_count += 1
        
        return {
            "sent": sent_count,
            "failed": failed_count,
            "total_subscribers": len(subscribers)
        }
        
    except Exception as e:
        print(f"Error en envío masivo de newsletter: {e}")
        return {"sent": 0, "failed": 0, "error": str(e)}
