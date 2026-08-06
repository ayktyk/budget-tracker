# Manuel Giriş Öncelikli Akış + Abonelik Görünürlüğü — Tasarım

Tarih: 2026-08-06
Durum: Onaylandı

## Problem

Uygulama bugün "ekstre yükle → geçmişi raporla" modelinde çalışıyor. İki sonucu var:

1. **Bütçe pasif.** Limitler yalnızca ay sonunda, harcama olup bittikten sonra Özet ekranında
   görünüyor. Harcamayı yaparken ya da kaydederken kullanıcının önüne hiçbir bilgi çıkmıyor.
   Kullanıcının ifadesiyle: "beni sınırlayan, bütçemi aşmamı engelleyen bir şey olmadı."
2. **Abonelikler görünmez.** `S.subs` verisi ve `renderSubs()` var ama Araçlar akordeonunun en
   dibinde, açılmadan görünmüyor. Ödendi/ödenmedi durumu hiç tutulmuyor.

Kullanıcının kararı: **engelleme/kilit istemiyor.** Her harcamayı elle girip kendi davranışını
görmek, bütçeyi zamanla gerçek verisine göre oturtmak istiyor. Ekstre akışı kalacak ama birincil
giriş yolu olmaktan çıkacak.

## Hedef

- Manuel gider girişi günlük alışkanlık haline gelecek kadar hızlı olsun.
- Girerken kullanıcı bütçesinin neresinde olduğunu görsün (bilgi, engel değil).
- Abonelikler ana ekranda ve takvimde sürekli görünür olsun; ödendi/ödenmedi takip edilsin.
- Bütçe limitleri gerçek harcama verisinden önerilebilsin.
- **Hiçbir mevcut veri veya özellik kaybolmasın.**

## Kapsam Dışı (YAGNI)

- Sert kilit / gerekçe zorunluluğu / aşım defteri — kullanıcı açıkça reddetti.
- Zarf (envelope) bakiyesinin aydan aya devri.
- Abonelik için otomatik gider oluşturma (kullanıcı onayı olmadan kayıt yaratılmaz).
- Bildirim / push / hatırlatma altyapısı (PWA'da service worker yok).
- Yeni sekme; navigasyon 4 sekme olarak kalır.

---

## Bölüm 1 — Abonelik Durum Kartı (Özet ekranı)

Hero kartının hemen altına, dağılım kartından önce yeni bir kart eklenir.

```
┌─ Abonelikler · Ağustos ──────────────┐
│  4.850 ₺   ·  3 ödendi · 2 bekliyor  │
│                                       │
│  ⚠ 2'sinde  Spotify      99 ₺  [Ödedim]
│    8'inde   Google One  720 ₺  ✓ ödendi
│   10'unda   Apple.com   400 ₺  [Ödedim]
│   25'inde   Netflix     190 ₺   bekliyor
└───────────────────────────────────────┘
```

Davranış:

- Yalnızca `active !== false` abonelikler listelenir; `dayOfMonth` artan sırada.
- Durum üç değerden biri:
  - **ödendi** — o ay için ödeme işareti var
  - **gecikmiş** — gün geçmiş, işaret yok (yalnızca içinde bulunulan ay için; geçmiş aylarda
    tüm işaretsizler "ödenmedi")
  - **bekliyor** — gün henüz gelmemiş
- **"Ödedim"** → o abonelik için normal bir gider kaydı oluşturur:
  - tarih = ilgili ayın `dayOfMonth`'u (ay sonu taşmasında ayın son gününe kırpılır)
  - `desc` = abonelik adı, `cat`/`bank` = abonelikten
  - kayıt `S.userExp` + `S.expenses`'e girer, `save()` çağrılır
  - `sub.paid[monthKey] = { expId, at }` yazılır
- **"geri al"** → oluşan gider silinir, `sub.paid[monthKey]` temizlenir.
- Kullanıcı aynı gideri elle silerse (`delExp`) ilgili ödeme işareti de temizlenir — kart ile
  gerçek kayıtlar birbirinden kopmaz.
- Kart, Özet'teki ay gezinmesini (`S.dashM`) takip eder; geçmiş ayların durumu korunur.
- `detectSubscriptions()` ile bulunan `pending:true` adaylar kartta **"Onayla"** rozetiyle görünür.
- Hiç abonelik yoksa kart tek satıra düşer: "Abonelik tanımlı değil — + Ekle" (Araçlar > Abonelikler
  panelini açar).

Araçlar'daki abonelik paneli olduğu gibi kalır (CRUD orada).

## Bölüm 2 — Takvimde abonelik işaretleri

- `renderDashCalendar()` içinde, mevcut kart kesim/son ödeme noktalarının yanına abonelik noktası
  eklenir. Görsel olarak ayrışması için **içi boş halka** biçimi kullanılır (kart noktaları dolu).
- Ödenmiş abonelikler soluk, ödenmemişler tam opaklıkta.
- Gün paneli (`renderDayList`): mevcut "kart olayları" bloğunun altına **Abonelikler** bloğu.
  Her satırda ad, tutar, durum ve gerekiyorsa **Ödedim** düğmesi.
- Gelecek günler de işaretlenir (planlama görünürlüğü).

## Bölüm 3 — Hızlı Giriş sürtünme azaltması

1. **Açıklama opsiyonel.** `quickAdd()` şu an boş açıklamada kaydı reddediyor; bu kalkar. Boşsa
   `desc` = kategori etiketi ("Market").
2. **Tekrarla şeridi.** Son 30 günün girişlerinden `desc|cat|amt` üçlüsüne göre en sık 6 kombinasyon
   çip olarak Hızlı Giriş kartının üstünde. Dokunuş → bugüne aynı kayıt; toast'ta **geri al**.
3. **Kaynak hatırlanır.** Son kullanılan banka `S.lastBank`'e yazılır, sonraki girişte seçili gelir.
4. **Arka arkaya giriş.** Tarih varsayılan bugün. Kayıttan sonra yalnızca tutar ve açıklama
   temizlenir; kategori, kaynak ve tarih korunur, odak tutar alanına döner.

## Bölüm 4 — Canlı bütçe geri bildirimi

Hızlı Giriş'te kategori ızgarasının altında canlı şerit:

```
Market · bu ay 6.150 / 7.000 ₺
▓▓▓▓▓▓▓▓▓▓▓▓▓░░  bu girişten sonra: 150 ₺ kalır
```

- Tutar yazıldıkça ve kategori değiştikçe güncellenir (`input` + `selCat` olayları).
- Renk: yeşil → sarı (%90 ve üstü) → kırmızı (%100 üstü). Mevcut `lvl()` eşikleriyle uyumlu.
- Kategoride limit yoksa: "limit yok · belirle" — `openCatLimitEditor(catId)` açar.
- **Kaydet düğmesi hiçbir koşulda kilitlenmez.** Uyarı var, engel yok.

Özet ekranında hero'nun altına tek satır: **"Bugün harcanabilir: X ₺"**
= (aylık efektif limit − bu ayın gideri) ÷ ayın kalan gün sayısı. Yalnızca içinde bulunulan ay
görüntülenirken ve limit tanımlıyken gösterilir. Kalan ≤ 0 ise "limit aşıldı" yazılır.

## Bölüm 5 — Gerçek harcamadan limit önerisi

Araçlar > Kategoriler paneline "Limit önerisi" bölümü:

- Her görünür kategori için son 3 tam ayın **medyanı** hesaplanır (medyan, tek seferlik büyük
  harcamalardan ortalamaya göre daha az etkilenir).
- Satırda: kategori · mevcut limit · önerilen limit · **[Uygula]**
- Üstte **[Hepsini uygula]**. Uygulama `S.budgets`'ı günceller, `save()` + `renderDash()`.
- Veri olmayan kategoriler (3 ayda 0 harcama) listelenmez.

## Bölüm 6 — Ekstre akışı ve çift kayıt koruması

Ekstre + Gemini akışına dokunulmaz. Tek ekleme: `importStatementRows()` içinde **olası çift**
tespiti.

- Bir içe aktarım satırı, mevcut bir gider kaydıyla aynı tutarda (kuruş toleransı ±1 ₺) ve tarihi
  ±1 gün içindeyse "olası çift" sayılır.
- Bu satırlar sonuç listesinde işaretlenir ve **varsayılan olarak içe aktarılmaz**; kullanıcı
  isterse tek tek işaretleyip alabilir.
- Araçlar'daki ekstre kartının açıklama notu, akışın artık mutabakat amaçlı olduğunu söyler.

---

## Veri Modeli

Tüm alanlar **eklemeli**. Mevcut kayıtların hiçbir alanı değişmez veya silinmez.

| Alan | Yer | Varsayılan | Kalıcılık |
|---|---|---|---|
| `sub.paid` | `S.subs[i]` | `{}` | `ay_subs` (mevcut anahtar) |
| `S.lastBank` | state | `'Havale'` | `ay_lastbank` (yeni anahtar) |

`sub.paid` biçimi:

```js
paid: {
  "2026-08": { expId: "abc123", at: "2026-08-06T10:22:00.000Z" }
}
```

Neden `expId` tutuluyor: "geri al" hangi gideri sileceğini bilsin, ve kullanıcı gideri elle
sildiğinde işaret temizlenebilsin diye. Ay anahtarı (`YYYY-MM`) kullanılır çünkü bir abonelik
ayda bir kez ödenir.

### Migration

- `loadFromStorage()` içinde `S.subs` okunurken `paid` alanı yoksa `{}` atanır. Ayrı bir migration
  adımı gerekmez — okuma noktasında normalize edilir.
- `ay_lastbank` yoksa varsayılan kullanılır.
- Mevcut `migrateV2()` ve `ay_backup_v2` mekanizmasına dokunulmaz.
- `exportData()` / `importData()` `S.subs`'ı bütün olarak taşıdığı için `paid` alanı yedeklere
  kendiliğinden dahil olur; eski yedekler yüklendiğinde `paid` yokluğu okuma sırasında `{}`'a
  normalize edilir.

## Mimari

Mevcut ayrım korunur: **saf hesaplar `calc.js`'te, DOM `app.js`'te.**

`calc.js`'e eklenecek saf fonksiyonlar (hepsi test edilebilir, yan etkisiz):

| Fonksiyon | Girdi → Çıktı |
|---|---|
| `subDueDate(monthKey, dayOfMonth)` | ay + gün → `YYYY-MM-DD` (ay sonu kırpmalı) |
| `subsStatus(subs, monthKey, todayIso)` | → `{rows:[{sub, dueIso, state}], total, paidTotal, pendingTotal}` |
| `dailyAllowance(limit, spent, todayIso)` | → `{remaining, daysLeft, perDay}` veya `null` |
| `afterEntry(spent, limit, amount)` | → `{after, remaining, pct, level}` |
| `suggestLimits(expenses, MK, curIdx, catIds)` | → `{catId: medyan}` |
| `median(nums)` | → sayı |
| `findDuplicates(existing, incoming)` | → içe aktarım satırı indekslerinin kümesi |

`app.js` yalnızca bu fonksiyonları çağırıp HTML üretir. Yeni render fonksiyonları:
`renderSubsStatus()`, `renderAllowance()`, `renderRepeatChips()`, `renderLiveBudget()`,
`renderLimitSuggestions()` — her biri kendi DOM konteynerinden sorumlu, `renderDash()` içinden
çağrılır.

## Hata Durumları

| Durum | Davranış |
|---|---|
| Abonelik günü 31, ay 30 gün | `subDueDate` ayın son gününe kırpar |
| "Ödedim" iki kez basılır | `paid[monthKey]` doluysa düğme "geri al"a döner; çift kayıt oluşmaz |
| Ödeme gideri elle silinir | `delExp` ilgili `paid` işaretini temizler |
| Kategoride limit yok | Canlı şerit "limit yok · belirle" gösterir, hesap yapmaz |
| Aylık limit yok | "Bugün harcanabilir" satırı gizlenir |
| Son 3 ayda veri yok | Kategori limit önerisi listesinde çıkmaz |
| `localStorage` yazma hatası | Mevcut `save()` davranışı — "⚠ hata" göstergesi |

## Test

`test.js` (bağımlılıksız, `node test.js`) mevcut 50 testin üstüne genişletilir. Yeni saf
fonksiyonların her biri için en az mutlu yol + sınır durumu:

- `subDueDate`: normal gün, 31→30/28 kırpma, artık yıl Şubat
- `subsStatus`: ödendi/gecikmiş/bekliyor ayrımı, pasif abonelik hariç, toplamlar
- `dailyAllowance`: limit yok → null, ay sonu (kalan 1 gün), kalan negatif
- `afterEntry`: eşik geçişleri (%89/%90/%100/%101)
- `median`: tek/çift eleman sayısı, boş dizi
- `suggestLimits`: 3 aylık medyan, veri olmayan kategori dışlanır
- `findDuplicates`: aynı gün eşleşme, ±1 gün eşleşme, ±2 gün eşleşmez, tutar toleransı

DOM tarafı manuel doğrulanır (tarayıcıda): kart görünürlüğü, Ödedim → gider oluşumu → geri al,
takvim noktaları, arka arkaya giriş akışı.
