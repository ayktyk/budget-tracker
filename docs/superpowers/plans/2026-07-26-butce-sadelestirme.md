# Bütçe Takip Sadeleştirme — Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Çalışan bütçe uygulamasının okuma katmanını yeniden kurmak — ana ekranı 9 karttan 5 karta indirip "param nereye gidiyor ve neyi kısabilirim" sorusunu tek bakışta cevaplar hâle getirmek, hiçbir özelliği silmeden.

**Architecture:** Tek dosyalık `index.html` (4.387 satır) dörde bölünür: `index.html` (iskelet), `app.css`, `calc.js` (yan etkisiz saf hesaplar), `app.js` (render + etkileşim). Yeni hesaplar `calc.js` içinde TDD ile yazılır ve `node test.js` ile doğrulanır. Render katmanı bu saf fonksiyonları tüketir. `localStorage` şeması hiç değişmez.

**Tech Stack:** Saf HTML/CSS/JavaScript (framework yok, build adımı yok), Chart.js 4.4.1 (CDN), Node 24 (yalnızca test koşturmak için), Vercel statik deploy.

Tasarım dokümanı: `docs/superpowers/specs/2026-07-26-butce-sadelestirme-design.md`

## Global Constraints

- **Build adımı eklenmez.** `npm install`, bundler, transpiler yok. `type="module"` kullanılmaz — script'ler klasik sırayla yüklenir ki uygulama `file://` ile de açılabilsin.
- **`localStorage` şeması değişmez.** Anahtarlar: `ay_exp`, `ay_inc`, `ay_bud`, `ay_gemini_key`, `ay_theme`, `ay_migrated_v2`. Kayıt alanları (`{id, d, desc, cat, amt, bank}`) aynen korunur.
- **Hiçbir özellik silinmez.** Kaldırılan her kart/panel başka bir yüzeye taşınır.
- **UYAP gider toplamına dahil edilmez.** Mevcut `monthP()` davranışı (`e.cat!=='uyap'`) korunur; UYAP ayrı ve nötr satır olarak gösterilir.
- **Dil Türkçe.** Tüm kullanıcıya görünen metinler Türkçe. Para formatı `tr-TR`, para birimi `₺` (rakamdan sonra, boşlukla: `12.480 ₺`).
- **Her task ayrı commit.** Commit mesajı `<type>: <açıklama>` formatında (feat/fix/refactor/docs/test/chore).
- **Çalışma dalı:** `sadelestirme`. `main` dalına dokunulmaz.
- **Sabitler:** `MN` = 6 aylık pencerenin ay adları dizisi, `MK` = `YYYY-MM` anahtarları, `CUR_IDX = 5` (içinde bulunulan ay her zaman son slot).

---

### Task 1: Güvenlik ağı — yedek, arşiv, deploy düzeltmesi

Kod değiştirmeden önce geri dönüş yollarını açar. Bu task'ın çıktısı: veri yedeği alınmış, repo temizlenmiş, deploy config'i düzelmiş bir başlangıç noktası.

**Files:**
- Create: `arsiv/` (klasör)
- Move: `index.html.backup-20260416-210950`, `index.html.backup-before-swap-20260416-214040`, `index.html.backup-before-v2-20260422-205045`, `index.html.backup-round1-20260529` → `arsiv/`
- Modify: `vercel.json`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: (yok — ilk task)
- Produces: Temiz repo kökü. Sonraki task'lar `index.html`'in kökteki tek HTML dosyası olduğunu varsayar.

- [ ] **Step 1: Kullanıcıdan canlı veri yedeği iste**

Bu adım otomatikleştirilemez — veri kullanıcının tarayıcısındaki `localStorage`'da, repoda değil.

Kullanıcıya şunu söyle ve **onay gelene kadar bekle**:

> "Uygulamayı aç → Detaylar → Veri → **JSON Yedeği İndir**. İnen dosyayı proje klasörünün DIŞINDA bir yere kopyala (Masaüstü/Belgeler). İndirdim dediğinde devam edeceğim."

- [ ] **Step 2: Mevcut vercel.json'u oku**

Run: `cat vercel.json`

Beklenen içerik:
```json
{ "routes": [ { "src": "/(.*)", "dest": "/public/$1" } ] }
```

Bu route repoda `public/` klasörü olmadığı için tüm istekleri var olmayan bir yola yönlendiriyor.

- [ ] **Step 3: vercel.json'u düzelt**

`vercel.json` içeriğini tamamen şununla değiştir:

```json
{
  "cleanUrls": true,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

Route bloğu tamamen kaldırıldı; Vercel statik dosyaları kökten servis eder — istenen davranış bu.

- [ ] **Step 4: Yedek dosyalarını arşive taşı**

```bash
mkdir -p arsiv
git mv index.html.backup-20260416-210950 arsiv/
git mv index.html.backup-before-swap-20260416-214040 arsiv/
git mv index.html.backup-before-v2-20260422-205045 arsiv/
git mv index.html.backup-round1-20260529 arsiv/
git mv index-preview.html arsiv/
```

Silme yok — dosyalar duruyor, sadece kök dizinden çıkıyor.

- [ ] **Step 5: .gitignore'a yedek deseni ekle**

`.gitignore` dosyasının sonuna ekle:

```
*.backup-*
yedek-*.json
```

- [ ] **Step 6: Uygulamanın hâlâ açıldığını doğrula**

Run: `ls index.html app.css 2>&1; ls arsiv/`

Beklenen: `index.html` var, `app.css` yok (henüz), `arsiv/` içinde 5 dosya.

Ardından `index.html`'i tarayıcıda aç, ana ekranın yüklendiğini gör. Bu task'ta HTML'e dokunulmadı, çalışması gerekir.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: yedekleri arsive tasi, vercel route hatasini duzelt"
```

---

### Task 2: Dosyayı böl — index.html / app.css / app.js

Saf mekanik ayırma. **Hiçbir kod satırı değişmez**, sadece yer değiştirir. Bu task'ın tek başarı kriteri: uygulama bölünme öncesiyle bire bir aynı davranıyor.

**Files:**
- Modify: `index.html` (4.387 satır → ~130 satır)
- Create: `app.css` (`index.html:24-1659` arasındaki `<style>` içeriği)
- Create: `app.js` (`index.html:1727-4385` arasındaki `<script>` içeriği)

**Interfaces:**
- Consumes: Task 1'den temiz repo kökü.
- Produces: `app.css` ve `app.js` dosyaları. Task 3 `calc.js`'i bu yapıya ekler; Task 6+ `app.css`'i, Task 7+ `app.js`'i düzenler.

- [ ] **Step 1: CSS'i ayır**

`index.html` içindeki `<style>` (satır 24) ve `</style>` (satır 1659) etiketleri **arasındaki** içeriği aynen `app.css` dosyasına taşı. `<style>` etiketlerinin kendisi kopyalanmaz.

```bash
sed -n '25,1658p' index.html > app.css
wc -l app.css
```

Beklenen: 1634 satır.

- [ ] **Step 2: JS'i ayır**

`index.html` içindeki `<script>` (satır 1727) ve `</script>` (satır 4385) **arasındaki** içeriği aynen `app.js` dosyasına taşı.

```bash
sed -n '1728,4384p' index.html > app.js
wc -l app.js
```

Beklenen: 2657 satır.

- [ ] **Step 3: index.html'i yeniden yaz**

`index.html`'de artık şunlar kalır: `<head>` meta/link'leri, Chart.js CDN script'i, `app.css` link'i, `<body>` iskeleti (satır 1661-1725 arası mevcut içerik) ve sonda `app.js` script'i.

`<head>` içindeki `<style>...</style>` bloğunun tamamını şununla değiştir:

```html
<link rel="stylesheet" href="app.css">
```

`</body>`'den hemen önceki `<script>...</script>` bloğunun tamamını şununla değiştir:

```html
<script src="app.js" defer></script>
```

**Kritik:** Chart.js CDN script etiketi `<head>` içinde kalır ve `app.js`'ten ÖNCE yüklenmelidir. `app.js` `defer` ile yüklendiği için DOM hazır olduğunda çalışır — mevcut kodun sonundaki başlangıç çağrıları (`loadTheme()`, `loadFromStorage()`, `buildDesignLayout()` vb.) `defer` altında aynen çalışır çünkü script zaten `</body>` sonundaydı.

- [ ] **Step 4: Satır sayılarını doğrula**

Run: `wc -l index.html app.css app.js`

Beklenen: `index.html` ~130 satır, `app.css` 1634, `app.js` 2657. Toplam orijinalden ~1500 satır az olamaz — eğer öyleyse içerik kaybı var, geri al.

- [ ] **Step 5: Uygulamayı tarayıcıda aç ve karşılaştırmalı doğrula**

`index.html`'i tarayıcıda aç. Konsolu aç (F12). Kontrol listesi:

1. Konsolda hata **yok**.
2. Ana ekran yükleniyor, net bakiye rakamı görünüyor.
3. Alt navigasyondaki 5 butonun hepsi ekran değiştiriyor.
4. Hızlı Giriş'te kategori grid'i dolu, numpad çalışıyor.
5. Bütçe ekranında limit çubukları görünüyor.
6. Detaylar ekranında paneller açılıyor.
7. Tema değiştirince renkler anında değişiyor.
8. Trend grafiği (Chart.js) çiziliyor.

Herhangi biri başarısızsa: ayırma sırasında içerik kaybı vardır. `git checkout index.html` ile geri dön ve Step 1'den tekrar başla.

- [ ] **Step 6: Commit**

```bash
git add index.html app.css app.js
git commit -m "refactor: tek dosyayi index.html + app.css + app.js olarak bol"
```

---

### Task 3: calc.js + node test altyapısı + karakterizasyon testleri

Mevcut saf fonksiyonları `calc.js`'e taşır ve **bugünkü davranışlarını** teste bağlar. Bu testler yeni özellik eklemez; sonraki task'larda bir şeyi bozarsak alarm versinler diye var.

**Files:**
- Create: `calc.js`
- Create: `test.js`
- Modify: `app.js` (taşınan fonksiyonların tanımlarını sil)
- Modify: `index.html` (`calc.js` script etiketi ekle)

**Interfaces:**
- Consumes: Task 2'den `app.js`.
- Produces: Global `CALC` nesnesi. Sonraki task'lar yeni saf fonksiyonları bu nesneye ekler. Şu an içerdikleri:
  - `CALC.fmt(n: number) => string` — `Math.round(n).toLocaleString('tr-TR')`
  - `CALC.parseTrNum(v: string|number) => number`
  - `CALC.mIdx(d: string, MK: string[]) => number` — `'YYYY-MM-DD'` → ay indeksi, bulunamazsa `-1`

- [ ] **Step 1: Mevcut parseTrNum gövdesini doğrula**

Run: `sed -n '/^function parseTrNum/,/^}/p' app.js`

Beklenen çıktı:

```js
function parseTrNum(v){
  let s=String(v==null?'':v).trim();
  if(s.indexOf(',')>-1) s=s.replace(/\./g,'').replace(',','.');
  return parseFloat(s);
}
```

Farklıysa **dur** ve gerçek gövdeyi kullan; aşağıdaki testleri gerçeğe göre düzelt.

**Bu fonksiyonun bilinen iki kusuru var. İkisi de bu planda DÜZELTİLMEZ** — testler bugünkü
davranışı kayda geçirir (karakterizasyon testi). Düzeltmek ayrı bir iş, çünkü giriş akışını
etkiler ve ayrı doğrulama ister:

1. `parseTrNum('')` → `NaN` (0 değil).
2. `parseTrNum('1.234')` → `1.234` (1234 değil). Virgül yoksa nokta ondalık ayraç sayılıyor.
   Kullanıcı binlik ayraçla "1.234" yazarsa 1.234 ₺ kaydedilir.

İkinci madde gerçek bir para hatası. Task 13 bittikten sonra kullanıcıya ayrıca bildir.

- [ ] **Step 2: Başarısız olan testi yaz**

Bu task bir taşıma + karakterizasyon işi, ama kırmızı faz yine de gerçek: `test.js` önce
yazılır, `calc.js` henüz var olmadığı için `require` hata verir.

`test.js` dosyasını oluştur:

```js
// node test.js — bağımlılıksız assert runner
const CALC = require('./calc.js');

let pass = 0, fail = 0;
function eq(actual, expected, name) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a === e) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + '\n    beklenen: ' + e + '\n    gelen:    ' + a); }
}

console.log('\nfmt');
eq(CALC.fmt(12480), '12.480', 'binlik ayraci nokta');
eq(CALC.fmt(12480.4), '12.480', 'asagi yuvarlar');
eq(CALC.fmt(12480.6), '12.481', 'yukari yuvarlar');
eq(CALC.fmt(0), '0', 'sifir');

console.log('\nparseTrNum (karakterizasyon — bugunku davranis)');
eq(CALC.parseTrNum('1.234,56'), 1234.56, 'tam TR formati');
eq(CALC.parseTrNum('350'), 350, 'duz tamsayi');
eq(CALC.parseTrNum('0,5'), 0.5, 'ondalik virgul');
eq(Number.isNaN(CALC.parseTrNum('')), true, 'BILINEN KUSUR: bos metin NaN doner');
eq(CALC.parseTrNum('1.234'), 1.234, 'BILINEN KUSUR: virgulsuz nokta ondalik sayilir');

console.log('\nmIdx');
const MK = ['2026-02','2026-03','2026-04','2026-05','2026-06','2026-07'];
eq(CALC.mIdx('2026-07-15', MK), 5, 'son ay');
eq(CALC.mIdx('2026-02-01', MK), 0, 'ilk ay');
eq(CALC.mIdx('2025-01-01', MK), -1, 'pencere disi -1');
eq(CALC.mIdx(null, MK), -1, 'null -1');

console.log('\n' + pass + ' gecti, ' + fail + ' kaldi');
process.exit(fail > 0 ? 1 : 0);
```

- [ ] **Step 3: Testi çalıştır, başarısız olduğunu gör**

Run: `node test.js`

Beklenen: `Error: Cannot find module './calc.js'` — dosya henüz yok.

- [ ] **Step 4: calc.js'i oluştur**

```js
// ══════════════════════════════════════════════════════════════
// CALC — saf hesaplar. DOM yok, localStorage yok, yan etki yok.
// Hem tarayıcıda (global CALC) hem Node'da (module.exports) çalışır.
// ══════════════════════════════════════════════════════════════
var CALC = (function () {

  // Para biçimi: 12480.4 → "12.480"
  function fmt(n) {
    return Math.round(n).toLocaleString('tr-TR');
  }

  // Türkçe sayı metnini sayıya çevirir: "1.234,56" → 1234.56
  // NOT: Gövde app.js'ten BİREBİR taşındı. Bilinen kusurları korunuyor
  // (bkz. plan Task 3 Step 1) — bu planda davranış değiştirilmiyor.
  function parseTrNum(v) {
    var s = String(v == null ? '' : v).trim();
    if (s.indexOf(',') > -1) s = s.replace(/\./g, '').replace(',', '.');
    return parseFloat(s);
  }

  // 'YYYY-MM-DD' tarihini ay penceresi indeksine çevirir. Yoksa -1.
  function mIdx(d, MK) {
    return MK.indexOf(String(d || '').slice(0, 7));
  }

  return { fmt: fmt, parseTrNum: parseTrNum, mIdx: mIdx };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = CALC;
```

- [ ] **Step 5: Testin geçtiğini doğrula**

Run: `node test.js`

Beklenen: `13 gecti, 0 kaldi`, çıkış kodu 0.

Bir test kalırsa: `calc.js`'teki gövde `app.js`'tekiyle birebir aynı değildir. Kodu değil,
testi gerçeğe uydur — bu bir karakterizasyon testi, davranışı iyileştirmiyor.

- [ ] **Step 6: app.js'ten taşınan tanımları sil, index.html'e calc.js'i ekle**

`app.js` içinden şu üç tanımı sil (artık `calc.js`'te):
- `const fmt=n=>Math.round(n).toLocaleString('tr-TR');`
- `const mIdx=d=>MK.indexOf((d||'').slice(0,7));`
- `function parseTrNum(v){...}`

Yerine `app.js`'in en üstüne köprü satırlarını ekle (mevcut ~200 çağrı yerinde kalsın diye):

```js
// calc.js'ten gelen saf hesaplar — mevcut çağrı yerleri değişmesin diye kısa adlar
const fmt = CALC.fmt;
const parseTrNum = CALC.parseTrNum;
const mIdx = d => CALC.mIdx(d, MK);
```

**Dikkat:** `MK` sabiti `app.js` içinde tanımlı ve `mIdx` köprüsü onu kapatarak (closure) kullanıyor. Bu satırlar `MK` tanımından SONRA gelmeli.

`index.html`'de `app.js`'ten ÖNCE `calc.js`'i yükle:

```html
<script src="calc.js" defer></script>
<script src="app.js" defer></script>
```

- [ ] **Step 7: Tarayıcıda regresyon kontrolü**

Uygulamayı aç. Kontrol: net bakiye rakamı doğru biçimlenmiş (`12.480 ₺`), ay filtreleri çalışıyor, konsolda hata yok.

- [ ] **Step 8: Commit**

```bash
git add calc.js test.js app.js index.html
git commit -m "test: calc.js saf hesap katmani ve node test altyapisi"
```

---

### Task 4: Grup haritası, groupOf ve groupTotals (TDD)

Dağılım kartının veri temeli. UYAP hariç tutma kuralı burada yaşar.

**Files:**
- Modify: `calc.js`
- Modify: `test.js`
- Modify: `app.js` (`CATS` tanımına `group` alanı ekle)

**Interfaces:**
- Consumes: `CALC.mIdx`
- Produces:
  - `CALC.GROUPS: {id: string, label: string}[]` — sabit grup listesi, gösterim sırası bu dizideki sıra değil, tutara göre sıralanır.
  - `CALC.groupOf(catId: string, catGroupMap: {[catId]: string}) => string` — kategori id'sinden grup id'si; eşleşme yoksa `'ungrouped'`.
  - `CALC.groupTotals(expenses, monthIdx, MK, catGroupMap) => {groups: {id, label, total}[], total: number, uyap: number}` — `groups` tutara göre azalan sıralı, sıfır tutarlı gruplar dışarıda. `total` UYAP hariç ay toplamı. `uyap` ayrı döner.

- [ ] **Step 1: Başarısız olan testleri yaz**

`test.js` sonuna (`console.log('\n' + pass...)` satırından ÖNCE) ekle:

```js
console.log('\ngroupOf');
const GMAP = {
  kira:'zorunlu', fatura:'zorunlu', vergi:'zorunlu', muhasebe:'zorunlu',
  market:'yasam', yemek:'yasam', ulasim:'yasam', nakit:'yasam',
  eglence:'keyif', giyim:'keyif', eticaret:'keyif', dijital:'keyif', spor:'keyif',
  saglik:'saglik_egitim', egitim:'saglik_egitim',
  yatirim:'yatirim'
};
eq(CALC.groupOf('market', GMAP), 'yasam', 'market -> yasam');
eq(CALC.groupOf('kira', GMAP), 'zorunlu', 'kira -> zorunlu');
eq(CALC.groupOf('diger', GMAP), 'ungrouped', 'diger gruplanmamis');
eq(CALC.groupOf('benim_ozel_kat', GMAP), 'ungrouped', 'custom kategori gruplanmamis');

console.log('\ngroupTotals');
const MK2 = ['2026-02','2026-03','2026-04','2026-05','2026-06','2026-07'];
const EXP = [
  { id:'1', d:'2026-07-03', desc:'SOK',     cat:'market',  amt:1000, bank:'İşbank' },
  { id:'2', d:'2026-07-05', desc:'Yemek',   cat:'yemek',   amt: 500, bank:'İşbank' },
  { id:'3', d:'2026-07-01', desc:'Kira',    cat:'kira',    amt:5000, bank:'Havale' },
  { id:'4', d:'2026-07-12', desc:'UYAP',    cat:'uyap',    amt:9000, bank:'VakıfBank' },
  { id:'5', d:'2026-06-03', desc:'Onceki',  cat:'market',  amt: 700, bank:'İşbank' },
  { id:'6', d:'2026-07-20', desc:'Esans',   cat:'diger',   amt: 300, bank:'Enpara' },
];
const gt = CALC.groupTotals(EXP, 5, MK2, GMAP);
eq(gt.total, 6800, 'ay toplami UYAP haric (1000+500+5000+300)');
eq(gt.uyap, 9000, 'UYAP ayri doner');
eq(gt.groups.map(g => g.id), ['zorunlu','yasam','ungrouped'], 'tutara gore azalan sirali');
eq(gt.groups[0].total, 5000, 'zorunlu 5000');
eq(gt.groups[1].total, 1500, 'yasam 1000+500');
eq(gt.groups[2].total, 300, 'gruplanmamis 300');

const gtEmpty = CALC.groupTotals(EXP, 0, MK2, GMAP);
eq(gtEmpty.total, 0, 'veri olmayan ay sifir');
eq(gtEmpty.groups, [], 'veri olmayan ay bos dizi');
eq(gtEmpty.uyap, 0, 'veri olmayan ay UYAP sifir');
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu gör**

Run: `node test.js`

Beklenen: `groupOf is not a function` benzeri hata veya tüm yeni testler FAIL.

- [ ] **Step 3: calc.js'e minimal implementasyonu yaz**

`calc.js` içinde `return { ... }` satırından ÖNCE ekle:

```js
  // Üst gruplar. Gösterim sırası tutara göre belirlenir; bu dizi sadece etiket kaynağı.
  var GROUPS = [
    { id: 'zorunlu',       label: 'Zorunlu' },
    { id: 'yasam',         label: 'Yaşam' },
    { id: 'keyif',         label: 'Keyif' },
    { id: 'saglik_egitim', label: 'Sağlık-Eğitim' },
    { id: 'yatirim',       label: 'Yatırım' },
    { id: 'ungrouped',     label: 'Gruplanmamış' }
  ];

  function groupOf(catId, catGroupMap) {
    return (catGroupMap && catGroupMap[catId]) || 'ungrouped';
  }

  // UYAP mesleki transferdir, dağılıma girmez — ayrı döner.
  function groupTotals(expenses, monthIdx, MK, catGroupMap) {
    var sums = {}, total = 0, uyap = 0;
    for (var i = 0; i < expenses.length; i++) {
      var e = expenses[i];
      if (mIdx(e.d, MK) !== monthIdx) continue;
      var amt = Number(e.amt) || 0;
      if (e.cat === 'uyap') { uyap += amt; continue; }
      var g = groupOf(e.cat, catGroupMap);
      sums[g] = (sums[g] || 0) + amt;
      total += amt;
    }
    var groups = GROUPS
      .filter(function (g) { return sums[g.id] > 0; })
      .map(function (g) { return { id: g.id, label: g.label, total: sums[g.id] }; })
      .sort(function (a, b) { return b.total - a.total; });
    return { groups: groups, total: total, uyap: uyap };
  }
```

`return` satırını güncelle:

```js
  return { fmt: fmt, parseTrNum: parseTrNum, mIdx: mIdx,
           GROUPS: GROUPS, groupOf: groupOf, groupTotals: groupTotals };
```

- [ ] **Step 4: Testin geçtiğini doğrula**

Run: `node test.js`

Beklenen: tüm testler PASS, çıkış kodu 0.

- [ ] **Step 5: app.js'teki CATS tanımına group alanı ekle**

`app.js` içindeki `const CATS=[...]` bloğunu şununla değiştir (yalnızca `group` alanı eklendi, id/label/icon/color aynen korundu):

```js
const CATS=[
  {id:'kira',     label:'Kira',       icon:'🏠', color:'#6B63E8', group:'zorunlu'},
  {id:'muhasebe', label:'Muhasebe',   icon:'📋', color:'#185FA5', group:'zorunlu'},
  {id:'spor',     label:'Spor',       icon:'⚽', color:'#3EC98A', group:'keyif'},
  {id:'fatura',   label:'Faturalar',  icon:'💡', color:'#E8A83E', group:'zorunlu'},
  {id:'dijital',  label:'Dijital',    icon:'📱', color:'#8B6EE8', group:'keyif'},
  {id:'market',   label:'Market',     icon:'🛒', color:'#4CAF68', group:'yasam'},
  {id:'yemek',    label:'Yemek',      icon:'🍽', color:'#E8603E', group:'yasam'},
  {id:'eticaret', label:'Online Al.', icon:'📦', color:'#888780', group:'keyif'},
  {id:'ulasim',   label:'Ulaşım',     icon:'🚇', color:'#3EC9C4', group:'yasam'},
  {id:'saglik',   label:'Sağlık',     icon:'🏥', color:'#E86E8B', group:'saglik_egitim'},
  {id:'egitim',   label:'Eğitim',     icon:'📚', color:'#5B8DE8', group:'saglik_egitim'},
  {id:'eglence',  label:'Eğlence',    icon:'🎭', color:'#9B9B9B', group:'keyif'},
  {id:'giyim',    label:'Giyim',      icon:'👕', color:'#E05656', group:'keyif'},
  {id:'yatirim',  label:'Yatırım',    icon:'📈', color:'#8BC449', group:'yatirim'},
  {id:'vergi',    label:'Vergi',      icon:'🏛', color:'#E84848', group:'zorunlu'},
  {id:'uyap',     label:'UYAP',       icon:'⚖️', color:'#888',    group:'uyap'},
  {id:'nakit',    label:'Nakit',      icon:'💵', color:'#A0A0A0', group:'yasam'},
  {id:'diger',    label:'Diğer',      icon:'📌', color:'#777',    group:'ungrouped'},
];
```

Aynı bölüme, `getCats()` tanımından sonra ekle:

```js
// Kategori id → grup id haritası. Custom kategorilerde group alanı yoksa 'ungrouped'.
function catGroupMap(){
  const m={};
  getCats().forEach(c=>{ m[c.id]=c.group||'ungrouped'; });
  return m;
}
```

- [ ] **Step 6: Tarayıcıda regresyon kontrolü**

Uygulamayı aç. Kategori grid'i, bütçe çubukları, işlem listesi bugünkü gibi çalışmalı — `group` alanı henüz hiçbir yerde okunmuyor, sadece veri tanımı genişledi.

Konsola yaz: `catGroupMap()` → 18 anahtarlı nesne dönmeli.

- [ ] **Step 7: Commit**

```bash
git add calc.js test.js app.js
git commit -m "feat: kategori ust gruplari ve groupTotals hesabi"
```

---

### Task 5: deltaPct, limitFill ve attentionSignals (TDD)

"Neyi kısabilirim" cevabını üreten hesaplar.

**Files:**
- Modify: `calc.js`
- Modify: `test.js`

**Interfaces:**
- Consumes: `CALC.mIdx`, `CALC.groupOf`, `CALC.groupTotals`
- Produces:
  - `CALC.deltaPct(cur: number, prev: number) => number|null` — yüzde değişim, `prev === 0` ise `null`.
  - `CALC.limitFill(spent: number, limit: number) => number|null` — doluluk yüzdesi, `limit <= 0` ise `null`.
  - `CALC.catTotals(expenses, monthIdx, MK) => {[catId]: number}` — kategori bazlı ay toplamı (UYAP dahil değil).
  - `CALC.attentionSignals(opts) => {kind, label, text}[]` — en fazla 3 eleman. `opts = {expenses, monthIdx, MK, budgets, catLabels}`. `kind` değeri `'limit'`, `'artis'` veya `'ortalama'`. Sinyaller kategori bazlıdır, grup haritası gerekmez.

- [ ] **Step 1: Başarısız olan testleri yaz**

`test.js` sonuna (özet satırından önce) ekle:

```js
console.log('\ndeltaPct');
eq(CALC.deltaPct(1300, 1000), 30, 'yuzde 30 artis');
eq(CALC.deltaPct(700, 1000), -30, 'yuzde 30 azalis');
eq(CALC.deltaPct(1000, 1000), 0, 'degisim yok');
eq(CALC.deltaPct(500, 0), null, 'onceki ay sifir ise null');
eq(CALC.deltaPct(0, 0), null, 'ikisi de sifir ise null');

console.log('\nlimitFill');
eq(CALC.limitFill(7500, 10000), 75, 'yuzde 75 dolu');
eq(CALC.limitFill(12700, 10000), 127, 'asim yuzde 100 ustu');
eq(CALC.limitFill(0, 10000), 0, 'hic harcama yok');
eq(CALC.limitFill(500, 0), null, 'limit yoksa null');

console.log('\ncatTotals');
eq(CALC.catTotals(EXP, 5, MK2), { market:1000, yemek:500, kira:5000, diger:300 }, 'kategori toplamlari UYAP haric');

console.log('\nattentionSignals');
const BUD = { market: 800, kira: 8000, yemek: 5000, diger: 0 };
const LBL = { market:'Market', kira:'Kira', yemek:'Yemek', diger:'Diğer' };
const sig = CALC.attentionSignals({
  expenses: EXP, monthIdx: 5, MK: MK2, budgets: BUD, catLabels: LBL
});
eq(sig.length <= 3, true, 'en fazla 3 sinyal');
eq(sig.some(s => s.kind === 'limit'), true, 'limit asimi yakalanir (market 1000 > 800)');
// EXP'te market: haziran 700 -> temmuz 1000. Artis 300 TL, 500 TL esiginin ALTINDA.
eq(sig.some(s => s.kind === 'artis'), false, '300 TL artis esik altinda, artis sinyali yok');

// Limit tanimli degilken de 300 TL artis sinyal uretmemeli
const sig2 = CALC.attentionSignals({
  expenses: EXP, monthIdx: 5, MK: MK2, budgets: {}, catLabels: LBL
});
eq(sig2.filter(s => s.kind === 'artis').length, 0, '500 TL altindaki artis sinyal uretmez');

// Sinyal yoksa bos dizi
const sig3 = CALC.attentionSignals({
  expenses: [], monthIdx: 5, MK: MK2, budgets: BUD, catLabels: LBL
});
eq(sig3, [], 'veri yoksa bos dizi');

// Ayni kategori iki kez gecmez: market hem limiti asiyor hem 4000 TL artmis
const EXP4 = [
  { id:'a', d:'2026-06-01', desc:'M', cat:'market', amt: 1000, bank:'İşbank' },
  { id:'b', d:'2026-07-01', desc:'M', cat:'market', amt: 5000, bank:'İşbank' },
];
const sig4 = CALC.attentionSignals({
  expenses: EXP4, monthIdx: 5, MK: MK2, budgets: { market: 800 }, catLabels: LBL
});
eq(sig4.filter(s => s.label === 'Market').length, 1, 'ayni kategori tek sinyal');
eq(sig4[0].kind, 'limit', 'oncelik limit asiminda');
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu gör**

Run: `node test.js`

Beklenen: `deltaPct is not a function` ve devamındaki yeni testler FAIL.

- [ ] **Step 3: calc.js'e implementasyonu yaz**

`calc.js` içinde `return { ... }` satırından ÖNCE ekle:

```js
  // Yüzde değişim. Payda 0 ise oran tanımsızdır — null döner, çağıran "yeni" gösterir.
  function deltaPct(cur, prev) {
    if (!prev) return null;
    return Math.round(((cur - prev) / prev) * 100);
  }

  // Limit doluluğu. Limit tanımlı değilse null — çağıran çubuk yerine pay gösterir.
  function limitFill(spent, limit) {
    if (!limit || limit <= 0) return null;
    return Math.round((spent / limit) * 100);
  }

  // Kategori bazlı ay toplamı. UYAP dahil değil (groupTotals ile aynı kural).
  function catTotals(expenses, monthIdx, MK) {
    var out = {};
    for (var i = 0; i < expenses.length; i++) {
      var e = expenses[i];
      if (mIdx(e.d, MK) !== monthIdx) continue;
      if (e.cat === 'uyap') continue;
      out[e.cat] = (out[e.cat] || 0) + (Number(e.amt) || 0);
    }
    return out;
  }

  var ARTIS_TL_ESIK = 500;   // mutlak artış eşiği
  var ARTIS_PCT_ESIK = 20;   // yüzde artış eşiği
  var ORT_PCT_ESIK = 30;     // 6 ay ortalamasının üstü eşiği
  var MAX_SINYAL = 3;

  // Dikkat kartının içeriği. Öncelik: 1) limit aşımı 2) aya göre artış 3) ortalama üstü.
  // Aynı kategori birden fazla satırda geçmez.
  function attentionSignals(o) {
    var cur = catTotals(o.expenses, o.monthIdx, o.MK);
    var prev = o.monthIdx > 0 ? catTotals(o.expenses, o.monthIdx - 1, o.MK) : {};
    var budgets = o.budgets || {};
    var labels = o.catLabels || {};
    var used = {}, out = [];

    function label(cat) { return labels[cat] || cat; }

    // 1) Limit aşımı — aşım tutarına göre azalan
    Object.keys(cur)
      .filter(function (c) { var f = limitFill(cur[c], budgets[c]); return f !== null && f > 100; })
      .sort(function (a, b) { return (cur[b] - budgets[b]) - (cur[a] - budgets[a]); })
      .forEach(function (c) {
        if (used[c] || out.length >= MAX_SINYAL) return;
        used[c] = 1;
        out.push({
          kind: 'limit', label: label(c),
          text: label(c) + ' limiti %' + limitFill(cur[c], budgets[c])
        });
      });

    // 2) Geçen aya göre artış — mutlak artışa göre azalan
    Object.keys(cur)
      .filter(function (c) {
        var d = cur[c] - (prev[c] || 0);
        var p = deltaPct(cur[c], prev[c] || 0);
        return d >= ARTIS_TL_ESIK && p !== null && p >= ARTIS_PCT_ESIK;
      })
      .sort(function (a, b) { return (cur[b] - (prev[b] || 0)) - (cur[a] - (prev[a] || 0)); })
      .forEach(function (c) {
        if (used[c] || out.length >= MAX_SINYAL) return;
        used[c] = 1;
        out.push({
          kind: 'artis', label: label(c),
          text: label(c) + ' geçen aya göre +' + fmt(cur[c] - (prev[c] || 0)) + ' ₺'
        });
      });

    // 3) 6 ay ortalamasının üstü
    Object.keys(cur).forEach(function (c) {
      if (used[c] || out.length >= MAX_SINYAL) return;
      var tot = 0;
      for (var m = 0; m < o.MK.length; m++) tot += (catTotals(o.expenses, m, o.MK)[c] || 0);
      var avg = tot / o.MK.length;
      if (avg > 0 && cur[c] > avg * (1 + ORT_PCT_ESIK / 100)) {
        used[c] = 1;
        out.push({
          kind: 'ortalama', label: label(c),
          text: label(c) + ' 6 ay ortalamasının %' + Math.round(((cur[c] - avg) / avg) * 100) + ' üstünde'
        });
      }
    });

    return out;
  }
```

`return` satırını güncelle:

```js
  return { fmt: fmt, parseTrNum: parseTrNum, mIdx: mIdx,
           GROUPS: GROUPS, groupOf: groupOf, groupTotals: groupTotals,
           deltaPct: deltaPct, limitFill: limitFill, catTotals: catTotals,
           attentionSignals: attentionSignals };
```

- [ ] **Step 4: Testin geçtiğini doğrula**

Run: `node test.js`

Beklenen: tüm testler PASS, çıkış kodu 0.

- [ ] **Step 5: Commit**

```bash
git add calc.js test.js
git commit -m "feat: delta, limit doluluk ve dikkat sinyali hesaplari"
```

---

### Task 6: Tasarım tokenları ve tema sadeleştirmesi

Görsel hiyerarşinin CSS temeli. Sonraki kart task'ları bu tokenları kullanır.

**Files:**
- Modify: `app.css`
- Modify: `app.js` (tema seçici HTML'i — `buildDesignLayout()` içindeki `more-theme` paneli)

**Interfaces:**
- Consumes: (yok)
- Produces: CSS değişkenleri ve yardımcı sınıflar. Sonraki task'lar bunlara güvenir:
  - Boşluk: `--sp-1: 4px`, `--sp-2: 8px`, `--sp-3: 12px`, `--sp-4: 16px`, `--sp-6: 24px`, `--sp-8: 32px`
  - Sınıflar: `.card--primary` (ana kart), `.card--secondary` (ikincil kart), `.num` (tabular rakam), `.delta-up` (kırmızı), `.delta-down` (yeşil), `.delta-none` (nötr)

- [ ] **Step 1: Mevcut CSS değişken bloğunu bul**

Run: `grep -n ":root\|--pos\|--neg\|\[data-theme" app.css | head -20`

Mevcut tema değişkenlerinin nerede tanımlandığını gör. Yeni tokenlar aynı `:root` bloğuna eklenecek.

- [ ] **Step 2: Boşluk ölçeği ve yardımcı sınıfları ekle**

`app.css` içindeki `:root` bloğunun sonuna ekle:

```css
  /* Boşluk ölçeği — tüm yeni kartlar bunu kullanır */
  --sp-1: 4px;
  --sp-2: 8px;
  --sp-3: 12px;
  --sp-4: 16px;
  --sp-6: 24px;
  --sp-8: 32px;
```

`app.css` dosyasının SONUNA ekle:

```css
/* ══ Görsel hiyerarşi — üç kademe ══════════════════════════ */

/* Ana kartlar: Dağılım, Dikkat. Tam kontrast başlık, geniş boşluk. */
.card--primary { padding: var(--sp-6) var(--sp-4); }
.card--primary .card-h h3 { font-size: 17px; font-weight: 650; opacity: 1; }

/* İkincil kartlar: Trend, Takvim. Soluk başlık, dar boşluk. */
.card--secondary { padding: var(--sp-4) var(--sp-4); }
.card--secondary .card-h h3 { font-size: 14px; font-weight: 550; opacity: .62; }

/* ══ Rakam hizalama ════════════════════════════════════════ */
/* Para alanlarında rakamlar sabit genişlikte olsun ki liste okunsun. */
.num, .hero-value, .row-amt, .grp-amt, .grp-limit {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum" 1;
}

/* ══ Delta işaretleri ══════════════════════════════════════ */
/* Özet ekranında renk YALNIZCA anlam taşır: kırmızı artış, yeşil azalış. */
.delta        { font-size: 13px; font-weight: 600; white-space: nowrap; }
.delta-up     { color: var(--neg); }
.delta-down   { color: var(--pos); }
.delta-none   { color: var(--muted, #888); font-weight: 500; }
```

**Not:** `--pos` ve `--neg` değişkenleri mevcut temalarda zaten tanımlı; yeniden tanımlama.

- [ ] **Step 3: Tema seçiciyi 2 temaya indir**

`app.js` içindeki `buildDesignLayout()` fonksiyonunda `more-theme` panelini bul ve `.theme-row` içeriğini şununla değiştir:

```html
<div class="theme-row"><button data-theme-pick="cream" class="theme-chip" onclick="setTheme('cream')"><span class="sw" style="background:#f4efe6"></span>Krem Kâğıt</button><button data-theme-pick="onyx" class="theme-chip" onclick="setTheme('onyx')"><span class="sw" style="background:#0e1117"></span>Onyx &amp; Altın</button></div>
```

`marble`, `midnight`, `papyrus` butonları kaldırıldı. **CSS'leri `app.css`'te aynen duruyor** — geri getirmek bu satıra üç buton eklemekten ibaret.

- [ ] **Step 4: Kayıtlı temanın hâlâ geçerli olduğunu garanti et**

`app.js` içindeki `loadTheme()` fonksiyonunu bul. Kullanıcının `localStorage`'ında `marble`/`midnight`/`papyrus` kayıtlıysa seçici artık o butonu göstermeyecek ama tema uygulanmaya devam edecek — bu kabul edilebilir ve veri kaybı değil. `loadTheme()`'e dokunma.

- [ ] **Step 5: Tarayıcıda doğrula**

Uygulamayı aç → Detaylar → Görünüm. İki tema butonu görünmeli, ikisi de çalışmalı. Diğer ekranlarda görsel bozulma olmamalı (yeni sınıflar henüz hiçbir elemana uygulanmadı).

- [ ] **Step 6: Commit**

```bash
git add app.css app.js
git commit -m "feat: tasarim tokenlari, gorsel hiyerarsi siniflari, tema 5->2"
```

---

### Task 7: Hero kartı — ay seçici ve aylık limit çubuğu

**Files:**
- Modify: `app.js` (`buildDesignLayout()` içindeki `s-dash` şablonu, `renderDash()`, `navDashMonth()`)
- Modify: `app.css`

**Interfaces:**
- Consumes: `CALC.fmt`, `CALC.limitFill`; mevcut `monthI(m)`, `monthP(m)`, `S.dashM`, `S.monthLimit`, `MN`, `MK`, `CUR_IDX`
- Produces: `renderHero()` fonksiyonu — `renderDash()` içinden çağrılır. `openMonthLimitEditor()` — hedef çubuğuna tıklayınca açılır.

- [ ] **Step 1: s-dash şablonundaki hero'yu değiştir**

`buildDesignLayout()` içinde `document.getElementById('s-dash').innerHTML = \`` ile başlayan bloğu bul. `<div class="hero-card">...</div>` bölümünü şununla değiştir:

```html
      <div class="hero-card">
        <div class="hero-month">
          <button type="button" class="hero-month-nav" onclick="navDashMonth(-1)" aria-label="Önceki ay">‹</button>
          <span id="hero-month-label">—</span>
          <button type="button" class="hero-month-nav" onclick="navDashMonth(1)" aria-label="Sonraki ay">›</button>
        </div>
        <div class="hero-value num" id="bal-net">—</div>
        <div class="hero-metrics"><span>Gelir <strong class="num" id="bal-inc">—</strong></span><span>·</span><span>Gider <strong class="num" id="bal-exp">—</strong></span></div>
        <div class="goal-wrap-hero" id="hero-limit-wrap" onclick="openMonthLimitEditor()" role="button" tabindex="0">
          <div class="goal-track"><div class="goal-fill-hero" id="goal-fill"></div></div>
          <div class="goal-meta-row"><span id="goal-status">—</span><span id="goal-target">—</span></div>
        </div>
      </div>
```

Ayrıca aynı şablondan `<div class="month-scroll" id="month-chips"></div>` satırını **sil** — ay seçimi artık hero'da.

- [ ] **Step 2: renderHero fonksiyonunu yaz**

`app.js` içinde `renderDash()` tanımından HEMEN ÖNCE ekle:

```js
// Hero: ay seçici + net bakiye + aylık toplam limit çubuğu
function renderHero(m){
  const monthInc=monthI(m), monthExp=monthP(m), monthNet=monthInc-monthExp;

  const lbl=document.getElementById('hero-month-label');
  if(lbl) lbl.textContent = `${MN[m].toUpperCase()}${m===CUR_IDX?'':''}`;

  const balNet=document.getElementById('bal-net');
  if(balNet){
    balNet.textContent = `${monthNet>=0?'+':'−'}${fmt(Math.abs(monthNet))} ₺`;
    balNet.style.color = monthNet>=0 ? 'var(--pos)' : 'var(--neg)';
  }
  const balInc=document.getElementById('bal-inc');
  if(balInc) balInc.textContent = `${fmt(monthInc)} ₺`;
  const balExp=document.getElementById('bal-exp');
  if(balExp) balExp.textContent = `${fmt(monthExp)} ₺`;

  // Aylık toplam limit: manuel override varsa o, yoksa kategori limitleri toplamı
  const autoLim=Object.values(S.budgets||{}).reduce((a,v)=>a+(Number(v)||0),0);
  const lim=(S.monthLimit!=null && S.monthLimit>0) ? S.monthLimit : autoLim;
  const wrap=document.getElementById('hero-limit-wrap');
  const fill=document.getElementById('goal-fill');
  const stat=document.getElementById('goal-status');
  const targ=document.getElementById('goal-target');
  const pct=CALC.limitFill(monthExp, lim);

  if(pct===null){
    if(wrap) wrap.style.display='none';
    return;
  }
  if(wrap) wrap.style.display='';
  if(fill){
    fill.style.width=Math.min(pct,100)+'%';
    fill.style.background = pct>100 ? 'var(--neg)' : 'var(--pos)';
  }
  if(stat) stat.textContent = pct>100
    ? `%${pct} · ${fmt(monthExp-lim)} ₺ aşım`
    : `%${pct} · ${fmt(lim-monthExp)} ₺ kaldı`;
  if(targ) targ.textContent = `${fmt(lim)} ₺ limit`;
}

// Hedef çubuğuna dokununca aylık toplam limiti düzenle
function openMonthLimitEditor(){
  const autoLim=Object.values(S.budgets||{}).reduce((a,v)=>a+(Number(v)||0),0);
  const cur=(S.monthLimit!=null && S.monthLimit>0) ? S.monthLimit : autoLim;
  const v=prompt(`Aylık toplam gider limiti (₺).\nBoş bırakırsan kategori limitleri toplamı kullanılır (${fmt(autoLim)} ₺).`, cur||'');
  if(v===null) return;
  const t=String(v).trim();
  if(t===''){ S.monthLimit=null; }
  else {
    const n=parseTrNum(t);
    if(!(n>0)){ toast('Geçerli bir tutar gir',true); return; }
    S.monthLimit=n;
  }
  save();
  renderDash();
  toast('Aylık limit güncellendi');
}
```

- [ ] **Step 3: renderDash'i renderHero'yu çağıracak şekilde düzenle**

`renderDash()` fonksiyonunun başındaki hero ile ilgili satırları sil ve `renderHero(m)` çağrısıyla değiştir. Silinecekler:

- `const monthInc = monthI(m);` `const monthExp = monthP(m);` `const monthNet = monthInc - monthExp;` (renderHero içine taşındı — ancak `renderDash`'in geri kalanı bunları kullanıyorsa BIRAK, sadece DOM yazan kısımları sil)
- `const kick=document.getElementById('dash-kicker'); if(kick) kick.textContent = ...` bloğu
- `balNet`, `balInc`, `balExp` DOM yazan `if(...)` blokları

`renderDash()`'in ilk satırlarından hemen sonra ekle:

```js
  renderHero(m);
```

**Dikkat:** `balUyap` elemanı şablonda artık yok. `if(balUyap) balUyap.textContent = ...` satırı `balUyap` null olacağı için zaten çalışmayacak, ama temizlik için sil.

- [ ] **Step 4: navDashMonth'un sınır kontrolünü doğrula**

Run: `sed -n '/^function navDashMonth/,/^}/p' app.js`

Fonksiyon `S.dashM`'i 0..5 aralığında tutmalı ve `renderDash()` çağırmalı. Aralık kontrolü yoksa ekle:

```js
function navDashMonth(delta){
  const cur=(S.dashM!=null)?S.dashM:CUR_IDX;
  const next=Math.max(0, Math.min(MN.length-1, cur+delta));
  if(next===cur) return;
  S.dashM=next;
  renderDash();
}
```

- [ ] **Step 5: Hero CSS'ini ekle**

`app.css` sonuna ekle:

```css
/* ══ Hero ay seçici ════════════════════════════════════════ */
.hero-month {
  display: flex; align-items: center; justify-content: center;
  gap: var(--sp-3); margin-bottom: var(--sp-2);
  font-size: 12px; font-weight: 700; letter-spacing: .09em; opacity: .72;
}
.hero-month-nav {
  background: none; border: 0; cursor: pointer; color: inherit;
  font-size: 20px; line-height: 1; padding: 0 var(--sp-2);
  opacity: .55; transition: opacity .15s;
}
.hero-month-nav:hover { opacity: 1; }
#hero-limit-wrap { cursor: pointer; }
```

- [ ] **Step 6: Tarayıcıda doğrula**

1. Ana ekranda hero'da `‹ TEMMUZ ›` görünüyor.
2. Oklar ayı değiştiriyor, net bakiye ve gelir/gider rakamları güncelleniyor.
3. İlk aydan geriye, son aydan ileriye gidilemiyor.
4. Limit çubuğu doluluk gösteriyor; aşımda kırmızı.
5. Çubuğa tıklayınca limit sorusu açılıyor; boş bırakınca otomatik toplama dönüyor.
6. Eski ay çipleri şeridi ekranda yok.
7. Konsolda hata yok.

- [ ] **Step 7: Commit**

```bash
git add app.js app.css
git commit -m "feat: hero kartina ay secici ve aylik limit cubugu"
```

---

### Task 8: "Param Nereye Gidiyor" kartı

Ana ekranın kalbi. Grup satırları, delta işaretleri, limit çubukları, açılır alt kategoriler.

**Files:**
- Modify: `app.js` (`buildDesignLayout()` `s-dash` şablonu, yeni `renderDistribution()`, `toggleGroup()`, `openCatLimitEditor()`)
- Modify: `app.css`

**Interfaces:**
- Consumes: `CALC.groupTotals`, `CALC.catTotals`, `CALC.deltaPct`, `CALC.limitFill`, `CALC.fmt`; `catGroupMap()`, `getVisibleCats()`, `catMeta()`, `S.budgets`, `S.expenses`
- Produces:
  - `renderDistribution(m)` — `renderDash()` içinden çağrılır.
  - `S.openGroups: string[]` — açık grup id'leri, `save()` ile kalıcı.
  - `toggleGroup(id)`, `openCatLimitEditor(catId)`

- [ ] **Step 1: S state'ine openGroups ekle**

`app.js` içindeki `let S = { ... }` tanımına ekle (`monthLimit` satırının yanına):

```js
  openGroups: [],   // dagilim kartinda acik olan grup id'leri
```

`loadFromStorage()` içinde `S` alanları okunurken `openGroups` yoksa `[]` olarak kalır — `S`'in varsayılanı zaten bunu sağlıyor, ek kod gerekmiyor.

- [ ] **Step 2: Şablona dağılım kartını ekle**

`buildDesignLayout()` içindeki `s-dash` şablonunda, hero'dan HEMEN SONRA ekle:

```html
      <div class="card card--primary" id="dist-card">
        <div class="card-h"><h3>Param Nereye Gidiyor</h3><span class="hint" id="dist-hint">—</span></div>
        <div id="dist-body"></div>
      </div>
```

Aynı şablondan şu satırları **sil** (içerikleri yeni kartlara devrediliyor):
- `<div class="metrics-row" id="dash-metrics"></div>`
- `<div class="card"><div class="card-h"><h3>Bütçe Uyarıları</h3>...</div>` satırının tamamı (Task 9'da yenisi gelecek)

- [ ] **Step 3: renderDistribution fonksiyonunu yaz**

`app.js` içinde `renderHero` tanımından sonra ekle:

```js
// "Param nereye gidiyor" — üst gruplar, delta ve limit çubuklarıyla
function renderDistribution(m){
  const body=document.getElementById('dist-body');
  const hint=document.getElementById('dist-hint');
  if(!body) return;

  const gmap=catGroupMap();
  const cur=CALC.groupTotals(S.expenses, m, MK, gmap);
  const prev=(m>0) ? CALC.groupTotals(S.expenses, m-1, MK, gmap) : {groups:[],total:0,uyap:0};
  const prevByGroup={};
  prev.groups.forEach(g=>{ prevByGroup[g.id]=g.total; });

  if(hint) hint.textContent = cur.total>0 ? `${fmt(cur.total)} ₺` : '';

  if(cur.total===0 && cur.uyap===0){
    body.innerHTML=`<div class="empty-line">Bu ay henüz gider kaydı yok.</div>`;
    return;
  }

  // Grup limiti = gruptaki kategori limitlerinin toplamı
  const groupLimit={};
  getVisibleCats().forEach(c=>{
    const g=gmap[c.id];
    if(g==='uyap') return;
    groupLimit[g]=(groupLimit[g]||0)+(Number(S.budgets[c.id])||0);
  });

  const open=new Set(S.openGroups||[]);
  let html='';

  cur.groups.forEach(g=>{
    const share=Math.round((g.total/cur.total)*100);
    const d=CALC.deltaPct(g.total, prevByGroup[g.id]||0);
    const fill=CALC.limitFill(g.total, groupLimit[g.id]);
    const isOpen=open.has(g.id);

    const deltaHtml = d===null
      ? `<span class="delta delta-none">yeni</span>`
      : d===0
        ? `<span class="delta delta-none">─</span>`
        : `<span class="delta ${d>0?'delta-up':'delta-down'}">${d>0?'↑':'↓'} %${Math.abs(d)}</span>`;

    const barPct = (fill===null) ? share : Math.min(fill,100);
    const barCls = (fill!==null && fill>100) ? 'grp-bar-over' : (fill===null ? 'grp-bar-share' : '');
    const barMeta = (fill===null)
      ? `<span class="grp-limit">limit yok</span>`
      : `<span class="grp-limit">limit ${fmt(groupLimit[g.id])} ₺${fill>100?` · %${fill}`:''}</span>`;

    html += `
      <div class="grp ${isOpen?'grp-open':''}">
        <button type="button" class="grp-head" onclick="toggleGroup('${escAttr(g.id)}')" aria-expanded="${isOpen}">
          <span class="grp-name">${escapeHtml(g.label)}</span>
          <span class="grp-amt num">${fmt(g.total)} ₺</span>
          <span class="grp-share num">%${share}</span>
          ${deltaHtml}
          <span class="grp-caret">${isOpen?'▾':'▸'}</span>
        </button>
        <div class="grp-bar"><div class="grp-bar-fill ${barCls}" style="width:${barPct}%"></div></div>
        <div class="grp-meta">${barMeta}</div>
        ${isOpen ? renderGroupChildren(g.id, m, gmap) : ''}
      </div>`;
  });

  if(cur.uyap>0){
    html += `<div class="uyap-line"><span>UYAP · mesleki transfer</span><span class="num">${fmt(cur.uyap)} ₺</span><span class="uyap-note">bütçe dışı</span></div>`;
  }

  body.innerHTML=html;
}

// Bir grubun alt kategorileri — tutar, delta ve limit düzenleme
function renderGroupChildren(groupId, m, gmap){
  const cur=CALC.catTotals(S.expenses, m, MK);
  const prev=(m>0) ? CALC.catTotals(S.expenses, m-1, MK) : {};
  const rows=getVisibleCats()
    .filter(c=>gmap[c.id]===groupId && (cur[c.id]||0)>0)
    .map(c=>({c, total:cur[c.id]||0}))
    .sort((a,b)=>b.total-a.total);

  if(!rows.length) return `<div class="grp-children"><div class="empty-line">Bu grupta bu ay kayıt yok.</div></div>`;

  return `<div class="grp-children">` + rows.map(r=>{
    const d=CALC.deltaPct(r.total, prev[r.c.id]||0);
    const lim=Number(S.budgets[r.c.id])||0;
    const deltaHtml = d===null || d===0
      ? `<span class="delta delta-none">${d===null?'yeni':'─'}</span>`
      : `<span class="delta ${d>0?'delta-up':'delta-down'}">${d>0?'↑':'↓'} %${Math.abs(d)}</span>`;
    return `
      <div class="grp-child">
        <span class="gc-icon">${escapeHtml(r.c.icon||'')}</span>
        <span class="gc-name">${escapeHtml(r.c.label)}</span>
        <span class="gc-amt num">${fmt(r.total)} ₺</span>
        ${deltaHtml}
        <button type="button" class="gc-lim" onclick="openCatLimitEditor('${escAttr(r.c.id)}')" title="Limit belirle">${lim>0?fmt(lim)+' ₺':'limit +'}</button>
      </div>`;
  }).join('') + `</div>`;
}

function toggleGroup(id){
  const set=new Set(S.openGroups||[]);
  if(set.has(id)) set.delete(id); else set.add(id);
  S.openGroups=[...set];
  save();
  renderDistribution((S.dashM!=null)?S.dashM:CUR_IDX);
}

function openCatLimitEditor(catId){
  const meta=catMeta(catId);
  const cur=Number(S.budgets[catId])||0;
  const v=prompt(`${meta?meta.label:catId} için aylık limit (₺). Boş bırakırsan limit kalkar.`, cur||'');
  if(v===null) return;
  const t=String(v).trim();
  if(t===''){ S.budgets[catId]=0; }
  else {
    const n=parseTrNum(t);
    if(!(n>=0)){ toast('Geçerli bir tutar gir',true); return; }
    S.budgets[catId]=n;
  }
  save();
  renderDash();
  toast('Limit güncellendi');
}
```

- [ ] **Step 4: renderDash'ten çağır**

`renderDash()` içinde `renderHero(m);` satırından hemen sonra ekle:

```js
  renderDistribution(m);
```

- [ ] **Step 5: CSS'i ekle**

`app.css` sonuna ekle:

```css
/* ══ Dağılım kartı ═════════════════════════════════════════ */
.empty-line { padding: var(--sp-4) 0; opacity: .55; font-size: 14px; text-align: center; }

.grp { padding: var(--sp-3) 0; border-bottom: 1px solid var(--line, rgba(128,128,128,.14)); }
.grp:last-child { border-bottom: 0; }

.grp-head {
  display: flex; align-items: center; gap: var(--sp-2);
  width: 100%; background: none; border: 0; padding: 0; cursor: pointer;
  color: inherit; text-align: left; font-size: 15px;
}
.grp-name  { flex: 1; font-weight: 600; }
.grp-amt   { font-weight: 650; }
.grp-share { opacity: .5; font-size: 13px; min-width: 38px; text-align: right; }
.grp-caret { opacity: .4; font-size: 12px; width: 12px; }

.grp-bar {
  height: 6px; border-radius: 3px; margin-top: var(--sp-2);
  background: var(--line, rgba(128,128,128,.16)); overflow: hidden;
}
.grp-bar-fill { height: 100%; border-radius: 3px; background: var(--accent, #6B63E8); transition: width .25s; }
.grp-bar-over  { background: var(--neg); }
.grp-bar-share { background: var(--line2, rgba(128,128,128,.45)); }

.grp-meta { margin-top: var(--sp-1); font-size: 11px; opacity: .45; }

.grp-children { margin-top: var(--sp-3); padding-left: var(--sp-3); border-left: 2px solid var(--line, rgba(128,128,128,.16)); }
.grp-child { display: flex; align-items: center; gap: var(--sp-2); padding: var(--sp-2) 0; font-size: 14px; }
.gc-icon { width: 20px; }
.gc-name { flex: 1; opacity: .85; }
.gc-amt  { font-weight: 600; }
.gc-lim  {
  background: none; border: 1px dashed var(--line2, rgba(128,128,128,.4));
  border-radius: 6px; padding: 2px var(--sp-2); font-size: 11px;
  color: inherit; opacity: .6; cursor: pointer;
}
.gc-lim:hover { opacity: 1; }

.uyap-line {
  display: flex; align-items: center; gap: var(--sp-2);
  margin-top: var(--sp-4); padding-top: var(--sp-3);
  border-top: 1px dashed var(--line2, rgba(128,128,128,.3));
  font-size: 13px; opacity: .6;
}
.uyap-line span:first-child { flex: 1; }
.uyap-note { font-size: 11px; opacity: .7; }
```

- [ ] **Step 6: Tarayıcıda doğrula**

1. Ana ekranda "Param Nereye Gidiyor" kartı görünüyor, gruplar tutara göre azalan sıralı.
2. Yüzde payları toplamı ~%100.
3. UYAP satırı en altta, ayrı ve gri; yüzdelere dahil değil.
4. Bir gruba tıklayınca alt kategoriler açılıyor, tekrar tıklayınca kapanıyor.
5. Sayfa yenilendiğinde açık gruplar açık kalıyor (`S.openGroups` kaydediliyor).
6. Alt kategorideki limit butonuna basınca limit sorusu açılıyor; kaydedince grup çubuğu güncelleniyor.
7. Ay değiştirince dağılım ve delta'lar güncelleniyor.
8. İlk ayda (delta paydası yok) "yeni" yazıyor, konsolda hata yok.
9. Veri olmayan bir ayda "Bu ay henüz gider kaydı yok." satırı çıkıyor.

- [ ] **Step 7: Commit**

```bash
git add app.js app.css
git commit -m "feat: param nereye gidiyor karti - grup dagilimi, delta ve limitler"
```

---

### Task 9: "Dikkat" kartı

**Files:**
- Modify: `app.js` (`s-dash` şablonu, yeni `renderAttention()`)
- Modify: `app.css`

**Interfaces:**
- Consumes: `CALC.attentionSignals`, `getVisibleCats()`, `S.budgets`, `S.expenses`
- Produces: `renderAttention(m)` — `renderDash()` içinden çağrılır.

- [ ] **Step 1: Şablona dikkat kartını ekle**

`s-dash` şablonunda dağılım kartından HEMEN SONRA ekle:

```html
      <div class="card card--primary" id="attn-card" style="display:none">
        <div class="card-h"><h3>Dikkat</h3></div>
        <div id="attn-body"></div>
      </div>
```

- [ ] **Step 2: renderAttention fonksiyonunu yaz**

`app.js` içinde `renderDistribution` tanımından sonra ekle:

```js
// Dikkat kartı — en fazla 3 sinyal. Sinyal yoksa kart hiç gösterilmez.
function renderAttention(m){
  const card=document.getElementById('attn-card');
  const body=document.getElementById('attn-body');
  if(!card||!body) return;

  const labels={};
  getVisibleCats().forEach(c=>{ labels[c.id]=c.label; });

  const sig=CALC.attentionSignals({
    expenses: S.expenses,
    monthIdx: m,
    MK: MK,
    budgets: S.budgets||{},
    catLabels: labels
  });

  if(!sig.length){ card.style.display='none'; body.innerHTML=''; return; }

  card.style.display='';
  body.innerHTML=sig.map(s=>
    `<div class="attn-row attn-${escAttr(s.kind)}"><span class="attn-dot"></span><span>${escapeHtml(s.text)}</span></div>`
  ).join('');
}
```

- [ ] **Step 3: renderDash'ten çağır**

`renderDash()` içinde `renderDistribution(m);` satırından hemen sonra ekle:

```js
  renderAttention(m);
```

- [ ] **Step 4: Eski getAlerts kullanımını temizle**

Run: `grep -n "getAlerts\|dash-alerts" app.js`

`dash-alerts` elemanı şablondan Task 8'de silindi. `renderDash()` içinde `dash-alerts`'a yazan kod varsa sil. `getAlerts()` fonksiyonunun kendisini **silme** — başka yerde kullanılıyor olabilir; sadece ana ekrana yazan çağrısını kaldır.

- [ ] **Step 5: CSS'i ekle**

`app.css` sonuna ekle:

```css
/* ══ Dikkat kartı ══════════════════════════════════════════ */
.attn-row { display: flex; align-items: flex-start; gap: var(--sp-2); padding: var(--sp-2) 0; font-size: 14px; line-height: 1.45; }
.attn-dot { width: 7px; height: 7px; border-radius: 50%; margin-top: 6px; flex: 0 0 auto; background: var(--neg); }
.attn-artis    .attn-dot { background: var(--neg); }
.attn-limit    .attn-dot { background: var(--neg); }
.attn-ortalama .attn-dot { background: var(--warn, #E8A83E); }
```

- [ ] **Step 6: Tarayıcıda doğrula**

1. Limit aşan bir kategori varsa Dikkat kartı görünüyor ve o kategoriyi yazıyor.
2. En fazla 3 satır çıkıyor.
3. Aynı kategori iki kez geçmiyor.
4. Test için: bir kategorinin limitini geçici olarak çok düşük yap (alt kategori limit butonundan) → kart görünmeli. Sonra geri yükselt → kart kaybolmalı.
5. Hiç sinyal yokken kart **tamamen gizli** (boş kutu değil).

- [ ] **Step 7: Commit**

```bash
git add app.js app.css
git commit -m "feat: dikkat karti - limit asimi, artis ve ortalama ustu sinyalleri"
```

---

### Task 10: "6 Aylık Trend" kartı — üç göstergeyi tek karta indir

**Files:**
- Modify: `app.js` (`s-dash` şablonu, `renderDash()` içindeki sparkbar/chart/P&L kodu)
- Modify: `app.css`

**Interfaces:**
- Consumes: `monthI(m)`, `monthP(m)`, `MN`, Chart.js global `Chart`
- Produces: `renderTrend()` — `renderDash()` içinden çağrılır.

- [ ] **Step 1: Şablonda üç kartı tek kartla değiştir**

`s-dash` şablonunda şu üç satırı **sil**:

```html
<div class="card spark-card">...Altı Aylık Nabız...</div>
<div class="card">...Gelir ve Gider...<canvas id="pnl-chart">...</div>
<div class="card">...Aylık Net...<div id="pnl-table"></div></div>
```

Yerine tek kart koy (Dikkat kartından sonra gelecek):

```html
      <div class="card card--secondary">
        <div class="card-h"><h3>6 Aylık Trend</h3><span class="hint">Gelir · Gider</span></div>
        <div class="chart-wrap"><canvas id="pnl-chart" role="img" aria-label="Gelir gider trendi"></canvas></div>
        <div class="trend-summary" id="trend-summary"></div>
      </div>
```

- [ ] **Step 2: renderTrend fonksiyonunu yaz**

`app.js` içinde `renderAttention` tanımından sonra ekle:

```js
// 6 aylık trend — tek Chart.js grafiği + iki satır özet
let _pnlChart=null;
function renderTrend(m){
  const inc=MN.map((_,i)=>monthI(i));
  const exp=MN.map((_,i)=>monthP(i));
  const nets=MN.map((_,i)=>inc[i]-exp[i]);
  const avgNet=nets.reduce((a,v)=>a+v,0)/nets.length;

  const sum=document.getElementById('trend-summary');
  if(sum){
    const cur=nets[m];
    sum.innerHTML=
      `<div class="trend-line"><span>${MN[m]} net</span><strong class="num ${cur>=0?'delta-down':'delta-up'}">${cur>=0?'+':'−'}${fmt(Math.abs(cur))} ₺</strong></div>`+
      `<div class="trend-line"><span>6 ay ortalama net</span><strong class="num">${avgNet>=0?'+':'−'}${fmt(Math.abs(avgNet))} ₺</strong></div>`;
  }

  const cv=document.getElementById('pnl-chart');
  if(!cv) return;
  if(typeof Chart==='undefined'){
    // CDN yüklenmediyse grafik olmadan devam et — özet satırları yeterli bilgi veriyor
    cv.style.display='none';
    return;
  }
  cv.style.display='';
  const css=getComputedStyle(document.body);
  const posC=(css.getPropertyValue('--pos')||'#3EC98A').trim();
  const negC=(css.getPropertyValue('--neg')||'#E05656').trim();

  if(_pnlChart){ _pnlChart.destroy(); _pnlChart=null; }
  _pnlChart=new Chart(cv.getContext('2d'),{
    type:'line',
    data:{ labels:MN, datasets:[
      {label:'Gelir', data:inc, borderColor:posC, backgroundColor:posC, tension:.3, pointRadius:3},
      {label:'Gider', data:exp, borderColor:negC, backgroundColor:negC, tension:.3, pointRadius:3}
    ]},
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{display:false},
        tooltip:{ callbacks:{ label:c=>`${c.dataset.label}: ${fmt(c.parsed.y)} ₺` } } },
      scales:{ y:{ ticks:{ callback:v=>fmt(v) } } }
    }
  });
}
```

- [ ] **Step 3: renderDash'teki eski grafik/sparkbar/tablo kodunu kaldır ve renderTrend'i çağır**

Run: `grep -n "dash-spark\|pnl-table\|pnl-chart\|new Chart" app.js`

`renderDash()` içindeki `dash-spark`, `pnl-table` ve eski `new Chart(...)` bloklarını sil. Yerine `renderAttention(m);` satırından hemen sonra ekle:

```js
  renderTrend(m);
```

**Dikkat:** Eski kodda Chart nesnesi bir değişkende tutuluyorsa (`let chart` / `window._chart`), o değişkeni ve `destroy()` çağrılarını da temizle — `_pnlChart` onun yerini alıyor. İki Chart örneği aynı canvas'ı kullanırsa Chart.js "Canvas is already in use" hatası verir.

- [ ] **Step 4: CSS'i ekle**

`app.css` sonuna ekle:

```css
/* ══ Trend özeti ═══════════════════════════════════════════ */
.trend-summary { margin-top: var(--sp-3); }
.trend-line {
  display: flex; justify-content: space-between; align-items: baseline;
  padding: var(--sp-1) 0; font-size: 13px;
}
.trend-line span { opacity: .6; }
```

- [ ] **Step 5: Tarayıcıda doğrula**

1. Tek bir trend kartı var; sparkbar ve P&L tablosu kartları yok.
2. Grafik çiziliyor, iki çizgi (gelir/gider) görünüyor.
3. Grafiğin üstüne gelince tooltip `12.480 ₺` biçiminde.
4. Altındaki iki özet satırı doğru rakamları gösteriyor.
5. Ay değiştirince ilk özet satırının ayı değişiyor.
6. Ay değiştirmeyi **5 kez** tekrarla — konsolda "Canvas is already in use" hatası çıkmamalı.

- [ ] **Step 6: Commit**

```bash
git add app.js app.css
git commit -m "feat: sparkbar, grafik ve P&L tablosunu tek trend kartinda birlestir"
```

---

### Task 11: Takvim + Gün Akışı birleştirme

**Files:**
- Modify: `app.js` (`s-dash` şablonu, `renderDayList()`, `selectDay()`)
- Modify: `app.css`

**Interfaces:**
- Consumes: mevcut `renderDashCalendar(monthKey)`, `renderDayList()`, `selectDay(iso)`, `S.dashDay`
- Produces: Takvim kartı içinde koşullu gün listesi.

- [ ] **Step 1: Şablonda iki kartı birleştir**

`s-dash` şablonunda mevcut takvim kartını ve ayrı `day-detail-card`'ı bul. İkisini şununla değiştir (trend kartından SONRA, ekranın en altına gelecek):

```html
      <div class="card card--secondary dash-calendar-card">
        <div class="card-h"><h3>Takvim</h3><div class="cal-head-nav"><button class="cal-nav btn-ghost" onclick="navDashMonth(-1)">‹</button><div class="cal-month" id="dash-cal-month">—</div><button class="cal-nav btn-ghost" onclick="navDashMonth(1)">›</button></div></div>
        <div class="cal-dow"><span>Pt</span><span>Sa</span><span>Ça</span><span>Pe</span><span>Cu</span><span>Ct</span><span>Pz</span></div>
        <div class="cal-grid dash-grid" id="dash-cal-grid"></div>
        <div class="day-panel" id="day-panel" style="display:none">
          <div class="day-panel-h"><span id="day-panel-title">—</span><button type="button" class="day-panel-close" onclick="selectDay('')" aria-label="Kapat">✕</button></div>
          <div class="day-list" id="day-list"></div>
        </div>
      </div>
```

Eski `<div class="card day-detail-card">...</div>` bloğu tamamen kalkar; `day-list` id'si yeni panelin içinde yaşamaya devam eder, böylece mevcut `renderDayList()` hedefini bulur.

- [ ] **Step 2: renderDayList'i panel görünürlüğünü yönetecek şekilde genişlet**

`renderDayList()` fonksiyonunun EN BAŞINA ekle:

```js
  const panel=document.getElementById('day-panel');
  const title=document.getElementById('day-panel-title');
  if(panel){
    if(!S.dashDay){ panel.style.display='none'; const dl=document.getElementById('day-list'); if(dl) dl.innerHTML=''; return; }
    panel.style.display='';
    if(title){
      const p=String(S.dashDay).split('-');
      title.textContent = (p.length===3) ? `${p[2]}.${p[1]}.${p[0]}` : S.dashDay;
    }
  }
```

Fonksiyonun geri kalanı (gün kayıtlarını `day-list`e yazan kısım) aynen kalır.

- [ ] **Step 3: selectDay'in boş değeri kabul ettiğini doğrula**

Run: `sed -n '/^function selectDay/,/^}/p' app.js`

`selectDay('')` çağrısı `S.dashDay=''` yapıp `renderDayList()` çağırmalı. Eğer boş değeri reddediyorsa (`if(!iso) return;` gibi) o kontrolü kaldır — kapatma butonu buna güveniyor.

- [ ] **Step 4: CSS'i ekle**

`app.css` sonuna ekle:

```css
/* ══ Takvim içi gün paneli ═════════════════════════════════ */
.day-panel {
  margin-top: var(--sp-4); padding-top: var(--sp-3);
  border-top: 1px solid var(--line, rgba(128,128,128,.16));
}
.day-panel-h {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: var(--sp-2); font-size: 13px; font-weight: 600; opacity: .7;
}
.day-panel-close {
  background: none; border: 0; cursor: pointer; color: inherit;
  font-size: 14px; opacity: .5; padding: 0 var(--sp-1);
}
.day-panel-close:hover { opacity: 1; }
```

- [ ] **Step 5: Tarayıcıda doğrula**

1. Takvim ana ekranın en altında, tek kart.
2. Ayrı "Gün Akışı" kartı yok.
3. Gün seçmeden panel görünmüyor.
4. Bir güne tıklayınca takvimin altında o günün işlemleri açılıyor, başlık `15.07.2026` biçiminde.
5. ✕ ile kapanıyor.
6. Kart kesim/son ödeme günleri hâlâ renkli işaretli.
7. Takvim başlığındaki ‹ › okları ayı değiştiriyor ve hero'daki ay da değişiyor (ikisi de `navDashMonth` kullanıyor).

- [ ] **Step 6: Commit**

```bash
git add app.js app.css
git commit -m "feat: gun akisini takvim kartinin icine al"
```

---

### Task 12: Navigasyon 5→4, Bütçe sekmesini kaldır, Araçlar akordeonu

**Files:**
- Modify: `app.js` (`buildDesignLayout()` nav ve `s-more` şablonu, `go()`, `setMoreTab()`)
- Modify: `index.html` (statik `<nav>` ve `s-budget` bloğu)
- Modify: `app.css`

**Interfaces:**
- Consumes: mevcut `renderSubs()`, `renderCards()`, `renderFindeks()`, `renderFixed()`, `renderCatManager()`, `openCatForm()`, `recatAllDiger()`, `resetBudgetsToDefault()`
- Produces: `toggleTool(id)` — akordeon panel aç/kapa. `S.openTool: string` — açık panel id'si.

- [ ] **Step 1: S state'ine openTool ekle**

`let S = { ... }` tanımına ekle:

```js
  openTool: '',   // Araclar ekraninda acik olan akordeon panel id'si
```

- [ ] **Step 2: index.html'deki statik nav ve s-budget'ı sadeleştir**

`index.html` içinde:
- `<div id="s-budget" class="screen">...</div>` bloğunun TAMAMINI sil. İçeriği Araçlar'a taşınıyor.
- `<nav class="nav">...</nav>` içindeki 5 butonu 4'e indir:

```html
  <nav class="nav">
    <button class="nav-item on" onclick="go('dash',this)" id="nb-dash"><span class="nav-glyph">A</span><span>Özet</span></button>
    <button class="nav-item" onclick="go('income',this)" id="nb-income"><span class="nav-glyph">G</span><span>Gelir</span></button>
    <div class="nav-center"><button class="nav-fab" onclick="go('quick',null)" aria-label="Hızlı giriş">+</button></div>
    <button class="nav-item" onclick="go('more',this)" id="nb-more"><span class="nav-glyph">D</span><span>Araçlar</span></button>
  </nav>
```

- [ ] **Step 3: buildDesignLayout'taki nav satırını güncelle**

`buildDesignLayout()` sonundaki `document.querySelector('.nav').innerHTML = ...` satırını şununla değiştir:

```js
  document.querySelector('.nav').innerHTML = `<button class="nav-item on" onclick="go('dash',this)" id="nb-dash"><span class="nav-glyph">A</span><span>Özet</span></button><button class="nav-item" onclick="go('income',this)" id="nb-income"><span class="nav-glyph">G</span><span>Gelir</span></button><div class="nav-center"><button class="nav-fab" onclick="go('quick',null)" aria-label="Hızlı giriş">+</button></div><button class="nav-item" onclick="go('more',this)" id="nb-more"><span class="nav-glyph">D</span><span>Araçlar</span></button>`;
```

- [ ] **Step 4: go() fonksiyonundan budget-shortcut dalını kaldır**

Run: `sed -n '/^function go(/,/^}/p' app.js`

`if(screen==='budget-shortcut'){...}` dalını sil. `nb-budget` referanslarını da temizle. `renderBudget()` çağrısı varsa `renderTools()` ile değiştir (Step 6'da tanımlanacak).

- [ ] **Step 5: s-more şablonunu akordeona çevir**

`buildDesignLayout()` içindeki `document.getElementById('s-more').innerHTML = \`` bloğunu şununla değiştir. **Mevcut panel içerikleri (`more-ekstre`, `more-sabit`, `more-findeks`, `more-data`, `more-theme` iç HTML'leri) aynen korunur** — sadece etraflarına akordeon sarmalayıcı geliyor ve iki yeni panel (`more-abonelik`, `more-kategori`) ekleniyor.

Sarmalayıcı deseni — her panel için. `EKID` ve `BAŞLIK` yerine aşağıdaki tablodaki
değerleri koy; gövdeye ise tablonun "İçerik kaynağı" sütununda gösterilen **mevcut
`<div class="card">…</div>` bloğunu tek karakteri değişmeden** taşı. Kart içeriğini yeniden
yazma, kopyala-taşı:

```html
<div class="tool" id="tool-EKID">
  <button type="button" class="tool-head" onclick="toggleTool('EKID')" aria-expanded="false">
    <span>BAŞLIK</span><span class="tool-caret">▸</span>
  </button>
  <div class="tool-body" id="toolbody-EKID" style="display:none">
    <!-- buraya taşınan mevcut .card bloğu gelir -->
  </div>
</div>
```

Örnek — `sabit` paneli tamamlanmış hâliyle:

```html
<div class="tool" id="tool-sabit">
  <button type="button" class="tool-head" onclick="toggleTool('sabit')" aria-expanded="false">
    <span>Sabit Giderler</span><span class="tool-caret">▸</span>
  </button>
  <div class="tool-body" id="toolbody-sabit" style="display:none">
    <div class="card"><div class="card-h"><h3>Sabit Giderler</h3><span class="hint">Referans listesi</span></div><div id="fixed-list"></div><div class="field-note" style="margin-top:var(--sp-2)">Bu liste bilgi amaçlıdır. Otomatik kayıt oluşturmaz — ödediğinde Hızlı Giriş'ten veya Ekstre Yükle'den ekle.</div></div>
  </div>
</div>
```

Panel sırası ve id'leri:

| id | Başlık | İçerik kaynağı |
|---|---|---|
| `ekstre` | Ekstre Yükle + AI | mevcut `more-ekstre` içindeki ilk `.card` |
| `kart` | Kart Takvimi | mevcut `more-ekstre` içindeki Kart Takvimi `.card` |
| `abonelik` | Abonelikler | `index.html`'den silinen `s-budget` içindeki Abonelikler `.card` |
| `sabit` | Sabit Giderler | mevcut `more-sabit` |
| `analiz` | Harcama Analizi | mevcut `more-ekstre` içindeki `.ai-card` |
| `kategori` | Kategoriler | aşağıdaki yeni içerik |
| `findeks` | Findeks Puanı | mevcut `more-findeks` |
| `veri` | Veri (yedek/sıfırla) | mevcut `more-data` |
| `gorunum` | Görünüm | mevcut `more-theme` |

`kategori` panelinin gövdesi (silinen Bütçe ekranından devralınan işlemler):

```html
<div class="card">
  <div class="card-h"><h3>Kategoriler</h3><button type="button" class="fav-add-btn" onclick="openCatForm()">+ Yeni</button></div>
  <div id="cat-manager"></div>
  <div id="budget-unrev-panel"></div>
  <div class="budget-actions" style="display:flex;gap:var(--sp-2);flex-wrap:wrap;margin-top:var(--sp-3)">
    <button type="button" class="btn btn-secondary" style="flex:1;min-width:140px" onclick="recatAllDiger()">Yeniden sınıflandır</button>
    <button type="button" class="btn btn-secondary" style="flex:1;min-width:140px" onclick="resetBudgetsToDefault()">Varsayılanlara Sıfırla</button>
  </div>
  <div class="field-note" style="margin-top:var(--sp-2)">Kategori limitlerini Özet ekranındaki dağılım kartından, grubu açıp kategoriye dokunarak düzenleyebilirsin.</div>
</div>
```

- [ ] **Step 6: toggleTool ve renderTools fonksiyonlarını yaz**

`app.js` içinde `setMoreTab` tanımının yerine (fonksiyonu sil) ekle:

```js
// Araçlar ekranı — akordeon. Aynı anda tek panel açık.
function toggleTool(id){
  S.openTool = (S.openTool===id) ? '' : id;
  save();
  renderTools();
  if(S.openTool){
    const el=document.getElementById('tool-'+S.openTool);
    if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
  }
}

function renderTools(){
  document.querySelectorAll('.tool').forEach(t=>{
    const id=t.id.replace(/^tool-/,'');
    const open=(S.openTool===id);
    const body=document.getElementById('toolbody-'+id);
    const head=t.querySelector('.tool-head');
    const caret=t.querySelector('.tool-caret');
    if(body) body.style.display = open ? '' : 'none';
    if(head) head.setAttribute('aria-expanded', String(open));
    if(caret) caret.textContent = open ? '▾' : '▸';
    t.classList.toggle('tool-open', open);
  });
  // Açık panelin içeriğini tazele
  if(S.openTool==='sabit')    renderFixed();
  if(S.openTool==='kart')     renderCards();
  if(S.openTool==='findeks')  renderFindeks();
  if(S.openTool==='abonelik') renderSubs();
  if(S.openTool==='kategori') renderCatManager();
}
```

Run: `grep -n "setMoreTab" app.js index.html`

Kalan tüm `setMoreTab(...)` çağrılarını `toggleTool(...)` ile değiştir veya sil.

- [ ] **Step 7: go() içinde 'more' ekranına geçince renderTools çağır**

`go()` fonksiyonunda `more` ekranına geçişi bul ve `renderTools();` çağrısı ekle.

- [ ] **Step 8: renderBudget'ın kalan referanslarını temizle**

Run: `grep -n "renderBudget\|budget-bars-main\|budget-month-chips\|budget-monthlim-card\|setBudM\|renderBudget()" app.js`

`s-budget` ekranı artık yok; bu id'lere yazan kod `null` üzerinde çalışacak. `renderBudget()` fonksiyonunu **silme** — içindeki `budget-unrev-panel` doldurma mantığı hâlâ gerekli. Bunun yerine fonksiyonun başına koruma ekle:

```js
function renderBudget(){
  // Bütçe ekranı kaldırıldı; yalnızca Araçlar > Kategoriler içindeki
  // gözden geçirilmemiş kalemler paneli doldurulur.
  const unrevEl=document.getElementById('budget-unrev-panel');
  if(!unrevEl) return;
```

ve fonksiyonun geri kalanındaki, artık var olmayan elemanlara yazan blokları `if(el)` koruması altına al veya sil. `save()` içinden `renderBudget()` çağrılıyorsa bırak — koruma sayesinde zararsız.

- [ ] **Step 9: CSS'i ekle**

`app.css` sonuna ekle:

```css
/* ══ Araçlar akordeonu ═════════════════════════════════════ */
.tool { border-bottom: 1px solid var(--line, rgba(128,128,128,.14)); }
.tool-head {
  display: flex; align-items: center; justify-content: space-between;
  width: 100%; background: none; border: 0; cursor: pointer; color: inherit;
  padding: var(--sp-4) var(--sp-1); font-size: 15px; font-weight: 600; text-align: left;
}
.tool-caret { opacity: .4; font-size: 12px; }
.tool-open > .tool-head { color: var(--accent, inherit); }
.tool-body { padding-bottom: var(--sp-4); }
.tool-body > .card { margin-bottom: var(--sp-3); }
.tool-body > .card:last-child { margin-bottom: 0; }
```

- [ ] **Step 10: Tarayıcıda doğrula**

1. Alt navigasyonda 4 öğe: Özet, Gelir, ➕, Araçlar.
2. Bütçe sekmesi yok, tıklanabilir kalıntı yok.
3. Araçlar ekranı açıldığında **tüm paneller kapalı**.
4. Bir başlığa tıklayınca o panel açılıyor, başkasına tıklayınca öncekisi kapanıyor.
5. Her panelin içi çalışıyor:
   - Ekstre: metin kutusu ve İçe Aktar butonu
   - Kart Takvimi: kart listesi ve + Yeni
   - Abonelikler: liste ve + Yeni
   - Sabit Giderler: liste
   - Harcama Analizi: Analiz Et butonu
   - Kategoriler: kategori listesi, + Yeni, Yeniden sınıflandır, Varsayılanlara Sıfırla
   - Findeks: form ve liste
   - Veri: JSON indir/yükle/sıfırla
   - Görünüm: iki tema
6. Sayfa yenilendiğinde açık panel açık kalıyor.
7. Konsolda hata yok.

- [ ] **Step 11: Commit**

```bash
git add index.html app.js app.css
git commit -m "feat: navigasyon 5->4, butce sekmesi kaldirildi, araclar akordeonu"
```

---

### Task 13: Gelir/Hızlı Giriş görsel hizalama ve final doğrulama

**Files:**
- Modify: `app.css`
- Modify: `app.js` (`s-quick` ve `s-income` şablonlarındaki inline `style` kullanımları)

**Interfaces:**
- Consumes: Task 6'daki boşluk tokenları ve `.num` sınıfı.
- Produces: (son task — sonraki task yok)

- [ ] **Step 1: Para gösteren elemanlara .num sınıfını ekle**

Run: `grep -n 'id="inc-total"\|id="gi-fiber-preview"\|class="row-amt"\|class="fiber-preview-value"' app.js`

Bulunan elemanların `class` niteliğine `num` ekle. Örnek:

```html
<div class="hero-value income-total num" id="inc-total">—</div>
<div class="fiber-preview-value num" id="gi-fiber-preview">0 ₺</div>
```

- [ ] **Step 2: s-income ve s-quick şablonlarındaki inline boşlukları tokenlara çevir**

`s-income` ve `s-quick` şablonlarında geçen `style="margin-bottom:10px"` gibi ifadeleri `style="margin-bottom:var(--sp-3)"` biçimine çevir. Eşleme:

| Mevcut | Yeni |
|---|---|
| `4px` | `var(--sp-1)` |
| `6px`, `8px` | `var(--sp-2)` |
| `10px`, `12px` | `var(--sp-3)` |
| `16px` | `var(--sp-4)` |
| `24px` | `var(--sp-6)` |

Yalnızca `margin`/`padding`/`gap` değerlerini çevir; `flex`, `min-width`, `font-size` gibi diğer özelliklere dokunma.

- [ ] **Step 3: Gelir ve Hızlı Giriş kartlarına hiyerarşi sınıfı ver**

`s-income` şablonunda ana gelir formu kartına `card--primary`, geçmiş listesi ve FIBER kartlarına `card--secondary` ekle.
`s-quick` şablonunda `quick-main-card`'a `card--primary`, Sık Havale ve İşlemler kartlarına `card--secondary` ekle.

- [ ] **Step 4: Tüm testleri koştur**

Run: `node test.js`

Beklenen: tüm testler PASS, çıkış kodu 0.

- [ ] **Step 5: Tam regresyon kontrol listesi**

Uygulamayı tarayıcıda aç, sırayla:

**Veri bütünlüğü**
1. Araçlar → Veri → JSON Yedeği İndir. Dosya iniyor.
2. İnen JSON'u bir metin editöründe aç: `expenses`/`userExp` dizisi dolu, kayıt sayısı beklenen kadar.
3. Araçlar → Veri → JSON Yedeği Yükle ile aynı dosyayı geri yükle. Veri kaybı yok.

**Giriş akışı**
4. ➕ → tutar gir, açıklama yaz, kategori seç, Kaydet. Kayıt Özet ekranındaki dağılıma yansıyor.
5. Sık Havale'den bir kısayola tıkla, alanlar doluyor.
6. Araçlar → Ekstre: bir ekstre metni yapıştır, İçe Aktar. Kalemler ekleniyor.

**Okuma akışı**
7. Özet: hero ay okları çalışıyor, 6 ayın hepsinde rakamlar tutarlı.
8. Dağılım: grup yüzdeleri toplamı ~%100, UYAP ayrı satırda.
9. Grup aç/kapa çalışıyor, alt kategori limiti düzenlenebiliyor.
10. Dikkat kartı: sinyal varken görünüyor, yokken tamamen gizli.
11. Trend: grafik çiziliyor, ay değiştirince özet güncelleniyor, 5 kez ay değiştir → Chart hatası yok.
12. Takvim: gün seç → panel açılıyor, ✕ → kapanıyor.

**Gelir akışı**
13. Gelir: tutar + FIBER oranı gir, önizleme doğru hesaplanıyor, Kaydet çalışıyor.
14. Gelir geçmişi listeleniyor, ay filtresi çalışıyor.

**Araçlar**
15. Dokuz panelin hepsi açılıyor, içi çalışıyor.

**Genel**
16. Her iki temada da (Krem Kâğıt, Onyx) tüm ekranlar okunaklı — özellikle delta renkleri, grup çubukları, dikkat noktaları.
17. Tarayıcıyı daralt (mobil genişlik): dağılım satırları taşmıyor, rakamlar kesilmiyor.
18. Konsolda hiçbir ekranda hata yok.

Herhangi bir madde başarısızsa: düzelt, listeyi baştan koştur.

- [ ] **Step 6: NEXUS.md'yi güncelle**

`NEXUS.md` içindeki `[2] TEKNOLOJİ & ARAÇLAR` bölümünde "Tek dosyalı SPA (`index.html` içinde tüm UI ve mantık)" satırını şununla değiştir:

```
- Dört dosyalı statik yapı: index.html (iskelet) + app.css + calc.js (saf hesaplar) + app.js (render/etkileşim)
- node test.js — bağımlılıksız birim testleri (calc.js kapsamı)
```

`[4] SONRAKI ADIM` bölümündeki vercel.json maddesini şununla değiştir:

```
Ana ekran sadeleştirmesi tamamlandı. Sonraki aday: kullanıcının kendi eklediği
kategorileri Araçlar > Kategoriler panelinden bir üst gruba atayabilmesi
(şu an hepsi "Gruplanmamış" altında toplanıyor).
```

- [ ] **Step 7: Commit**

```bash
git add app.css app.js NEXUS.md
git commit -m "feat: gelir ve hizli giris ekranlarini yeni gorsel dile hizala"
```

- [ ] **Step 8: Dalı kullanıcıya sun**

Kullanıcıya şunu söyle:

> "Tüm task'lar tamam, `sadelestirme` dalında. `main` dokunulmadı. Uygulamayı açıp gez; beğenirsen `main`'e birleştirelim, beğenmediğin bir kısım varsa o task'ın commit'ini tek başına geri alabiliriz."

**`main`'e merge etme — kullanıcı onayı olmadan birleştirme yapma.**

---

## Bilinen boşluk

Kullanıcının kendi eklediği kategoriler (`S.customCats`) `group` alanı taşımadığı için
`'ungrouped'` grubuna düşer ve dağılım kartında "Gruplanmamış" başlığı altında toplanır.
Bunları bir üst gruba atayacak arayüz bu planın kapsamında **değil** — tasarım dokümanının
Bölüm 5'inde belirtildiği gibi sonraki iş olarak bırakıldı. Mevcut davranış doğru ve
veri kaybı yaratmıyor, yalnızca eksik.
