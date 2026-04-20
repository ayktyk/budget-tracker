# Bütçem — Tasarım Sistemi & Uygulama Rehberi

Bu belge, mevcut `index.html` (vanilla HTML/CSS/JS + localStorage) üstünde projenin **görsel ve etkileşimsel** yeniden tasarımını Claude Code'un birebir uygulayabilmesi için yazılmıştır.

**Korunan sözleşmeler (ASLA değiştirme):**
- `localStorage` anahtarları: `ay_exp`, `ay_inc`, `ay_bud`, `ay_theme`, `ay_seed_migrated`, `ay_gemini_key`
- State nesnesi `S` ve yapısı
- Fonksiyon isimleri: `quickAdd`, `favAdd`, `addIncome`, `renderDash`, `renderDashCalendar`, `renderDayList`, `renderBudget`, `renderTxn`, `renderCalendar`, `renderFixed`, `saveGeminiKey`, `callGemini`, `parseStmt`, `parseStatementFallback`, `analyzeAllSpending`, `exportData`, `importData`, `resetAll`, `reseedDemo`
- Veri modeli (gider `{id,d,desc,cat,amt,bank}`, gelir `{id,d,desc,amt,cat,bank}`, bütçe `{kategori: limit}`)
- Kategori kodları (kira, muhasebe, spor, fatura, dijital, market, yemek, eticaret, ulasim, saglik, egitim, eglence, giyim, yatirim, vergi, uyap, nakit, diger + tahsilat, vekalet, danismanlik, avans, diger-gelir)
- UYAP iş kuralı: kişisel gider toplamına dahil edilmez, ayrı "Mesleki" metriği olarak gösterilir
- Chart.js CDN kullanımı
- Aylık ekstre iş akışı: İşbank (ayın 5'i), VakıfBank (11'i), Enpara (23'ü)

**Değişen şeyler:** DOM yapısı, CSS, küçük davranışsal iyileştirmeler (hepsi aşağıda).

---

## 1. Tasarım Felsefesi

> Rakam baş kahramandır. Sakin, premium, karaktersiz olmayan. Kullanıcının seçtiği temaya göre krem/onyx/mermer/gece mavisi — **arka plan dahil** tüm UI değişir.

**Prensipler:**
- **Sayı başat.** Net bakiye, gelir/gider, bütçe yüzdesi — serif veya mono, büyük, tabular.
- **Renk az, anlamlı.** Tek ana ton + pozitif + negatif + UYAP moru. Stok ikon yok, emoji yok.
- **Tipografi hiyerarşisi.** Serif = başlık ve büyük rakam. Sans = UI metni. Mono = satır içi para.
- **Nefes alan boşluk.** Kart içi 18–22px padding, kartlar arası 12–14px.
- **Kategori dili: monogram + renk noktası.** Her kategori tek harfli Türkçe monogram ve küçük bir renk noktası.

---

## 2. Dört Tema — Arka Planla Birlikte Değişir

**KRİTİK:** Tema değiştiğinde sadece kartlar değil, **sayfanın arka planı (`--bg`) da değişir**. `<html data-theme="onyx">` kök elemana attribute set edilince tüm CSS değişkenleri güncellenir; sayfanın zemininden buton renklerine, tab bar'a ve scroll çubuğuna kadar her şey tema ile uyumlanır.

### 2.1 CSS değişkenleri — tüm temalar

`<style>` bloğunun EN ÜSTÜNE:

```css
:root {
  /* type */
  --f-serif: "Instrument Serif", Georgia, serif;
  --f-sans: "Inter Tight", -apple-system, system-ui, sans-serif;
  --f-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;

  /* spacing */
  --s-1: 4px; --s-2: 8px; --s-3: 12px; --s-4: 16px;
  --s-5: 20px; --s-6: 24px; --s-7: 32px; --s-8: 40px;

  /* radii */
  --r-s: 10px; --r-m: 16px; --r-l: 22px; --r-xl: 28px;

  /* shadows (tema başına override olur) */
  --shadow-1: 0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04);
  --shadow-2: 0 8px 28px rgba(0,0,0,0.10);
}

/* THEME 1 · Krem Kâğıt (default) — warm cream */
[data-theme="cream"], :root {
  --bg: #f4efe6;
  --bg-elev: #fbf7ef;
  --card: #ffffff;
  --ink: #1c1c1c;
  --ink-2: #4a4a48;
  --ink-3: #8a857d;
  --line: rgba(28,28,28,0.08);
  --line-2: rgba(28,28,28,0.14);
  --pos: #5b7553;         /* sage */
  --pos-soft: #e6ede2;
  --neg: #b8543a;         /* terrakota */
  --neg-soft: #f2e1da;
  --warn: #c4923a;
  --uyap: #6b5b95;
  --uyap-soft: #ece8f2;
  --accent-ring: rgba(91,117,83,0.25);
  color-scheme: light;
}

/* THEME 2 · Onyx & Altın — dark premium (ikon ile birebir uyumlu) */
[data-theme="onyx"] {
  --bg: #0e1117;
  --bg-elev: #161a22;
  --card: #1c2029;
  --ink: #f2ead8;
  --ink-2: #bcb1a0;
  --ink-3: #7a7468;
  --line: rgba(242,234,216,0.07);
  --line-2: rgba(242,234,216,0.14);
  --pos: #c9a765;         /* altın */
  --pos-soft: rgba(217,184,119,0.12);
  --neg: #d8876a;
  --neg-soft: rgba(216,135,106,0.14);
  --warn: #e0b65c;
  --uyap: #9a8bc2;
  --uyap-soft: rgba(154,139,194,0.14);
  --accent-ring: rgba(217,184,119,0.30);
  --shadow-1: 0 1px 2px rgba(0,0,0,0.45), 0 4px 16px rgba(0,0,0,0.25);
  --shadow-2: 0 10px 30px rgba(0,0,0,0.55);
  color-scheme: dark;
}

/* THEME 3 · Mermer — cool light grey */
[data-theme="marble"] {
  --bg: #ecedef;
  --bg-elev: #f4f5f7;
  --card: #ffffff;
  --ink: #141518;
  --ink-2: #45474b;
  --ink-3: #878a90;
  --line: rgba(20,21,24,0.07);
  --line-2: rgba(20,21,24,0.13);
  --pos: #3d6a4e;
  --pos-soft: #dde9e0;
  --neg: #a64335;
  --neg-soft: #ecdad5;
  --warn: #b78627;
  --uyap: #5b5485;
  --uyap-soft: #e2e0ec;
  --accent-ring: rgba(20,21,24,0.15);
  color-scheme: light;
}

/* THEME 4 · Gece Mavisi — deep navy */
[data-theme="midnight"] {
  --bg: #0d1220;
  --bg-elev: #151b2d;
  --card: #1b2236;
  --ink: #e8ecf5;
  --ink-2: #aeb4c6;
  --ink-3: #6f7692;
  --line: rgba(232,236,245,0.07);
  --line-2: rgba(232,236,245,0.14);
  --pos: #84b19a;
  --pos-soft: rgba(132,177,154,0.14);
  --neg: #d37f7a;
  --neg-soft: rgba(211,127,122,0.14);
  --warn: #d6b366;
  --uyap: #a494d6;
  --uyap-soft: rgba(164,148,214,0.14);
  --accent-ring: rgba(132,177,154,0.28);
  --shadow-1: 0 1px 2px rgba(0,0,0,0.45), 0 4px 16px rgba(0,0,0,0.28);
  --shadow-2: 0 10px 30px rgba(0,0,0,0.55);
  color-scheme: dark;
}

/* Sayfanın kendisi tema-bilinçli */
html, body {
  background: var(--bg);
  color: var(--ink);
  font-family: var(--f-sans);
  transition: background 300ms ease, color 300ms ease;
}
```

### 2.2 Tema uygulama JS (init + toggle)

```js
// Sayfa yüklenirken tercihi uygula
(function initTheme(){
  const t = localStorage.getItem('ay_theme') || 'cream';
  document.documentElement.setAttribute('data-theme', t);
})();

// Detaylar > Görünüm kartındaki seçimde:
function setTheme(t){
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('ay_theme', t);
  // Chart.js varsa tema renkleriyle yeniden çiz:
  if (typeof renderDash === 'function') renderDash();
}
```

### 2.3 Görünüm kartı — Detaylar ekranında

`Detaylar` ekranının EN ÜSTÜNDE (Bütçe'den önce) yeni bir kart:

```html
<div class="card theme-picker">
  <div class="card-h">
    <h3>Görünüm</h3>
    <span class="hint">Anında değişir</span>
  </div>
  <div class="theme-row">
    <button data-theme-pick="cream"     class="theme-chip"><span class="sw" style="background:#f4efe6"></span>Krem Kâğıt</button>
    <button data-theme-pick="onyx"      class="theme-chip"><span class="sw" style="background:#0e1117"></span>Onyx & Altın</button>
    <button data-theme-pick="marble"    class="theme-chip"><span class="sw" style="background:#ecedef"></span>Mermer</button>
    <button data-theme-pick="midnight"  class="theme-chip"><span class="sw" style="background:#0d1220"></span>Gece Mavisi</button>
  </div>
</div>
```

```css
.theme-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.theme-chip { display: flex; align-items: center; gap: 10px; padding: 14px; border-radius: var(--r-m);
  border: 1px solid var(--line-2); background: var(--bg-elev); color: var(--ink); cursor: pointer;
  font: 500 13px/1 var(--f-sans); transition: border-color 150ms; }
.theme-chip[aria-selected="true"] { border-color: var(--ink); box-shadow: 0 0 0 2px var(--accent-ring); }
.theme-chip .sw { width: 18px; height: 18px; border-radius: 9px; border: 1px solid var(--line-2); }
```

`click` handler her butonda `setTheme(btn.dataset.themePick)` çağırır ve `[aria-selected]` rotasyonunu yapar. Sayfa açılışta aktif temayı işaretle.

---

## 3. Tipografi

Google Fonts tek satır:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter+Tight:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

| Rol | Font | Kullanım |
|---|---|---|
| Başlık / büyük rakam | Instrument Serif 400 | H1/H2/H3, net bakiye, ay adı |
| UI metni | Inter Tight 400/500/600 | Butonlar, listeler, etiketler |
| Tabular rakam | JetBrains Mono 400/500 | Liste içi tutarlar, yüzdeler, tarihler |

Rakamlar için her zaman `font-variant-numeric: tabular-nums; letter-spacing: -0.01em;`

**Ölçekler:**
- H1: 40–48px serif (ekran başlıkları)
- H2: 28–32px serif (kart başlıkları)
- H3: 18–20px sans 600 (alt başlık)
- Body: 15px sans 400
- Küçük: 13px sans 500
- Caption / kicker: 11px sans 500, `letter-spacing: .14em`, UPPERCASE, `color: var(--ink-3)`

---

## 4. Kategori Monogramları

18 gider + 5 gelir kategorisinin her biri için tek harfli Türkçe monogram ve renk noktası:

```js
const CAT_META = {
  // gider
  kira:      { mono: "K", color: "#b8543a", label: "Kira" },
  muhasebe:  { mono: "M", color: "#6b5b95", label: "Muhasebe" },
  spor:      { mono: "S", color: "#5b7553", label: "Spor" },
  fatura:    { mono: "F", color: "#c4923a", label: "Fatura" },
  dijital:   { mono: "D", color: "#5b8aa6", label: "Dijital" },
  market:    { mono: "M", color: "#8aa86b", label: "Market" },
  yemek:     { mono: "Y", color: "#c97d4a", label: "Yemek" },
  eticaret:  { mono: "E", color: "#9b5ba6", label: "E-ticaret" },
  ulasim:    { mono: "U", color: "#4a7a8a", label: "Ulaşım" },
  saglik:    { mono: "S", color: "#a85b7d", label: "Sağlık" },
  egitim:    { mono: "E", color: "#5b6a95", label: "Eğitim" },
  eglence:   { mono: "E", color: "#c9a75b", label: "Eğlence" },
  giyim:     { mono: "G", color: "#8a5b6b", label: "Giyim" },
  yatirim:   { mono: "Y", color: "#3d6a4e", label: "Yatırım" },
  vergi:     { mono: "V", color: "#6b3d4e", label: "Vergi" },
  uyap:      { mono: "U", color: "#6b5b95", label: "UYAP" },
  nakit:     { mono: "N", color: "#8a857d", label: "Nakit" },
  diger:     { mono: "D", color: "#8a857d", label: "Diğer" },
  // gelir
  tahsilat:     { mono: "T", color: "#5b7553", label: "Tahsilat" },
  vekalet:      { mono: "V", color: "#3d6a4e", label: "Vekalet" },
  danismanlik:  { mono: "D", color: "#4a7a8a", label: "Danışmanlık" },
  avans:        { mono: "A", color: "#c4923a", label: "Avans" },
  "diger-gelir":{ mono: "D", color: "#8a857d", label: "Diğer" },
};
```

**Monogram chip render:**

```html
<div class="mono-chip">
  <span class="dot" style="background: var(--dot)"></span>
  <span class="m">K</span>
</div>
```

```css
.mono-chip { width: 36px; height: 36px; border-radius: 18px; background: var(--bg-elev);
  border: 1px solid var(--line); display: flex; align-items: center; justify-content: center;
  position: relative; flex-shrink: 0; }
.mono-chip .dot { position: absolute; top: 4px; right: 4px; width: 6px; height: 6px;
  border-radius: 3px; }
.mono-chip .m { font: 400 18px/1 var(--f-serif); color: var(--ink); }
```

---

## 5. Bileşen Kütüphanesi

### 5.1 Kart
```css
.card { background: var(--card); border: 1px solid var(--line); border-radius: var(--r-l);
  padding: 20px; box-shadow: var(--shadow-1); }
.card + .card { margin-top: 12px; }
.card-h { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 14px; }
.card-h h3 { font: 400 20px/1 var(--f-serif); margin: 0; }
.card-h .hint { font: 500 11px/1 var(--f-sans); color: var(--ink-3);
  letter-spacing: .14em; text-transform: uppercase; }
```

### 5.2 Buton hiyerarşisi
```css
.btn { font: 500 14px/1 var(--f-sans); padding: 12px 18px; border-radius: var(--r-m);
  border: 1px solid transparent; cursor: pointer; display: inline-flex; align-items: center;
  gap: 8px; transition: transform 120ms, background 150ms; }
.btn:active { transform: translateY(1px); }
.btn-primary { background: var(--ink); color: var(--bg); }
.btn-secondary { background: transparent; color: var(--ink); border-color: var(--line-2); }
.btn-ghost { background: transparent; color: var(--ink-2); }
.btn-danger { background: var(--neg-soft); color: var(--neg); }
```

### 5.3 Chip
```css
.chip { padding: 8px 14px; border-radius: 22px; border: 1px solid var(--line-2);
  background: var(--bg-elev); font: 500 13px/1 var(--f-sans); color: var(--ink);
  cursor: pointer; }
.chip[aria-selected="true"] { background: var(--ink); color: var(--bg); border-color: var(--ink); }
.chip[data-variant="uyap"] { background: var(--uyap-soft); color: var(--uyap); border-color: transparent; }
```

### 5.4 Input / Numpad
```css
.input { width: 100%; padding: 14px 16px; border-radius: var(--r-m);
  border: 1px solid var(--line-2); background: var(--bg-elev);
  font: 400 15px/1.3 var(--f-sans); color: var(--ink); }
.input:focus { outline: none; border-color: var(--ink); box-shadow: 0 0 0 3px var(--accent-ring); }
.amount-big { font: 400 72px/1 var(--f-serif); color: var(--ink); text-align: center;
  letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
```

---

## 6. Ekran-Ekran Spesifikasyon

### 6.1 Ana Sayfa (`renderDash`)

**Üst bar:** Bütçem B-monogramı (ink kutu içinde), "Ay · Nisan 2026" kicker + serif başlık, sağda menü noktaları.

**Hero Net Bakiye kartı:**
- `kicker`: "NET BAKİYE · NİSAN"
- 56px serif rakam (tabular); pozitif → `var(--pos)`, negatif → `var(--neg)`
- Altında satır: "Gelir `+₺45.200`  ·  Kişisel Gider `−₺18.500`  ·  UYAP `₺6.800`" — UYAP ayrı mor rozet

**Hedef bar:**
- 30.000 TL hedefe kalan (veya aşan)
- 6px yükseklikli bar, dolgu `var(--pos)` veya aşım için `var(--neg)`

**Sparkbar (6 ay):**
- Son 6 ayın gider toplamları mini sütun, son ay accent
- Yüksekliği `max` normalize, her sütun altında ay kısaltması

**Takvim:**
- Ay grid (7 kolon), her gün küçük bir kare; gider olan günlerde alt noktada `var(--neg)`, gelir olan günlerde `var(--pos)`. Seçili gün kutu içi `var(--ink)` dolgu.

**Gün listesi:** Seçili günün gelir/gider satırları — monogram chip + açıklama + banka rozeti + tutar.

**Bütçe uyarıları:** Sadece %70+ olanlar, tek satır: monogram + kategori · yüzde · bar.

### 6.2 Hızlı Giriş (`quickAdd` + `favAdd`)

**Tutar öncelikli:**
- En üstte 72px serif `₺0` (tutar büyüdükçe rakam küçülmez, overflow ellipsis var)
- Altında numpad (0–9, sil, virgül)
- Numpad'in altında form alanları:
  - Açıklama (input)
  - Tarih (date picker, varsayılan bugün)
  - Kaynak (chip row: Havale · Nakit · İşbank · Enpara · VakıfBank)
  - Kategori (chip grid: 18 kategori, monogram chip + isim)
- En altta **Kaydet** btn-primary, full width

**Sık havaleler şeridi (ekranın en üstünde, tutar-alanının üstünde):**
- "SIK HAVALE" kicker
- 4 ön tanımlı kart (İbrahim Yaman, Metin Sağır, Tuğay Tuna, Ahmet Korkmaz) — tek dokunuşla `favAdd()` çağırır, dokunuşta kartta `✓ eklendi` micro-animasyonu

### 6.3 Gelirler (`addIncome`)

**Başlık kartı:** "Gelirler · Nisan 2026" + dönem toplamı büyük serif rakamla `var(--pos)` renkte.

**Ay filtresi chip row:** Ocak–Aralık (aktif ay seçili).

**Ekle butonu:** Sağ üstte `+ Ekle` → bottom sheet açar:
- Tutar (numpad)
- Müvekkil / Açıklama
- Gelir kategorisi (chip grid: Tahsilat · Vekalet · Danışmanlık · Avans · Diğer)
- Hesap (chip: Havale · Nakit · İşbank · Enpara · VakıfBank)
- Tarih
- **Kaydet** btn-primary

**Liste:** Her satır → monogram chip + müvekkil/açıklama + kategori alt metni + `+₺15.000` sağda büyük mono yeşil.

### 6.4 Detaylar (`more`)

Sekmeler yerine tek kolonda **kartlar dizisi**:

**A. Görünüm** (yeni — §2.3'teki kart)

**B. Bütçe** (`renderBudget`)
- Her kategori için: monogram + isim + son 3 ay ortalaması mono rakam + limit input + horizontal bar (`var(--pos)` %0–69, `var(--warn)` %70–89, `var(--neg)` %90+)
- UYAP ve Diğer bu listede **yok** (iş kuralı)

**C. İşlemler** (`renderTxn`)
- Filtre: ay chip row + kategori chip row (çoklu seçim)
- Liste: monogram + açıklama + banka mikrorozet + tarih küçük · sağda tutar
- Swipe-to-delete veya satıra tıklanınca bottom sheet "Sil"

**D. Takvim** (`renderCalendar`)
- Aylık grid + yaklaşan ödeme kartları
- "Ekstre İş Akışı" kartı — 3 satır: İşbank (5'i), VakıfBank (11'i), Enpara (23'ü); bugünkü/geçmiş/yaklaşan durumu renkle kodlu

**E. Sabit Giderler** (`renderFixed`)
- Read-only liste: ev kirası, ofis kirası, halısaha, muhasebe, pazar alışverişi, ofis fatura payı, ev fatura paketi, dijital abonelikler
- Her satır: isim + tahmini tutar mono rakam

**F. Ekstre Yükle + AI** (`parseStmt` + `callGemini` + `parseStatementFallback`)

Kartta iki aşama:

1. **API Anahtarı satırı (collapsible):**
   - Input placeholder: `Gemini API Key (yalnızca cihazınızda saklanır)`
   - Kaydet butonu → `saveGeminiKey()` → `localStorage.setItem('ay_gemini_key', val)`
   - Anahtar varsa maskelenmiş gösterilir: `AIzaSy••••••••kR3` + "Değiştir" ghost btn

2. **Ekstre alanı:**
   - Banka chip row: İşbank · VakıfBank · Enpara (aktif banka seçili)
   - Büyük `<textarea>` (min-height 160px, mono font, 12px): "Ekstre metnini buraya yapıştır"
   - Alt satır: **İçe Aktar** btn-primary (tam genişlik)
   - Tıklandığında:
     - Anahtar yoksa → "Önce Gemini anahtarı ekleyin veya fallback ile devam edin" + **Fallback ile Dene** linki
     - Anahtar varsa → Gemini çağrılır; başarılı → "N işlem bulundu, ekle" önizlemesi; başarısız → otomatik fallback'e düşer ve "AI başarısız oldu, yerel parser kullanıldı" ipucu
   - Önizleme: her satır → monogram + tahmini kategori + açıklama + tutar. Checkbox ile satır satır onaylanır. **Seçilenleri Ekle** btn-primary.

3. **Genel Harcama Analizi** (`analyzeAllSpending`) — aynı kartın altında ayrı bir **sub-card**:
   - Başlık: "Genel Harcama Analizi" + hint "Son 6 ayı Gemini'ye yorumlatır"
   - btn-secondary **Analiz Et** → yükleme ring'i → dolu sonuç 4 bölümle render edilir:
     - **Genel Durum** (2–3 cümle paragraf)
     - **En Fazla Yakan Kalemler** (monogram chip row + mono rakam)
     - **Riskler** (neg-soft arkaplanlı bullet list)
     - **Gelecek Ay Önerileri** (pos-soft arkaplanlı bullet list)
   - "Yeni veri eklemez, sadece yorum üretir" footer hint'i

**G. Veri**
- 4 btn full-width liste: **JSON Yedeği İndir** (primary) · **JSON Yedeği Yükle** (secondary, gizli file input tetikler) · **Demo Verileri Yeniden Ekle** (ghost) · **Tüm Verileri Sıfırla** (btn-danger, iki onay diyaloğu)

### 6.5 Alt navigasyon

4 sekme + ortada FAB:
- Ana · Gelir · **[+]** · Bütçe · Detay
- Floating pill, `var(--card)`, `var(--shadow-2)`, `var(--bg)`'den 14px kenar boşluğu
- Aktif tab: ikon ve etiket `var(--ink)`, pasif: `var(--ink-3)`
- FAB: 56px, `var(--ink)` dolgu, + ikonu `var(--bg)` renginde

---

## 7. AI Akışı — UI Detayları (Gemini + Fallback)

### 7.1 Durumlar (`parseStmt`)
- **Idle:** textarea boş veya yeni içerik girildi — btn-primary etkin
- **Loading:** btn disabled, yerine `Gemini dinliyor…` spinner + kicker
- **Success:** `Çözüldü · N satır` yeşil mini rozet; önizleme listesi kartta açılır
- **Fallback tetiklendi:** sarı bilgi kutusu: "AI başarısız oldu, yerel parser kullanıldı. Kategoriler tahmindir."
- **Error:** kırmızı kutu: hata mesajı + "Fallback ile Dene" linki

### 7.2 Önizleme satırı
```
[ ] (K) KIRA                          12.04.2026    ₺8.500
     İşbank · kart · Elif Yaman
```
- Checkbox
- Monogram chip + tahmini kategori
- Açıklama + banka + tarih
- Tutar mono (neg rengi)
- Satıra tıklanınca kategori ve tutarı düzenlenebilir bottom sheet açılır

### 7.3 Analiz sonucu — render şablonu

```html
<div class="ai-result">
  <div class="ai-sec">
    <h4>Genel Durum</h4>
    <p>[gemini paragrafı]</p>
  </div>
  <div class="ai-sec">
    <h4>En Fazla Yakan 5 Kalem</h4>
    <ul class="ai-rank">
      <li><span class="mono-chip">...</span> Kira <span class="amt">₺8.500</span></li>
      ...
    </ul>
  </div>
  <div class="ai-sec neg">
    <h4>Riskler</h4>
    <ul>...</ul>
  </div>
  <div class="ai-sec pos">
    <h4>Önerilen Aksiyonlar</h4>
    <ul>...</ul>
  </div>
</div>
```

```css
.ai-sec { padding: 14px 16px; border-radius: var(--r-m); background: var(--bg-elev);
  border: 1px solid var(--line); margin-bottom: 10px; }
.ai-sec.neg { background: var(--neg-soft); border-color: transparent; }
.ai-sec.pos { background: var(--pos-soft); border-color: transparent; }
.ai-sec h4 { font: 400 18px/1 var(--f-serif); margin: 0 0 8px; }
.ai-sec p, .ai-sec li { font: 400 14px/1.5 var(--f-sans); color: var(--ink-2); }
```

---

## 8. Chart.js — Tema Uyumlu Renkler

`renderDash` içinde Chart.js oluştururken renkleri doğrudan CSS değişkenlerinden oku:

```js
function cssVar(n){ return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }

const trendChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: months,
    datasets: [
      { label: 'Gelir', data: incomes, borderColor: cssVar('--pos'), backgroundColor: cssVar('--pos-soft'),
        fill: true, tension: 0.3, borderWidth: 2, pointRadius: 3 },
      { label: 'Gider', data: expenses, borderColor: cssVar('--neg'), backgroundColor: cssVar('--neg-soft'),
        fill: true, tension: 0.3, borderWidth: 2, pointRadius: 3 },
    ]
  },
  options: {
    plugins: { legend: { labels: { color: cssVar('--ink-2'), font: { family: 'Inter Tight' } } } },
    scales: {
      x: { ticks: { color: cssVar('--ink-3'), font: { family: 'JetBrains Mono', size: 10 } },
           grid: { color: cssVar('--line') } },
      y: { ticks: { color: cssVar('--ink-3'), font: { family: 'JetBrains Mono', size: 10 } },
           grid: { color: cssVar('--line') } },
    }
  }
});
```

`setTheme()` çağrıldığında mevcut chart instance'larını `chart.destroy()` edip yeniden `renderDash()` çağır.

---

## 9. PWA İkonu & Manifest

`icon.svg` — onyx zemin · altın degrade · üç sütun · yükselen ok (düzgün üçgen uç) · merkezde ₺ madalyonu. Saf SVG, her boyutta net.

```json
// manifest.json
{
  "name": "Bütçem",
  "short_name": "Bütçem",
  "description": "Kişisel & mesleki bütçe takibi",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#0e1117",
  "theme_color": "#0e1117",
  "icons": [
    { "src": "icon.svg", "type": "image/svg+xml", "sizes": "any", "purpose": "any" },
    { "src": "icon.svg", "type": "image/svg+xml", "sizes": "any", "purpose": "maskable" }
  ]
}
```

`<meta name="theme-color">` — HTML'de tema ile senkronize:

```html
<meta name="theme-color" content="#f4efe6" id="meta-theme">
```

```js
function setTheme(t){
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('ay_theme', t);
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
  document.getElementById('meta-theme').setAttribute('content', bg);
  // + Chart.js rerender...
}
```

---

## 10. Mikro-Etkileşimler

- **Liste satırı:** hover/tap'te background `var(--bg-elev)` geçişi 120ms
- **Kart kaydetme:** başarılı kayıt sonrası kartın kenarında 800ms `var(--pos)` ring flash
- **Numpad dokunuş:** 80ms `transform: scale(0.96)`
- **Sheet açılışı:** `translateY(100%) → 0` spring easing `cubic-bezier(0.22, 1, 0.36, 1)` 320ms
- **Tema değişimi:** `html`/`body` `transition: background 300ms ease, color 300ms ease`
- **Sık havale kartı dokunuşu:** 600ms "✓ eklendi" overlay sonrası geri normal

---

## 11. Uygulama Sırası (Claude Code için adım adım)

1. **Google Fonts** linklerini `<head>`'e ekle (§3).
2. **Design tokens + 4 tema bloğu**nu `<style>`'ın en tepesine ekle (§2.1).
3. `<html>` tag'ine `data-theme` set eden init IIFE'yi `<head>`'in en sonuna ekle (§2.2).
4. Tüm eski renk hex'lerini `var(--*)` değişkenlerine dönüştür. Özellikle kart arka planları `var(--card)`, metin `var(--ink)`, border `var(--line)`.
5. **Kategori meta tablosunu** JS'e ekle, `renderDash`/`renderTxn`/`renderBudget` içindeki emoji/ikon kullanımını monogram chip HTML'iyle değiştir (§4).
6. **Bileşen CSS'lerini** ekle: `.card`, `.btn*`, `.chip`, `.input`, `.amount-big`, `.mono-chip` (§5).
7. **Ana Sayfa** DOM'unu §6.1'e göre yeniden düzenle — Hero net bakiye + hedef bar + sparkbar + takvim + gün listesi + bütçe uyarıları.
8. **Hızlı Giriş**'i §6.2'ye göre yeniden düzenle — tutar en üstte 72px, sık havaleler şerit, chip rowları.
9. **Gelirler**'i §6.3'e göre yeniden düzenle.
10. **Detaylar** ekranını sekmeden tek sütun kart dizisine geçir. **İlk kart Görünüm** (§2.3). Sonra Bütçe, İşlemler, Takvim, Sabit Giderler, Ekstre Yükle + AI, Veri (§6.4).
11. **Ekstre Yükle kartını** §6.4-F ve §7'ye göre yeniden kur — API key satırı + banka chip'leri + textarea + önizleme + fallback uyarısı + analiz sub-card.
12. **Tab bar'ı** §6.5'e göre floating pill'e çevir.
13. **Chart.js**'i §8'e göre CSS değişkenli hale getir ve `setTheme()` içinde rerender zincirine bağla.
14. **icon.svg**'yi repo köküne koy, `manifest.json`'u §9'a göre güncelle, `<meta name="theme-color">` senkronunu ekle.
15. **İlk-açılış demo seed** davranışını ekran başına hatırlatıcı bir **dismiss edilebilir banner**'a bağla (Detaylar > Veri'ye link).
16. `ay_theme` migration: eski değerler varsa mapping (örn. `"dark"` → `"onyx"`).
17. Tüm testler: her 4 temada Ana/Hızlı Giriş/Gelirler/Detaylar ekranlarını aç, Chart.js renkleri doğrula, tema değiştir ve localStorage'ın güncellendiğini doğrula.

---

## 12. Kabul Kriterleri

- [ ] 4 tema (`cream`, `onyx`, `marble`, `midnight`) Detaylar → Görünüm'den seçiliyor ve **arka plan dahil** anında değişiyor.
- [ ] `localStorage.ay_theme` seçime göre güncelleniyor; sayfa yenilendiğinde kalıcı.
- [ ] `<meta name="theme-color">` her tema ile senkron.
- [ ] Hiçbir ekranda emoji, stok ikon veya hazır-paket icon font yok.
- [ ] Kategoriler tek harfli Türkçe monogram + renk noktası ile gösteriliyor.
- [ ] Hero net bakiye rakamı serif ve 56px+.
- [ ] Hızlı Giriş'te tutar en üstte 72px serif ve tutar-öncelikli.
- [ ] Ekstre Yükle kartında Gemini key inputu + banka chip'leri + önizleme + fallback uyarısı çalışıyor.
- [ ] Genel Harcama Analizi butonu sonuç kartını 4 bölümde (Durum / Kalemler / Riskler / Öneriler) render ediyor.
- [ ] UYAP kategorisi dashboard kişisel gider toplamına dahil değil; ayrı mor rozetle "Mesleki" olarak gösteriliyor.
- [ ] Chart.js renkleri CSS değişkenlerinden okunuyor; tema değiştiğinde yeniden çiziliyor.
- [ ] Tab bar floating pill, ortada FAB, temaya göre uyumlu.
- [ ] İkon repo kökünde `icon.svg`, manifest ve theme-color doğru bağlı.

---

## 13. Korunan Sözleşmeler Listesi (tekrar)

**Asla değiştirme:** `S`, `loadFromStorage`, `save`, `localStorage` key'leri, fonksiyon isimleri, veri modeli alan adları (`id`, `d`, `desc`, `cat`, `amt`, `bank`), kategori kodları, UYAP iş kuralı, 6 aylık pencere mantığı, Gemini endpoint çağrı akışı, fallback parser stratejisi, ekstre iş akışı (5 / 11 / 23).
