"""
Endpoints para productos y especiales usando SQLAlchemy
"""
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from database import get_db, Product, Special
from main_new import (
    ProductResponse, SpecialResponse, ProductCreate, ProductUpdate, SpecialCreate,
    verify_token
)

# ================================
# ENDPOINTS PRODUCTOS
# ================================

def setup_products_routes(app):
    
    @app.get("/products", response_model=List[ProductResponse], summary="Obtener todos los productos")
    async def get_products(category: Optional[str] = None, db: Session = Depends(get_db)):
        query = db.query(Product).filter(Product.available == True)
        
        if category:
            query = query.filter(Product.category == category)
        
        products = query.order_by(Product.category, Product.name).all()
        
        return [
            ProductResponse(
                id=p.id, name=p.name, description=p.description or "",
                price=p.price, category=p.category, image=p.image or "", 
                available=p.available
            ) for p in products
        ]

    @app.get("/products/{product_id}", response_model=ProductResponse, summary="Obtener producto por ID")
    async def get_product(product_id: int, db: Session = Depends(get_db)):
        product = db.query(Product).filter(
            Product.id == product_id, 
            Product.available == True
        ).first()
        
        if not product:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        
        return ProductResponse(
            id=product.id, name=product.name, description=product.description or "",
            price=product.price, category=product.category, 
            image=product.image or "", available=product.available
        )

    @app.get("/specials", response_model=List[SpecialResponse], summary="Obtener especiales del día")
    async def get_specials(db: Session = Depends(get_db)):
        today = date.today().isoformat()
        
        specials = db.query(Special).join(Product).filter(
            Special.date == today,
            Product.available == True
        ).order_by(Special.discount.desc()).all()
        
        return [
            SpecialResponse(
                id=s.id,
                product=ProductResponse(
                    id=s.product.id, name=s.product.name, 
                    description=s.product.description or "",
                    price=s.product.price, category=s.product.category,
                    image=s.product.image or "", available=s.product.available
                ),
                discount=s.discount,
                date=s.date
            ) for s in specials
        ]

    # ================================
    # ENDPOINTS ADMIN - PRODUCTOS
    # ================================

    @app.get("/admin/products", response_model=List[ProductResponse], summary="[ADMIN] Obtener todos los productos")
    async def get_admin_products(current_user: str = Depends(verify_token), db: Session = Depends(get_db)):
        products = db.query(Product).order_by(Product.id.desc()).all()
        
        return [
            ProductResponse(
                id=p.id, name=p.name, description=p.description or "",
                price=p.price, category=p.category, image=p.image or "", 
                available=p.available
            ) for p in products
        ]

    @app.post("/admin/products", response_model=ProductResponse, summary="[ADMIN] Crear producto")
    async def create_product(
        product_data: ProductCreate, 
        current_user: str = Depends(verify_token),
        db: Session = Depends(get_db)
    ):
        product = Product(
            name=product_data.name,
            description=product_data.description,
            price=product_data.price,
            category=product_data.category,
            image=product_data.image,
            available=product_data.available
        )
        
        db.add(product)
        db.commit()
        db.refresh(product)
        
        return ProductResponse(
            id=product.id, name=product.name, description=product.description or "",
            price=product.price, category=product.category,
            image=product.image or "", available=product.available
        )

    @app.put("/admin/products/{product_id}", response_model=ProductResponse, summary="[ADMIN] Actualizar producto")
    async def update_product(
        product_id: int,
        product_update: ProductUpdate,
        current_user: str = Depends(verify_token),
        db: Session = Depends(get_db)
    ):
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        
        # Actualizar solo los campos que se proporcionan
        if product_update.name is not None:
            product.name = product_update.name
        if product_update.description is not None:
            product.description = product_update.description
        if product_update.price is not None:
            product.price = product_update.price
        if product_update.category is not None:
            product.category = product_update.category
        if product_update.image is not None:
            product.image = product_update.image
        if product_update.available is not None:
            product.available = product_update.available
        
        db.commit()
        db.refresh(product)
        
        return ProductResponse(
            id=product.id, name=product.name, description=product.description or "",
            price=product.price, category=product.category,
            image=product.image or "", available=product.available
        )

    @app.delete("/admin/products/{product_id}", summary="[ADMIN] Eliminar producto")
    async def delete_product(
        product_id: int,
        current_user: str = Depends(verify_token),
        db: Session = Depends(get_db)
    ):
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        
        # Eliminar especiales relacionados
        db.query(Special).filter(Special.product_id == product_id).delete()
        
        # Eliminar producto
        db.delete(product)
        db.commit()
        
        return {"message": "Producto eliminado exitosamente"}

    # ================================
    # ENDPOINTS ADMIN - ESPECIALES
    # ================================

    @app.get("/admin/specials", response_model=List[SpecialResponse], summary="[ADMIN] Obtener todos los especiales")
    async def get_admin_specials(current_user: str = Depends(verify_token), db: Session = Depends(get_db)):
        specials = db.query(Special).join(Product).order_by(Special.date.desc()).all()
        
        return [
            SpecialResponse(
                id=s.id,
                product=ProductResponse(
                    id=s.product.id, name=s.product.name,
                    description=s.product.description or "",
                    price=s.product.price, category=s.product.category,
                    image=s.product.image or "", available=s.product.available
                ),
                discount=s.discount,
                date=s.date
            ) for s in specials
        ]

    @app.post("/admin/specials", summary="[ADMIN] Crear especial")
    async def create_special(
        special_data: SpecialCreate,
        current_user: str = Depends(verify_token),
        db: Session = Depends(get_db)
    ):
        # Verificar que el producto existe
        product = db.query(Product).filter(Product.id == special_data.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        
        special = Special(
            product_id=special_data.product_id,
            date=special_data.date,
            discount=special_data.discount
        )
        
        db.add(special)
        db.commit()
        db.refresh(special)
        
        return {"id": special.id, "message": "Especial creado exitosamente"}

    @app.delete("/admin/specials/{special_id}", summary="[ADMIN] Eliminar especial")
    async def delete_special(
        special_id: int,
        current_user: str = Depends(verify_token),
        db: Session = Depends(get_db)
    ):
        special = db.query(Special).filter(Special.id == special_id).first()
        if not special:
            raise HTTPException(status_code=404, detail="Especial no encontrado")
        
        db.delete(special)
        db.commit()
        
        return {"message": "Especial eliminado exitosamente"}
