"""
Script simple para crear imágenes placeholder sin dependencias externas
"""
import os

def create_simple_placeholder(filename: str):
    """Crear imagen SVG simple como placeholder"""
    name = filename.replace('.jpg', '').replace('_', ' ').title()
    
    # SVG básico
    svg_content = f'''<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="300" fill="#f8f9fa" stroke="#dee2e6" stroke-width="2"/>
    <text x="200" y="140" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#6c757d">
        {name}
    </text>
    <text x="200" y="160" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#adb5bd">
        Placeholder Image
    </text>
</svg>'''
    
    return svg_content.encode('utf-8')

def create_product_placeholders_simple():
    """Crear placeholders simples para productos"""
    
    # Crear directorio si no existe
    os.makedirs("uploads/products", exist_ok=True)
    
    # Lista de imágenes necesarias
    product_images = [
        "cappuccino.jpg",
        "latte.jpg", 
        "americano.jpg",
        "croissant.jpg",
        "tostada.jpg",
        "cheesecake.jpg",
        "brownie.jpg",
        "smoothie.jpg"
    ]
    
    print("🖼️ Creando placeholders simples...")
    
    for image_name in product_images:
        image_path = f"uploads/products/{image_name}"
        svg_path = f"uploads/products/{image_name.replace('.jpg', '.svg')}"
        
        if os.path.exists(image_path) or os.path.exists(svg_path):
            print(f"   ⏭️ {image_name} ya existe")
            continue
        
        # Crear SVG placeholder
        svg_content = create_simple_placeholder(image_name)
        
        with open(svg_path, 'wb') as f:
            f.write(svg_content)
            
        print(f"   ✅ Creado: {svg_path}")
    
    print("✅ Placeholders simples creados")

def create_basic_jpg_placeholder(filename: str, size=(400, 300)):
    """Crear JPG básico sin PIL usando bytes directos"""
    
    # Header JPG mínimo (imagen 1x1 transparente expandida)
    # Esto es un truco: crear un JPG mínimo válido de 1 pixel y llenarlo
    jpg_header = b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.\' ",#\x1c\x1c(7),01444\x1f\'9=82<.342\xff\xc0\x00\x11\x08\x00\x01\x00\x01\x01\x01\x11\x00\x02\x11\x01\x03\x11\x01\xff\xc4\x00\x14\x00\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x08\xff\xc4\x00\x14\x10\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xda\x00\x08\x01\x01\x00\x00?\x00\xaa\xff\xd9'
    
    return jpg_header

if __name__ == "__main__":
    create_product_placeholders_simple()
