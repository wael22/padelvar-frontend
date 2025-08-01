# Script PowerShell pour diagnostiquer et résoudre le problème admin
Write-Host "🚀 DIAGNOSTIC ET CORRECTION ADMIN PADELVAR" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Gray

# Changer vers le bon répertoire
$backendPath = "C:\Users\PC\Desktop\1-Padel App\dev\padelvar-backend-main"
Set-Location -Path $backendPath

Write-Host "📁 Répertoire: $((Get-Location).Path)" -ForegroundColor Cyan

# 1. Exécuter le diagnostic
Write-Host "`n1️⃣ DIAGNOSTIC..." -ForegroundColor Yellow
try {
    python admin_debug.py
    Write-Host "✅ Diagnostic terminé" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur diagnostic: $_" -ForegroundColor Red
}

# 2. Proposer de démarrer le serveur
Write-Host "`n2️⃣ DÉMARRAGE SERVEUR" -ForegroundColor Yellow
$response = Read-Host "Voulez-vous démarrer le serveur backend? (O/N)"

if ($response -eq "O" -or $response -eq "o" -or $response -eq "yes" -or $response -eq "oui") {
    Write-Host "🚀 Démarrage du serveur..." -ForegroundColor Green
    Write-Host "💡 Le serveur va s'ouvrir dans une nouvelle fenêtre" -ForegroundColor Cyan
    Write-Host "⏹️  Fermez cette fenêtre pour arrêter le serveur" -ForegroundColor Cyan
    
    # Démarrer dans une nouvelle fenêtre
    Start-Process -FilePath "python" -ArgumentList "simple_server.py" -WindowStyle Normal
    
    Write-Host "✅ Serveur démarré!" -ForegroundColor Green
    Write-Host "🌐 URL: http://localhost:5000" -ForegroundColor Cyan
    Write-Host "🔑 Admin: admin@padelvar.com / admin123" -ForegroundColor Cyan
} else {
    Write-Host "⏸️  Serveur non démarré" -ForegroundColor Yellow
    Write-Host "💡 Pour démarrer manuellement: python simple_server.py" -ForegroundColor Cyan
}

Write-Host "`n" + "=" * 60 -ForegroundColor Gray
Write-Host "🎯 INSTRUCTIONS FINALES:" -ForegroundColor Green
Write-Host "1. Assurez-vous que le serveur est démarré" -ForegroundColor White
Write-Host "2. Utilisez: admin@padelvar.com / admin123" -ForegroundColor White
Write-Host "3. Si ça ne marche pas, vérifiez les logs du serveur" -ForegroundColor White
Write-Host "=" * 60 -ForegroundColor Gray

Read-Host "Appuyez sur Entrée pour fermer"
