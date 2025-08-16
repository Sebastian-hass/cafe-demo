import os
import sqlite3
from typing import Optional

# Cargar variables de entorno desde .env
try:
    from dotenv import load_dotenv
    load_dotenv()
    print("✅ Variables de entorno cargadas desde .env")
except ImportError:
    print("⚠️ python-dotenv no instalado. Intentando cargar .env manualmente...")
    # Cargar manualmente el archivo .env
    try:
        with open('.env', 'r') as f:
            for line in f:
                if line.strip() and not line.startswith('#') and '=' in line:
                    key, value = line.strip().split('=', 1)
                    os.environ[key] = value
        print("✅ Variables de entorno cargadas manualmente")
    except FileNotFoundError:
        print("❌ Archivo .env no encontrado")
    except Exception as e:
        print(f"❌ Error cargando .env: {e}")

# Configuración desde variables de entorno (solo lo necesario)
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
APP_NAME = os.getenv('APP_NAME', 'Cafe Demo')
PHONE_CONTACT = os.getenv('PHONE_CONTACT', '+34 611 59 46 43')
ADDRESS = os.getenv('ADDRESS', 'Carretera Bordeta 61, Barcelona')
HOURS = os.getenv('HOURS', 'Lunes a Domingo 7:00-22:00')

# Debug: Mostrar estado de configuración
print(f"🔧 OpenAI API Key configurado: {'✅' if OPENAI_API_KEY else '❌'}")
if OPENAI_API_KEY:
    print(f"🔑 API Key (primeros 20 chars): {OPENAI_API_KEY[:20]}...")

def get_menu_context() -> str:
    """Obtener contexto del menú desde la base de datos usando SQLAlchemy"""
    try:
        from database import SessionLocal, Product, Special
        from datetime import date
        
        db = SessionLocal()
        
        # Obtener productos disponibles
        products = db.query(Product).filter(
            Product.available == True
        ).order_by(Product.category, Product.name).all()
        
        # Obtener especiales del día con eager loading
        today = date.today().isoformat()
        specials = db.query(Special).join(Product).filter(
            Special.date == today,
            Product.available == True
        ).all()
        
        # Procesar especiales antes de cerrar la sesión
        specials_info = []
        if specials:
            for special in specials:
                product = special.product  # Acceder al producto mientras la sesión está activa
                specials_info.append({
                    'name': product.name,
                    'description': product.description or 'Sin descripción',
                    'original_price': product.price,
                    'discount': special.discount,
                    'discounted_price': product.price * (1 - special.discount / 100)
                })
        
        db.close()
        
        # Formatear información del menú
        menu_text = f"🍽️ MENÚ {APP_NAME}:\n\n"
        
        # Agrupar por categorías
        categories = {}
        for product in products:
            name, desc, price, category = product.name, product.description, product.price, product.category
            if category not in categories:
                categories[category] = []
            categories[category].append(f"• {name}: {desc or 'Sin descripción'} - €{price:.2f}")
        
        for category, items in categories.items():
            menu_text += f"📂 {category.upper()}:\n"
            menu_text += "\n".join(items) + "\n\n"
        
        # Agregar especiales si existen
        if specials_info:
            menu_text += "🎉 ESPECIALES DEL DÍA:\n"
            for special in specials_info:
                menu_text += f"• {special['name']}: {special['description']} - €{special['discounted_price']:.2f} (antes €{special['original_price']:.2f}, -{special['discount']}% descuento)\n"
            menu_text += "\n"
        
        return menu_text
        
    except Exception as e:
        print(f"Error obteniendo menú: {e}")
        return "Lo siento, no puedo acceder al menú en este momento."

def generate_openai_response(user_message: str) -> str:
    """Generar respuesta usando OpenAI GPT"""
    
    system_prompt = f"""
    Eres el asistente virtual de {APP_NAME}, una cafetería moderna en Barcelona.
    
    📍 INFORMACIÓN DEL NEGOCIO:
    - Nombre: {APP_NAME}
    - Horario: {HOURS}
    - Ubicación: {ADDRESS}
    - Teléfono: {PHONE_CONTACT}
    - Especialidad: Café de calidad, productos frescos, ambiente acogedor
    
    {get_menu_context()}
    
    📋 INSTRUCCIONES IMPORTANTES:
    - Sé amigable, profesional y entusiasta sobre nuestros productos
    - Responde SIEMPRE en español
    - Si preguntan por productos específicos, menciona precio y descripción
    - Para reservas o pedidos complejos, deriva al teléfono de contacto
    - Si preguntan información no disponible, sé honesto y deriva al contacto
    - Mantén respuestas concisas (máximo 150 palabras)
    - Usa emojis para hacer las respuestas más amigables
    - Si mencionan alergias, recomienda hablar directamente con el personal
    
    📞 Para dudas complejas o reservas especiales, deriva siempre al: {PHONE_CONTACT}
    """
    
    try:
        # Debug: Imprimir información de la API key
        print(f"🔍 Debug - API Key presente: {'✅' if OPENAI_API_KEY else '❌'}")
        if OPENAI_API_KEY:
            print(f"🔍 Debug - API Key length: {len(OPENAI_API_KEY)}")
            print(f"🔍 Debug - API Key prefix: {OPENAI_API_KEY[:10]}...")
        
        # Intentar importar OpenAI
        try:
            from openai import OpenAI
            print("✅ OpenAI library imported successfully")
        except ImportError as e:
            print(f"❌ Failed to import OpenAI: {e}")
            return "❌ Lo siento, el servicio de chat inteligente no está disponible. Por favor contacta al " + PHONE_CONTACT
        
        if not OPENAI_API_KEY:
            print("❌ No API key configured")
            return "❌ Lo siento, el servicio de chat inteligente no está disponible. Por favor contacta al " + PHONE_CONTACT
            
        # Configuración especial para Windows/Antivirus
        try:
            import httpx
            http_client = httpx.Client(
                verify=False,  # Desactivar verificación SSL para antivirus
                timeout=30.0
            )
            client = OpenAI(api_key=OPENAI_API_KEY, http_client=http_client)
        except ImportError:
            # Fallback sin httpx
            client = OpenAI(api_key=OPENAI_API_KEY)
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",  # Más económico que GPT-4
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            max_tokens=200,  # Limitar para reducir costos
            temperature=0.7,
            presence_penalty=0.1,
            frequency_penalty=0.1
        )
        
        ai_response = response.choices[0].message.content.strip()
        
        # Asegurar que termine con información de contacto si es relevante
        if any(keyword in user_message.lower() for keyword in ['reserva', 'pedido', 'alergia', 'delivery']):
            if PHONE_CONTACT not in ai_response:
                ai_response += f"\n\n📞 Para más información: {PHONE_CONTACT}"
        
        return ai_response
        
    except Exception as e:
        print(f"Error con OpenAI: {e}")
        return f"🤖 Disculpa, estoy experimentando problemas técnicos. Por favor contacta directamente al {PHONE_CONTACT} o visítanos en {ADDRESS}."

def generate_fallback_response(user_message: str) -> str:
    """Respuesta de respaldo cuando OpenAI no está disponible"""
    
    message_lower = user_message.lower()
    
    # Respuestas predefinidas básicas
    if any(word in message_lower for word in ['hola', 'buenas', 'hey', 'hi']):
        return f"¡Hola! 👋 Bienvenido a {APP_NAME}. ¿En qué puedo ayudarte? Puedes preguntarme sobre nuestro menú, horarios o ubicación."
    
    elif any(word in message_lower for word in ['menu', 'carta', 'comida', 'bebida']):
        menu_info = get_menu_context()
        return f"📋 Aquí tienes nuestro menú:\n\n{menu_info}\n📞 Para pedidos: {PHONE_CONTACT}"
    
    elif any(word in message_lower for word in ['precio', 'cuesta', 'coste']):
        return f"💰 Los precios varían según el producto. Te recomiendo ver nuestro menú completo o llamarnos al {PHONE_CONTACT} para información específica."
    
    elif any(word in message_lower for word in ['horario', 'abierto', 'cerrado', 'hora']):
        return f"🕒 Nuestro horario: {HOURS}\n📍 Ubicación: {ADDRESS}"
    
    elif any(word in message_lower for word in ['donde', 'ubicacion', 'direccion']):
        return f"📍 Nos encontramos en: {ADDRESS}\n🕒 Horario: {HOURS}\n📞 Teléfono: {PHONE_CONTACT}"
    
    elif any(word in message_lower for word in ['reserva', 'mesa', 'booking']):
        return f"🍽️ Para reservas de mesa, por favor llámanos al {PHONE_CONTACT} o visítanos directamente en {ADDRESS}. ¡Te esperamos!"
    
    elif any(word in message_lower for word in ['especial', 'oferta', 'promocion']):
        return "🎉 Consulta nuestros especiales del día en nuestro menú. ¡Siempre tenemos ofertas deliciosas! Para más detalles, llámanos al " + PHONE_CONTACT
    
    else:
        return f"🤖 Soy el asistente virtual de {APP_NAME}. Puedo ayudarte con:\n• Ver nuestro menú\n• Información de horarios y ubicación\n• Precios y especiales\n\nPara consultas específicas: {PHONE_CONTACT}"

def process_whatsapp_message(user_message: str) -> str:
    """Procesar mensaje de WhatsApp y generar respuesta apropiada"""
    
    if not user_message or not user_message.strip():
        return f"👋 ¡Hola! Soy el asistente virtual de {APP_NAME}. ¿En qué puedo ayudarte hoy?"
    
    # Limpiar mensaje
    user_message = user_message.strip()
    
    # Intentar respuesta con OpenAI primero
    if OPENAI_API_KEY:
        try:
            response = generate_openai_response(user_message)
            return response
        except Exception as e:
            print(f"Fallback a respuesta básica debido a error OpenAI: {e}")
    
    # Si OpenAI falla o no está disponible, usar respuestas predefinidas
    return generate_fallback_response(user_message)

def get_chat_response(user_message: str) -> str:
    """Función principal para obtener respuesta del chat (alias de process_whatsapp_message)"""
    return process_whatsapp_message(user_message)

# Función de utilidad para validar configuración
def validate_config() -> dict:
    """Validar que la configuración esté completa"""
    config_status = {
        'openai_configured': bool(OPENAI_API_KEY),
        'database_accessible': False
    }
    
    # Verificar acceso a base de datos
    try:
        conn = sqlite3.connect('cafe.db')
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM products")
        count = cursor.fetchone()[0]
        conn.close()
        config_status['database_accessible'] = count > 0
    except Exception:
        pass
    
    return config_status

if __name__ == "__main__":
    # Pruebas básicas
    print("🧪 Probando chatbot...")
    print(f"Configuración: {validate_config()}")
    print("\nPrueba de respuesta:")
    print(process_whatsapp_message("Hola, qué tal"))
