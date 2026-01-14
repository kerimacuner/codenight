# Turkcell Decision Engine

Turkcell ekosistemindeki servislerin kullanıcı davranışlarını işleyerek anlık durum üreten ve kurallara göre aksiyon alan bir karar platformu.

## Özellikler

- **Event Yönetimi**: Farklı servislerden (Internet, Paycell, TV+, Fizy, BiPLive) gelen eventleri işleme
- **Kullanıcı Durumu**: Günlük internet kullanımı, harcama ve içerik tüketimi takibi
- **Kural Motoru**: Veri olarak tanımlanmış kuralların dinamik değerlendirilmesi
- **Aksiyon Yönetimi**: Öncelik bazlı aksiyon seçimi ve bastırma mekanizması
- **BiP Bildirim (Mock)**: Kullanıcılara bildirim gönderme simülasyonu
- **Audit Log**: Tüm kararların detaylı kaydı
- **Dashboard**: Gerçek zamanlı izleme ve yönetim arayüzü
- **Rule Management UI**: Kuralların CRUD işlemleri için arayüz

## Teknoloji Stack

| Katman | Teknoloji |
|--------|-----------|
| Backend | .NET 9 Web API |
| Frontend | React 18 + TypeScript + Vite |
| Database | PostgreSQL |
| ORM | Entity Framework Core |
| Rule Parser | NCalc |
| UI | Tailwind CSS |

## Kurulum

### Gereksinimler

- .NET 9 SDK
- Node.js 18+
- PostgreSQL 14+

### Backend Kurulumu

```bash
# PostgreSQL veritabanı oluştur
# Connection string: Host=localhost;Port=5432;Database=TurkcellDecisionEngine;Username=postgres;Password=postgres

# Backend'i çalıştır
cd backend/TurkcellDecisionEngine.Api
dotnet run
```

Backend http://localhost:5050 adresinde çalışacaktır.

### Frontend Kurulumu

```bash
cd frontend
npm install
npm run dev
```

Frontend http://localhost:5173 adresinde çalışacaktır.

## API Endpointleri

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | /api/events | Yeni event gönder |
| GET | /api/events | Son eventleri listele |
| GET | /api/users | Tüm kullanıcıları listele |
| GET | /api/users/{id}/state | Kullanıcı durumu |
| GET | /api/rules | Tüm kuralları listele |
| POST | /api/rules | Yeni kural ekle |
| PUT | /api/rules/{ruleId} | Kural güncelle |
| DELETE | /api/rules/{ruleId} | Kural sil |
| PATCH | /api/rules/{ruleId}/toggle | Kural aktif/pasif yap |
| GET | /api/decisions | Karar loglarını getir |
| GET | /api/dashboard/summary | Dashboard özet verileri |

## Örnek Event

```json
{
  "userId": "U5",
  "service": "Internet",
  "eventType": "USAGE",
  "value": 2.5,
  "unit": "GB"
}
```

## Örnek Kural

```json
{
  "ruleId": "R-04",
  "condition": "internet_today_gb > 15 && spend_today_try > 300",
  "action": "CRITICAL_ALERT",
  "priority": 1,
  "isActive": true
}
```

## Kural Koşulları

Kullanılabilir değişkenler:
- `internet_today_gb` - Günlük internet kullanımı (GB)
- `spend_today_try` - Günlük harcama (TRY)
- `content_minutes_today` - İçerik tüketim süresi (dakika)

Operatörler:
- Karşılaştırma: `>`, `<`, `>=`, `<=`, `==`, `!=`
- Mantıksal: `&&` (ve), `||` (veya)

## Aksiyon Türleri

- `DATA_USAGE_WARNING` - Veri kullanım uyarısı
- `SPEND_ALERT` - Harcama uyarısı
- `CONTENT_SUGGESTION` - İçerik önerisi
- `CRITICAL_ALERT` - Kritik uyarı

## Risk Seviyeleri

Kullanıcı durumuna göre otomatik hesaplanır:
- `LOW` - Düşük risk
- `MEDIUM` - Orta risk
- `HIGH` - Yüksek risk
- `CRITICAL` - Kritik risk

---

Codenight 2026 - Turkcell Decision Engine Case
