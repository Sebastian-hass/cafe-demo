from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional
import sqlite3
import json
from datetime import datetime, date, timedelta
import hashlib
import jwt
import os
import shutil
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
# Importar módulo del chatbot
import chatbot

# Modelos Pydantic
class Product(BaseModel):
    id: Optional[int] = None
    name: str
    description: str
    price: float
    category: str
    image: str
    available: bool = True

class Special(BaseModel):
    id: Optional[int] = None
    product_id: int
    date: str
    discount: float

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

class ContactMessage(BaseModel):
    name: str
    email: str
    subject: str
    message: str

class NewsletterSubscription(BaseModel):
    email: str
    name: Optional[str] = None

class JobApplication(BaseModel):
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

# Inicializar base de datos
def init_db():
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    
    # Tabla productos
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            category TEXT NOT NULL,
            image TEXT,
            available BOOLEAN DEFAULT 1
        )
    ''')
    
    # Tabla especiales
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS specials (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER,
            date TEXT,
            discount REAL,
            FOREIGN KEY (product_id) REFERENCES products (id)
        )
    ''')
    
    # Datos de muestra para la demo
    sample_products = [
        ("Cappuccino Clásico", "Espresso con leche vaporizada y espuma de leche cremosa", 3.50, "bebidas", "cappuccino.jpg", 1),
        ("Latte Vainilla", "Espresso con leche y un toque de vainilla natural", 4.20, "bebidas", "latte.jpg", 1),
        ("Americano", "Espresso doble con agua caliente", 2.80, "bebidas", "americano.jpg", 1),
        ("Croissant Mantequilla", "Croissant francés recién horneado con mantequilla", 2.50, "panaderia", "croissant.jpg", 1),
        ("Tostada Aguacate", "Pan integral con aguacate, tomate y semillas", 5.80, "panaderia", "tostada.jpg", 1),
        ("Tarta de Queso", "Deliciosa tarta de queso casera con frutos rojos", 4.20, "postres", "cheesecake.jpg", 1),
        ("Brownie Chocolate", "Brownie húmedo con chocolate belga y nueces", 3.80, "postres", "brownie.jpg", 1),
        ("Smoothie Verde", "Espinaca, plátano, mango y leche de coco", 5.20, "bebidas", "smoothie.jpg", 1),
    ]
    
    # Insertar productos solo si la tabla está vacía
    cursor.execute("SELECT COUNT(*) FROM products")
    if cursor.fetchone()[0] == 0:
        cursor.executemany('''
            INSERT INTO products (name, description, price, category, image, available)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', sample_products)
    
    # Especiales del día (productos con descuento)
    today = date.today().isoformat()
    cursor.execute("SELECT COUNT(*) FROM specials WHERE date = ?", (today,))
    if cursor.fetchone()[0] == 0:
        # Cappuccino con 20% descuento y Tarta de queso con 15% descuento
        sample_specials = [
            (1, today, 20.0),  # Cappuccino
            (6, today, 15.0),  # Tarta de queso
        ]
        cursor.executemany('''
            INSERT INTO specials (product_id, date, discount)
            VALUES (?, ?, ?)
        ''', sample_specials)
    
    conn.commit()
    conn.close()

# Hash de contraseña (mover antes de usarse)
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

# Hash de contraseña ya definido arriba

# Inicializar carpeta de uploads
def init_uploads():
    os.makedirs("uploads/products", exist_ok=True)
    print("📁 Carpeta de uploads inicializada")

# Crear app FastAPI
app = FastAPI(title="Café Demo API", version="1.0.0")

# Inicializar base de datos y uploads al inicio
init_db()
init_uploads()
print("✅ Base de datos inicializada")
print("🚀 API corriendo en http://localhost:8000")
print("📚 Documentación en http://localhost:8000/docs")
print("🔑 Admin login: admin / admin123")

# Configurar CORS
# Obtener origenes permitidos desde variables de entorno
allowed_origins = [
    "http://localhost:5173", 
    "http://localhost:5174", 
    "http://localhost:3000",
    "https://*.vercel.app",  # Permitir todos los subdominios de Vercel
]

# Agregar URL del frontend si está configurada
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

# Servir archivos estáticos (imágenes)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ENDPOINTS

@app.get("/", summary="API Status")
async def root():
    return {
        "message": "☕ Café Demo API", 
        "status": "running",
        "docs": "/docs"
    }

@app.get("/products", response_model=List[ProductResponse], summary="Obtener todos los productos")
async def get_products(category: Optional[str] = None):
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    
    if category:
        cursor.execute("SELECT * FROM products WHERE available = 1 AND category = ? ORDER BY name", (category,))
    else:
        cursor.execute("SELECT * FROM products WHERE available = 1 ORDER BY category, name")
    
    products = cursor.fetchall()
    conn.close()
    
    return [
        ProductResponse(
            id=p[0], name=p[1], description=p[2], 
            price=p[3], category=p[4], image=p[5], available=bool(p[6])
        ) for p in products
    ]

@app.get("/products/{product_id}", response_model=ProductResponse, summary="Obtener producto por ID")
async def get_product(product_id: int):
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products WHERE id = ? AND available = 1", (product_id,))
    product = cursor.fetchone()
    conn.close()
    
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    return ProductResponse(
        id=product[0], name=product[1], description=product[2],
        price=product[3], category=product[4], image=product[5], available=bool(product[6])
    )

@app.get("/specials", response_model=List[SpecialResponse], summary="Obtener especiales del día")
async def get_specials():
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    cursor.execute('''
        SELECT s.id, s.product_id, s.date, s.discount,
               p.id, p.name, p.description, p.price, p.category, p.image, p.available
        FROM specials s 
        JOIN products p ON s.product_id = p.id 
        WHERE s.date = date('now') AND p.available = 1
        ORDER BY s.discount DESC
    ''')
    specials = cursor.fetchall()
    conn.close()
    
    return [
        SpecialResponse(
            id=s[0],
            product=ProductResponse(
                id=s[4], name=s[5], description=s[6],
                price=s[7], category=s[8], image=s[9], available=bool(s[10])
            ),
            discount=s[3],
            date=s[2]
        ) for s in specials
    ]

@app.get("/categories", summary="Obtener categorías disponibles")
async def get_categories():
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    
    # Obtener todas las categorías creadas desde la tabla product_categories
    cursor.execute("""
        SELECT id, name, description, icon 
        FROM product_categories 
        ORDER BY name
    """)
    categories = cursor.fetchall()
    conn.close()
    
    return [
        {
            "id": cat[0],
            "name": cat[1],
            "description": cat[2] or "",
            "icon": cat[3]
        }
        for cat in categories
    ]

@app.get("/health", summary="Health Check")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# ================================
# ENDPOINT DE SUBIDA DE IMÁGENES
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
# ENDPOINTS DE ADMINISTRACIÓN
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

@app.get("/admin/dashboard", response_model=DashboardStats, summary="Dashboard estadísticas")
async def get_dashboard_stats(current_user: str = Depends(verify_token)):
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    
    # Total productos
    cursor.execute("SELECT COUNT(*) FROM products WHERE available = 1")
    total_products = cursor.fetchone()[0]
    
    # Especiales activos
    cursor.execute("SELECT COUNT(*) FROM specials WHERE date = date('now')")
    active_specials = cursor.fetchone()[0]
    
    # Total categorías
    cursor.execute("SELECT COUNT(DISTINCT category) FROM products WHERE available = 1")
    total_categories = cursor.fetchone()[0]
    
    conn.close()
    
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

# CRUD Productos para Admin
@app.get("/admin/products", response_model=List[ProductResponse], summary="[ADMIN] Obtener todos los productos")
async def get_admin_products(current_user: str = Depends(verify_token)):
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products ORDER BY id DESC")
    products = cursor.fetchall()
    conn.close()
    
    return [
        ProductResponse(
            id=p[0], name=p[1], description=p[2], 
            price=p[3], category=p[4], image=p[5], available=bool(p[6])
        ) for p in products
    ]

@app.post("/admin/products", response_model=ProductResponse, summary="[ADMIN] Crear producto")
async def create_product(product: ProductCreate, current_user: str = Depends(verify_token)):
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO products (name, description, price, category, image, available)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (product.name, product.description, product.price, product.category, product.image, product.available))
    
    product_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return ProductResponse(
        id=product_id,
        name=product.name,
        description=product.description,
        price=product.price,
        category=product.category,
        image=product.image,
        available=product.available
    )

@app.put("/admin/products/{product_id}", response_model=ProductResponse, summary="[ADMIN] Actualizar producto")
async def update_product(product_id: int, product_update: ProductUpdate, current_user: str = Depends(verify_token)):
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    
    # Verificar si el producto existe
    cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
    existing_product = cursor.fetchone()
    if not existing_product:
        conn.close()
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    # Actualizar solo los campos que se proporcionan
    update_fields = []
    update_values = []
    
    if product_update.name is not None:
        update_fields.append("name = ?")
        update_values.append(product_update.name)
    if product_update.description is not None:
        update_fields.append("description = ?")
        update_values.append(product_update.description)
    if product_update.price is not None:
        update_fields.append("price = ?")
        update_values.append(product_update.price)
    if product_update.category is not None:
        update_fields.append("category = ?")
        update_values.append(product_update.category)
    if product_update.image is not None:
        update_fields.append("image = ?")
        update_values.append(product_update.image)
    if product_update.available is not None:
        update_fields.append("available = ?")
        update_values.append(product_update.available)
    
    if update_fields:
        update_values.append(product_id)
        cursor.execute(
            f"UPDATE products SET {', '.join(update_fields)} WHERE id = ?",
            update_values
        )
        conn.commit()
    
    # Obtener el producto actualizado
    cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
    updated_product = cursor.fetchone()
    conn.close()
    
    return ProductResponse(
        id=updated_product[0],
        name=updated_product[1],
        description=updated_product[2],
        price=updated_product[3],
        category=updated_product[4],
        image=updated_product[5],
        available=bool(updated_product[6])
    )

@app.delete("/admin/products/{product_id}", summary="[ADMIN] Eliminar producto")
async def delete_product(product_id: int, current_user: str = Depends(verify_token)):
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    # Eliminar especiales relacionados
    cursor.execute("DELETE FROM specials WHERE product_id = ?", (product_id,))
    
    # Eliminar producto
    cursor.execute("DELETE FROM products WHERE id = ?", (product_id,))
    
    conn.commit()
    conn.close()
    
    return {"message": "Producto eliminado exitosamente"}

# CRUD Especiales para Admin
@app.get("/admin/specials", response_model=List[SpecialResponse], summary="[ADMIN] Obtener todos los especiales")
async def get_admin_specials(current_user: str = Depends(verify_token)):
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    cursor.execute('''
        SELECT s.id, s.product_id, s.date, s.discount,
               p.id, p.name, p.description, p.price, p.category, p.image, p.available
        FROM specials s 
        JOIN products p ON s.product_id = p.id 
        ORDER BY s.date DESC
    ''')
    specials = cursor.fetchall()
    conn.close()
    
    return [
        SpecialResponse(
            id=s[0],
            product=ProductResponse(
                id=s[4], name=s[5], description=s[6],
                price=s[7], category=s[8], image=s[9], available=bool(s[10])
            ),
            discount=s[3],
            date=s[2]
        ) for s in specials
    ]

@app.post("/admin/specials", summary="[ADMIN] Crear especial")
async def create_special(special: SpecialCreate, current_user: str = Depends(verify_token)):
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    
    # Verificar que el producto existe
    cursor.execute("SELECT * FROM products WHERE id = ?", (special.product_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    cursor.execute('''
        INSERT INTO specials (product_id, date, discount)
        VALUES (?, ?, ?)
    ''', (special.product_id, special.date, special.discount))
    
    special_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return {"id": special_id, "message": "Especial creado exitosamente"}

@app.delete("/admin/specials/{special_id}", summary="[ADMIN] Eliminar especial")
async def delete_special(special_id: int, current_user: str = Depends(verify_token)):
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM specials WHERE id = ?", (special_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Especial no encontrado")
    
    cursor.execute("DELETE FROM specials WHERE id = ?", (special_id,))
    conn.commit()
    conn.close()
    
    return {"message": "Especial eliminado exitosamente"}

# ================================
# CRUD Categorías para Admin
# ================================

@app.get("/admin/categories", response_model=List[CategoryResponse], summary="[ADMIN] Obtener todas las categorías")
async def get_admin_categories(current_user: str = Depends(verify_token)):
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, description, icon, created_at FROM product_categories ORDER BY name")
    categories = cursor.fetchall()
    conn.close()
    
    return [
        CategoryResponse(
            id=cat[0],
            name=cat[1],
            description=cat[2],
            icon=cat[3],
            created_at=cat[4]
        ) for cat in categories
    ]

@app.post("/admin/categories", response_model=CategoryResponse, summary="[ADMIN] Crear categoría")
async def create_category(category: CategoryCreate, current_user: str = Depends(verify_token)):
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    
    # Verificar si ya existe una categoría con ese ID
    cursor.execute("SELECT id FROM product_categories WHERE id = ?", (category.id,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Ya existe una categoría con ese ID")
    
    cursor.execute('''
        INSERT INTO product_categories (id, name, description, icon)
        VALUES (?, ?, ?, ?)
    ''', (category.id, category.name, category.description, category.icon))
    
    cursor.execute("SELECT id, name, description, icon, created_at FROM product_categories WHERE id = ?", (category.id,))
    created_category = cursor.fetchone()
    
    conn.commit()
    conn.close()
    
    return CategoryResponse(
        id=created_category[0],
        name=created_category[1],
        description=created_category[2],
        icon=created_category[3],
        created_at=created_category[4]
    )

@app.put("/admin/categories/{category_id}", response_model=CategoryResponse, summary="[ADMIN] Actualizar categoría")
async def update_category(category_id: str, category_update: CategoryUpdate, current_user: str = Depends(verify_token)):
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    
    # Verificar si la categoría existe
    cursor.execute("SELECT id FROM product_categories WHERE id = ?", (category_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    
    # Actualizar solo los campos que se proporcionan
    update_fields = []
    update_values = []
    
    if category_update.name is not None:
        update_fields.append("name = ?")
        update_values.append(category_update.name)
    if category_update.description is not None:
        update_fields.append("description = ?")
        update_values.append(category_update.description)
    if category_update.icon is not None:
        update_fields.append("icon = ?")
        update_values.append(category_update.icon)
    
    if update_fields:
        update_values.append(category_id)
        cursor.execute(
            f"UPDATE product_categories SET {', '.join(update_fields)} WHERE id = ?",
            update_values
        )
        conn.commit()
    
    # Obtener la categoría actualizada
    cursor.execute("SELECT id, name, description, icon, created_at FROM product_categories WHERE id = ?", (category_id,))
    updated_category = cursor.fetchone()
    conn.close()
    
    return CategoryResponse(
        id=updated_category[0],
        name=updated_category[1],
        description=updated_category[2],
        icon=updated_category[3],
        created_at=updated_category[4]
    )

@app.delete("/admin/categories/{category_id}", summary="[ADMIN] Eliminar categoría")
async def delete_category(category_id: str, current_user: str = Depends(verify_token)):
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    
    # Verificar si la categoría existe
    cursor.execute("SELECT id FROM product_categories WHERE id = ?", (category_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    
    # Verificar si hay productos que usan esta categoría
    cursor.execute("SELECT COUNT(*) FROM products WHERE category = ?", (category_id,))
    products_count = cursor.fetchone()[0]
    
    if products_count > 0:
        conn.close()
        raise HTTPException(
            status_code=400, 
            detail=f"No se puede eliminar la categoría. Hay {products_count} producto(s) que la usan."
        )
    
    cursor.execute("DELETE FROM product_categories WHERE id = ?", (category_id,))
    conn.commit()
    conn.close()
    
    return {"message": "Categoría eliminada exitosamente"}

# ================================
# ENDPOINTS DE CONTACTO Y NEWSLETTER
# ================================

# Configuración de email (usando tu email)
EMAIL_CONFIG = {
    "smtp_server": "smtp.gmail.com",
    "smtp_port": 587,
    "recipient_email": "jesussebastianalonsoarias@gmail.com",
    "sender_name": "Café Demo"
}

# Función para enviar email
def send_email(subject: str, body: str, recipient_email: str = None):
    try:
        # Obtener configuración SMTP desde variables de entorno
        smtp_user = os.getenv("SMTP_USER")
        smtp_password = os.getenv("SMTP_PASSWORD")
        smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        
        # Si no hay credenciales configuradas, enviar email simulado
        if not smtp_user or not smtp_password:
            print(f"📧 EMAIL SIMULADO (configurar SMTP_USER y SMTP_PASSWORD):")
            print(f"Para: {recipient_email or EMAIL_CONFIG['recipient_email']}")
            print(f"Asunto: {subject}")
            print(f"Cuerpo: {body[:200]}..." if len(body) > 200 else f"Cuerpo: {body}")
            print("─" * 50)
            return True
        
        # Configurar email real
        msg = MIMEMultipart()
        msg['From'] = smtp_user
        msg['To'] = recipient_email or EMAIL_CONFIG['recipient_email']
        msg['Subject'] = subject
        
        # Adjuntar el cuerpo del mensaje
        msg.attach(MIMEText(body, 'plain', 'utf-8'))
        
        # Conectar al servidor SMTP y enviar
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()  # Habilitar seguridad
        server.login(smtp_user, smtp_password)
        
        text = msg.as_string()
        server.sendmail(smtp_user, recipient_email or EMAIL_CONFIG['recipient_email'], text)
        server.quit()
        
        print(f"✅ Email enviado exitosamente a {recipient_email or EMAIL_CONFIG['recipient_email']}")
        return True
        
    except Exception as e:
        print(f"❌ Error enviando email: {e}")
        # En caso de error, al menos mostrar que se intentó enviar
        print(f"📧 EMAIL FALLBACK (error en SMTP):")
        print(f"Para: {recipient_email or EMAIL_CONFIG['recipient_email']}")
        print(f"Asunto: {subject}")
        print(f"Error: {str(e)}")
        print("─" * 50)
        return False

# Inicializar tablas de contacto y newsletter
def init_contact_db():
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    
    # Tabla de mensajes de contacto
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS contact_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            subject TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Tabla de suscriptores al newsletter
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS newsletter_subscribers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            name TEXT,
            subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            active BOOLEAN DEFAULT 1
        )
    ''')
    
    # Tabla de aplicaciones de trabajo
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS job_applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            position TEXT NOT NULL,
            experience TEXT NOT NULL,
            motivation TEXT NOT NULL,
            cv_filename TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Tabla de categorías de productos
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS product_categories (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            icon TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Añadir columna de icono si no existe (para bases de datos existentes)
    try:
        cursor.execute("ALTER TABLE product_categories ADD COLUMN icon TEXT")
        conn.commit()
    except sqlite3.OperationalError:
        # La columna ya existe
        pass
    
    # Tabla de pedidos
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT NOT NULL,
            customer_email TEXT NOT NULL,
            customer_phone TEXT,
            items TEXT NOT NULL,
            total_amount REAL NOT NULL,
            notes TEXT,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Tabla de reservas
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS reservations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT NOT NULL,
            customer_email TEXT NOT NULL,
            customer_phone TEXT NOT NULL,
            party_size INTEGER NOT NULL,
            reservation_date TEXT NOT NULL,
            reservation_time TEXT NOT NULL,
            notes TEXT,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Tabla de noticias
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS news_articles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            excerpt TEXT NOT NULL,
            content TEXT NOT NULL,
            author TEXT NOT NULL,
            category TEXT NOT NULL,
            featured BOOLEAN DEFAULT 0,
            image TEXT,
            tags TEXT,
            published BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Tabla de carrusel de imágenes
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS carousel_images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            subtitle TEXT,
            description TEXT,
            image TEXT NOT NULL,
            link TEXT,
            active BOOLEAN DEFAULT 1,
            order_position INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Tabla de textos editables de la página
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS page_content (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            section TEXT NOT NULL,
            page TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Tabla de notificaciones para el admin
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS admin_notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            related_id INTEGER,
            is_read BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Insertar categorías por defecto si no existen
    cursor.execute("SELECT COUNT(*) FROM product_categories")
    if cursor.fetchone()[0] == 0:
        default_categories = [
            ('bebidas', 'Bebidas', 'Cafés, tés y bebidas especiales'),
            ('panaderia', 'Panadería', 'Pan fresco, tostadas y desayunos'),
            ('postres', 'Postres', 'Dulces caseros y tartas artesanales')
        ]
        cursor.executemany('''
            INSERT INTO product_categories (id, name, description)
            VALUES (?, ?, ?)
        ''', default_categories)
    
    conn.commit()
    conn.close()

# Funciones para gestionar notificaciones
def create_notification(type_: str, title: str, message: str, related_id: int = None):
    """Crear una nueva notificación para el admin"""
    try:
        conn = sqlite3.connect('cafe.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO admin_notifications (type, title, message, related_id)
            VALUES (?, ?, ?, ?)
        ''', (type_, title, message, related_id))
        
        conn.commit()
        conn.close()
        print(f"ñ Nueva notificación: {title}")
        return True
    except Exception as e:
        print(f"Error creando notificación: {e}")
        return False

def get_unread_notifications_count():
    """Obtener el número de notificaciones no leídas por tipo"""
    try:
        conn = sqlite3.connect('cafe.db')
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT type, COUNT(*) 
            FROM admin_notifications 
            WHERE is_read = 0 
            GROUP BY type
        """)
        
        results = cursor.fetchall()
        conn.close()
        
        return {row[0]: row[1] for row in results}
    except Exception as e:
        print(f"Error obteniendo notificaciones: {e}")
        return {}

# Inicializar al arrancar
init_contact_db()

@app.post("/contact", summary="Enviar mensaje de contacto")
async def send_contact_message(contact_data: ContactMessage):
    try:
        # Guardar mensaje en base de datos
        conn = sqlite3.connect('cafe.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO contact_messages (name, email, subject, message)
            VALUES (?, ?, ?, ?)
        ''', (contact_data.name, contact_data.email, contact_data.subject, contact_data.message))
        
        message_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        # Crear notificación para el admin
        create_notification(
            "contact",
            "Nuevo mensaje de contacto",
            f"De {contact_data.name}: {contact_data.subject}",
            message_id
        )
        
        # Preparar email
        email_subject = f"Nuevo mensaje de contacto: {contact_data.subject}"
        email_body = f"""
        Nuevo mensaje de contacto recibido:
        
        Nombre: {contact_data.name}
        Email: {contact_data.email}
        Asunto: {contact_data.subject}
        
        Mensaje:
        {contact_data.message}
        
        ---
        Este mensaje fue enviado desde el formulario de contacto de Café Demo.
        Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
        ID del mensaje: {message_id}
        """
        
        # Enviar email
        email_sent = send_email(email_subject, email_body)
        
        return {
            "success": True,
            "message": "Mensaje enviado correctamente",
            "email_sent": email_sent,
            "id": message_id
        }
        
    except Exception as e:
        print(f"Error procesando mensaje de contacto: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.post("/newsletter/subscribe", summary="Suscribirse al newsletter")
async def subscribe_newsletter(subscription_data: NewsletterSubscription):
    try:
        conn = sqlite3.connect('cafe.db')
        cursor = conn.cursor()
        
        # Verificar si ya está suscrito
        cursor.execute("SELECT id, active FROM newsletter_subscribers WHERE email = ?", 
                      (subscription_data.email,))
        existing = cursor.fetchone()
        
        if existing:
            if existing[1]:  # Ya está activo
                conn.close()
                return {
                    "success": True,
                    "message": "Ya estás suscrito al newsletter",
                    "already_subscribed": True
                }
            else:  # Reactivar suscripción
                cursor.execute("UPDATE newsletter_subscribers SET active = 1, name = ? WHERE email = ?",
                             (subscription_data.name, subscription_data.email))
                conn.commit()
                conn.close()
                message = "Suscripción reactivada correctamente"
        else:
            # Nueva suscripción
            cursor.execute('''
                INSERT INTO newsletter_subscribers (email, name)
                VALUES (?, ?)
            ''', (subscription_data.email, subscription_data.name))
            subscriber_id = cursor.lastrowid
            conn.commit()
            conn.close()
            
            # Crear notificación para el admin
            create_notification(
                "newsletter",
                "Nueva suscripción al newsletter",
                f"{subscription_data.name or subscription_data.email} se suscribió",
                subscriber_id
            )
            
            message = "Suscripción exitosa al newsletter"
        
        # Enviar email de confirmación
        email_subject = "¡Bienvenido al Newsletter de Café Demo! ☕"
        email_body = f"""
        ¡Hola {subscription_data.name or 'amigo cafetera'}!
        
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
        Email: {subscription_data.email}
        Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
        """
        
        # Enviar confirmación a suscriptor
        confirmation_sent = send_email(email_subject, email_body, subscription_data.email)
        
        # Notificar al admin
        admin_subject = "Nueva suscripción al newsletter - Café Demo"
        admin_body = f"""
        Nueva suscripción al newsletter:
        
        Email: {subscription_data.email}
        Nombre: {subscription_data.name or 'No proporcionado'}
        Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
        """
        
        admin_notification_sent = send_email(admin_subject, admin_body)
        
        return {
            "success": True,
            "message": message,
            "confirmation_sent": confirmation_sent,
            "admin_notified": admin_notification_sent
        }
        
    except Exception as e:
        print(f"Error en suscripción al newsletter: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

# Endpoints administrativos para gestión de contactos y newsletter
@app.get("/admin/contacts", summary="[ADMIN] Obtener mensajes de contacto")
async def get_contact_messages(current_user: str = Depends(verify_token)):
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, name, email, subject, message, created_at
        FROM contact_messages 
        ORDER BY created_at DESC
        LIMIT 50
    ''')
    
    messages = cursor.fetchall()
    conn.close()
    
    return [
        {
            "id": msg[0],
            "name": msg[1],
            "email": msg[2],
            "subject": msg[3],
            "message": msg[4],
            "created_at": msg[5]
        } for msg in messages
    ]

@app.get("/admin/newsletter/subscribers", summary="[ADMIN] Obtener suscriptores del newsletter")
async def get_newsletter_subscribers(current_user: str = Depends(verify_token)):
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, email, name, subscribed_at, active
        FROM newsletter_subscribers 
        WHERE active = 1
        ORDER BY subscribed_at DESC
    ''')
    
    subscribers = cursor.fetchall()
    conn.close()
    
    return [
        {
            "id": sub[0],
            "email": sub[1],
            "name": sub[2],
            "subscribed_at": sub[3],
            "active": bool(sub[4])
        } for sub in subscribers
    ]

@app.post("/admin/newsletter/send", summary="[ADMIN] Enviar newsletter")
async def send_newsletter(newsletter_data: dict, current_user: str = Depends(verify_token)):
    try:
        # Obtener todos los suscriptores activos
        conn = sqlite3.connect('cafe.db')
        cursor = conn.cursor()
        cursor.execute("SELECT email, name FROM newsletter_subscribers WHERE active = 1")
        subscribers = cursor.fetchall()
        conn.close()
        
        if not subscribers:
            return {"success": False, "message": "No hay suscriptores activos"}
        
        subject = newsletter_data.get("subject", "Newsletter - Café Demo")
        content = newsletter_data.get("content", "Contenido del newsletter")
        
        sent_count = 0
        failed_count = 0
        
        for email, name in subscribers:
            personalized_content = f"Hola {name or 'amigo cafetero'},\n\n{content}\n\n¡Gracias por ser parte de Café Demo!"
            
            if send_email(subject, personalized_content, email):
                sent_count += 1
            else:
                failed_count += 1
        
        return {
            "success": True,
            "message": f"Newsletter enviado a {sent_count} suscriptores",
            "sent_count": sent_count,
            "failed_count": failed_count,
            "total_subscribers": len(subscribers)
        }
        
    except Exception as e:
        print(f"Error enviando newsletter: {e}")
        raise HTTPException(status_code=500, detail="Error enviando newsletter")

# ================================
# ENDPOINTS DE APLICACIONES DE TRABAJO
# ================================

@app.post("/jobs/apply", summary="Aplicar para trabajo")
async def submit_job_application(job_data: JobApplication):
    try:
        # Guardar aplicación en base de datos
        conn = sqlite3.connect('cafe.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO job_applications (name, email, phone, position, experience, motivation, cv_filename)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (job_data.name, job_data.email, job_data.phone, job_data.position, 
              job_data.experience, job_data.motivation, job_data.cv_filename))
        
        application_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        # Preparar email para el admin
        email_subject = f"Nueva aplicación de trabajo: {job_data.position}"
        email_body = f"""
        Nueva aplicación de trabajo recibida:
        
        Nombre: {job_data.name}
        Email: {job_data.email}
        Teléfono: {job_data.phone}
        Posición: {job_data.position}
        
        Experiencia:
        {job_data.experience}
        
        Motivación:
        {job_data.motivation}
        
        CV: {job_data.cv_filename or 'No adjuntado'}
        
        ---
        Esta aplicación fue enviada desde el formulario "Únete al Equipo" de Café Demo.
        Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
        ID de la aplicación: {application_id}
        """
        
        # Enviar email al admin
        admin_email_sent = send_email(email_subject, email_body)
        
        # Enviar confirmación al aplicante
        confirmation_subject = "¡Hemos recibido tu aplicación! - Café Demo"
        confirmation_body = f"""
        Hola {job_data.name},
        
        ¡Gracias por tu interés en formar parte del equipo de Café Demo! ☕
        
        Hemos recibido tu aplicación para la posición de {job_data.position}.
        
        Nuestro equipo de recursos humanos revisará tu aplicación y se pondrá en contacto contigo 
        en los próximos días si tu perfil coincide con lo que estamos buscando.
        
        Mientras tanto, te invitamos a:
        ✅ Visitar nuestra cafetería para conocer nuestro ambiente
        ✅ Seguirnos en redes sociales
        ✅ Probar nuestros productos
        
        ¡Esperamos conocerte pronto!
        
        Con cariño,
        El equipo de Café Demo
        
        ---
        Fecha de aplicación: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
        Número de referencia: #{application_id}
        """
        
        confirmation_sent = send_email(confirmation_subject, confirmation_body, job_data.email)
        
        return {
            "success": True,
            "message": "Aplicación enviada correctamente",
            "admin_notified": admin_email_sent,
            "confirmation_sent": confirmation_sent,
            "id": application_id
        }
        
    except Exception as e:
        print(f"Error procesando aplicación de trabajo: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

# Admin endpoints para aplicaciones de trabajo
@app.get("/admin/job-applications", summary="[ADMIN] Obtener aplicaciones de trabajo")
async def get_job_applications(current_user: str = Depends(verify_token)):
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, name, email, phone, position, experience, motivation, cv_filename, created_at
        FROM job_applications 
        ORDER BY created_at DESC
        LIMIT 50
    ''')
    
    applications = cursor.fetchall()
    conn.close()
    
    return [
        {
            "id": app[0],
            "name": app[1],
            "email": app[2],
            "phone": app[3],
            "position": app[4],
            "experience": app[5],
            "motivation": app[6],
            "cv_filename": app[7],
            "created_at": app[8]
        } for app in applications
    ]

# Endpoints para eliminar mensajes (admin)
@app.delete("/admin/contacts/{contact_id}", summary="[ADMIN] Eliminar mensaje de contacto")
async def delete_contact_message(contact_id: int, current_user: str = Depends(verify_token)):
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM contact_messages WHERE id = ?", (contact_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Mensaje no encontrado")
    
    cursor.execute("DELETE FROM contact_messages WHERE id = ?", (contact_id,))
    conn.commit()
    conn.close()
    
    return {"message": "Mensaje eliminado exitosamente"}

@app.delete("/admin/newsletter/subscribers/{subscriber_id}", summary="[ADMIN] Eliminar suscriptor")
async def delete_newsletter_subscriber(subscriber_id: int, current_user: str = Depends(verify_token)):
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM newsletter_subscribers WHERE id = ?", (subscriber_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Suscriptor no encontrado")
    
    cursor.execute("UPDATE newsletter_subscribers SET active = 0 WHERE id = ?", (subscriber_id,))
    conn.commit()
    conn.close()
    
    return {"message": "Suscriptor desactivado exitosamente"}

@app.delete("/admin/job-applications/{application_id}", summary="[ADMIN] Eliminar aplicación de trabajo")
async def delete_job_application(application_id: int, current_user: str = Depends(verify_token)):
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM job_applications WHERE id = ?", (application_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Aplicación no encontrada")
    
    cursor.execute("DELETE FROM job_applications WHERE id = ?", (application_id,))
    conn.commit()
    conn.close()
    
    return {"message": "Aplicación eliminada exitosamente"}

# ================================
# ENDPOINTS DE RESERVAS
# ================================

@app.post("/reservations", response_model=ReservationResponse, summary="Crear nueva reserva")
async def create_reservation(reservation_data: ReservationCreate):
    try:
        # Validar fecha (no puede ser en el pasado)
        from datetime import datetime as dt
        try:
            reservation_datetime = dt.strptime(f"{reservation_data.reservation_date} {reservation_data.reservation_time}", "%Y-%m-%d %H:%M")
            if reservation_datetime < dt.now():
                raise HTTPException(status_code=400, detail="No se puede reservar en el pasado")
        except ValueError:
            raise HTTPException(status_code=400, detail="Formato de fecha/hora inválido")
        
        # Validar tamaño del grupo
        if reservation_data.party_size < 1 or reservation_data.party_size > 20:
            raise HTTPException(status_code=400, detail="El tamaño del grupo debe estar entre 1 y 20 personas")
        
        # Verificar disponibilidad (simulación simple - en producción sería más complejo)
        conn = sqlite3.connect('cafe.db')
        cursor = conn.cursor()
        
        # Contar reservas existentes para la misma fecha y hora (dentro de 2 horas)
        cursor.execute("""
            SELECT COUNT(*) FROM reservations 
            WHERE reservation_date = ? 
            AND ABS(CAST(strftime('%s', reservation_time || ':00') AS INTEGER) - 
                   CAST(strftime('%s', ? || ':00') AS INTEGER)) < 7200
            AND status IN ('pending', 'confirmed')
        """, (reservation_data.reservation_date, reservation_data.reservation_time))
        
        conflicting_reservations = cursor.fetchone()[0]
        
        # Límite simple: máximo 5 reservas por franja de 2 horas
        if conflicting_reservations >= 5:
            conn.close()
            raise HTTPException(status_code=409, detail="No hay disponibilidad para esa fecha y hora. Por favor elige otro horario.")
        
        # Crear la reserva
        cursor.execute("""
            INSERT INTO reservations (customer_name, customer_email, customer_phone, party_size, 
                                    reservation_date, reservation_time, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (reservation_data.customer_name, reservation_data.customer_email, reservation_data.customer_phone,
              reservation_data.party_size, reservation_data.reservation_date, reservation_data.reservation_time,
              reservation_data.notes))
        
        reservation_id = cursor.lastrowid
        
        # Crear notificación para el admin
        create_notification(
            "reservation",
            "Nueva reserva recibida",
            f"{reservation_data.customer_name} para {reservation_data.party_size} personas el {reservation_data.reservation_date}",
            reservation_id
        )
        
        # Obtener la reserva creada
        cursor.execute("SELECT * FROM reservations WHERE id = ?", (reservation_id,))
        created_reservation = cursor.fetchone()
        
        conn.commit()
        conn.close()
        
        # Preparar email de confirmación para el cliente
        confirmation_subject = f"¡Reserva confirmada #{reservation_id}! - Café Demo"
        confirmation_body = f"""
        Hola {reservation_data.customer_name},
        
        ¡Tu reserva en Café Demo ha sido confirmada! ☕
        
        DETALLES DE TU RESERVA:
        ═══════════════════════════════════════
        Número de reserva: #{reservation_id}
        Fecha: {reservation_data.reservation_date}
        Hora: {reservation_data.reservation_time}
        Número de personas: {reservation_data.party_size}
        
        {f"NOTAS: {reservation_data.notes}" if reservation_data.notes else ""}
        ═══════════════════════════════════════
        
        Te esperamos en la fecha y hora indicada.
        Si necesitas hacer cambios o cancelar, por favor contáctanos con al menos 2 horas de anticipación.
        
        Teléfono de contacto: +34 123 456 789
        
        ¡Nos vemos pronto!
        
        Con cariño,
        El equipo de Café Demo
        
        ---
        Para cualquier consulta sobre tu reserva, responde a este email 
        mencionando el número #{reservation_id}.
        """
        
        # Enviar confirmación al cliente
        confirmation_sent = send_email(confirmation_subject, confirmation_body, reservation_data.customer_email)
        
        # Notificar al admin
        admin_subject = f"Nueva Reserva #{reservation_id} - {reservation_data.customer_name}"
        admin_body = f"""
        NUEVA RESERVA RECIBIDA:
        ═══════════════════════════════════════
        Número: #{reservation_id}
        Cliente: {reservation_data.customer_name}
        Email: {reservation_data.customer_email}
        Teléfono: {reservation_data.customer_phone}
        
        Fecha: {reservation_data.reservation_date}
        Hora: {reservation_data.reservation_time}
        Personas: {reservation_data.party_size}
        
        {f"NOTAS DEL CLIENTE: {reservation_data.notes}" if reservation_data.notes else "Sin notas especiales"}
        ═══════════════════════════════════════
        
        Accede al panel de administración para gestionar esta reserva.
        """
        
        admin_notification_sent = send_email(admin_subject, admin_body)
        
        return ReservationResponse(
            id=created_reservation[0],
            customer_name=created_reservation[1],
            customer_email=created_reservation[2],
            customer_phone=created_reservation[3],
            party_size=created_reservation[4],
            reservation_date=created_reservation[5],
            reservation_time=created_reservation[6],
            notes=created_reservation[7],
            status=created_reservation[8],
            created_at=created_reservation[9]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creando reserva: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.get("/admin/reservations", response_model=List[ReservationResponse], summary="[ADMIN] Obtener todas las reservas")
async def get_admin_reservations(current_user: str = Depends(verify_token)):
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, customer_name, customer_email, customer_phone, party_size, 
               reservation_date, reservation_time, notes, status, created_at
        FROM reservations 
        ORDER BY reservation_date DESC, reservation_time DESC
        LIMIT 200
    """)
    
    reservations = cursor.fetchall()
    conn.close()
    
    return [
        ReservationResponse(
            id=res[0],
            customer_name=res[1],
            customer_email=res[2],
            customer_phone=res[3],
            party_size=res[4],
            reservation_date=res[5],
            reservation_time=res[6],
            notes=res[7],
            status=res[8],
            created_at=res[9]
        ) for res in reservations
    ]

@app.put("/admin/reservations/{reservation_id}/status", summary="[ADMIN] Actualizar estado de la reserva")
async def update_reservation_status(reservation_id: int, status_data: dict, current_user: str = Depends(verify_token)):
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    
    # Verificar si la reserva existe
    cursor.execute("SELECT * FROM reservations WHERE id = ?", (reservation_id,))
    existing_reservation = cursor.fetchone()
    if not existing_reservation:
        conn.close()
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    
    new_status = status_data.get("status", "pending")
    
    # Validar estados permitidos
    allowed_statuses = ['pending', 'confirmed', 'cancelled', 'completed', 'no_show']
    if new_status not in allowed_statuses:
        raise HTTPException(status_code=400, detail=f"Estado no válido. Use uno de: {', '.join(allowed_statuses)}")
    
    # Actualizar estado
    cursor.execute("UPDATE reservations SET status = ? WHERE id = ?", (new_status, reservation_id))
    conn.commit()
    conn.close()
    
    return {
        "message": f"Estado de la reserva #{reservation_id} actualizado a '{new_status}'",
        "reservation_id": reservation_id,
        "new_status": new_status
    }

@app.put("/admin/reservations/{reservation_id}", response_model=ReservationResponse, summary="[ADMIN] Actualizar reserva")
async def update_reservation(reservation_id: int, reservation_update: ReservationUpdate, current_user: str = Depends(verify_token)):
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    
    # Verificar si la reserva existe
    cursor.execute("SELECT * FROM reservations WHERE id = ?", (reservation_id,))
    existing_reservation = cursor.fetchone()
    if not existing_reservation:
        conn.close()
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    
    # Actualizar solo los campos que se proporcionan
    update_fields = []
    update_values = []
    
    if reservation_update.customer_name is not None:
        update_fields.append("customer_name = ?")
        update_values.append(reservation_update.customer_name)
    if reservation_update.customer_email is not None:
        update_fields.append("customer_email = ?")
        update_values.append(reservation_update.customer_email)
    if reservation_update.customer_phone is not None:
        update_fields.append("customer_phone = ?")
        update_values.append(reservation_update.customer_phone)
    if reservation_update.party_size is not None:
        if reservation_update.party_size < 1 or reservation_update.party_size > 20:
            raise HTTPException(status_code=400, detail="El tamaño del grupo debe estar entre 1 y 20 personas")
        update_fields.append("party_size = ?")
        update_values.append(reservation_update.party_size)
    if reservation_update.reservation_date is not None:
        update_fields.append("reservation_date = ?")
        update_values.append(reservation_update.reservation_date)
    if reservation_update.reservation_time is not None:
        update_fields.append("reservation_time = ?")
        update_values.append(reservation_update.reservation_time)
    if reservation_update.notes is not None:
        update_fields.append("notes = ?")
        update_values.append(reservation_update.notes)
    if reservation_update.status is not None:
        allowed_statuses = ['pending', 'confirmed', 'cancelled', 'completed', 'no_show']
        if reservation_update.status not in allowed_statuses:
            raise HTTPException(status_code=400, detail=f"Estado no válido. Use uno de: {', '.join(allowed_statuses)}")
        update_fields.append("status = ?")
        update_values.append(reservation_update.status)
    
    if update_fields:
        update_values.append(reservation_id)
        cursor.execute(
            f"UPDATE reservations SET {', '.join(update_fields)} WHERE id = ?",
            update_values
        )
        conn.commit()
    
    # Obtener la reserva actualizada
    cursor.execute("SELECT * FROM reservations WHERE id = ?", (reservation_id,))
    updated_reservation = cursor.fetchone()
    conn.close()
    
    return ReservationResponse(
        id=updated_reservation[0],
        customer_name=updated_reservation[1],
        customer_email=updated_reservation[2],
        customer_phone=updated_reservation[3],
        party_size=updated_reservation[4],
        reservation_date=updated_reservation[5],
        reservation_time=updated_reservation[6],
        notes=updated_reservation[7],
        status=updated_reservation[8],
        created_at=updated_reservation[9]
    )

@app.delete("/admin/reservations/{reservation_id}", summary="[ADMIN] Eliminar reserva")
async def delete_reservation(reservation_id: int, current_user: str = Depends(verify_token)):
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM reservations WHERE id = ?", (reservation_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    
    cursor.execute("DELETE FROM reservations WHERE id = ?", (reservation_id,))
    conn.commit()
    conn.close()
    
    return {"message": f"Reserva #{reservation_id} eliminada exitosamente"}

@app.get("/admin/reservations/stats", summary="[ADMIN] Estadísticas de reservas")
async def get_reservations_stats(current_user: str = Depends(verify_token)):
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    
    # Total reservas
    cursor.execute("SELECT COUNT(*) FROM reservations")
    total_reservations = cursor.fetchone()[0]
    
    # Reservas pendientes
    cursor.execute("SELECT COUNT(*) FROM reservations WHERE status = 'pending'")
    pending_reservations = cursor.fetchone()[0]
    
    # Reservas confirmadas
    cursor.execute("SELECT COUNT(*) FROM reservations WHERE status = 'confirmed'")
    confirmed_reservations = cursor.fetchone()[0]
    
    # Reservas para hoy
    cursor.execute("SELECT COUNT(*) FROM reservations WHERE reservation_date = date('now')")
    today_reservations = cursor.fetchone()[0]
    
    # Reservas recientes (últimas 5)
    cursor.execute("""
        SELECT id, customer_name, party_size, reservation_date, reservation_time, status
        FROM reservations 
        ORDER BY created_at DESC
        LIMIT 5
    """)
    recent_reservations = cursor.fetchall()
    
    conn.close()
    
    return {
        "total_reservations": total_reservations,
        "pending_reservations": pending_reservations,
        "confirmed_reservations": confirmed_reservations,
        "today_reservations": today_reservations,
        "recent_reservations": [
            {
                "id": res[0],
                "customer_name": res[1],
                "party_size": res[2],
                "reservation_date": res[3],
                "reservation_time": res[4],
                "status": res[5]
            } for res in recent_reservations
        ]
    }

@app.get("/reservations/availability/{date}", summary="Consultar disponibilidad para una fecha")
async def get_availability(date: str):
    """Consultar disponibilidad de reservas para una fecha específica"""
    try:
        # Validar formato de fecha
        from datetime import datetime as dt
        dt.strptime(date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de fecha inválido. Use YYYY-MM-DD")
    
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    
    # Obtener reservas para esa fecha
    cursor.execute("""
        SELECT reservation_time, COUNT(*) as count
        FROM reservations 
        WHERE reservation_date = ? AND status IN ('pending', 'confirmed')
        GROUP BY reservation_time
        ORDER BY reservation_time
    """, (date,))
    
    reservations_by_time = cursor.fetchall()
    conn.close()
    
    # Generar horarios disponibles (9:00 - 22:00 cada 30 min)
    available_times = []
    busy_times = {time: count for time, count in reservations_by_time}
    
    for hour in range(9, 22):
        for minute in ['00', '30']:
            time_slot = f"{hour:02d}:{minute}"
            current_reservations = busy_times.get(time_slot, 0)
            # Máximo 5 reservas por franja (simulación)
            available = current_reservations < 5
            available_times.append({
                "time": time_slot,
                "available": available,
                "current_reservations": current_reservations
            })
    
    return {
        "date": date,
        "available_times": available_times
    }

# ================================
# ENDPOINTS DE PEDIDOS
# ================================

@app.post("/orders", response_model=OrderResponse, summary="Crear nuevo pedido")
async def create_order(order_data: OrderCreate):
    try:
        # Calcular total
        total_amount = sum(item.price * item.quantity for item in order_data.items)
        
        # Convertir items a JSON para almacenar
        items_json = json.dumps([item.dict() for item in order_data.items])
        
        # Guardar pedido en base de datos
        conn = sqlite3.connect('cafe.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO orders (customer_name, customer_email, customer_phone, items, total_amount, notes)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (order_data.customer_name, order_data.customer_email, order_data.customer_phone, 
              items_json, total_amount, order_data.notes))
        
        order_id = cursor.lastrowid
        
        # Crear notificación para el admin
        create_notification(
            "order",
            "Nuevo pedido recibido",
            f"Pedido de {order_data.customer_name} por €{total_amount:.2f}",
            order_id
        )
        
        # Obtener el pedido creado con fecha
        cursor.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
        created_order = cursor.fetchone()
        
        conn.commit()
        conn.close()
        
        # Preparar email de confirmación para el cliente
        items_text = "\n".join([
            f"  • {item.product_name} x{item.quantity} - €{item.price * item.quantity:.2f}"
            for item in order_data.items
        ])
        
        confirmation_subject = f"¡Pedido confirmado #{order_id}! - Café Demo"
        confirmation_body = f"""
        Hola {order_data.customer_name},
        
        ¡Gracias por tu pedido en Café Demo! ☕
        
        DETALLES DE TU PEDIDO:
        ═══════════════════════════════════════
        Número de pedido: #{order_id}
        Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
        
        PRODUCTOS:
        {items_text}
        
        TOTAL: €{total_amount:.2f}
        
        {f"NOTAS: {order_data.notes}" if order_data.notes else ""}
        ═══════════════════════════════════════
        
        Tu pedido está siendo preparado y estará listo pronto.
        Te contactaremos al {order_data.customer_phone or 'email proporcionado'} 
        cuando esté listo para recoger.
        
        ¡Gracias por elegirnos!
        
        Con cariño,
        El equipo de Café Demo
        
        ---
        Para cualquier consulta sobre tu pedido, responde a este email 
        mencionando el número #{order_id}.
        """
        
        # Enviar confirmación al cliente
        confirmation_sent = send_email(confirmation_subject, confirmation_body, order_data.customer_email)
        
        # Notificar al admin
        admin_subject = f"Nuevo Pedido #{order_id} - {order_data.customer_name}"
        admin_body = f"""
        NUEVO PEDIDO RECIBIDO:
        ═══════════════════════════════════════
        Número: #{order_id}
        Cliente: {order_data.customer_name}
        Email: {order_data.customer_email}
        Teléfono: {order_data.customer_phone or 'No proporcionado'}
        Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
        
        PRODUCTOS PEDIDOS:
        {items_text}
        
        TOTAL: €{total_amount:.2f}
        
        {f"NOTAS DEL CLIENTE: {order_data.notes}" if order_data.notes else "Sin notas especiales"}
        ═══════════════════════════════════════
        
        Accede al panel de administración para gestionar este pedido.
        """
        
        admin_notification_sent = send_email(admin_subject, admin_body)
        
        # Convertir items JSON de vuelta a lista para respuesta
        items_list = [OrderItem(**item) for item in json.loads(items_json)]
        
        return OrderResponse(
            id=created_order[0],
            customer_name=created_order[1],
            customer_email=created_order[2],
            customer_phone=created_order[3],
            items=items_list,
            total_amount=created_order[5],
            notes=created_order[6],
            status=created_order[7],
            created_at=created_order[8]
        )
        
    except Exception as e:
        print(f"Error creando pedido: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.get("/admin/orders", response_model=List[OrderResponse], summary="[ADMIN] Obtener todos los pedidos")
async def get_admin_orders(current_user: str = Depends(verify_token)):
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, customer_name, customer_email, customer_phone, items, total_amount, notes, status, created_at
        FROM orders 
        ORDER BY created_at DESC
        LIMIT 100
    ''')
    
    orders = cursor.fetchall()
    conn.close()
    
    result = []
    for order in orders:
        # Convertir items JSON de vuelta a lista
        items_list = [OrderItem(**item) for item in json.loads(order[4])]
        
        result.append(OrderResponse(
            id=order[0],
            customer_name=order[1],
            customer_email=order[2],
            customer_phone=order[3],
            items=items_list,
            total_amount=order[5],
            notes=order[6],
            status=order[7],
            created_at=order[8]
        ))
    
    return result

@app.put("/admin/orders/{order_id}/status", summary="[ADMIN] Actualizar estado del pedido")
async def update_order_status(order_id: int, status_data: dict, current_user: str = Depends(verify_token)):
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    
    # Verificar si el pedido existe
    cursor.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
    existing_order = cursor.fetchone()
    if not existing_order:
        conn.close()
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    
    new_status = status_data.get("status", "pending")
    
    # Actualizar estado
    cursor.execute("UPDATE orders SET status = ? WHERE id = ?", (new_status, order_id))
    conn.commit()
    conn.close()
    
    return {
        "message": f"Estado del pedido #{order_id} actualizado a '{new_status}'",
        "order_id": order_id,
        "new_status": new_status
    }

@app.delete("/admin/orders/{order_id}", summary="[ADMIN] Eliminar pedido")
async def delete_order(order_id: int, current_user: str = Depends(verify_token)):
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    
    cursor.execute("DELETE FROM orders WHERE id = ?", (order_id,))
    conn.commit()
    conn.close()
    
    return {"message": f"Pedido #{order_id} eliminado exitosamente"}

@app.get("/admin/orders/stats", summary="[ADMIN] Estadísticas de pedidos")
async def get_orders_stats(current_user: str = Depends(verify_token)):
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    
    # Total pedidos
    cursor.execute("SELECT COUNT(*) FROM orders")
    total_orders = cursor.fetchone()[0]
    
    # Pedidos pendientes
    cursor.execute("SELECT COUNT(*) FROM orders WHERE status = 'pending'")
    pending_orders = cursor.fetchone()[0]
    
    # Pedidos completados
    cursor.execute("SELECT COUNT(*) FROM orders WHERE status = 'completed'")
    completed_orders = cursor.fetchone()[0]
    
    # Ingresos totales
    cursor.execute("SELECT SUM(total_amount) FROM orders WHERE status IN ('completed', 'pending')")
    total_revenue = cursor.fetchone()[0] or 0
    
    # Pedidos recientes (últimos 5)
    cursor.execute('''
        SELECT id, customer_name, total_amount, status, created_at
        FROM orders 
        ORDER BY created_at DESC
        LIMIT 5
    ''')
    recent_orders = cursor.fetchall()
    
    conn.close()
    
    return {
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "completed_orders": completed_orders,
        "total_revenue": float(total_revenue),
        "recent_orders": [
            {
                "id": order[0],
                "customer_name": order[1],
                "total_amount": order[2],
                "status": order[3],
                "created_at": order[4]
            } for order in recent_orders
        ]
    }

# ================================
# ENDPOINTS DE NOTIFICACIONES ADMIN
# ================================

# Modelo para respuesta de notificaciones
class NotificationResponse(BaseModel):
    id: int
    type: str
    title: str
    message: str
    related_id: Optional[int] = None
    is_read: bool
    created_at: str

@app.get("/admin/notifications", response_model=List[NotificationResponse], summary="[ADMIN] Obtener notificaciones")
async def get_admin_notifications(current_user: str = Depends(verify_token), limit: int = 50):
    """Obtener todas las notificaciones del admin, ordenadas por fecha (más recientes primero)"""
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, type, title, message, related_id, is_read, created_at
        FROM admin_notifications 
        ORDER BY created_at DESC
        LIMIT ?
    """, (limit,))
    
    notifications = cursor.fetchall()
    conn.close()
    
    return [
        NotificationResponse(
            id=notif[0],
            type=notif[1],
            title=notif[2],
            message=notif[3],
            related_id=notif[4],
            is_read=bool(notif[5]),
            created_at=notif[6]
        ) for notif in notifications
    ]

@app.get("/admin/notifications/unread", summary="[ADMIN] Obtener notificaciones no leídas")
async def get_unread_admin_notifications(current_user: str = Depends(verify_token)):
    """Obtener el conteo de notificaciones no leídas por tipo"""
    unread_counts = get_unread_notifications_count()
    
    # También obtener el total
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM admin_notifications WHERE is_read = 0")
    total_unread = cursor.fetchone()[0]
    conn.close()
    
    return {
        "total_unread": total_unread,
        "by_type": unread_counts
    }

@app.put("/admin/notifications/{notification_id}/read", summary="[ADMIN] Marcar notificación como leída")
async def mark_notification_as_read(notification_id: int, current_user: str = Depends(verify_token)):
    """Marcar una notificación específica como leída"""
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    
    # Verificar que la notificación existe
    cursor.execute("SELECT id FROM admin_notifications WHERE id = ?", (notification_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Notificación no encontrada")
    
    # Marcar como leída
    cursor.execute("UPDATE admin_notifications SET is_read = 1 WHERE id = ?", (notification_id,))
    conn.commit()
    conn.close()
    
    return {"message": "Notificación marcada como leída", "id": notification_id}

@app.put("/admin/notifications/mark-all-read", summary="[ADMIN] Marcar todas las notificaciones como leídas")
async def mark_all_notifications_as_read(current_user: str = Depends(verify_token)):
    """Marcar todas las notificaciones como leídas"""
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    
    cursor.execute("UPDATE admin_notifications SET is_read = 1 WHERE is_read = 0")
    updated_count = cursor.rowcount
    conn.commit()
    conn.close()
    
    return {"message": f"{updated_count} notificaciones marcadas como leídas"}

@app.delete("/admin/notifications/{notification_id}", summary="[ADMIN] Eliminar notificación")
async def delete_admin_notification(notification_id: int, current_user: str = Depends(verify_token)):
    """Eliminar una notificación específica"""
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    
    # Verificar que la notificación existe
    cursor.execute("SELECT id FROM admin_notifications WHERE id = ?", (notification_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Notificación no encontrada")
    
    # Eliminar notificación
    cursor.execute("DELETE FROM admin_notifications WHERE id = ?", (notification_id,))
    conn.commit()
    conn.close()
    
    return {"message": "Notificación eliminada exitosamente"}

@app.delete("/admin/notifications/clear-all", summary="[ADMIN] Limpiar todas las notificaciones")
async def clear_all_notifications(current_user: str = Depends(verify_token)):
    """Eliminar todas las notificaciones (usar con precaución)"""
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    
    cursor.execute("DELETE FROM admin_notifications")
    deleted_count = cursor.rowcount
    conn.commit()
    conn.close()
    
    return {"message": f"{deleted_count} notificaciones eliminadas"}

# ================================
# ENDPOINTS DEL CHATBOT WEB
# ================================

@app.get("/chatbot/status", summary="Estado del chatbot")
async def get_chatbot_status():
    """
    Endpoint para verificar el estado de configuración del chatbot.
    Útil para debugging y verificar que todo está configurado correctamente.
    """
    import os
    
    # Obtener información detallada
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

@app.post("/chatbot/test", summary="Probar chatbot directamente")
async def test_chatbot(test_data: dict):
    """
    Endpoint para probar el chatbot directamente sin usar WhatsApp.
    Útil para testing y debugging durante desarrollo.
    """
    user_message = test_data.get('message', '')
    
    if not user_message:
        raise HTTPException(status_code=400, detail="Se requiere el campo 'message'")
    
    try:
        response = chatbot.process_whatsapp_message(user_message)
        return {
            "success": True,
            "user_message": user_message,
            "bot_response": response,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        print(f"Error en test del chatbot: {e}")
        raise HTTPException(status_code=500, detail=f"Error procesando mensaje: {str(e)}")

@app.post("/chat", summary="Chat directo con el bot (para web)")
async def web_chat(chat_data: dict):
    """
    Endpoint simplificado para chat web directo sin WhatsApp/Twilio.
    Perfecto para integrar chatbot directamente en la página web.
    """
    user_message = chat_data.get('message', '').strip()
    
    if not user_message:
        raise HTTPException(status_code=400, detail="Mensaje requerido")
    
    try:
        # Usar el mismo procesador del chatbot pero más directo
        bot_response = chatbot.process_whatsapp_message(user_message)
        
        return {
            "message": bot_response,
            "timestamp": datetime.now().isoformat(),
            "status": "success"
        }
        
    except Exception as e:
        print(f"💥 Error en chat web: {e}")
        return {
            "message": "Lo siento, estoy experimentando problemas técnicos. Por favor intenta más tarde o contacta directamente al +34 611 59 46 43.",
            "timestamp": datetime.now().isoformat(),
            "status": "error"
        }

# ================================
# ENDPOINTS DE NOTICIAS
# ================================

@app.get("/news", response_model=List[NewsArticleResponse], summary="Obtener noticias públicas")
async def get_public_news(featured_only: bool = False, limit: int = 50):
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    
    if featured_only:
        cursor.execute("""
            SELECT id, title, excerpt, content, author, category, featured, image, tags, published, created_at, updated_at
            FROM news_articles 
            WHERE published = 1 AND featured = 1
            ORDER BY created_at DESC
            LIMIT ?
        """, (limit,))
    else:
        cursor.execute("""
            SELECT id, title, excerpt, content, author, category, featured, image, tags, published, created_at, updated_at
            FROM news_articles 
            WHERE published = 1
            ORDER BY created_at DESC
            LIMIT ?
        """, (limit,))
    
    articles = cursor.fetchall()
    conn.close()
    
    return [
        NewsArticleResponse(
            id=art[0], title=art[1], excerpt=art[2], content=art[3],
            author=art[4], category=art[5], featured=bool(art[6]),
            image=art[7], tags=json.loads(art[8]) if art[8] else [],
            published=bool(art[9]), created_at=art[10], updated_at=art[11]
        ) for art in articles
    ]

@app.get("/news/{article_id}", response_model=NewsArticleResponse, summary="Obtener noticia por ID")
async def get_news_article(article_id: int):
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, title, excerpt, content, author, category, featured, image, tags, published, created_at, updated_at
        FROM news_articles 
        WHERE id = ? AND published = 1
    """, (article_id,))
    article = cursor.fetchone()
    conn.close()
    
    if not article:
        raise HTTPException(status_code=404, detail="Noticia no encontrada")
    
    return NewsArticleResponse(
        id=article[0], title=article[1], excerpt=article[2], content=article[3],
        author=article[4], category=article[5], featured=bool(article[6]),
        image=article[7], tags=json.loads(article[8]) if article[8] else [],
        published=bool(article[9]), created_at=article[10], updated_at=article[11]
    )

@app.get("/admin/news", response_model=List[NewsArticleResponse], summary="[ADMIN] Obtener todas las noticias")
async def get_admin_news(current_user: str = Depends(verify_token)):
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, title, excerpt, content, author, category, featured, image, tags, published, created_at, updated_at
        FROM news_articles 
        ORDER BY created_at DESC
    """)
    articles = cursor.fetchall()
    conn.close()
    
    return [
        NewsArticleResponse(
            id=art[0], title=art[1], excerpt=art[2], content=art[3],
            author=art[4], category=art[5], featured=bool(art[6]),
            image=art[7], tags=json.loads(art[8]) if art[8] else [],
            published=bool(art[9]), created_at=art[10], updated_at=art[11]
        ) for art in articles
    ]

@app.post("/admin/news", response_model=NewsArticleResponse, summary="[ADMIN] Crear noticia")
async def create_news_article(article: NewsArticleCreate, current_user: str = Depends(verify_token)):
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    
    tags_json = json.dumps(article.tags)
    
    cursor.execute("""
        INSERT INTO news_articles (title, excerpt, content, author, category, featured, image, tags, published)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (article.title, article.excerpt, article.content, article.author, article.category,
          article.featured, article.image, tags_json, article.published))
    
    article_id = cursor.lastrowid
    
    cursor.execute("""
        SELECT id, title, excerpt, content, author, category, featured, image, tags, published, created_at, updated_at
        FROM news_articles WHERE id = ?
    """, (article_id,))
    
    created_article = cursor.fetchone()
    
    conn.commit()
    conn.close()
    
    return NewsArticleResponse(
        id=created_article[0], title=created_article[1], excerpt=created_article[2],
        content=created_article[3], author=created_article[4], category=created_article[5],
        featured=bool(created_article[6]), image=created_article[7],
        tags=json.loads(created_article[8]) if created_article[8] else [],
        published=bool(created_article[9]), created_at=created_article[10],
        updated_at=created_article[11]
    )

@app.put("/admin/news/{article_id}", response_model=NewsArticleResponse, summary="[ADMIN] Actualizar noticia")
async def update_news_article(article_id: int, article_update: NewsArticleUpdate, current_user: str = Depends(verify_token)):
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    
    # Verificar si la noticia existe
    cursor.execute("SELECT id FROM news_articles WHERE id = ?", (article_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Noticia no encontrada")
    
    # Actualizar solo los campos que se proporcionan
    update_fields = []
    update_values = []
    
    if article_update.title is not None:
        update_fields.append("title = ?")
        update_values.append(article_update.title)
    if article_update.excerpt is not None:
        update_fields.append("excerpt = ?")
        update_values.append(article_update.excerpt)
    if article_update.content is not None:
        update_fields.append("content = ?")
        update_values.append(article_update.content)
    if article_update.author is not None:
        update_fields.append("author = ?")
        update_values.append(article_update.author)
    if article_update.category is not None:
        update_fields.append("category = ?")
        update_values.append(article_update.category)
    if article_update.featured is not None:
        update_fields.append("featured = ?")
        update_values.append(article_update.featured)
    if article_update.image is not None:
        update_fields.append("image = ?")
        update_values.append(article_update.image)
    if article_update.tags is not None:
        update_fields.append("tags = ?")
        update_values.append(json.dumps(article_update.tags))
    if article_update.published is not None:
        update_fields.append("published = ?")
        update_values.append(article_update.published)
    
    if update_fields:
        # Siempre actualizar updated_at
        update_fields.append("updated_at = CURRENT_TIMESTAMP")
        update_values.append(article_id)
        
        cursor.execute(
            f"UPDATE news_articles SET {', '.join(update_fields)} WHERE id = ?",
            update_values
        )
        conn.commit()
    
    # Obtener la noticia actualizada
    cursor.execute("""
        SELECT id, title, excerpt, content, author, category, featured, image, tags, published, created_at, updated_at
        FROM news_articles WHERE id = ?
    """, (article_id,))
    
    updated_article = cursor.fetchone()
    conn.close()
    
    return NewsArticleResponse(
        id=updated_article[0], title=updated_article[1], excerpt=updated_article[2],
        content=updated_article[3], author=updated_article[4], category=updated_article[5],
        featured=bool(updated_article[6]), image=updated_article[7],
        tags=json.loads(updated_article[8]) if updated_article[8] else [],
        published=bool(updated_article[9]), created_at=updated_article[10],
        updated_at=updated_article[11]
    )

@app.delete("/admin/news/{article_id}", summary="[ADMIN] Eliminar noticia")
async def delete_news_article(article_id: int, current_user: str = Depends(verify_token)):
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    
    cursor.execute("SELECT id FROM news_articles WHERE id = ?", (article_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Noticia no encontrada")
    
    cursor.execute("DELETE FROM news_articles WHERE id = ?", (article_id,))
    conn.commit()
    conn.close()
    
    return {"message": "Noticia eliminada exitosamente"}

# ================================
# ENDPOINTS DE CARRUSEL DE IMÁGENES
# ================================

@app.get("/carousel", response_model=List[CarouselImageResponse], summary="Obtener imágenes del carrusel")
async def get_carousel_images():
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, title, subtitle, description, image, link, active, order_position, created_at
        FROM carousel_images 
        WHERE active = 1
        ORDER BY order_position ASC, created_at DESC
    """)
    images = cursor.fetchall()
    conn.close()
    
    return [
        CarouselImageResponse(
            id=img[0], title=img[1], subtitle=img[2], description=img[3],
            image=img[4], link=img[5], active=bool(img[6]),
            order_position=img[7], created_at=img[8]
        ) for img in images
    ]

@app.get("/admin/carousel", response_model=List[CarouselImageResponse], summary="[ADMIN] Obtener todas las imágenes del carrusel")
async def get_admin_carousel_images(current_user: str = Depends(verify_token)):
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, title, subtitle, description, image, link, active, order_position, created_at
        FROM carousel_images 
        ORDER BY order_position ASC, created_at DESC
    """)
    images = cursor.fetchall()
    conn.close()
    
    return [
        CarouselImageResponse(
            id=img[0], title=img[1], subtitle=img[2], description=img[3],
            image=img[4], link=img[5], active=bool(img[6]),
            order_position=img[7], created_at=img[8]
        ) for img in images
    ]

@app.post("/admin/carousel", response_model=CarouselImageResponse, summary="[ADMIN] Crear imagen del carrusel")
async def create_carousel_image(image_data: CarouselImageCreate, current_user: str = Depends(verify_token)):
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO carousel_images (title, subtitle, description, image, link, active, order_position)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (image_data.title, image_data.subtitle, image_data.description, image_data.image,
          image_data.link, image_data.active, image_data.order_position))
    
    image_id = cursor.lastrowid
    
    cursor.execute("""
        SELECT id, title, subtitle, description, image, link, active, order_position, created_at
        FROM carousel_images WHERE id = ?
    """, (image_id,))
    
    created_image = cursor.fetchone()
    conn.commit()
    conn.close()
    
    return CarouselImageResponse(
        id=created_image[0], title=created_image[1], subtitle=created_image[2],
        description=created_image[3], image=created_image[4], link=created_image[5],
        active=bool(created_image[6]), order_position=created_image[7],
        created_at=created_image[8]
    )

@app.put("/admin/carousel/{image_id}", response_model=CarouselImageResponse, summary="[ADMIN] Actualizar imagen del carrusel")
async def update_carousel_image(image_id: int, image_update: CarouselImageUpdate, current_user: str = Depends(verify_token)):
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    
    # Verificar si la imagen existe
    cursor.execute("SELECT id FROM carousel_images WHERE id = ?", (image_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Imagen no encontrada")
    
    # Actualizar solo los campos que se proporcionan
    update_fields = []
    update_values = []
    
    if image_update.title is not None:
        update_fields.append("title = ?")
        update_values.append(image_update.title)
    if image_update.subtitle is not None:
        update_fields.append("subtitle = ?")
        update_values.append(image_update.subtitle)
    if image_update.description is not None:
        update_fields.append("description = ?")
        update_values.append(image_update.description)
    if image_update.image is not None:
        update_fields.append("image = ?")
        update_values.append(image_update.image)
    if image_update.link is not None:
        update_fields.append("link = ?")
        update_values.append(image_update.link)
    if image_update.active is not None:
        update_fields.append("active = ?")
        update_values.append(image_update.active)
    if image_update.order_position is not None:
        update_fields.append("order_position = ?")
        update_values.append(image_update.order_position)
    
    if update_fields:
        update_values.append(image_id)
        cursor.execute(
            f"UPDATE carousel_images SET {', '.join(update_fields)} WHERE id = ?",
            update_values
        )
        conn.commit()
    
    # Obtener la imagen actualizada
    cursor.execute("""
        SELECT id, title, subtitle, description, image, link, active, order_position, created_at
        FROM carousel_images WHERE id = ?
    """, (image_id,))
    
    updated_image = cursor.fetchone()
    conn.close()
    
    return CarouselImageResponse(
        id=updated_image[0], title=updated_image[1], subtitle=updated_image[2],
        description=updated_image[3], image=updated_image[4], link=updated_image[5],
        active=bool(updated_image[6]), order_position=updated_image[7],
        created_at=updated_image[8]
    )

@app.delete("/admin/carousel/{image_id}", summary="[ADMIN] Eliminar imagen del carrusel")
async def delete_carousel_image(image_id: int, current_user: str = Depends(verify_token)):
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    
    cursor.execute("SELECT id FROM carousel_images WHERE id = ?", (image_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Imagen no encontrada")
    
    cursor.execute("DELETE FROM carousel_images WHERE id = ?", (image_id,))
    conn.commit()
    conn.close()
    
    return {"message": "Imagen del carrusel eliminada exitosamente"}

# ================================
# ENDPOINTS DE CONTENIDO DE PÁGINA
# ================================

@app.get("/content", response_model=List[PageContentResponse], summary="Obtener contenido de página")
async def get_page_content(page: Optional[str] = None, section: Optional[str] = None):
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    
    if page and section:
        cursor.execute("""
            SELECT id, title, content, section, page, updated_at
            FROM page_content 
            WHERE page = ? AND section = ?
        """, (page, section))
    elif page:
        cursor.execute("""
            SELECT id, title, content, section, page, updated_at
            FROM page_content 
            WHERE page = ?
        """, (page,))
    else:
        cursor.execute("""
            SELECT id, title, content, section, page, updated_at
            FROM page_content 
            ORDER BY page, section
        """)
    
    contents = cursor.fetchall()
    conn.close()
    
    return [
        PageContentResponse(
            id=content[0], title=content[1], content=content[2],
            section=content[3], page=content[4], updated_at=content[5]
        ) for content in contents
    ]

@app.get("/admin/content", response_model=List[PageContentResponse], summary="[ADMIN] Obtener todo el contenido de página")
async def get_admin_page_content(current_user: str = Depends(verify_token)):
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, title, content, section, page, updated_at
        FROM page_content 
        ORDER BY page, section
    """)
    contents = cursor.fetchall()
    conn.close()
    
    return [
        PageContentResponse(
            id=content[0], title=content[1], content=content[2],
            section=content[3], page=content[4], updated_at=content[5]
        ) for content in contents
    ]

@app.post("/admin/content", response_model=PageContentResponse, summary="[ADMIN] Crear contenido de página")
async def create_page_content(content_data: PageContentCreate, current_user: str = Depends(verify_token)):
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    
    # Verificar si ya existe contenido con el mismo ID
    cursor.execute("SELECT id FROM page_content WHERE id = ?", (content_data.id,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Ya existe contenido con ese ID")
    
    cursor.execute("""
        INSERT INTO page_content (id, title, content, section, page)
        VALUES (?, ?, ?, ?, ?)
    """, (content_data.id, content_data.title, content_data.content,
          content_data.section, content_data.page))
    
    cursor.execute("""
        SELECT id, title, content, section, page, updated_at
        FROM page_content WHERE id = ?
    """, (content_data.id,))
    
    created_content = cursor.fetchone()
    conn.commit()
    conn.close()
    
    return PageContentResponse(
        id=created_content[0], title=created_content[1], content=created_content[2],
        section=created_content[3], page=created_content[4], updated_at=created_content[5]
    )

@app.put("/admin/content/{content_id}", response_model=PageContentResponse, summary="[ADMIN] Actualizar contenido de página")
async def update_page_content(content_id: str, content_update: PageContentUpdate, current_user: str = Depends(verify_token)):
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    
    # Verificar si el contenido existe
    cursor.execute("SELECT id FROM page_content WHERE id = ?", (content_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Contenido no encontrado")
    
    # Actualizar solo los campos que se proporcionan
    update_fields = []
    update_values = []
    
    if content_update.title is not None:
        update_fields.append("title = ?")
        update_values.append(content_update.title)
    if content_update.content is not None:
        update_fields.append("content = ?")
        update_values.append(content_update.content)
    if content_update.section is not None:
        update_fields.append("section = ?")
        update_values.append(content_update.section)
    if content_update.page is not None:
        update_fields.append("page = ?")
        update_values.append(content_update.page)
    
    if update_fields:
        # Siempre actualizar updated_at
        update_fields.append("updated_at = CURRENT_TIMESTAMP")
        update_values.append(content_id)
        
        cursor.execute(
            f"UPDATE page_content SET {', '.join(update_fields)} WHERE id = ?",
            update_values
        )
        conn.commit()
    
    # Obtener el contenido actualizado
    cursor.execute("""
        SELECT id, title, content, section, page, updated_at
        FROM page_content WHERE id = ?
    """, (content_id,))
    
    updated_content = cursor.fetchone()
    conn.close()
    
    return PageContentResponse(
        id=updated_content[0], title=updated_content[1], content=updated_content[2],
        section=updated_content[3], page=updated_content[4], updated_at=updated_content[5]
    )

@app.delete("/admin/content/{content_id}", summary="[ADMIN] Eliminar contenido de página")
async def delete_page_content(content_id: str, current_user: str = Depends(verify_token)):
    conn = sqlite3.connect('cafe.db')
    cursor = conn.cursor()
    
    cursor.execute("SELECT id FROM page_content WHERE id = ?", (content_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Contenido no encontrado")
    
    cursor.execute("DELETE FROM page_content WHERE id = ?", (content_id,))
    conn.commit()
    conn.close()
    
    return {"message": "Contenido eliminado exitosamente"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
