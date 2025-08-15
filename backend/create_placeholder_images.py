from PIL import Image, ImageDraw, ImageFont
import os

# Crear directorio si no existe
os.makedirs("uploads/products", exist_ok=True)

# Configuración básica
WIDTH, HEIGHT = 400, 300
colors = {
    'cappuccino': '#8B4513',
    'latte': '#D2691E', 
    'americano': '#654321',
    'croissant': '#DAA520',
    'tostada': '#F4A460',
    'cheesecake': '#FFB6C1',
    'brownie': '#8B4513',
    'smoothie': '#90EE90'
}

# Productos a crear
products = [
    ('cappuccino.jpg', 'Cappuccino', '#8B4513'),
    ('latte.jpg', 'Latte', '#D2691E'),
    ('americano.jpg', 'Americano', '#654321'),
    ('croissant.jpg', 'Croissant', '#DAA520'),
    ('tostada.jpg', 'Tostada', '#F4A460'),
    ('cheesecake.jpg', 'Cheesecake', '#FFB6C1'),
    ('brownie.jpg', 'Brownie', '#8B4513'),
    ('smoothie.jpg', 'Smoothie', '#90EE90')
]

def create_placeholder_image(filename, text, color):
    # Crear imagen
    img = Image.new('RGB', (WIDTH, HEIGHT), color=color)
    draw = ImageDraw.Draw(img)
    
    # Tratar de usar una fuente del sistema, o usar la predeterminada
    try:
        font = ImageFont.truetype("arial.ttf", 40)
        small_font = ImageFont.truetype("arial.ttf", 20)
    except:
        font = ImageFont.load_default()
        small_font = ImageFont.load_default()
    
    # Dibujar texto
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    x = (WIDTH - text_width) // 2
    y = (HEIGHT - text_height) // 2
    
    # Texto con sombra
    draw.text((x+2, y+2), text, fill='black', font=font)
    draw.text((x, y), text, fill='white', font=font)
    
    # Texto "Café Demo" en la esquina
    draw.text((10, HEIGHT-30), "Café Demo", fill='white', font=small_font)
    
    # Guardar imagen
    filepath = f"uploads/products/{filename}"
    img.save(filepath)
    print(f"Created {filepath}")

# Crear todas las imágenes
for filename, text, color in products:
    create_placeholder_image(filename, text, color)

print("¡Todas las imágenes placeholder han sido creadas!")
