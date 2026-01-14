# Turkcell Decision Engine

Çok Servisli Davranış ve Karar Platformu - Codenight 2026

## 🚀 Hızlı Başlangıç (Docker)

Projeyi Docker ile başlatmak için:

```bash
docker-compose up -d
```

Bu komut aşağıdaki servisleri başlatacaktır:
- **PostgreSQL** - Port 5433 (harici) / 5432 (dahili)
- **Backend (.NET 9)** - Port 5050
- **Frontend (React + Vite)** - Port 3000

### Erişim URL'leri
- Frontend: http://localhost:3000
- Backend API: http://localhost:5050/api

### Demo Hesapları
| Rol       | Kullanıcı ID | Şifre        |
|-----------|--------------|--------------|
| Admin     | admin        | admin123     |
| Presenter | presenter    | presenter123 |
| User      | U1-U10       | 123456       |

## 🛠️ Geliştirme Ortamı

### Gereksinimler
- .NET 9 SDK
- Node.js 20+
- PostgreSQL 16

### Backend'i Çalıştırma

```bash
cd backend/TurkcellDecisionEngine.Api
dotnet run
```

### Frontend'i Çalıştırma

```bash
cd frontend
npm install
npm run dev
```

## 📦 Docker Komutları

```bash
# Tüm servisleri başlat
docker-compose up -d

# Logları izle
docker-compose logs -f

# Servisleri durdur
docker-compose down

# Servisleri durdur ve verileri sil
docker-compose down -v

# Yeniden build et
docker-compose up --build -d
```

## 🏗️ Proje Yapısı

```
Case1/
├── backend/
│   ├── TurkcellDecisionEngine.Api/        # API projesi
│   ├── TurkcellDecisionEngine.Core/       # Domain modelleri
│   ├── TurkcellDecisionEngine.Infrastructure/  # Servisler
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/   # React bileşenleri
│   │   ├── pages/        # Sayfa bileşenleri
│   │   ├── services/     # API servisleri
│   │   └── types/        # TypeScript tipleri
│   ├── Dockerfile
│   └── nginx.conf
└── docker-compose.yml
```

## 📊 API Endpoints

| Endpoint                   | Method | Açıklama                  |
|---------------------------|--------|---------------------------|
| `/api/auth/login`         | POST   | Giriş yap                 |
| `/api/events`             | GET    | Eventleri listele         |
| `/api/events`             | POST   | Yeni event oluştur        |
| `/api/users/{id}/state`   | GET    | Kullanıcı durumu          |
| `/api/rules`              | GET    | Kuralları listele         |
| `/api/rules`              | POST   | Yeni kural ekle           |
| `/api/decisions`          | GET    | Kararları listele         |
| `/api/dashboard/summary`  | GET    | Dashboard özeti           |

## 🎯 Özellikler

- ✅ Event yönetimi (çok servis desteği)
- ✅ Kullanıcı durum takibi
- ✅ Kural motoru (BETWEEN operatör desteği dahil)
- ✅ Aksiyon yönetimi ve önceliklendirme
- ✅ BiP bildirim mock servisi
- ✅ Karar ve audit log
- ✅ Admin & User dashboard
- ✅ JWT tabanlı kimlik doğrulama
- ✅ Docker desteği

## 👥 Kullanıcı Rolleri

- **Admin**: Tüm sistem yönetimi, kullanıcı oluşturma/silme
- **Presenter**: Sunum modu, demo senaryoları
- **User**: Kendi durumunu görüntüleme

---

Codenight 2026 - Turkcell
