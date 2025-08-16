"""
Endpoints de notificaciones con SQLAlchemy - Solución al problema "database is locked"
"""
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

from database import get_db, AdminNotification, ProductCategory
from main_new import (
    NotificationResponse, CategoryResponse, verify_token, DashboardStats, AdminLogin,
    ADMIN_USERNAME, ADMIN_PASSWORD_HASH, hash_password, create_access_token,
    CategoryCreate, CategoryUpdate
)
from utils import get_unread_notifications_count

# ================================
# ENDPOINTS DE NOTIFICACIONES ADMIN
# ================================

def setup_notifications_routes(app):

    @app.get("/admin/notifications", response_model=List[NotificationResponse], summary="[ADMIN] Obtener notificaciones")
    async def get_admin_notifications(
        current_user: str = Depends(verify_token), 
        limit: int = 50,
        db: Session = Depends(get_db)
    ):
        """Obtener todas las notificaciones del admin, ordenadas por fecha (más recientes primero)"""
        notifications = db.query(AdminNotification).order_by(
            AdminNotification.created_at.desc()
        ).limit(limit).all()
        
        return [
            NotificationResponse(
                id=notif.id,
                type=notif.type,
                title=notif.title,
                message=notif.message,
                related_id=notif.related_id,
                is_read=notif.is_read,
                created_at=notif.created_at.isoformat() if notif.created_at else ""
            ) for notif in notifications
        ]

    @app.get("/admin/notifications/unread", summary="[ADMIN] Obtener notificaciones no leídas")
    async def get_unread_admin_notifications(
        current_user: str = Depends(verify_token),
        db: Session = Depends(get_db)
    ):
        """Obtener el conteo de notificaciones no leídas por tipo"""
        unread_counts = get_unread_notifications_count(db)
        
        # También obtener el total
        total_unread = db.query(AdminNotification).filter(
            AdminNotification.is_read == False
        ).count()
        
        return {
            "total_unread": total_unread,
            "by_type": unread_counts
        }

    @app.put("/admin/notifications/{notification_id}/read", summary="[ADMIN] Marcar notificación como leída")
    async def mark_notification_as_read(
        notification_id: int,
        current_user: str = Depends(verify_token),
        db: Session = Depends(get_db)
    ):
        """Marcar una notificación específica como leída"""
        notification = db.query(AdminNotification).filter(
            AdminNotification.id == notification_id
        ).first()
        
        if not notification:
            raise HTTPException(status_code=404, detail="Notificación no encontrada")
        
        notification.is_read = True
        db.commit()
        
        return {"message": "Notificación marcada como leída", "id": notification_id}

    @app.put("/admin/notifications/mark-all-read", summary="[ADMIN] Marcar todas las notificaciones como leídas")
    async def mark_all_notifications_as_read(
        current_user: str = Depends(verify_token),
        db: Session = Depends(get_db)
    ):
        """Marcar todas las notificaciones como leídas"""
        updated_count = db.query(AdminNotification).filter(
            AdminNotification.is_read == False
        ).update({"is_read": True})
        
        db.commit()
        
        return {"message": f"{updated_count} notificaciones marcadas como leídas"}

    @app.delete("/admin/notifications/{notification_id}", summary="[ADMIN] Eliminar notificación")
    async def delete_admin_notification(
        notification_id: int,
        current_user: str = Depends(verify_token),
        db: Session = Depends(get_db)
    ):
        """Eliminar una notificación específica"""
        notification = db.query(AdminNotification).filter(
            AdminNotification.id == notification_id
        ).first()
        
        if not notification:
            raise HTTPException(status_code=404, detail="Notificación no encontrada")
        
        db.delete(notification)
        db.commit()
        
        return {"message": "Notificación eliminada exitosamente"}

    @app.delete("/admin/notifications/clear-all", summary="[ADMIN] Limpiar todas las notificaciones")
    async def clear_all_notifications(
        current_user: str = Depends(verify_token),
        db: Session = Depends(get_db)
    ):
        """Eliminar todas las notificaciones (usar con precaución)"""
        deleted_count = db.query(AdminNotification).count()
        db.query(AdminNotification).delete()
        db.commit()
        
        return {"message": f"{deleted_count} notificaciones eliminadas"}

    # ================================
    # ENDPOINT DE CATEGORÍAS 
    # ================================
    
    @app.get("/categories", summary="Obtener categorías disponibles")
    async def get_categories(db: Session = Depends(get_db)):
        categories = db.query(ProductCategory).order_by(ProductCategory.name).all()
        
        return [
            {
                "id": cat.id,
                "name": cat.name,
                "description": cat.description or "",
                "icon": cat.icon
            }
            for cat in categories
        ]
    
    @app.get("/admin/categories", summary="[ADMIN] Obtener todas las categorías")
    async def get_admin_categories(current_user: str = Depends(verify_token), db: Session = Depends(get_db)):
        categories = db.query(ProductCategory).order_by(ProductCategory.name).all()
        
        return [
            {
                "id": cat.id,
                "name": cat.name,
                "description": cat.description or "",
                "icon": cat.icon,
                "created_at": cat.created_at.isoformat() if cat.created_at else ""
            }
            for cat in categories
        ]
    
    @app.post("/admin/categories", summary="[ADMIN] Crear nueva categoría")
    async def create_category(
        category_data: CategoryCreate, 
        current_user: str = Depends(verify_token),
        db: Session = Depends(get_db)
    ):
        # Verificar que no exista ya
        existing = db.query(ProductCategory).filter(ProductCategory.id == category_data.id).first()
        if existing:
            raise HTTPException(status_code=400, detail="La categoría ya existe")
        
        category = ProductCategory(
            id=category_data.id,
            name=category_data.name,
            description=category_data.description,
            icon=category_data.icon
        )
        
        db.add(category)
        db.commit()
        db.refresh(category)
        
        return {
            "id": category.id,
            "name": category.name,
            "description": category.description or "",
            "icon": category.icon,
            "created_at": category.created_at.isoformat()
        }
    
    @app.put("/admin/categories/{category_id}", summary="[ADMIN] Actualizar categoría")
    async def update_category(
        category_id: str,
        category_update: CategoryUpdate,
        current_user: str = Depends(verify_token),
        db: Session = Depends(get_db)
    ):
        
        category = db.query(ProductCategory).filter(ProductCategory.id == category_id).first()
        if not category:
            raise HTTPException(status_code=404, detail="Categoría no encontrada")
        
        if category_update.name is not None:
            category.name = category_update.name
        if category_update.description is not None:
            category.description = category_update.description
        if category_update.icon is not None:
            category.icon = category_update.icon
        
        db.commit()
        db.refresh(category)
        
        return {
            "id": category.id,
            "name": category.name,
            "description": category.description or "",
            "icon": category.icon,
            "created_at": category.created_at.isoformat()
        }
    
    @app.delete("/admin/categories/{category_id}", summary="[ADMIN] Eliminar categoría")
    async def delete_category(
        category_id: str,
        current_user: str = Depends(verify_token),
        db: Session = Depends(get_db)
    ):
        category = db.query(ProductCategory).filter(ProductCategory.id == category_id).first()
        if not category:
            raise HTTPException(status_code=404, detail="Categoría no encontrada")
        
        # Verificar si hay productos usando esta categoría
        from database import Product
        products_count = db.query(Product).filter(Product.category == category_id).count()
        if products_count > 0:
            raise HTTPException(
                status_code=400, 
                detail=f"No se puede eliminar. Hay {products_count} producto(s) usando esta categoría"
            )
        
        db.delete(category)
        db.commit()
        
        return {"message": "Categoría eliminada exitosamente"}

    # ================================
    # DASHBOARD ADMIN
    # ================================
    
    @app.get("/admin/dashboard", response_model=DashboardStats, summary="Dashboard estadísticas")
    async def get_dashboard_stats(
        current_user: str = Depends(verify_token),
        db: Session = Depends(get_db)
    ):
        from database import Product, Special
        from datetime import date
        
        # Total productos disponibles
        total_products = db.query(Product).filter(Product.available == True).count()
        
        # Especiales activos hoy
        today = date.today().isoformat()
        active_specials = db.query(Special).filter(Special.date == today).count()
        
        # Total categorías únicas
        total_categories = db.query(ProductCategory).count()
        
        # Actividad reciente simulada (puedes personalizar según tus necesidades)
        recent_activity = [
            {"action": "Producto creado", "item": "Nuevo Latte", "time": "Hace 2 horas"},
            {"action": "Especial actualizado", "item": "Cappuccino 20% OFF", "time": "Hace 4 horas"},
            {"action": "Producto editado", "item": "Americano", "time": "Hace 1 día"},
        ]
        
        return DashboardStats(
            total_products=total_products,
            active_specials=active_specials,
            total_categories=total_categories,
            recent_activity=recent_activity
        )

    # ================================
    # ENDPOINT DE LOGIN ADMIN
    # ================================
    
    @app.post("/admin/login", summary="Login de administrador")
    async def admin_login(credentials: AdminLogin):
        # Verificar credenciales usando variables de entorno
        if (credentials.username == ADMIN_USERNAME and 
            hash_password(credentials.password) == ADMIN_PASSWORD_HASH):
            token = create_access_token({"sub": credentials.username})
            return {
                "access_token": token,
                "token_type": "bearer",
                "user": {"username": credentials.username, "role": "admin"}
            }
        else:
            raise HTTPException(status_code=401, detail="Credenciales incorrectas")
