═══ PROJE BİLGİ FORMU ═══

PROJE ADI: budget-tracker

[1] PROJE HAKKINDA
Tek `index.html` dosyasında çalışan, kişisel giderleri ve hukuk/müvekkil gelirlerini ayrı ayrı takip eden bir bütçe uygulaması. Veriler tarayıcı `localStorage` içinde tutuluyor; kategori bazlı aylık bütçe limitleri, 6 aylık trend grafiği, takvim görünümü ve banka ekstresini Gemini API ile parse edip giderlere dönüştüren bir akış sunuyor. Hedef kullanıcı, mesleki tahsilatları (UYAP/vekalet) kişisel harcamalardan ayrı izlemek isteyen tek kullanıcı.

HEDEF / AMAÇ:
Tek tarayıcıda çalışan, ekstre günlerinde manuel + AI destekli toplu giriş yapılan, aylık net bakiye ve kategori bütçesini canlı takip eden bir kişisel finans aracı.

[2] TEKNOLOJİ & ARAÇLAR
- Saf HTML / CSS / JavaScript (framework yok, build adımı yok)
- Dört dosyalı statik yapı: index.html (iskelet) + app.css + calc.js (saf hesaplar) + app.js (render/etkileşim)
- node test.js — bağımlılıksız birim testleri (100 test, calc.js kapsamı)
- Chart.js (CDN üzerinden, 6 aylık trend grafiği)
- Google Fonts (CDN)
- localStorage (veri kalıcılığı — `ay_exp`, `ay_inc`, `ay_bud`, `ay_subs`, `ay_lastbank`, `ay_gemini_key`)
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
Manuel giriş öncelikli akışa geçildi. Ekstre yükleme birincil giriş yolu olmaktan çıkıp
mutabakat aracına dönüştü; günlük harcamalar elle giriliyor.
Eklenenler: Özet ekranında abonelik durum kartı (ödendi/gecikmiş/bekliyor + tek dokunuşla
"Ödedim" → gerçek gider kaydı), takvimde abonelik halkaları ve gün panelinde abonelik bloğu,
Hızlı Giriş'te opsiyonel açıklama · Tekrarla şeridi · kaynak hafızası · arka arkaya giriş,
girerken canlı bütçe şeridi (uyarır, ENGELLEMEZ), hero'da "bugün harcanabilir",
Araçlar > Kategoriler'de gerçek harcamadan limit önerisi (son 3 tam ayın medyanı),
ekstre içe aktarımında çift kayıt koruması (aynı tutar ±1 gün → atlanır).
Sonraki aday: kullanıcının kendi eklediği kategorileri Araçlar > Kategoriler panelinden
bir üst gruba atayabilmesi (şu an hepsi "Gruplanmamış" altında toplanıyor).

═══ SON ═══
