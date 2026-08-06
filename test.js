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

console.log('\n' + pass + ' gecti, ' + fail + ' kaldi');
process.exit(fail > 0 ? 1 : 0);
