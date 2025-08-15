#!/usr/bin/env python3
"""
Script para probar las notificaciones del admin
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def login():
    """Login y obtener token"""
    response = requests.post(f"{BASE_URL}/admin/login", json={
        "username": "admin",
        "password": "admin123"
    })
    
    if response.status_code == 200:
        return response.json()["access_token"]
    else:
        print("Error en login:", response.text)
        return None

def test_notifications(token):
    """Probar endpoints de notificaciones"""
    headers = {"Authorization": f"Bearer {token}"}
    
    print("🔔 Probando endpoints de notificaciones...")
    
    # 1. Obtener notificaciones no leídas
    print("\n1. Obteniendo conteo de notificaciones no leídas...")
    response = requests.get(f"{BASE_URL}/admin/notifications/unread", headers=headers)
    if response.status_code == 200:
        unread_data = response.json()
        print(f"   Total no leídas: {unread_data['total_unread']}")
        print(f"   Por tipo: {unread_data['by_type']}")
    else:
        print(f"   Error: {response.status_code} - {response.text}")
    
    # 2. Obtener todas las notificaciones
    print("\n2. Obteniendo todas las notificaciones...")
    response = requests.get(f"{BASE_URL}/admin/notifications", headers=headers)
    if response.status_code == 200:
        notifications = response.json()
        print(f"   Total notificaciones: {len(notifications)}")
        for notif in notifications[:3]:  # Mostrar las primeras 3
            print(f"   - {notif['title']}: {notif['message']} ({'leída' if notif['is_read'] else 'no leída'})")
    else:
        print(f"   Error: {response.status_code} - {response.text}")

def create_test_notifications():
    """Crear notificaciones de prueba enviando datos a los endpoints públicos"""
    print("\n🧪 Creando notificaciones de prueba...")
    
    # Crear mensaje de contacto (genera notificación)
    print("   Enviando mensaje de contacto...")
    contact_response = requests.post(f"{BASE_URL}/contact", json={
        "name": "Usuario Prueba",
        "email": "prueba@test.com", 
        "subject": "Consulta de prueba",
        "message": "Este es un mensaje de prueba para generar una notificación"
    })
    print(f"   Contacto: {contact_response.status_code}")
    
    # Suscripción al newsletter (genera notificación)
    print("   Suscribiendo al newsletter...")
    newsletter_response = requests.post(f"{BASE_URL}/newsletter/subscribe", json={
        "email": "newsletter@test.com",
        "name": "Suscriptor Prueba"
    })
    print(f"   Newsletter: {newsletter_response.status_code}")
    
    # Crear reserva (genera notificación)  
    print("   Creando reserva...")
    reservation_response = requests.post(f"{BASE_URL}/reservations", json={
        "customer_name": "Cliente Reserva",
        "customer_email": "reserva@test.com",
        "customer_phone": "+34 666 777 888",
        "party_size": 4,
        "reservation_date": "2025-08-16",
        "reservation_time": "19:30",
        "notes": "Reserva de prueba"
    })
    print(f"   Reserva: {reservation_response.status_code}")
    
    # Crear pedido (genera notificación)
    print("   Creando pedido...")
    order_response = requests.post(f"{BASE_URL}/orders", json={
        "customer_name": "Cliente Pedido",
        "customer_email": "pedido@test.com", 
        "customer_phone": "+34 555 666 777",
        "items": [
            {
                "product_id": 1,
                "product_name": "Cappuccino Clásico",
                "quantity": 2,
                "price": 3.50,
                "notes": "Sin azúcar"
            }
        ],
        "notes": "Pedido de prueba"
    })
    print(f"   Pedido: {order_response.status_code}")

if __name__ == "__main__":
    print("🚀 Iniciando prueba de notificaciones...")
    
    # Login
    token = login()
    if not token:
        print("❌ No se pudo obtener token")
        exit(1)
        
    print(f"✅ Token obtenido: {token[:20]}...")
    
    # Probar estado inicial
    test_notifications(token)
    
    # Crear notificaciones de prueba
    create_test_notifications()
    
    print("\n⏳ Esperando un momento para que se procesen las notificaciones...")
    import time
    time.sleep(2)
    
    # Probar estado después de crear notificaciones
    print("\n📊 Estado después de crear notificaciones:")
    test_notifications(token)
    
    print("\n🎉 Prueba completada!")
    print("Ahora puedes ir al panel de administración y ver las notificaciones en la campana 🔔")
