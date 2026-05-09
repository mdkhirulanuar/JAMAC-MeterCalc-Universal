/**
 * MeterCalc Pro - UI Manager
 */

const UIManager = {
    currentMainTab: 'calculatorPanel',
    currentAccuracyMode: 'manual',

    switchMainTab(panelId) {
        this.currentMainTab = panelId;
        document.querySelectorAll('.main-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.panel === panelId);
        });
        const panels = ['calculatorPanel', 'calcResultsPanel', 'energyPanel', 'accuracyPanel', 'demandPanel', 'historyPanel', 'referencePanel'];
        panels.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
        const targetPanel = document.getElementById(panelId);
        if (targetPanel) {
            targetPanel.style.display = 'block';
            targetPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        if (panelId === 'calculatorPanel') {
            const calcPanel = document.getElementById('calculatorPanel');
            if (calcPanel) calcPanel.style.display = 'block';
        }
        if (panelId === 'historyPanel') Calculator.renderHistory();
        if (navigator.vibrate) navigator.vibrate(8);
    },

    switchCalcMode(mode) {
        Calculator.currentMode = mode;
        document.querySelectorAll('.mode-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.mode === mode);
        });
        const ctDivider = document.getElementById('ctSectionDivider');
        const ctInputs = document.getElementById('ctInputSection');
        const ctLiveRatio = document.getElementById('ctLiveRatio');
        const vtDivider = document.getElementById('vtSectionDivider');
        const vtInputs = document.getElementById('vtInputSection');
        const vtLiveRatio = document.getElementById('vtLiveRatio');
        [ctDivider, ctInputs, ctLiveRatio, vtDivider, vtInputs, vtLiveRatio].forEach(el => {
            if (el) el.style.display = 'none';
        });
        switch (mode) {
            case 'direct': break;
            case 'ct':
                if (ctDivider) ctDivider.style.display = 'flex';
                if (ctInputs) ctInputs.style.display = 'grid';
                if (ctLiveRatio) ctLiveRatio.style.display = 'flex';
                break;
            case 'ctvt':
                if (ctDivider) ctDivider.style.display = 'flex';
                if (ctInputs) ctInputs.style.display = 'grid';
                if (ctLiveRatio) ctLiveRatio.style.display = 'flex';
                if (vtDivider) vtDivider.style.display = 'flex';
                if (vtInputs) vtInputs.style.display = 'grid';
                if (vtLiveRatio) vtLiveRatio.style.display = 'flex';
                break;
        }
        document.getElementById('calcResultsPanel').style.display = 'none';
        Calculator.updateLiveRatios();
        if (navigator.vibrate) navigator.vibrate(8);
    },

    switchAccuracyMode(mode) {
        this.currentAccuracyMode = mode;
        Calculator.currentAccuracyMode = mode;
        document.getElementById('toggleAccManual').classList.toggle('active', mode === 'manual');
        document.getElementById('toggleAccPulse').classList.toggle('active', mode === 'pulse');
        document.getElementById('accManualSection').style.display = mode === 'manual' ? 'block' : 'none';
        document.getElementById('accPulseSection').style.display = mode === 'pulse' ? 'block' : 'none';
        document.getElementById('accuracyResult').style.display = 'none';
        document.getElementById('accLiveEnergy').style.display = 'none';
        Calculator.attachAccPulseListeners();
        if (navigator.vibrate) navigator.vibrate(8);
    },

    resetAll() {
        Calculator.currentMode = 'direct';
        this.switchCalcMode('direct');
        this.switchMainTab('calculatorPanel');
        document.getElementById('meterConstActive').value = '1000';
        document.getElementById('meterConstReactive').value = '1000';
        document.getElementById('supplyType').value = '3P4W';
        document.getElementById('meterClass').value = '1';
        document.getElementById('ctPrimary').value = '';
        document.getElementById('ctSecondary').value = '5';
        document.getElementById('vtPrimary').value = '';
        document.getElementById('vtSecondary').value = '110';
        document.getElementById('energyPulseCount').value = '';
        document.getElementById('energyPulseConst').value = '';
        document.getElementById('energyMultiplier').value = '1';
        document.getElementById('energyResult').style.display = 'none';
        document.getElementById('accReference').value = '';
        document.getElementById('accPulseCount').value = '';
        document.getElementById('accPulseConst').value = '';
        document.getElementById('accPulseMultiplier').value = '1';
        document.getElementById('accMeterReading').value = '';
        document.getElementById('accMeterClass').value = '1';
        document.getElementById('accuracyResult').style.display = 'none';
        document.getElementById('demandPulseCount').value = '';
        document.getElementById('demandPulseConst').value = '';
        document.getElementById('demandMultiplier').value = '1';
        document.getElementById('demandResult').style.display = 'none';
        document.getElementById('calcResultsPanel').style.display = 'none';
        Calculator.updateLiveRatios();
        document.getElementById('calculatorPanel').scrollIntoView({ behavior: 'smooth' });
        this.showToast('🔄 Semua dikosongkan!', 'success');
    },

    clearHistory() {
        if (confirm('Padam semua sejarah pengiraan?')) {
            Calculator.history = [];
            Calculator.saveHistory();
            Calculator.renderHistory();
            this.showToast('🗑️ Sejarah dipadamkan!', 'success');
        }
    },

    _toastTimeout: null,
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        clearTimeout(this._toastTimeout);
        this._toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
            toast.className = 'toast';
        }, 2000);
    },

    toggleTheme() {
        const body = document.body;
        body.classList.toggle('light-theme');
        const isLight = body.classList.contains('light-theme');
        const icon = document.getElementById('themeIcon');
        icon.innerHTML = isLight
            ? '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>'
            : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
        localStorage.setItem('metercalc_theme', isLight ? 'light' : 'dark');
    },

    loadTheme() {
        const saved = localStorage.getItem('metercalc_theme');
        const icon = document.getElementById('themeIcon');
        if (saved === 'light') {
            document.body.classList.add('light-theme');
            if (icon) icon.innerHTML = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
        }
    },

    shareCalculatorResult() {
        const lastCalc = Calculator.history.find(h => h.type === 'calculator');
        if (!lastCalc) { this.showToast('Tiada keputusan', 'error'); return; }
        const text = `📊 MeterCalc Pro\n⚡ ${lastCalc.mode.toUpperCase()}\n📏 M = ${Calculator.formatNumber(lastCalc.totalMultiplier)}\n🔌 Primary = ${Calculator.formatNumber(lastCalc.primaryActive)} imp/kWh\n📋 ${lastCalc.supply} | Cl.${lastCalc.meterClass}`;
        if (navigator.share) navigator.share({ title: 'MeterCalc Pro', text }).catch(() => {});
        else navigator.clipboard.writeText(text).then(() => this.showToast('📋 Disalin!', 'success'));
    }
};
