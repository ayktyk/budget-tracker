// node test.js — bağımlılıksız assert runner. Ek paket gerektirmez.
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
eq(Number.isNaN(CALC.parseTrNum('')), true, 'bos metin NaN doner (0 degil)');
eq(CALC.parseTrNum('1.234'), 1.234, 'virgulsuz nokta ondalik sayilir (numpad uyumu, kasitli)');
eq(CALC.parseTrNum('12.50'), 12.5, 'numpad ciktisi nokta ile ondalik');

console.log('\nmIdx');
const MK = ['2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07'];
eq(CALC.mIdx('2026-07-15', MK), 5, 'son ay');
eq(CALC.mIdx('2026-02-01', MK), 0, 'ilk ay');
eq(CALC.mIdx('2025-01-01', MK), -1, 'pencere disi -1');
eq(CALC.mIdx(null, MK), -1, 'null -1');

console.log('\n' + pass + ' gecti, ' + fail + ' kaldi');
process.exit(fail > 0 ? 1 : 0);
