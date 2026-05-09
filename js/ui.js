const LANG = {
    current: 'bm',
    bm: {
        calcDone: '✅ Pengiraan selesai!', energyDone: '✅ Tenaga dikira!', dialPass: '✅ LULUS!', dialFail: '❌ GAGAL!', mdDone: '✅ MD dikira!',
        errConstActive: '❌ Meter Constant Active mesti > 0', errCTPrimary: '❌ CT Primary mesti > 0', errCTSecondary: '❌ CT Secondary mesti > 0',
        errVTPrimary: '❌ VT Primary mesti > 0', errVTSecondary: '❌ VT Secondary mesti > 0',
        warnCTSwap: '⚠️ CT Secondary > Primary?', errPulseCount: '❌ Jumlah Pulse mesti ≥ 0', errPulseConst: '❌ Pulse Constant mesti > 0',
        errPulseCountWS: '❌ Pulse Count (Working Standard) mesti ≥ 0', errStart: '❌ Sila masukkan Bacaan Mula', errEnd: '❌ Sila masukkan Bacaan Akhir',
        errEndLess: '❌ Bacaan Akhir mesti > Bacaan Mula', errRealPulse: '❌ Real Pulse mesti ≥ 0',
        resetDone: '🔄 Semua dikosongkan!', historyCleared: '🗑️ Sejarah dipadamkan!', copied: '📋 Disalin!',
        historyEmpty: 'Tiada rekod'
    },
    en: {
        calcDone: '✅ Calculation complete!', energyDone: '✅ Energy calculated!', dialPass: '✅ PASS!', dialFail: '❌ FAIL!', mdDone: '✅ MD calculated!',
        errConstActive: '❌ Meter Constant Active must be > 0', errCTPrimary: '❌ CT Primary must be > 0', errCTSecondary: '❌ CT Secondary must be > 0',
        errVTPrimary: '❌ VT Primary must be > 0', errVTSecondary: '❌ VT Secondary must be > 0',
        warnCTSwap: '⚠️ CT Secondary > Primary?', errPulseCount: '❌ Pulse Count must be ≥ 0', errPulseConst: '❌ Pulse Constant must be > 0',
        errPulseCountWS: '❌ Pulse Count (Working Standard) must be ≥ 0', errStart: '❌ Please enter Start Reading', errEnd: '❌ Please enter End Reading',
        errEndLess: '❌ End Reading must be > Start Reading', errRealPulse: '❌ Real Pulse must be ≥ 0',
        resetDone: '🔄 All cleared!', historyCleared: '🗑️ History deleted!', copied: '📋 Copied!',
        historyEmpty: 'No records'
    }
};

const UIManager = {
    currentMainTab: 'calculatorPanel',

    switchMainTab(panelId) {
        this.currentMainTab = panelId;
        document.querySelectorAll('.main-tab').forEach(tab => tab.classList.toggle('active', tab.dataset.panel === panelId));
        ['calculatorPanel','calcResultsPanel','energyPanel','dialTestPanel','demandPanel','historyPanel','referencePanel'].forEach(id => {
            const el = document.getElementById(id); if (el) el.style.display = 'none';
        });
        const target = document.getElementById(panelId);
        if (target) { target.style.display = 'block'; target.scrollIntoView({ behavior: 'smooth' }); }
        if (panelId === 'calculatorPanel') document.getElementById('calculatorPanel').style.display = 'block';
        if (panelId === 'historyPanel') Calculator.renderHistory();
        if (navigator.vibrate) navigator.vibrate(8);
    },

    switchCalcMode(mode) {
        Calculator.currentMode = mode;
        document.querySelectorAll('.mode-tab').forEach(tab => tab.classList.toggle('active', tab.dataset.mode === mode));
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
        if (navigator.vibrate) navigator.vibrate(8);
    },

    toggleLanguage() {
        LANG.current = LANG.current === 'bm' ? 'en' : 'bm';
        document.getElementById('btnLang').textContent = LANG.current === 'bm' ? '🇲🇾' : '🇬🇧';
    },

    resetAll() {
        Calculator.currentMode = 'direct'; this.switchCalcMode('direct'); this.switchMainTab('calculatorPanel');
        document.getElementById('calcResultsPanel').style.display = 'none';
        document.getElementById('energyResult').style.display = 'none';
        document.getElementById('dialResult').style.display = 'none';
        document.getElementById('demandResult').style.display = 'none';
        this.showToast(LANG[LANG.current].resetDone, 'success');
        document.getElementById('calculatorPanel').scrollIntoView({ behavior: 'smooth' });
    },

    clearHistory() { if (confirm('Padam semua?')) { Calculator.history = []; Calculator.saveHistory(); Calculator.renderHistory(); this.showToast(LANG[LANG.current].historyCleared, 'success'); } },
    copyAllHistory() { navigator.clipboard.writeText(Calculator.exportHistoryCSV()).then(() => this.showToast(LANG[LANG.current].copied, 'success')); },
    exportCSV() {
        const blob = new Blob([Calculator.exportHistoryCSV()], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'metercalc_history.csv'; a.click();
        URL.revokeObjectURL(url);
        this.showToast('📥 CSV dimuat turun!', 'success');
    },

    _toastTimeout: null,
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast'); toast.textContent = message; toast.className = `toast ${type} show`;
        clearTimeout(this._toastTimeout);
        this._toastTimeout = setTimeout(() => { toast.classList.remove('show'); toast.className = 'toast'; }, 2000);
    },

    toggleTheme() {
        document.body.classList.toggle('light-theme');
        const isLight = document.body.classList.contains('light-theme');
        const icon = document.getElementById('themeIcon');
        icon.innerHTML = isLight ? '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>' : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
        localStorage.setItem('metercalc_theme', isLight ? 'light' : 'dark');
    },
    loadTheme() {
        if (localStorage.getItem('metercalc_theme') === 'light') {
            document.body.classList.add('light-theme');
            document.getElementById('themeIcon').innerHTML = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
        }
    },
    shareCalculatorResult() {
        const last = Calculator.history.find(h => h.type === 'calculator');
        if (!last) { this.showToast('Tiada keputusan', 'error'); return; }
        const text = `📊 MeterCalc Pro\n⚡ ${last.mode.toUpperCase()}\n📏 M = ${Calculator.formatNumber(last.totalMultiplier)}\n🔌 Primary = ${Calculator.formatNumber(last.primaryActive)} imp/kWh\n📋 ${last.supply} | Cl.${last.meterClass}`;
        if (navigator.share) navigator.share({ title: 'MeterCalc Pro', text }).catch(() => {});
        else navigator.clipboard.writeText(text).then(() => this.showToast(LANG[LANG.current].copied, 'success'));
    }
};
