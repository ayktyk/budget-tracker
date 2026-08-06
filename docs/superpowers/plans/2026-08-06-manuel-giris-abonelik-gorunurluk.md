# Manuel Giriş Öncelikli Akış + Abonelik Görünürlüğü — Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Abonelikleri Özet ekranında ve takvimde sürekli görünür kılmak, günlük manuel gider girişini hızlandırmak, girerken canlı bütçe geri bildirimi vermek — hiçbir mevcut veriyi veya özelliği kaybetmeden.

**Architecture:** Mevcut ayrım korunur — saf hesaplar `calc.js`'te (Node'da test edilir), DOM `app.js`'te. Yedi yeni saf fonksiyon `calc.js`'e, altı yeni render fonksiyonu `app.js`'e eklenir. Yeni kalıcı veri yalnızca `sub.paid` (mevcut `ay_subs` anahtarının içinde) ve `ay_lastbank`. Mevcut kayıt alanları değişmez.

**Tech Stack:** Saf HTML/CSS/JS, build adımı yok. `node test.js` bağımlılıksız assert runner. localStorage.

**Spec:** `docs/superpowers/specs/2026-08-06-manuel-giris-abonelik-gorunurluk-design.md`

---

## Dosya Yapısı

| Dosya | Sorumluluk | Değişiklik |
|---|---|---|
| `calc.js` | Saf hesaplar, DOM yok | 7 fonksiyon eklenir, mevcutlar değişmez |
| `test.js` | Bağımlılıksız test runner | Yeni fonksiyonlar için test blokları eklenir |
| `app.js` | State, storage, render, etkileşim | Yeni render fonksiyonları + mevcut 5 fonksiyonda düzenleme |
| `app.css` | Stil | Yeni bileşen sınıfları eklenir |
| `NEXUS.md` | Proje bilgi formu | Son adım güncellenir |

---

## Task 1: `calc.js` — abonelik tarih ve durum hesabı

**Files:**
- Modify: `calc.js` (yeni fonksiyonlar, `attentionSignals`'tan sonra, `return` bloğundan önce)
- Test: `test.js`

- [ ] **Step 1: Testleri yaz** — `test.js` içinde `attentionSignals` bloğunun sonuna, `console.log('\n' + pass ...)` satırından ÖNCE ekle:

```js
console.log('\nsubDueDate');
eq(CALC.subDueDate('2026-08', 10), '2026-08-10', 'normal gun');
eq(CALC.subDueDate('2026-02', 31), '2026-02-28', '31 -> subat son gunu');
eq(CALC.subDueDate('2024-02', 31), '2024-02-29', 'artik yil subat 29');
eq(CALC.subDueDate('2026-04', 31), '2026-04-30', '31 -> 30 gunluk ay');
eq(CALC.subDueDate('2026-08', 0), '2026-08-01', 'gecersiz gun 1e cekilir');
eq(CALC.subDueDate('', 5), '', 'gecersiz ay bos doner');

console.log('\nsubsStatus');
const SUBS = [
  { id:'s1', name:'Netflix',    amt:190, cat:'dijital', bank:'Enpara', dayOfMonth:25, active:true, paid:{} },
  { id:'s2', name:'Spotify',    amt:99,  cat:'dijital', bank:'Enpara', dayOfMonth:2,  active:true, paid:{} },
  { id:'s3', name:'Google One', amt:720, cat:'dijital', bank:'Enpara', dayOfMonth:8,  active:true,
    paid:{ '2026-08': { expId:'e1', at:'2026-08-08T09:00:00.000Z' } } },
  { id:'s4', name:'Pasif',      amt:500, cat:'dijital', bank:'Enpara', dayOfMonth:1,  active:false, paid:{} },
];
const ss = CALC.subsStatus(SUBS, '2026-08', '2026-08-10');
eq(ss.count, 3, 'pasif abonelik sayilmaz');
eq(ss.total, 1009, 'aktif toplam 190+99+720');
eq(ss.paidTotal, 720, 'odenen toplam');
eq(ss.pendingTotal, 289, 'bekleyen toplam');
eq(ss.paidCount, 1, 'odenen adet');
eq(ss.rows.map(r => r.name), ['Spotify', 'Google One', 'Netflix'], 'gune gore artan sirali');
eq(ss.rows[0].state, 'late', 'gunu gecmis ve odenmemis -> late');
eq(ss.rows[1].state, 'paid', 'odenmis -> paid');
eq(ss.rows[2].state, 'due', 'gunu gelmemis -> due');
eq(ss.rows[0].dueIso, '2026-08-02', 'dueIso hesaplanir');

const ssFuture = CALC.subsStatus(SUBS, '2026-09', '2026-08-10');
eq(ssFuture.rows.every(r => r.state === 'due'), true, 'gelecek ayda hepsi bekliyor');
eq(ssFuture.paidTotal, 0, 'gelecek ayda odenen yok');

eq(CALC.subsStatus([], '2026-08', '2026-08-10').count, 0, 'bos liste');
eq(CALC.subsStatus(null, '2026-08', '2026-08-10').rows, [], 'null liste bos dizi');
```

- [ ] **Step 2: Testin başarısız olduğunu doğrula**

Run: `node test.js`
Beklenen: FAIL — `CALC.subDueDate is not a function` (runner çökebilir; bu da başarısızlık sayılır)

- [ ] **Step 3: Fonksiyonları yaz** — `calc.js` içinde `attentionSignals` fonksiyonunun kapanışından sonra, `return {` bloğundan önce:

```js
  // ── Abonelikler ─────────────────────────────────────────────
  // 'YYYY-MM' + ayın günü → 'YYYY-MM-DD'. Ay o günü içermiyorsa son güne kırpar
  // (ayın 31'i tanımlı bir abonelik Şubat'ta 28/29'a düşer).
  function subDueDate(monthKey, dayOfMonth) {
    var parts = String(monthKey || '').split('-');
    var y = parseInt(parts[0], 10), mo = parseInt(parts[1], 10);
    if (!y || !mo || mo < 1 || mo > 12) return '';
    var last = new Date(y, mo, 0).getDate();
    var d = Math.max(1, Math.min(last, parseInt(dayOfMonth, 10) || 1));
    return y + '-' + (mo < 10 ? '0' + mo : mo) + '-' + (d < 10 ? '0' + d : d);
  }

  // Bir ayın abonelik tablosu. Pasif abonelikler (active===false) hariç.
  // state: 'paid' (o ay ödeme işareti var) | 'late' (gün geçmiş, işaret yok) | 'due' (gün gelmemiş)
  // Geçmiş aylarda tüm işaretsizler 'late' döner; etiketi çağıran belirler.
  function subsStatus(subs, monthKey, todayIso) {
    var rows = [], total = 0, paidTotal = 0, paidCount = 0;
    var list = subs || [];
    for (var i = 0; i < list.length; i++) {
      var s = list[i];
      if (!s || s.active === false) continue;
      var dueIso = subDueDate(monthKey, s.dayOfMonth);
      var amt = Number(s.amt) || 0;
      var isPaid = !!(s.paid && s.paid[monthKey]);
      var state = isPaid ? 'paid' : ((dueIso && todayIso && dueIso < todayIso) ? 'late' : 'due');
      rows.push({
        id: s.id, name: s.name, amt: amt, cat: s.cat, bank: s.bank,
        dueIso: dueIso, day: parseInt(dueIso.slice(8), 10) || 0,
        state: state, pending: !!s.pending
      });
      total += amt;
      if (isPaid) { paidTotal += amt; paidCount++; }
    }
    rows.sort(function (a, b) { return a.day - b.day; });
    return {
      rows: rows, count: rows.length, total: total,
      paidTotal: paidTotal, pendingTotal: total - paidTotal, paidCount: paidCount
    };
  }
```

- [ ] **Step 4: `return` bloğuna ekle** — `calc.js` sonundaki export nesnesine iki isim ekle:

```js
    deltaPct: deltaPct, limitFill: limitFill, catTotals: catTotals,
    attentionSignals: attentionSignals,
    subDueDate: subDueDate, subsStatus: subsStatus
```

- [ ] **Step 5: Testlerin geçtiğini doğrula**

Run: `node test.js`
Beklenen: PASS — tüm yeni testler dahil, `0 kaldi`

- [ ] **Step 6: Commit**

```bash
git add calc.js test.js
git commit -m "feat: abonelik tarih ve durum hesabi (calc)"
```

---

## Task 2: `calc.js` — bütçe geri bildirim hesapları

**Files:**
- Modify: `calc.js`
- Test: `test.js`

- [ ] **Step 1: Testleri yaz** — `test.js` içinde Task 1 testlerinden sonra:

```js
console.log('\ndailyAllowance');
eq(CALC.dailyAllowance(30000, 18000, '2026-08-20'), { remaining:12000, daysLeft:12, perDay:1000 },
   '12 gun kaldi, gunluk 1000');
eq(CALC.dailyAllowance(30000, 18000, '2026-08-31'), { remaining:12000, daysLeft:1, perDay:12000 },
   'ayin son gunu tek gun kalir');
eq(CALC.dailyAllowance(30000, 35000, '2026-08-20'), { remaining:-5000, daysLeft:12, perDay:0 },
   'asim varsa gunluk 0');
eq(CALC.dailyAllowance(0, 5000, '2026-08-20'), null, 'limit yoksa null');
eq(CALC.dailyAllowance(null, 5000, '2026-08-20'), null, 'limit null ise null');
eq(CALC.dailyAllowance(30000, 0, 'gecersiz'), null, 'gecersiz tarih null');

console.log('\nafterEntry');
eq(CALC.afterEntry(6150, 7000, 850), { after:7000, remaining:0, pct:100, level:'warn' },
   'tam limitte warn');
eq(CALC.afterEntry(6150, 7000, 900), { after:7050, remaining:-50, pct:101, level:'over' },
   'asim over');
eq(CALC.afterEntry(1000, 7000, 500), { after:1500, remaining:5500, pct:21, level:'ok' },
   'rahat bolge ok');
eq(CALC.afterEntry(6200, 7000, 100), { after:6300, remaining:700, pct:90, level:'warn' },
   'yuzde 90 esigi warn');
eq(CALC.afterEntry(6100, 7000, 100), { after:6200, remaining:800, pct:89, level:'ok' },
   'yuzde 89 hala ok');
eq(CALC.afterEntry(1000, 0, 500), null, 'limit yoksa null');
eq(CALC.afterEntry(1000, 7000, NaN), { after:1000, remaining:6000, pct:14, level:'ok' },
   'gecersiz tutar 0 sayilir');

console.log('\nmedian');
eq(CALC.median([1, 3, 2]), 2, 'tek eleman sayisi ortadaki');
eq(CALC.median([1, 2, 3, 4]), 3, 'cift eleman ortalamasi yuvarlanir');
eq(CALC.median([]), 0, 'bos dizi sifir');
eq(CALC.median([5]), 5, 'tek eleman');
eq(CALC.median([700, 0, 900]), 700, 'sifir da hesaba katilir');

console.log('\nsuggestLimits');
const SUG_EXP = [
  { id:'a', d:'2026-04-03', cat:'market', amt:1000 },
  { id:'b', d:'2026-05-03', cat:'market', amt:3000 },
  { id:'c', d:'2026-06-03', cat:'market', amt:2000 },
  { id:'d', d:'2026-07-03', cat:'market', amt:9999 },
  { id:'e', d:'2026-05-10', cat:'yemek',  amt:500 },
];
const sug = CALC.suggestLimits(SUG_EXP, MK, 5, ['market', 'yemek', 'kira'], 3);
eq(sug.market, 2000, 'son 3 tam ayin medyani, icinde bulunulan ay haric');
eq(sug.yemek, 0, 'tek ayda veri olan kategori medyan 0');
eq(sug.kira, undefined, 'hic veri olmayan kategori listede yok');
eq(CALC.suggestLimits(SUG_EXP, MK, 0, ['market'], 3), {}, 'gecmis ay yoksa bos');
```

- [ ] **Step 2: Testin başarısız olduğunu doğrula**

Run: `node test.js`
Beklenen: FAIL — `CALC.dailyAllowance is not a function`

- [ ] **Step 3: Fonksiyonları yaz** — `calc.js` içinde `subsStatus`'tan sonra:

```js
  // ── Bütçe geri bildirimi ────────────────────────────────────
  // Bugün harcanabilir tutar = kalan limit ÷ ayın kalan günü. Limit yoksa null.
  function dailyAllowance(limit, spent, todayIso) {
    if (!limit || limit <= 0) return null;
    var p = String(todayIso || '').split('-');
    var y = parseInt(p[0], 10), mo = parseInt(p[1], 10), d = parseInt(p[2], 10);
    if (!y || !mo || !d || mo < 1 || mo > 12) return null;
    var last = new Date(y, mo, 0).getDate();
    var daysLeft = Math.max(1, last - d + 1);
    var remaining = limit - (Number(spent) || 0);
    return {
      remaining: remaining, daysLeft: daysLeft,
      perDay: remaining > 0 ? Math.floor(remaining / daysLeft) : 0
    };
  }

  // Girilmekte olan tutarın kategori limitine etkisi. Limit yoksa null.
  // level eşikleri lvl() ile aynı: %90 uyarı, %100 üstü aşım.
  function afterEntry(spent, limit, amount) {
    if (!limit || limit <= 0) return null;
    var s = Number(spent) || 0;
    var a = Number(amount);
    if (!isFinite(a)) a = 0;
    var after = s + a;
    var pct = Math.round((after / limit) * 100);
    return {
      after: after, remaining: limit - after, pct: pct,
      level: pct > 100 ? 'over' : (pct >= 90 ? 'warn' : 'ok')
    };
  }

  // Medyan. Çift eleman sayısında iki ortancanın yuvarlanmış ortalaması.
  function median(nums) {
    var a = (nums || []).filter(function (n) { return typeof n === 'number' && isFinite(n); })
                        .sort(function (x, y) { return x - y; });
    if (!a.length) return 0;
    var mid = Math.floor(a.length / 2);
    return (a.length % 2) ? a[mid] : Math.round((a[mid - 1] + a[mid]) / 2);
  }

  // Son N TAM ayın medyanına göre kategori limit önerisi.
  // curIdx (içinde bulunulan ay) dahil edilmez — ay yarım olduğu için yanıltır.
  // Hiç harcaması olmayan kategori sonuçta yer almaz.
  function suggestLimits(expenses, MK, curIdx, catIds, months) {
    var n = months || 3;
    var out = {}, idxs = [];
    for (var i = curIdx - n; i < curIdx; i++) { if (i >= 0) idxs.push(i); }
    if (!idxs.length) return out;
    var totals = idxs.map(function (i) { return catTotals(expenses, i, MK); });
    (catIds || []).forEach(function (c) {
      var vals = totals.map(function (t) { return t[c] || 0; });
      var any = vals.some(function (v) { return v > 0; });
      if (!any) return;
      out[c] = median(vals);
    });
    return out;
  }
```

- [ ] **Step 4: `return` bloğuna ekle**

```js
    subDueDate: subDueDate, subsStatus: subsStatus,
    dailyAllowance: dailyAllowance, afterEntry: afterEntry,
    median: median, suggestLimits: suggestLimits
```

- [ ] **Step 5: Testlerin geçtiğini doğrula**

Run: `node test.js`
Beklenen: PASS, `0 kaldi`

- [ ] **Step 6: Commit**

```bash
git add calc.js test.js
git commit -m "feat: butce geri bildirim hesaplari (calc)"
```

---

## Task 3: `calc.js` — ekstre çift kayıt tespiti

**Files:**
- Modify: `calc.js`
- Test: `test.js`

**Neden iki tarih karşılaştırılıyor:** `importStatementRows()` içe aktarılan her satırı BUGÜNÜN tarihine yazıyor (mevcut, kasıtlı davranış). Bu yüzden bir ekstre satırı ya elle girilmiş kayıtla (gerçek tarih) ya da önceki bir içe aktarımla (bugünün tarihi) çakışabilir. `findDuplicates` her iki ihtimali de kontrol eder.

- [ ] **Step 1: Testleri yaz** — `test.js` içinde Task 2 testlerinden sonra:

```js
console.log('\nfindDuplicates');
const EXIST = [
  { id:'x1', d:'2026-08-05', desc:'SOK Market', amt:565, bank:'İşbank' },
  { id:'x2', d:'2026-08-20', desc:'Netflix',    amt:190, bank:'Enpara' },
];
eq(CALC.findDuplicates(EXIST, [{ d:'2026-08-05', amt:565 }], '2026-08-06'), [0],
   'ayni gun ayni tutar cift');
eq(CALC.findDuplicates(EXIST, [{ d:'2026-08-06', amt:565 }], '2026-08-06'), [0],
   'bir gun fark cift');
eq(CALC.findDuplicates(EXIST, [{ d:'2026-08-07', amt:565 }], '2026-08-10'), [],
   'iki gun fark cift degil');
eq(CALC.findDuplicates(EXIST, [{ d:'2026-08-05', amt:566 }], '2026-08-06'), [0],
   '1 TL tolerans icinde cift');
eq(CALC.findDuplicates(EXIST, [{ d:'2026-08-05', amt:600 }], '2026-08-06'), [],
   'tutar farkli cift degil');
eq(CALC.findDuplicates(EXIST, [{ d:'2026-01-01', amt:190 }], '2026-08-20'), [0],
   'satir tarihi uzak ama bugun mevcut kayitla esitse cift (onceki ice aktarim)');
eq(CALC.findDuplicates([], [{ d:'2026-08-05', amt:565 }], '2026-08-06'), [],
   'mevcut kayit yoksa cift yok');
eq(CALC.findDuplicates(EXIST, [{ d:'2026-08-05', amt:565 }, { d:'2026-08-09', amt:100 }], '2026-08-06'),
   [0], 'yalnizca eslesen indeks doner');
```

- [ ] **Step 2: Testin başarısız olduğunu doğrula**

Run: `node test.js`
Beklenen: FAIL — `CALC.findDuplicates is not a function`

- [ ] **Step 3: Fonksiyonu yaz** — `calc.js` içinde `suggestLimits`'ten sonra:

```js
  // ── Ekstre çift kayıt koruması ──────────────────────────────
  // İki ISO tarih arasındaki gün farkı. Geçersizse Infinity.
  function dayDiff(a, b) {
    var ta = Date.parse(String(a || '') + 'T00:00:00Z');
    var tb = Date.parse(String(b || '') + 'T00:00:00Z');
    if (isNaN(ta) || isNaN(tb)) return Infinity;
    return Math.abs(ta - tb) / 86400000;
  }

  // İçe aktarılacak satırlardan mevcut kayıtlarla çakışanların indeksleri.
  // Eşleşme: tutar farkı ≤ 1 ₺ VE (satır tarihi veya bugün) mevcut kayda ≤ 1 gün uzaklıkta.
  // Bugün de kontrol edilir çünkü importStatementRows tüm satırları bugüne yazar.
  function findDuplicates(existing, incoming, todayIso) {
    var out = [];
    var ex = existing || [];
    (incoming || []).forEach(function (row, i) {
      var amt = Number(row.amt) || 0;
      var dates = [String(row.d || '')];
      if (todayIso && dates.indexOf(todayIso) === -1) dates.push(todayIso);
      for (var j = 0; j < ex.length; j++) {
        var e = ex[j];
        if (Math.abs((Number(e.amt) || 0) - amt) > 1) continue;
        for (var k = 0; k < dates.length; k++) {
          if (dayDiff(e.d, dates[k]) <= 1) { out.push(i); return; }
        }
      }
    });
    return out;
  }
```

- [ ] **Step 4: `return` bloğuna ekle**

```js
    median: median, suggestLimits: suggestLimits,
    findDuplicates: findDuplicates
```

- [ ] **Step 5: Testlerin geçtiğini doğrula**

Run: `node test.js`
Beklenen: PASS, `0 kaldi`

- [ ] **Step 6: Commit**

```bash
git add calc.js test.js
git commit -m "feat: ekstre cift kayit tespiti (calc)"
```

---

## Task 4: `app.js` — depolama (sub.paid normalizasyonu + lastBank)

**Files:**
- Modify: `app.js` — state varsayılanı (~satır 290), `loadFromStorage` subs bloğu (~satır 388), `save()` (~satır 427)

- [ ] **Step 1: State varsayılanına `lastBank` ekle** — `app.js` içinde `selCat: 'yemek',` satırından önce:

```js
  lastBank: 'Havale', // Hızlı Giriş'te son kullanılan kaynak — bir sonraki girişte seçili gelir
```

- [ ] **Step 2: `loadFromStorage` içinde subs okumasını normalize et** — mevcut blok:

```js
    const sb = localStorage.getItem('ay_subs');
    if (sb !== null) {
      const parsed = JSON.parse(sb);
      if (Array.isArray(parsed)) S.subs = parsed.map(s => ({...s, id: s.id || genId()}));
    }
```

yerine:

```js
    const sb = localStorage.getItem('ay_subs');
    if (sb !== null) {
      const parsed = JSON.parse(sb);
      // paid: { 'YYYY-MM': {expId, at} } — eski kayıtlarda yok, okurken {} atanır.
      // Ayrı bir migration adımına gerek yok; eski JSON yedekleri de bu yolla normalize olur.
      if (Array.isArray(parsed)) S.subs = parsed.map(s => ({
        ...s,
        id: s.id || genId(),
        paid: (s.paid && typeof s.paid === 'object' && !Array.isArray(s.paid)) ? s.paid : {}
      }));
    }
```

- [ ] **Step 3: `loadFromStorage` içine lastBank okumasını ekle** — `ay_monthlim` bloğundan sonra:

```js
  try {
    const lb = localStorage.getItem('ay_lastbank');
    if (lb) S.lastBank = lb;
  } catch(e) {}
```

- [ ] **Step 4: `save()` içine lastBank yazmasını ekle** — `localStorage.setItem('ay_findeks', ...)` satırından sonra:

```js
    localStorage.setItem('ay_lastbank', String(S.lastBank || 'Havale'));
```

- [ ] **Step 5: Testlerin hâlâ geçtiğini doğrula**

Run: `node test.js`
Beklenen: PASS, `0 kaldi` (calc.js değişmedi, regresyon kontrolü)

- [ ] **Step 6: Commit**

```bash
git add app.js
git commit -m "feat: sub.paid normalizasyonu ve son kaynak hafizasi"
```

---

## Task 5: `app.js` — Abonelik durum kartı (Özet ekranı)

**Files:**
- Modify: `app.js` — `buildDesignLayout()` `s-dash` şablonu, yeni fonksiyonlar, `renderDash()`, `delExp()`

- [ ] **Step 1: Kartın konteynerini şablona ekle** — `buildDesignLayout()` içinde `s-dash` şablonunda, `<div class="hero-card">…</div>` kapanışından SONRA, `<div class="card card--primary" id="dist-card">` satırından ÖNCE:

```html
      <div class="card card--primary subs-card" id="subs-card">
        <div class="card-h"><h3>Abonelikler</h3><span class="hint num" id="subs-hint">—</span></div>
        <div id="subs-body"></div>
      </div>
```

- [ ] **Step 2: Render ve eylem fonksiyonlarını yaz** — `app.js` içinde `renderSubs()` fonksiyonundan ÖNCE (ABONELİK CRUD başlığının hemen altına):

```js
// ── Özet ekranı abonelik durum kartı ──────────────────────────
// Araçlar'daki renderSubs() CRUD listesidir; bu onun canlı, durumlu yüzü.
function renderSubsStatus(monthKey){
  const body=document.getElementById('subs-body');
  const hint=document.getElementById('subs-hint');
  if(!body) return;
  const today=new Date().toISOString().slice(0,10);
  const st=CALC.subsStatus(S.subs||[], monthKey, today);
  const isCurMonth = (monthKey === MK[CUR_IDX]);

  if(!st.count){
    if(hint) hint.textContent='';
    body.innerHTML=`<div class="empty-line">Abonelik tanımlı değil. <button type="button" class="linky" onclick="openSubsTool()">+ Ekle</button></div>`;
    return;
  }
  if(hint) hint.textContent=`${fmt(st.total)} ₺`;

  const head=`<div class="subs-sum">`
    + `<span class="subs-sum-item paid">${st.paidCount} ödendi</span>`
    + `<span class="subs-sum-item pending">${st.count-st.paidCount} bekliyor</span>`
    + `<span class="subs-sum-amt num">${fmt(st.pendingTotal)} ₺ kaldı</span>`
    + `</div>`;

  body.innerHTML = head + st.rows.map(r=>{
    const badge = r.state==='paid'
      ? `<span class="sub-state paid">✓ ödendi</span>`
      : r.state==='late'
        ? `<span class="sub-state late">${isCurMonth?'gecikmiş':'ödenmedi'}</span>`
        : `<span class="sub-state due">bekliyor</span>`;
    const act = r.state==='paid'
      ? `<button type="button" class="sub-act undo" onclick="unpaySub('${escAttr(r.id)}','${escAttr(monthKey)}')">geri al</button>`
      : `<button type="button" class="sub-act pay" onclick="paySub('${escAttr(r.id)}','${escAttr(monthKey)}')">Ödedim</button>`;
    return `<div class="sub-line ${r.state}">`
      + monoChip(r.cat||'dijital','sm')
      + `<div class="sub-line-info">`
      +   `<div class="sub-line-name">${escapeHtml(r.name||'—')}${r.pending?' <span class="sub-pending">yeni</span>':''}</div>`
      +   `<div class="sub-line-meta">ayın ${r.day}'i · ${escapeHtml(r.bank||'—')}</div>`
      + `</div>`
      + `<div class="sub-line-right"><span class="sub-line-amt num">${fmt(r.amt)} ₺</span>${badge}${act}</div>`
      + `</div>`;
  }).join('');
}

// "Ödedim" → gerçek bir gider kaydı oluşturur. Otomatik kayıt YOK; her zaman kullanıcı onayıyla.
function paySub(id, monthKey){
  const s=(S.subs||[]).find(x=>x.id===id);
  if(!s) return;
  s.paid=s.paid||{};
  if(s.paid[monthKey]) return; // çift basma koruması
  const meta=catMeta(s.cat);
  const d=CALC.subDueDate(monthKey, s.dayOfMonth);
  const exp={
    id:genId(), d:d||new Date().toISOString().slice(0,10),
    desc:s.name||(meta&&meta.label)||'Abonelik',
    cat:s.cat||'dijital', amt:+s.amt||0, bank:s.bank||'Enpara',
    subId:s.id // hangi abonelikten geldiği izlenebilsin
  };
  S.userExp.push(exp); S.expenses.push(exp);
  s.paid[monthKey]={expId:exp.id, at:new Date().toISOString()};
  if(s.pending) s.pending=false; // ödeme onayı, aday onayı yerine de geçer
  save(); renderDash(); renderSubs(); renderTxn&&renderTxn();
  toast(`✓ ${exp.desc} — ${fmt(exp.amt)} ₺ gider kaydedildi`);
}

function unpaySub(id, monthKey){
  const s=(S.subs||[]).find(x=>x.id===id);
  if(!s||!s.paid||!s.paid[monthKey]) return;
  const expId=s.paid[monthKey].expId;
  S.userExp=S.userExp.filter(e=>e.id!==expId);
  S.expenses=S.expenses.filter(e=>e.id!==expId);
  delete s.paid[monthKey];
  save(); renderDash(); renderSubs(); renderTxn&&renderTxn();
  toast('Geri alındı');
}

// Bir gider silindiğinde ona bağlı ödeme işaretini temizler — kart ile
// gerçek kayıtlar birbirinden kopmasın.
function clearSubPaidByExp(expId){
  (S.subs||[]).forEach(s=>{
    if(!s.paid) return;
    Object.keys(s.paid).forEach(k=>{
      if(s.paid[k] && s.paid[k].expId===expId) delete s.paid[k];
    });
  });
}

// Araçlar > Abonelikler panelini açar
function openSubsTool(){
  S.openTool='abonelik';
  save();
  go('more', document.getElementById('nb-more'));
  const el=document.getElementById('tool-abonelik');
  if(el) el.scrollIntoView({block:'start'});
}
```

- [ ] **Step 3: `renderDash()` içinden çağır** — `renderHero(m);` satırından SONRA:

```js
  renderSubsStatus(monthKey);
```

- [ ] **Step 4: `delExp()` içinde işaret temizle** — mevcut gövde:

```js
  S.userExp=S.userExp.filter(e=>e.id!==id);
  S.expenses=S.expenses.filter(e=>e.id!==id);
  save();renderTxn();renderDash();
```

yerine:

```js
  S.userExp=S.userExp.filter(e=>e.id!==id);
  S.expenses=S.expenses.filter(e=>e.id!==id);
  clearSubPaidByExp(id);
  save();renderTxn();renderDash();
```

- [ ] **Step 5: Tarayıcıda doğrula**

`index.html`'i aç. Araçlar > Abonelikler'den bir abonelik ekle (örn. Netflix, 190 ₺, ayın 25'i).
Özet'e dön. Beklenen: hero'nun altında "Abonelikler · 190 ₺" kartı, satırda "Ödedim".
"Ödedim"e bas → toast çıkar, İşlemler listesinde 25'i tarihli gider görünür, satır "✓ ödendi" olur.
"geri al" → gider kaybolur, satır "bekliyor"a döner.

- [ ] **Step 6: Commit**

```bash
git add app.js
git commit -m "feat: ozet ekraninda abonelik durum karti"
```

---

## Task 6: `app.js` — Takvimde abonelik işaretleri

**Files:**
- Modify: `app.js` — `renderDashCalendar()` (~satır 1320), `renderDayList()` (~satır 1377)

- [ ] **Step 1: Takvim noktalarını ekle** — `renderDashCalendar()` içinde `cardMarks` bloğundan SONRA, `// Current month` yorumundan ÖNCE:

```js
  // Abonelik tahsilat günleri — kart noktalarından ayrışsın diye içi boş halka
  const subMarks={}; // {day: {count, allPaid}}
  {
    const _today=new Date().toISOString().slice(0,10);
    CALC.subsStatus(S.subs||[], monthKey, _today).rows.forEach(r=>{
      const e=subMarks[r.day]=subMarks[r.day]||{count:0, allPaid:true};
      e.count++;
      if(r.state!=='paid') e.allPaid=false;
    });
  }
```

- [ ] **Step 2: Gün hücresine noktayı ekle** — aynı fonksiyondaki gün döngüsünde, `const cardDots=…` satırından SONRA:

```js
    const sm=subMarks[d];
    const subDot = sm ? `<span class="dot sub-dot-mark ${sm.allPaid?'paid':''}" title="${sm.count} abonelik"></span>` : '';
```

ve hücre HTML'inde `${dots}${cardDots}` yerine `${dots}${cardDots}${subDot}` yaz.

- [ ] **Step 3: Gün paneline abonelik bloğu ekle** — `renderDayList()` içinde `cardEventsHtml` tanımından SONRA:

```js
  const monthKeyOfDay=iso.slice(0,7);
  const todayIsoNow=new Date().toISOString().slice(0,10);
  const daySubs=CALC.subsStatus(S.subs||[], monthKeyOfDay, todayIsoNow).rows.filter(r=>r.dueIso===iso);
  const subEventsHtml = daySubs.length
    ? `<div class="day-sub-events">${daySubs.map(r=>{
        const act = r.state==='paid'
          ? `<button type="button" class="sub-act undo" onclick="unpaySub('${escAttr(r.id)}','${escAttr(monthKeyOfDay)}')">geri al</button>`
          : `<button type="button" class="sub-act pay" onclick="paySub('${escAttr(r.id)}','${escAttr(monthKeyOfDay)}')">Ödedim</button>`;
        return `<div class="day-sub-event"><span class="sub-ring ${r.state==='paid'?'paid':''}"></span>`
          + `<span class="day-sub-name">${escapeHtml(r.name||'—')}</span>`
          + `<span class="day-sub-amt num">${fmt(r.amt)} ₺</span>${act}</div>`;
      }).join('')}</div>`
    : '';
```

- [ ] **Step 4: Bloğu üç çıktı noktasına da ekle** — `renderDayList()` sonundaki üç `list.innerHTML=` atamasında `cardEventsHtml`'ten sonra `subEventsHtml` ekle:

```js
    list.innerHTML=head+cardEventsHtml+subEventsHtml+`<div class="day-empty">Bu gün için işlem kaydı yok.</div>`;
```

ve

```js
  list.innerHTML=head+cardEventsHtml+subEventsHtml+body;
```

(Üçüncü nokta `if(!iso)` erken dönüşüdür; orada abonelik gösterilmez, dokunma.)

- [ ] **Step 5: Tarayıcıda doğrula**

Özet > Takvim. Beklenen: abonelik gününde içi boş halka. O güne dokun → panelde abonelik satırı ve "Ödedim". Ödendikten sonra halka soluklaşır.

- [ ] **Step 6: Commit**

```bash
git add app.js
git commit -m "feat: takvimde abonelik isaretleri ve gun paneli"
```

---

## Task 7: `app.js` — Hızlı Giriş sürtünme azaltması

**Files:**
- Modify: `app.js` — `quickAdd()` (~satır 2004), `buildCatGrid()` (~satır 1484), `pickQuickBank()` (~satır 737), `buildDesignLayout()` `s-quick` şablonu, `go()` (~satır 2782)

- [ ] **Step 1: Tekrarla şeridinin konteynerini ekle** — `s-quick` şablonunda `fav-strip-card` kartından SONRA, `quick-main-card`'dan ÖNCE:

```html
      <div class="card card--secondary repeat-card" id="repeat-card"><div class="card-h"><h3>Tekrarla</h3><span class="hint">son 30 gün</span></div><div class="repeat-strip" id="repeat-strip"></div></div>
```

- [ ] **Step 2: `quickAdd()`'i değiştir** — mevcut gövdeyi tamamen değiştir:

```js
function quickAdd(){
  const amt=parseTrNum(document.getElementById('q-amt').value);
  const d=document.getElementById('q-date').value;
  const bank=document.getElementById('q-bank').value;
  // Açıklama artık opsiyonel — boşsa kategori etiketi yazılır. Günlük giriş
  // alışkanlığında her seferinde metin yazmak en büyük sürtünmeydi.
  const typed=document.getElementById('q-desc').value.trim();
  const desc=typed||((catMeta(S.selCat)||{}).label)||'Harcama';
  if(!amt){toast('Tutar girin',true);return;}
  if(!d){toast('Tarih seçin',true);return;}
  const newExp={id:genId(),d,desc,cat:S.selCat,amt,bank};
  S.userExp.push(newExp);
  S.expenses.push(newExp);
  S.lastBank=bank;
  save();
  toast(`✓ ${desc} — ${fmt(amt)} ₺ eklendi`);
  // Arka arkaya giriş: yalnızca tutar ve açıklama temizlenir.
  // Kategori, kaynak ve tarih korunur; odak tutara döner.
  document.getElementById('q-amt').value='';
  document.getElementById('q-desc').value='';
  const amtEl=document.getElementById('q-amt');
  if(amtEl) amtEl.focus();
  renderTxn();renderDash();renderRepeatChips();renderLiveBudget();
}
```

- [ ] **Step 3: Tekrarla şeridini yaz** — `quickAdd()`'ten sonra:

```js
// Son 30 günün en sık girişleri. Sık Havale'den farkı: kullanıcı tanımlamaz,
// kendi geçmişinden beslenir.
function renderRepeatChips(){
  const el=document.getElementById('repeat-strip');
  if(!el) return;
  const since=new Date(); since.setDate(since.getDate()-30);
  const sinceIso=since.toISOString().slice(0,10);
  const groups={};
  S.expenses.filter(e=>e.d>=sinceIso&&e.cat!=='uyap').forEach(e=>{
    const key=`${(e.desc||'').trim()}|${e.cat}|${+e.amt||0}`;
    if(!groups[key]) groups[key]={desc:e.desc,cat:e.cat,amt:+e.amt||0,bank:e.bank,n:0,last:e.d};
    groups[key].n++;
    if(e.d>groups[key].last){ groups[key].last=e.d; groups[key].bank=e.bank; }
  });
  const top=Object.values(groups).sort((a,b)=> b.n-a.n || b.last.localeCompare(a.last)).slice(0,6);
  const card=document.getElementById('repeat-card');
  if(!top.length){
    if(card) card.style.display='none';
    el.innerHTML='';
    return;
  }
  if(card) card.style.display='';
  el.innerHTML=top.map((g,i)=>`<button type="button" class="repeat-chip" onclick="repeatEntry(${i})">`
    + monoChip(g.cat,'sm')
    + `<span class="repeat-chip-body"><span class="repeat-chip-desc">${escapeHtml(g.desc||'—')}</span>`
    + `<span class="repeat-chip-amt num">${fmt(g.amt)} ₺</span></span></button>`).join('');
  REPEAT_CACHE=top;
}
let REPEAT_CACHE=[];

function repeatEntry(i){
  const g=REPEAT_CACHE[i];
  if(!g) return;
  const exp={id:genId(),d:new Date().toISOString().slice(0,10),desc:g.desc,cat:g.cat,amt:g.amt,bank:g.bank||S.lastBank||'Havale'};
  S.userExp.push(exp); S.expenses.push(exp);
  save();
  toast(`✓ ${exp.desc} — ${fmt(exp.amt)} ₺ · geri al`, false, ()=>undoEntry(exp.id));
  renderTxn();renderDash();renderRepeatChips();
}

function undoEntry(id){
  S.userExp=S.userExp.filter(e=>e.id!==id);
  S.expenses=S.expenses.filter(e=>e.id!==id);
  clearSubPaidByExp(id);
  save(); renderTxn(); renderDash(); renderRepeatChips();
  toast('Geri alındı');
}
```

- [ ] **Step 4: `toast()`'a geri al desteği ekle** — mevcut fonksiyonu bul:

```js
function toast(msg,isErr){
```

Mevcut gövdenin sonuna, elemanın gösterildiği yerden sonra `onUndo` desteği ekle. Mevcut `toast` gövdesini oku ve şu imzaya genişlet:

```js
function toast(msg,isErr,onUndo){
```

Gövdenin sonunda, `t.className`/`t.textContent` atamalarından sonra:

```js
  if(typeof onUndo==='function'){
    t.innerHTML=escapeHtml(msg)+` <button type="button" class="toast-undo">geri al</button>`;
    const b=t.querySelector('.toast-undo');
    if(b) b.onclick=()=>{ onUndo(); t.classList.remove('on'); };
  }
```

(Not: mevcut `toast` gövdesindeki sınıf/zamanlayıcı mantığına dokunma; yalnızca bu blok eklenir.)

- [ ] **Step 5: Son kaynağı hatırla** — `buildCatGrid()` içindeki `renderChoiceChips('q-bank-chips', …)` çağrısından ÖNCE:

```js
  const bankSel=document.getElementById('q-bank');
  if(bankSel && S.lastBank && bankSel.value!==S.lastBank) bankSel.value=S.lastBank;
```

Ve `pickQuickBank`'i güncelle:

```js
function pickQuickBank(v){ setSelectValue('q-bank',v); S.lastBank=v; save(); buildCatGrid(); }
```

- [ ] **Step 6: `go('quick')` dalına yeni renderları ekle** — mevcut dal:

```js
  else if(screen==='quick'){
    buildCatGrid();buildFavList();renderTxn();
```

yerine:

```js
  else if(screen==='quick'){
    buildCatGrid();buildFavList();renderTxn();renderRepeatChips();renderLiveBudget();
```

- [ ] **Step 7: Tarayıcıda doğrula**

Gider sekmesi. Beklenen: "Tekrarla" kartında son girişlerin çipleri. Tutar gir, açıklamayı BOŞ bırak, Kaydet → kayıt kategori adıyla oluşur, tutar temizlenir, kategori/kaynak/tarih yerinde kalır. Çipe bas → bugüne kayıt + toast'ta "geri al".

- [ ] **Step 8: Commit**

```bash
git add app.js
git commit -m "feat: hizli giriste surtunme azaltmasi (opsiyonel aciklama, tekrarla, kaynak hafizasi)"
```

---

## Task 8: `app.js` — Canlı bütçe şeridi + bugün harcanabilir

**Files:**
- Modify: `app.js` — `s-quick` şablonu, `selCat()`, yeni `renderLiveBudget()`, `renderHero()`, `s-dash` şablonu

- [ ] **Step 1: Şerit konteynerini ekle** — `s-quick` şablonunda `<div class="cat-section">…</div>` bloğunun KAPANIŞINDAN sonra, `<button class="btn btn-primary btn-block" onclick="quickAdd()">` satırından ÖNCE:

```html
<div class="live-budget" id="live-budget"></div>
```

- [ ] **Step 2: Hero'ya harcanabilir satırı ekle** — `s-dash` şablonunda `goal-wrap-hero` div'inin KAPANIŞINDAN sonra, `hero-card` kapanışından ÖNCE:

```html
<div class="allowance-line" id="allowance-line"></div>
```

- [ ] **Step 3: `renderLiveBudget()` yaz** — `app.js` içinde `buildCatGrid()`'den sonra:

```js
// Girerken canlı geri bildirim. Bilgi verir, ENGELLEMEZ — Kaydet hiçbir koşulda kilitlenmez.
function renderLiveBudget(){
  const el=document.getElementById('live-budget');
  if(!el) return;
  const cat=S.selCat;
  const meta=catMeta(cat)||{};
  const m=CUR_IDX; // canlı geri bildirim her zaman içinde bulunulan ay için
  const spent=catMonth(cat,m);
  const limit=Number(S.budgets[cat])||0;
  const typed=parseTrNum((document.getElementById('q-amt')||{}).value||'');
  const amt=Number.isFinite(typed)?typed:0;

  if(!limit){
    el.className='live-budget';
    el.innerHTML=`<div class="lb-head"><span>${escapeHtml(meta.label||cat)} · bu ay ${fmt(spent)} ₺</span>`
      + `<button type="button" class="lb-set" onclick="openCatLimitEditor('${escAttr(cat)}')">limit yok · belirle</button></div>`;
    return;
  }
  const a=CALC.afterEntry(spent, limit, amt);
  const barPct=Math.min(a.pct,100);
  const tail = a.remaining>=0
    ? (amt>0 ? `bu girişten sonra: ${fmt(a.remaining)} ₺ kalır` : `${fmt(limit-spent)} ₺ kaldı`)
    : `${fmt(Math.abs(a.remaining))} ₺ aşım`;
  el.className='live-budget lb-'+a.level;
  el.innerHTML=`<div class="lb-head"><span>${escapeHtml(meta.label||cat)} · bu ay ${fmt(spent)} / ${fmt(limit)} ₺</span><span class="num">%${a.pct}</span></div>`
    + `<div class="lb-track"><div class="lb-fill" style="width:${barPct}%"></div></div>`
    + `<div class="lb-tail">${tail}</div>`;
}
```

- [ ] **Step 4: Tetikleyicileri bağla** — `selCat()`'i güncelle:

```js
function selCat(id){S.selCat=id;buildCatGrid();renderLiveBudget();}
```

`quickPad()` fonksiyonunun sonuna (numpad tutarı değiştirir):

```js
  renderLiveBudget();
```

`s-quick` şablonundaki tutar inputuna `oninput` ekle — mevcut:

```html
<input type="text" id="q-amt" placeholder="0" inputmode="decimal" autocomplete="off">
```

yerine:

```html
<input type="text" id="q-amt" placeholder="0" inputmode="decimal" autocomplete="off" oninput="renderLiveBudget()">
```

- [ ] **Step 5: `renderHero()` sonuna harcanabilir satırını ekle** — fonksiyonun her iki çıkışında da çalışması için, `renderHero(m)` gövdesinin EN BAŞINA şu satırı ekle (erken `return` var):

```js
  renderAllowance(m);
```

Ve `renderHero`'dan sonra yeni fonksiyon:

```js
// Bugün harcanabilir = (aylık limit − bu ayın gideri) ÷ ayın kalan günü.
// Yalnızca içinde bulunulan ay görüntülenirken ve limit tanımlıyken gösterilir.
function renderAllowance(m){
  const el=document.getElementById('allowance-line');
  if(!el) return;
  if(m!==CUR_IDX){ el.style.display='none'; el.innerHTML=''; return; }
  const lim=effectiveMonthLimit();
  const today=new Date().toISOString().slice(0,10);
  const a=CALC.dailyAllowance(lim, monthP(m), today);
  if(!a){ el.style.display='none'; el.innerHTML=''; return; }
  el.style.display='';
  if(a.remaining<=0){
    el.className='allowance-line over';
    el.innerHTML=`Aylık limit aşıldı · <strong class="num">${fmt(Math.abs(a.remaining))} ₺</strong>`;
    return;
  }
  el.className='allowance-line';
  el.innerHTML=`Bugün harcanabilir <strong class="num">${fmt(a.perDay)} ₺</strong> <span class="allowance-sub">${fmt(a.remaining)} ₺ ÷ ${a.daysLeft} gün</span>`;
}
```

- [ ] **Step 6: Tarayıcıda doğrula**

Gider sekmesi: kategori seç, tutar yaz → şerit canlı güncellenir, %90'da sarı, aşımda kırmızı, **Kaydet hep aktif**. Limitsiz kategoride "limit yok · belirle" çıkar, tıklayınca editör açılır.
Özet: hero altında "Bugün harcanabilir X ₺". Geçmiş aya git → satır kaybolur.

- [ ] **Step 7: Commit**

```bash
git add app.js
git commit -m "feat: canli butce seridi ve gunluk harcanabilir tutar"
```

---

## Task 9: `app.js` — Gerçek harcamadan limit önerisi

**Files:**
- Modify: `app.js` — `s-more` şablonundaki `kategori` aracı, yeni `renderLimitSuggestions()`, `renderTools()`

- [ ] **Step 1: Konteyneri ekle** — `s-more` şablonunda `kategori` aracının içinde, `<div id="budget-unrev-panel"></div>` satırından SONRA:

```html
<div id="limit-suggest-panel"></div>
```

- [ ] **Step 2: Fonksiyonu yaz** — `app.js` içinde `resetBudgetsToDefault()`'tan sonra:

```js
// Limitleri tahminle değil kendi verinle oturt: son 3 tam ayın medyanı.
// Medyan seçildi çünkü tek seferlik büyük harcama ortalamayı yanıltır.
function renderLimitSuggestions(){
  const el=document.getElementById('limit-suggest-panel');
  if(!el) return;
  const cats=getVisibleCats().filter(c=>c.id!=='uyap').map(c=>c.id);
  const sug=CALC.suggestLimits(S.expenses, MK, CUR_IDX, cats, 3);
  const ids=Object.keys(sug).filter(id=>sug[id]>0);
  if(!ids.length){ el.innerHTML=''; return; }
  el.innerHTML=`<div class="sug-panel">`
    + `<div class="sug-head"><span>Gerçek harcamandan limit önerisi</span>`
    + `<button type="button" class="btn btn-secondary sug-all" onclick="applyAllSuggestions()">Hepsini uygula</button></div>`
    + `<div class="sug-note">Son 3 tam ayın medyanı. İçinde bulunulan ay hesaba katılmaz.</div>`
    + ids.map(id=>{
        const cur=Number(S.budgets[id])||0;
        return `<div class="sug-row">${monoChip(id,'sm')}`
          + `<span class="sug-name">${escapeHtml(catMeta(id).label||id)}</span>`
          + `<span class="sug-cur num">${cur?fmt(cur)+' ₺':'—'}</span>`
          + `<span class="sug-arrow">→</span>`
          + `<span class="sug-new num">${fmt(sug[id])} ₺</span>`
          + `<button type="button" class="sug-apply" onclick="applySuggestion('${escAttr(id)}',${sug[id]})">Uygula</button>`
          + `</div>`;
      }).join('')
    + `</div>`;
}

function applySuggestion(catId, value){
  S.budgets[catId]=+value||0;
  save(); renderDash(); renderLimitSuggestions(); renderCatManager&&renderCatManager();
  toast(`${catMeta(catId).label} limiti ${fmt(value)} ₺`);
}

function applyAllSuggestions(){
  const cats=getVisibleCats().filter(c=>c.id!=='uyap').map(c=>c.id);
  const sug=CALC.suggestLimits(S.expenses, MK, CUR_IDX, cats, 3);
  const ids=Object.keys(sug).filter(id=>sug[id]>0);
  if(!ids.length) return;
  if(!confirm(`${ids.length} kategorinin limiti önerilen değerlerle güncellenecek. Devam edilsin mi?`)) return;
  ids.forEach(id=>{ S.budgets[id]=sug[id]; });
  save(); renderDash(); renderLimitSuggestions(); renderCatManager&&renderCatManager();
  toast(`✓ ${ids.length} limit güncellendi`);
}
```

- [ ] **Step 3: `renderTools()`'a bağla** — mevcut satır:

```js
  if(S.openTool==='kategori'){ renderCatManager(); renderBudget(); }
```

yerine:

```js
  if(S.openTool==='kategori'){ renderCatManager(); renderBudget(); renderLimitSuggestions(); }
```

- [ ] **Step 4: Tarayıcıda doğrula**

Araçlar > Kategoriler. Beklenen: "Gerçek harcamandan limit önerisi" paneli, her satırda mevcut → önerilen ve "Uygula". Uygula → Özet'teki dağılım kartında limit güncellenir.

- [ ] **Step 5: Commit**

```bash
git add app.js
git commit -m "feat: gercek harcamadan kategori limit onerisi"
```

---

## Task 10: `app.js` — Ekstre çift kayıt koruması

**Files:**
- Modify: `app.js` — `importStatementRows()` (~satır 900), `parseStmt()` sonuç metinleri (~satır 2307, 2320, 2337)

**Neden `importStatementRows` içinde:** `parseStmt()` üç ayrı dalda (Gemini / fallback / hata-fallback) aynı fonksiyonu çağırıyor. Filtreyi fonksiyonun içine koymak üç dalı da tek noktadan korur.

- [ ] **Step 1: `importStatementRows()`'u değiştir** — mevcut gövdeyi değiştir:

```js
// Son içe aktarımda çift olduğu için atlanan satırlar. parseStmt sonucu bunu gösterir.
let LAST_SKIPPED=[];
function importStatementRows(rows){
  // Ekstre giriş tarihi override: orijinal transaction tarihlerini yoksay,
  // hepsini bugüne kaydet. Takvimde tek kırmızı nokta, bütçe kategorileri korunur.
  const today=new Date().toISOString().slice(0,10);
  // Manuel giriş artık birincil yol: aynı harcamanın hem elle hem ekstreden
  // girilmesi asıl risk. Olası çiftler varsayılan olarak İÇE AKTARILMAZ.
  const dupIdx=new Set(CALC.findDuplicates(S.expenses, rows||[], today));
  LAST_SKIPPED=[];
  let added=0;
  (rows||[]).forEach((row,i)=>{
    const clean={
      id:row.id||genId(),
      d:today,  // orijinal row.d yoksayıldı
      desc:(row.desc||'').trim(),
      amt:Math.abs(Number(row.amt)||0),
      cat:getCats().some(c=>c.id===row.cat)?row.cat:'diger',
      bank:(row.bank||'').trim()
    };
    if(!clean.desc||!clean.amt||!clean.bank) return;
    if(dupIdx.has(i)){ LAST_SKIPPED.push(clean); return; }
    S.userExp.push(clean);
    S.expenses.push(clean);
    added++;
  });
  return added;
}

// Atlanan bir satırı kullanıcı yine de eklemek isterse
function forceAddSkipped(i){
  const row=LAST_SKIPPED[i];
  if(!row) return;
  S.userExp.push(row); S.expenses.push(row);
  LAST_SKIPPED.splice(i,1);
  save(); renderDash(); renderTxn&&renderTxn();
  const res=document.getElementById('parse-res');
  if(res) res.innerHTML=res.innerHTML; // liste yeniden çizilmez; kullanıcı toast ile bilgilenir
  toast(`✓ ${row.desc} eklendi`);
}

// Atlanan satırların sonuç metnine eklenecek özeti
function skippedSummary(){
  if(!LAST_SKIPPED.length) return '';
  return `\n\n⚠ ${LAST_SKIPPED.length} satır olası çift kayıt olduğu için atlandı `
    + `(aynı tutar, ±1 gün):\n`
    + LAST_SKIPPED.map(r=>`  ${r.desc}: ${fmt(r.amt)} ₺`).join('\n')
    + `\nGerçekten ayrı harcamalarsa Gider ekranından elle ekleyebilirsin.`;
}
```

- [ ] **Step 2: Sonuç metinlerine özeti ekle** — `parseStmt()` içinde üç `resultEl.textContent=` atamasının SONUNA `+skippedSummary()` ekle. Üç yer:

```js
      resultEl.textContent=`✓ Gemini ile ${added} kalem ${todayStr} tarihine kaydedildi.\nTakvimde tek kırmızı nokta · bütçe kategorileri güncellendi.\n\n`+rows.map(t=>`  ${t.desc}: ${fmt(t.amt)} ₺`).join('\n')+skippedSummary();
```

```js
        resultEl.textContent=`✓ Yerel parser ile ${added} kalem ${todayStr} tarihine kaydedildi.\nTakvimde tek kırmızı nokta · bütçe kategorileri güncellendi.\n\n`+fallbackRows.map(t=>`  ${t.desc}: ${fmt(t.amt)} ₺`).join('\n')+skippedSummary();
```

```js
      resultEl.textContent=`⚠ Gemini hatası: ${friendlyGeminiError(e)}\n\nYerel parser ile ${added} kalem ${todayStr} tarihine kaydedildi.\n\n`+fallbackRows.map(t=>`  ${t.desc}: ${fmt(t.amt)} ₺`).join('\n')+skippedSummary();
```

- [ ] **Step 3: Ekstre kartının notunu güncelle** — `s-more` şablonunda `ekstre` aracındaki `field-note`:

```html
<div class="field-note">Kalemler <strong>bugünün tarihine</strong> kaydedilir. Önce Gemini denenir; başarısız olursa yerel parser devreye girer.</div>
```

yerine:

```html
<div class="field-note">Artık birincil giriş yolu değil — <strong>mutabakat</strong> için: elle girmeyi atladığın kalemleri yakalar. Kalemler bugünün tarihine kaydedilir. Elle girdiğin kayıtlarla çakışan satırlar (aynı tutar, ±1 gün) otomatik atlanır. Önce Gemini denenir; başarısız olursa yerel parser devreye girer.</div>
```

- [ ] **Step 4: Tarayıcıda doğrula**

Gider ekranından elle bir kayıt gir (örn. 565 ₺, bugün). Araçlar > Ekstre'ye aynı tutarı içeren bir metin yapıştır ve içe aktar. Beklenen: sonuç metninde "1 satır olası çift kayıt olduğu için atlandı" ve o kalem eklenmez.

- [ ] **Step 5: Commit**

```bash
git add app.js
git commit -m "feat: ekstre ice aktarimda cift kayit korumasi"
```

---

## Task 11: `app.css` — yeni bileşen stilleri

**Files:**
- Modify: `app.css` (dosya sonuna eklenir)

- [ ] **Step 1: Stilleri ekle** — `app.css` sonuna:

```css
/* ── Abonelik durum kartı (Özet) ───────────────────────────── */
.subs-sum{display:flex;align-items:center;gap:var(--s-2);flex-wrap:wrap;margin-bottom:var(--s-2);font-size:12px;color:var(--text3)}
.subs-sum-item.paid{color:var(--pos)}
.subs-sum-item.pending{color:var(--text2)}
.subs-sum-amt{margin-left:auto;font-weight:600;color:var(--text)}
.sub-line{display:flex;align-items:center;gap:var(--s-2);padding:8px 0;border-top:1px solid var(--line)}
.sub-line:first-of-type{border-top:none}
.sub-line-info{flex:1;min-width:0}
.sub-line-name{font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sub-line-meta{font-size:11px;color:var(--text3)}
.sub-line-right{display:flex;align-items:center;gap:8px;flex-shrink:0}
.sub-line-amt{font-size:13px;font-weight:600}
.sub-state{font-size:10px;padding:2px 6px;border-radius:6px;white-space:nowrap}
.sub-state.paid{color:var(--pos);background:rgba(62,201,138,.10)}
.sub-state.late{color:var(--neg);background:rgba(224,86,86,.10)}
.sub-state.due{color:var(--text3);background:var(--surface2,rgba(0,0,0,.04))}
.sub-line.paid{opacity:.62}
.sub-act{font-size:11px;padding:4px 10px;border-radius:8px;border:1px solid var(--line);background:transparent;color:var(--text);cursor:pointer}
.sub-act.pay{border-color:var(--ink);font-weight:600}
.sub-act.undo{color:var(--text3)}

/* ── Takvim abonelik noktası — kart noktalarından ayrışsın diye halka ── */
.dot.sub-dot-mark{width:6px;height:6px;border-radius:50%;background:transparent;border:1.5px solid var(--text2);box-sizing:border-box}
.dot.sub-dot-mark.paid{opacity:.4}
.day-sub-events{display:flex;flex-direction:column;gap:6px;padding:8px 0;border-top:1px solid var(--line)}
.day-sub-event{display:flex;align-items:center;gap:8px;font-size:12px}
.sub-ring{width:8px;height:8px;border-radius:50%;border:1.5px solid var(--text2);box-sizing:border-box;flex-shrink:0}
.sub-ring.paid{opacity:.4}
.day-sub-name{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.day-sub-amt{font-weight:600}

/* ── Tekrarla şeridi ───────────────────────────────────────── */
.repeat-strip{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;-webkit-overflow-scrolling:touch}
.repeat-chip{display:flex;align-items:center;gap:6px;padding:8px 10px;border:1px solid var(--line);border-radius:12px;background:transparent;cursor:pointer;flex-shrink:0;max-width:190px}
.repeat-chip-body{display:flex;flex-direction:column;align-items:flex-start;min-width:0}
.repeat-chip-desc{font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:130px}
.repeat-chip-amt{font-size:11px;color:var(--text3);font-weight:600}

/* ── Canlı bütçe şeridi (Hızlı Giriş) ──────────────────────── */
.live-budget{margin:var(--s-3) 0;padding:10px 12px;border:1px solid var(--line);border-radius:12px}
.live-budget.lb-warn{border-color:var(--warn)}
.live-budget.lb-over{border-color:var(--neg)}
.lb-head{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:12px;color:var(--text2)}
.lb-track{height:6px;border-radius:3px;background:var(--line);margin:8px 0 6px;overflow:hidden}
.lb-fill{height:100%;background:var(--pos);transition:width .15s ease}
.lb-warn .lb-fill{background:var(--warn)}
.lb-over .lb-fill{background:var(--neg)}
.lb-tail{font-size:11px;color:var(--text3)}
.lb-over .lb-tail{color:var(--neg)}
.lb-set{font-size:11px;padding:3px 8px;border-radius:8px;border:1px solid var(--line);background:transparent;color:var(--text3);cursor:pointer}

/* ── Bugün harcanabilir (hero) ─────────────────────────────── */
.allowance-line{margin-top:10px;font-size:12px;color:var(--text2)}
.allowance-line.over{color:var(--neg)}
.allowance-sub{color:var(--text3);font-size:11px}

/* ── Limit önerisi paneli (Araçlar > Kategoriler) ──────────── */
.sug-panel{border:1px solid var(--line);border-radius:12px;padding:12px;margin-bottom:var(--s-3)}
.sug-head{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:13px;font-weight:600;margin-bottom:4px}
.sug-all{padding:4px 10px;font-size:11px;flex-shrink:0}
.sug-note{font-size:11px;color:var(--text3);margin-bottom:8px}
.sug-row{display:flex;align-items:center;gap:8px;padding:6px 0;border-top:1px solid var(--line);font-size:12px}
.sug-name{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sug-cur{color:var(--text3)}
.sug-arrow{color:var(--text3)}
.sug-new{font-weight:600}
.sug-apply{font-size:11px;padding:4px 10px;border-radius:8px;border:1px solid var(--ink);background:transparent;color:var(--text);cursor:pointer}

/* ── Toast geri al ─────────────────────────────────────────── */
.toast-undo{margin-left:8px;font-size:11px;padding:2px 8px;border-radius:6px;border:1px solid currentColor;background:transparent;color:inherit;cursor:pointer}
```

- [ ] **Step 2: Tarayıcıda doğrula**

Her iki temada (Krem Kâğıt / Onyx & Altın) yeni kartların okunabilir olduğunu kontrol et. `--warn`, `--pos`, `--neg`, `--line`, `--text3` değişkenleri app.css'te tanımlı; yeni renk sabiti eklenmedi.

- [ ] **Step 3: Commit**

```bash
git add app.css
git commit -m "style: abonelik karti, tekrarla seridi, canli butce ve limit onerisi stilleri"
```

---

## Task 12: Regresyon doğrulaması ve NEXUS.md

**Files:**
- Modify: `NEXUS.md`

- [ ] **Step 1: Tüm testleri çalıştır**

Run: `node test.js`
Beklenen: PASS, `0 kaldi`

- [ ] **Step 2: Veri güvenliği doğrulaması (tarayıcıda)**

1. Araçlar > Veri > "JSON Yedeği İndir" → dosya iner
2. Dosyayı bir metin editöründe aç → `subs` dizisindeki kayıtlarda `paid` alanı görünmeli
3. Uygulamada bir abonelik "Ödedim" işaretle, sonra aynı yedeği "JSON Yedeği Yükle" ile geri yükle
4. Beklenen: yedekteki durum geri gelir, uygulama hata vermez, hiçbir gider kaybolmaz

- [ ] **Step 3: `NEXUS.md` [4] SONRAKI ADIM bölümünü güncelle**

```
[4] SONRAKI ADIM
Manuel giriş öncelikli akışa geçildi: abonelikler Özet ekranında durum kartı + takvimde
işaretli, Hızlı Giriş'te açıklama opsiyonel / tekrarla şeridi / kaynak hafızası, girerken
canlı bütçe şeridi, gerçek harcamadan kategori limit önerisi, ekstrede çift kayıt koruması.
Ekstre + AI akışı mutabakat aracı olarak duruyor.
Sonraki aday: kullanıcının kendi eklediği kategorileri Araçlar > Kategoriler panelinden
bir üst gruba atayabilmesi (şu an hepsi "Gruplanmamış" altında toplanıyor).
```

Ayrıca `[2] TEKNOLOJİ & ARAÇLAR` bölümünde localStorage satırına yeni anahtarı ekle:

```
- localStorage (veri kalıcılığı — `ay_exp`, `ay_inc`, `ay_bud`, `ay_subs`, `ay_lastbank`, `ay_gemini_key`)
```

- [ ] **Step 4: Commit ve push**

```bash
git add NEXUS.md
git commit -m "docs: NEXUS.md manuel giris akisi guncellemesi"
git push origin main
```

---

## Self-Review Notları

**Spec kapsamı:** Bölüm 1 → Task 5; Bölüm 2 → Task 6; Bölüm 3 → Task 7; Bölüm 4 → Task 8; Bölüm 5 → Task 9; Bölüm 6 → Task 10; Veri modeli/migration → Task 4; Test → Task 1-3 + Task 12.

**Tip tutarlılığı:** `CALC.subsStatus()` her satırda `{id, name, amt, cat, bank, dueIso, day, state, pending}` döner — Task 5 ve Task 6 aynı alan adlarını kullanır. `CALC.afterEntry()` `{after, remaining, pct, level}` döner; `level` değerleri `'ok'|'warn'|'over'` ve CSS sınıfları `lb-ok`/`lb-warn`/`lb-over` bunlarla birebir eşleşir.

**Bilinçli sınırlama:** `forceAddSkipped()` tanımlı ama parse sonucu düz metin (`textContent`) olduğu için şu an bir düğmeye bağlı değil. Atlanan satırlar kullanıcıya listelenir; gerçekten ayrı harcamalarsa Gider ekranından elle eklenir. HTML sonuç listesine geçiş ayrı bir iş.
