═══ PROJE BİLGİ FORMU ═══

PROJE ADI: budget-tracker

[1] PROJE HAKKINDA
Tek `index.html` dosyasında çalışan, kişisel giderleri ve hukuk/müvekkil gelirlerini ayrı ayrı takip eden bir bütçe uygulaması. Veriler tarayıcı `localStorage` içinde tutuluyor; kategori bazlı aylık bütçe limitleri, 6 aylık trend grafiği, takvim görünümü ve banka ekstresini Gemini API ile parse edip giderlere dönüştüren bir akış sunuyor. Hedef kullanıcı, mesleki tahsilatları (UYAP/vekalet) kişisel harcamalardan ayrı izlemek isteyen tek kullanıcı.

HEDEF / AMAÇ:
Tek tarayıcıda çalışan, ekstre günlerinde manuel + AI destekli toplu giriş yapılan, aylık net bakiye ve kategori bütçesini canlı takip eden bir kişisel finans aracı.

[2] TEKNOLOJİ & ARAÇLAR
- Saf HTML / CSS / JavaScript (framework yok, build adımı yok)
- Tek dosyalı SPA (`index.html` içinde tüm UI ve mantık)
- Chart.js (CDN üzerinden, 6 aylık trend grafiği)
- Google Fonts (CDN)
- localStorage (veri kalıcılığı — `ay_exp`, `ay_inc`, `ay_bud`, `ay_gemini_key`)
- Gemini API 2.5 Flash (tarayıcıdan REST çağrısı, ekstre parse + harcama analizi)
- Yerel fallback parser (Gemini başarısız olursa ekstre satırlarını ayıklar)
- PWA manifest (`manifest.json`, service worker yok)
- Vercel (statik deploy)

[3] ALTYAPI & DURUM
- Repo: https://github.com/ayktyk/budget-tracker.git [AKTİF]
- Hosting/Deploy: Vercel [BEKLEMEDE]
- Veritabanı: localStorage (backend yok) [AKTİF]
- Auth: yok [EKSİK]
- CI/CD: yok [EKSİK]
- Domain: bilinmiyor [BİLİNMİYOR]
- Ortam dosyası (.env): yok — Gemini API anahtarı localStorage'da [EKSİK]
- Build durumu: build adımı yok, statik HTML doğrudan servis ediliyor [AKTİF]
- Test: yok [EKSİK]
- Son commit: 2026-04-23
- AI entegrasyonu: Gemini 2.5 Flash, tarayıcı tarafı REST [AKTİF]
- Service Worker / Offline: yok [EKSİK]
- Yedekleme: JSON export/import (manuel) [AKTİF]

[4] SONRAKI ADIM
`vercel.json` içindeki `{ "src": "/(.*)", "dest": "/public/$1" }` route'unu kaldır veya kök dizine yönlendir; çünkü repoda `public/` klasörü yok ve mevcut config deploy'u bozuyor.

═══ SON ═══
