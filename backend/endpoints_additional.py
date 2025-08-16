"""
Endpoints adicionales para orders, reservations, news
"""
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date

from database import (
    get_db, Order, Reservation, NewsArticle
)
from main_new import (
    OrderCreate, OrderResponse, ReservationCreate, ReservationResponse, 
    NewsArticleResponse, verify_token
)
from utils import create_admin_notification, serialize_json, deserialize_json

def setup_additional_routes(app):
    
    # ================================
    # ENDPOINTS DE PEDIDOS
    # ================================
    
    @app.post("/orders", response_model=OrderResponse, summary="Crear pedido")
    async def create_order(order_data: OrderCreate, db: Session = Depends(get_db)):
        try:
            # Calcular total
            total_amount = sum(item.quantity * item.price for item in order_data.items)
            
            # Crear pedido
            order = Order(
                customer_name=order_data.customer_name,
                customer_email=order_data.customer_email,
                customer_phone=order_data.customer_phone,
                items=serialize_json([item.dict() for item in order_data.items]),
                total_amount=total_amount,
                notes=order_data.notes,
                status="pending"
            )
            
            db.add(order)
            db.commit()
            db.refresh(order)
            
            # Crear notificación para admin
            create_admin_notification(
                db=db,
                notification_type="order",
                title=f"Nuevo pedido de {order_data.customer_name}",
                message=f"Pedido por €{total_amount:.2f}",
                related_id=order.id
            )
            
            return OrderResponse(
                id=order.id,
                customer_name=order.customer_name,
                customer_email=order.customer_email,
                customer_phone=order.customer_phone,
                items=deserialize_json(order.items, []),
                total_amount=order.total_amount,
                notes=order.notes,
                status=order.status,
                created_at=order.created_at.isoformat()
            )
            
        except Exception as e:
            print(f"Error creando pedido: {e}")
            raise HTTPException(status_code=500, detail="Error interno del servidor")
    
    @app.get("/admin/orders", summary="[ADMIN] Obtener todos los pedidos")
    async def get_admin_orders(current_user: str = Depends(verify_token), db: Session = Depends(get_db)):
        orders = db.query(Order).order_by(Order.created_at.desc()).all()
        
        return [
            {
                "id": order.id,
                "customer_name": order.customer_name,
                "customer_email": order.customer_email,
                "customer_phone": order.customer_phone,
                "items": deserialize_json(order.items, []),
                "total_amount": order.total_amount,
                "notes": order.notes,
                "status": order.status,
                "created_at": order.created_at.isoformat()
            }
            for order in orders
        ]
    
    # ================================
    # ENDPOINTS DE RESERVAS
    # ================================
    
    @app.post("/reservations", response_model=ReservationResponse, summary="Crear reserva")
    async def create_reservation(reservation_data: ReservationCreate, db: Session = Depends(get_db)):
        try:
            reservation = Reservation(
                customer_name=reservation_data.customer_name,
                customer_email=reservation_data.customer_email,
                customer_phone=reservation_data.customer_phone,
                party_size=reservation_data.party_size,
                reservation_date=reservation_data.reservation_date,
                reservation_time=reservation_data.reservation_time,
                notes=reservation_data.notes,
                status="pending"
            )
            
            db.add(reservation)
            db.commit()
            db.refresh(reservation)
            
            # Crear notificación para admin
            create_admin_notification(
                db=db,
                notification_type="reservation",
                title=f"Nueva reserva de {reservation_data.customer_name}",
                message=f"{reservation_data.party_size} personas el {reservation_data.reservation_date} a las {reservation_data.reservation_time}",
                related_id=reservation.id
            )
            
            return ReservationResponse(
                id=reservation.id,
                customer_name=reservation.customer_name,
                customer_email=reservation.customer_email,
                customer_phone=reservation.customer_phone,
                party_size=reservation.party_size,
                reservation_date=reservation.reservation_date,
                reservation_time=reservation.reservation_time,
                notes=reservation.notes,
                status=reservation.status,
                created_at=reservation.created_at.isoformat()
            )
            
        except Exception as e:
            print(f"Error creando reserva: {e}")
            raise HTTPException(status_code=500, detail="Error interno del servidor")
    
    @app.get("/reservations/availability/{reservation_date}", summary="Verificar disponibilidad")
    async def check_availability(reservation_date: str, db: Session = Depends(get_db)):
        """Endpoint básico de disponibilidad - siempre disponible por ahora"""
        return {
            "date": reservation_date,
            "available": True,
            "available_times": [
                "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
                "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
                "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
                "18:00", "18:30", "19:00", "19:30", "20:00", "20:30"
            ]
        }
    
    @app.get("/admin/reservations", summary="[ADMIN] Obtener todas las reservas")
    async def get_admin_reservations(current_user: str = Depends(verify_token), db: Session = Depends(get_db)):
        reservations = db.query(Reservation).order_by(Reservation.created_at.desc()).all()
        
        return [
            {
                "id": res.id,
                "customer_name": res.customer_name,
                "customer_email": res.customer_email,
                "customer_phone": res.customer_phone,
                "party_size": res.party_size,
                "reservation_date": res.reservation_date,
                "reservation_time": res.reservation_time,
                "notes": res.notes,
                "status": res.status,
                "created_at": res.created_at.isoformat()
            }
            for res in reservations
        ]
    
    # ================================
    # ENDPOINTS DE NOTICIAS
    # ================================
    
    @app.get("/news", summary="Obtener todas las noticias publicadas")
    async def get_news(db: Session = Depends(get_db)):
        """Endpoint para obtener noticias - devuelve lista vacía por ahora"""
        articles = db.query(NewsArticle).filter(NewsArticle.published == True).order_by(NewsArticle.created_at.desc()).all()
        
        # Si no hay artículos, devolver algunos de ejemplo
        if not articles:
            return [
                {
                    "id": 1,
                    "title": "¡Nuevos sabores de café disponibles!",
                    "excerpt": "Descubre nuestros nuevos blends especiales importados directamente de Colombia.",
                    "content": "Estamos emocionados de presentar nuestra nueva línea de cafés especiales...",
                    "author": "Café Demo",
                    "category": "Productos",
                    "featured": True,
                    "image": "/uploads/news/cafe-nuevos-sabores.jpg",
                    "tags": ["café", "nuevos productos", "Colombia"],
                    "published": True,
                    "created_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat()
                },
                {
                    "id": 2,
                    "title": "Horarios especiales de temporada",
                    "excerpt": "Conoce nuestros nuevos horarios durante la temporada de invierno.",
                    "content": "A partir del próximo mes, ajustaremos nuestros horarios...",
                    "author": "Café Demo",
                    "category": "Anuncios",
                    "featured": False,
                    "image": "/uploads/news/horarios-invierno.jpg",
                    "tags": ["horarios", "invierno", "anuncios"],
                    "published": True,
                    "created_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat()
                }
            ]
        
        return [
            {
                "id": article.id,
                "title": article.title,
                "excerpt": article.excerpt,
                "content": article.content,
                "author": article.author,
                "category": article.category,
                "featured": article.featured,
                "image": article.image,
                "tags": deserialize_json(article.tags, []),
                "published": article.published,
                "created_at": article.created_at.isoformat(),
                "updated_at": article.updated_at.isoformat()
            }
            for article in articles
        ]
    
    @app.get("/admin/news", summary="[ADMIN] Obtener todas las noticias")
    async def get_admin_news(current_user: str = Depends(verify_token), db: Session = Depends(get_db)):
        articles = db.query(NewsArticle).order_by(NewsArticle.created_at.desc()).all()
        
        return [
            {
                "id": article.id,
                "title": article.title,
                "excerpt": article.excerpt,
                "content": article.content,
                "author": article.author,
                "category": article.category,
                "featured": article.featured,
                "image": article.image,
                "tags": deserialize_json(article.tags, []),
                "published": article.published,
                "created_at": article.created_at.isoformat(),
                "updated_at": article.updated_at.isoformat()
            }
            for article in articles
        ]
