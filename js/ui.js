/**
 * MeterCalc Pro - UI Manager
 * Multi-language support (BM/EN), Copy to clipboard
 */

const UIManager = {
    currentMainTab: 'calculatorPanel',
    currentEnergyMode: 'pulse-to-energy',
    currentLang: 'ms',

    // ============ MAIN TAB SWITCHING ============
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
        if (panelId === 'historyPanel') {
            Calculator.renderHistory();
        }

        if (navigator.vibrate) navigator.vibrate(8);
    },

    // ============ CALCULATOR MODE SWITCHING ============
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

        const resultsPanel = document.getElementById('calcResultsPanel');
        if (resultsPanel) resultsPanel.style.display = 'none';

        Calculator.updateLiveRatios();

        if (navigator.vibrate) navigator.vibrate(8);
    },

    // ============ ENERGY MODE TOGGLE ============
    switchEnergyMode(mode) {
        this.currentEnergyMode = mode;
        Calculator.currentEnergyMode = mode;

        document.getElementById('togglePulseToEnergy').classList.toggle('active', mode === 'pulse-to-energy');
        document.getElementById('toggleEnergyToPulse').classList.toggle('active', mode === 'energy-to-pulse');

        document.getElementById('energyPulseToEnergy').style.display = mode === 'pulse-to-energy' ? 'block' : 'none';
        document.getElementById('energyEnergyToPulse').style.display = mode === 'energy-to-pulse' ? 'block' : 'none';

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

        document.getElementById('energyPulseCount').value = '';
        document.getElementById('energyPulseConst').value = '';
        document.getElementById('energyMultiplier').value = '1';
        document.getElementById('energyTarget').value = '';
        document.getElementById('energyPulseConst2').value = '';
        document.getElementById('energyMultiplier2').value = '1';
        document.getElementById('energyResult').style.display = 'none';

        document.getElementById('accReference').value = '';
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
        this.showToast(Lang.get('toast-reset'), 'success');
    },

    // ============ HISTORY ============
    clearHistory() {
        if (confirm(Lang.get('confirm-clear-history'))) {
            Calculator.history = [];
            Calculator.saveHistory();
            Calculator.renderHistory();
            this.showToast(Lang.get('toast-history-cleared'), 'success');
        }
    },

    // ============ COPY FUNCTIONS ============
    copyCalculatorResults() {
        const lastCalc = Calculator.history.find(h => h.type === 'calculator');
        if (!lastCalc) {
            this.showToast(Lang.get('toast-no-results'), 'error');
            return;
        }

        const modeLabels = { direct: 'DIRECT', ct: 'CT', ctvt: 'CT+VT' };
        let text = `📊 MeterCalc Pro\n`;
        text += `⚡ ${modeLabels[lastCalc.mode]} | ${lastCalc.supply} | Cl.${lastCalc.meterClass}\n`;
        text += `━━━━━━━━━━━━━━━━━━\n`;
        text += `📏 Total Multiplier: ${Calculator.formatNumber(lastCalc.totalMultiplier)}\n`;
        if (lastCalc.mode !== 'direct') {
            text += `🔧 CT Ratio: ${Calculator.formatNumber(lastCalc.ctRatio)} : 1\n`;
        }
        if (lastCalc.mode === 'ctvt') {
            text += `⚡ VT Ratio: ${Calculator.formatNumber(lastCalc.vtRatio)} : 1\n`;
        }
        text += `━━━━━━━━━━━━━━━━━━\n`;
        text += `🔌 Primary Active: ${Calculator.formatNumber(lastCalc.primaryActive)} imp/kWh\n`;
        text += `🔌 Secondary Active: ${Calculator.formatNumber(lastCalc.secondaryActive)} imp/kWh\n`;
        if (lastCalc.primaryReactive > 0) {
            text += `🔌 Primary Reactive: ${Calculator.formatNumber(lastCalc.primaryReactive)} imp/kvarh\n`;
            text += `🔌 Secondary Reactive: ${Calculator.formatNumber(lastCalc.secondaryReactive)} imp/kvarh\n`;
        }

        this.copyToClipboard(text);
    },

    copySingleValue(elementId) {
        const el = document.getElementById(elementId);
        if (!el) return;
        const text = el.textContent.trim();
        this.copyToClipboard(text);
    },

    copyAccuracyResults() {
        const errorVal = document.getElementById('accuracyResultValue').textContent.trim();
        const statusVal = document.getElementById('accuracyStatus').textContent.trim();
        const text = `📊 Accuracy Test\n% Error: ${errorVal}\nStatus: ${statusVal}`;
        this.copyToClipboard(text);
    },

    copyFromCard(element) {
        const value = element.dataset.value;
        if (value) {
            this.copyToClipboard(value);
        }
    },

    copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                this.showToast(Lang.get('toast-copied'), 'success');
            }).catch(() => {
                this.fallbackCopy(text);
            });
        } else {
            this.fallbackCopy(text);
        }
    },

    fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            this.showToast(Lang.get('toast-copied'), 'success');
        } catch (e) {
            this.showToast(Lang.get('toast-copy-failed'), 'error');
        }
        document.body.removeChild(textarea);
    },

    // ============ LANGUAGE SWITCH (FIXED) ============
    toggleLanguage() {
        this.currentLang = this.currentLang === 'ms' ? 'en' : 'ms';
        Lang.setLanguage(this.currentLang);

        // Update lang icon
        document.getElementById('langIcon').textContent = this.currentLang === 'ms' ? '🇲🇾' : '🇬🇧';

        // Save to localStorage
        localStorage.setItem('metercalc_lang', this.currentLang);

        // Update ALL text content (NOT just data-lang)
        this.updateAllUIText();

        // Re-render dynamic content
        Calculator.renderHistory();

        // Re-render calculator results if visible
        const lastCalc = Calculator.history.find(h => h.type === 'calculator');
        if (lastCalc && document.getElementById('calcResultsPanel').style.display !== 'none') {
            Calculator.displayCalcResults(lastCalc);
        }

        this.showToast(this.currentLang === 'ms' ? '🇲🇾 Bahasa Melayu' : '🇬🇧 English', 'success');
    },

    updateAllUIText() {
        // Update ALL elements with data-lang attribute
        document.querySelectorAll('[data-lang]').forEach(el => {
            const key = el.dataset.lang;
            const text = Lang.get(key);
            if (text) el.textContent = text;
        });

        // Update specific hardcoded labels that don't use data-lang
        this.updateInputLabels();
        this.updateTabLabels();
        this.updateButtonLabels();
        this.updateReferenceTable();
    },

    updateInputLabels() {
        // Calculator input labels
        this.setLabelText(document.querySelector('label[for="meterConstActive"]'), 'Meter Constant Active', 'Meter Constant Active');
        this.setLabelText(document.querySelector('label[for="meterConstReactive"]'), 'Meter Constant Reactive', 'Meter Constant Reactive');
        
        // These are already handled by data-lang, but some might not have the attribute
        const labels = {
            'input-const-active': 'Meter Constant Active',
            'input-const-reactive': 'Meter Constant Reactive',
            'input-supply': this.currentLang === 'ms' ? 'Jenis Supply' : 'Supply Type',
            'input-class': this.currentLang === 'ms' ? 'Class Meter' : 'Meter Class',
            'input-ct-primary': this.currentLang === 'ms' ? 'CT Primary (A)' : 'CT Primary (A)',
            'input-ct-secondary': this.currentLang === 'ms' ? 'CT Secondary (A)' : 'CT Secondary (A)',
            'input-vt-primary': this.currentLang === 'ms' ? 'VT Primary (V)' : 'VT Primary (V)',
            'input-vt-secondary': this.currentLang === 'ms' ? 'VT Secondary (V)' : 'VT Secondary (V)'
        };

        Object.entries(labels).forEach(([key, value]) => {
            const el = document.querySelector(`[data-lang="${key}"]`);
            if (el) el.textContent = value;
        });
    },

    updateTabLabels() {
        const tabLabels = {
            'tab-calculator': this.currentLang === 'ms' ? 'Kalkulator' : 'Calculator',
            'tab-energy': this.currentLang === 'ms' ? 'Tenaga' : 'Energy',
            'tab-accuracy': this.currentLang === 'ms' ? 'Ketepatan' : 'Accuracy',
            'tab-demand': 'MD',
            'tab-history': this.currentLang === 'ms' ? 'Sejarah' : 'History',
            'tab-reference': this.currentLang === 'ms' ? 'Rujukan' : 'Reference'
        };

        Object.entries(tabLabels).forEach(([key, value]) => {
            const el = document.querySelector(`[data-lang="${key}"]`);
            if (el) el.textContent = value;
        });
    },

    updateButtonLabels() {
        const btnLabels = {
            'btn-calculate': this.currentLang === 'ms' ? '🔢 KIRA PARAMETER' : '🔢 CALCULATE',
            'btn-energy-calc': this.currentLang === 'ms' ? '🔢 KIRA TENAGA' : '🔢 CALCULATE ENERGY',
            'btn-accuracy-calc': this.currentLang === 'ms' ? '📊 KIRA KETEPATAN' : '📊 CHECK ACCURACY',
            'btn-demand-calc': this.currentLang === 'ms' ? '🕐 KIRA MD' : '🕐 CALCULATE MD',
            'btn-copy': this.currentLang === 'ms' ? 'Salin' : 'Copy',
            'history-clear': this.currentLang === 'ms' ? 'Padam Semua' : 'Clear All'
        };

        Object.entries(btnLabels).forEach(([key, value]) => {
            const el = document.querySelector(`[data-lang="${key}"]`);
            if (el) el.textContent = value;
        });

        // Update panel titles
        const titles = {
            'calc-title': this.currentLang === 'ms' ? '📋 Parameter Input' : '📋 Parameter Input',
            'result-title': this.currentLang === 'ms' ? '📊 Keputusan Pengiraan' : '📊 Calculation Results',
            'energy-title': this.currentLang === 'ms' ? '🔢 Energy Registration Calculator' : '🔢 Energy Registration Calculator',
            'accuracy-title': this.currentLang === 'ms' ? '📊 Meter Accuracy Calculator' : '📊 Meter Accuracy Calculator',
            'demand-title': this.currentLang === 'ms' ? '🕐 Maximum Demand Calculator' : '🕐 Maximum Demand Calculator',
            'history-title': this.currentLang === 'ms' ? '📋 Sejarah Pengiraan' : '📋 Calculation History',
            'ref-title': this.currentLang === 'ms' ? '📚 Rujukan Pantas' : '📚 Quick Reference'
        };

        Object.entries(titles).forEach(([key, value]) => {
            const el = document.querySelector(`[data-lang="${key}"]`);
            if (el) el.textContent = value;
        });
    },

    updateReferenceTable() {
        // Reference table headers
        const refHeaders = {
            'ref-ct': this.currentLang === 'ms' ? 'Standard CT Ratios' : 'Standard CT Ratios',
            'ref-vt': this.currentLang === 'ms' ? 'Standard VT Ratios' : 'Standard VT Ratios',
            'ref-constants': this.currentLang === 'ms' ? 'Standard Meter Constants' : 'Standard Meter Constants',
            'ref-class': this.currentLang === 'ms' ? 'Class Accuracy Limits' : 'Class Accuracy Limits',
            'ref-error-limit': this.currentLang === 'ms' ? 'Had Ralat' : 'Error Limit',
            'ref-usage': this.currentLang === 'ms' ? 'Kegunaan' : 'Usage',
            'ref-wiring': this.currentLang === 'ms' ? 'Wiring Configuration' : 'Wiring Configuration',
            'ref-type': this.currentLang === 'ms' ? 'Jenis' : 'Type',
            'ref-precision': this.currentLang === 'ms' ? 'Precision metering' : 'Precision metering',
            'ref-industrial-large': this.currentLang === 'ms' ? 'Large industrial' : 'Large industrial',
            'ref-industrial': this.currentLang === 'ms' ? 'Industrial' : 'Industrial',
            'ref-commercial': this.currentLang === 'ms' ? 'General / Commercial' : 'General / Commercial',
            'ref-domestic': this.currentLang === 'ms' ? 'Domestic' : 'Domestic',
            'ref-1p2w': this.currentLang === 'ms' ? 'Domestik 1 fasa' : 'Domestic 1 phase',
            'ref-3p3w': this.currentLang === 'ms' ? 'Industri 3 fasa (delta)' : 'Industrial 3 phase (delta)',
            'ref-3p4w': this.currentLang === 'ms' ? 'Komersial/Industri (wye)' : 'Commercial/Industrial (wye)'
        };

        Object.entries(refHeaders).forEach(([key, value]) => {
            const el = document.querySelector(`[data-lang="${key}"]`);
            if (el) el.textContent = value;
        });
    },

    setLabelText(element, textMs, textEn) {
        if (element) {
            element.textContent = this.currentLang === 'ms' ? textMs : textEn;
        }
    },

    loadLanguage() {
        const saved = localStorage.getItem('metercalc_lang') || 'ms';
        this.currentLang = saved;
        Lang.setLanguage(saved);
        document.getElementById('langIcon').textContent = saved === 'ms' ? '🇲🇾' : '🇬🇧';
        // Initial text load is handled by HTML data-lang attributes
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

    // ============ THEME ============
    toggleTheme() {
        const body = document.body;
        body.classList.toggle('light-theme');
        const isLight = body.classList.contains('light-theme');
        const icon = document.getElementById('themeIcon');

        if (isLight) {
            icon.innerHTML = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
        } else {
            icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
        }

        localStorage.setItem('metercalc_theme', isLight ? 'light' : 'dark');
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
        const lastCalc = Calculator.history.find(h => h.type === 'calculator');
        if (!lastCalc) {
            this.showToast(Lang.get('toast-no-results'), 'error');
            return;
        }

        const modeLabels = { direct: 'DIRECT', ct: 'CT', ctvt: 'CT+VT' };
        const text = `📊 MeterCalc Pro\n⚡ ${modeLabels[lastCalc.mode]}\n📏 M = ${Calculator.formatNumber(lastCalc.totalMultiplier)}\n🔌 Primary Pulse = ${Calculator.formatNumber(lastCalc.primaryActive)} imp/kWh\n📋 ${lastCalc.supply} | Cl.${lastCalc.meterClass}`;

        if (navigator.share) {
            navigator.share({ title: 'MeterCalc Pro Result', text }).catch(() => {});
        } else {
            UIManager.copyToClipboard(text);
        }
    }
};

// ============ LANGUAGE SYSTEM ============
const Lang = {
    current: 'ms',

    data: {
        ms: {
            'toast-enter-constant': 'Sila masukkan Meter Constant Active!',
            'toast-enter-ct': 'Sila masukkan nilai CT!',
            'toast-enter-vt': 'Sila masukkan nilai VT!',
            'toast-calc-done': '✅ Pengiraan selesai!',
            'toast-enter-pulse': 'Sila masukkan jumlah pulse!',
            'toast-enter-energy': 'Sila masukkan tenaga!',
            'toast-enter-reference': 'Sila masukkan tenaga rujukan!',
            'toast-enter-meter-reading': 'Sila masukkan tenaga meter!',
            'toast-energy-done': '✅ Tenaga dikira!',
            'toast-pulse-done': '✅ Pulse dikira!',
            'toast-accuracy-pass': '✅ Meter LULUS!',
            'toast-accuracy-fail': '❌ Meter GAGAL!',
            'toast-demand-done': '✅ Maximum Demand dikira!',
            'toast-reset': '🔄 Semua dikosongkan!',
            'toast-history-cleared': '🗑️ Sejarah dipadamkan!',
            'toast-copied': '📋 Disalin!',
            'toast-copy-failed': '❌ Gagal menyalin',
            'toast-no-results': 'Tiada keputusan untuk disalin',
            'confirm-clear-history': 'Padam semua sejarah pengiraan?',
            'accuracy-pass': '✅ LULUS - Dalam had',
            'accuracy-fail': '❌ GAGAL - Melebihi had',
            'result-total-multiplier': 'TOTAL MULTIPLIER',
            'result-direct-mode': 'DIRECT • Tiada CT/VT',
            'result-ct-mode': 'CT Sahaja',
            'result-ctvt-mode': 'CT + VT (High Voltage)',
            'result-pulse-constants': 'PULSE CONSTANTS',
            'result-primary-active': 'Primary Active',
            'result-secondary-active': 'Secondary Active',
            'result-primary-reactive': 'Primary Reactive',
            'result-secondary-reactive': 'Secondary Reactive',
            'result-formula': 'Formula Digunakan',
            'live-enter-value': 'Masukkan nilai',
            'history-empty': 'Tiada rekod pengiraan',
            'result-hasil': 'Hasil'
        },
        en: {
            'toast-enter-constant': 'Please enter Meter Constant Active!',
            'toast-enter-ct': 'Please enter CT values!',
            'toast-enter-vt': 'Please enter VT values!',
            'toast-calc-done': '✅ Calculation complete!',
            'toast-enter-pulse': 'Please enter pulse count!',
            'toast-enter-energy': 'Please enter energy value!',
            'toast-enter-reference': 'Please enter reference energy!',
            'toast-enter-meter-reading': 'Please enter meter reading!',
            'toast-energy-done': '✅ Energy calculated!',
            'toast-pulse-done': '✅ Pulses calculated!',
            'toast-accuracy-pass': '✅ Meter PASS!',
            'toast-accuracy-fail': '❌ Meter FAIL!',
            'toast-demand-done': '✅ Maximum Demand calculated!',
            'toast-reset': '🔄 All cleared!',
            'toast-history-cleared': '🗑️ History deleted!',
            'toast-copied': '📋 Copied!',
            'toast-copy-failed': '❌ Copy failed',
            'toast-no-results': 'No results to copy',
            'confirm-clear-history': 'Delete all calculation history?',
            'accuracy-pass': '✅ PASS - Within',
            'accuracy-fail': '❌ FAIL - Exceeds',
            'result-total-multiplier': 'TOTAL MULTIPLIER',
            'result-direct-mode': 'DIRECT • No CT/VT',
            'result-ct-mode': 'CT Only',
            'result-ctvt-mode': 'CT + VT (High Voltage)',
            'result-pulse-constants': 'PULSE CONSTANTS',
            'result-primary-active': 'Primary Active',
            'result-secondary-active': 'Secondary Active',
            'result-primary-reactive': 'Primary Reactive',
            'result-secondary-reactive': 'Secondary Reactive',
            'result-formula': 'Formula Used',
            'live-enter-value': 'Enter value',
            'history-empty': 'No calculation records',
            'result-hasil': 'Result'
        }
    },

    setLanguage(lang) {
        this.current = lang;
    },

    get(key) {
        return this.data[this.current]?.[key] || this.data['ms']?.[key] || key;
    }
};
