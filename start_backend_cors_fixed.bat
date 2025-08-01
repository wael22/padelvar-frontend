@echo off
title Serveur PadelVar Backend (CORS Fixed)
color 0A
echo.
echo =====================================
echo    SERVEUR PADELVAR BACKEND
echo      CORS CORRIGE POUR PORT 5173
echo =====================================
echo.
echo 🚀 Démarrage du serveur...
echo 🌐 Frontend: http://localhost:5173
echo 🔧 Backend:  http://localhost:5000
echo 🔑 Admin: admin@padelvar.com / admin123
echo.
cd /d "C:\Users\PC\Desktop\1-Padel App\dev\padelvar-backend-main"
python simple_server.py
echo.
echo ❌ Le serveur s'est arrêté
pause
