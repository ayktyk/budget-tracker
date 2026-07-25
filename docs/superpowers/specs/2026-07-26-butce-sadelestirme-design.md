# Bütçe Takip — Sadeleştirme ve Yeniden Tasarım (Tasarım Dokümanı)

Tarih: 2026-07-26
Durum: Onaylandı, uygulama planı bekliyor

---

## 1. Problem ve teşhis

Uygulama çalışıyor, veri giriliyor, kayıtlar duruyor. Kullanıcının takibi bırakma sebebi
veri girişi değil, **okuma katmanı**: "Bu ay nereye fazla para gitti, neyi kısabilirim?"
sorusu mevcut arayüzde cevaplanamıyor.

Tespit edilen üç yapısal sebep:

1. **Ana ekranda 9 kart var, hiçbiri karar verdirmiyor.** Hero, Takvim, Gün Akışı,
   Altı Aylık Nabız, ay çipleri, metrics-row, trend grafiği, P&L tablosu, bütçe uyarıları
   — hepsi veri gösteriyor, hiçbiri "şu kalem seni batırıyor" demiyor.
2. **Görsel hiyerarşi yok.** Hero da, uyarı kartı da, tema seçici de aynı `.card`
   kutusunda ve aynı başlık ağırlığında. Göz nereye bakacağını bilmiyor.
3. **18 kategori düz liste olarak okunmuyor.** Kategori başına ayrı renk, özet ekranında
   ayırt ediciliğini kaybedip gürültüye dönüşüyor.

Ek olarak "Detay" ekranı beş paneli aynı anda açık tutuyor (`setMoreTab()` sadece
kaydırma yapıyor, panel gizlemiyor) — kalabalık hissinin doğrudan kaynağı.

## 2. Alınan kararlar

| Karar | Seçim | Gerekçe |
|---|---|---|
| Ana ekranın birincil sorusu | "Param nereye gidiyor" (kategori dağılımı) | Kullanıcı seçimi |
| "Neyi kısabilirim" cevabı | Ayrı ekran değil, dağılım satırındaki delta işareti | İki ekran yerine tek okuma |
| Özellik budama | Silme yok, kademe düşürme | Kullanıcı dört ana özelliği de aktif kullanıyor |
| Kategoriler | 18 kategori korunur, üstüne 6 grup eklenir | Giriş alışkanlığı bozulmaz, özet okunur olur |
| Bütçe sekmesi | Kaldırılır, limit dağılım satırına gömülür | Harcama ve limit aynı sorunun iki yüzü |
| Takvim | Ana ekranda kalır, en altta; Gün Akışı içine alınır | Kullanıcı talebi |
| Tema | 5 → 2 (Krem Kâğıt, Onyx) | Yeni bileşenlerin 5 temada ayarı maliyetli |
| Dosya yapısı | index.html + app.css + app.js | Build adımı yok, bakım kolaylaşır |

## 3. Bilgi mimarisi

**Navigasyon: 5 → 4**

| Bugün | Yarın |
|---|---|
| Ana · Gelir · ➕ · Bütçe · Detay | **Özet · Gelir · ➕ · Araçlar** |

- **Bütçe** sekmesi kalkar. Kategori limitleri Özet ekranındaki dağılım satırının içine
  girer; limit düzenleme satıra dokununca açılan panelden yapılır.
- **Detay → Araçlar.** İçi akordeon olur, varsayılan olarak **tüm paneller kapalı**,
  bir seferde bir panel açık.

**Araçlar akordeon başlıkları** (sırayla):
Ekstre Yükle + AI · Kart Takvimi · Abonelikler · Sabit Giderler · Harcama Analizi (1/3/6 ay)
· Kategoriler · Findeks · Veri (yedek/sıfırla) · Görünüm

"Kategoriler" paneli, bugün Bütçe ekranında duran kategori ekle/düzenle/sil,
"Yeniden sınıflandır", "Varsayılanlara sıfırla" ve gözden geçirilmemiş kalemler
panelini (`budget-unrev-panel`) devralır.

**Aylık toplam limit** (bugün Bütçe ekranındaki `budget-monthlim-card`) Hero'daki
hedef çubuğuna bağlanır: çubuk aylık toplam limite göre doluluk gösterir, limit
düzenleme çubuğa dokununca açılır. Ayrı kart olarak durmaz.

## 4. Ana ekran (Özet) — 9 kart → 5 kart

Sıra: **Hero → Param Nereye Gidiyor → Dikkat → 6 Aylık Trend → Takvim**

### 4.1 Hero
- Ay seçici (‹ TEMMUZ 2026 ›) hero'nun içine gömülür; ayrı ay çipleri şeridi kaldırılır.
- Büyük rakam: seçili ayın net bakiyesi (gelir − gider).
- Altında tek satır: `Gelir 84.000 · Gider 71.520`.
- Hedef çubuğu korunur ve **aylık toplam limite** bağlanır (bkz. Bölüm 3). Çubuğa
  dokununca limit düzenleme açılır. Aylık limit tanımlı değilse çubuk gizlenir.

### 4.2 Param Nereye Gidiyor (ekranın kalbi)
Seçili ayın giderleri, **üst gruplara** toplanıp büyükten küçüğe sıralanır. Her satır:

```
Yaşam          19.100 ₺    %27    ↑ %31
███████████░░░░░░░░░░░░░   limit 15.000 ₺
```

- **Tutar** — grubun seçili aydaki toplam gideri.
- **%pay** — grup / ayın toplam gideri.
- **Delta** — bir önceki aya göre yüzde değişim. Artış kırmızı ↑, azalış yeşil ↓.
  Önceki ay 0 ise delta yerine `yeni` yazılır (0'a bölme yok).
- **Çubuk** — grubun limitine göre doluluk. Grup limiti = gruptaki kategorilerin
  `ay_bud` limitlerinin toplamı. Grupta hiç limit tanımlı değilse çubuk yerine ince
  bir pay göstergesi (grup / ayın toplamı) çizilir.
- **Etkileşim** — satıra dokun → alt kategoriler aynı satırın altında açılır
  (her biri tutar + delta ile). Alt kategoriye dokun → o kategorinin işlem listesi.
  Alt kategori satırında "limit belirle" alanı bulunur.

Veri yoksa: kart yerine tek satır boş durum — "Bu ay henüz gider kaydı yok."

### 4.3 Dikkat
**En fazla 3 satır.** Hiç sinyal yoksa kart hiç render edilmez ("her şey yolunda"
kartı göstermek gürültüdür). Öncelik sırası:

1. Limiti aşan gruplar (doluluk > %100), aşım tutarına göre azalan.
2. Bir önceki aya göre en çok artan kategoriler — eşik: artış ≥ 500 ₺ **ve** ≥ %20.
3. Son 6 ay ortalamasının %30 üstünde kalan kategoriler.

Aynı kategori/grup birden fazla satırda tekrar etmez; ilk yakalandığı kuralla girer.

### 4.4 6 Aylık Trend
Bugünkü üç ayrı gösterim (sparkbar + Chart.js grafiği + P&L tablosu) tek karta iner:
Chart.js gelir/gider çizgisi + altında iki satır özet (`Bu ay net`, `6 ay ortalama net`).
Ayrıntılı aylık tablo kaldırılır — trend grafiği aynı bilgiyi taşıyor.

### 4.5 Takvim
Mevcut takvim korunur (kart kesim ve son ödeme günleri kartın renginde işaretli).
**Gün Akışı ayrı kart olmaktan çıkar, takvimin içine girer:** güne dokun → o günün
işlemleri takvimin hemen altında açılır. Gün seçili değilken liste alanı görünmez.

## 5. Üst grup haritası

`CATS` tanımına eklenen tek bir `group` alanıyla kurulur. **Hiçbir işlem kaydına
dokunulmaz.**

| Grup | Kategoriler |
|---|---|
| Zorunlu | kira, fatura, vergi, muhasebe |
| Yaşam | market, yemek, ulasim, nakit |
| Keyif | eglence, giyim, eticaret, dijital, spor |
| İş / Mesleki | uyap |
| Sağlık-Eğitim | saglik, egitim |
| Yatırım | yatirim |
| Gruplanmamış | diger + kullanıcının custom kategorileri |

Kullanıcının kendi eklediği kategoriler varsayılan olarak "Gruplanmamış" altına düşer;
Araçlar > Kategoriler panelinden bir gruba atanabilir (`customCats[].group`).

## 6. Diğer ekranlar

- **Hızlı Giriş (➕):** İşlevsel olarak **değişmez** — 18 kategorilik ikon grid'i, numpad,
  Sık Havale şeridi aynen kalır. Sadece görsel dil (boşluk, tipografi) hizalanır.
  Gerekçe: veri girişi çalışan taraf; bozmak için sebep yok.
- **Gelir:** Yapı korunur (FIBER kuralı, gelir formu, gelir geçmişi). Görsel dil hizalanır.
- **Araçlar:** Bölüm 3'teki akordeon.

## 7. Görsel dil

**Hiyerarşi — üç kademe:**
1. Hero — dolu zemin, en büyük rakam.
2. Ana kartlar (Dağılım, Dikkat) — tam kontrast başlık, geniş iç boşluk.
3. İkincil kartlar (Trend, Takvim) — soluk başlık, dar iç boşluk.

**Renk:** Özet ekranında renk yalnızca anlam taşıdığında kullanılır —
kırmızı = artış/limit aşımı, yeşil = azalış. Kategori renkleri alt kategori listesinde,
Hızlı Giriş grid'inde ve takvimde korunur.

**Tipografi:** Tüm para alanlarında `font-variant-numeric: tabular-nums`. Bugün rakamlar
satır satır kaydığı için dağılım listesi okunmuyor.

**Boşluk ölçeği:** 4 / 8 / 12 / 16 / 24 / 32 px, CSS değişkeni olarak tanımlanır.
Şablon içindeki dağınık inline `style="..."` kullanımları bu ölçeğe taşınır.

**Tema:** Krem Kâğıt (açık) ve Onyx (koyu). Diğer üç temanın CSS'i dosyada kalır,
yalnızca seçiciden gizlenir — geri getirmek tek satır.

## 8. Teknik yapı

**Dosya bölme.** Bugün `index.html` 4.387 satır / 240 KB (1.635 satır CSS + 2.650 satır JS).
Üçe bölünür:

```
index.html   ~120 satır — iskelet, nav, script/style referansları
app.css      ~1.600 satır
app.js       ~2.700 satır
```

Build adımı eklenmez, Vercel statik deploy ve PWA manifest aynen çalışır.

**`app.js` iç düzeni** (dosya içi bölüm başlıklarıyla, ayrı modül dosyası yok — `type=module`
gerektirmediği için `file://` ile açmak da çalışmaya devam eder):
`VERİ TANIMLARI → DEPOLAMA → SAF HESAPLAR → RENDER → ETKİLEŞİM → BAŞLANGIÇ`

**Saf hesap fonksiyonları** tek bölümde toplanır ve yan etkisiz olur:
`fmt`, `parseTrNum`, `groupTotals`, `deltaPct`, `limitFill`, `attentionSignals`.

**Yol temizliği (silme yok, taşıma):**
- Dört adet `index.html.backup-*` dosyası (~540 KB) → `arsiv/` klasörüne taşınır.
- `vercel.json` içindeki `{"src":"/(.*)","dest":"/public/$1"}` route'u repoda `public/`
  klasörü olmadığı için deploy'u bozuyor; kök dizine yönlendirilecek şekilde düzeltilir.

## 9. Veri modeli ve göç

**Şema değişmez.** `localStorage` anahtarları (`ay_exp`, `ay_inc`, `ay_bud`,
`ay_gemini_key`) ve kayıt alanları aynen kalır. Yapılan tek ekleme, kod tarafındaki
`CATS` tanımına `group` alanı — mevcut kayıtlar okunurken kategori id'sinden gruba
eşlenir. Migration script'i yoktur, geri alma riski yoktur.

Delta yüzdeleri ve grup toplamları **saklanmaz**, her render'da hesaplanır. Hesap hatası
veriyi bozmaz, yalnızca ekranı yanlış gösterir — geri alınabilir hata sınıfı.

**Çalışma öncesi:** JSON yedeği alınır ve repo dışında saklanır.

## 10. Hata durumları

| Durum | Davranış |
|---|---|
| Seçili ayda hiç gider yok | Dağılım kartı yerine tek satır boş durum |
| Önceki ay verisi yok (delta paydası 0) | Delta yerine `yeni` etiketi |
| Grupta hiç limit tanımlı değil | Limit çubuğu yerine pay göstergesi |
| Hiç dikkat sinyali yok | Dikkat kartı render edilmez |
| Gruba atanmamış custom kategori | "Gruplanmamış" grubunda listelenir |
| Chart.js CDN yüklenmedi | Trend kartı grafiksiz özet satırlarıyla render olur |

## 11. Doğrulama

- **Otomatik:** Saf hesap fonksiyonları için bağımlılıksız `test.html` assert runner.
  Tarayıcıda açılır, geçti/kaldı listesi gösterir. Kapsam: `parseTrNum` (Türkçe sayı
  formatı), `groupTotals`, `deltaPct` (0 payda dahil), `limitFill`, `attentionSignals`
  (öncelik sırası ve tekrar etmeme kuralı).
- **Manuel:** Her aşama sonunda gerçek veriyle kontrol listesi — ay değiştirme,
  grup açma/kapama, limit düzenleme, gün seçme, ekstre içe aktarma, JSON yedek al/yükle.
- **Commit disiplini:** Her aşama ayrı commit; beğenilmeyen aşama tek `git revert`.

## 12. Kapsam dışı (bilinçli olarak yapılmayanlar)

- Backend, hesap/oturum, çoklu cihaz senkronizasyonu.
- Kategori sayısını azaltma veya geçmiş kayıtları yeni kategorilere taşıma.
- Otomatik tekrarlayan gider oluşturma (Sabit Giderler bugünkü gibi referans listesi kalır).
- Yeni AI özelliği; mevcut Gemini ekstre parse ve harcama analizi olduğu gibi korunur.
- Service worker / offline desteği.

## 13. Riskler

| Risk | Önlem |
|---|---|
| Dosya bölerken JS yükleme sırası bozulur | `app.js` `defer` ile yüklenir; başlangıç tek `init()` çağrısına toplanır |
| Grup eşlemesi yanlış → tutarlar hatalı görünür | `groupTotals` testte doğrulanır; grup toplamlarının ay toplamına eşitliği assert edilir |
| Kaldırılan kartların işlevi aranır | Hiçbiri silinmez; Trend ve Takvim ana ekranda, geri kalanı Araçlar'da |
| Kullanıcı yeni düzeni beğenmez | Aşamalı commit + `arsiv/` altında çalışan eski sürüm |
