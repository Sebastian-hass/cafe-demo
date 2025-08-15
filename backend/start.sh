#!/bin/bash
# Script de inicio para Railway
echo "🚀 Iniciando Café Demo Backend..."

# Crear directorios necesarios
mkdir -p uploads/products

# Ejecutar el servidor
uvicorn main:app --host 0.0.0.0 --port $PORT
