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

  return {
    fmt: fmt, parseTrNum: parseTrNum, mIdx: mIdx,
    GROUPS: GROUPS, groupOf: groupOf, groupTotals: groupTotals
  };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = CALC;
