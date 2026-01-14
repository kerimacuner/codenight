# Turkcell Decision Engine - Local Network Startup Script
# Bu script sistemi yerel ağda yayınlar

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Turkcell Decision Engine - Network Setup  " -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Get local IP address
$localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike "*Loopback*" -and $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.*" } | Select-Object -First 1).IPAddress

if (-not $localIP) {
    Write-Host "Yerel IP adresi bulunamadi. Manuel olarak girmeniz gerekiyor." -ForegroundColor Red
    $localIP = Read-Host "Yerel IP adresinizi girin (orn: 192.168.1.100)"
}

Write-Host "Yerel IP Adresi: $localIP" -ForegroundColor Green
Write-Host ""

# Set environment variables
$env:VITE_API_URL = "http://${localIP}:5050/api"
$env:HOST_IP = $localIP

Write-Host "API URL: $env:VITE_API_URL" -ForegroundColor Yellow
Write-Host ""

# Create .env file for docker-compose
@"
VITE_API_URL=http://${localIP}:5050/api
HOST_IP=$localIP
"@ | Out-File -FilePath ".env" -Encoding UTF8

Write-Host ".env dosyasi olusturuldu" -ForegroundColor Green
Write-Host ""

# Check if Docker is running
$dockerStatus = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker calismiyor! Lutfen Docker Desktop'i baslatin." -ForegroundColor Red
    exit 1
}

# Stop existing containers
Write-Host "Mevcut container'lar durduruluyor..." -ForegroundColor Yellow
docker-compose -f docker-compose.network.yml down 2>$null

# Build and start containers
Write-Host "Container'lar yeniden build ediliyor..." -ForegroundColor Yellow
docker-compose -f docker-compose.network.yml build --no-cache frontend

Write-Host "Container'lar baslatiliyor..." -ForegroundColor Yellow
docker-compose -f docker-compose.network.yml up -d

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  Sistem basariyla baslatildi!              " -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Yerel Erisim:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:  http://localhost:5050" -ForegroundColor White
Write-Host ""
Write-Host "Ag Erisimi:" -ForegroundColor Cyan
Write-Host "  Frontend: http://${localIP}:3000" -ForegroundColor White
Write-Host "  Backend:  http://${localIP}:5050" -ForegroundColor White
Write-Host ""
Write-Host "Giris Bilgileri:" -ForegroundColor Cyan
Write-Host "  Admin:     admin / admin123" -ForegroundColor White
Write-Host "  Presenter: presenter / presenter123" -ForegroundColor White
Write-Host "  User:      user1-user10 / user123" -ForegroundColor White
Write-Host ""

# Open firewall ports
Write-Host "Windows Firewall kurallari ekleniyor..." -ForegroundColor Yellow
$firewallRules = @(
    @{Name="Turkcell-Frontend"; Port=3000},
    @{Name="Turkcell-Backend"; Port=5050}
)

foreach ($rule in $firewallRules) {
    $existingRule = Get-NetFirewallRule -DisplayName $rule.Name -ErrorAction SilentlyContinue
    if (-not $existingRule) {
        try {
            New-NetFirewallRule -DisplayName $rule.Name -Direction Inbound -Protocol TCP -LocalPort $rule.Port -Action Allow -ErrorAction Stop | Out-Null
            Write-Host "  Firewall kurali eklendi: $($rule.Name) (Port $($rule.Port))" -ForegroundColor Green
        } catch {
            Write-Host "  Firewall kurali eklenemedi (yonetici izni gerekebilir): $($rule.Name)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  Firewall kurali zaten mevcut: $($rule.Name)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Container loglari icin: docker-compose -f docker-compose.network.yml logs -f" -ForegroundColor Gray
Write-Host ""
