// ══════════════════════════════════════════════════════════════
// DATA DEFINITIONS
// ══════════════════════════════════════════════════════════════
// group: Özet ekranındaki dağılım kartının üst grubu. Kayıtlara dokunmaz,
// yalnızca gösterim katmanında kullanılır. 'uyap' grubu dağılıma girmez.
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
const ICATS=[
  {id:'dava',          label:'Dava',          color:'#4CAF68'},
  {id:'arabuluculuk',  label:'Arabuluculuk',  color:'#3EC9C4'},
  {id:'danisma',       label:'Danışma',       color:'#5B8DE8'},
  {id:'diger',         label:'Diğer',         color:'#888'},
];
const cmap=Object.fromEntries([...CATS,...ICATS].map(c=>[c.id,c]));
// Kullanıcı custom kategorileri + default'ları birlikte döndüren helper'lar
function getCats(){ return [...CATS, ...((S && S.customCats)||[])]; }
// Picker/listeleme yüzeyleri için görünür kategoriler (silinen varsayılanlar hariç).
// DİKKAT: doğrulama/AI/uniqueness/aggregation site'leri getCats() kullanmalı, bunu DEĞİL —
// aksi halde silinmiş bir kategoriye işaret eden gelen kayıt sessizce 'diger'e düşer.
function getVisibleCats(){ const hid=new Set((S&&S.deletedDefaults)||[]); return getCats().filter(c=>!hid.has(c.id)); }
// Kategori id → üst grup id haritası. Custom kategorilerde group alanı yoksa 'ungrouped'.
// Toplama işi yaptığı için getCats() kullanır (silinmiş kategorilerin kayıtları da sayılsın).
function catGroupMap(){
  const m={};
  getCats().forEach(c=>{ m[c.id]=c.group||'ungrouped'; });
  return m;
}
function getCatMeta(id){
  if(CAT_META[id]) return CAT_META[id];
  const custom=((S && S.customCats)||[]).find(c=>c.id===id);
  if(custom){
    return {mono:(custom.label||'?').slice(0,1).toUpperCase(), color:custom.color||'#888', label:custom.label||id};
  }
  return {mono:'D', color:'#8a857d', label:id||'Diğer'};
}
const CAT_META = {
  kira:{mono:'K',color:'#b8543a',label:'Kira'},
  muhasebe:{mono:'M',color:'#6b5b95',label:'Muhasebe'},
  spor:{mono:'S',color:'#5b7553',label:'Spor'},
  fatura:{mono:'F',color:'#c4923a',label:'Fatura'},
  dijital:{mono:'D',color:'#5b8aa6',label:'Dijital'},
  market:{mono:'M',color:'#8aa86b',label:'Market'},
  yemek:{mono:'Y',color:'#c97d4a',label:'Yemek'},
  eticaret:{mono:'E',color:'#9b5ba6',label:'E-ticaret'},
  ulasim:{mono:'U',color:'#4a7a8a',label:'Ulaşım'},
  saglik:{mono:'S',color:'#a85b7d',label:'Sağlık'},
  egitim:{mono:'E',color:'#5b6a95',label:'Eğitim'},
  eglence:{mono:'E',color:'#c9a75b',label:'Eğlence'},
  giyim:{mono:'G',color:'#8a5b6b',label:'Giyim'},
  yatirim:{mono:'Y',color:'#3d6a4e',label:'Yatırım'},
  vergi:{mono:'V',color:'#6b3d4e',label:'Vergi'},
  uyap:{mono:'U',color:'#6b5b95',label:'UYAP'},
  nakit:{mono:'N',color:'#8a857d',label:'Nakit'},
  diger:{mono:'D',color:'#8a857d',label:'Diğer'},
  // Yeni gelir kategorileri
  dava:{mono:'D',color:'#4CAF68',label:'Dava'},
  arabuluculuk:{mono:'A',color:'#3EC9C4',label:'Arabuluculuk'},
  danisma:{mono:'D',color:'#5B8DE8',label:'Danışma'},
  // Legacy gelir kategorileri — eski kayıtlar migration'da 'diger'e düştü,
  // yine de label'ları görünsün diye tutuyoruz
  tahsilat:{mono:'T',color:'#5b7553',label:'Tahsilat'},
  vekalet:{mono:'V',color:'#3d6a4e',label:'Vekalet'},
  danismanlik:{mono:'D',color:'#4a7a8a',label:'Danışmanlık'},
  avans:{mono:'A',color:'#c4923a',label:'Avans'},
  'diger-gelir':{mono:'D',color:'#8a857d',label:'Diğer'}
};
const LEGACY_THEME_MAP={beyaz:'cream',obsidian:'onyx',midnight:'midnight',champagne:'cream',yesil:'marble',kirmizi:'onyx',dark:'onyx',cream:'cream',onyx:'onyx',marble:'marble'};
function catMeta(id){ return getCatMeta(id); }
function monoChip(id,size=''){
  const meta=catMeta(id);
  const _c=escAttr(meta.color);
  return `<span class="mono-chip ${size}" style="--dot:${_c}"><span class="dot" style="background:${_c}"></span><span class="m">${escAttr(meta.mono)}</span></span>`;
}
function buildDesignLayout(){
  const app=document.querySelector('.app');
  if(!app) return;
  const oldBanner=document.getElementById('seed-banner');
  if(oldBanner) oldBanner.remove();
  document.getElementById('s-dash').innerHTML = `
    <div class="screen-shell">
      <div class="hero-card">
        <div class="hero-month">
          <button type="button" class="hero-month-nav" onclick="navDashMonth(-1)" aria-label="Önceki ay">‹</button>
          <span id="hero-month-label">—</span>
          <button type="button" class="hero-month-nav" onclick="navDashMonth(1)" aria-label="Sonraki ay">›</button>
        </div>
        <div class="hero-value num" id="bal-net">—</div>
        <div class="hero-metrics"><span>Gelir <strong class="num" id="bal-inc">—</strong></span><span>·</span><span>Gider <strong class="num" id="bal-exp">—</strong></span></div>
        <div class="goal-wrap-hero" id="hero-limit-wrap" onclick="openMonthLimitEditor()" role="button" tabindex="0" title="Aylık limiti düzenle"><div class="goal-track"><div class="goal-fill-hero" id="goal-fill"></div></div><div class="goal-meta-row"><span id="goal-status">—</span><span id="goal-target">—</span></div></div>
      </div>
      <div class="card card--primary" id="dist-card">
        <div class="card-h"><h3>Param Nereye Gidiyor</h3><span class="hint num" id="dist-hint">—</span></div>
        <div id="dist-body"></div>
      </div>
      <div class="card card--primary" id="attn-card" style="display:none">
        <div class="card-h"><h3>Dikkat</h3></div>
        <div id="attn-body"></div>
      </div>
      <div class="card card--secondary">
        <div class="card-h"><h3>6 Aylık Trend</h3><span class="hint">Gelir · Gider</span></div>
        <div class="chart-wrap"><canvas id="pnl-chart" role="img" aria-label="Gelir gider trendi"></canvas></div>
        <div class="trend-summary" id="trend-summary"></div>
      </div>
      <div class="card card--secondary dash-calendar-card">
        <div class="card-h"><h3>Takvim</h3><div class="cal-head-nav"><button class="cal-nav btn-ghost" onclick="navDashMonth(-1)">‹</button><div class="cal-month" id="dash-cal-month">—</div><button class="cal-nav btn-ghost" onclick="navDashMonth(1)">›</button></div></div>
        <div class="cal-dow"><span>Pt</span><span>Sa</span><span>Ça</span><span>Pe</span><span>Cu</span><span>Ct</span><span>Pz</span></div>
        <div class="cal-grid dash-grid" id="dash-cal-grid"></div>
        <div class="day-panel" id="day-panel" style="display:none">
          <div class="day-panel-h"><span id="day-panel-title">—</span><button type="button" class="day-panel-close" onclick="selectDay('')" aria-label="Günü kapat">✕</button></div>
          <div class="day-list" id="day-list"></div>
        </div>
      </div>
      <div class="card mini-meta"><div id="dash-pulse" class="dash-pulse"></div><div id="saved-at" class="saved-at"></div></div>
    </div>`;
  document.getElementById('s-quick').innerHTML = `
    <div class="screen-shell">
      <div class="card fav-strip-card"><div class="card-h"><h3>Sık Havale</h3><button type="button" class="fav-add-btn" onclick="openFavForm()" aria-label="Yeni sık havale ekle">+ Yeni</button></div><div class="fav-list fav-strip" id="fav-list"></div></div>
      <div class="card quick-main-card"><div class="card-h"><h3>Hızlı Giriş</h3><span class="hint" id="quick-date-display">—</span></div><div class="amount-big-wrap"><div class="amount-big"><span class="amount-currency">₺</span><input type="text" id="q-amt" placeholder="0" inputmode="decimal" autocomplete="off"></div></div><div class="numpad" id="quick-pad"><button onclick="quickPad('1')">1</button><button onclick="quickPad('2')">2</button><button onclick="quickPad('3')">3</button><button onclick="quickPad('4')">4</button><button onclick="quickPad('5')">5</button><button onclick="quickPad('6')">6</button><button onclick="quickPad('7')">7</button><button onclick="quickPad('8')">8</button><button onclick="quickPad('9')">9</button><button onclick="quickPad(',')">,</button><button onclick="quickPad('0')">0</button><button onclick="quickPad('del')">Sil</button></div><div class="quick-fields"><div class="qfield"><label>Açıklama</label><input class="input" type="text" id="q-desc" placeholder="örn: Hebun Çorba, BİM, İbrahim Yaman..." autocomplete="off"></div><div class="q-grid-two"><div class="qfield"><label>Tarih</label><input class="input" type="date" id="q-date"></div><div class="qfield"><label>Kaynak</label><select id="q-bank" style="display:none"><option value="Havale">Havale</option><option value="Nakit">Nakit</option><option value="İşbank">İşbank</option><option value="Enpara">Enpara</option><option value="VakıfBank">VakıfBank</option></select><div class="bank-chip-row" id="q-bank-chips"></div></div></div></div><div class="cat-section"><div class="eyebrow">Kategori</div><div class="cat-grid" id="cat-grid"></div></div><button class="btn btn-primary btn-block" onclick="quickAdd()">Kaydet</button></div>
      <div class="card"><div class="card-h"><h3>İşlemler</h3><span class="hint">Tüm kayıtlar</span></div><div class="filter-row filter-row-tight" id="quick-txn-mf"></div><div class="filter-row filter-row-tight" id="quick-txn-cf"></div><div id="quick-txn-list"></div></div>
    </div>`;
  document.getElementById('s-income').innerHTML = `
    <div class="screen-shell">
      <div class="card income-header-card"><div class="eyebrow" id="income-period-label">Gelirler · Dönem</div><div class="hero-value income-total" id="inc-total">—</div></div>
      <div class="filter-row" id="inc-mf"></div>
      <div class="card"><div class="card-h"><h3>FIBER</h3><span class="hint">Önce kendime ödeme</span></div><div id="fiber-summary"></div></div>
      <div class="card"><div class="card-h"><h3>Yeni Gelir</h3><span class="hint">Müvekkil akışı</span></div><div class="form-row"><div class="field"><label>Tarih</label><input class="input" type="date" id="gi-date"></div><div class="field"><label>Tutar (₺)</label><input class="input" type="number" id="gi-amt" placeholder="0" inputmode="decimal" oninput="updateFiberPreview()"></div></div><div class="field" style="margin-bottom:10px"><label>Müvekkil / Açıklama</label><input class="input" type="text" id="gi-desc" placeholder="Müvekkil adı, dava türü..."></div><div class="field" style="margin-bottom:10px"><label>Gelir Kategorisi</label><div class="cat-grid income-cat-grid" id="income-cat-grid"></div><select id="gi-cat" style="display:none"><option value="dava">Dava</option><option value="arabuluculuk">Arabuluculuk</option><option value="danisma">Danışma</option><option value="diger">Diğer</option></select></div><div class="fiber-box"><div class="fiber-title-row"><div><div class="eyebrow">FIBER</div><div class="fiber-title">Arkad kuralı</div></div><span class="fiber-badge">min %10</span></div><div class="form-row"><div class="field"><label>FIBER oranı (%)</label><input class="input" type="number" id="gi-fiber-pct" value="10" min="10" max="100" step="1" inputmode="decimal" oninput="updateFiberPreview()"></div><div class="field"><label>FIBER tutarı</label><div class="fiber-preview-value" id="gi-fiber-preview">0 ₺</div></div></div><div class="field-note">Gelir kaydedilince bu tutar sadece gelir içinde takip edilir; gider veya bütçe kaydı oluşturmaz.</div></div><div class="field"><label>Hesap</label><div class="bank-chip-row" id="gi-bank-chips"></div><select id="gi-bank" style="display:none"><option>Enpara</option><option>İşbank</option><option>VakıfBank</option><option>Nakit</option><option>Havale</option></select></div><button class="btn btn-primary btn-block" onclick="addIncome()">Kaydet</button></div>
      <div class="card"><div class="card-h"><h3>Gelir Geçmişi</h3><span class="hint">Filtreli liste</span></div><div id="inc-list"></div></div>
    </div>`;
  document.getElementById('s-more').innerHTML = `
    <div class="screen-shell">
      <div id="more-ekstre" class="more-panel"><div class="card"><div class="card-h"><h3>Ekstre Yükle + AI</h3><span class="hint">Gemini + fallback</span></div><details class="api-collapsible" id="gemini-details"><summary>Gemini API Key <span id="gemini-key-status" class="gk-status off">(boş)</span></summary><div class="field"><input class="input" type="password" id="gemini-key" placeholder="Gemini API Key (yalnızca cihazınızda saklanır)" oninput="saveGeminiKey(this.value)"><div class="field-note" style="margin-top:6px">⚠ Bu anahtar düz metin olarak cihazınızda saklanır. Sadece güvendiğiniz cihazlarda kullanın. <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline">Google AI Studio'dan ücretsiz key alın</a>.</div><div class="gk-test-row"><button type="button" class="btn btn-secondary" id="gemini-test-btn" onclick="testGeminiKey()">Bağlantıyı Test Et</button><div id="gemini-test-out" class="gk-test-out"></div></div></div></details><div class="field"><label>Banka</label><select id="stmt-bank" style="display:none"><option>İşbank</option><option>Enpara</option><option>VakıfBank</option></select><div class="bank-chip-row" id="stmt-bank-chips"></div></div><div class="field"><label>Ekstre Metni</label><textarea class="input stmt-area" id="stmt-text" placeholder="Ekstre metnini buraya yapıştır"></textarea></div><button class="btn btn-primary btn-block" onclick="parseStmt()" id="parse-btn">İçe Aktar</button><div class="field-note">Kalemler <strong>bugünün tarihine</strong> kaydedilir. Önce Gemini denenir; başarısız olursa yerel parser devreye girer.</div><div id="parse-res" class="parse-result"></div></div><div class="card"><div class="card-h"><h3>Kart Takvimi</h3><button type="button" class="fav-add-btn" onclick="openCardForm()">+ Yeni</button></div><div id="card-list"></div><div class="field-note" style="margin-top:6px">Kesim ve son ödeme günleri ana sayfadaki takvimde kartın renginde işaretlenir.</div></div><div class="card ai-card"><div class="card-h"><h3>Genel Harcama Analizi</h3><span class="hint">1 / 3 / 6 ay</span></div><div class="field-note">Tüm girdileri okuyarak 1 aylık · 3 aylık · 6 aylık ayrı ayrı analiz üretir. Gemini key varsa AI yorumu, yoksa cihazda lokal hesaplama. Yeni veri eklemez.</div><button class="btn btn-secondary btn-block" onclick="analyzeAllSpending()" id="analyze-all-btn">Analiz Et</button><div id="analysis-res" class="analysis-result"></div></div></div>
      <div id="more-sabit" class="more-panel"><div class="card"><div class="card-h"><h3>Sabit Giderler</h3><span class="hint">Referans listesi</span></div><div id="fixed-list"></div><div class="field-note" style="margin-top:8px">Bu liste bilgi amaçlıdır. Otomatik kayıt oluşturmaz — ödediğinde Hızlı Giriş'ten veya Ekstre Yükle'den ekle.</div></div></div>
      <div id="more-findeks" class="more-panel"><div class="card"><div class="card-h"><h3>Findeks Puanı</h3><span class="hint">Aylık manuel kayıt</span></div><div class="findeks-form"><div class="form-row"><div class="field"><label>Tarih</label><input class="input" type="date" id="fk-date"></div><div class="field"><label>Skor (0–1900)</label><input class="input" type="number" id="fk-score" placeholder="örn: 1500" min="0" max="1900" step="1" inputmode="numeric"></div></div><div class="field"><label>Not (opsiyonel)</label><input class="input" type="text" id="fk-note" placeholder="örn: Kredi başvurusu öncesi"></div><button class="btn btn-primary btn-block" onclick="addFindeks()">Kaydet</button></div><div id="findeks-summary" class="findeks-summary"></div><div id="findeks-spark" class="findeks-spark"></div><div id="findeks-list" class="findeks-list"></div><div class="field-note" style="margin-top:8px">Findeks puanı 0–1900 arası bir kredi notudur. 1500+ iyi, 1700+ çok iyi sayılır. Aynı ay için birden çok kayıt yapabilirsiniz; trend grafiği son 12 kayıttan oluşur.</div></div></div>
      <div id="more-data" class="more-panel"><div class="card"><div class="card-h"><h3>Veri</h3><span class="hint">Yedek / sıfırla</span></div><div class="data-actions"><button class="btn btn-primary btn-block" onclick="exportData()">JSON Yedeği İndir</button><button class="btn btn-secondary btn-block" onclick="document.getElementById('imp-f').click()">JSON Yedeği Yükle</button><input type="file" id="imp-f" accept=".json" style="display:none" onchange="importData(event)"><button class="btn btn-danger btn-block" onclick="resetAll()">Tüm Verileri Sıfırla</button></div><div id="data-st" class="field-note"></div><div class="field-note" style="margin-top:6px">Sıfırlama öncesi otomatik yedek dosyası indirilir. Yedek dosyasını tekrar yüklerseniz tüm kayıtlarınız geri gelir.</div></div></div>
      <div id="more-theme" class="more-panel"><div class="card theme-picker"><div class="card-h"><h3>Görünüm</h3><span class="hint">Anında değişir</span></div><div class="theme-row"><button data-theme-pick="cream" class="theme-chip" onclick="setTheme('cream')"><span class="sw" style="background:#f4efe6"></span>Krem Kâğıt</button><button data-theme-pick="onyx" class="theme-chip" onclick="setTheme('onyx')"><span class="sw" style="background:#0e1117"></span>Onyx & Altın</button></div></div></div>
    </div>`;
  document.querySelector('.nav').innerHTML = `<button class="nav-item on" onclick="go('dash',this)" id="nb-dash"><span class="nav-glyph">A</span><span>Ana</span></button><button class="nav-item" onclick="go('income',this)" id="nb-income"><span class="nav-glyph">G</span><span>Gelir</span></button><div class="nav-center"><button class="nav-fab" onclick="go('quick',null)" aria-label="Hızlı giriş">+</button></div><button class="nav-item" onclick="go('budget-shortcut',this)" id="nb-budget"><span class="nav-glyph">B</span><span>Bütçe</span></button><button class="nav-item" onclick="go('more',this)" id="nb-more"><span class="nav-glyph">D</span><span>Detay</span></button>`;
}
function dismissSeedBanner(){
  const el=document.getElementById('seed-banner');
  if(el) el.remove();
}
function maybeShowSeedBanner(){
  const el=document.getElementById('seed-banner');
  if(el) el.remove();
}
// Rolling 6-month window ending at current month
const MONTH_SHORT=['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
const MONTH_LONG=['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
function buildMonthWindow(){
  const now=new Date();
  const mn=[],mk=[];
  for(let i=5;i>=0;i--){
    const d=new Date(now.getFullYear(),now.getMonth()-i,1);
    const yy=String(d.getFullYear()).slice(2);
    const mm=String(d.getMonth()+1).padStart(2,'0');
    mn.push(MONTH_SHORT[d.getMonth()]+'-'+yy);
    mk.push(d.getFullYear()+'-'+mm);
  }
  return {mn,mk};
}
const _win=buildMonthWindow();
const MN=_win.mn;
const MK=_win.mk;
const CUR_IDX=5; // current month is always last slot
function curMonthLabel(){
  const now=new Date();
  return MONTH_LONG[now.getMonth()]+' '+now.getFullYear();
}
const GOAL=30000;
const DEFAULT_FIBER_PCT=10;
const DEF_BUD={kira:8500,muhasebe:2750,spor:1500,fatura:6000,dijital:3500,market:7000,yemek:3500,eticaret:2500,ulasim:1500,saglik:0,egitim:1000,eglence:1000,giyim:1500,yatirim:3000,vergi:5000,nakit:2000,diger:0};
const DEFAULT_FAV=[
  {id:'fav_ibrahim',  label:'İbrahim Yaman',desc:'İbrahim Yaman — Halısaha',amt:350,cat:'spor',bank:'Havale'},
  {id:'fav_metin',    label:'Metin Sağır',  desc:'Ev kirası — Metin Sağır', amt:5000,cat:'kira',bank:'Havale'},
  {id:'fav_tugay',    label:'Tuğay Tuna',   desc:'Ofis kirası — Tuğay Tuna',amt:7000,cat:'kira',bank:'Havale'},
  {id:'fav_ahmet',    label:'Ahmet Korkmaz',desc:'Muhasebe — Ahmet Korkmaz',amt:2750,cat:'muhasebe',bank:'Havale'},
];
const FIXED=[
  {desc:'Ev kirası',sub:'Metin Sağır → EFT',amt:5000,note:'sabit'},
  {desc:'Ofis kirası (net)',sub:'Tuğay Tuna 7k → Mücahit 3.5k iade',amt:3500,note:'net payın'},
  {desc:'Halısaha',sub:'İbrahim Yaman · haftalık 350 ₺',amt:1400,note:'~4×/ay'},
  {desc:'Muhasebe',sub:'Ahmet Korkmaz',amt:2750,note:'havale'},
  {desc:'Pazar alışverişi',sub:'Nakit',amt:2000,note:'tahmini'},
  {desc:'Ofis faturaları payı',sub:'Elektrik+su+gaz+internet ÷ 4',amt:875,note:'iade edilir'},
  {desc:'Ev fatura paketi',sub:'TürkNet+TT+Vodafone+İSKİ+İGDAŞ+Enerjisa',amt:6000,note:'ort.'},
  {desc:'Dijital abonelikler',sub:'Apple+Google+Netflix+Claude+Spotify…',amt:4000,note:'hedef'},
];

function genId(){return Date.now().toString(36)+Math.random().toString(36).slice(2,5);}

// ── Seed data ──
function buildSeed(){
  let s=[];
  for(let m=0;m<6;m++){
    s.push(
      {id:genId(),d:MK[m]+'-01',desc:'Ev kirası (Metin Sağır)',cat:'kira',amt:5000,bank:'Havale'},
      {id:genId(),d:MK[m]+'-01',desc:'Ofis kirası net (Tuğay Tuna)',cat:'kira',amt:3500,bank:'Havale'},
      {id:genId(),d:MK[m]+'-01',desc:'Muhasebe (Ahmet Korkmaz)',cat:'muhasebe',amt:2750,bank:'Havale'},
      {id:genId(),d:MK[m]+'-15',desc:'Pazar alışverişi',cat:'nakit',amt:2000,bank:'Nakit'},
      {id:genId(),d:MK[m]+'-07',desc:'İbrahim Yaman — Halısaha',cat:'spor',amt:350,bank:'Havale'},
      {id:genId(),d:MK[m]+'-14',desc:'İbrahim Yaman — Halısaha',cat:'spor',amt:350,bank:'Havale'},
      {id:genId(),d:MK[m]+'-21',desc:'İbrahim Yaman — Halısaha',cat:'spor',amt:350,bank:'Havale'},
      {id:genId(),d:MK[m]+'-28',desc:'İbrahim Yaman — Halısaha',cat:'spor',amt:350,bank:'Havale'},
    );
  }
  const extra=[
    {d:'2025-09-25',desc:'Türk Telekom Mobil',cat:'fatura',amt:463,bank:'Enpara'},{d:'2025-09-26',desc:'TürkNet',cat:'fatura',amt:700,bank:'Enpara'},{d:'2025-09-26',desc:'Enerjisa',cat:'fatura',amt:690,bank:'Enpara'},{d:'2025-09-30',desc:'Vodafone',cat:'fatura',amt:1105,bank:'Enpara'},{d:'2025-10-02',desc:'İSKİ',cat:'fatura',amt:268,bank:'Enpara'},{d:'2025-10-02',desc:'TürkNet',cat:'fatura',amt:700,bank:'Enpara'},
    {d:'2025-10-27',desc:'Türk Telekom Mobil',cat:'fatura',amt:463,bank:'Enpara'},{d:'2025-10-30',desc:'Vodafone',cat:'fatura',amt:237,bank:'Enpara'},{d:'2025-10-30',desc:'İSKİ',cat:'fatura',amt:274,bank:'Enpara'},{d:'2025-11-03',desc:'TürkNet',cat:'fatura',amt:700,bank:'Enpara'},{d:'2025-11-03',desc:'Enerjisa',cat:'fatura',amt:705,bank:'Enpara'},{d:'2025-11-20',desc:'TürkNet',cat:'fatura',amt:700,bank:'Enpara'},
    {d:'2025-12-23',desc:'TürkNet',cat:'fatura',amt:700,bank:'Enpara'},{d:'2025-12-25',desc:'Türk Telekom Mobil',cat:'fatura',amt:463,bank:'Enpara'},{d:'2025-12-29',desc:'İGDAŞ',cat:'fatura',amt:1407,bank:'Enpara'},{d:'2025-12-29',desc:'Enerjisa+İSKİ',cat:'fatura',amt:1289,bank:'Enpara'},{d:'2025-12-30',desc:'Vodafone',cat:'fatura',amt:237,bank:'Enpara'},
    {d:'2026-01-26',desc:'Türk Telekom Mobil',cat:'fatura',amt:463,bank:'Enpara'},{d:'2026-01-29',desc:'İSKİ+İGDAŞ',cat:'fatura',amt:2409,bank:'Enpara'},{d:'2026-01-30',desc:'Enerjisa+Vodafone',cat:'fatura',amt:1154,bank:'Enpara'},{d:'2026-01-29',desc:'TürkNet',cat:'fatura',amt:700,bank:'Enpara'},
    {d:'2026-02-13',desc:'Turkcell',cat:'fatura',amt:119,bank:'Enpara'},{d:'2026-02-19',desc:'TürkNet',cat:'fatura',amt:700,bank:'Enpara'},{d:'2026-02-26',desc:'Türk Telekom Mobil',cat:'fatura',amt:469,bank:'Enpara'},{d:'2026-02-27',desc:'İSKİ+İGDAŞ',cat:'fatura',amt:2416,bank:'Enpara'},{d:'2026-01-31',desc:'Kart aidatı',cat:'fatura',amt:559,bank:'VakıfBank'},
    {d:'2026-03-02',desc:'Enerjisa',cat:'fatura',amt:805,bank:'Enpara'},{d:'2026-03-02',desc:'Vodafone (!)',cat:'fatura',amt:3824,bank:'Enpara'},{d:'2026-03-19',desc:'TürkNet',cat:'fatura',amt:700,bank:'Enpara'},{d:'2026-02-25',desc:'Türk Telekom Mobil',cat:'fatura',amt:469,bank:'Enpara'},
    {d:'2025-10-01',desc:'Digiturk taksit',cat:'dijital',amt:297,bank:'Enpara'},{d:'2025-10-07',desc:'Apple.com',cat:'dijital',amt:958,bank:'Enpara'},{d:'2025-10-09',desc:'Google One',cat:'dijital',amt:720,bank:'Enpara'},{d:'2025-09-25',desc:'OpenAI',cat:'dijital',amt:411,bank:'Enpara'},
    {d:'2025-10-23',desc:'Claude.ai',cat:'dijital',amt:855,bank:'Enpara'},{d:'2025-10-24',desc:'Paddle.net',cat:'dijital',amt:936,bank:'Enpara'},{d:'2025-11-09',desc:'Apple.com',cat:'dijital',amt:900,bank:'Enpara'},{d:'2025-10-10',desc:'Spotify',cat:'dijital',amt:60,bank:'Enpara'},{d:'2025-11-11',desc:'Google One+YouTube',cat:'dijital',amt:870,bank:'Enpara'},
    {d:'2025-11-18',desc:'Claude.ai',cat:'dijital',amt:864,bank:'Enpara'},{d:'2025-12-10',desc:'Spotify',cat:'dijital',amt:99,bank:'Enpara'},{d:'2025-12-26',desc:'Netflix',cat:'dijital',amt:190,bank:'Enpara'},{d:'2025-12-27',desc:'YouTube Premium',cat:'dijital',amt:150,bank:'Enpara'},{d:'2025-12-26',desc:'Apple.com',cat:'dijital',amt:401,bank:'Enpara'},{d:'2026-01-08',desc:'Google One+Apple',cat:'dijital',amt:1620,bank:'Enpara'},
    {d:'2026-01-25',desc:'Netflix+YouTube+Spotify',cat:'dijital',amt:439,bank:'Enpara'},{d:'2026-02-06',desc:'Amazon Prime',cat:'dijital',amt:70,bank:'Enpara'},{d:'2026-02-08',desc:'Google One',cat:'dijital',amt:720,bank:'Enpara'},{d:'2026-02-09',desc:'Apple.com',cat:'dijital',amt:400,bank:'Enpara'},{d:'2026-02-11',desc:'Microsoft 365',cat:'dijital',amt:77,bank:'Enpara'},{d:'2026-02-10',desc:'Spotify',cat:'dijital',amt:99,bank:'Enpara'},
    {d:'2026-03-08',desc:'Google One',cat:'dijital',amt:720,bank:'Enpara'},{d:'2026-03-09',desc:'Apple.com',cat:'dijital',amt:400,bank:'Enpara'},{d:'2026-03-10',desc:'Apple.com',cat:'dijital',amt:250,bank:'Enpara'},{d:'2026-03-11',desc:'Microsoft 365',cat:'dijital',amt:77,bank:'Enpara'},{d:'2026-02-28',desc:'Claude.ai',cat:'dijital',amt:1075,bank:'Enpara'},{d:'2026-02-25',desc:'Netflix',cat:'dijital',amt:190,bank:'Enpara'},{d:'2026-03-10',desc:'Spotify',cat:'dijital',amt:99,bank:'Enpara'},{d:'2026-02-23',desc:'Kaspersky+OpenRouter',cat:'dijital',amt:808,bank:'Enpara'},{d:'2026-02-25',desc:'Apple.com (iCloud+TV)',cat:'dijital',amt:665,bank:'Enpara'},{d:'2026-03-14',desc:'Apple.com',cat:'dijital',amt:500,bank:'Enpara'},{d:'2026-03-10',desc:'Namecheap',cat:'dijital',amt:314,bank:'Enpara'},
    {d:'2025-09-22',desc:'SOK Market',cat:'market',amt:565,bank:'İşbank'},{d:'2025-09-28',desc:'A101+Özkardeşler',cat:'market',amt:594,bank:'İşbank'},{d:'2025-10-03',desc:'Ergin Kiral Gıda',cat:'market',amt:578,bank:'İşbank'},{d:'2025-10-12',desc:'SOK Market',cat:'market',amt:963,bank:'İşbank'},{d:'2025-11-07',desc:'Toktok+market',cat:'market',amt:1897,bank:'İşbank'},{d:'2025-11-09',desc:'SOK+A101',cat:'market',amt:876,bank:'İşbank'},{d:'2025-12-01',desc:'İşbank market',cat:'market',amt:2717,bank:'İşbank'},{d:'2026-01-05',desc:'İşbank market',cat:'market',amt:4200,bank:'İşbank'},{d:'2026-02-05',desc:'İşbank market',cat:'market',amt:3700,bank:'İşbank'},{d:'2026-02-23',desc:'Toktok+SOK',cat:'market',amt:1785,bank:'İşbank'},{d:'2026-03-06',desc:'İşbank market (büyük)',cat:'market',amt:9588,bank:'İşbank'},
    {d:'2025-10-06',desc:'Corner Irish+Karaköy Şorba',cat:'yemek',amt:915,bank:'İşbank'},{d:'2025-10-07',desc:'Revolte+Halil Lahmacun',cat:'yemek',amt:1120,bank:'İşbank'},{d:'2025-11-19',desc:'Restoran/kafe',cat:'yemek',amt:1430,bank:'İşbank'},{d:'2025-12-23',desc:'3008 Bakery',cat:'yemek',amt:1200,bank:'İşbank'},{d:'2025-12-21',desc:'Ozbeyti Kebap',cat:'yemek',amt:1000,bank:'İşbank'},{d:'2026-01-09',desc:'Biberoglu+Tura Fırın',cat:'yemek',amt:2320,bank:'İşbank'},{d:'2026-01-16',desc:'Hebun Çorba x3',cat:'yemek',amt:930,bank:'İşbank'},{d:'2026-01-22',desc:'Anstella+fırıncı',cat:'yemek',amt:945,bank:'İşbank'},{d:'2026-02-03',desc:'Betro+Revolte+Tura',cat:'yemek',amt:2030,bank:'İşbank'},{d:'2026-02-14',desc:'Tura Fırın+Doğan Ceyda',cat:'yemek',amt:1050,bank:'İşbank'},{d:'2026-03-04',desc:'Restoran (İşbank)',cat:'yemek',amt:2750,bank:'İşbank'},{d:'2026-03-13',desc:'Kaçkar+Karaköy Murat',cat:'yemek',amt:2240,bank:'İşbank'},
    {d:'2025-10-18',desc:'Amazon+Temu',cat:'eticaret',amt:7671,bank:'Enpara'},{d:'2025-11-15',desc:'Amazon',cat:'eticaret',amt:2701,bank:'Enpara'},{d:'2025-12-08',desc:'Amazon x3',cat:'eticaret',amt:4538,bank:'Enpara'},{d:'2026-01-08',desc:'Amazon taksit',cat:'eticaret',amt:2540,bank:'Enpara'},{d:'2026-02-03',desc:'Fresh Canpark',cat:'eticaret',amt:1320,bank:'İşbank'},{d:'2026-02-08',desc:'Amazon taksit',cat:'eticaret',amt:3061,bank:'Enpara'},{d:'2026-03-27',desc:'Amazon+son taksit',cat:'eticaret',amt:5460,bank:'Enpara'},
    {d:'2025-10-04',desc:'Karga Turizm',cat:'ulasim',amt:945,bank:'Enpara'},{d:'2025-11-29',desc:'Pamukkale Ulaşım',cat:'ulasim',amt:1050,bank:'Enpara'},{d:'2025-12-30',desc:'İDO',cat:'ulasim',amt:1483,bank:'Enpara'},{d:'2026-01-01',desc:'TCDD biletleri',cat:'ulasim',amt:4500,bank:'Enpara'},{d:'2026-01-21',desc:'Obilet+Ardahan',cat:'ulasim',amt:4081,bank:'Enpara'},{d:'2026-03-21',desc:'İDO',cat:'ulasim',amt:1042,bank:'Enpara'},
    {d:'2026-01-09',desc:'Mudo (2 taksit)',cat:'giyim',amt:1799,bank:'İşbank'},{d:'2026-01-14',desc:'LC Waikiki t.1/5',cat:'giyim',amt:944,bank:'VakıfBank'},{d:'2026-02-09',desc:'Mudo taksit 2',cat:'giyim',amt:899,bank:'İşbank'},{d:'2026-02-14',desc:'LC Waikiki t.2/5',cat:'giyim',amt:944,bank:'VakıfBank'},{d:'2026-02-23',desc:'Fenerium',cat:'giyim',amt:550,bank:'İşbank'},{d:'2026-03-14',desc:'LC Waikiki t.3/5',cat:'giyim',amt:944,bank:'VakıfBank'},{d:'2026-03-19',desc:'Minniks Giyim',cat:'giyim',amt:701,bank:'İşbank'},
    {d:'2025-11-02',desc:'Steam Games',cat:'eglence',amt:1796,bank:'Enpara'},{d:'2025-11-05',desc:'İBB Tiyatro x2',cat:'eglence',amt:704,bank:'Enpara'},{d:'2026-01-21',desc:'Passo Kombine',cat:'eglence',amt:1500,bank:'Enpara'},{d:'2026-02-21',desc:'Passo Kombine',cat:'eglence',amt:1500,bank:'Enpara'},
    {d:'2025-11-07',desc:'İstinye Üniversitesi',cat:'egitim',amt:6673,bank:'Enpara'},{d:'2026-03-04',desc:'Udemy',cat:'egitim',amt:400,bank:'Enpara'},
    {d:'2025-11-03',desc:'Atasun Optik taksit',cat:'saglik',amt:1290,bank:'Enpara'},{d:'2025-11-06',desc:'Eczane',cat:'saglik',amt:244,bank:'Enpara'},
    {d:'2025-09-30',desc:'Funding Pips',cat:'yatirim',amt:2235,bank:'Enpara'},{d:'2025-10-05',desc:'KMQuant.com',cat:'yatirim',amt:1197,bank:'Enpara'},{d:'2025-10-15',desc:'BEMFUNDING.COM',cat:'yatirim',amt:4451,bank:'Enpara'},{d:'2025-11-06',desc:'KMQuant.com',cat:'yatirim',amt:1183,bank:'Enpara'},
    {d:'2025-09-26',desc:'Kadıköy Vergi Dairesi',cat:'vergi',amt:907,bank:'Enpara'},{d:'2025-12-25',desc:'Kadıköy V.D.',cat:'vergi',amt:1642,bank:'VakıfBank'},{d:'2026-01-15',desc:'Kadıköy V.D.',cat:'vergi',amt:5342,bank:'VakıfBank'},{d:'2026-02-15',desc:'Kadıköy V.D.',cat:'vergi',amt:4551,bank:'VakıfBank'},{d:'2026-03-05',desc:'Kadıköy V.D.',cat:'vergi',amt:5191,bank:'Enpara'},
    {d:'2025-09-12',desc:'UYAP ödemeleri',cat:'uyap',amt:7500,bank:'VakıfBank'},{d:'2025-10-20',desc:'UYAP ödemeleri',cat:'uyap',amt:28842,bank:'VakıfBank'},{d:'2025-11-24',desc:'UYAP (38.900 ₺)',cat:'uyap',amt:38900,bank:'VakıfBank'},{d:'2026-01-17',desc:'UYAP ödemeleri',cat:'uyap',amt:15609,bank:'VakıfBank'},{d:'2026-02-04',desc:'UYAP ödemeleri',cat:'uyap',amt:11990,bank:'VakıfBank'},{d:'2026-03-12',desc:'UYAP ödemeleri',cat:'uyap',amt:13471,bank:'VakıfBank'},
    {d:'2025-11-08',desc:'Esanslar (parfüm)',cat:'diger',amt:3027,bank:'Enpara'},
  ];
  return s.concat(extra.map(x=>({...x,id:genId()})));
}

// ══════════════════════════════════════════════════════════════
// STATE & STORAGE — localStorage (Vercel deploy için)
// ══════════════════════════════════════════════════════════════
// SEED verisi kaldırıldı. buildSeed() fonksiyonu dead code — referans yok.
const SEED = [];

const DEFAULT_CARDS=[
  {id:'card_isbank',    name:'İşbank',    bank:'İşbank',    cutDay: 1,  dueDay:14, color:'#5B8DE8'},
  {id:'card_vakif',     name:'VakıfBank', bank:'VakıfBank', cutDay: 7,  dueDay:20, color:'#3EC98A'},
  {id:'card_enpara',    name:'Enpara',    bank:'Enpara',    cutDay:22,  dueDay: 7, color:'#8B6EE8'},
];
let S = {
  expenses: [],
  userExp:  [],
  incomes:  [],
  budgets:  {...DEF_BUD},
  favs:     JSON.parse(JSON.stringify(DEFAULT_FAV)),
  customCats: [],   // kullanıcı tarafından eklenen ekstra kategoriler
  deletedDefaults: [], // silinen varsayılan kategori id'leri — kayıtlar 'diger'e taşınır, kategori kalıcı gizlenir
  subs:     [],     // abonelikler
  cards:    JSON.parse(JSON.stringify(DEFAULT_CARDS)), // kredi kartı ekstre kesim/son ödeme günleri
  findeks:  [],     // aylık findeks puanı kayıtları [{id, date, score, note}]
  selCat: 'yemek',
  expM: null, expC: null, incM: null, dashM: CUR_IDX, dashDay: '', budM: CUR_IDX,
  monthLimit: null, // null = otomatik (kategori toplami), number = manuel override
  openGroups: [],   // Ozet ekrani dagilim kartinda acik olan ust grup id'leri
  openTool: ''      // Araclar ekraninda acik olan akordeon panel id'si
};

const GEMINI_MODEL='gemini-2.5-flash';
const GEMINI_KEY_STORAGE='ay_gemini_key';

// ── v2 Migration: eski SEED/demo verisini otomatik yedekleyip temizle ──
function migrateV2() {
  if (localStorage.getItem('ay_migrated_v2') === '1') return;
  try {
    const expRaw = localStorage.getItem('ay_exp');
    const incRaw = localStorage.getItem('ay_inc');
    const budRaw = localStorage.getItem('ay_bud');
    const backup = {
      exportedAt: new Date().toISOString(),
      note: 'Otomatik yedek — v2 sıfırlama öncesi',
      expenses: expRaw ? JSON.parse(expRaw) : [],
      incomes:  incRaw ? JSON.parse(incRaw) : [],
      budgets:  budRaw ? JSON.parse(budRaw) : {},
    };
    // Sadece gerçekten veri varsa yedekle
    if ((backup.expenses && backup.expenses.length) || (backup.incomes && backup.incomes.length)) {
      const json = JSON.stringify(backup, null, 2);
      // Cihaz-içi kalıcı güvenlik kopyası — indirme engellenirse kurtarma için. Var olanı ezme.
      try { if (localStorage.getItem('ay_backup_v2') === null) localStorage.setItem('ay_backup_v2', json); } catch(_) {}
      const blob = new Blob([json], {type:'application/json'});
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = 'ay_backup_' + new Date().toISOString().slice(0,10) + '.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  } catch(e) {
    console.warn('migrateV2 backup failed:', e);
  }
  // ÖNEMLİ (veri kaybı düzeltmesi): ay_exp / ay_inc ARTIK SİLİNMİYOR.
  // SEED zaten boş; bu anahtarları silmek gerçek kullanıcı verisini yok etme riskiydi
  // (üstelik removeItem'lar eskiden try/catch dışındaydı). Veriyi koruyoruz; loadFromStorage
  // zaten yeni modele okuyor. Eski demo verisini temizlemek isteyen Detaylar > Veri > Sıfırla'yı kullanır.
  localStorage.removeItem('ay_seed_migrated');
  localStorage.setItem('ay_migrated_v2', '1');
}

function loadFromStorage() {
  migrateV2();
  try {
    const ue = localStorage.getItem('ay_exp');
    if (ue !== null) S.userExp = JSON.parse(ue);
    S.expenses = [...S.userExp];
  } catch(e) { S.expenses = [...S.userExp]; }
  try {
    const ic = localStorage.getItem('ay_inc');
    if (ic) S.incomes = JSON.parse(ic);
  } catch(e) {}
  // Gelir kategorisi migration: bilinmeyen kategoriler 'diger'e düş
  try {
    const validInc = new Set(ICATS.map(c=>c.id));
    let changed = false;
    S.incomes = S.incomes.map(i => {
      if (!validInc.has(i.cat)) { changed = true; return {...i, cat:'diger'}; }
      return i;
    });
    if (changed) localStorage.setItem('ay_inc', JSON.stringify(S.incomes));
  } catch(e) {}
  try {
    const bu = localStorage.getItem('ay_bud');
    if (bu) S.budgets = {...DEF_BUD, ...JSON.parse(bu)};
  } catch(e) {}
  try {
    const fv = localStorage.getItem('ay_favs');
    if (fv !== null) {
      const parsed = JSON.parse(fv);
      if (Array.isArray(parsed)) S.favs = parsed.map(f => ({...f, id: f.id || genId()}));
    }
  } catch(e) {}
  try {
    const cc = localStorage.getItem('ay_cats_custom');
    if (cc !== null) {
      const parsed = JSON.parse(cc);
      if (Array.isArray(parsed)) S.customCats = parsed.filter(c=>c && c.id && c.label);
    }
  } catch(e) {}
  try {
    const dd = localStorage.getItem('ay_cats_deleted');
    if (dd !== null) {
      const parsed = JSON.parse(dd);
      if (Array.isArray(parsed)) S.deletedDefaults = parsed.filter(x=>typeof x==='string');
    }
  } catch(e) { S.deletedDefaults = S.deletedDefaults || []; }
  // Not: silinen varsayılanların bütçe limiti KORUNUR (geri getirince geri dönsün). Görünür yüzeylerde
  // getVisibleCats ile gizlenir; aylık toplam limit (catSum) deletedDefaults'u dışlar.
  try {
    const sb = localStorage.getItem('ay_subs');
    if (sb !== null) {
      const parsed = JSON.parse(sb);
      if (Array.isArray(parsed)) S.subs = parsed.map(s => ({...s, id: s.id || genId()}));
    }
  } catch(e) {}
  try {
    const cd = localStorage.getItem('ay_cards');
    if (cd !== null) {
      const parsed = JSON.parse(cd);
      if (Array.isArray(parsed)) S.cards = parsed.map(c => ({...c, id: c.id || genId()}));
    }
  } catch(e) {}
  try {
    const fk = localStorage.getItem('ay_findeks');
    if (fk !== null) {
      const parsed = JSON.parse(fk);
      if (Array.isArray(parsed)) S.findeks = parsed
        .filter(x => x && x.date && Number.isFinite(+x.score))
        .map(x => ({ id: x.id || genId(), date: String(x.date).slice(0,10), score: +x.score, note: String(x.note||'') }));
    }
  } catch(e) {}
  try {
    const ml = localStorage.getItem('ay_monthlim');
    if (ml !== null && ml !== '') {
      const n = +ml;
      if (Number.isFinite(n) && n > 0) S.monthLimit = n;
    }
  } catch(e) {}
  loadGeminiKey();
  const el = document.getElementById('saved-at');
  if (el) el.textContent = new Date().toLocaleDateString('tr-TR');
  renderChoiceChips('stmt-bank-chips',[
    {value:'İşbank',label:'İşbank'},{value:'VakıfBank',label:'VakıfBank'},{value:'Enpara',label:'Enpara'}
  ], document.getElementById('stmt-bank')?.value || 'İşbank', "pickStmtBank('__VAL__')");
  renderDash();
}

function save() {
  const el = document.getElementById('saved-at');
  try {
    localStorage.setItem('ay_exp', JSON.stringify(S.userExp));
    localStorage.setItem('ay_inc', JSON.stringify(S.incomes));
    localStorage.setItem('ay_bud', JSON.stringify(S.budgets));
    localStorage.setItem('ay_favs', JSON.stringify(S.favs));
    localStorage.setItem('ay_cats_custom', JSON.stringify(S.customCats||[]));
    localStorage.setItem('ay_cats_deleted', JSON.stringify(S.deletedDefaults||[]));
    localStorage.setItem('ay_subs', JSON.stringify(S.subs||[]));
    localStorage.setItem('ay_cards', JSON.stringify(S.cards||[]));
    localStorage.setItem('ay_findeks', JSON.stringify(S.findeks||[]));
    if (S.monthLimit==null) {
      localStorage.removeItem('ay_monthlim');
    } else {
      localStorage.setItem('ay_monthlim', String(+S.monthLimit));
    }
    if (el) el.textContent = new Date().toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'}) + ' ✓';
  } catch(e) {
    if (el) el.textContent = '⚠ hata';
  }
}

// ── calc.js köprüleri ──────────────────────────────────────────
// Saf hesaplar calc.js'te yaşıyor. Mevcut ~200 çağrı yeri değişmesin diye
// aynı kısa adlarla buraya bağlanıyor. MK tanımından sonra gelmeli.
const fmt=CALC.fmt;
const parseTrNum=CALC.parseTrNum;
const mIdx=d=>CALC.mIdx(d,MK);
const catAvg3=cat=>S.expenses.filter(e=>mIdx(e.d)>=3&&e.cat===cat).reduce((a,e)=>a+e.amt,0)/3;
const catMonth=(cat,m)=>S.expenses.filter(e=>mIdx(e.d)===m&&e.cat===cat).reduce((a,e)=>a+e.amt,0);
const monthP=m=>S.expenses.filter(e=>mIdx(e.d)===m&&e.cat!=='uyap').reduce((a,e)=>a+e.amt,0);
const monthI=m=>S.incomes.filter(i=>mIdx(i.d)===m).reduce((a,i)=>a+i.amt,0);
const cleanPct=v=>{
  const n=parseTrNum(v);
  if(!Number.isFinite(n)) return DEFAULT_FIBER_PCT;
  return Math.min(100, Math.max(DEFAULT_FIBER_PCT, n));
};
const calcFiberAmt=(amt,pct)=>Math.round(((+amt||0)*cleanPct(pct)/100)*100)/100;
const incomeFiberAmt=i=>{
  if(!i) return 0;
  const saved=+i.fiberAmt;
  if(Number.isFinite(saved) && saved>0) return saved;
  if(i.fiberPct!==undefined) return calcFiberAmt(i.amt,i.fiberPct);
  return 0;
};
const incomeFiberPct=i=>{
  if(!i || i.fiberPct===undefined) return null;
  return cleanPct(i.fiberPct);
};
const fmtPct=p=>Number.isInteger(+p)?String(+p):(+p).toLocaleString('tr-TR',{maximumFractionDigits:2});
const lvl=p=>p>=100?'red':p>=90?'orange':p>=70?'yellow':'green';

function loadGeminiKey(){
  try{
    const key=(localStorage.getItem(GEMINI_KEY_STORAGE)||'').trim();
    const input=document.getElementById('gemini-key');
    if(input) input.value=key;
    updateGeminiKeyStatus(key);
    // Key boşsa details'i default açık tut; dolu ise kapalı
    const det=document.getElementById('gemini-details');
    if(det && !key) det.open=true;
    return key;
  }catch(_){return '';}
}
function saveGeminiKey(value){
  const trimmed=(value||'').trim();
  try{
    localStorage.setItem(GEMINI_KEY_STORAGE,trimmed);
    updateGeminiKeyStatus(trimmed);
  }catch(e){
    toast('Tarayıcı depolama kapalı (özel sekme olabilir)',true);
  }
}
function getGeminiKey(){
  // storage-first: localStorage her zaman doğru değeri tutar
  let key='';
  try{ key=(localStorage.getItem(GEMINI_KEY_STORAGE)||'').trim(); }catch(_){}
  if(!key){
    const input=document.getElementById('gemini-key');
    if(input && input.value) key=input.value.trim();
  }
  return key;
}
function updateGeminiKeyStatus(key){
  const el=document.getElementById('gemini-key-status');
  if(!el) return;
  if(key){ el.textContent='✓ kayıtlı'; el.className='gk-status ok'; }
  else   { el.textContent='(boş)';   el.className='gk-status off'; }
}
async function testGeminiKey(){
  const btn=document.getElementById('gemini-test-btn');
  const out=document.getElementById('gemini-test-out');
  if(!out) return;
  out.textContent='Test ediliyor…'; out.className='gk-test-out';
  if(btn) btn.disabled=true;
  try{
    const data=await callGemini({
      systemInstruction:'Sadece "ok" yaz. Hiçbir açıklama ekleme.',
      userText:'Merhaba de',
      responseMimeType:'text/plain',
      maxOutputTokens:128,
      disableThinking:true
    });
    const txt=(geminiText(data)||'').toLowerCase();
    if(txt){
      out.textContent='✓ Bağlantı başarılı · key geçerli';
      out.className='gk-test-out ok';
      toast('Gemini bağlantısı çalışıyor');
    } else {
      const reason=(data.candidates&&data.candidates[0]&&data.candidates[0].finishReason)||'bilinmiyor';
      out.textContent='⚠ Model metin döndürmedi (finishReason: '+reason+'). Yine de key geçerli olabilir; Analiz Et ile deneyin.';
      out.className='gk-test-out warn';
    }
  }catch(e){
    out.textContent='✗ '+friendlyGeminiError(e);
    out.className='gk-test-out err';
    toast('Bağlantı başarısız',true);
  }
  if(btn) btn.disabled=false;
}
function friendlyGeminiError(e){
  const m=String(e&&e.message||e||'').toLowerCase();
  if(m.includes('api key gerekli')) return 'API key girilmemiş. Alan boş görünüyor.';
  if(m.includes('api_key') || m.includes('api key') || m.includes('invalid') && m.includes('key')) return 'API key geçersiz. Google AI Studio\'dan yeni bir key alın.';
  if(m.includes('401') || m.includes('403') || m.includes('unauthenticated') || m.includes('permission')) return 'API key yetkisiz (401/403). Key\'i kontrol edin.';
  if(m.includes('429') || m.includes('quota') || m.includes('rate')) return 'Kota/oran limiti aşıldı (429). Birkaç dakika bekleyin.';
  if(m.includes('failed to fetch') || m.includes('network')) return 'İnternet bağlantısı yok veya erişim engellendi.';
  if(m.includes('model') && m.includes('not found')) return 'Model bulunamadı. Gemini modeli değişmiş olabilir.';
  return e&&e.message?e.message:'Bilinmeyen hata';
}
function geminiText(data){
  return (data.candidates||[])
    .flatMap(c=>(c.content&&c.content.parts)||[])
    .map(p=>p.text||'')
    .join('')
    .trim();
}
async function callGemini({systemInstruction,userText,responseMimeType='text/plain',responseSchema=null,maxOutputTokens=2048,disableThinking=false}){
  const apiKey=getGeminiKey();
  if(!apiKey) throw new Error('Gemini API key gerekli');
  const body={
    systemInstruction:{parts:[{text:systemInstruction}]},
    contents:[{role:'user',parts:[{text:userText}]}],
    generationConfig:{
      temperature:0.2,
      maxOutputTokens,
      responseMimeType
    }
  };
  if(responseSchema) body.generationConfig.responseSchema=responseSchema;
  // Gemini 2.5 flash thinking modu — küçük prompt'larda tüm token'ı thinking'e yakabiliyor
  if(disableThinking) body.generationConfig.thinkingConfig={thinkingBudget:0};
  const res=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,{
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      'x-goog-api-key':apiKey
    },
    body:JSON.stringify(body)
  });
  const data=await res.json().catch(()=>({}));
  if(!res.ok){
    const msg=data.error&&data.error.message?data.error.message:`HTTP ${res.status}`;
    throw new Error(msg);
  }
  if(data.promptFeedback&&data.promptFeedback.blockReason){
    throw new Error(`İstek engellendi: ${data.promptFeedback.blockReason}`);
  }
  return data;
}
function statementSchema(bank){
  return {
    type:'array',
    items:{
      type:'object',
      properties:{
        d:{type:'string',description:'işlem tarihi YYYY-MM-DD'},
        desc:{type:'string',description:'kısa işlem açıklaması'},
        amt:{type:'number',description:'pozitif tutar'},
        cat:{type:'string',enum:getCats().map(c=>c.id)},
        bank:{type:'string',enum:[bank]}
      },
      required:['d','desc','amt','cat','bank']
    }
  };
}
function buildSpendingAnalysisInput(){
  const expenses=[...S.expenses];
  const incomes=[...S.incomes];
  const totalExp=expenses.reduce((a,e)=>a+e.amt,0);
  const totalInc=incomes.reduce((a,i)=>a+i.amt,0);
  const totalFiber=incomes.reduce((a,i)=>a+incomeFiberAmt(i),0);
  const byCategory=getCats().map(c=>({
    id:c.id,
    label:c.label,
    budget:S.budgets[c.id]||0,
    total:expenses.filter(e=>e.cat===c.id).reduce((a,e)=>a+e.amt,0),
    last3Avg:catAvg3(c.id)||0
  })).filter(x=>x.total>0||x.budget>0);
  const byMonth=MN.map((label,i)=>({
    month:label,
    expenses:monthP(i),
    incomes:monthI(i),
    net:monthI(i)-monthP(i),
    uyap:S.expenses.filter(e=>mIdx(e.d)===i&&e.cat==='uyap').reduce((a,e)=>a+e.amt,0)
  }));

  // Dönem özetleri (1 ay / 3 ay / 6 ay) — pencere içi MN tabanlı
  const periodSummary=(idxs,label)=>{
    const valid=idxs.filter(i=>i>=0&&i<MN.length);
    const monthsLbl=valid.map(i=>MN[i]);
    const exp=valid.reduce((a,i)=>a+monthP(i),0);
    const inc=valid.reduce((a,i)=>a+monthI(i),0);
    const uyap=valid.reduce((a,i)=>a+S.expenses.filter(e=>mIdx(e.d)===i&&e.cat==='uyap').reduce((s,e)=>s+e.amt,0),0);
    const cats=getCats().map(c=>({
      id:c.id,
      label:c.label,
      total: valid.reduce((a,i)=>a+catMonth(c.id,i),0),
      budget: S.budgets[c.id]||0
    })).filter(x=>x.total>0).sort((a,b)=>b.total-a.total);
    return {
      label,
      months: monthsLbl,
      monthCount: valid.length,
      totalIncomes: inc,
      totalExpenses: exp,
      net: inc-exp,
      uyapTotal: uyap,
      avgMonthlyIncome: valid.length?inc/valid.length:0,
      avgMonthlyExpense: valid.length?exp/valid.length:0,
      topCategories: cats.slice(0,8),
      categoryBudgetUsage: cats.filter(c=>c.budget>0).map(c=>({
        label:c.label,
        spent:c.total,
        monthlyBudget:c.budget,
        expectedForPeriod:c.budget*valid.length,
        usagePct: c.budget>0?Math.round(c.total/(c.budget*valid.length)*100):0
      }))
    };
  };
  const cur=(typeof CUR_IDX==='number')?CUR_IDX:(MN.length-1);
  const periods={
    "1_aylik": periodSummary([cur],'Bu ay (son 1 ay)'),
    "3_aylik": periodSummary([cur-2,cur-1,cur],'Son 3 ay'),
    "6_aylik": periodSummary([0,1,2,3,4,5].filter(i=>i<MN.length),'Son 6 ay')
  };

  // Tüm geçmiş — 6 aylık pencere dışındaki kayıtlar dahil olmak üzere ay-yıl bazlı toplam
  const allByMonth={};
  expenses.forEach(e=>{
    const k=String(e.d||'').slice(0,7);
    if(!k) return;
    if(!allByMonth[k]) allByMonth[k]={month:k,expenses:0,incomes:0,uyap:0};
    allByMonth[k].expenses+=e.amt;
    if(e.cat==='uyap') allByMonth[k].uyap+=e.amt;
  });
  incomes.forEach(i=>{
    const k=String(i.d||'').slice(0,7);
    if(!k) return;
    if(!allByMonth[k]) allByMonth[k]={month:k,expenses:0,incomes:0,uyap:0};
    allByMonth[k].incomes+=i.amt;
  });
  const allMonthlyHistory=Object.values(allByMonth).sort((a,b)=>a.month.localeCompare(b.month));

  const topExpenses=[...expenses]
    .sort((a,b)=>b.amt-a.amt)
    .slice(0,30)
    .map(e=>({date:e.d,desc:e.desc,amount:e.amt,category:e.cat,bank:e.bank}));
  const recentExpenses=[...expenses]
    .sort((a,b)=>b.d.localeCompare(a.d)||b.id.localeCompare(a.id))
    .slice(0,80)
    .map(e=>({date:e.d,desc:e.desc,amount:e.amt,category:e.cat,bank:e.bank}));
  return JSON.stringify({
    summary:{
      totalExpenses:totalExp,
      totalIncomes:totalInc,
      totalFiber,
      fiberRate:totalInc>0?totalFiber/totalInc*100:0,
      net:totalInc-totalExp,
      goal:GOAL,
      totalRecordsExpenses: expenses.length,
      totalRecordsIncomes: incomes.length
    },
    periods,
    allMonthlyHistory,
    budgets:byCategory,
    monthly:byMonth,
    topExpenses,
    recentExpenses
  },null,2);
}
function setSelectValue(id,val){
  const el=document.getElementById(id);
  if(el) el.value=val;
}
function renderChoiceChips(targetId, options, current, onPick){
  const el=document.getElementById(targetId);
  if(!el) return;
  el.innerHTML=options.map(o=>`<button class="bank-chip ${current===o.value?'on':''}" onclick="${onPick.replace('__VAL__', o.value)}">${o.label}</button>`).join('');
}
function updateFiberPreview(){
  const amtEl=document.getElementById('gi-amt');
  const pctEl=document.getElementById('gi-fiber-pct');
  const out=document.getElementById('gi-fiber-preview');
  if(pctEl && !pctEl.value) pctEl.value=DEFAULT_FIBER_PCT;
  const pct=cleanPct(pctEl?.value);
  const amt=parseTrNum(amtEl?.value)||0;
  if(out) out.textContent=`${fmt(calcFiberAmt(amt,pct))} ₺`;
}
function pickQuickBank(v){ setSelectValue('q-bank',v); buildCatGrid(); }
function pickIncomeBank(v){ setSelectValue('gi-bank',v); renderIncome(); }
function pickStmtBank(v){ setSelectValue('stmt-bank',v); renderChoiceChips('stmt-bank-chips',[{value:'İşbank',label:'İşbank'},{value:'VakıfBank',label:'VakıfBank'},{value:'Enpara',label:'Enpara'}],v,"pickStmtBank('__VAL__')"); }
function renderThemeSelection(){
  const cur=(document.documentElement.getAttribute('data-theme')||'cream');
  document.querySelectorAll('[data-theme-pick]').forEach(btn=>{
    btn.setAttribute('aria-selected', btn.getAttribute('data-theme-pick')===cur ? 'true' : 'false');
  });
}
function quickPad(v){
  const el=document.getElementById('q-amt');
  if(!el) return;
  if(v==='del') el.value=el.value.slice(0,-1);
  else el.value += v===',' && el.value.includes(',') ? '' : v;
}
function normalizeTr(str){
  return String(str||'')
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g,'i')
    .replace(/İ/g,'i')
    .replace(/ş/g,'s')
    .replace(/Ş/g,'s')
    .replace(/ğ/g,'g')
    .replace(/Ğ/g,'g')
    .replace(/ü/g,'u')
    .replace(/Ü/g,'u')
    .replace(/ö/g,'o')
    .replace(/Ö/g,'o')
    .replace(/ç/g,'c')
    .replace(/Ç/g,'c');
}
function extractIsoDate(line){
  const s=String(line||'');
  let m=s.match(/\b(\d{4})[.\-/](\d{2})[.\-/](\d{2})\b/);
  if(m) return `${m[1]}-${m[2]}-${m[3]}`;
  m=s.match(/\b(\d{2})[.\-/](\d{2})[.\-/](\d{4})\b/);
  if(m) return `${m[3]}-${m[2]}-${m[1]}`;
  return '';
}
function parseMoneyToken(token){
  let s=String(token||'').replace(/[₺TLtl\s]/g,'');
  if(!s) return 0;
  if(s.includes(',') && s.includes('.')){
    if(s.lastIndexOf(',') > s.lastIndexOf('.')) s=s.replace(/\./g,'').replace(',', '.');
    else s=s.replace(/,/g,'');
  } else if(s.includes(',')) {
    const parts=s.split(',');
    s=parts.length===2 && parts[1].length<=2 ? parts[0].replace(/\./g,'')+'.'+parts[1] : s.replace(/,/g,'');
  } else {
    s=s.replace(/,/g,'');
  }
  const n=parseFloat(s);
  return Number.isFinite(n)?Math.abs(n):0;
}
function inferCategory(desc){
  const s=' '+normalizeTr(desc)+' ';
  // Sıra önemli: daha spesifik kurallar önce. İlk eşleşme kazanır.
  const rules=[
    ['uyap',['uyap','avkt','avukat portali','adalet bakanligi','baro','mahkeme harci',' harc ']],
    ['kira',[' kira ','metin sagir','tugay tuna','emlak']],
    ['muhasebe',['muhasebe','mali musavir','ahmet korkmaz','smmm']],
    ['ulasim',[
      'istanbulkart','istanbul kart','i̇bb','ibb ulasim','bkm iett','iett','metro istanbul','metrobüs','metrobus','marmaray','akbil',
      'bitaksi','uber','taksi','moovit','marti','scotty','tag taksi','itaksi',
      'hgs','ogs','kgs','otoyol','koprugecis','kopru gecis','osmangazi koprusu','yavuz sultan','15 temmuz koprusu','avrasya tuneli',
      'shell','opet','petrol ofisi','po/','bp ','total ','lukoil','aygaz','akaryakit','benzin','motorin','mazot','lpg','petrol','aytemiz','gulf','tabuk','mogaz','milangaz',
      'otopark','ispark','park ','valet','park yeri',
      'pegasus','thy','turkish airlines','anadolujet','sunexpress','tav','airline','havalimani','havaliman',
      'obilet','biletall','tcdd','pamukkale','metro turizm','kamilkoc','kamil koc','ulasim','bilet tr','enuygun','jet seyahat','tatil sepeti',
      'cicek sepeti ulasim','araç','arac muayene','tuvturk','muayene','oto lastik','oto yedek'
    ]],
    ['fatura',[
      'turknet','vodafone','turk telekom','turkcell','turk.telekom','enerjisa','igdas','iski','aski','baski','boğazici elektrik','bogazici elektrik','baskent elektrik','akedas','cenal','cenal enerji','superonline','superbox','kablonet','tv+','tv plus','digiturk','d-smart','dsmart','fatura','tt mobil','tt fibernet','turk telekom mobil','vodafone tv','cepte','turkcell faturali','turkcell faturali hat','dogalgaz','doğalgaz','elektrik','su faturasi','su fatura','internet fatura','internet faturasi','hat tarifesi','konutgaz','aydem','epdk'
    ]],
    ['dijital',[
      'apple.com','app store','appstore','itunes','icloud','apple services',
      'google','google play','playstore','google workspace','google cloud','google one','youtube','youtube premium','youtube music',
      'spotify','netflix','blutv','blu tv','gain','exxen','disney','mubi','puhu tv','tod','tod tv',
      'claude','anthropic','openai','chatgpt','openrouter','mistral','perplexity','cursor',
      'microsoft 365','office 365','onedrive','xbox',
      'amazon prime','prime video','adobe','canva','notion','figma','jetbrains','github','gitlab','dropbox','zoom','slack','linear',
      'namecheap','godaddy','paddle','stripe','gumroad','patreon','substack','medium'
    ]],
    ['market',[
      'migros','a101','a 101','bim','sok ','şok','carrefour','carrefoursa','macrocenter','macro center','metro gross','metro gros','tarim kredi','happy center','happycenter','bizim toptan','ucz ','onur market','file ','kipa','makro ','tansas','tansaş','pehlivanoglu market','tarim','ucuzluk','market','gida','manav','kasap','sarkuteri','bakkal','mopas','kiler','rossmann','watsons','gratis','sevgi market','5m migros','jumbo','jysk','tedi','flo park','onurlar market','sutas','pinar sut','torku','altin pirinc','migros sanal','sanal market','m migros','marketim'
    ]],
    ['yemek',[
      'yemeksepeti','getir yemek','trendyol yemek','yemek sepeti','foodie','getir','migros yemek',
      'starbucks','espressolab','espresso lab','caribou','kahve dunyasi','kahve dunyası','kahve','coffee','costa','cafe','kafe','tchibo','gloria jeans',
      'burger','mcdonalds','popeyes','kfc','little caesars','dominos','pizza','papa johns','sbarro','baydoner','baydöner','cigkoftem','tavuk dunyasi','tavuk dünyası','komagene','dürümzade','doner ',
      'borek','börek','simit sarayi','simit sarayı','simit','pide','lahmacun','kebap','doner','döner','tavuk','corba','çorba','kahvalti','kahvaltı',
      'restoran','restaurant','lokanta','firin','fırın','bistro','meyhane','balik','balık','sushi','sushico','midye','koftem','köfte','mantı','manti','bueno','cigkofte','çiğköfte','baklava','tatlici','tatlıcı','dondurma','mado','pastane','pastacı','pastaci',
      'hebun','özgur','ozgur','ozgür','meşhur','mehmet ',' aile '
    ]],
    ['spor',[
      'halisaha','halı saha','fitness','macfit','mac fit','mars athletic','sports international','gym','yoga','pilates','zumba','crossfit','spor ',
      'decathlon','intersport'
    ]],
    ['eticaret',[
      'trendyol','hepsiburada','amazon','temu','n11','gittigidiyor','morhipo','modanisa','pull&bear','pull and bear','zara','bershka','stradivarius','lc waikiki','lcw','defacto','koton','mavi','polo garage','u.s. polo','altinyildiz','altınyıldız','boyner','flo ','kinetix','inci ','ikea','tekzen','bauhaus','koctas','koçtaş','aliexpress','ebay','wish','pttavm','vatan bilgisayar','teknosa','media markt','mediamarkt','arcelik','arçelik','vestel','beko','samsung shop','apple store online','dyson','philips shop','xiaomi','dijital adres','epttavm','tilki','rakuten','etsy','asos','farfetch'
    ]],
    ['saglik',[
      'eczane','pharmacy','hastane','klinik','klinik.','tıp merkezi','tip merkezi','dr.','dt.','laboratuvar','labaratuvar','laboratuar','tahlil','mr.','tomografi','ortopedi','dental','cerrahi','acibadem','acıbadem','memorial','liv hospital','medipol','medicana','anadolu saglik','dunyagoz','dünyagöz','optik','medline','medlife','pharma','ecz.','özel hastane','özel klinik','tibbi','tıbbi','poliklinik','dental klinik','aile sağlık','aile saglik','sağlık ocağı','saglik ocagi','medikal','dermatoloji','goz hastaliklari','göz hastalıkları'
    ]],
    ['egitim',[
      'udemy','coursera','skillshare','edx','brilliant','okul','universite','üniversite','kurs','egitim','eğitim','akademi','dergi','kitap','d&r','idefix','kitapyurdu','dershane','etüt','etut','okul aidat','okul taksiti','özel ders','ozel ders','yayinevi','yayınevi','remzi kitabevi','kitap yurdu'
    ]],
    ['eglence',[
      'steam','epic games','epicgames','playstation','sony entertainment','xbox game','nintendo','roblox','riot','twitch','blizzard','battle.net','origin','ubisoft','rockstar','gameforge',
      'passo','biletix','ticketmaster','cinemaximum','cinebonus','cinetime','atlantis sinema','sinema','tiyatro','konser','mac bilet','stadyum','bilet ',
      'lunapark','kidzania','harikalar diyari','eğlence','eglence','muze','müze','sergi','aquaduck','vialand','jolly joker','iksv'
    ]],
    ['giyim',[
      'waikiki','lcw','mudo','fenerium','giyim','boyner','defacto','koton','mavi','pull&bear','zara','bershka','stradivarius','polo','nike','adidas','puma','under armour','new balance','flo ','kinetix','inci ayakkabi','h&m','h ve m','massimo dutti','mango','guess','tommy hilfiger','calvin klein','ipekyol','machka','vakko','sarar','damat','intimissimi','victoria','victorias secret','penti','suwen','derimod','divarese'
    ]],
    ['yatirim',[
      'funding','quant','yatirim','yatırım','borsa','hisse','fon ',' fon','bist','tefas','tahvil','bono','altin','altın','gumus','gümüş','kripto','binance','btcturk','paribu','coinbase','bitfinex','okx'
    ]],
    ['vergi',['vergi','v.d.','vergi dairesi','gib ','motorlu tasit','mtv ','emlak vergisi','cevre temizlik','çevre temizlik']],
    ['nakit',['nakit','atm cekim','para cekme','para çekme','nakit cekim','atm.','withdraw']]
  ];
  for(const [cat,keys] of rules){
    if(keys.some(k=>s.includes(k))) return cat;
  }
  return 'diger';
}
function parseStatementFallback(text,bank){
  const lines=String(text||'')
    .split(/\r?\n/)
    .map(x=>x.trim())
    .filter(Boolean);
  const skipWords=['iade','refund','geri odeme','iptal','alacak','gelen transfer','gelen havale','gelen eft','yatirilan','odeme alindi','faiz','bakiye','toplam','son odeme','ekstre tarihi','hesap kesim','devir'];
  const rows=[];
  for(const rawLine of lines){
    const line=rawLine.replace(/\s+/g,' ').trim();
    if(line.length<6) continue;
    const normalized=normalizeTr(line);
    if(skipWords.some(w=>normalized.includes(w))) continue;
    const date=extractIsoDate(line);
    if(!date) continue;
    let rest=line
      .replace(/\b\d{4}[.\-/]\d{2}[.\-/]\d{2}\b/,'')
      .replace(/\b\d{2}[.\-/]\d{2}[.\-/]\d{4}\b/,'')
      .trim();
    const amountMatches=[...rest.matchAll(/-?\d[\d.,]*\d|-?\d+/g)].map(m=>m[0]);
    if(!amountMatches.length) continue;
    const amountToken=amountMatches[amountMatches.length-1];
    const amt=parseMoneyToken(amountToken);
    if(!amt) continue;
    rest=rest.replace(amountToken,' ').replace(/\s+/g,' ').trim();
    rest=rest.replace(/^[*\-–—:]+|[*\-–—:]+$/g,'').trim();
    if(!rest) rest=bank+' ekstresi';
    rows.push({
      id:genId(),
      d:date,
      desc:rest,
      amt,
      cat:inferCategory(rest),
      bank
    });
  }
  return rows;
}
function importStatementRows(rows){
  // Ekstre giriş tarihi override: orijinal transaction tarihlerini yoksay,
  // hepsini bugüne kaydet. Takvimde tek kırmızı nokta, bütçe kategorileri korunur.
  const today=new Date().toISOString().slice(0,10);
  let added=0;
  rows.forEach(row=>{
    const clean={
      id:row.id||genId(),
      d:today,  // orijinal row.d yoksayıldı
      desc:(row.desc||'').trim(),
      amt:Math.abs(Number(row.amt)||0),
      cat:getCats().some(c=>c.id===row.cat)?row.cat:'diger',
      bank:(row.bank||'').trim()
    };
    if(!clean.desc||!clean.amt||!clean.bank) return;
    S.userExp.push(clean);
    S.expenses.push(clean);
    added++;
  });
  return added;
}
function renderSubsection(sec){
  // Gemini (model) çıktısı GÜVENİLMEZ kabul edilir — başlık/gövde/maddeler escAttr ile kaçışlanır.
  const m=sec.match(/^(\d\))\s*([^\n]+)\n?([\s\S]*)$/);
  const titleRaw=m?m[2]:sec.split('\n')[0];
  const body=(m?m[3]:sec.split('\n').slice(1).join('\n')).trim();
  const cls=/Risk/i.test(titleRaw)?'ai-sec neg':/Öner|Aksiyon|Strateji/i.test(titleRaw)?'ai-sec pos':'ai-sec';
  const title=escAttr(titleRaw);
  const items=body.split(/\n+/).filter(Boolean);
  if(items.length>1 && items.every(it=>/^[-*•]\s/.test(it))){
    return `<div class="${cls}"><h4>${title}</h4><ul>${items.map(i=>`<li>${escAttr(i.replace(/^[-*•]\s*/,''))}</li>`).join('')}</ul></div>`;
  }
  if(items.length>1){
    return `<div class="${cls}"><h4>${title}</h4>${items.map(i=>`<p>${escAttr(i.replace(/^[-*•]\s*/,''))}</p>`).join('')}</div>`;
  }
  return `<div class="${cls}"><h4>${title}</h4><p>${escAttr(body).replace(/\n/g,'<br>')}</p></div>`;
}
function renderAnalysisHtml(text){
  const safe=String(text||'').trim();
  if(!safe) return 'Analiz üretilemedi.';
  // 3 dönemli format: ## başlıklarına göre dönem böl
  const hasPeriods = /(^|\n)##\s/.test(safe);
  if(hasPeriods){
    const periodSections = safe.split(/\n(?=##\s)/).map(s=>s.trim()).filter(Boolean);
    return periodSections.map(period=>{
      const headerMatch = period.match(/^##\s*([^\n]+)\n?([\s\S]*)$/);
      const periodTitle = headerMatch ? headerMatch[1].trim() : 'Analiz';
      const periodBody = (headerMatch ? headerMatch[2] : period).trim();
      const subs = periodBody.split(/\n(?=\d\)\s)/).map(s=>s.trim()).filter(Boolean);
      const inner = subs.length
        ? subs.map(renderSubsection).join('')
        : `<div class="ai-sec"><p>${escAttr(periodBody).replace(/\n/g,'<br>')}</p></div>`;
      const periodCls = /1\s*ay/i.test(periodTitle)?'p1':/3\s*ay/i.test(periodTitle)?'p3':/6\s*ay/i.test(periodTitle)?'p6':'';
      return `<div class="ai-period ${periodCls}"><h3 class="ai-period-title">${escAttr(periodTitle)}</h3>${inner}</div>`;
    }).join('');
  }
  // Eski tek-bölümlü format (geriye uyumluluk + lokal analiz)
  const sections = safe.split(/\n(?=\d\)\s)/).map(s=>s.trim()).filter(Boolean);
  if(sections.length<2) return `<div class="ai-sec"><h4>Analiz</h4><p>${escAttr(safe).replace(/\n/g,'<br>')}</p></div>`;
  return sections.map(renderSubsection).join('');
}

function toast(msg,isErr){
  const t=document.getElementById('toast');
  t.textContent=msg;
  t.style.background=isErr?'#8B2020':'#2A7A52';
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2500);
}
function getAlerts(monthIdx){
  const m=(monthIdx==null)?CUR_IDX:monthIdx;
  return getVisibleCats().filter(c=>S.budgets[c.id]>0&&c.id!=='uyap').map(c=>{
    const spent=catMonth(c.id,m),lim=S.budgets[c.id],pct=spent/lim*100;
    return{cat:c,spent,lim,pct,lvl:lvl(pct),monthIdx:m};
  }).filter(a=>a.pct>=70).sort((a,b)=>b.pct-a.pct);
}

// ══════════════════════════════════════════════════════════════
// RENDER DASHBOARD (calendar-first)
// ══════════════════════════════════════════════════════════════
let pnlCh;
// ── Hero: ay seçici + net bakiye + aylık toplam limit çubuğu ────
// Aylık limit: S.monthLimit varsa o, yoksa kategori limitlerinin toplamı.
function effectiveMonthLimit(){
  const catSum=Object.values(S.budgets||{}).reduce((a,v)=>a+(Number(v)||0),0);
  return (S.monthLimit!=null && +S.monthLimit>0) ? +S.monthLimit : catSum;
}

function renderHero(m){
  const monthInc=monthI(m), monthExp=monthP(m), monthNet=monthInc-monthExp;

  const lbl=document.getElementById('hero-month-label');
  if(lbl) lbl.textContent=MN[m].toUpperCase();

  const balNet=document.getElementById('bal-net');
  if(balNet){
    balNet.textContent=`${monthNet>=0?'+':'−'}${fmt(Math.abs(monthNet))} ₺`;
    balNet.style.color=monthNet>=0?'var(--pos)':'var(--neg)';
  }
  const balInc=document.getElementById('bal-inc');
  if(balInc) balInc.textContent=`${fmt(monthInc)} ₺`;
  const balExp=document.getElementById('bal-exp');
  if(balExp) balExp.textContent=`${fmt(monthExp)} ₺`;

  const lim=effectiveMonthLimit();
  const pct=CALC.limitFill(monthExp,lim);
  const wrap=document.getElementById('hero-limit-wrap');
  const fill=document.getElementById('goal-fill');
  const stat=document.getElementById('goal-status');
  const targ=document.getElementById('goal-target');

  if(pct===null){
    // Hiç limit tanımlı değil — çubuk gizlenir, düzenleme yine de açılabilsin diye
    // wrap görünür kalır ama içi boşaltılır.
    if(fill) fill.style.width='0%';
    if(stat) stat.textContent='Aylık limit tanımlı değil';
    if(targ) targ.textContent='dokun → belirle';
    if(stat) stat.style.color='var(--ink-3)';
    return;
  }
  if(wrap) wrap.style.display='';
  if(fill){
    fill.style.width=Math.min(pct,100)+'%';
    fill.style.background=pct>100?'var(--neg)':'var(--pos)';
  }
  if(stat){
    stat.textContent=pct>100
      ? `%${pct} · ${fmt(monthExp-lim)} ₺ aşım`
      : `%${pct} · ${fmt(lim-monthExp)} ₺ kaldı`;
    stat.style.color=pct>100?'var(--neg)':'var(--pos)';
  }
  if(targ) targ.textContent=`${fmt(lim)} ₺ limit${S.monthLimit!=null?'':' (otomatik)'}`;
}

// Hedef çubuğuna dokununca aylık toplam limiti düzenle
function openMonthLimitEditor(){
  const catSum=Object.values(S.budgets||{}).reduce((a,v)=>a+(Number(v)||0),0);
  const cur=(S.monthLimit!=null && +S.monthLimit>0) ? +S.monthLimit : '';
  const v=prompt(`Aylık toplam gider limiti (₺).\nBoş bırakırsan kategori limitleri toplamı kullanılır (${fmt(catSum)} ₺).`, cur);
  if(v===null) return;
  const t=String(v).trim();
  if(t===''){
    S.monthLimit=null;
  } else {
    const n=parseTrNum(t);
    if(!Number.isFinite(n)||n<=0){ toast('Geçerli bir tutar gir',true); return; }
    S.monthLimit=n;
  }
  save();
  renderDash();
  toast(S.monthLimit==null?'Aylık limit otomatiğe alındı':'Aylık limit güncellendi');
}

// ══════════════════════════════════════════════════════════════
// PARAM NEREYE GİDİYOR — üst grup dağılımı
// ══════════════════════════════════════════════════════════════

// Grup limiti = gruptaki kategori limitlerinin toplamı. UYAP hariç.
function groupLimits(gmap){
  const out={};
  getVisibleCats().forEach(c=>{
    const g=gmap[c.id];
    if(g==='uyap') return;
    out[g]=(out[g]||0)+(Number(S.budgets[c.id])||0);
  });
  return out;
}

function deltaHtml(d){
  if(d===null) return `<span class="delta delta-none">yeni</span>`;
  if(d===0)    return `<span class="delta delta-none">─</span>`;
  return `<span class="delta ${d>0?'delta-up':'delta-down'}">${d>0?'↑':'↓'} %${Math.abs(d)}</span>`;
}

function renderDistribution(m){
  const body=document.getElementById('dist-body');
  const hint=document.getElementById('dist-hint');
  if(!body) return;

  const gmap=catGroupMap();
  const cur=CALC.groupTotals(S.expenses, m, MK, gmap);
  const prevByGroup={};
  if(m>0) CALC.groupTotals(S.expenses, m-1, MK, gmap).groups.forEach(g=>{ prevByGroup[g.id]=g.total; });

  if(hint) hint.textContent = cur.total>0 ? `${fmt(cur.total)} ₺` : '';

  if(cur.total===0 && cur.uyap===0){
    body.innerHTML=`<div class="empty-line">Bu ay henüz gider kaydı yok.</div>`;
    return;
  }

  const limits=groupLimits(gmap);
  const open=new Set(S.openGroups||[]);
  let html='';

  cur.groups.forEach(g=>{
    const share=Math.round((g.total/cur.total)*100);
    const d=CALC.deltaPct(g.total, prevByGroup[g.id]||0);
    const fill=CALC.limitFill(g.total, limits[g.id]);
    const isOpen=open.has(g.id);

    // Limit varsa doluluk, yoksa ayın toplamındaki pay gösterilir
    const barPct = (fill===null) ? share : Math.min(fill,100);
    const barCls = (fill===null) ? 'grp-bar-share' : (fill>100 ? 'grp-bar-over' : '');
    const barMeta = (fill===null)
      ? `<span class="grp-limit">limit yok</span>`
      : `<span class="grp-limit">limit ${fmt(limits[g.id])} ₺${fill>100?` · %${fill}`:''}</span>`;

    html += `<div class="grp ${isOpen?'grp-open':''}">`
      + `<button type="button" class="grp-head" onclick="toggleGroup('${escAttr(g.id)}')" aria-expanded="${isOpen}">`
      + `<span class="grp-caret">${isOpen?'▾':'▸'}</span>`
      + `<span class="grp-name">${escapeHtml(g.label)}</span>`
      + `<span class="grp-amt num">${fmt(g.total)} ₺</span>`
      + `<span class="grp-share num">%${share}</span>`
      + deltaHtml(d)
      + `</button>`
      + `<div class="grp-bar"><div class="grp-bar-fill ${barCls}" style="width:${barPct}%"></div></div>`
      + `<div class="grp-meta">${barMeta}</div>`
      + (isOpen ? renderGroupChildren(g.id, m, gmap) : '')
      + `</div>`;
  });

  if(cur.uyap>0){
    html += `<div class="uyap-line"><span>UYAP · mesleki transfer</span>`
      + `<span class="num">${fmt(cur.uyap)} ₺</span>`
      + `<span class="uyap-note">bütçe dışı</span></div>`;
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
    return `<div class="grp-child">`
      + `<span class="gc-icon">${escapeHtml(r.c.icon||'')}</span>`
      + `<span class="gc-name">${escapeHtml(r.c.label)}</span>`
      + `<span class="gc-amt num">${fmt(r.total)} ₺</span>`
      + deltaHtml(d)
      + `<button type="button" class="gc-lim" onclick="openCatLimitEditor('${escAttr(r.c.id)}')" title="Limit belirle">${lim>0?fmt(lim)+' ₺':'limit +'}</button>`
      + `</div>`;
  }).join('') + `</div>`;
}

function toggleGroup(id){
  const set=new Set(S.openGroups||[]);
  if(set.has(id)) set.delete(id); else set.add(id);
  S.openGroups=[...set];
  save();
  renderDistribution((S.dashM!==null)?S.dashM:CUR_IDX);
}

function openCatLimitEditor(catId){
  const meta=catMeta(catId);
  const cur=Number(S.budgets[catId])||0;
  const v=prompt(`${meta?meta.label:catId} için aylık limit (₺).\nBoş bırakırsan limit kalkar.`, cur||'');
  if(v===null) return;
  const t=String(v).trim();
  if(t===''){
    S.budgets[catId]=0;
  } else {
    const n=parseTrNum(t);
    if(!Number.isFinite(n)||n<0){ toast('Geçerli bir tutar gir',true); return; }
    S.budgets[catId]=n;
  }
  save();
  renderDash();
  toast('Limit güncellendi');
}

// ── Dikkat kartı — en fazla 3 sinyal, yoksa kart hiç gösterilmez ──
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

// ── 6 aylık trend: tek grafik + iki satır özet ─────────────────
// Eski sparkbar + bar chart + P&L tablosu bu tek kartta birleşti.
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
      `<div class="trend-line"><span>6 ay ortalama net</span><strong class="num ${avgNet>=0?'delta-down':'delta-up'}">${avgNet>=0?'+':'−'}${fmt(Math.abs(avgNet))} ₺</strong></div>`;
  }

  const ctx=document.getElementById('pnl-chart');
  if(!ctx) return;
  if(typeof Chart==='undefined'){
    // CDN yüklenmediyse grafiksiz devam et — özet satırları bilgiyi taşıyor
    ctx.style.display='none';
    return;
  }
  ctx.style.display='';

  if(pnlCh){ pnlCh.destroy(); pnlCh=null; }
  const cs=getComputedStyle(document.documentElement);
  const colPos=cs.getPropertyValue('--pos').trim()||'#5b7553';
  const colNeg=cs.getPropertyValue('--neg').trim()||'#b8543a';
  const colInk3=cs.getPropertyValue('--ink-3').trim()||'#8a857d';

  pnlCh=new Chart(ctx,{
    type:'bar',
    data:{labels:MN,datasets:[
      {label:'Gelir',data:inc,backgroundColor:colPos,borderWidth:0,borderRadius:6},
      {label:'Gider',data:exp,backgroundColor:colNeg,borderWidth:0,borderRadius:6},
    ]},
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{
        legend:{display:false},
        tooltip:{callbacks:{label:c=>`${c.dataset.label}: ${fmt(c.parsed.y)} ₺`}}
      },
      scales:{
        x:{grid:{display:false,drawBorder:false},ticks:{color:colInk3,font:{size:11},autoSkip:false}},
        y:{grid:{color:'rgba(128,128,128,0.12)',drawBorder:false},ticks:{color:colInk3,font:{size:10},callback:v=>fmt(v)+'₺'}}
      }
    }
  });
}

function renderDash(){
  const m = S.dashM!==null ? S.dashM : CUR_IDX;
  const monthKey = MK[m];

  renderHero(m);
  renderDistribution(m);
  renderAttention(m);

  renderDashCalendar(monthKey);
  renderDayList();

  const _tD=new Date();
  const _tIso2=_tD.toISOString().slice(0,10);
  const _wS=new Date(_tD); _wS.setDate(_tD.getDate()-((_tD.getDay()+6)%7));
  const _wIso2=_wS.toISOString().slice(0,10);
  const _todayG=S.expenses.filter(e=>e.d===_tIso2&&e.cat!=='uyap').reduce((a,e)=>a+e.amt,0);
  const _weekG=S.expenses.filter(e=>e.d>=_wIso2&&e.d<=_tIso2&&e.cat!=='uyap').reduce((a,e)=>a+e.amt,0);
  const _mtdG=S.expenses.filter(e=>e.d.slice(0,7)===MK[CUR_IDX]&&e.cat!=='uyap').reduce((a,e)=>a+e.amt,0);
  const dp=document.getElementById('dash-pulse');
  if(dp) dp.innerHTML=`
    <div class="pill">Bugün <strong>${fmt(_todayG)} ₺</strong></div>
    <div class="pill">Bu Hafta <strong>${fmt(_weekG)} ₺</strong></div>
    <div class="pill">Bu Ay <strong>${fmt(_mtdG)} ₺</strong></div>
  `;


  // metrics-row (Gider/Gelir/Net/Mesleki dörtlüsü) kaldırıldı — hero ve
  // dağılım kartı aynı bilgiyi taşıyor, UYAP dağılımın altındaki satırda.

  // Hedef çubuğu renderHero() içinde, trend grafiği renderTrend() içinde.
  renderTrend(m);

  // Bütçe uyarıları artık renderAttention() içinde (en fazla 3 sinyal).
  // NOT: getAlerts() bu değişiklikle çağrısız kaldı (ölü kod) — Task 13'te temizlenecek.
  renderThemeSelection();
}
function setDashM(m){S.dashM=m;renderDash();}

// ══════════════════════════════════════════════════════════════
// CALENDAR + DAY VIEW
// ══════════════════════════════════════════════════════════════
function renderDashCalendar(monthKey){
  const grid=document.getElementById('dash-cal-grid');
  const monthLbl=document.getElementById('dash-cal-month');
  if(!grid) return;

  const [y,mo]=monthKey.split('-').map(Number);
  const first=new Date(y,mo-1,1);
  const last=new Date(y,mo,0);
  const daysInMonth=last.getDate();
  // Monday-start offset (0 = Mon)
  const startOffset=(first.getDay()+6)%7;
  const prevLast=new Date(y,mo-1,0).getDate();

  // Aggregate amounts per day
  const incMap={}, expMap={};
  S.incomes.filter(i=>i.d.slice(0,7)===monthKey).forEach(i=>{ incMap[i.d]=(incMap[i.d]||0)+i.amt; });
  S.expenses.filter(e=>e.d.slice(0,7)===monthKey).forEach(e=>{ expMap[e.d]=(expMap[e.d]||0)+e.amt; });

  const todayIso=new Date().toISOString().slice(0,10);
  const selIso=S.dashDay||'';

  // Month header (Turkish)
  const monthNamesTR=['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  if(monthLbl) monthLbl.textContent=monthNamesTR[mo-1]+' '+y;

  let html='';
  // Previous month tail
  for(let i=startOffset;i>0;i--){
    html+=`<div class="cal-day other"><span class="num">${prevLast-i+1}</span><span class="dots"></span></div>`;
  }
  // Kart kesim/son ödeme günlerini map'le (renkli noktalar için)
  const cardMarks={}; // {day: [{color, type:'cut'|'due', name}]}
  (S.cards||[]).forEach(c=>{
    if(c.cutDay){ (cardMarks[c.cutDay]=cardMarks[c.cutDay]||[]).push({color:c.color||'#888',type:'cut',name:c.name||c.bank}); }
    if(c.dueDay){ (cardMarks[c.dueDay]=cardMarks[c.dueDay]||[]).push({color:c.color||'#888',type:'due',name:c.name||c.bank}); }
  });
  // Current month
  for(let d=1;d<=daysInMonth;d++){
    const iso=`${y}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const hasIn=incMap[iso]>0;
    const hasOut=expMap[iso]>0;
    const cls=['cal-day'];
    if(iso===todayIso) cls.push('today');
    if(iso===selIso) cls.push('sel');
    let dots=(hasIn?'<span class="dot d-in"></span>':'')+(hasOut?'<span class="dot d-out"></span>':'');
    const marks=cardMarks[d]||[];
    const title=marks.map(m=>`${m.name} ${m.type==='cut'?'ekstre kesim':'son ödeme'}`).join(' · ');
    const cardDots=marks.slice(0,3).map(m=>`<span class="dot card-dot-mark ${m.type==='cut'?'d-cut':'d-due'}" style="--cc:${m.color}" title="${title}"></span>`).join('');
    html+=`<div class="${cls.join(' ')}" ${title?`title="${title}"`:''} onclick="selectDay('${iso}')"><span class="num">${d}</span><span class="dots">${dots}${cardDots}</span></div>`;
  }
  // Next month head (fill to 6 rows = 42 cells)
  const totalCells=startOffset+daysInMonth;
  const trailing=(totalCells%7===0)?0:(7-(totalCells%7));
  for(let i=1;i<=trailing;i++){
    html+=`<div class="cal-day other"><span class="num">${i}</span><span class="dots"></span></div>`;
  }
  grid.innerHTML=html;
}

function selectDay(iso){
  const wasSame = S.dashDay===iso;
  S.dashDay = wasSame ? '' : iso;
  renderDash();
  // Sayfa kaydırılmaz: kullanıcı takvimi görmeye devam etsin, day-list takvimin hemen altında değişir
}

function renderDayList(){
  const list=document.getElementById('day-list');
  if(!list) return;
  const iso=S.dashDay;

  // Gün akışı artık takvim kartının içinde: gün seçili değilken panel gizli.
  const panel=document.getElementById('day-panel');
  const title=document.getElementById('day-panel-title');
  if(panel){
    if(!iso){ panel.style.display='none'; list.innerHTML=''; return; }
    panel.style.display='';
    if(title){
      const p=String(iso).split('-');
      title.textContent=(p.length===3)?`${p[2]}.${p[1]}.${p[0]}`:iso;
    }
  }

  if(!iso){
    list.innerHTML=`<div class="day-empty">Takvimde bir güne dokunun; o günün gelir ve giderleri burada görünsün.</div>`;
    return;
  }
  const dayOfMonth=parseInt(iso.slice(8));
  const cardEvents=(S.cards||[]).flatMap(c=>{
    const e=[];
    if(c.cutDay===dayOfMonth) e.push({name:c.name||c.bank,color:c.color,type:'cut'});
    if(c.dueDay===dayOfMonth) e.push({name:c.name||c.bank,color:c.color,type:'due'});
    return e;
  });
  const inc=S.incomes.filter(i=>i.d===iso);
  const exp=S.expenses.filter(e=>e.d===iso);
  const rows=[
    ...inc.map(i=>({...i,_k:'in'})),
    ...exp.map(e=>({...e,_k:'out'}))
  ].sort((a,b)=>String(b.id||'').localeCompare(String(a.id||'')));

  const [y,mo,d]=iso.split('-');
  const mNames=['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  const sumIn=inc.reduce((a,i)=>a+(+i.amt||0),0);
  const sumOut=exp.reduce((a,e)=>a+(+e.amt||0),0);
  const summary=[];
  if(inc.length) summary.push(`${inc.length} gelir (+${fmt(sumIn)} ₺)`);
  if(exp.length) summary.push(`${exp.length} gider (−${fmt(sumOut)} ₺)`);
  if(!summary.length) summary.push('kayıt yok');
  const cardEventsHtml = cardEvents.length
    ? `<div class="day-card-events">${cardEvents.map(ev=>`<div class="day-card-event"><span class="card-dot" style="background:${ev.color||'#888'}"></span><span class="day-card-event-name">${escAttr(ev.name)}</span><span class="day-card-event-type">${ev.type==='cut'?'ekstre kesim':'SON ÖDEME'}</span></div>`).join('')}</div>`
    : '';
  const head=`
    <div class="day-list-head">
      <span class="day-list-title">${parseInt(d)} ${mNames[parseInt(mo)-1]}</span>
      <span class="day-list-meta">${summary.join(' · ')}</span>
    </div>`;

  if(!rows.length){
    list.innerHTML=head+cardEventsHtml+`<div class="day-empty">Bu gün için işlem kaydı yok.</div>`;
    return;
  }

  const body=rows.map(r=>{
    const isIn=r._k==='in';
    const meta=catMeta(r.cat);
    const label=meta.label||r.cat;
    const delFn=isIn?`delInc('${r.id}')`:`delExp('${r.id}')`;
    const fAmt=isIn?incomeFiberAmt(r):0;
    const fPct=isIn?incomeFiberPct(r):null;
    const fiberNote=(isIn&&fAmt>0)?`<div class="fiber-line">FIBER: %${fmtPct(fPct||DEFAULT_FIBER_PCT)} · ${fmt(fAmt)} ₺</div>`:'';
    return `<div class="day-row list-row">
      ${monoChip(r.cat,'sm')}
      <div class="day-row-body">
        <div class="day-row-desc">${escAttr(r.desc||label)}</div>
        <div class="day-row-cat">${escAttr(label)}${r.bank?' · '+escAttr(r.bank):''}</div>
        ${fiberNote}
      </div>
      <div class="day-row-right">
        <div class="day-row-amt ${isIn?'in':'out'}">${isIn?'+':'−'}${fmt(r.amt)} ₺</div>
        <button class="fav-ic fav-ic-del" title="Sil" onclick="${delFn}">×</button>
      </div>
    </div>`;
  }).join('');

  list.innerHTML=head+cardEventsHtml+body;
}

function navDashMonth(delta){
  const cur=S.dashM!==null?S.dashM:CUR_IDX;
  const next=cur+delta;
  if(next<0||next>=MN.length) return;
  S.dashM=next;
  S.dashDay='';
  renderDash();
}

// ══════════════════════════════════════════════════════════════
// THEME PICKER
// ══════════════════════════════════════════════════════════════
function setTheme(name){
  // Papyrus yeni eklendi; LEGACY_THEME_MAP'e dokunmuyoruz, valid listede direkt yer alıyor
  if(name!=='papyrus') name=LEGACY_THEME_MAP[name]||name;
  const valid=['cream','onyx','marble','midnight','papyrus'];
  if(!valid.includes(name)) name='cream';
  document.documentElement.setAttribute('data-theme',name);
  try{ localStorage.setItem('ay_theme',name); }catch(_){}
  const bg=getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
  const meta=document.getElementById('meta-theme');
  if(meta) meta.setAttribute('content', bg);
  renderThemeSelection();
  if(typeof renderDash==='function') renderDash();
}
function openThemePicker(){
  go('more',document.getElementById('nb-more'));
}
function closeThemePicker(ev){
  return;
}
function loadTheme(){
  let t='cream';
  try{ t=localStorage.getItem('ay_theme')||'cream'; }catch(_){}
  if(t!=='papyrus') t=LEGACY_THEME_MAP[t]||'cream';
  const valid=['cream','onyx','marble','midnight','papyrus'];
  if(!valid.includes(t)) t='cream';
  document.documentElement.setAttribute('data-theme',t);
  const bg=getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
  const meta=document.getElementById('meta-theme');
  if(meta) meta.setAttribute('content', bg);
}

// ══════════════════════════════════════════════════════════════
// QUICK ENTRY
// ══════════════════════════════════════════════════════════════
function buildCatGrid(){
  document.getElementById('cat-grid').innerHTML=getVisibleCats().map(c=>`
    <div class="cat-tile ${c.id===S.selCat?'on':''}" onclick="selCat('${c.id}')"
      style="${c.id===S.selCat?`border-color:var(--ink);box-shadow:0 0 0 2px var(--accent-ring);`:''}">
      ${monoChip(c.id)}
      <div class="cat-tile-label">${catMeta(c.id).label}</div>
    </div>`).join('');
  renderChoiceChips('q-bank-chips',[
    {value:'Havale',label:'Havale'},{value:'Nakit',label:'Nakit'},{value:'İşbank',label:'İşbank'},{value:'Enpara',label:'Enpara'},{value:'VakıfBank',label:'VakıfBank'}
  ], document.getElementById('q-bank').value, "pickQuickBank('__VAL__')");
}
function selCat(id){S.selCat=id;buildCatGrid();}

function escAttr(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

function buildFavList(){
  const list=document.getElementById('fav-list');
  if(!list) return;
  if(!S.favs || !S.favs.length){
    list.innerHTML=`<div class="fav-empty">Henüz kayıt yok. <button type="button" class="linky" onclick="openFavForm()">+ Yeni ekle</button></div>`;
    return;
  }
  list.innerHTML=S.favs.map(f=>`
    <div class="fav-item">
      <div class="fav-info">
        <div class="fav-name">${escAttr(f.label)}</div>
        <div class="fav-detail">${escAttr(f.desc)} · ${fmt(f.amt)} ₺ · ${escAttr(f.bank)}</div>
      </div>
      <div class="fav-actions">
        <button class="fav-btn" onclick="favAdd('${escAttr(f.id)}')">Ekle</button>
        <button class="fav-ic" title="Düzenle" onclick="openFavForm('${escAttr(f.id)}')">✎</button>
        <button class="fav-ic fav-ic-del" title="Sil" onclick="delFav('${escAttr(f.id)}')">×</button>
      </div>
    </div>`).join('');
}

function favAdd(id){
  const f=S.favs.find(x=>x.id===id);
  if(!f){toast('Kayıt bulunamadı',true);return;}
  const newFav = {id:genId(),d:new Date().toISOString().slice(0,10),desc:f.desc,cat:f.cat,amt:f.amt,bank:f.bank};
  S.userExp.push(newFav);
  S.expenses.push(newFav);
  save();toast(`✓ ${f.label} — ${fmt(f.amt)} ₺`);
  renderTxn();renderDash();
}

function openFavForm(id){
  const editing = id ? S.favs.find(x=>x.id===id) : null;
  const cur = editing ? {...editing} : {id:'',label:'',desc:'',amt:'',cat:'diger',bank:'Havale'};
  const catOpts = getVisibleCats().map(c=>`<option value="${c.id}" ${cur.cat===c.id?'selected':''}>${(c.icon||'•')} ${c.label}</option>`).join('');
  const bankOpts = ['Havale','Nakit','İşbank','Enpara','VakıfBank'].map(b=>`<option value="${b}" ${cur.bank===b?'selected':''}>${b}</option>`).join('');
  const html = `
    <div class="fav-modal-overlay" id="fav-modal" onclick="if(event.target===this)closeFavForm()">
      <div class="fav-modal">
        <div class="fav-modal-head">
          <h3>${editing?'Sık Havaleyi Düzenle':'Yeni Sık Havale'}</h3>
          <button class="fav-modal-close" onclick="closeFavForm()" aria-label="Kapat">×</button>
        </div>
        <input type="hidden" id="fv-id" value="${escAttr(cur.id)}">
        <div class="qfield"><label>İsim / Etiket</label><input class="input" id="fv-label" type="text" placeholder="örn: İbrahim Yaman" value="${escAttr(cur.label)}"></div>
        <div class="qfield"><label>Açıklama</label><input class="input" id="fv-desc" type="text" placeholder="Harcamaya yazılacak açıklama" value="${escAttr(cur.desc)}"></div>
        <div class="q-grid-two">
          <div class="qfield"><label>Tutar (₺)</label><input class="input" id="fv-amt" type="number" inputmode="decimal" placeholder="0" value="${cur.amt===''?'':cur.amt}"></div>
          <div class="qfield"><label>Kaynak</label><select class="input" id="fv-bank">${bankOpts}</select></div>
        </div>
        <div class="qfield"><label>Kategori</label><select class="input" id="fv-cat">${catOpts}</select></div>
        <div class="fav-modal-actions">
          ${editing?`<button class="btn btn-danger" onclick="delFav('${escAttr(cur.id)}',true)">Sil</button>`:''}
          <button class="btn btn-secondary" onclick="closeFavForm()">Vazgeç</button>
          <button class="btn btn-primary" onclick="saveFavForm()">${editing?'Güncelle':'Ekle'}</button>
        </div>
      </div>
    </div>`;
  const host=document.createElement('div');
  host.innerHTML=html;
  document.body.appendChild(host.firstElementChild);
  setTimeout(()=>{const l=document.getElementById('fv-label');if(l)l.focus();},50);
}

function closeFavForm(){
  const m=document.getElementById('fav-modal');
  if(m) m.remove();
}

function saveFavForm(){
  const id=(document.getElementById('fv-id').value||'').trim();
  const label=(document.getElementById('fv-label').value||'').trim();
  const desc=(document.getElementById('fv-desc').value||'').trim();
  const amt=parseTrNum(document.getElementById('fv-amt').value);
  const cat=document.getElementById('fv-cat').value;
  const bank=document.getElementById('fv-bank').value;
  if(!label){toast('İsim girin',true);return;}
  if(!desc){toast('Açıklama girin',true);return;}
  if(!amt||amt<=0){toast('Geçerli tutar girin',true);return;}
  if(id){
    const idx=S.favs.findIndex(x=>x.id===id);
    if(idx>=0){
      S.favs[idx]={...S.favs[idx],label,desc,amt,cat,bank};
      toast('✓ Güncellendi');
    }
  }else{
    S.favs.push({id:genId(),label,desc,amt,cat,bank});
    toast('✓ Eklendi');
  }
  save();
  closeFavForm();
  buildFavList();
}

function delFav(id,fromModal){
  const f=S.favs.find(x=>x.id===id);
  if(!f) return;
  if(!confirm(`"${f.label}" sık havalesini silmek istiyor musunuz?\n(Bu kayıtlı harcamaları silmez — yalnızca kısayolu kaldırır.)`)) return;
  S.favs=S.favs.filter(x=>x.id!==id);
  save();
  if(fromModal) closeFavForm();
  buildFavList();
  toast('Silindi');
}

// ══════════════════════════════════════════════════════════════
// KATEGORİ CRUD (sadece custom kategoriler; default'lar kilitli)
// ══════════════════════════════════════════════════════════════
const CAT_EMOJIS=['📌','🏷️','🎯','💼','🧾','🛍️','🏦','🎁','🧘','🚗','🐾','🌿','🍿','💊','🧰','☕','💧','🔧','📷','🎮'];
const CAT_COLORS=['#6B63E8','#3EC98A','#E8A83E','#8B6EE8','#4CAF68','#E8603E','#3EC9C4','#E86E8B','#5B8DE8','#9B9B9B','#E05656','#8BC449','#E84848','#5b8aa6','#a85b7d'];
function slugifyId(s){
  return 'c_'+String(s||'').toLocaleLowerCase('tr-TR')
    .replace(/ı/g,'i').replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s').replace(/ö/g,'o').replace(/ç/g,'c')
    .replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'').slice(0,20) || ('cat_'+Date.now().toString(36).slice(-4));
}
function isDefaultCat(id){ return CATS.some(c=>c.id===id); }
function renderCatManager(){
  const el=document.getElementById('cat-manager');
  if(!el) return;
  const defaultHtml=CATS.map(c=>`
    <div class="cat-row locked">
      <div class="cat-row-main">${monoChip(c.id,'sm')}<span class="cat-row-label">${c.icon||''} ${c.label}</span></div>
      <span class="cat-row-lock" title="Varsayılan kategori">🔒</span>
    </div>`).join('');
  const customHtml=(S.customCats||[]).map(c=>`
    <div class="cat-row">
      <div class="cat-row-main">${monoChip(c.id,'sm')}<span class="cat-row-label">${escAttr(c.icon||'•')} ${escAttr(c.label)}</span></div>
      <div class="fav-actions">
        <button class="fav-ic" title="Düzenle" onclick="openCatForm('${escAttr(c.id)}')">✎</button>
        <button class="fav-ic fav-ic-del" title="Sil" onclick="delCat('${escAttr(c.id)}')">×</button>
      </div>
    </div>`).join('');
  el.innerHTML = `<div class="cat-section-title">Sizin kategorileriniz</div>${customHtml||'<div class="fav-empty">Henüz özel kategori yok. <button type="button" class="linky" onclick="openCatForm()">+ Yeni ekle</button></div>'}<div class="cat-section-title">Varsayılanlar</div>${defaultHtml}`;
}
function openCatForm(id){
  const editing=id?(S.customCats||[]).find(x=>x.id===id):null;
  const cur=editing?{...editing}:{id:'',label:'',icon:CAT_EMOJIS[0],color:CAT_COLORS[0]};
  const emojiRow=CAT_EMOJIS.map(e=>`<button type="button" class="emoji-pick ${cur.icon===e?'on':''}" onclick="pickCatEmoji('${e}')">${e}</button>`).join('');
  const colorRow=CAT_COLORS.map(c=>`<button type="button" class="color-pick ${cur.color===c?'on':''}" style="background:${c}" onclick="pickCatColor('${c}')" aria-label="${c}"></button>`).join('');
  const html=`
    <div class="fav-modal-overlay" id="cat-modal" onclick="if(event.target===this)closeCatForm()">
      <div class="fav-modal">
        <div class="fav-modal-head">
          <h3>${editing?'Kategoriyi Düzenle':'Yeni Kategori'}</h3>
          <button class="fav-modal-close" onclick="closeCatForm()" aria-label="Kapat">×</button>
        </div>
        <input type="hidden" id="cf-id" value="${escAttr(cur.id)}">
        <input type="hidden" id="cf-icon" value="${escAttr(cur.icon)}">
        <input type="hidden" id="cf-color" value="${escAttr(cur.color)}">
        <div class="qfield"><label>Ad</label><input class="input" id="cf-label" type="text" placeholder="örn: Evcil Hayvan" value="${escAttr(cur.label)}"></div>
        <div class="qfield"><label>Emoji</label><div class="emoji-row">${emojiRow}</div></div>
        <div class="qfield"><label>Renk</label><div class="color-row">${colorRow}</div></div>
        <div class="fav-modal-actions">
          ${editing?`<button class="btn btn-danger" onclick="delCat('${escAttr(cur.id)}',true)">Sil</button>`:''}
          <button class="btn btn-secondary" onclick="closeCatForm()">Vazgeç</button>
          <button class="btn btn-primary" onclick="saveCatForm()">${editing?'Güncelle':'Ekle'}</button>
        </div>
      </div>
    </div>`;
  const host=document.createElement('div'); host.innerHTML=html; document.body.appendChild(host.firstElementChild);
  setTimeout(()=>{const l=document.getElementById('cf-label');if(l)l.focus();},50);
}
function pickCatEmoji(e){ const i=document.getElementById('cf-icon'); if(i) i.value=e; document.querySelectorAll('.emoji-pick').forEach(b=>b.classList.toggle('on',b.textContent===e)); }
function pickCatColor(c){ const i=document.getElementById('cf-color'); if(i) i.value=c; document.querySelectorAll('.color-pick').forEach(b=>b.classList.toggle('on',b.getAttribute('aria-label')===c)); }
function closeCatForm(){ const m=document.getElementById('cat-modal'); if(m) m.remove(); }
function saveCatForm(){
  const id=(document.getElementById('cf-id').value||'').trim();
  const label=(document.getElementById('cf-label').value||'').trim();
  const icon=(document.getElementById('cf-icon').value||'📌').trim();
  const color=(document.getElementById('cf-color').value||'#888').trim();
  if(!label){toast('Ad girin',true);return;}
  if(id){
    const idx=(S.customCats||[]).findIndex(x=>x.id===id);
    if(idx>=0){ S.customCats[idx]={...S.customCats[idx],label,icon,color}; toast('✓ Kategori güncellendi'); }
  }else{
    let newId=slugifyId(label);
    let n=1; while(getCats().some(c=>c.id===newId)){ newId=slugifyId(label)+'_'+(++n); }
    S.customCats=S.customCats||[];
    S.customCats.push({id:newId,label,icon,color});
    toast('✓ Kategori eklendi');
  }
  save(); closeCatForm(); renderBudget(); buildCatGrid&&buildCatGrid();
}
function delCat(id,fromModal){
  if(id==='diger'){ toast('"Diğer" kategorisi silinemez',true); return; }
  const isDef=isDefaultCat(id);
  const label=catMeta(id).label;
  if(!isDef && !(S.customCats||[]).some(x=>x.id===id)) return; // bilinmeyen id
  const linked=S.expenses.filter(e=>e.cat===id).length;
  const msg=linked>0
    ? `"${label}" kategorisi silinecek. ${linked} kayıt "Diğer" kategorisine taşınacak (kayıtlar silinmez). Devam?`
    : `"${label}" kategorisini silmek istiyor musunuz? (Geçmiş kayıtlar korunur.)`;
  if(!confirm(msg)) return;
  if(linked>0){
    // Kayıtlar SİLİNMEZ — yalnızca kategori etiketi 'diger' olur (kullanıcının seçtiği davranış).
    S.userExp=S.userExp.map(e=>e.cat===id?{...e,cat:'diger'}:e);
    S.expenses=S.expenses.map(e=>e.cat===id?{...e,cat:'diger'}:e);
  }
  if(isDef){
    // Varsayılan kategori gizlenir; bütçe limiti KORUNUR (geri getirince geri dönsün).
    // catSum deletedDefaults'u dışladığı için gizliyken aylık toplam limite eklenmez.
    S.deletedDefaults=[...new Set([...(S.deletedDefaults||[]), id])];
  } else {
    // Özel kategori tamamen kalkar → yetim bütçe anahtarı kalmasın diye silinir.
    S.customCats=(S.customCats||[]).filter(x=>x.id!==id);
    if(id in S.budgets) delete S.budgets[id];
  }
  if(S.selCat===id){ const v=getVisibleCats().filter(c=>c.id!=='uyap'); S.selCat=(v[0]||{id:'diger'}).id; }
  save();
  if(fromModal) closeCatForm();
  renderBudget(); renderTxn&&renderTxn(); renderDash&&renderDash(); buildCatGrid&&buildCatGrid();
  toast(linked>0?`Silindi · ${linked} kayıt Diğer'e taşındı`:'Silindi');
}
// Silinen (gizlenen) varsayılan kategoriyi geri getirir. Geçmişte 'diger'e taşınan kayıtlar 'diger'de kalır.
function restoreCat(id){
  S.deletedDefaults=(S.deletedDefaults||[]).filter(x=>x!==id);
  if(isDefaultCat(id) && !(id in S.budgets)) S.budgets[id]=DEF_BUD[id]||0;
  save();
  renderBudget(); buildCatGrid&&buildCatGrid(); renderDash&&renderDash();
  toast('Kategori geri getirildi');
}

// ══════════════════════════════════════════════════════════════
// BÜTÇE CRUD (satır sıfırla + varsayılanlara dön)
// ══════════════════════════════════════════════════════════════
function clearBudgetRow(id){
  if(!confirm(`"${catMeta(id).label}" bütçesini sıfırlamak istiyor musunuz?\n(Limit 0 olur; kategoriye bağlı harcamalar kalır.)`)) return;
  S.budgets[id]=0;
  save(); renderBudget();
  toast('Bütçe sıfırlandı');
}
function resetBudgetsToDefault(){
  if(!confirm('Tüm bütçe limitleri varsayılan değerlere dönecek. Devam?')) return;
  S.budgets={...DEF_BUD};
  save(); renderBudget();
  toast('Bütçeler varsayılana döndü');
}

// ══════════════════════════════════════════════════════════════
// ABONELİK CRUD + KEŞİF
// ══════════════════════════════════════════════════════════════
function renderSubs(){
  const el=document.getElementById('sub-list');
  if(!el) return;
  const subs=S.subs||[];
  if(!subs.length){
    el.innerHTML=`<div class="fav-empty">Henüz abonelik kaydı yok. <button type="button" class="linky" onclick="openSubForm()">+ Yeni ekle</button></div>`;
    return;
  }
  const active=subs.filter(s=>s.active!==false);
  const activeTotal=active.reduce((a,s)=>a+(+s.amt||0),0);
  el.innerHTML = subs.map(s=>{
    const pending=s.source==='auto'&&s.pending;
    return `
      <div class="sub-row ${s.active===false?'off':''} ${pending?'pending':''}">
        <div class="sub-main">${monoChip(s.cat||'dijital','sm')}<div class="sub-info"><div class="sub-name">${escAttr(s.name||'—')} ${pending?'<span class="sub-pending">Onayla</span>':''}</div><div class="sub-meta">${fmt(+s.amt||0)} ₺ · ayın ${s.dayOfMonth||'—'}'i · ${escAttr(s.bank||'—')}</div></div></div>
        <div class="fav-actions">
          ${pending?`<button class="fav-btn" onclick="confirmSub('${s.id}')">Onayla</button>`:`<button class="fav-ic" title="${s.active===false?'Etkinleştir':'Devre dışı'}" onclick="toggleSub('${s.id}')">${s.active===false?'○':'●'}</button>`}
          <button class="fav-ic" title="Düzenle" onclick="openSubForm('${s.id}')">✎</button>
          <button class="fav-ic fav-ic-del" title="Sil" onclick="delSub('${s.id}')">×</button>
        </div>
      </div>`;
  }).join('') + `<div class="sub-total">Aylık aktif toplam: <strong>${fmt(activeTotal)} ₺</strong></div>`;
}
function openSubForm(id){
  const editing=id?(S.subs||[]).find(x=>x.id===id):null;
  const cur=editing?{...editing}:{id:'',name:'',amt:'',cat:'dijital',bank:'Enpara',dayOfMonth:1,active:true,source:'manual'};
  const catOpts=getVisibleCats().map(c=>`<option value="${c.id}" ${cur.cat===c.id?'selected':''}>${c.icon||'•'} ${c.label}</option>`).join('');
  const bankOpts=['Havale','Nakit','İşbank','Enpara','VakıfBank'].map(b=>`<option value="${b}" ${cur.bank===b?'selected':''}>${b}</option>`).join('');
  const html=`
    <div class="fav-modal-overlay" id="sub-modal" onclick="if(event.target===this)closeSubForm()">
      <div class="fav-modal">
        <div class="fav-modal-head">
          <h3>${editing?'Aboneliği Düzenle':'Yeni Abonelik'}</h3>
          <button class="fav-modal-close" onclick="closeSubForm()" aria-label="Kapat">×</button>
        </div>
        <input type="hidden" id="sf-id" value="${escAttr(cur.id)}">
        <div class="qfield"><label>Ad</label><input class="input" id="sf-name" type="text" placeholder="örn: Netflix" value="${escAttr(cur.name)}"></div>
        <div class="q-grid-two">
          <div class="qfield"><label>Aylık tutar (₺)</label><input class="input" id="sf-amt" type="number" inputmode="decimal" placeholder="0" value="${cur.amt===''?'':cur.amt}"></div>
          <div class="qfield"><label>Tahsilat günü</label><input class="input" id="sf-day" type="number" min="1" max="31" value="${cur.dayOfMonth||1}"></div>
        </div>
        <div class="q-grid-two">
          <div class="qfield"><label>Kategori</label><select class="input" id="sf-cat">${catOpts}</select></div>
          <div class="qfield"><label>Banka</label><select class="input" id="sf-bank">${bankOpts}</select></div>
        </div>
        <label class="qfield-check"><input type="checkbox" id="sf-active" ${cur.active!==false?'checked':''}> Aktif</label>
        <div class="fav-modal-actions">
          ${editing?`<button class="btn btn-danger" onclick="delSub('${escAttr(cur.id)}',true)">Sil</button>`:''}
          <button class="btn btn-secondary" onclick="closeSubForm()">Vazgeç</button>
          <button class="btn btn-primary" onclick="saveSubForm()">${editing?'Güncelle':'Ekle'}</button>
        </div>
      </div>
    </div>`;
  const host=document.createElement('div'); host.innerHTML=html; document.body.appendChild(host.firstElementChild);
  setTimeout(()=>{const l=document.getElementById('sf-name');if(l)l.focus();},50);
}
function closeSubForm(){ const m=document.getElementById('sub-modal'); if(m) m.remove(); }
function saveSubForm(){
  const id=(document.getElementById('sf-id').value||'').trim();
  const name=(document.getElementById('sf-name').value||'').trim();
  const amt=parseTrNum(document.getElementById('sf-amt').value);
  const day=Math.max(1,Math.min(31,parseInt(document.getElementById('sf-day').value)||1));
  const cat=document.getElementById('sf-cat').value;
  const bank=document.getElementById('sf-bank').value;
  const active=document.getElementById('sf-active').checked;
  if(!name){toast('Ad girin',true);return;}
  if(!amt||amt<=0){toast('Geçerli tutar girin',true);return;}
  if(id){
    const idx=(S.subs||[]).findIndex(x=>x.id===id);
    if(idx>=0) S.subs[idx]={...S.subs[idx],name,amt,cat,bank,dayOfMonth:day,active,pending:false};
    toast('✓ Güncellendi');
  }else{
    S.subs=S.subs||[];
    S.subs.push({id:genId(),name,amt,cat,bank,dayOfMonth:day,active,source:'manual',pending:false,firstSeen:new Date().toISOString().slice(0,10)});
    toast('✓ Abonelik eklendi');
  }
  save(); closeSubForm(); renderSubs();
}
function delSub(id,fromModal){
  const s=(S.subs||[]).find(x=>x.id===id);
  if(!s) return;
  if(!confirm(`"${s.name}" aboneliğini silmek istiyor musunuz?`)) return;
  S.subs=(S.subs||[]).filter(x=>x.id!==id);
  save();
  if(fromModal) closeSubForm();
  renderSubs();
  toast('Silindi');
}
function toggleSub(id){
  const s=(S.subs||[]).find(x=>x.id===id);
  if(!s) return;
  s.active=!(s.active!==false);
  save(); renderSubs();
}
function confirmSub(id){
  const s=(S.subs||[]).find(x=>x.id===id);
  if(!s) return;
  s.pending=false; s.active=true;
  save(); renderSubs();
  toast('Onaylandı');
}

// ══════════════════════════════════════════════════════════════
// KREDİ KARTI TAKVİMİ (ekstre kesim + son ödeme)
// ══════════════════════════════════════════════════════════════
const CARD_COLORS=['#5B8DE8','#3EC98A','#8B6EE8','#E8A83E','#E86E8B','#E05656','#3EC9C4','#8BC449','#c97d4a'];
function renderCards(){
  const el=document.getElementById('card-list');
  if(!el) return;
  const cards=S.cards||[];
  if(!cards.length){
    el.innerHTML=`<div class="fav-empty">Kart tanımlanmamış. <button type="button" class="linky" onclick="openCardForm()">+ Yeni ekle</button></div>`;
    return;
  }
  el.innerHTML=cards.map(c=>`
    <div class="card-row">
      <div class="card-row-main">
        <span class="card-dot" style="background:${escAttr(c.color||'#888')}"></span>
        <div class="card-info">
          <div class="card-name">${escAttr(c.name||c.bank||'Kart')}</div>
          <div class="card-meta">Kesim: ayın ${c.cutDay||'—'}'i · Son ödeme: ayın ${c.dueDay||'—'}'i</div>
        </div>
      </div>
      <div class="fav-actions">
        <button class="fav-ic" title="Düzenle" onclick="openCardForm('${escAttr(c.id)}')">✎</button>
        <button class="fav-ic fav-ic-del" title="Sil" onclick="delCard('${escAttr(c.id)}')">×</button>
      </div>
    </div>`).join('');
}
function openCardForm(id){
  const editing=id?(S.cards||[]).find(x=>x.id===id):null;
  const usedColors=new Set((S.cards||[]).map(c=>c.color));
  const freshColor=CARD_COLORS.find(c=>!usedColors.has(c))||CARD_COLORS[0];
  const cur=editing?{...editing}:{id:'',name:'',bank:'İşbank',cutDay:1,dueDay:14,color:freshColor};
  const bankOpts=['İşbank','VakıfBank','Enpara','Garanti','Akbank','Yapı Kredi','QNB','Denizbank','TEB','Ziraat','Halkbank','Diğer'].map(b=>`<option value="${b}" ${cur.bank===b?'selected':''}>${b}</option>`).join('');
  const colorRow=CARD_COLORS.map(c=>`<button type="button" class="color-pick ${cur.color===c?'on':''}" style="background:${c}" onclick="pickCardColor('${c}')" aria-label="${c}"></button>`).join('');
  const html=`
    <div class="fav-modal-overlay" id="card-modal" onclick="if(event.target===this)closeCardForm()">
      <div class="fav-modal">
        <div class="fav-modal-head">
          <h3>${editing?'Kartı Düzenle':'Yeni Kredi Kartı'}</h3>
          <button class="fav-modal-close" onclick="closeCardForm()" aria-label="Kapat">×</button>
        </div>
        <input type="hidden" id="kf-id" value="${escAttr(cur.id)}">
        <input type="hidden" id="kf-color" value="${escAttr(cur.color)}">
        <div class="qfield"><label>Ad</label><input class="input" id="kf-name" type="text" placeholder="örn: İşbank Maximum" value="${escAttr(cur.name)}"></div>
        <div class="qfield"><label>Banka</label><select class="input" id="kf-bank">${bankOpts}</select></div>
        <div class="q-grid-two">
          <div class="qfield"><label>Ekstre kesim günü</label><input class="input" id="kf-cut" type="number" min="1" max="31" value="${cur.cutDay||1}"></div>
          <div class="qfield"><label>Son ödeme günü</label><input class="input" id="kf-due" type="number" min="1" max="31" value="${cur.dueDay||14}"></div>
        </div>
        <div class="qfield"><label>Takvim rengi</label><div class="color-row">${colorRow}</div></div>
        <div class="fav-modal-actions">
          ${editing?`<button class="btn btn-danger" onclick="delCard('${escAttr(cur.id)}',true)">Sil</button>`:''}
          <button class="btn btn-secondary" onclick="closeCardForm()">Vazgeç</button>
          <button class="btn btn-primary" onclick="saveCardForm()">${editing?'Güncelle':'Ekle'}</button>
        </div>
      </div>
    </div>`;
  const host=document.createElement('div'); host.innerHTML=html; document.body.appendChild(host.firstElementChild);
  setTimeout(()=>{const l=document.getElementById('kf-name');if(l)l.focus();},50);
}
function pickCardColor(c){ const i=document.getElementById('kf-color'); if(i) i.value=c; document.querySelectorAll('#card-modal .color-pick').forEach(b=>b.classList.toggle('on',b.getAttribute('aria-label')===c)); }
function closeCardForm(){ const m=document.getElementById('card-modal'); if(m) m.remove(); }
function saveCardForm(){
  const id=(document.getElementById('kf-id').value||'').trim();
  const name=(document.getElementById('kf-name').value||'').trim();
  const bank=document.getElementById('kf-bank').value;
  const cutDay=Math.max(1,Math.min(31,parseInt(document.getElementById('kf-cut').value)||1));
  const dueDay=Math.max(1,Math.min(31,parseInt(document.getElementById('kf-due').value)||14));
  const color=(document.getElementById('kf-color').value||'#888').trim();
  if(!name){toast('Ad girin',true);return;}
  if(id){
    const idx=(S.cards||[]).findIndex(x=>x.id===id);
    if(idx>=0) S.cards[idx]={...S.cards[idx],name,bank,cutDay,dueDay,color};
    toast('✓ Güncellendi');
  } else {
    S.cards=S.cards||[];
    S.cards.push({id:genId(),name,bank,cutDay,dueDay,color});
    toast('✓ Kart eklendi');
  }
  save(); closeCardForm(); renderCards(); renderDash&&renderDash();
}
function delCard(id,fromModal){
  const c=(S.cards||[]).find(x=>x.id===id);
  if(!c) return;
  if(!confirm(`"${c.name||c.bank}" kartını silmek istiyor musunuz?`)) return;
  S.cards=(S.cards||[]).filter(x=>x.id!==id);
  save();
  if(fromModal) closeCardForm();
  renderCards(); renderDash&&renderDash();
  toast('Silindi');
}

function normalizeDesc(d){
  return String(d||'').toLocaleLowerCase('tr-TR')
    .replace(/[0-9]+/g,' ')
    .replace(/[^a-zçğıöşü ]+/g,' ')
    .replace(/\s+/g,' ').trim();
}
function detectSubscriptions(){
  // Son 3 ayda tekrarlanan (benzer isim + benzer tutar) harcamaları abonelik adayı olarak işaretle
  const since=new Date(); since.setMonth(since.getMonth()-3);
  const sinceStr=since.toISOString().slice(0,10);
  const groups={};
  S.expenses.filter(e=>e.d>=sinceStr).forEach(e=>{
    const key=normalizeDesc(e.desc).slice(0,24);
    if(!key) return;
    (groups[key]=groups[key]||[]).push(e);
  });
  const added=[];
  Object.keys(groups).forEach(key=>{
    const rows=groups[key];
    const months=new Set(rows.map(r=>(r.d||'').slice(0,7)));
    if(months.size<2) return; // en az 2 farklı ayda görünmeli
    const amts=rows.map(r=>+r.amt||0);
    const avg=amts.reduce((a,b)=>a+b,0)/amts.length;
    const maxDev=Math.max(...amts.map(a=>Math.abs(a-avg)/Math.max(1,avg)));
    if(maxDev>0.25) return; // %25'ten fazla sapma → abonelik değil
    // Daha önce eklenmiş mi?
    const exists=(S.subs||[]).some(s=>normalizeDesc(s.name).slice(0,24)===key);
    if(exists) return;
    const sample=rows[rows.length-1];
    const day=+((sample.d||'').slice(8))||1;
    S.subs=S.subs||[];
    S.subs.push({
      id:genId(),
      name:sample.desc,
      amt:Math.round(avg),
      cat:sample.cat||'dijital',
      bank:sample.bank||'Enpara',
      dayOfMonth:day,
      active:true,
      source:'auto',
      pending:true,
      firstSeen:rows[0].d,
      lastSeen:sample.d
    });
    added.push(sample.desc);
  });
  if(added.length){
    save();
    toast(`${added.length} abonelik adayı bulundu`);
  }
  return added.length;
}

function quickAdd(){
  const amt=parseTrNum(document.getElementById('q-amt').value);
  const d=document.getElementById('q-date').value;
  const desc=document.getElementById('q-desc').value.trim();
  const bank=document.getElementById('q-bank').value;
  if(!amt){toast('Tutar girin',true);return;}
  if(!d){toast('Tarih seçin',true);return;}
  if(!desc){toast('Açıklama girin',true);return;}
  const newExp = {id:genId(),d,desc,cat:S.selCat,amt,bank};
  S.userExp.push(newExp);
  S.expenses.push(newExp);
  save();
  toast(`✓ ${desc} — ${fmt(amt)} ₺ eklendi`);
  document.getElementById('q-amt').value='';
  document.getElementById('q-desc').value='';
  renderTxn();renderDash();
}

// Legacy — quick-recents kartı kaldırıldı, renderTxn artık işlemleri gösteriyor
function renderQuickRecents(){
  const el=document.getElementById('quick-recents');
  if(!el) return;
  const recent=[...S.expenses].sort((a,b)=>b.id.localeCompare(a.id)).slice(0,8);
  el.innerHTML=recent.length?recent.map(t=>{
    const c=catMeta(t.cat);
    return`<div class="tx-entry list-row">${monoChip(t.cat,'sm')}<div class="tx-info"><div class="tx-desc">${escAttr(t.desc)}</div><div class="tx-meta">${escAttr(t.d)} · ${escAttr(t.bank)}</div></div><div class="tx-right"><div class="tx-amt row-amt neg">${fmt(t.amt)} ₺</div><button onclick="delExp('${t.id}')" class="row-del" style="margin-top:3px">sil</button></div></div>`;
  }).join(''):`<div style="text-align:center;padding:16px;color:var(--text3);font-size:12px">Henüz giriş yok</div>`;
}

function delExp(id){
  const t=(S.expenses||[]).find(e=>e.id===id);
  if(!confirm(`Bu gider kaydı silinsin mi?${t?`\n${t.desc||''} · ${fmt(t.amt)} ₺ · ${t.d||''}`:''}`)) return;
  S.userExp=S.userExp.filter(e=>e.id!==id);
  S.expenses=S.expenses.filter(e=>e.id!==id);
  save();renderTxn();renderDash();
}

// ══════════════════════════════════════════════════════════════
// INCOME
// ══════════════════════════════════════════════════════════════
function renderIncome(){
  const mf=document.getElementById('inc-mf');
  // Ay chips ters sıra: current ay solda, geriye doğru
  const reversedMN=MN.map((m,i)=>({m,i})).reverse();
  mf.innerHTML=`<button class="f-chip ${S.incM===null?'on':''}" onclick="setIM(null)">Tümü</button>`+reversedMN.map(({m,i})=>`<button class="f-chip ${S.incM===i?'on':''}" onclick="setIM(${i})">${m}</button>`).join('');
  let incs=[...S.incomes];
  if(S.incM!==null) incs=incs.filter(i=>mIdx(i.d)===S.incM);
  incs.sort((a,b)=>b.d.localeCompare(a.d));
  const tot=incs.reduce((a,i)=>a+i.amt,0);
  const fiberTotal=incs.reduce((a,i)=>a+incomeFiberAmt(i),0);
  const fiberRate=tot>0?(fiberTotal/tot*100):0;
  document.getElementById('inc-total').textContent=fmt(tot)+' ₺';
  const period=document.getElementById('income-period-label');
  if(period) period.textContent=`Gelirler · ${S.incM===null?'Tümü':MN[S.incM]}`;
  const fiberSummary=document.getElementById('fiber-summary');
  if(fiberSummary){
    fiberSummary.innerHTML=`
      <div class="fiber-summary-grid">
        <div class="fiber-summary-stat"><div class="lbl">Gelir</div><div class="val">${tot>0?fmt(tot)+' ₺':'—'}</div></div>
        <div class="fiber-summary-stat primary"><div class="lbl">FIBER</div><div class="val">${fiberTotal>0?fmt(fiberTotal)+' ₺':'—'}</div></div>
        <div class="fiber-summary-stat"><div class="lbl">Oran</div><div class="val">${fiberTotal>0?'%'+fmtPct(fiberRate):'min %10'}</div></div>
      </div>
      <div class="field-note" style="margin-top:8px">Seçili dönemde gelirlerden önce kendine ayrılan FIBER toplamı.</div>`;
  }
  const catGrid=document.getElementById('income-cat-grid');
  if(catGrid){
    catGrid.innerHTML=ICATS.map(c=>`<div class="income-cat ${document.getElementById('gi-cat').value===c.id?'on':''}" onclick="setSelectValue('gi-cat','${c.id}');renderIncome();">${monoChip(c.id,'sm')}<span class="income-cat-label">${catMeta(c.id).label}</span></div>`).join('');
  }
  renderChoiceChips('gi-bank-chips',[
    {value:'Enpara',label:'Enpara'},{value:'İşbank',label:'İşbank'},{value:'VakıfBank',label:'VakıfBank'},{value:'Nakit',label:'Nakit'},{value:'Havale',label:'Havale'}
  ], document.getElementById('gi-bank').value, "pickIncomeBank('__VAL__')");
  document.getElementById('inc-list').innerHTML=incs.length?incs.map(i=>{
    const c=catMeta(i.cat);
    const fAmt=incomeFiberAmt(i);
    const fPct=incomeFiberPct(i);
    const fLine=fAmt>0
      ? `<div class="fiber-line">FIBER: %${fmtPct(fPct||DEFAULT_FIBER_PCT)} · ${fmt(fAmt)} ₺</div>`
      : `<div class="fiber-line muted">FIBER: eski kayıtta takip yok</div>`;
    return`<div class="income-entry income-row">
      ${monoChip(i.cat,'sm')}
      <div class="income-info"><div class="income-desc">${escAttr(i.desc)}</div><div class="income-meta">${escAttr(i.d)} · ${escAttr(i.bank)} · <span style="color:${escAttr(c.color)}">${escAttr(c.label)}</span></div>${fLine}</div>
      <div style="text-align:right">
        <div class="income-amt row-amt pos">+${fmt(i.amt)} ₺</div>
        <button onclick="delInc('${i.id}')" class="row-del" style="margin-top:3px">sil</button>
      </div>
    </div>`;
  }).join(''):`<div style="text-align:center;padding:20px;color:var(--text3);font-size:12px">Henüz gelir kaydı yok</div>`;
  updateFiberPreview();
}
function setIM(m){S.incM=m;renderIncome();}
function addIncome(){
  const d=document.getElementById('gi-date').value,amt=parseTrNum(document.getElementById('gi-amt').value),desc=document.getElementById('gi-desc').value.trim(),cat=document.getElementById('gi-cat').value,bank=document.getElementById('gi-bank').value;
  if(!d||!amt||!desc){toast('Tüm alanları doldurun',true);return;}
  const pct=cleanPct(document.getElementById('gi-fiber-pct')?.value);
  const fiberAmt=calcFiberAmt(amt,pct);
  const pctEl=document.getElementById('gi-fiber-pct');
  if(pctEl) pctEl.value=pct;
  S.incomes.push({id:genId(),d,desc,amt,cat,bank,fiberPct:pct,fiberAmt});
  save();toast(`✓ +${fmt(amt)} ₺ gelir · FIBER ${fmt(fiberAmt)} ₺`);
  document.getElementById('gi-date').value='';document.getElementById('gi-amt').value='';document.getElementById('gi-desc').value='';
  if(pctEl) pctEl.value=DEFAULT_FIBER_PCT;
  updateFiberPreview();
  renderIncome();renderDash();
}
function delInc(id){
  const x=(S.incomes||[]).find(i=>i.id===id);
  if(!confirm(`Bu gelir kaydı silinsin mi?${x?`\n${x.desc||''} · ${fmt(x.amt)} ₺ · ${x.d||''}`:''}`)) return;
  S.incomes=S.incomes.filter(i=>i.id!==id);save();renderIncome();renderDash();
}

// ══════════════════════════════════════════════════════════════
// BUDGET
// ══════════════════════════════════════════════════════════════
function renderBudget(){
  // Seçili ay (varsayılan: içinde bulunulan ay)
  const m = (S.budM!=null && S.budM>=0 && S.budM<MN.length) ? S.budM : CUR_IDX;
  const monthLabel = MN[m];
  const isCurrent = (m===CUR_IDX);
  const spentLabel = isCurrent ? 'Bu ay harcanan' : `${monthLabel} harcaması`;

  // Ay seçici şeritleri (en yenisi solda)
  const mc=document.getElementById('budget-month-chips');
  if(mc){
    const reversedMN=MN.map((mm,i)=>({mm,i})).reverse();
    mc.innerHTML=reversedMN.map(({mm,i})=>`<button class="m-chip ${m===i?'on':''}" onclick="setBudM(${i})">${mm}${i===CUR_IDX?' ·':''}</button>`).join('');
  }

  // Aylık Toplam Limit kartı (otomatik = kategori toplamı, manuel = override)
  const mlEl=document.getElementById('budget-monthlim-card');
  if(mlEl){
    const catSum=Object.entries(S.budgets||{}).reduce((a,[k,v])=>((k==='uyap'||(S.deletedDefaults||[]).includes(k))?a:a+(+v||0)),0);
    const isManual=(S.monthLimit!=null);
    const effLim=isManual?+S.monthLimit:catSum;
    const monthSpent=S.expenses.filter(e=>mIdx(e.d)===m&&e.cat!=='uyap').reduce((a,e)=>a+e.amt,0);
    const mlPct=effLim>0?Math.min(115,monthSpent/effLim*100):0;
    const mlL=lvl(mlPct);
    const mlBc={red:'var(--neg)',orange:'var(--warn)',yellow:'var(--warn)',green:'var(--pos)'}[mlL];
    const mlPc={red:'var(--neg)',orange:'var(--warn)',yellow:'var(--warn)',green:'var(--pos)'}[mlL];
    const overTxt=(effLim>0&&monthSpent>effLim)?` · +${fmt(monthSpent-effLim)} ₺ aşım`:'';
    const badge=isManual
      ? `<span style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:999px;background:rgba(255,170,0,0.14);color:var(--warn);letter-spacing:.04em">MANUEL</span>`
      : `<span style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:999px;background:rgba(0,160,80,0.14);color:var(--pos);letter-spacing:.04em">OTOMATİK</span>`;
    const resetBtn=isManual
      ? `<button type="button" class="btn btn-ghost" style="font-size:11px;padding:4px 10px;min-width:0" onclick="setMonthLimit(null)" title="Otomatik moda dön (kategori toplamı)">Sıfırla</button>`
      : '';
    mlEl.innerHTML=`
      <div style="border:1px solid var(--line);border-radius:12px;padding:12px 14px;margin-bottom:14px;background:var(--card);color:var(--ink)">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap">
          <div style="font-weight:600;font-size:14px;display:flex;align-items:center;gap:8px">Aylık Toplam Limit ${badge}</div>
          ${resetBtn}
        </div>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px">
          <input class="b-input" type="number" min="0" step="500" value="${effLim}" style="width:130px" onchange="setMonthLimit(this.value)" aria-label="Aylık limit">
          <span style="font-size:11px;color:var(--text3)">₺ / ay</span>
          <span class="budget-pct" style="color:${mlPc};margin-left:auto">${effLim>0?Math.round(mlPct)+'%':'—'}${mlPct>=100?' ⚠':''}</span>
        </div>
        <div class="bbar" style="margin-bottom:6px"><div class="bfill" style="width:${Math.min(100,mlPct)}%;background:${mlBc}"></div></div>
        <div class="bsub"><span>${spentLabel}: ${fmt(monthSpent)} ₺${overTxt}</span><span>Kategori toplamı: ${fmt(catSum)} ₺</span></div>
        ${isManual&&effLim!==catSum?`<div style="margin-top:6px;font-size:11px;color:var(--text3)">Manuel limit kategori toplamından ${effLim>catSum?'+':''}${fmt(effLim-catSum)} ₺ farklı.</div>`:''}
      </div>`;
  }

  // Hem s-budget (ayrı ekran) hem de varsa eski more-budget için render et
  const html=getVisibleCats().filter(c=>c.id!=='uyap'&&c.id!=='diger').map(c=>{
    const lim=S.budgets[c.id]||0;
    const spent=catMonth(c.id,m);
    const pct=lim>0?Math.min(115,spent/lim*100):0;
    const l=lvl(pct);
    const bc={red:'var(--neg)',orange:'var(--warn)',yellow:'var(--warn)',green:'var(--pos)'}[l];
    const pc={red:'var(--neg)',orange:'var(--warn)',yellow:'var(--warn)',green:'var(--pos)'}[l];
    const custom=!isDefaultCat(c.id);
    const editBtn=custom?`<button type="button" class="fav-ic" title="Kategoriyi düzenle" onclick="openCatForm('${c.id}')" style="margin-left:4px">✎</button>`:'';
    const overTl = (lim>0 && spent>lim) ? ` · +${fmt(spent-lim)} ₺ aşım` : '';
    return`<div class="budget-item">
      <div class="budget-top">
        <div class="budget-name">${monoChip(c.id,'sm')}${catMeta(c.id).label}</div>
        <div class="budget-meta">
          <input class="b-input" type="number" value="${lim}" step="500" min="0" onchange="S.budgets['${c.id}']=+this.value;save();renderBudget();">
          <span style="font-size:9px;color:var(--text3)">₺</span>
          <span class="budget-pct" style="color:${pc}">${lim>0?Math.round(pct)+'%':'—'}${pct>=100?'⚠':''}</span>
          ${editBtn}
          <button type="button" class="fav-ic fav-ic-del" title="Kategoriyi sil" onclick="delCat('${c.id}')" style="margin-left:4px">×</button>
        </div>
      </div>
      <div class="bbar"><div class="bfill" style="width:${Math.min(100,pct)}%;background:${bc}"></div></div>
      <div class="bsub"><span>${spentLabel}: ${fmt(spent)} ₺${overTl}</span><span>Limit: ${lim>0?fmt(lim):'—'} ₺</span></div>
    </div>`;
  }).join('');
  // Silinmiş (gizlenmiş) varsayılan kategoriler — geri getirme paneli
  const delIds=(S.deletedDefaults||[]);
  const deletedHtml = delIds.length ? `
    <div style="border:1px dashed var(--line);border-radius:10px;padding:10px 12px;margin-top:10px">
      <div style="font-size:12px;font-weight:600;color:var(--text3);margin-bottom:6px">Silinmiş kategoriler (${delIds.length})</div>
      ${delIds.map(did=>`<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:4px 0">
        <span style="display:flex;align-items:center;gap:6px;font-size:13px;color:var(--text2)">${monoChip(did,'sm')}${escAttr(catMeta(did).label)}</span>
        <button type="button" class="btn btn-ghost" style="font-size:11px;padding:4px 10px;min-width:0" onclick="restoreCat('${escAttr(did)}')">Geri getir</button>
      </div>`).join('')}
      <div style="font-size:11px;color:var(--text3);margin-top:6px">Geçmiş harcamalar "Diğer"de korunur. Bir kategorinin bütçesini sıfırlamak için limite 0 yazın.</div>
    </div>` : '';
  ['budget-bars-main','budget-bars'].forEach(id=>{
    const el=document.getElementById(id);
    if(el) el.innerHTML=html+deletedHtml;
  });

  // Seçili ayın "Diğer" kategorisindeki kalemleri panelle göster (her biri için hızlı kategori seçici)
  const unrev = S.expenses.filter(e=>mIdx(e.d)===m && e.cat==='diger');
  const unrevTotal = unrev.reduce((a,e)=>a+e.amt,0);
  const unrevEl = document.getElementById('budget-unrev-panel');
  if(unrevEl){
    if(unrev.length){
      const opts = getVisibleCats().filter(c=>c.id!=='diger').map(c=>`<option value="${c.id}">${catMeta(c.id).label}</option>`).join('');
      unrevEl.innerHTML = `
        <div style="border:1px solid var(--warn);border-radius:10px;padding:10px 12px;margin-bottom:14px;background:rgba(255,170,0,0.04)">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;gap:8px;flex-wrap:wrap">
            <div style="font-weight:600;font-size:13px;color:var(--warn)">⚠ Kategorize edilmemiş · ${unrev.length} kalem · ${fmt(unrevTotal)} ₺</div>
            <div style="font-size:11px;color:var(--text3)">Aşağıdaki listeden her birine kategori atayın</div>
          </div>
          ${unrev.slice(0,40).map(t=>`
            <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-top:1px solid var(--line);font-size:12px">
              <div style="flex:1;min-width:0">
                <div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escAttr(t.desc)}</div>
                <div style="color:var(--text3);font-size:11px">${escAttr(t.d)} · ${escAttr(t.bank)} · <strong>${fmt(t.amt)} ₺</strong></div>
              </div>
              <select class="b-input" style="padding:6px 8px" onchange="setTxnCat('${t.id}',this.value)">
                <option value="">— kategori seç —</option>
                ${opts}
              </select>
            </div>
          `).join('')}
          ${unrev.length>40?`<div style="text-align:center;padding-top:8px;color:var(--text3);font-size:11px">+${unrev.length-40} kalem daha · İşlemler ekranından düzenleyebilirsin</div>`:''}
        </div>
      `;
    } else {
      unrevEl.innerHTML='';
    }
  }

  // Abonelikler bütçe ekranında birlikte render
  renderSubs();
}
function setBudM(m){
  S.budM=m;
  renderBudget();
}
// Aylık toplam limit: null veya boş = otomatik (kategori toplamı), sayı = manuel override
function setMonthLimit(val){
  if(val===null||val===undefined||val===''||val==='null'){
    S.monthLimit=null;
  } else {
    const n=+val;
    if(Number.isFinite(n)&&n>0) S.monthLimit=n;
    else S.monthLimit=null;
  }
  save();
  renderBudget();
}
// Tek kalemin kategorisini hızlıca degistir (txn list ve "kategorize edilmemis" panelinden cagrilir)
function setTxnCat(id,newCat){
  if(!getCats().some(c=>c.id===newCat)) return;
  S.userExp = S.userExp.map(e=>e.id===id?{...e,cat:newCat}:e);
  S.expenses = S.expenses.map(e=>e.id===id?{...e,cat:newCat}:e);
  save();
  renderBudget();
  renderTxn && renderTxn();
  renderDash && renderDash();
}
// Sadece "diger" kategorisindeki kalemleri inferCategory ile yeniden sınıflandır
function recatAllDiger(){
  const total = S.expenses.filter(e=>e.cat==='diger').length;
  if(!total){ toast('"Diğer" kategorisinde kalem yok'); return; }
  if(!confirm(`"Diğer" kategorisindeki ${total} kalem otomatik kurallarla yeniden sınıflandırılacak. Hiçbir kayıt silinmez. Devam?`)) return;
  let changed = 0;
  const fix = e => {
    if(e.cat !== 'diger') return e;
    const next = inferCategory(e.desc);
    if(next && next !== 'diger'){ changed++; return {...e, cat: next}; }
    return e;
  };
  S.userExp = S.userExp.map(fix);
  S.expenses = S.expenses.map(fix);
  save();
  renderBudget();
  renderTxn && renderTxn();
  renderDash && renderDash();
  toast(changed?`✓ ${changed}/${total} kalem sınıflandırıldı`:'Yeni kural eşleşmedi · manuel düzenleyebilirsiniz');
}

// ══════════════════════════════════════════════════════════════
// TRANSACTIONS
// ══════════════════════════════════════════════════════════════
function renderTxn(){
  // Ay chips ters sıra: current ay solda, geriye doğru
  const reversedMN=MN.map((m,i)=>({m,i})).reverse();
  const mf=document.getElementById('quick-txn-mf');
  const cf=document.getElementById('quick-txn-cf');
  const list=document.getElementById('quick-txn-list');
  if(mf) mf.innerHTML=`<button class="f-chip ${S.expM===null?'on':''}" onclick="setEM(null)">Tümü</button>`+reversedMN.map(({m,i})=>`<button class="f-chip ${S.expM===i?'on':''}" onclick="setEM(${i})">${m}</button>`).join('');
  if(cf) cf.innerHTML=`<button class="f-chip ${S.expC===null?'on':''}" onclick="setEC(null)">Tüm kategoriler</button>`+getVisibleCats().map(c=>`<button class="f-chip ${S.expC===c.id?'on':''}" onclick="setEC('${c.id}')">${catMeta(c.id).mono} ${catMeta(c.id).label}</button>`).join('');
  if(!list) return;
  let txns=[...S.expenses];
  if(S.expM!==null) txns=txns.filter(e=>mIdx(e.d)===S.expM);
  if(S.expC!==null) txns=txns.filter(e=>e.cat===S.expC);
  txns.sort((a,b)=>b.d.localeCompare(a.d)||b.id.localeCompare(a.id));
  const totalShown=txns.reduce((a,t)=>a+t.amt,0);
  const catOpts = getVisibleCats().map(c=>`<option value="${c.id}">${catMeta(c.id).label}</option>`).join('');
  list.innerHTML=(txns.length?`<div class="row-meta" style="display:flex;justify-content:space-between;align-items:center;padding:6px 0 10px;border-bottom:1px solid var(--line);margin-bottom:6px"><span>${txns.length} kayıt${txns.length>100?' · ilk 100':''}</span><span class="row-amt">${fmt(totalShown)} ₺</span></div>`:'')+txns.slice(0,100).map(t=>{
    const c=catMeta(t.cat);
    const isUnrev=t.cat==='diger';
    const selOpts = catOpts.replace(`value="${t.cat}"`,`value="${t.cat}" selected`);
    return`<div class="tx-entry list-row">
      ${monoChip(t.cat,'sm')}
      <div class="tx-info"><div class="tx-desc">${escAttr(t.desc)}</div><div class="tx-meta">${escAttr(t.d)} · ${escAttr(t.bank)}</div></div>
      <div class="tx-right">
        <div class="tx-amt row-amt neg">${fmt(t.amt)} ₺</div>
        <div style="display:flex;gap:4px;align-items:center;margin-top:3px">
          <select onchange="setTxnCat('${t.id}',this.value)" title="Kategoriyi değiştir" style="font-size:10px;padding:2px 4px;border:0.5px solid ${isUnrev?'var(--warn)':'rgba(255,255,255,0.1)'};border-radius:4px;background:var(--surface);color:${isUnrev?'var(--warn)':c.color};cursor:pointer;max-width:110px">${selOpts}</select>
          <button onclick="delExp('${t.id}')" class="row-del">sil</button>
        </div>
      </div>
    </div>`;
  }).join('')||`<div style="text-align:center;padding:20px;color:var(--text3);font-size:12px">Kayıt yok</div>`;
}
function setEM(m){S.expM=m;renderTxn();}
function setEC(c){S.expC=c;renderTxn();}

// ══════════════════════════════════════════════════════════════
// CALENDAR (detay kısmındaki takvim kaldırıldı — dashboard'daki takvim kaldı)
// ══════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════
// FIXED LIST
// ══════════════════════════════════════════════════════════════
function renderFixed(){
  const tot=FIXED.reduce((a,f)=>a+f.amt,0);
  document.getElementById('fixed-list').innerHTML=FIXED.map(f=>`
    <div class="fixed-row">
      <div class="row-main"><div class="row-title">${f.desc}</div><div class="row-meta">${f.sub}</div></div>
      <div style="text-align:right"><div class="row-amt">${fmt(f.amt)} ₺</div><div class="row-meta">${f.note}</div></div>
    </div>`).join('')+`<div class="fixed-row"><div class="row-title">Toplam Sabit</div><div class="row-amt">${fmt(tot)} ₺</div></div>`;
}

// ══════════════════════════════════════════════════════════════
// PARSE STATEMENT
// ══════════════════════════════════════════════════════════════
async function parseStmt(){
  const text=document.getElementById('stmt-text').value.trim(),bank=document.getElementById('stmt-bank').value;
  if(!text){toast('Metin boş',true);return;}
  const btn=document.getElementById('parse-btn');
  const resultEl=document.getElementById('parse-res');
  btn.disabled=true;btn.textContent='Gemini analiz ediyor…';
  resultEl.textContent='Gemini ile analiz ediliyor…';
  try{
    const data=await callGemini({
      systemInstruction:`Türk banka ekstresini parse eden akıllı bir finans asistanısın. Yalnızca geçerli JSON döndür; her kayıt {d, desc, amt, cat, bank} içermeli. Tarih YYYY-MM-DD olsun.
Yalnızca GERÇEK GİDER işlemlerini al. Atla: iade, iptal, alacak, pozitif geri ödeme, bakiye, faiz, kredi kartı ödemesi, virman, hesaplar arası transfer.

KATEGORİ SEÇİM KURALI (çok önemli):
İşyeri adına bakarak iş kolunu tahmin et. Örnekler:
- "Özgür Börek", "Hebun Çorba", "X Pide", "Starbucks", "Kahve Dünyası", "Yemeksepeti", "Getir Yemek" → yemek
- "İstanbulkart", "İETT", "Marmaray", "BiTaksi", "Uber", "HGS", "OGS", "Shell", "BP", "Opet" → ulasim
- "Migros", "A101", "BİM", "ŞOK", "Carrefour", "Macrocenter", kasap, manav → market
- "Apple.com", "Google", "Spotify", "Netflix", "Claude", "OpenAI", "YouTube", "Microsoft 365" → dijital
- "Trendyol", "Hepsiburada", "Amazon", "N11" → eticaret
- "Türknet", "Vodafone", "Turkcell", "İGDAŞ", "İSKİ", "Enerjisa" → fatura
- Eczane, hastane, klinik, Dr., Dt. → saglik
- Halısaha, MacFit, Mars Athletic, spor salonu → spor
- Sinema, tiyatro, konser, Steam, Passo → eglence
- LCW, Zara, Nike, Adidas, Boyner, Koton → giyim veya eticaret
- UYAP, AVKT, Avukat Portalı, harç, mahkeme → uyap
- Kira, mülk sahibi adı → kira
- Motorlu taşıt vergisi, MTV, GIB, vergi dairesi → vergi

Sadece bu kodlardan birini kullan: ${getCats().map(c=>c.id).join(', ')}.
EMİN DEĞİLSEN → 'diger'. Asla tahmin için zorlama yapma; iş kolu belirsizse 'diger' daha iyi.
Banka alanı daima ${bank} olsun.`,
      userText:text.slice(0,12000),
      responseMimeType:'application/json',
      responseSchema:statementSchema(bank),
      maxOutputTokens:8192,
      disableThinking:true
    });
    const raw=geminiText(data)||'[]';
    const parsed=JSON.parse(raw);
    if(Array.isArray(parsed)&&parsed.length){
      const rows=parsed.map(t=>({
        id:genId(),
        d:String(t.d||'').slice(0,10),
        desc:(t.desc||'').trim()||bank+' ekstresi',
        amt:Math.abs(Number(t.amt)||0),
        cat:getCats().some(c=>c.id===t.cat)?t.cat:'diger',
        bank
      }));
      const added=importStatementRows(rows);
      save();
      const todayStr=new Date().toLocaleDateString('tr-TR');
      resultEl.textContent=`✓ Gemini ile ${added} kalem ${todayStr} tarihine kaydedildi.\nTakvimde tek kırmızı nokta · bütçe kategorileri güncellendi.\n\n`+rows.map(t=>`  ${t.desc}: ${fmt(t.amt)} ₺`).join('\n');
      document.getElementById('stmt-text').value='';
      toast(`✓ ${added} kalem eklendi`);
      renderDash();
      renderTxn&&renderTxn();
      detectSubscriptions();
      maybeOfferPostImportAnalysis(added);
    } else {
      const fallbackRows=parseStatementFallback(text,bank);
      const added=importStatementRows(fallbackRows);
      if(added){
        save();
        const todayStr=new Date().toLocaleDateString('tr-TR');
        resultEl.textContent=`✓ Yerel parser ile ${added} kalem ${todayStr} tarihine kaydedildi.\nTakvimde tek kırmızı nokta · bütçe kategorileri güncellendi.\n\n`+fallbackRows.map(t=>`  ${t.desc}: ${fmt(t.amt)} ₺`).join('\n');
        document.getElementById('stmt-text').value='';
        toast(`✓ ${added} kalem eklendi`);
        renderDash();
        renderTxn&&renderTxn();
        detectSubscriptions();
        maybeOfferPostImportAnalysis(added);
      } else {
        resultEl.textContent='İşlem bulunamadı.';
      }
    }
  }catch(e){
    const fallbackRows=parseStatementFallback(text,bank);
    const added=importStatementRows(fallbackRows);
    if(added){
      save();
      const todayStr=new Date().toLocaleDateString('tr-TR');
      resultEl.textContent=`⚠ Gemini hatası: ${friendlyGeminiError(e)}\n\nYerel parser ile ${added} kalem ${todayStr} tarihine kaydedildi.\n\n`+fallbackRows.map(t=>`  ${t.desc}: ${fmt(t.amt)} ₺`).join('\n');
      document.getElementById('stmt-text').value='';
      toast(`✓ Fallback ile ${added} kalem eklendi`);
      renderDash();
      renderTxn&&renderTxn();
      detectSubscriptions();
      maybeOfferPostImportAnalysis(added);
    } else {
      resultEl.textContent='Hata: '+friendlyGeminiError(e);
      toast('Hata',true);
    }
  }
  btn.disabled=false;btn.textContent='İçe Aktar';
}

function maybeOfferPostImportAnalysis(addedCount){
  const key=getGeminiKey();
  if(!key) return; // key yoksa önerme
  if(!addedCount) return;
  setTimeout(()=>{
    if(confirm(`${addedCount} kalem eklendi.\n\nBu ekstrenin AI analizini de yapalım mı?`)){
      go('more',document.getElementById('nb-more'));
      setTimeout(()=>{
        const btn=document.getElementById('analyze-all-btn');
        if(btn){ btn.scrollIntoView({behavior:'smooth',block:'center'}); setTimeout(()=>analyzeAllSpending(),400); }
      },300);
    }
  },600);
}

async function analyzeAllSpending(){
  const btn=document.getElementById('analyze-all-btn');
  const out=document.getElementById('analysis-res');
  if(!getGeminiKey()){
    // Key yoksa: cihazda hesaplanan offline analiz — kullanıcı verisi dışarı çıkmaz
    out.innerHTML=analyzeSpendingLocalHtml();
    try{ out.scrollIntoView({behavior:'smooth',block:'center'}); }catch(_){}
    toast('Cihazda lokal analiz hazır');
    return;
  }
  btn.disabled=true;
  btn.textContent='Gemini 3 dönem analiz ediyor…';
  out.textContent='1 aylık · 3 aylık · 6 aylık dönemler analiz ediliyor…';
  try{
    const data=await callGemini({
      systemInstruction:`Sen kişisel finans analistisin. Sana verilen JSON üç dönem özeti içeriyor: 1 aylık (bu ay), 3 aylık (son 3 ay), 6 aylık (son 6 ay). Ayrıca tüm geçmişin ay-yıl bazlı toplamları, bütçeler, top harcamalar ve son 80 işlem var.

GÖREV: Her üç dönem için ayrı ayrı analiz üret. Türkçe yaz, somut rakam ver, dolgu cümleden kaçın.

ÇIKTI FORMATI (kesinlikle bu sırayla, bu başlıklarla):

## 1 AYLIK ANALİZ
1) Genel Durum
[1-2 paragraf: gelir, gider, net, ay-ay değişim]
2) En Fazla Para Yakan Kalemler
- Kategori adı: ₺tutar (kısa yorum)
- ...
3) Riskler
- Riskli durum 1
- ...
4) Gelecek Ay İçin 3 Öneri
- Öneri 1
- Öneri 2
- Öneri 3

## 3 AYLIK ANALİZ
1) Genel Durum
...
2) En Fazla Para Yakan Kalemler
...
3) Riskler
...
4) 3 Öneri
...

## 6 AYLIK ANALİZ
1) Genel Durum
...
2) En Fazla Para Yakan Kalemler
...
3) Riskler
...
4) 3 Stratejik Öneri
...

KURALLAR:
- Üç dönemin de tüm 4 başlığını eksiksiz doldur
- Her dönem için somut TL rakamı kullan (₺ sembolü ile)
- 1 aylık için bu ayı, 3 aylık için son 3 ayı, 6 aylık için son 6 ayı kapsayan yorum yap
- Dönemler arası farkı işaret et (örn: "3 aylıkta artış var ama 6 aylıkta stabil")
- UYAP kategorisi mesleki gider, kişisel bütçeden ayrı değerlendir
- Bütçe limit aşımı varsa Riskler'de belirt
- FIBER (kendine ödeme) oranı düşükse Önerilerde değin`,
      userText:buildSpendingAnalysisInput(),
      responseMimeType:'text/plain',
      maxOutputTokens:8192,
      disableThinking:true
    });
    const raw=geminiText(data);
    const finish=(data.candidates&&data.candidates[0]&&data.candidates[0].finishReason)||'';
    if(!raw){
      out.innerHTML=`<div class="ai-sec neg"><h4>Analiz üretilemedi</h4><p>Model boş yanıt döndü (finishReason: ${finish||'bilinmiyor'}). Tekrar deneyin.</p></div>`;
    } else {
      let html=renderAnalysisHtml(raw);
      if(finish==='MAX_TOKENS') html+=`<div class="ai-sec neg"><h4>Uyarı</h4><p>Cevap token limitine takıldı; analiz kısaltılmış olabilir. Daha az veriyle tekrar deneyin.</p></div>`;
      out.innerHTML=html;
    }
  }catch(e){
    out.innerHTML=`<div class="ai-sec neg"><h4>Hata</h4><p>${friendlyGeminiError(e)}</p></div>`;
    toast('Hata',true);
  }
  btn.disabled=false;
  btn.textContent='Analiz Et';
}

// ── Lokal (offline) analiz: Gemini key yoksa cihazda 3 dönem (1ay/3ay/6ay) hesapla ──
function analyzeSpendingLocalHtml(){
  const cur=(typeof CUR_IDX==='number')?CUR_IDX:(MN.length-1);
  const fmtTl=n=>`₺${fmt(Math.round(n))}`;

  // Tüm 6 ay penceresi
  const monthExp=MN.map((_,i)=>monthP(i));
  const monthInc=MN.map((_,i)=>monthI(i));
  const totalIncAll=monthInc.reduce((a,b)=>a+b,0);
  let totalFiber=0;
  try{ totalFiber=(S.incomes||[]).reduce((a,i)=>a+(typeof incomeFiberAmt==='function'?incomeFiberAmt(i):0),0); }catch(_){}
  const fiberRate=totalIncAll>0?totalFiber/totalIncAll*100:0;

  function periodReport(idxs, label, cls, detail){
    const valid=idxs.filter(i=>i>=0&&i<MN.length);
    const exp=valid.reduce((a,i)=>a+monthP(i),0);
    const inc=valid.reduce((a,i)=>a+monthI(i),0);
    const net=inc-exp;
    const avgExp=valid.length?exp/valid.length:0;

    // Kategori toplamları (bu dönem)
    const cats=getCats().map(c=>{
      const total=valid.reduce((a,i)=>a+catMonth(c.id,i),0);
      return {id:c.id,label:escAttr(c.label||c.id),total,budget:S.budgets[c.id]||0};
    }).filter(c=>c.total>0||c.budget>0);
    const top=cats.filter(c=>c.total>0).sort((a,b)=>b.total-a.total).slice(0, detail?5:3);

    // Riskler
    const risks=[];
    cats.forEach(c=>{
      if(c.budget>0 && c.total>0){
        const expected=c.budget*valid.length;
        if(expected>0 && c.total/expected*100>=70){
          const pct=Math.round(c.total/expected*100);
          risks.push(`<strong>${c.label}</strong> · bütçeye göre <strong>%${pct}</strong> kullanım (${fmtTl(c.total)} / ${fmtTl(expected)})`);
        }
      }
    });
    if(net<0) risks.push(`Net negatif: <strong style="color:var(--neg)">−${fmtTl(Math.abs(net))}</strong> (gelir ${fmtTl(inc)}, gider ${fmtTl(exp)})`);
    if(detail){
      // 3 ve 6 ay detayında negatif ay sayısı
      let negMonths=0;
      valid.forEach(i=>{ if((monthInc[i]-monthExp[i])<0) negMonths++; });
      if(negMonths>=Math.ceil(valid.length/2)){
        risks.push(`${valid.length} ayın <strong>${negMonths}</strong> ayında gider geliri aştı`);
      }
      if(fiberRate<10 && totalIncAll>0){
        risks.push(`FIBER oranı düşük: <strong>%${fiberRate.toFixed(1)}</strong> — hedef minimum %10`);
      }
    }
    // 1 aylık dönemde önceki aya kıyas
    if(!detail && valid.length===1){
      const i=valid[0];
      const prev=i>0?monthExp[i-1]:0;
      if(prev>0){
        const pct=Math.round((exp-prev)/prev*100);
        if(pct>=30) risks.push(`Geçen aya göre gider <strong>%${pct}</strong> arttı (${fmtTl(prev)} → ${fmtTl(exp)})`);
        else if(pct<=-15) risks.push(`Geçen aya göre gider %${Math.abs(pct)} azaldı — iyi gidiyor`);
      }
    }

    // Öneriler
    const tips=[];
    if(top[0]){
      const save=Math.round(top[0].total*0.10);
      tips.push(`<strong>${top[0].label}</strong>'da %10 kesinti ≈ <strong>${fmtTl(save)}</strong> tasarruf`);
    }
    if(top[1] && detail){
      const monthly=Math.round(top[1].total/Math.max(valid.length,1));
      tips.push(`<strong>${top[1].label}</strong>: bu dönemde aylık ortalama ${fmtTl(monthly)}`);
    }
    if(net<0){
      tips.push('Açığı kapatmak için en yüksek 2 kategoriden minik kesintiler');
    } else if(detail && fiberRate<10 && totalIncAll>0){
      tips.push(`Her gelirde otomatik <strong>%10 FIBER</strong> uygulanırsa 6 ayda ${fmtTl(totalIncAll*0.10)} birikim`);
    } else if(top.length>=3 && detail){
      const top3Sum=top.slice(0,3).reduce((a,c)=>a+c.total,0);
      const top3Pct=Math.round(top3Sum/Math.max(exp,1)*100);
      tips.push(`En büyük 3 kategori giderin <strong>%${top3Pct}</strong>'ini oluşturuyor — odak alanı`);
    }
    if(!detail && tips.length<2 && top[1]){
      tips.push(`<strong>${top[1].label}</strong> da dikkat edilmesi gereken kalem`);
    }

    const topHtml=top.length
      ? `<ul>${top.map(c=>`<li><strong>${c.label}</strong>: ${fmtTl(c.total)}</li>`).join('')}</ul>`
      : '<p>Bu dönemde kayıt yok.</p>';
    const risksHtml=risks.length
      ? `<ul>${risks.map(r=>`<li>${r}</li>`).join('')}</ul>`
      : '<p>Belirgin risk yok.</p>';
    const tipsHtml=tips.length
      ? `<ul>${tips.slice(0,3).map(t=>`<li>${t}</li>`).join('')}</ul>`
      : '<p>Yeterli veri yok — daha fazla giriş ekleyin.</p>';

    const netCol=net>=0?'var(--pos)':'var(--neg)';
    const avgLine=valid.length>1?` · Ort. aylık gider <strong>${fmtTl(avgExp)}</strong>`:'';
    return `<div class="ai-period ${cls}">
      <h3 class="ai-period-title">${label}</h3>
      <div class="ai-sec"><h4>Genel Durum</h4><p>Gelir <strong>${fmtTl(inc)}</strong> · Gider <strong>${fmtTl(exp)}</strong> · Net <strong style="color:${netCol}">${net>=0?'+':''}${fmtTl(net)}</strong>${avgLine}</p></div>
      <div class="ai-sec"><h4>En Çok Yakan Kalemler</h4>${topHtml}</div>
      <div class="ai-sec neg"><h4>Riskler</h4>${risksHtml}</div>
      <div class="ai-sec pos"><h4>Öneriler</h4>${tipsHtml}</div>
    </div>`;
  }

  const headerNote=`<div class="ai-sec" style="background:var(--bg-elev);border-style:dashed"><p style="margin:0"><strong>Cihazda lokal analiz</strong> — Gemini API key girilmediği için bu rapor cihazınızda hesaplandı. Verileriniz dışarı çıkmadı. Daha derin AI yorumu için yukarıdan key ekleyebilirsiniz.</p></div>`;

  return headerNote
    + periodReport([cur], '1 Aylık Analiz', 'p1', false)
    + periodReport([cur-2,cur-1,cur], '3 Aylık Analiz', 'p3', true)
    + periodReport([0,1,2,3,4,5].filter(i=>i<MN.length), '6 Aylık Analiz', 'p6', true);
}

// ══════════════════════════════════════════════════════════════
// DATA
// ══════════════════════════════════════════════════════════════
function resetAll(){
  if(!confirm('Tüm giderler, gelirler ve bütçeler silinecek. Önce otomatik yedek indirilecek. Devam?'))return;
  // Güvenlik: önce otomatik yedek indir
  try{
    const backup={exportedAt:new Date().toISOString(),note:'resetAll öncesi otomatik yedek',expenses:S.userExp,incomes:S.incomes,budgets:S.budgets,favs:S.favs,customCats:S.customCats||[],deletedDefaults:S.deletedDefaults||[],subs:S.subs||[],cards:S.cards||[],findeks:S.findeks||[],monthLimit:S.monthLimit};
    const backupJson=JSON.stringify(backup,null,2);
    // İndirme engellenebilir (mobil/in-app webview); önce cihaz-içi güvenlik kopyası yaz.
    try{ localStorage.setItem('ay_last_reset_backup', backupJson); }catch(_){}
    const b=new Blob([backupJson],{type:'application/json'});
    const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='ay_backup_reset_'+new Date().toISOString().slice(0,10)+'.json';
    document.body.appendChild(a);a.click();a.remove();
  }catch(e){console.warn('reset backup failed',e);}
  S.userExp=[];S.expenses=[];S.incomes=[];S.budgets={...DEF_BUD};
  S.customCats=[];S.deletedDefaults=[];S.subs=[];S.cards=JSON.parse(JSON.stringify(DEFAULT_CARDS));
  S.findeks=[];S.monthLimit=null;
  save();toast('✓ Veriler sıfırlandı · yedek indirildi');
  renderDash();renderTxn&&renderTxn();renderIncome&&renderIncome();renderBudget&&renderBudget();renderFindeks&&renderFindeks();
}
function exportData(){
  const payload={
    expenses:S.userExp,
    incomes:S.incomes,
    budgets:S.budgets,
    favs:S.favs,
    customCats:S.customCats||[],
    deletedDefaults:S.deletedDefaults||[],
    subs:S.subs||[],
    cards:S.cards||[],
    findeks:S.findeks||[],
    monthLimit:S.monthLimit
  };
  const b=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='butce_'+new Date().toISOString().slice(0,10)+'.json';a.click();
  toast('✓ Yedek alındı');
}
function importData(e){
  const f=e.target.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=ev=>{try{
    const d=JSON.parse(ev.target.result);
    if(typeof d!=='object'||d===null){ toast('Hata: geçersiz dosya',true); e.target.value=''; return; }
    // Veri-kaybı koruması: bu yedek mevcut verinin ÜZERİNE yazar → sayı önizlemeli onay
    const curN=(S.userExp||[]).length+(S.incomes||[]).length;
    const newExpA=Array.isArray(d.expenses)?d.expenses:null;
    const newIncA=Array.isArray(d.incomes)?d.incomes:null;
    const newN=((newExpA||[]).length)+((newIncA||[]).length);
    if(!confirm(`Bu yedek mevcut verinin ÜZERİNE yazılacak.\nMevcut: ${curN} kayıt · Yedekte: ${newN} kayıt.\nÖnce mevcut verinin otomatik yedeği indirilecek. Devam?`)){ e.target.value=''; return; }
    // İçe aktarmadan önce mevcut veriyi yedekle (dosya + cihaz-içi güvenlik kopyası)
    try{
      const pre={exportedAt:new Date().toISOString(),note:'import öncesi otomatik yedek',expenses:S.userExp,incomes:S.incomes,budgets:S.budgets,favs:S.favs,customCats:S.customCats||[],deletedDefaults:S.deletedDefaults||[],subs:S.subs||[],cards:S.cards||[],findeks:S.findeks||[],monthLimit:S.monthLimit};
      const pj=JSON.stringify(pre,null,2);
      try{ localStorage.setItem('ay_last_import_backup', pj); }catch(_){}
      const bb=new Blob([pj],{type:'application/json'});const aa=document.createElement('a');aa.href=URL.createObjectURL(bb);aa.download='ay_backup_preimport_'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(aa);aa.click();aa.remove();
    }catch(_){}
    // Alan doğrulama/coerce yardımcıları — bozuk alanı temizle, kaydı ASLA düşürme
    const isHex=v=>typeof v==='string'&&/^#[0-9a-fA-F]{3,8}$/.test(v);
    const str=(v,max)=>String(v==null?'':v).slice(0,max);
    const num=v=>{const n=+v;return Number.isFinite(n)?n:0;};
    // Özel kategorileri ÖNCE uygula ki gider kategori doğrulaması onları tanısın
    if(Array.isArray(d.customCats)) S.customCats=d.customCats.filter(c=>c&&c.id&&c.label).map(c=>({id:str(c.id,40),label:str(c.label,40),icon:str(c.icon||'📌',8),color:isHex(c.color)?c.color:'#888'}));
    if(d.budgets&&typeof d.budgets==='object') S.budgets={...DEF_BUD,...d.budgets};
    if(Array.isArray(d.deletedDefaults)) S.deletedDefaults=d.deletedDefaults.filter(x=>typeof x==='string'); // alan yoksa mevcut gizli durum korunur
    const validCat=new Set(getCats().map(c=>c.id));
    const validInc=new Set(ICATS.map(c=>c.id));
    if(newExpA){ S.userExp=newExpA.filter(x=>x&&typeof x==='object').map(x=>({id:x.id||genId(),d:str(x.d,10),desc:str(x.desc,200),cat:validCat.has(x.cat)?x.cat:'diger',amt:num(x.amt),bank:str(x.bank,40)})); S.expenses=[...S.userExp]; }
    if(newIncA) S.incomes=newIncA.filter(x=>x&&typeof x==='object').map(x=>{const o={id:x.id||genId(),d:str(x.d,10),desc:str(x.desc,200),cat:validInc.has(x.cat)?x.cat:'diger',amt:num(x.amt),bank:str(x.bank,40)}; if(Number.isFinite(+x.fiberPct))o.fiberPct=+x.fiberPct; if(Number.isFinite(+x.fiberAmt))o.fiberAmt=+x.fiberAmt; return o;});
    if(Array.isArray(d.favs)) S.favs=d.favs.map(f=>({...f,id:f.id||genId()}));
    if(Array.isArray(d.subs)) S.subs=d.subs.map(s=>({...s,id:s.id||genId()}));
    if(Array.isArray(d.cards)) S.cards=d.cards.map(c=>({...c,id:c.id||genId(),color:isHex(c.color)?c.color:(c.color||'#888')}));
    if(Array.isArray(d.findeks)) S.findeks=d.findeks.filter(f=>f&&f.date&&Number.isFinite(+f.score)).map(f=>({id:f.id||genId(),date:String(f.date).slice(0,10),score:+f.score,note:String(f.note||'')}));
    if(d.monthLimit===null||d.monthLimit===undefined){ S.monthLimit=null; }
    else { const _ml=+d.monthLimit; S.monthLimit=(Number.isFinite(_ml)&&_ml>0)?_ml:null; }
    save();toast('✓ Veri yüklendi');go('dash',document.getElementById('nb-dash'));
  }catch{toast('Hata: geçersiz dosya',true);}};
  r.readAsText(f);
}

// ══════════════════════════════════════════════════════════════
// FINDEKS — Aylık kredi puanı kaydı (manuel)
// ══════════════════════════════════════════════════════════════
function fkBand(score){
  const s=Number(score)||0;
  if(s>=1700) return {label:'Çok İyi', cls:'good'};
  if(s>=1500) return {label:'İyi', cls:'good'};
  if(s>=1300) return {label:'Orta', cls:'warn'};
  if(s>=1000) return {label:'Az Riskli', cls:'warn'};
  return {label:'Riskli', cls:'bad'};
}
function addFindeks(){
  const dEl=document.getElementById('fk-date');
  const sEl=document.getElementById('fk-score');
  const nEl=document.getElementById('fk-note');
  if(!dEl||!sEl) return;
  const date=String(dEl.value||'').slice(0,10);
  const score=parseInt(String(sEl.value||'').replace(/[^\d-]/g,''),10);
  const note=String(nEl?.value||'').trim();
  if(!date){ toast('Tarih seçin',true); return; }
  if(!Number.isFinite(score)||score<0||score>1900){ toast('Skor 0–1900 arası olmalı',true); return; }
  S.findeks=S.findeks||[];
  S.findeks.push({id:genId(), date, score, note});
  save();
  if(sEl) sEl.value='';
  if(nEl) nEl.value='';
  renderFindeks();
  toast('✓ Findeks kaydı eklendi');
}
function delFindeks(id){
  if(!confirm('Bu Findeks kaydını silmek istiyor musunuz?')) return;
  S.findeks=(S.findeks||[]).filter(f=>f.id!==id);
  save();
  renderFindeks();
  toast('✓ Kayıt silindi');
}
function renderFindeks(){
  const dateEl=document.getElementById('fk-date');
  if(dateEl && !dateEl.value) dateEl.value=new Date().toISOString().slice(0,10);
  const list=document.getElementById('findeks-list');
  const sumEl=document.getElementById('findeks-summary');
  const sparkEl=document.getElementById('findeks-spark');
  if(!list||!sumEl||!sparkEl) return;

  const items=[...(S.findeks||[])].sort((a,b)=>String(b.date).localeCompare(String(a.date))||String(b.id).localeCompare(String(a.id)));
  if(!items.length){
    sumEl.innerHTML=`<div class="fk-current empty">— Henüz kayıt yok —</div><div class="fk-meta"><span>İlk kaydınızı yukarıdaki formdan ekleyin.</span></div>`;
    sparkEl.innerHTML='';
    list.innerHTML=`<div class="findeks-empty">Henüz Findeks kaydı yok. İlk kaydı eklemek için yukarıdaki formu doldurun.</div>`;
    return;
  }
  const last=items[0];
  const prev=items[1];
  const band=fkBand(last.score);
  const delta=prev?(last.score-prev.score):0;
  const deltaTxt=prev
    ? (delta>0?`+${delta} (önceki kayda göre)`:delta<0?`${delta} (önceki kayda göre)`:`Değişim yok`)
    : 'İlk kayıt';
  const deltaCls=delta>0?'pos':delta<0?'neg':'';
  const dateLabel=new Date(last.date+'T00:00:00').toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric'});
  sumEl.innerHTML=`
    <div class="fk-current">${last.score}</div>
    <div class="fk-meta">
      <span class="fk-band">${band.label}</span>
      <span>Son kayıt · ${dateLabel}</span>
      <span class="fk-delta ${deltaCls}">${deltaTxt}</span>
    </div>`;

  // Sparkbar: son 12 kayıt, eski → yeni
  const last12=items.slice(0,12).reverse();
  const max=Math.max(...last12.map(f=>f.score),1);
  sparkEl.innerHTML=last12.map((f,i)=>{
    const b=fkBand(f.score);
    const h=Math.max(8, Math.round(f.score/max*100));
    const isLast=i===last12.length-1;
    const lbl=String(f.date).slice(5,7)+'/'+String(f.date).slice(8,10);
    return `<div class="fk-col ${isLast?'active':''}" title="${f.date} · ${f.score}"><div class="fk-stick ${b.cls}"><span style="height:${h}%"></span></div><div class="fk-lbl">${lbl}</div></div>`;
  }).join('');

  // Liste
  list.innerHTML=items.map(f=>{
    const b=fkBand(f.score);
    const dt=new Date(f.date+'T00:00:00').toLocaleDateString('tr-TR',{day:'numeric',month:'short',year:'numeric'});
    const noteHtml=f.note?`<div class="row-meta">${escapeHtml(f.note)}</div>`:'';
    return `<div class="list-row"><div class="row-main"><div class="row-title">${dt}</div><div class="row-meta">${b.label}</div>${noteHtml}</div><div class="fk-score ${b.cls}">${f.score}</div><button type="button" class="fk-del" onclick="delFindeks('${f.id}')" aria-label="Sil">Sil</button></div>`;
  }).join('');
}
function escapeHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

// ══════════════════════════════════════════════════════════════
// MORE SUB-TABS
// ══════════════════════════════════════════════════════════════
function setMoreTab(tab,btn){
  document.querySelectorAll('.more-panel').forEach(p=>p.style.display='block');
  renderFixed();
  renderCards();
  renderFindeks();
  const target=document.getElementById('more-'+(tab||'ekstre'));
  if(target) target.scrollIntoView({behavior:'smooth', block:'start'});
}

// ══════════════════════════════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════════════════════════════
function go(screen,btn){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('on'));
  document.querySelectorAll('.nav-item').forEach(b=>b.classList.remove('on'));
  if(screen==='budget-shortcut'){
    const sb=document.getElementById('s-budget');
    if(sb) sb.classList.add('on');
    if(btn) btn.classList.add('on');
    renderBudget();
    scrollToTopInstant();
    return;
  }
  const target=document.getElementById('s-'+screen);
  if(target) target.classList.add('on');
  if(btn) btn.classList.add('on');
  if(screen==='dash'){
    renderDash();
  }
  else if(screen==='quick'){
    buildCatGrid();buildFavList();renderTxn();
    const d=document.getElementById('q-date');if(d&&!d.value)d.value=new Date().toISOString().slice(0,10);
    const qd=document.getElementById('quick-date-display');
    if(qd) qd.textContent=new Date().toLocaleDateString('tr-TR',{weekday:'long',day:'numeric',month:'long'});
  }
  else if(screen==='income'){
    renderIncome();
  }
  else if(screen==='more'){
    setMoreTab('ekstre',null);
  }
  scrollToTopInstant();
}

function scrollToTopInstant(){
  // Anlık kaydırma — smooth iOS Safari'de yer yer atlanabiliyor, kesin davranış için instant
  try{ window.scrollTo(0,0); }catch(_){}
  try{ document.documentElement.scrollTop=0; }catch(_){}
  try{ document.body.scrollTop=0; }catch(_){}
  // Aktif ekranın kendi scroll'u varsa onu da sıfırla
  const active=document.querySelector('.screen.on');
  if(active) active.scrollTop=0;
}

// ══════════════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════════════
buildDesignLayout();
loadTheme();
loadFromStorage();
