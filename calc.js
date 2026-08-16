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

  // Bugün harcanabilir tutar = (kalan limit − ayrılmış taahhütler) ÷ ayın kalan günü.
  // committed (opsiyonel): bu ay daha çekilmemiş abonelikler + birikim zarfı payları.
  // Limit yoksa null.
  function dailyAllowance(limit, spent, todayIso, committed) {
    if (!limit || limit <= 0) return null;
    var p = String(todayIso || '').split('-');
    var y = parseInt(p[0], 10), mo = parseInt(p[1], 10), d = parseInt(p[2], 10);
    if (!y || !mo || !d || mo < 1 || mo > 12) return null;
    var last = new Date(y, mo, 0).getDate();
    var daysLeft = Math.max(1, last - d + 1);
    var c = Number(committed) || 0;
    var remaining = limit - (Number(spent) || 0) - c;
    return {
      remaining: remaining, daysLeft: daysLeft, committed: c,
      perDay: remaining > 0 ? Math.floor(remaining / daysLeft) : 0
    };
  }

  // Girilmekte olan tutarın kategori limitine etkisi. Limit yoksa null.
  // Kademeli eşikler (%70 yavaşla · %90 durakla · %100 üstü yeniden planla):
  // aşım SONRASI gelen tek kırmızı uyarı yerine erken, suçlamayan sinyal.
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
      level: pct > 100 ? 'over' : (pct >= 90 ? 'warn' : (pct >= 70 ? 'slow' : 'ok'))
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

  // ── Otomatik abonelik tahsilatı ─────────────────────────────
  // Kartından zaten otomatik çekilen abonelikler için "Ödedim" el işi kalktı:
  // günü gelmiş, işaretsiz aktif aboneliklerin gider kaydı otomatik oluşur.
  // create: yeni gider açılacaklar · link: elle girilmiş kayda bağlanacaklar
  // (tutar ±1 ₺, tarih ±1 gün — ekstre çift kayıt korumasıyla aynı tolerans).
  // pending (onaylanmamış aday) ve autoSkip[ay] (kullanıcı o ayın otomatik
  // kaydını silmiş) olanlar atlanır.
  function subsAutoCharges(subs, monthKey, todayIso, expenses) {
    var create = [], link = [];
    var list = subs || [], ex = expenses || [];
    for (var i = 0; i < list.length; i++) {
      var s = list[i];
      if (!s || s.active === false || s.pending) continue;
      if (s.paid && s.paid[monthKey]) continue;
      if (s.autoSkip && s.autoSkip[monthKey]) continue;
      var dueIso = subDueDate(monthKey, s.dayOfMonth);
      if (!dueIso || !todayIso || dueIso > todayIso) continue;
      var amt = Number(s.amt) || 0;
      var matched = null;
      for (var j = 0; j < ex.length; j++) {
        var e = ex[j];
        if (e.subId === s.id && String(e.d || '').slice(0, 7) === monthKey) { matched = e; break; }
        if (Math.abs((Number(e.amt) || 0) - amt) <= 1 && dayDiff(e.d, dueIso) <= 1) { matched = e; break; }
      }
      if (matched) link.push({ subId: s.id, expId: matched.id, dueIso: dueIso });
      else create.push({ subId: s.id, dueIso: dueIso, amt: amt });
    }
    return { create: create, link: link };
  }

  // Abonelik maliyet özeti (aktifler): "ayda 90 ₺" hissettirmez,
  // "yılda 1.080 ₺" karar verdirir. top: en pahalı 3 abonelik.
  function subsCostSummary(subs) {
    var act = (subs || []).filter(function (s) { return s && s.active !== false; });
    var monthly = act.reduce(function (a, s) { return a + (Number(s.amt) || 0); }, 0);
    var top = act.slice()
      .sort(function (a, b) { return (Number(b.amt) || 0) - (Number(a.amt) || 0); })
      .slice(0, 3)
      .map(function (s) { return { id: s.id, name: s.name, amt: Number(s.amt) || 0 }; });
    return { count: act.length, monthly: monthly, yearly: monthly * 12, daily: Math.round(monthly * 12 / 365), top: top };
  }

  // Zam tespiti: aboneliğe bağlı (subId) gider kayıtlarının son iki tutarı
  // veya son kayıt ile güncel tanımlı tutar arasındaki artış.
  function subRaises(subs, expenses) {
    var out = [];
    var ex = expenses || [];
    (subs || []).forEach(function (s) {
      if (!s || s.active === false) return;
      var hist = ex.filter(function (e) { return e.subId === s.id; })
        .sort(function (a, b) { return String(a.d || '').localeCompare(String(b.d || '')); })
        .map(function (e) { return Number(e.amt) || 0; });
      var cur = Number(s.amt) || 0;
      var prev = null, next = null;
      if (hist.length >= 2 && hist[hist.length - 1] > hist[hist.length - 2]) {
        prev = hist[hist.length - 2]; next = hist[hist.length - 1];
      } else if (hist.length >= 1 && cur > hist[hist.length - 1]) {
        prev = hist[hist.length - 1]; next = cur;
      }
      if (prev !== null && prev > 0) {
        out.push({ id: s.id, name: s.name, from: prev, to: next, pct: Math.round((next - prev) / prev * 100) });
      }
    });
    return out;
  }

  // Limit aşımında aktarım önerisi: en çok payı kalan 3 kategori.
  // %100'de suçlama yerine eylem: "hangi kategoriden aktarayım?"
  function transferSuggestions(budgets, spent, excludeCat) {
    var out = [];
    Object.keys(budgets || {}).forEach(function (c) {
      if (c === excludeCat || c === 'uyap') return;
      var lim = Number(budgets[c]) || 0;
      if (lim <= 0) return;
      var rem = lim - (Number((spent || {})[c]) || 0);
      if (rem > 0) out.push({ cat: c, remaining: rem });
    });
    return out.sort(function (a, b) { return b.remaining - a.remaining; }).slice(0, 3);
  }

  // Ay kapanış özeti — saf veri döner, metni çağıran kurar.
  // Kullanıcı hiçbir şey yapmadan girdiği verinin karşılığını alır.
  function monthReview(o) {
    var m = o.monthIdx;
    var cur = catTotals(o.expenses, m, o.MK);
    var prev = m > 0 ? catTotals(o.expenses, m - 1, o.MK) : {};
    var spent = 0; Object.keys(cur).forEach(function (c) { spent += cur[c]; });
    var prevSpent = 0; Object.keys(prev).forEach(function (c) { prevSpent += prev[c]; });
    var topIncrease = null;
    Object.keys(cur).forEach(function (c) {
      var d = cur[c] - (prev[c] || 0);
      if (d > 0 && (!topIncrease || d > topIncrease.delta)) {
        topIncrease = { cat: c, delta: d, pct: deltaPct(cur[c], prev[c] || 0) };
      }
    });
    var over = [], under = 0, budgets = o.budgets || {};
    Object.keys(budgets).forEach(function (c) {
      var lim = Number(budgets[c]) || 0;
      if (lim <= 0) return;
      var f = limitFill(cur[c] || 0, lim);
      if (f !== null && f > 100) over.push({ cat: c, pct: f, excess: (cur[c] || 0) - lim });
      else if ((cur[c] || 0) > 0) under++;
    });
    over.sort(function (a, b) { return b.excess - a.excess; });
    var topCats = Object.keys(cur)
      .map(function (c) { return { cat: c, total: cur[c] }; })
      .sort(function (a, b) { return b.total - a.total; })
      .slice(0, 3);
    return {
      spent: spent, prevSpent: prevSpent, delta: deltaPct(spent, prevSpent),
      topIncrease: topIncrease, over: over, underCount: under, topCats: topCats
    };
  }

  // İleri projeksiyon: bugüne kadarki günlük ortalama + günü gelmemiş
  // abonelikler → gün gün kümülatif tahmin. "Ayın 25'inde sıkışır mıyım?"
  // pendingSubs: [{day, amt}] — yalnız bugünden SONRAKİ günler sayılır
  // (öncekiler ya çekildi ya harcamada zaten var).
  // zeroDay: limitin projeksiyon olarak aşılacağı ilk gün (yoksa null).
  function monthProjection(limit, spent, todayIso, pendingSubs) {
    var p = String(todayIso || '').split('-');
    var y = parseInt(p[0], 10), mo = parseInt(p[1], 10), d = parseInt(p[2], 10);
    if (!y || !mo || !d || mo < 1 || mo > 12) return null;
    var last = new Date(y, mo, 0).getDate();
    var s = Number(spent) || 0;
    var avg = d > 0 ? s / d : 0;
    var subsByDay = {};
    (pendingSubs || []).forEach(function (x) {
      var dd = parseInt(x.day, 10) || 0;
      if (dd > d) subsByDay[dd] = (subsByDay[dd] || 0) + (Number(x.amt) || 0);
    });
    var lim = Number(limit) || 0;
    var cum = s, zeroDay = null;
    if (lim > 0 && cum > lim) zeroDay = d;
    for (var day = d + 1; day <= last; day++) {
      cum += avg + (subsByDay[day] || 0);
      if (zeroDay === null && lim > 0 && cum > lim) zeroDay = day;
    }
    return {
      avgDaily: Math.round(avg), projEnd: Math.round(cum),
      over: lim > 0 ? Math.round(cum - lim) : null,
      zeroDay: zeroDay, daysLeft: last - d
    };
  }

  // ── Rollover: kategori artı/eksi devri ──────────────────────
  // İşaretli kategorilerde kalan pay sonraki aya eklenir, aşım düşülür.
  // Devir zinciri pencerede verinin başladığı ilk aydan itibaren kurulur
  // (boş aylar limit biriktirmesin). Limit geçmişi tutulmadığı için geçmiş
  // aylarda da bugünkü limit esas alınır — bilinçli sadeleştirme.
  function rolloverCarry(expenses, MK, monthIdx, budgets, flags) {
    var out = {};
    var firstActive = -1;
    for (var m = 0; m < MK.length; m++) {
      if (Object.keys(catTotals(expenses, m, MK)).length) { firstActive = m; break; }
    }
    if (firstActive === -1 || monthIdx <= firstActive) return out;
    Object.keys(flags || {}).forEach(function (c) {
      if (!flags[c]) return;
      var lim = Number((budgets || {})[c]) || 0;
      if (lim <= 0) return;
      var carry = 0;
      for (var mm = firstActive + 1; mm <= monthIdx; mm++) {
        var t = catTotals(expenses, mm - 1, MK);
        carry = carry + lim - (t[c] || 0);
      }
      out[c] = Math.round(carry);
    });
    return out;
  }

  // ── Sabit / Esnek / Dönemsel kırılımı (Flex görünümü) ───────
  // Düzinelerce kategori yerine tek soruluk özet: esnek harcaman ne durumda?
  var GROUP_TYPES = {
    zorunlu: 'sabit', yasam: 'esnek', keyif: 'esnek',
    saglik_egitim: 'esnek', yatirim: 'donemsel', ungrouped: 'esnek'
  };

  function flexSplit(groupsResult, types) {
    var t = types || GROUP_TYPES;
    var out = { sabit: 0, esnek: 0, donemsel: 0 };
    (((groupsResult || {}).groups) || []).forEach(function (g) {
      var k = t[g.id] || 'esnek';
      out[k] += g.total;
    });
    return out;
  }

  // ── Birikim zarfı (sinking fund) ────────────────────────────
  // Bütçeyi bozan aylık harcama değil, yılda bir gelen büyük kalemdir.
  // fund: {target, monthly, log:{'YYYY-MM': tutar}, active}
  function fundStats(fund, curMonthKey) {
    var log = (fund && fund.log) || {};
    var saved = 0;
    Object.keys(log).forEach(function (k) { saved += Number(log[k]) || 0; });
    var target = Number(fund && fund.target) || 0;
    var monthly = Number(fund && fund.monthly) || 0;
    var pct = target > 0 ? Math.min(100, Math.round(saved / target * 100)) : 0;
    var remaining = Math.max(0, target - saved);
    var monthsLeft = (monthly > 0 && remaining > 0) ? Math.ceil(remaining / monthly) : 0;
    var dueThisMonth = !!(fund && fund.active !== false && monthly > 0 && curMonthKey && !log[curMonthKey] && remaining > 0);
    return { saved: saved, target: target, monthly: monthly, pct: pct, remaining: remaining, monthsLeft: monthsLeft, dueThisMonth: dueThisMonth };
  }

  // ── Metin araması ───────────────────────────────────────────
  // Açıklama + kaynak + etiketlerde Türkçe küçük harf araması.
  function matchesQuery(txn, q) {
    var s = String(q || '').toLocaleLowerCase('tr-TR').trim();
    if (!s) return true;
    var hay = (String((txn || {}).desc || '') + ' ' + String((txn || {}).bank || '') + ' '
      + (((txn || {}).tags) || []).join(' ')).toLocaleLowerCase('tr-TR');
    return hay.indexOf(s) > -1;
  }

  return {
    fmt: fmt, parseTrNum: parseTrNum, mIdx: mIdx,
    GROUPS: GROUPS, groupOf: groupOf, groupTotals: groupTotals,
    deltaPct: deltaPct, limitFill: limitFill, catTotals: catTotals,
    attentionSignals: attentionSignals,
    subDueDate: subDueDate, subsStatus: subsStatus,
    dailyAllowance: dailyAllowance, afterEntry: afterEntry,
    median: median, suggestLimits: suggestLimits,
    findDuplicates: findDuplicates,
    subsAutoCharges: subsAutoCharges, subsCostSummary: subsCostSummary,
    subRaises: subRaises, transferSuggestions: transferSuggestions,
    monthReview: monthReview, monthProjection: monthProjection,
    rolloverCarry: rolloverCarry,
    GROUP_TYPES: GROUP_TYPES, flexSplit: flexSplit,
    fundStats: fundStats, matchesQuery: matchesQuery
  };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = CALC;
