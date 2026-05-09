/**
 * MeterCalc Pro - UI Manager
 * Multi-language (BM/EN) + Copy to Clipboard
 * NO RELOAD - Direct DOM manipulation
 */

const UIManager = {
    currentMainTab: 'calculatorPanel',
    currentEnergyMode: 'pulse-to-energy',
    currentLang: 'ms',

    // ============ INIT ============
    init() {
        this.loadTheme();
        this.loadLanguage();
        this.switchCalcMode('direct');
        this.switchMainTab('calculatorPanel');
    },

    // ============ MAIN TAB SWITCHING ============
    switchMainTab(panelId) {
        this.currentMainTab = panelId;

        document.querySelectorAll('.main-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.panel === panelId);
        });

        const allPanels = ['calculatorPanel', 'calcResultsPanel', 'energyPanel', 'accuracyPanel', 'demandPanel', 'historyPanel', 'referencePanel'];
        allPanels.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });

        const targetPanel = document.getElementById(panelId);
        if (targetPanel) {
            targetPanel.style.display = 'block';
            targetPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

        if (mode === 'ct' || mode === 'ctvt') {
            if (ctDivider) ctDivider.style.display = 'flex';
            if (ctInputs) ctInputs.style.display = 'grid';
            if (ctLiveRatio) ctLiveRatio.style.display = 'flex';
        }

        if (mode === 'ctvt') {
            if (vtDivider) vtDivider.style.display = 'flex';
            if (vtInputs) vtInputs.style.display = 'grid';
            if (vtLiveRatio) vtLiveRatio.style.display = 'flex';
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
        if (!lastCalc) { this.showToast(Lang.get('toast-no-results'), 'error'); return; }

        const modeLabels = { direct: 'DIRECT', ct: 'CT', ctvt: 'CT+VT' };
        let text = `📊 MeterCalc Pro\n⚡ ${modeLabels[lastCalc.mode]} | ${lastCalc.supply} | Cl.${lastCalc.meterClass}\n`;
        text += `━━━━━━━━━━━━━━━━━━\n📏 Total Multiplier: ${Calculator.formatNumber(lastCalc.totalMultiplier)}\n`;
        if (lastCalc.mode !== 'direct') text += `🔧 CT Ratio: ${Calculator.formatNumber(lastCalc.ctRatio)} : 1\n`;
        if (lastCalc.mode === 'ctvt') text += `⚡ VT Ratio: ${Calculator.formatNumber(lastCalc.vtRatio)} : 1\n`;
        text += `━━━━━━━━━━━━━━━━━━\n🔌 Primary Active: ${Calculator.formatNumber(lastCalc.primaryActive)} imp/kWh\n`;
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
        this.copyToClipboard(el.textContent.trim());
    },

    copyAccuracyResults() {
        const errorVal = document.getElementById('accuracyResultValue').textContent.trim();
        const statusVal = document.getElementById('accuracyStatus').textContent.trim();
        this.copyToClipboard(`📊 Accuracy Test\n% Error: ${errorVal}\nStatus: ${statusVal}`);
    },

    copyFromCard(element) {
        if (element.dataset.value) this.copyToClipboard(element.dataset.value);
    },

    copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => this.showToast(Lang.get('toast-copied'), 'success')).catch(() => this.fallbackCopy(text));
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
        try { document.execCommand('copy'); this.showToast(Lang.get('toast-copied'), 'success'); } 
        catch (e) { this.showToast(Lang.get('toast-copy-failed'), 'error'); }
        document.body.removeChild(textarea);
    },

    // ============ LANGUAGE SWITCH - NO RELOAD ============
    toggleLanguage() {
        this.currentLang = this.currentLang === 'ms' ? 'en' : 'ms';
        Lang.setLanguage(this.currentLang);
        localStorage.setItem('metercalc_lang', this.currentLang);
        document.getElementById('langIcon').textContent = this.currentLang === 'ms' ? '🇲🇾' : '🇬🇧';
        this.rewriteAllText();
        Calculator.renderHistory();
        const lastCalc = Calculator.history.find(h => h.type === 'calculator');
        if (lastCalc && document.getElementById('calcResultsPanel').style.display !== 'none') {
            Calculator.displayCalcResults(lastCalc);
        }
        this.showToast(this.currentLang === 'ms' ? '🇲🇾 Bahasa Melayu' : '🇬🇧 English', 'success');
    },

    loadLanguage() {
        const saved = localStorage.getItem('metercalc_lang') || 'ms';
        this.currentLang = saved;
        Lang.setLanguage(saved);
        document.getElementById('langIcon').textContent = saved === 'ms' ? '🇲🇾' : '🇬🇧';
        this.rewriteAllText();
    },

    // ============ REWRITE ALL TEXT ============
    rewriteAllText() {
        const m = this.currentLang === 'ms';
        
        // TAB LABELS
        const tabs = document.querySelectorAll('.main-tab-label');
        const tabTexts = ['Kalkulator','Tenaga','Ketepatan','MD','Sejarah','Rujukan'];
        const tabTextsEn = ['Calculator','Energy','Accuracy','MD','History','Reference'];
        tabs.forEach((tab, i) => { if (i < tabTexts.length) tab.textContent = m ? tabTexts[i] : tabTextsEn[i]; });

        // PANEL HEADERS
        document.querySelectorAll('.panel-header h2').forEach(h2 => {
            const t = h2.textContent.trim();
            if (t.includes('Parameter Input')) h2.innerHTML = '📋 Parameter Input';
            else if (t.includes('Keputusan') || t.includes('Calculation Results')) h2.innerHTML = m ? '📊 Keputusan Pengiraan' : '📊 Calculation Results';
            else if (t.includes('Energy Registration')) h2.innerHTML = '🔢 Energy Registration Calculator';
            else if (t.includes('Meter Accuracy')) h2.innerHTML = m ? '📊 Meter Accuracy Calculator' : '📊 Meter Accuracy Calculator';
            else if (t.includes('Maximum Demand')) h2.innerHTML = m ? '🕐 Maximum Demand Calculator' : '🕐 Maximum Demand Calculator';
            else if (t.includes('Sejarah') || t.includes('Calculation History')) h2.innerHTML = m ? '📋 Sejarah Pengiraan' : '📋 Calculation History';
            else if (t.includes('Rujukan') || t.includes('Quick Reference')) h2.innerHTML = m ? '📚 Rujukan Pantas' : '📚 Quick Reference';
        });

        // INPUT LABELS
        document.querySelectorAll('.input-label').forEach(label => {
            const span = label.querySelector('span:first-child');
            if (!span) return;
            const t = span.textContent.trim();
            const map = {
                'Meter Constant Active': 'Meter Constant Active',
                'Meter Constant Reactive': 'Meter Constant Reactive',
                'Jenis Supply': m ? 'Jenis Supply' : 'Supply Type',
                'Supply Type': m ? 'Jenis Supply' : 'Supply Type',
                'Class Meter': m ? 'Class Meter' : 'Meter Class',
                'Meter Class': m ? 'Class Meter' : 'Meter Class',
                'CT Primary (A)': 'CT Primary (A)',
                'CT Secondary (A)': 'CT Secondary (A)',
                'VT Primary (V)': 'VT Primary (V)',
                'VT Secondary (V)': 'VT Secondary (V)',
                'Jumlah Pulse Diterima': m ? 'Jumlah Pulse Diterima' : 'Pulse Count Received',
                'Pulse Count Received': m ? 'Jumlah Pulse Diterima' : 'Pulse Count Received',
                'Pulse Constant (imp/kWh)': 'Pulse Constant (imp/kWh)',
                'Multiplier (M)': 'Multiplier (M)',
                'Tenaga Dikehendaki (kWh)': m ? 'Tenaga Dikehendaki (kWh)' : 'Energy Required (kWh)',
                'Energy Required (kWh)': m ? 'Tenaga Dikehendaki (kWh)' : 'Energy Required (kWh)',
                'Tenaga Rujukan (Standard)': m ? 'Tenaga Rujukan (Standard)' : 'Reference Energy (Standard)',
                'Reference Energy (Standard)': m ? 'Tenaga Rujukan (Standard)' : 'Reference Energy (Standard)',
                'Tenaga Meter Under Test': m ? 'Tenaga Meter Under Test' : 'Meter Under Test Energy',
                'Meter Under Test Energy': m ? 'Tenaga Meter Under Test' : 'Meter Under Test Energy',
                'Jumlah Pulse (dalam 30 minit)': m ? 'Jumlah Pulse (dalam 30 minit)' : 'Pulse Count (in 30 minutes)',
                'Pulse Count (in 30 minutes)': m ? 'Jumlah Pulse (dalam 30 minit)' : 'Pulse Count (in 30 minutes)'
            };
            if (map[t] !== undefined) span.textContent = map[t];
        });

        // BUTTONS
        document.querySelectorAll('.btn-calculate span[data-lang]').forEach(span => {
            const k = span.dataset.lang;
            if (k === 'btn-calculate') span.textContent = m ? '🔢 KIRA PARAMETER' : '🔢 CALCULATE';
            else if (k === 'btn-energy-calc') span.textContent = m ? '🔢 KIRA TENAGA' : '🔢 CALCULATE ENERGY';
            else if (k === 'btn-accuracy-calc') span.textContent = m ? '📊 KIRA KETEPATAN' : '📊 CHECK ACCURACY';
            else if (k === 'btn-demand-calc') span.textContent = m ? '🕐 KIRA MD' : '🕐 CALCULATE MD';
        });

        // TOGGLE BUTTONS
        const tp = document.querySelector('#togglePulseToEnergy span[data-lang]');
        const te = document.querySelector('#toggleEnergyToPulse span[data-lang]');
        if (tp) tp.textContent = m ? 'Pulse → Tenaga' : 'Pulse → Energy';
        if (te) te.textContent = m ? 'Tenaga → Pulse' : 'Energy → Pulse';

        // COPY BUTTONS
        document.querySelectorAll('.btn-copy-result span[data-lang]').forEach(s => s.textContent = m ? 'Salin' : 'Copy');

        // CLEAR HISTORY BUTTON
        const bc = document.getElementById('btnClearHistory');
        if (bc) bc.textContent = m ? 'Padam Semua' : 'Clear All';

        // DEMAND DESC
        const dd = document.querySelector('.panel-desc[data-lang="demand-desc"]');
        if (dd) dd.textContent = m ? 'Kira Maximum Demand (MD) berdasarkan bacaan pulse dalam tempoh 30 minit.' : 'Calculate Maximum Demand (MD) based on pulse readings over 30 minutes.';

        // EMPTY STATE
        const ep = document.querySelector('#historyList .empty-state p[data-lang="history-empty"]');
        if (ep) ep.textContent = m ? 'Tiada rekod pengiraan' : 'No calculation records';

        // REFERENCE TABLE
        document.querySelectorAll('.ref-title').forEach(rt => {
            const t = rt.textContent.trim();
            const rm = {
                'Standard CT Ratios': 'Standard CT Ratios', 'Standard VT Ratios': 'Standard VT Ratios',
                'Standard Meter Constants': 'Standard Meter Constants', 'Class Accuracy Limits': 'Class Accuracy Limits',
                'Had Ralat': m ? 'Had Ralat' : 'Error Limit', 'Error Limit': m ? 'Had Ralat' : 'Error Limit',
                'Kegunaan': m ? 'Kegunaan' : 'Usage', 'Usage': m ? 'Kegunaan' : 'Usage',
                'Wiring Configuration': 'Wiring Configuration',
                'Jenis': m ? 'Jenis' : 'Type', 'Type': m ? 'Jenis' : 'Type'
            };
            if (rm[t] !== undefined) rt.textContent = rm[t];
        });

        // RESULT LABELS (if visible)
        document.querySelectorAll('.result-card-label').forEach(rl => {
            const t = rl.textContent.trim();
            const rlm = {
                'CT Ratio': 'CT Ratio', 'VT Ratio': 'VT Ratio',
                'Primary Active': 'Primary Active', 'Secondary Active': 'Secondary Active',
                'Primary Reactive': 'Primary Reactive', 'Secondary Reactive': 'Secondary Reactive',
                '% Error': '% Error',
                'Hasil': m ? 'Hasil' : 'Result', 'Result': m ? 'Hasil' : 'Result',
                'Maximum Demand': 'Maximum Demand'
            };
            if (rlm[t] !== undefined) rl.textContent = rlm[t];
        });

        const ft = document.querySelector('.formula-title');
        if (ft) ft.textContent = m ? '📐 Formula Digunakan' : '📐 Formula Used';
    },

    // ============ TOAST ============
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        clearTimeout(this._toastTimeout);
        this._toastTimeout = setTimeout(() => { toast.classList.remove('show'); toast.className = 'toast'; }, 2000);
    },

    // ============ THEME ============
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
            const icon = document.getElementById('themeIcon');
            if (icon) icon.innerHTML = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
        }
    },

    shareCalculatorResult() {
        const lastCalc = Calculator.history.find(h => h.type === 'calculator');
        if (!lastCalc) { this.showToast(Lang.get('toast-no-results'), 'error'); return; }
        const modeLabels = { direct: 'DIRECT', ct: 'CT', ctvt: 'CT+VT' };
        const text = `📊 MeterCalc Pro\n⚡ ${modeLabels[lastCalc.mode]}\n📏 M = ${Calculator.formatNumber(lastCalc.totalMultiplier)}\n🔌 Primary Pulse = ${Calculator.formatNumber(lastCalc.primaryActive)} imp/kWh\n📋 ${lastCalc.supply} | Cl.${lastCalc.meterClass}`;
        if (navigator.share) navigator.share({ title: 'MeterCalc Pro Result', text }).catch(() => {});
        else this.copyToClipboard(text);
    }
};

// ============ LANGUAGE DATA ============
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
            'accuracy-fail': '❌ GAGAL - Melebihi had'
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
            'accuracy-fail': '❌ FAIL - Exceeds'
        }
    },
    setLanguage(lang) { this.current = lang; },
    get(key) { return this.data[this.current]?.[key] || this.data['ms']?.[key] || key; }
};
