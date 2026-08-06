// ══════════════════════════════════════════════════════════════
// CALC — saf hesaplar. DOM yok, localStorage yok, yan etki yok.
// Hem tarayıcıda (global CALC) hem Node'da (module.exports) çalışır.
// Test: node test.js
// ══════════════════════════════════════════════════════════════
var CALC = (function () {

  // Para biçimi: 12480.4 → "12.480"
  function fmt(n) {
    return Math.round(n).toLocaleString('tr-TR');
  }

  // Türkçe sayı metnini sayıya çevirir: "1.234,56" → 1234.56
  // Gövde app.js'ten BİREBİR taşındı. İki davranışı bilerek korunuyor:
  //   parseTrNum('1.234') → 1.234 (1234 değil). Virgül yoksa nokta ondalık sayılır —
  //     numpad çıktısıyla uyumlu olsun diye kasıtlı. Yan etkisi: binlik ayraçla
  //     "1.234" yazan kullanıcı 1.234 ₺ kaydeder.
  //   parseTrNum('')      → NaN (0 değil). Çağıranlar bunu kontrol etmeli.
  // Bu bir karakterizasyon; davranış bu planda değiştirilmiyor.
  function parseTrNum(v) {
    var s = String(v == null ? '' : v).trim();
    if (s.indexOf(',') > -1) s = s.replace(/\./g, '').replace(',', '.');
    return parseFloat(s);
  }

  // 'YYYY-MM-DD' tarihini ay penceresi indeksine çevirir. Bulunamazsa -1.
  function mIdx(d, MK) {
    return MK.indexOf(String(d || '').slice(0, 7));
  }

  // ── Üst gruplar ─────────────────────────────────────────────
  // Gösterim sırası tutara göre belirlenir; bu dizi yalnızca etiket kaynağı.
  // 'uyap' bilerek yok: UYAP mesleki transfer, dağılıma girmiyor.
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

  // Bir ayın giderlerini üst gruplara toplar.
  // UYAP dağılıma dahil edilmez (mevcut monthP() kuralıyla aynı) — ayrı döner.
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

  // ── Karşılaştırma hesapları ─────────────────────────────────

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

  // ── Dikkat sinyalleri ───────────────────────────────────────
  var ARTIS_TL_ESIK  = 500;  // mutlak artış eşiği (₺)
  var ARTIS_PCT_ESIK = 20;   // yüzde artış eşiği
  var ORT_PCT_ESIK   = 30;   // 6 ay ortalamasının üstü eşiği
  var MAX_SINYAL     = 3;    // 10 uyarı = 0 uyarı

  // Öncelik: 1) limit aşımı 2) geçen aya göre artış 3) ortalama üstü.
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
      .filter(function (c) {
        var f = limitFill(cur[c], budgets[c]);
        return f !== null && f > 100;
      })
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
    var avgCache = null;
    Object.keys(cur).forEach(function (c) {
      if (used[c] || out.length >= MAX_SINYAL) return;
      if (!avgCache) {
        avgCache = {};
        for (var m = 0; m < o.MK.length; m++) {
          var t = catTotals(o.expenses, m, o.MK);
          Object.keys(t).forEach(function (k) { avgCache[k] = (avgCache[k] || 0) + t[k]; });
        }
        Object.keys(avgCache).forEach(function (k) { avgCache[k] = avgCache[k] / o.MK.length; });
      }
      var avg = avgCache[c] || 0;
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
  // Bilgi amaçlıdır — hiçbir yerde kaydı engellemek için kullanılmaz.
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
  // Medyan seçildi: tek seferlik büyük harcama ortalamayı bozar, medyanı bozmaz.
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
  // Bugün de kontrol edilir çünkü importStatementRows tüm satırları bugüne yazar;
  // yani aynı ekstre ikinci kez aktarılırsa satır tarihi değil bugün eşleşir.
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

  return {
    fmt: fmt, parseTrNum: parseTrNum, mIdx: mIdx,
    GROUPS: GROUPS, groupOf: groupOf, groupTotals: groupTotals,
    deltaPct: deltaPct, limitFill: limitFill, catTotals: catTotals,
    attentionSignals: attentionSignals,
    subDueDate: subDueDate, subsStatus: subsStatus,
    dailyAllowance: dailyAllowance, afterEntry: afterEntry,
    median: median, suggestLimits: suggestLimits,
    findDuplicates: findDuplicates
  };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = CALC;
