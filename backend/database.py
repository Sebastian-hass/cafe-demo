"""
Configuración de base de datos con SQLAlchemy
Soporta tanto SQLite (desarrollo) como PostgreSQL (producción)
"""
import os
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
from datetime import datetime
from typing import Generator

# Configuración de la base de datos
DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    # Producción: PostgreSQL en Render
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_recycle=300)
else:
    # Desarrollo: SQLite local
    DATABASE_URL = "sqlite:///./cafe.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ================================
# MODELOS DE LA BASE DE DATOS
# ================================

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text)
    price = Column(Float, nullable=False)
    category = Column(String, nullable=False)
    image = Column(String)
    available = Column(Boolean, default=True)
    
    # Relación con especiales
    specials = relationship("Special", back_populates="product")

class Special(Base):
    __tablename__ = "specials"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    date = Column(String, nullable=False)
    discount = Column(Float, nullable=False)
    
    # Relación con producto
    product = relationship("Product", back_populates="specials")

class ProductCategory(Base):
    __tablename__ = "product_categories"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    icon = Column(String)
    created_at = Column(DateTime, default=func.now())

class NewsArticle(Base):
    __tablename__ = "news_articles"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    excerpt = Column(Text)
    content = Column(Text, nullable=False)
    author = Column(String, nullable=False)
    category = Column(String, nullable=False)
    featured = Column(Boolean, default=False)
    image = Column(String)
    tags = Column(Text)  # JSON serializado
    published = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class CarouselImage(Base):
    __tablename__ = "carousel_images"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    subtitle = Column(String)
    description = Column(Text)
    image = Column(String, nullable=False)
    link = Column(String)
    active = Column(Boolean, default=True)
    order_position = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now())

class PageContent(Base):
    __tablename__ = "page_contents"
    
    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    section = Column(String, nullable=False)
    page = Column(String, nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class ContactMessage(Base):
    __tablename__ = "contact_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=func.now())

class NewsletterSubscriber(Base):
    __tablename__ = "newsletter_subscribers"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, nullable=False, unique=True, index=True)
    name = Column(String)
    subscribed_at = Column(DateTime, default=func.now())
    active = Column(Boolean, default=True)

class JobApplication(Base):
    __tablename__ = "job_applications"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    position = Column(String, nullable=False)
    experience = Column(Text, nullable=False)
    motivation = Column(Text, nullable=False)
    cv_filename = Column(String)
    created_at = Column(DateTime, default=func.now())

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String, nullable=False)
    customer_email = Column(String, nullable=False)
    customer_phone = Column(String)
    items = Column(Text, nullable=False)  # JSON serializado
    total_amount = Column(Float, nullable=False)
    notes = Column(Text)
    status = Column(String, default="pending")  # pending, completed, cancelled
    created_at = Column(DateTime, default=func.now())

class Reservation(Base):
    __tablename__ = "reservations"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String, nullable=False)
    customer_email = Column(String, nullable=False)
    customer_phone = Column(String, nullable=False)
    party_size = Column(Integer, nullable=False)
    reservation_date = Column(String, nullable=False)
    reservation_time = Column(String, nullable=False)
    notes = Column(Text)
    status = Column(String, default="pending")  # pending, confirmed, cancelled
    created_at = Column(DateTime, default=func.now())

class AdminNotification(Base):
    __tablename__ = "admin_notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, nullable=False)  # order, reservation, contact, newsletter
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    related_id = Column(Integer)  # ID del elemento relacionado
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())

# ================================
# FUNCIONES DE SESIÓN
# ================================

def get_db() -> Generator:
    """Generador de sesiones de base de datos"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    """Crear todas las tablas en la base de datos"""
    Base.metadata.create_all(bind=engine)

def get_database_info():
    """Obtener información sobre la base de datos actual"""
    db_type = "PostgreSQL" if "postgresql" in str(engine.url) else "SQLite"
    return {
        "type": db_type,
        "url": str(engine.url).replace(str(engine.url).split('@')[0].split('://')[-1] + '@', '****@') if '@' in str(engine.url) else str(engine.url),
        "connected": True
    }
