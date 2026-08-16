═══ PROJE BİLGİ FORMU ═══

PROJE ADI: budget-tracker

[1] PROJE HAKKINDA
Tek `index.html` dosyasında çalışan, kişisel giderleri ve hukuk/müvekkil gelirlerini ayrı ayrı takip eden bir bütçe uygulaması. Veriler tarayıcı `localStorage` içinde tutuluyor; kategori bazlı aylık bütçe limitleri, 6 aylık trend grafiği, takvim görünümü ve banka ekstresini Gemini API ile parse edip giderlere dönüştüren bir akış sunuyor. Hedef kullanıcı, mesleki tahsilatları (UYAP/vekalet) kişisel harcamalardan ayrı izlemek isteyen tek kullanıcı.

HEDEF / AMAÇ:
Tek tarayıcıda çalışan, ekstre günlerinde manuel + AI destekli toplu giriş yapılan, aylık net bakiye ve kategori bütçesini canlı takip eden bir kişisel finans aracı.

[2] TEKNOLOJİ & ARAÇLAR
- Saf HTML / CSS / JavaScript (framework yok, build adımı yok)
- Beş dosyalı statik yapı: index.html (iskelet) + app.css + calc.js (saf hesaplar) + app.js (render/etkileşim) + sw.js (çevrimdışı önbellek)
- node test.js — bağımlılıksız birim testleri (152 test, calc.js kapsamı)
- Chart.js (CDN üzerinden, 6 aylık trend grafiği)
- Google Fonts (CDN)
- localStorage (veri kalıcılığı — `ay_exp`, `ay_inc`, `ay_bud`, `ay_subs`, `ay_lastbank`, `ay_gemini_key`, `ay_roll`, `ay_funds`, `ay_lastreview`)
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
2026-08-16 büyük iyileştirme turu (4 faz) tamamlandı:
- Özet ekranı yeni sırası: Özet → Dikkat → Ay Özeti → Takvim → Bütçe Kategorileri → Abonelikler → Trend.
  "Param Nereye Gidiyor" kartı "Bütçe Kategorileri" adını aldı.
- Abonelikte otomatik tahsilat: "Ödedim" el işi kalktı; günü gelen aktif aboneliğin gider
  kaydı otomatik açılır (çift kayıt koruması: elle girilene bağlanır; silinen otomatik kayıt
  o ay yeniden oluşmaz — autoSkip). Kart salt görünüm; satıra dokun → düzenleme modalı.
- Bütçe Belirle penceresi: tüm kategoriler limit+harcanan+çubuk, aylık toplam limit,
  medyan bazlı öneri sihirbazı, kategori başına devir (rollover) işareti. prompt() kalktı.
- Bütçe Kategorileri kartında aşım rozeti ("N aşım"), grup başında aşım noktası,
  Sabit/Esnek/Dönemsel kırılım satırı, devirli limitlerde "+devir" notu.
- Kademeli canlı uyarı: %70 yavaşla · %90 durakla · %100'de "Nereden aktarayım?" →
  kategoriler arası pay aktarım modalı.
- "Bugün harcanabilir" artık çekilecek abonelikler + zarf paylarını düşer.
- Ay kapanış özeti kartı (yeni ayda bir kez, kapatılabilir), takvim altında ay sonu
  projeksiyonu + limitin dolacağı günden itibaren gün boyama.
- Abonelik maliyet paneli (günlük/aylık/yıllık + en pahalı 3 + zam tespiti).
- Birikim Zarfları aracı (hedef/aylık pay/ilerleme; gider kaydı oluşturmaz).
- İşlemler: metin araması, etiket sistemi (Hızlı Giriş'te opsiyonel), etiket filtresi,
  toplu seçim → toplu kategori taşıma / silme.
- Özel kategorilere üst grup atama (kategori formunda seçim) — eski "sonraki aday" kapandı.
- sw.js: ağ-öncelikli service worker → tam çevrimdışı çalışma.
Sonraki adaylar: haftalık özet bildirimi, Money Lover tarzı önerilen-günlük-harcama grafiği,
Türkiye bağlamı için altın/döviz cinsinden görünüm.

═══ SON ═══
