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

console.log('\ngroupOf');
const GMAP = {
  kira: 'zorunlu', fatura: 'zorunlu', vergi: 'zorunlu', muhasebe: 'zorunlu',
  market: 'yasam', yemek: 'yasam', ulasim: 'yasam', nakit: 'yasam',
  eglence: 'keyif', giyim: 'keyif', eticaret: 'keyif', dijital: 'keyif', spor: 'keyif',
  saglik: 'saglik_egitim', egitim: 'saglik_egitim',
  yatirim: 'yatirim'
};
eq(CALC.groupOf('market', GMAP), 'yasam', 'market -> yasam');
eq(CALC.groupOf('kira', GMAP), 'zorunlu', 'kira -> zorunlu');
eq(CALC.groupOf('diger', GMAP), 'ungrouped', 'diger gruplanmamis');
eq(CALC.groupOf('benim_ozel_kat', GMAP), 'ungrouped', 'custom kategori gruplanmamis');

console.log('\ngroupTotals');
const EXP = [
  { id: '1', d: '2026-07-03', desc: 'SOK',    cat: 'market', amt: 1000, bank: 'İşbank' },
  { id: '2', d: '2026-07-05', desc: 'Yemek',  cat: 'yemek',  amt: 500,  bank: 'İşbank' },
  { id: '3', d: '2026-07-01', desc: 'Kira',   cat: 'kira',   amt: 5000, bank: 'Havale' },
  { id: '4', d: '2026-07-12', desc: 'UYAP',   cat: 'uyap',   amt: 9000, bank: 'VakıfBank' },
  { id: '5', d: '2026-06-03', desc: 'Onceki', cat: 'market', amt: 700,  bank: 'İşbank' },
  { id: '6', d: '2026-07-20', desc: 'Esans',  cat: 'diger',  amt: 300,  bank: 'Enpara' },
];
const gt = CALC.groupTotals(EXP, 5, MK, GMAP);
eq(gt.total, 6800, 'ay toplami UYAP haric (1000+500+5000+300)');
eq(gt.uyap, 9000, 'UYAP ayri doner');
eq(gt.groups.map(g => g.id), ['zorunlu', 'yasam', 'ungrouped'], 'tutara gore azalan sirali');
eq(gt.groups[0].total, 5000, 'zorunlu 5000');
eq(gt.groups[1].total, 1500, 'yasam 1000+500');
eq(gt.groups[2].total, 300, 'gruplanmamis 300');
eq(gt.groups[2].label, 'Gruplanmamış', 'grup etiketi doner');

const gtEmpty = CALC.groupTotals(EXP, 0, MK, GMAP);
eq(gtEmpty.total, 0, 'veri olmayan ay sifir');
eq(gtEmpty.groups, [], 'veri olmayan ay bos dizi');
eq(gtEmpty.uyap, 0, 'veri olmayan ay UYAP sifir');

// Grup toplamlari ay toplamina esit olmali (yuzde hesabinin dogrulugu buna bagli)
eq(gt.groups.reduce((a, g) => a + g.total, 0), gt.total, 'grup toplamlari ay toplamina esit');

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
eq(CALC.limitFill(500, undefined), null, 'limit tanimsizsa null');

console.log('\ncatTotals');
eq(CALC.catTotals(EXP, 5, MK), { market: 1000, yemek: 500, kira: 5000, diger: 300 },
   'kategori toplamlari UYAP haric');

console.log('\nattentionSignals');
const BUD = { market: 800, kira: 8000, yemek: 5000, diger: 0 };
const LBL = { market: 'Market', kira: 'Kira', yemek: 'Yemek', diger: 'Diğer' };

const sig = CALC.attentionSignals({
  expenses: EXP, monthIdx: 5, MK: MK, budgets: BUD, catLabels: LBL
});
eq(sig.length <= 3, true, 'en fazla 3 sinyal');
eq(sig.some(s => s.kind === 'limit'), true, 'limit asimi yakalanir (market 1000 > 800)');
// EXP'te market: haziran 700 -> temmuz 1000. Artis 300 TL, 500 TL esiginin ALTINDA.
eq(sig.some(s => s.kind === 'artis'), false, '300 TL artis esik altinda, artis sinyali yok');

const sig2 = CALC.attentionSignals({
  expenses: EXP, monthIdx: 5, MK: MK, budgets: {}, catLabels: LBL
});
eq(sig2.filter(s => s.kind === 'artis').length, 0, '500 TL altindaki artis sinyal uretmez');

const sig3 = CALC.attentionSignals({
  expenses: [], monthIdx: 5, MK: MK, budgets: BUD, catLabels: LBL
});
eq(sig3, [], 'veri yoksa bos dizi');

// Ayni kategori iki kez gecmez: market hem limiti asiyor hem 4000 TL artmis
const EXP4 = [
  { id: 'a', d: '2026-06-01', desc: 'M', cat: 'market', amt: 1000, bank: 'İşbank' },
  { id: 'b', d: '2026-07-01', desc: 'M', cat: 'market', amt: 5000, bank: 'İşbank' },
];
const sig4 = CALC.attentionSignals({
  expenses: EXP4, monthIdx: 5, MK: MK, budgets: { market: 800 }, catLabels: LBL
});
eq(sig4.filter(s => s.label === 'Market').length, 1, 'ayni kategori tek sinyal');
eq(sig4[0].kind, 'limit', 'oncelik limit asiminda');

// Limit yokken buyuk artis 'artis' sinyali uretir
const sig5 = CALC.attentionSignals({
  expenses: EXP4, monthIdx: 5, MK: MK, budgets: {}, catLabels: LBL
});
eq(sig5.length, 1, 'limit yokken tek sinyal');
eq(sig5[0].kind, 'artis', '4000 TL artis yakalanir');
eq(sig5[0].text, 'Market geçen aya göre +4.000 ₺', 'artis metni tutar iceriyor');

console.log('\n' + pass + ' gecti, ' + fail + ' kaldi');
process.exit(fail > 0 ? 1 : 0);
