const LANG_DATA = {
    bm: {
        calcDone: '✅ Pengiraan selesai!', energyDone: '✅ Tenaga dikira!', dialPass: '✅ LULUS!', dialFail: '❌ GAGAL!', mdDone: '✅ MD dikira!',
        errConstActive: '❌ Meter Constant Active mesti > 0', errCTPrimary: '❌ CT Primary mesti > 0', errCTSecondary: '❌ CT Secondary mesti > 0',
        errVTPrimary: '❌ VT Primary mesti > 0', errVTSecondary: '❌ VT Secondary mesti > 0',
        warnCTSwap: '⚠️ CT Secondary > Primary?', warnVTSwap: '⚠️ VT Secondary > Primary?', errMultiplier: '❌ Multiplier mesti > 0', errEnergyValue: '❌ Nilai tenaga mesti ≥ 0', errPulseCount: '❌ Pulse Count mesti ≥ 0', errPulseConst: '❌ Meter Constant mesti > 0',
        errPulseCountWS: '❌ Pulse Count (Reference Meter) mesti ≥ 0', errStart: '❌ Sila masukkan Start Reading', errEnd: '❌ Sila masukkan End Reading',
        errEndLess: '❌ End Reading mesti > Start Reading', errRealPulse: '❌ Test Pulse mesti ≥ 0',
        resetDone: '🔄 Semua input dikembalikan kepada default!', historyCleared: '🗑️ Sejarah dipadamkan!', copied: '📋 Disalin!', csvDone: '📥 CSV dimuat turun!',
        noResult: 'Tiada keputusan', confirmClear: 'Padam semua sejarah?', recordDeleted: '🗑️ Rekod dipadam',
        supplyType: 'Jenis Supply', meterClass: 'Class Meter', energyUnit: 'Unit Tenaga',
        supply1P2W: '1 Fasa (1P2W)', supply3P3W: '3 Fasa (3P3W)', supply3P4W: '3 Fasa (3P4W)',
        btnCalc: '🔢 KIRA PARAMETER', btnEnergy: '🔢 KIRA TENAGA', btnDial: '📊 KIRA', btnMD: '🕐 KIRA MD',
        energyResultLabel: 'Tenaga', dialResultLabel: 'Keputusan',
        historyEmpty: 'Tiada rekod', historyCopy: '📋 Salin', historyClear: 'Padam Semua',
        classLimitHeader: 'Had', decimalHeader: 'Julat', multiplierHeader: 'Jenis Meter',
        mDomestik: 'Domestik (direct)', mKedai: 'Kedai (CT)', mKilangKecil: 'Kilang kecil (CT)',
        mKilangBesar: 'Kilang besar (CT)', mHV: 'HV Consumer (CT+VT)', mData: 'Data Center (CT+VT)',
        mTiada: 'Tiada',
        multiplierFooter: '💡 <strong>Formula:</strong> M = (CT Primary ÷ CT Secondary) × (VT Primary ÷ VT Secondary)<br>💡 <strong>Guna tab Kalkulator</strong> untuk kira M bagi CT/VT lain',
        footerText: 'MeterCalc Pro v3.0 | Dibangunkan oleh <strong>Khirul Anuar</strong> | Untuk <strong>JAMAC Metering Sdn. Bhd.</strong>'
    },
    en: {
        calcDone: '✅ Calculation complete!', energyDone: '✅ Energy calculated!', dialPass: '✅ PASS!', dialFail: '❌ FAIL!', mdDone: '✅ MD calculated!',
        errConstActive: '❌ Meter Constant Active must be > 0', errCTPrimary: '❌ CT Primary must be > 0', errCTSecondary: '❌ CT Secondary must be > 0',
        errVTPrimary: '❌ VT Primary must be > 0', errVTSecondary: '❌ VT Secondary must be > 0',
        warnCTSwap: '⚠️ CT Secondary > Primary?', warnVTSwap: '⚠️ VT Secondary > Primary?', errMultiplier: '❌ Multiplier must be > 0', errEnergyValue: '❌ Energy value must be ≥ 0', errPulseCount: '❌ Pulse Count must be ≥ 0', errPulseConst: '❌ Meter Constant must be > 0',
        errPulseCountWS: '❌ Pulse Count (Reference Meter) must be ≥ 0', errStart: '❌ Please enter Start Reading', errEnd: '❌ Please enter End Reading',
        errEndLess: '❌ End Reading must be > Start Reading', errRealPulse: '❌ Test Pulse must be ≥ 0',
        resetDone: '🔄 All inputs reset to default!', historyCleared: '🗑️ History deleted!', copied: '📋 Copied!', csvDone: '📥 CSV downloaded!',
        noResult: 'No results', confirmClear: 'Delete all history?', recordDeleted: '🗑️ Record deleted',
        supplyType: 'Supply Type', meterClass: 'Meter Class', energyUnit: 'Energy Unit',
        supply1P2W: '1 Phase (1P2W)', supply3P3W: '3 Phase (3P3W)', supply3P4W: '3 Phase (3P4W)',
        btnCalc: '🔢 CALCULATE', btnEnergy: '🔢 CALCULATE ENERGY', btnDial: '📊 CALCULATE', btnMD: '🕐 CALCULATE MD',
        energyResultLabel: 'Energy', dialResultLabel: 'Results',
        historyEmpty: 'No records', historyCopy: '📋 Copy', historyClear: 'Clear All',
        classLimitHeader: 'Limit', decimalHeader: 'Range', multiplierHeader: 'Meter Type',
        mDomestik: 'Domestic (direct)', mKedai: 'Shop (CT)', mKilangKecil: 'Small Factory (CT)',
        mKilangBesar: 'Large Factory (CT)', mHV: 'HV Consumer (CT+VT)', mData: 'Data Center (CT+VT)',
        mTiada: 'None',
        multiplierFooter: '💡 <strong>Formula:</strong> M = (CT Primary ÷ CT Secondary) × (VT Primary ÷ VT Secondary)<br>💡 <strong>Use Calculator tab</strong> to calculate M for other CT/VT',
        footerText: 'MeterCalc Pro v3.0 | Developed by <strong>Khirul Anuar</strong> | For <strong>JAMAC Metering Sdn. Bhd.</strong>'
    }
};

const UIManager = {
    currentMainTab: 'calculatorPanel',
    currentLang: 'bm',

    toggleLanguage() {
        this.currentLang = this.currentLang === 'bm' ? 'en' : 'bm';
        localStorage.setItem('metercalc_lang', this.currentLang);
        document.getElementById('btnLang').textContent = this.currentLang === 'bm' ? '🇲🇾' : '🇬🇧';
        this.loadLanguage();
        this.updateAllLabels();
        if (typeof this.updateEnergyMode === 'function') this.updateEnergyMode();
    },

    t(key) { return LANG_DATA[this.currentLang][key] || key; },

    updateAllLabels() {
        const lang = this.currentLang;
        const t = LANG_DATA[lang];
        const year = new Date().getFullYear();

        // ============ TAB LABELS ============
        document.querySelectorAll('.main-tab').forEach(tab => {
            const lbl = tab.querySelector('.main-tab-label');
            if (!lbl) return;
            const map = { calculatorPanel: lang === 'bm' ? 'Kalkulator' : 'Calculator', energyPanel: lang === 'bm' ? 'Tenaga' : 'Energy', accuracyPanel: 'Accuracy Test', demandPanel: 'MD', historyPanel: lang === 'bm' ? 'Sejarah' : 'History', referencePanel: lang === 'bm' ? 'Rujukan' : 'Reference' };
            if (map[tab.dataset.panel]) lbl.textContent = map[tab.dataset.panel];
        });

        // ============ PANEL TITLES ============
        const setTitle = (id, bm, en) => { const p = document.getElementById(id); if (p) { const h = p.querySelector('.panel-header h2'); if (h) h.textContent = lang === 'bm' ? bm : en; } };
        setTitle('calculatorPanel', '📋 Parameter Input', '📋 Parameter Input');
        setTitle('energyPanel', '🔢 Pulse ↔ Tenaga', '🔢 Pulse ↔ Energy');
        setTitle('accuracyPanel', '📊 Accuracy Test', '📊 Accuracy Test');
        setTitle('demandPanel', '🕐 Maximum Demand', '🕐 Maximum Demand');
        setTitle('historyPanel', '📋 Sejarah', '📋 History');
        setTitle('referencePanel', '📚 Rujukan Pantas', '📚 Quick Reference');

        const energyDesc = document.querySelector('#energyPanel .panel-desc');
        if (energyDesc) energyDesc.textContent = lang === 'bm' ? 'Kira Pulse → Tenaga atau Tenaga → Pulse.' : 'Calculate Pulse → Energy or Energy → Pulse.';
        const mdDesc = document.querySelector('#demandPanel .panel-desc');
        if (mdDesc) mdDesc.textContent = lang === 'bm' ? 'Kira MD berdasarkan bacaan pulse dalam 30 minit.' : 'Calculate MD from 30-minute pulse reading.';

        const rh = document.querySelector('#calcResultsPanel .panel-header h2');
        if (rh) rh.textContent = lang === 'bm' ? '📊 Keputusan' : '📊 Results';

        // ============ BUTTONS ============
        const btnCalc = document.querySelector('#calculatorPanel .btn-calculate span');
        if (btnCalc) btnCalc.textContent = t.btnCalc;
        const btnEnergy = document.querySelector('#energyPanel .btn-calculate span');
        if (btnEnergy) btnEnergy.textContent = t.btnEnergy;
        const btnDial = document.querySelector('#accuracyPanel .btn-calculate span');
        if (btnDial) btnDial.textContent = t.btnDial;
        const btnMD = document.querySelector('#demandPanel .btn-calculate span');
        if (btnMD) btnMD.textContent = t.btnMD;

        // ============ RESULT LABELS ============
        const erl = document.querySelector('#energyResult .calc-result-label');
        if (erl) erl.textContent = t.energyResultLabel;
        const drl = document.querySelector('#dialResult .calc-result-label');
        if (drl) drl.textContent = t.dialResultLabel;

        // ============ INPUT LABELS - DIRECT ID ============
        const setLabel = (id, key) => { const el = document.getElementById(id); if (el) el.textContent = t[key]; };
        setLabel('lblSupplyType', 'supplyType');
        setLabel('lblMeterClass', 'meterClass');
        setLabel('lblEnergyUnit', 'energyUnit');

        // ============ DROPDOWN OPTIONS ============
        const ss = document.getElementById('supplyType');
        if (ss) { ss.options[0].textContent = t.supply1P2W; ss.options[1].textContent = t.supply3P3W; ss.options[2].textContent = t.supply3P4W; }

        // ============ HISTORY BUTTONS ============
        const hb = document.querySelectorAll('#historyPanel .btn-text');
        if (hb.length >= 3) { hb[0].textContent = t.historyCopy; hb[2].textContent = t.historyClear; }

        // ============ REFERENCE PANEL ============
        const refTitles = document.querySelectorAll('#referencePanel .ref-title');
        if (refTitles.length >= 6) {
            refTitles[0].textContent = 'Standard CT Ratios';
            refTitles[1].textContent = 'Standard VT Ratios';
            refTitles[2].textContent = 'Standard Meter Constants';
            refTitles[3].textContent = 'Class Limits';
            refTitles[4].textContent = '📏 Decimal Point Rules';
            refTitles[5].textContent = lang === 'bm' ? '📊 Contoh Nilai M (Multiplier)' : '📊 Multiplier (M) Examples';
        }

        const refTables = document.querySelectorAll('#referencePanel .ref-table');
        if (refTables[0]) { const h = refTables[0].querySelectorAll('th'); if (h.length >= 2) h[1].textContent = t.classLimitHeader; }
        if (refTables[1]) { const h = refTables[1].querySelectorAll('th'); if (h.length >= 2) h[0].textContent = t.decimalHeader; }
        if (refTables[2]) {
            const h = refTables[2].querySelectorAll('th'); if (h.length >= 4) h[0].textContent = t.multiplierHeader;
            const rows = refTables[2].querySelectorAll('tr');
            const keys = ['mDomestik','mKedai','mKilangKecil','mKilangBesar','mHV','mData'];
            for (let i = 1; i <= 6; i++) { if (rows[i]) { const c = rows[i].querySelector('td'); if (c) c.innerHTML = '<strong>' + t[keys[i-1]] + '</strong>'; } }
            refTables[2].querySelectorAll('td').forEach(td => { if (td.textContent.trim() === 'Tiada' && lang === 'en') td.textContent = 'None'; else if (td.textContent.trim() === 'None' && lang === 'bm') td.textContent = 'Tiada'; });
        }

        const refSec = document.querySelectorAll('#referencePanel .ref-section');
        if (refSec.length >= 6) { const lp = refSec[5].querySelector('p:last-child'); if (lp) lp.innerHTML = t.multiplierFooter; }

        // ============ FOOTER ============
        const footer = document.querySelector('[data-lang="footerText"]');
        if (footer) footer.innerHTML = t.footerText.replace('2025', year);

        // ============ HISTORY RENDER ============
        Calculator.renderHistory();
    },

    switchMainTab(panelId) {
        this.currentMainTab = panelId;
        document.querySelectorAll('.main-tab').forEach(t => {
            const active = t.dataset.panel === panelId;
            t.classList.toggle('active', active);
            t.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        ['calculatorPanel','calcResultsPanel','energyPanel','accuracyPanel','demandPanel','historyPanel','referencePanel'].forEach(id => {
            const el = document.getElementById(id); if (el) el.style.display = 'none';
        });
        const target = document.getElementById(panelId);
        if (target) { target.style.display = 'block'; target.scrollIntoView({ behavior: 'smooth' }); }
        if (panelId === 'calculatorPanel') document.getElementById('calculatorPanel').style.display = 'block';
        if (panelId === 'historyPanel') Calculator.renderHistory();
    },

    switchCalcMode(mode) {
        Calculator.currentMode = mode;
        document.querySelectorAll('#calculatorPanel .mode-tab').forEach(t => t.classList.toggle('active', t.dataset.mode === mode));
        ['ctSectionDivider','ctInputSection','ctLiveRatio','vtSectionDivider','vtInputSection','vtLiveRatio'].forEach(id => {
            const el = document.getElementById(id); if (el) el.style.display = 'none';
        });
        if (mode === 'ct' || mode === 'ctvt') {
            document.getElementById('ctSectionDivider').style.display = 'flex';
            document.getElementById('ctInputSection').style.display = 'grid';
            document.getElementById('ctLiveRatio').style.display = 'flex';
        }
        if (mode === 'ctvt') {
            document.getElementById('vtSectionDivider').style.display = 'flex';
            document.getElementById('vtInputSection').style.display = 'grid';
            document.getElementById('vtLiveRatio').style.display = 'flex';
        }
        document.getElementById('calcResultsPanel').style.display = 'none';
    },


    loadLanguage() {
        const saved = localStorage.getItem('metercalc_lang');
        if (saved === 'bm' || saved === 'en') this.currentLang = saved;
        const btn = document.getElementById('btnLang');
        if (btn) btn.textContent = this.currentLang === 'bm' ? '🇲🇾' : '🇬🇧';
    },

    updateEnergyMode() {
        const mode = document.getElementById('energyMode');
        const pulseBlock = document.getElementById('energyPulseCountBlock');
        const energyBlock = document.getElementById('energyInputBlock');
        const result = document.getElementById('energyResult');
        if (!mode || !pulseBlock || !energyBlock) return;
        const isEnergyToPulse = mode.value === 'energyToPulse';
        pulseBlock.style.display = isEnergyToPulse ? 'none' : 'block';
        energyBlock.style.display = isEnergyToPulse ? 'block' : 'none';
        if (result) result.style.display = 'none';
    },

    resetAll() {
        Calculator.currentMode = 'direct';
        this.switchCalcMode('direct');
        this.switchMainTab('calculatorPanel');
        document.querySelectorAll('input[type="number"]').forEach(input => { input.value = input.defaultValue || ''; input.classList.remove('input-error'); input.setCustomValidity(''); });
        document.querySelectorAll('select').forEach(select => { select.selectedIndex = Array.from(select.options).findIndex(o => o.defaultSelected); if (select.selectedIndex < 0) select.selectedIndex = 0; });
        if (typeof this.updateEnergyMode === 'function') this.updateEnergyMode();
        ['calcResultsPanel','energyResult','dialResult','demandResult'].forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });
        this.showToast(this.t('resetDone'), 'success');
    },

    clearHistory() { if (confirm(this.t('confirmClear'))) { Calculator.history = []; Calculator.saveHistory(); Calculator.renderHistory(); this.showToast(this.t('historyCleared'), 'success'); } },
    copyAllHistory() { navigator.clipboard.writeText(Calculator.exportHistoryCSV()).then(() => this.showToast(this.t('copied'), 'success')); },
    exportCSV() {
        const blob = new Blob([Calculator.exportHistoryCSV()], { type: 'text/csv' });
        const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'metercalc_history.csv'; a.click();
        URL.revokeObjectURL(url); this.showToast(this.t('csvDone'), 'success');
    },

    _toastTimeout: null,
    showToast(msg, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = msg;
        toast.className = `toast ${type}`;
        toast.offsetHeight;
        toast.classList.add('show');
        clearTimeout(this._toastTimeout);
        this._toastTimeout = setTimeout(() => { toast.classList.remove('show'); }, 2000);
    },

    toggleTheme() {
        document.body.classList.toggle('light-theme');
        const icon = document.getElementById('themeIcon');
        icon.innerHTML = document.body.classList.contains('light-theme')
            ? '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>'
            : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
        localStorage.setItem('metercalc_theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
    },

    loadTheme() {
        if (localStorage.getItem('metercalc_theme') === 'light') {
            document.body.classList.add('light-theme');
            document.getElementById('themeIcon').innerHTML = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
        }
        this.loadLanguage();
        this.updateAllLabels();
        if (typeof this.updateEnergyMode === 'function') this.updateEnergyMode();
    },

    shareCalculatorResult() {
        const last = Calculator.history.find(h => h.type === 'calculator');
        if (!last) { this.showToast(this.t('noResult'), 'error'); return; }
        const text = `📊 MeterCalc Pro\n⚡ ${last.mode.toUpperCase()}\n📏 M = ${Calculator.formatNumber(last.totalMultiplier)}\n🔌 Primary = ${Calculator.formatNumber(last.primaryActive)} imp/kWh\n📋 ${last.supply} | Cl.${last.meterClass}`;
        if (navigator.share) navigator.share({ title: 'MeterCalc Pro', text }).catch(() => {});
        else navigator.clipboard.writeText(text).then(() => this.showToast(this.t('copied'), 'success'));
    }
};
