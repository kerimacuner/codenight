#!/bin/bash

# Turkcell Decision Engine - Local Network Startup Script
# Bu script sistemi yerel ağda yayınlar

echo "============================================"
echo "  Turkcell Decision Engine - Network Setup  "
echo "============================================"
echo ""

# Get local IP address
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)
else
    # Linux
    LOCAL_IP=$(hostname -I | awk '{print $1}')
fi

if [ -z "$LOCAL_IP" ]; then
    echo "Yerel IP adresi bulunamadi. Manuel olarak girmeniz gerekiyor."
    read -p "Yerel IP adresinizi girin (orn: 192.168.1.100): " LOCAL_IP
fi

echo "Yerel IP Adresi: $LOCAL_IP"
echo ""

# Set environment variables
export VITE_API_URL="http://${LOCAL_IP}:5050/api"
export HOST_IP="$LOCAL_IP"

echo "API URL: $VITE_API_URL"
echo ""

# Create .env file for docker-compose
cat > .env << EOF
VITE_API_URL=http://${LOCAL_IP}:5050/api
HOST_IP=$LOCAL_IP
EOF

echo ".env dosyasi olusturuldu"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Docker calismiyor! Lutfen Docker'i baslatin."
    exit 1
fi

# Stop existing containers
echo "Mevcut container'lar durduruluyor..."
docker-compose -f docker-compose.network.yml down 2>/dev/null

# Build and start containers
echo "Container'lar yeniden build ediliyor..."
docker-compose -f docker-compose.network.yml build --no-cache frontend

echo "Container'lar baslatiliyor..."
docker-compose -f docker-compose.network.yml up -d

echo ""
echo "============================================"
echo "  Sistem basariyla baslatildi!              "
echo "============================================"
echo ""
echo "Yerel Erisim:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:5050"
echo ""
echo "Ag Erisimi:"
echo "  Frontend: http://${LOCAL_IP}:3000"
echo "  Backend:  http://${LOCAL_IP}:5050"
echo ""
echo "Giris Bilgileri:"
echo "  Admin:     admin / admin123"
echo "  Presenter: presenter / presenter123"
echo "  User:      user1-user10 / user123"
echo ""
echo "Container loglari icin: docker-compose -f docker-compose.network.yml logs -f"
echo ""
