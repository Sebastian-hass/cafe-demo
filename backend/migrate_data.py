"""
Script de migración de datos de SQLite a PostgreSQL
"""
import sqlite3
import json
from datetime import datetime
from database import SessionLocal, Product, Special, ProductCategory, AdminNotification

def migrate_sqlite_to_postgres():
    """
    Migrar datos existentes de SQLite a PostgreSQL
    """
    try:
        # Conectar a SQLite
        sqlite_conn = sqlite3.connect('cafe.db')
        sqlite_cursor = sqlite_conn.cursor()
        
        # Conectar a PostgreSQL (usando SQLAlchemy)
        pg_session = SessionLocal()
        
        print("🔄 Iniciando migración de SQLite a PostgreSQL...")
        
        # 1. Migrar productos
        print("📦 Migrando productos...")
        sqlite_cursor.execute("SELECT * FROM products")
        products_data = sqlite_cursor.fetchall()
        
        for prod in products_data:
            # Verificar si el producto ya existe
            existing = pg_session.query(Product).filter(Product.id == prod[0]).first()
            if not existing:
                product = Product(
                    id=prod[0],
                    name=prod[1],
                    description=prod[2],
                    price=prod[3],
                    category=prod[4],
                    image=prod[5],
                    available=bool(prod[6])
                )
                pg_session.add(product)
        
        pg_session.commit()
        print(f"✅ {len(products_data)} productos migrados")
        
        # 2. Migrar especiales
        print("⭐ Migrando especiales...")
        sqlite_cursor.execute("SELECT * FROM specials")
        specials_data = sqlite_cursor.fetchall()
        
        for spec in specials_data:
            existing = pg_session.query(Special).filter(Special.id == spec[0]).first()
            if not existing:
                special = Special(
                    id=spec[0],
                    product_id=spec[1],
                    date=spec[2],
                    discount=spec[3]
                )
                pg_session.add(special)
        
        pg_session.commit()
        print(f"✅ {len(specials_data)} especiales migrados")
        
        # 3. Migrar categorías de productos (si existen)
        try:
            sqlite_cursor.execute("SELECT * FROM product_categories")
            categories_data = sqlite_cursor.fetchall()
            
            print("🏷️ Migrando categorías...")
            for cat in categories_data:
                existing = pg_session.query(ProductCategory).filter(ProductCategory.id == cat[0]).first()
                if not existing:
                    category = ProductCategory(
                        id=cat[0],
                        name=cat[1],
                        description=cat[2],
                        icon=cat[3]
                    )
                    pg_session.add(category)
            
            pg_session.commit()
            print(f"✅ {len(categories_data)} categorías migradas")
            
        except sqlite3.OperationalError:
            print("ℹ️ Tabla product_categories no existe en SQLite, creando categorías por defecto...")
        
        # 4. Migrar notificaciones (si existen)
        try:
            sqlite_cursor.execute("SELECT * FROM admin_notifications")
            notifications_data = sqlite_cursor.fetchall()
            
            print("🔔 Migrando notificaciones...")
            for notif in notifications_data:
                existing = pg_session.query(AdminNotification).filter(AdminNotification.id == notif[0]).first()
                if not existing:
                    notification = AdminNotification(
                        id=notif[0],
                        type=notif[1],
                        title=notif[2],
                        message=notif[3],
                        related_id=notif[4],
                        is_read=bool(notif[5]),
                        created_at=datetime.fromisoformat(notif[6]) if notif[6] else datetime.now()
                    )
                    pg_session.add(notification)
            
            pg_session.commit()
            print(f"✅ {len(notifications_data)} notificaciones migradas")
            
        except sqlite3.OperationalError:
            print("ℹ️ Tabla admin_notifications no existe en SQLite")
        
        # Cerrar conexiones
        sqlite_conn.close()
        pg_session.close()
        
        print("🎉 ¡Migración completada exitosamente!")
        print("📋 Resumen:")
        print(f"   - {len(products_data)} productos")
        print(f"   - {len(specials_data)} especiales")
        print("   - Categorías y notificaciones (si existían)")
        
    except Exception as e:
        print(f"❌ Error durante la migración: {e}")
        if 'pg_session' in locals():
            pg_session.rollback()
            pg_session.close()

def verify_migration():
    """
    Verificar que la migración fue exitosa
    """
    try:
        pg_session = SessionLocal()
        
        # Contar registros
        products_count = pg_session.query(Product).count()
        specials_count = pg_session.query(Special).count()
        categories_count = pg_session.query(ProductCategory).count()
        notifications_count = pg_session.query(AdminNotification).count()
        
        print("\n📊 Verificación de migración:")
        print(f"   - Productos: {products_count}")
        print(f"   - Especiales: {specials_count}")
        print(f"   - Categorías: {categories_count}")
        print(f"   - Notificaciones: {notifications_count}")
        
        pg_session.close()
        
        return True
        
    except Exception as e:
        print(f"❌ Error verificando migración: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Iniciando migración de datos...")
    migrate_sqlite_to_postgres()
    verify_migration()
