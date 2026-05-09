/**
 * MeterCalc Pro - UI Manager
 * Multi-language support (BM/EN), Copy to clipboard
 * V3 - Direct innerHTML rewrite for guaranteed language switch
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

    // ============ LANGUAGE SWITCH (REWRITE APPROACH) ============
    toggleLanguage() {
        // Flip language
        const newLang = this.currentLang === 'ms' ? 'en' : 'ms';
        
        // Save to localStorage
        localStorage.setItem('metercalc_lang', newLang);
        
        // Reload to apply all changes
        window.location.reload();
    },

    loadLanguage() {
        const saved = localStorage.getItem('metercalc_lang') || 'ms';
        this.currentLang = saved;
        Lang.setLanguage(saved);
        
        // Update lang icon
        const langIcon = document.getElementById('langIcon');
        if (langIcon) {
            langIcon.textContent = saved === 'ms' ? '🇲🇾' : '🇬🇧';
        }
        
        // CRITICAL: Rewrite ALL UI text directly
        this.rewriteAllText();
    },

    rewriteAllText() {
        const lang = this.currentLang;
        const isMs = lang === 'ms';

        // ===== MAIN TAB LABELS (DIRECT SPAN REWRITE) =====
        const tabLabels = {
            'Kalkulator': isMs ? 'Kalkulator' : 'Calculator',
            'Tenaga': isMs ? 'Tenaga' : 'Energy',
            'Ketepatan': isMs ? 'Ketepatan' : 'Accuracy',
            'MD': 'MD',
            'Sejarah': isMs ? 'Sejarah' : 'History',
            'Rujukan': isMs ? 'Rujukan' : 'Reference'
        };

        document.querySelectorAll('.main-tab-label').forEach(span => {
            const currentText = span.textContent.trim();
            if (tabLabels[currentText] !== undefined) {
                span.textContent = tabLabels[currentText];
            }
        });

        // ===== PANEL HEADERS =====
        const panelHeaders = document.querySelectorAll('.panel-header h2');
        panelHeaders.forEach(h2 => {
            const text = h2.innerHTML;
            if (text.includes('Parameter Input')) {
                h2.innerHTML = isMs ? '📋 Parameter Input' : '📋 Parameter Input';
            } else if (text.includes('Keputusan Pengiraan') || text.includes('Calculation Results')) {
                h2.innerHTML = isMs ? '📊 Keputusan Pengiraan' : '📊 Calculation Results';
            } else if (text.includes('Energy Registration')) {
                h2.innerHTML = isMs ? '🔢 Energy Registration Calculator' : '🔢 Energy Registration Calculator';
            } else if (text.includes('Meter Accuracy')) {
                h2.innerHTML = isMs ? '📊 Meter Accuracy Calculator' : '📊 Meter Accuracy Calculator';
            } else if (text.includes('Maximum Demand')) {
                h2.innerHTML = isMs ? '🕐 Maximum Demand Calculator' : '🕐 Maximum Demand Calculator';
            } else if (text.includes('Sejarah') || text.includes('Calculation History')) {
                h2.innerHTML = isMs ? '📋 Sejarah Pengiraan' : '📋 Calculation History';
            } else if (text.includes('Rujukan') || text.includes('Quick Reference')) {
                h2.innerHTML = isMs ? '📚 Rujukan Pantas' : '📚 Quick Reference';
            }
        });

        // ===== INPUT LABELS =====
        document.querySelectorAll('.input-label span:first-child').forEach(span => {
            const text = span.textContent.trim();
            const labelMap = {
                'Meter Constant Active': 'Meter Constant Active',
                'Meter Constant Reactive': 'Meter Constant Reactive',
                'Jenis Supply': isMs ? 'Jenis Supply' : 'Supply Type',
                'Supply Type': isMs ? 'Jenis Supply' : 'Supply Type',
                'Class Meter': isMs ? 'Class Meter' : 'Meter Class',
                'Meter Class': isMs ? 'Class Meter' : 'Meter Class',
                'CT Primary (A)': 'CT Primary (A)',
                'CT Secondary (A)': 'CT Secondary (A)',
                'VT Primary (V)': 'VT Primary (V)',
                'VT Secondary (V)': 'VT Secondary (V)',
                'Jumlah Pulse Diterima': isMs ? 'Jumlah Pulse Diterima' : 'Pulse Count Received',
                'Pulse Count Received': isMs ? 'Jumlah Pulse Diterima' : 'Pulse Count Received',
                'Jumlah Pulse (dalam 30 minit)': isMs ? 'Jumlah Pulse (dalam 30 minit)' : 'Pulse Count (in 30 minutes)',
                'Pulse Count (in 30 minutes)': isMs ? 'Jumlah Pulse (dalam 30 minit)' : 'Pulse Count (in 30 minutes)',
                'Pulse Constant (imp/kWh)': 'Pulse Constant (imp/kWh)',
                'Multiplier (M)': 'Multiplier (M)',
                'Tenaga Dikehendaki (kWh)': isMs ? 'Tenaga Dikehendaki (kWh)' : 'Energy Required (kWh)',
                'Energy Required (kWh)': isMs ? 'Tenaga Dikehendaki (kWh)' : 'Energy Required (kWh)',
                'Tenaga Rujukan (Standard)': isMs ? 'Tenaga Rujukan (Standard)' : 'Reference Energy (Standard)',
                'Reference Energy (Standard)': isMs ? 'Tenaga Rujukan (Standard)' : 'Reference Energy (Standard)',
                'Tenaga Meter Under Test': isMs ? 'Tenaga Meter Under Test' : 'Meter Under Test Energy',
                'Meter Under Test Energy': isMs ? 'Tenaga Meter Under Test' : 'Meter Under Test Energy'
            };
            if (labelMap[text] !== undefined) {
                span.textContent = labelMap[text];
            }
        });

        // ===== BUTTONS =====
        document.querySelectorAll('.btn-calculate span[data-lang]').forEach(span => {
            const key = span.dataset.lang;
            if (key === 'btn-calculate') {
                span.textContent = isMs ? '🔢 KIRA PARAMETER' : '🔢 CALCULATE';
            } else if (key === 'btn-energy-calc') {
                span.textContent = isMs ? '🔢 KIRA TENAGA' : '🔢 CALCULATE ENERGY';
            } else if (key === 'btn-accuracy-calc') {
                span.textContent = isMs ? '📊 KIRA KETEPATAN' : '📊 CHECK ACCURACY';
            } else if (key === 'btn-demand-calc') {
                span.textContent = isMs ? '🕐 KIRA MD' : '🕐 CALCULATE MD';
            }
        });

        // ===== TOGGLE BUTTONS =====
        const togglePulse = document.getElementById('togglePulseToEnergy');
        const toggleEnergy = document.getElementById('toggleEnergyToPulse');
        if (togglePulse) {
            const span = togglePulse.querySelector('span[data-lang]');
            if (span) span.textContent = isMs ? 'Pulse → Tenaga' : 'Pulse → Energy';
        }
        if (toggleEnergy) {
            const span = toggleEnergy.querySelector('span[data-lang]');
            if (span) span.textContent = isMs ? 'Tenaga → Pulse' : 'Energy → Pulse';
        }

        // ===== COPY BUTTONS =====
        document.querySelectorAll('.btn-copy-result span[data-lang]').forEach(span => {
            span.textContent = isMs ? 'Salin' : 'Copy';
        });

        // ===== HISTORY CLEAR BUTTON =====
        const btnClear = document.getElementById('btnClearHistory');
        if (btnClear) {
            btnClear.textContent = isMs ? 'Padam Semua' : 'Clear All';
        }

        // ===== HISTORY EMPTY STATE =====
        const emptyState = document.querySelector('#historyList .empty-state p');
        if (emptyState && emptyState.dataset.lang === 'history-empty') {
            emptyState.textContent = isMs ? 'Tiada rekod pengiraan' : 'No calculation records';
        }

        // ===== PANEL DESC =====
        const panelDesc = document.querySelector('.panel-desc[data-lang="demand-desc"]');
        if (panelDesc) {
            panelDesc.textContent = isMs 
                ? 'Kira Maximum Demand (MD) berdasarkan bacaan pulse dalam tempoh 30 minit.'
                : 'Calculate Maximum Demand (MD) based on pulse readings over 30 minutes.';
        }

        // ===== REFERENCE TABLE =====
        document.querySelectorAll('.ref-title').forEach(title => {
            const text = title.textContent.trim();
            const refMap = {
                'Standard CT Ratios': 'Standard CT Ratios',
                'Standard VT Ratios': 'Standard VT Ratios',
                'Standard Meter Constants': 'Standard Meter Constants',
                'Class Accuracy Limits': 'Class Accuracy Limits',
                'Had Ralat': isMs ? 'Had Ralat' : 'Error Limit',
                'Error Limit': isMs ? 'Had Ralat' : 'Error Limit',
                'Kegunaan': isMs ? 'Kegunaan' : 'Usage',
                'Usage': isMs ? 'Kegunaan' : 'Usage',
                'Wiring Configuration': 'Wiring Configuration',
                'Jenis': isMs ? 'Jenis' : 'Type',
                'Type': isMs ? 'Jenis' : 'Type',
                'Precision metering': 'Precision metering',
                'Large industrial': 'Large industrial',
                'Industrial': 'Industrial',
                'General / Commercial': 'General / Commercial',
                'Domestic': 'Domestic',
                'Domestik 1 fasa': isMs ? 'Domestik 1 fasa' : 'Domestic 1 phase',
                'Domestic 1 phase': isMs ? 'Domestik 1 fasa' : 'Domestic 1 phase',
                'Industri 3 fasa (delta)': isMs ? 'Industri 3 fasa (delta)' : 'Industrial 3 phase (delta)',
                'Industrial 3 phase (delta)': isMs ? 'Industri 3 fasa (delta)' : 'Industrial 3 phase (delta)',
                'Komersial/Industri (wye)': isMs ? 'Komersial/Industri (wye)' : 'Commercial/Industrial (wye)',
                'Commercial/Industrial (wye)': isMs ? 'Komersial/Industri (wye)' : 'Commercial/Industrial (wye)'
            };
            if (refMap[text] !== undefined) {
                title.textContent = refMap[text];
            }
        });

        // ===== SPLASH SUBTITLE =====
        const splashSub = document.querySelector('[data-lang="splash-subtitle"]');
        if (splashSub) {
            splashSub.textContent = isMs ? 'Universal Calculator' : 'Universal Calculator';
        }

        // ===== RESULT LABELS (DYNAMIC - update if results are visible) =====
        this.updateResultLabels();
    },

    updateResultLabels() {
        const lang = this.currentLang;
        const isMs = lang === 'ms';

        // Hero result label
        const heroLabel = document.querySelector('.hero-label');
        if (heroLabel) {
            heroLabel.textContent = 'TOTAL MULTIPLIER';
        }

        // Result card labels
        document.querySelectorAll('.result-card-label').forEach(label => {
            const text = label.textContent.trim();
            const labelMap = {
                'CT Ratio': 'CT Ratio',
                'VT Ratio': 'VT Ratio',
                'Primary Active': 'Primary Active',
                'Secondary Active': 'Secondary Active',
                'Primary Reactive': 'Primary Reactive',
                'Secondary Reactive': 'Secondary Reactive',
                '% Error': '% Error',
                'Hasil': isMs ? 'Hasil' : 'Result',
                'Result': isMs ? 'Hasil' : 'Result',
                'Maximum Demand': 'Maximum Demand'
            };
            if (labelMap[text] !== undefined) {
                label.textContent = labelMap[text];
            }
        });

        // Formula title
        const formulaTitle = document.querySelector('.formula-title');
        if (formulaTitle) {
            formulaTitle.textContent = isMs ? '📐 Formula Digunakan' : '📐 Formula Used';
        }

        // Section dividers
        document.querySelectorAll('.divider-text').forEach(div => {
            if (div.textContent.trim() === 'PULSE CONSTANTS') {
                div.textContent = 'PULSE CONSTANTS';
            }
        });

        // Mode info in hero
        const heroSub = document.querySelector('.hero-sub');
        if (heroSub) {
            const text = heroSub.textContent;
            if (text.includes('Tiada CT/VT')) {
                heroSub.textContent = text.replace('Tiada CT/VT', isMs ? 'Tiada CT/VT' : 'No CT/VT');
            } else if (text.includes('No CT/VT')) {
                heroSub.textContent = text.replace('No CT/VT', isMs ? 'Tiada CT/VT' : 'No CT/VT');
            }
            if (text.includes('CT Sahaja')) {
                heroSub.textContent = text.replace('CT Sahaja', isMs ? 'CT Sahaja' : 'CT Only');
            } else if (text.includes('CT Only')) {
                heroSub.textContent = text.replace('CT Only', isMs ? 'CT Sahaja' : 'CT Only');
            }
            if (text.includes('High Voltage')) {
                // Keep as is
            }
        });
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
            'result-hasil': 'Hasil',
            'accuracy-error': '% Error'
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
            'result-hasil': 'Result',
            'accuracy-error': '% Error'
        }
    },

    setLanguage(lang) {
        this.current = lang;
    },

    get(key) {
        return this.data[this.current]?.[key] || this.data['ms']?.[key] || key;
    }
};
