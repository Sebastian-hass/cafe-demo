"""
Script para poblar la base de datos con datos iniciales
"""
from database import SessionLocal, Product, Special, ProductCategory
from datetime import date
import json

def init_sample_data():
    """Inicializar la base de datos con datos de muestra"""
    db = SessionLocal()
    
    try:
        # Verificar si ya hay productos
        existing_products = db.query(Product).count()
        if existing_products > 0:
            print("✅ La base de datos ya contiene datos")
            return
        
        # Crear categorías
        categories_data = [
            {"id": "bebidas", "name": "Bebidas", "description": "Cafés, tés y bebidas refrescantes", "icon": "coffee"},
            {"id": "panaderia", "name": "Panadería", "description": "Pan fresco, croissants y tostadas", "icon": "bread-slice"},
            {"id": "postres", "name": "Postres", "description": "Dulces, tartas y delicias", "icon": "cake-slice"},
        ]
        
        for cat_data in categories_data:
            # Verificar si la categoría ya existe
            existing_cat = db.query(ProductCategory).filter(ProductCategory.id == cat_data["id"]).first()
            if not existing_cat:
                category = ProductCategory(**cat_data)
                db.add(category)
        
        # Crear productos de muestra
        sample_products = [
            {
                "name": "Cappuccino Clásico",
                "description": "Espresso con leche vaporizada y espuma de leche cremosa",
                "price": 3.50,
                "category": "bebidas",
                "image": "cappuccino.jpg",
                "available": True
            },
            {
                "name": "Latte Vainilla",
                "description": "Espresso con leche y un toque de vainilla natural",
                "price": 4.20,
                "category": "bebidas",
                "image": "latte.jpg",
                "available": True
            },
            {
                "name": "Americano",
                "description": "Espresso doble con agua caliente",
                "price": 2.80,
                "category": "bebidas",
                "image": "americano.jpg",
                "available": True
            },
            {
                "name": "Croissant Mantequilla",
                "description": "Croissant francés recién horneado con mantequilla",
                "price": 2.50,
                "category": "panaderia",
                "image": "croissant.jpg",
                "available": True
            },
            {
                "name": "Tostada Aguacate",
                "description": "Pan integral con aguacate, tomate y semillas",
                "price": 5.80,
                "category": "panaderia",
                "image": "tostada.jpg",
                "available": True
            },
            {
                "name": "Tarta de Queso",
                "description": "Deliciosa tarta de queso casera con frutos rojos",
                "price": 4.20,
                "category": "postres",
                "image": "cheesecake.jpg",
                "available": True
            },
            {
                "name": "Brownie Chocolate",
                "description": "Brownie húmedo con chocolate belga y nueces",
                "price": 3.80,
                "category": "postres",
                "image": "brownie.jpg",
                "available": True
            },
            {
                "name": "Smoothie Verde",
                "description": "Espinaca, plátano, mango y leche de coco",
                "price": 5.20,
                "category": "bebidas",
                "image": "smoothie.jpg",
                "available": True
            }
        ]
        
        # Insertar productos
        created_products = []
        for prod_data in sample_products:
            product = Product(**prod_data)
            db.add(product)
            db.flush()  # Para obtener el ID
            created_products.append(product)
        
        db.commit()
        
        # Crear especiales del día (después de insertar productos)
        today = date.today().isoformat()
        
        # Buscar productos para especiales
        cappuccino = db.query(Product).filter(Product.name == "Cappuccino Clásico").first()
        tarta = db.query(Product).filter(Product.name == "Tarta de Queso").first()
        
        if cappuccino and tarta:
            specials_data = [
                {
                    "product_id": cappuccino.id,
                    "date": today,
                    "discount": 20.0
                },
                {
                    "product_id": tarta.id,
                    "date": today,
                    "discount": 15.0
                }
            ]
            
            for special_data in specials_data:
                special = Special(**special_data)
                db.add(special)
        
        db.commit()
        print(f"✅ Base de datos inicializada con {len(sample_products)} productos y especiales del día")
        
    except Exception as e:
        print(f"❌ Error inicializando datos: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_sample_data()
