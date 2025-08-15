@echo off
echo 🚀 Iniciando el backend del Café Demo...
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
pause
