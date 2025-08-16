"""
Funciones de utilidades para el backend
"""
from sqlalchemy.orm import Session
from database import AdminNotification
import json
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, List

def create_admin_notification(db: Session, notification_type: str, title: str, message: str, related_id: int = None):
    """
    Crear una nueva notificación para el admin de forma segura
    """
    try:
        notification = AdminNotification(
            type=notification_type,
            title=title,
            message=message,
            related_id=related_id,
            is_read=False
        )
        db.add(notification)
        db.commit()
        print(f"✅ Notificación creada: {title}")
        return notification
    except Exception as e:
        print(f"❌ Error creando notificación: {e}")
        db.rollback()
        return None

def get_unread_notifications_count(db: Session) -> Dict[str, int]:
    """
    Obtener el conteo de notificaciones no leídas por tipo
    """
    try:
        # Conteo por tipo
        notifications = db.query(AdminNotification).filter(AdminNotification.is_read == False).all()
        
        counts = {}
        for notif in notifications:
            if notif.type not in counts:
                counts[notif.type] = 0
            counts[notif.type] += 1
        
        return counts
    except Exception as e:
        print(f"❌ Error obteniendo conteos: {e}")
        return {}

def send_email(to_email: str, subject: str, body: str, is_html: bool = False):
    """
    Enviar email usando SMTP o simular envío si no hay credenciales
    """
    smtp_user = os.getenv('SMTP_USER')
    smtp_password = os.getenv('SMTP_PASSWORD')
    smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
    smtp_port = int(os.getenv('SMTP_PORT', 587))
    
    if not smtp_user or not smtp_password:
        print(f"📧 [SIMULATED] Email a {to_email}: {subject}")
        print(f"   Cuerpo: {body[:100]}...")
        return True
    
    try:
        msg = MIMEMultipart()
        msg['From'] = smtp_user
        msg['To'] = to_email
        msg['Subject'] = subject
        
        msg.attach(MIMEText(body, 'html' if is_html else 'plain'))
        
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_password)
        text = msg.as_string()
        server.sendmail(smtp_user, to_email, text)
        server.quit()
        
        print(f"Email enviado exitosamente a {to_email}")
        return True
    except Exception as e:
        print(f"Error enviando email: {e}")
        return False

def serialize_json(data) -> str:
    """Serializar datos a JSON string de forma segura"""
    try:
        return json.dumps(data, ensure_ascii=False)
    except Exception:
        return str(data)

def deserialize_json(json_str: str, default=None):
    """Deserializar JSON string de forma segura"""
    try:
        return json.loads(json_str) if json_str else default
    except Exception:
        return default or []
