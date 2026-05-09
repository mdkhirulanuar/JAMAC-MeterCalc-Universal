/**
 * MeterCalc Pro - UI Manager
 * Handles all UI interactions, tabs, toggles, and display
 */

const UIManager = {
    currentMainTab: 'calculatorPanel',
    currentEnergyMode: 'pulse-to-energy',

    // ============ MAIN TAB SWITCHING ============
    switchMainTab(panelId) {
        this.currentMainTab = panelId;

        // Update main tabs
        document.querySelectorAll('.main-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.panel === panelId);
        });

        // Hide all panels
        const panels = ['calculatorPanel', 'calcResultsPanel', 'energyPanel', 'accuracyPanel', 'demandPanel', 'historyPanel', 'referencePanel'];
        panels.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });

        // Show selected panel
        const targetPanel = document.getElementById(panelId);
        if (targetPanel) {
            targetPanel.style.display = 'block';
            targetPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // Special: Show calculator results if on calculator tab
        if (panelId === 'calculatorPanel') {
            const calcPanel = document.getElementById('calculatorPanel');
            if (calcPanel) calcPanel.style.display = 'block';
        }

        // Refresh history if switching to history tab
        if (panelId === 'historyPanel') {
            Calculator.renderHistory();
        }

        if (navigator.vibrate) navigator.vibrate(8);
    },

    // ============ CALCULATOR MODE SWITCHING ============
    switchCalcMode(mode) {
        Calculator.currentMode = mode;

        // Update sub-tabs
        document.querySelectorAll('.mode-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.mode === mode);
        });

        // Show/hide sections
        const ctDivider = document.getElementById('ctSectionDivider');
        const ctInputs = document.getElementById('ctInputSection');
        const ctLiveRatio = document.getElementById('ctLiveRatio');
        const vtDivider = document.getElementById('vtSectionDivider');
        const vtInputs = document.getElementById('vtInputSection');
        const vtLiveRatio = document.getElementById('vtLiveRatio');
        const reverseInputs = document.getElementById('reverseInputSection');

        // Reset all to hidden first
        [ctDivider, ctInputs, ctLiveRatio, vtDivider, vtInputs, vtLiveRatio, reverseInputs].forEach(el => {
            if (el) el.style.display = 'none';
        });

        // Show based on mode
        switch (mode) {
            case 'direct':
                // Nothing extra
                break;
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
            case 'reverse':
                if (reverseInputs) reverseInputs.style.display = 'block';
                if (ctDivider) ctDivider.style.display = 'flex';
                if (ctInputs) ctInputs.style.display = 'grid';
                if (ctLiveRatio) ctLiveRatio.style.display = 'flex';
                if (vtDivider) vtDivider.style.display = 'flex';
                if (vtInputs) vtInputs.style.display = 'grid';
                if (vtLiveRatio) vtLiveRatio.style.display = 'flex';
                break;
        }

        // Hide results panel when switching mode
        const resultsPanel = document.getElementById('calcResultsPanel');
        if (resultsPanel) resultsPanel.style.display = 'none';

        Calculator.updateLiveRatios();

        if (navigator.vibrate) navigator.vibrate(8);
    },

    // ============ ENERGY MODE TOGGLE ============
    switchEnergyMode(mode) {
        this.currentEnergyMode = mode;
        Calculator.currentEnergyMode = mode;

        // Update toggle buttons
        document.getElementById('togglePulseToEnergy').classList.toggle('active', mode === 'pulse-to-energy');
        document.getElementById('toggleEnergyToPulse').classList.toggle('active', mode === 'energy-to-pulse');

        // Show/hide sections
        document.getElementById('energyPulseToEnergy').style.display = mode === 'pulse-to-energy' ? 'block' : 'none';
        document.getElementById('energyEnergyToPulse').style.display = mode === 'energy-to-pulse' ? 'block' : 'none';

        // Hide result
        document.getElementById('energyResult').style.display = 'none';

        if (navigator.vibrate) navigator.vibrate(8);
    },

    // ============ RESET ALL ============
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
        document.getElementById('targetPrimaryPulse').value = '';

        // Reset energy fields
        document.getElementById('energyPulseCount').value = '';
        document.getElementById('energyPulseConst').value = '';
        document.getElementById('energyMultiplier').value = '1';
        document.getElementById('energyTarget').value = '';
        document.getElementById('energyPulseConst2').value = '';
        document.getElementById('energyMultiplier2').value = '1';
        document.getElementById('energyResult').style.display = 'none';

        // Reset accuracy fields
        document.getElementById('accReference').value = '';
        document.getElementById('accMeterReading').value = '';
        document.getElementById('accMeterClass').value = '1';
        document.getElementById('accuracyResult').style.display = 'none';

        // Reset demand fields
        document.getElementById('demandPulseCount').value = '';
        document.getElementById('demandPulseConst').value = '';
        document.getElementById('demandMultiplier').value = '1';
        document.getElementById('demandResult').style.display = 'none';

        // Hide results
        document.getElementById('calcResultsPanel').style.display = 'none';

        Calculator.updateLiveRatios();
        document.getElementById('calculatorPanel').scrollIntoView({ behavior: 'smooth' });
        this.showToast('🔄 Semua dikosongkan!', 'success');
    },

    // ============ HISTORY ============
    clearHistory() {
        if (confirm('Padam semua sejarah pengiraan?')) {
            Calculator.history = [];
            Calculator.saveHistory();
            Calculator.renderHistory();
            this.showToast('🗑️ Sejarah dipadamkan!', 'success');
        }
    },

    // ============ TOAST ============
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

    // ============ THEME TOGGLE ============
    toggleTheme() {
        const body = document.body;
        const isLight = body.classList.contains('light-theme');

        if (isLight) {
            body.classList.remove('light-theme');
        } else {
            body.classList.add('light-theme');
        }

        const newIsLight = body.classList.contains('light-theme');
        const icon = document.getElementById('themeIcon');

        if (newIsLight) {
            icon.innerHTML = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
        } else {
            icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
        }

        localStorage.setItem('metercalc_theme', newIsLight ? 'light' : 'dark');
    },

    loadTheme() {
        const saved = localStorage.getItem('metercalc_theme');
        const icon = document.getElementById('themeIcon');
        
        if (saved === 'light') {
            document.body.classList.add('light-theme');
            if (icon) {
                icon.innerHTML = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
            }
        }
    },

    // ============ SHARE ============
    shareCalculatorResult() {
        const lastCalc = Calculator.history.find(h => h.type === 'calculator' || h.type === 'reverse');
        if (!lastCalc) {
            this.showToast('Tiada keputusan untuk dikongsi', 'error');
            return;
        }

        let text = '';
        if (lastCalc.type === 'calculator') {
            text = `📊 MeterCalc Pro\n⚡ Mode: ${lastCalc.mode.toUpperCase()}\n📏 M = ${Calculator.formatNumber(lastCalc.totalMultiplier)}\n🔌 Primary Pulse = ${Calculator.formatNumber(lastCalc.primaryActive)} imp/kWh\n📋 ${lastCalc.supply} | Cl.${lastCalc.meterClass}`;
        } else {
            text = `📊 MeterCalc Pro (Reverse)\n🔄 Required Km = ${Calculator.formatNumber(lastCalc.requiredMeterConstant)} imp/kWh\n🎯 Target Pulse = ${Calculator.formatNumber(lastCalc.targetPrimaryPulse)} imp/kWh\n📏 M = ${Calculator.formatNumber(lastCalc.totalMultiplier)}`;
        }

        if (navigator.share) {
            navigator.share({ title: 'MeterCalc Pro Result', text }).catch(() => {});
        } else {
            navigator.clipboard.writeText(text).then(() => {
                this.showToast('📋 Keputusan disalin!', 'success');
            });
        }
    }
};
