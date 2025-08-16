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
        
        # Enviar email (si está configurado)
        email_body = f"""Nuevo mensaje de contacto:
        
Nombre: {message.name}
Email: {message.email}
Asunto: {message.subject}
        
Mensaje:
{message.message}"""
        
        send_email(
            to_email=message.email,
            subject=f"Confirmación: {message.subject}",
            body="Gracias por tu mensaje. Te responderemos pronto."
        )
        
        return {"message": "Mensaje enviado exitosamente", "id": contact_msg.id}
        
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
        
        # Enviar email de bienvenida
        send_email(
            to_email=subscription.email,
            subject="¡Bienvenido al Newsletter de Café Demo!",
            body="Gracias por suscribirte. Recibirás nuestras últimas noticias y ofertas."
        )
        
        return {"message": "Suscripción exitosa", "id": subscriber.id, "subscribed": True}
        
    except Exception as e:
        print(f"Error en suscripción: {e}")
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
            "response": response,
            "status": "success",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"Error en chat: {e}")
        return {
            "response": "Lo siento, estoy experimentando dificultades técnicas. Por favor, intenta más tarde.",
            "status": "error",
            "error": str(e)
        }
