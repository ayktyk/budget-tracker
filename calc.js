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

  return { fmt: fmt, parseTrNum: parseTrNum, mIdx: mIdx };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = CALC;
