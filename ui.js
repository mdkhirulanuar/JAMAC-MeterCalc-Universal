const LANG_DATA = {
    bm: {
        calcDone: '✅ Pengiraan selesai!', energyDone: '✅ Tenaga dikira!', dialPass: '✅ LULUS!', dialFail: '❌ GAGAL!', mdDone: '✅ MD dikira!',
        errConstActive: '❌ Meter Constant Active mesti > 0', errCTPrimary: '❌ CT Primary mesti > 0', errCTSecondary: '❌ CT Secondary mesti > 0',
        errVTPrimary: '❌ VT Primary mesti > 0', errVTSecondary: '❌ VT Secondary mesti > 0',
        warnCTSwap: '⚠️ CT Secondary > Primary?', errPulseCount: '❌ Pulse Count mesti ≥ 0', errPulseConst: '❌ Meter Constant mesti > 0',
        errPulseCountWS: '❌ Pulse Count (Reference Meter) mesti ≥ 0', errStart: '❌ Sila masukkan Start Reading', errEnd: '❌ Sila masukkan End Reading',
        errEndLess: '❌ End Reading mesti > Start Reading', errRealPulse: '❌ Test Pulse mesti ≥ 0',
        resetDone: '🔄 Semua dikosongkan!', historyCleared: '🗑️ Sejarah dipadamkan!', copied: '📋 Disalin!', csvDone: '📥 CSV dimuat turun!',
        noResult: 'Tiada keputusan', confirmClear: 'Padam semua sejarah?'
    },
    en: {
        calcDone: '✅ Calculation complete!', energyDone: '✅ Energy calculated!', dialPass: '✅ PASS!', dialFail: '❌ FAIL!', mdDone: '✅ MD calculated!',
        errConstActive: '❌ Meter Constant Active must be > 0', errCTPrimary: '❌ CT Primary must be > 0', errCTSecondary: '❌ CT Secondary must be > 0',
        errVTPrimary: '❌ VT Primary must be > 0', errVTSecondary: '❌ VT Secondary must be > 0',
        warnCTSwap: '⚠️ CT Secondary > Primary?', errPulseCount: '❌ Pulse Count must be ≥ 0', errPulseConst: '❌ Meter Constant must be > 0',
        errPulseCountWS: '❌ Pulse Count (Reference Meter) must be ≥ 0', errStart: '❌ Please enter Start Reading', errEnd: '❌ Please enter End Reading',
        errEndLess: '❌ End Reading must be > Start Reading', errRealPulse: '❌ Test Pulse must be ≥ 0',
        resetDone: '🔄 All cleared!', historyCleared: '🗑️ History deleted!', copied: '📋 Copied!', csvDone: '📥 CSV downloaded!',
        noResult: 'No results', confirmClear: 'Delete all history?'
    }
};

const UIManager = {
    currentMainTab: 'calculatorPanel',
    currentLang: 'bm',

    toggleLanguage() {
        this.currentLang = this.currentLang === 'bm' ? 'en' : 'bm';
        document.getElementById('btnLang').textContent = this.currentLang === 'bm' ? '🇲🇾' : '🇬🇧';
        this.updateAllLabels();
    },

    t(key) { return LANG_DATA[this.currentLang][key] || key; },

    updateAllLabels() {
        const lang = this.currentLang;

        const tabLabels = {
            'calculatorPanel': lang === 'bm' ? 'Kalkulator' : 'Calculator',
            'energyPanel': lang === 'bm' ? 'Tenaga' : 'Energy',
            'accuracyPanel': 'Accuracy Test',
            'demandPanel': 'MD',
            'historyPanel': lang === 'bm' ? 'Sejarah' : 'History',
            'referencePanel': lang === 'bm' ? 'Rujukan' : 'Reference'
        };

        document.querySelectorAll('.main-tab').forEach(tab => {
            const panelId = tab.dataset.panel;
            const labelSpan = tab.querySelector('.main-tab-label');
            if (labelSpan && tabLabels[panelId]) labelSpan.textContent = tabLabels[panelId];
        });

        const titles = {
            'calculatorPanel': lang === 'bm' ? '📋 Parameter Input' : '📋 Parameter Input',
            'energyPanel': lang === 'bm' ? '🔢 Pulse → Tenaga' : '🔢 Pulse → Energy',
            'accuracyPanel': '📊 Accuracy Test',
            'demandPanel': lang === 'bm' ? '🕐 Maximum Demand' : '🕐 Maximum Demand',
            'historyPanel': lang === 'bm' ? '📋 Sejarah' : '📋 History',
            'referencePanel': lang === 'bm' ? '📚 Rujukan Pantas' : '📚 Quick Reference'
        };

        Object.keys(titles).forEach(panelId => {
            const panel = document.getElementById(panelId);
            if (!panel) return;
            const h2 = panel.querySelector('.panel-header h2');
            if (h2 && titles[panelId]) h2.textContent = titles[panelId];
            const desc = panel.querySelector('.panel-desc');
            if (desc) {
                if (panelId === 'energyPanel') desc.textContent = lang === 'bm' ? 'Kira tenaga berdasarkan jumlah pulse diterima.' : 'Calculate energy from received pulses.';
                if (panelId === 'demandPanel') desc.textContent = lang === 'bm' ? 'Kira MD berdasarkan bacaan pulse dalam 30 minit.' : 'Calculate MD from 30-minute pulse reading.';
            }
        });

        const resultsPanel = document.getElementById('calcResultsPanel');
        if (resultsPanel) {
            const resultH2 = resultsPanel.querySelector('.panel-header h2');
            if (resultH2) resultH2.textContent = lang === 'bm' ? '📊 Keputusan' : '📊 Results';
        }

        const calcBtn = document.querySelector('#calculatorPanel .btn-calculate span');
        if (calcBtn) calcBtn.textContent = lang === 'bm' ? '🔢 KIRA PARAMETER' : '🔢 CALCULATE';

        const energyBtn = document.querySelector('#energyPanel .btn-calculate span');
        if (energyBtn) energyBtn.textContent = lang === 'bm' ? '🔢 KIRA TENAGA' : '🔢 CALCULATE ENERGY';

        const dialBtn = document.querySelector('#accuracyPanel .btn-calculate span');
        if (dialBtn) dialBtn.textContent = '📊 KIRA';

        const mdBtn = document.querySelector('#demandPanel .btn-calculate span');
        if (mdBtn) mdBtn.textContent = lang === 'bm' ? '🕐 KIRA MD' : '🕐 CALCULATE MD';

        const energyResultLabel = document.querySelector('#energyResult .calc-result-label');
        if (energyResultLabel) energyResultLabel.textContent = lang === 'bm' ? 'Tenaga' : 'Energy';

        const dialResultLabel = document.querySelector('#dialResult .calc-result-label');
        if (dialResultLabel) dialResultLabel.textContent = lang === 'bm' ? 'Keputusan' : 'Results';

        const mdResultLabel = document.querySelector('#demandResult .calc-result-label');
        if (mdResultLabel) mdResultLabel.textContent = 'Maximum Demand';

        const emptyState = document.querySelector('#historyList .empty-state p');
        if (emptyState) emptyState.textContent = lang === 'bm' ? 'Tiada rekod' : 'No records';

        const refTitles = document.querySelectorAll('#referencePanel .ref-title');
        if (refTitles.length >= 5) {
            refTitles[0].textContent = 'Standard CT Ratios';
            refTitles[1].textContent = 'Standard VT Ratios';
            refTitles[2].textContent = 'Standard Meter Constants';
            refTitles[3].textContent = 'Class Limits';
            refTitles[4].textContent = lang === 'bm' ? '📏 Decimal Point Rules' : '📏 Decimal Point Rules';
        }

        if (this.currentMainTab === 'historyPanel') Calculator.renderHistory();
    },

    switchMainTab(panelId) {
        this.currentMainTab = panelId;
        document.querySelectorAll('.main-tab').forEach(tab => tab.classList.toggle('active', tab.dataset.panel === panelId));
        ['calculatorPanel','calcResultsPanel','energyPanel','accuracyPanel','demandPanel','historyPanel','referencePanel'].forEach(id => {
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
        document.querySelectorAll('#calculatorPanel .mode-tab').forEach(tab => tab.classList.toggle('active', tab.dataset.mode === mode));
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

    resetAll() {
        Calculator.currentMode = 'direct'; this.switchCalcMode('direct'); this.switchMainTab('calculatorPanel');
        document.getElementById('calcResultsPanel').style.display = 'none';
        document.getElementById('energyResult').style.display = 'none';
        document.getElementById('dialResult').style.display = 'none';
        document.getElementById('demandResult').style.display = 'none';
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
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast'); toast.textContent = message; toast.className = `toast ${type} show`;
        clearTimeout(this._toastTimeout);
        this._toastTimeout = setTimeout(() => { toast.classList.remove('show'); toast.className = 'toast'; }, 2000);
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
    },

    shareCalculatorResult() {
        const last = Calculator.history.find(h => h.type === 'calculator');
        if (!last) { this.showToast(this.t('noResult'), 'error'); return; }
        const text = `📊 MeterCalc Pro\n⚡ ${last.mode.toUpperCase()}\n📏 M = ${Calculator.formatNumber(last.totalMultiplier)}\n🔌 Primary = ${Calculator.formatNumber(last.primaryActive)} imp/kWh\n📋 ${last.supply} | Cl.${last.meterClass}`;
        if (navigator.share) navigator.share({ title: 'MeterCalc Pro', text }).catch(() => {});
        else navigator.clipboard.writeText(text).then(() => this.showToast(this.t('copied'), 'success'));
    }
};
