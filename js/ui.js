// UI Manager - Updated for v3.3

const LANG_DATA = {
    bm: {
        calcDone: '✅ Pengiraan selesai!',
        energyDone: '✅ Tenaga dikira!',
        mdDone: '✅ MD dikira!',
        resetDone: '🔄 Semua input dikembalikan kepada default!',
        historyCleared: '🗑️ Sejarah dipadamkan!',
        copied: '📋 Disalin!',
        csvDone: '📥 CSV dimuat turun!',
        confirmClear: 'Padam semua sejarah?',
        recordDeleted: '🗑️ Rekod dipadam',
        supplyType: 'Jenis Supply',
        meterClass: 'Class Meter',
        energyUnit: 'Unit Tenaga',
        supply1P2W: '1 Fasa (1P2W)',
        supply3P3W: '3 Fasa (3P3W)',
        supply3P4W: '3 Fasa (3P4W)',
        historyEmpty: 'Tiada rekod',
        historyCopy: '📋 Salin',
        historyClear: 'Padam Semua',
        tabScan: 'Scan',
        footerText: 'MeterCalc Pro v3.3 | SAMM 654 Accredited | For JAMAC Metering Sdn. Bhd.'
    },
    en: {
        calcDone: '✅ Calculation complete!',
        energyDone: '✅ Energy calculated!',
        mdDone: '✅ MD calculated!',
        resetDone: '🔄 All inputs reset to default!',
        historyCleared: '🗑️ History deleted!',
        copied: '📋 Copied!',
        csvDone: '📥 CSV downloaded!',
        confirmClear: 'Delete all history?',
        recordDeleted: '🗑️ Record deleted',
        supplyType: 'Supply Type',
        meterClass: 'Meter Class',
        energyUnit: 'Energy Unit',
        supply1P2W: '1 Phase (1P2W)',
        supply3P3W: '3 Phase (3P3W)',
        supply3P4W: '3 Phase (3P4W)',
        historyEmpty: 'No records',
        historyCopy: '📋 Copy',
        historyClear: 'Clear All',
        tabScan: 'Scan',
        footerText: 'MeterCalc Pro v3.3 | SAMM 654 Accredited | For JAMAC Metering Sdn. Bhd.'
    }
};

const UIManager = {
    currentMainTab: 'calculatorPanel',
    currentLang: 'bm',
    desktopMode: false,

    t(key) {
        return LANG_DATA[this.currentLang][key] || key;
    },

    toggleLanguage() {
        this.currentLang = this.currentLang === 'bm' ? 'en' : 'bm';
        localStorage.setItem('metercalc_lang', this.currentLang);
        document.getElementById('btnLang').textContent = this.currentLang === 'bm' ? '🇲🇾' : '🇬🇧';
        this.updateAllLabels();
    },

    toggleTheme() {
        document.body.classList.toggle('light-theme');
        const icon = document.getElementById('themeIcon');
        if (document.body.classList.contains('light-theme')) {
            icon.innerHTML = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
        } else {
            icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
        }
        localStorage.setItem('metercalc_theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
    },

    toggleDesktopMode() {
        this.desktopMode = !this.desktopMode;
        if (this.desktopMode) {
            document.body.classList.add('desktop-mode');
            document.getElementById('desktopModeBtn')?.classList.add('active');
        } else {
            document.body.classList.remove('desktop-mode');
            document.getElementById('desktopModeBtn')?.classList.remove('active');
        }
        localStorage.setItem('metercalc_desktop_mode', this.desktopMode);
    },

    loadTheme() {
        const savedTheme = localStorage.getItem('metercalc_theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
            document.getElementById('themeIcon').innerHTML = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
        }
        
        const savedDesktopMode = localStorage.getItem('metercalc_desktop_mode');
        if (savedDesktopMode === 'true') {
            this.desktopMode = true;
            document.body.classList.add('desktop-mode');
            document.getElementById('desktopModeBtn')?.classList.add('active');
        }
        
        const savedLang = localStorage.getItem('metercalc_lang');
        if (savedLang === 'bm' || savedLang === 'en') {
            this.currentLang = savedLang;
            document.getElementById('btnLang').textContent = this.currentLang === 'bm' ? '🇲🇾' : '🇬🇧';
        }
        
        this.updateAllLabels();
    },

    updateAllLabels() {
        const lang = this.currentLang;
        const t = LANG_DATA[lang];
        
        // Update main tabs
        document.querySelectorAll('.main-tab .main-tab-label').forEach((label, index) => {
            const tabNames = ['Kalkulator', 'Tenaga', 'Accuracy Test', 'Batch Test', 'MD', 'Scan', 'Sejarah', 'Rujukan', 'Site'];
            const tabNamesEn = ['Calculator', 'Energy', 'Accuracy Test', 'Batch Test', 'MD', 'Scan', 'History', 'Reference', 'Site'];
            label.textContent = lang === 'bm' ? tabNames[index] : tabNamesEn[index];
        });
        
        // Update scan tab
        const scanTabLabel = document.querySelector('[data-panel="scanPanel"] .main-tab-label');
        if (scanTabLabel) scanTabLabel.textContent = t.tabScan;
        
        // Update footer
        const footer = document.querySelector('.app-footer p');
        if (footer) footer.textContent = t.footerText;
        
        // Update history buttons
        const historyBtns = document.querySelectorAll('#historyPanel .btn-text');
        if (historyBtns.length >= 2) {
            historyBtns[0].textContent = t.historyCopy;
            historyBtns[1].textContent = t.historyClear;
        }
        
        // Re-render history
        Calculator.renderHistory();
    },

    switchMainTab(panelId) {
        this.currentMainTab = panelId;
        
        document.querySelectorAll('.main-tab').forEach(tab => {
            const active = tab.dataset.panel === panelId;
            tab.classList.toggle('active', active);
        });
        
        const panels = ['calculatorPanel', 'calcResultsPanel', 'energyPanel', 'accuracyPanel', 'batchPanel', 'demandPanel', 'scanPanel', 'historyPanel', 'referencePanel', 'sitePanel'];
        panels.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
        
        const target = document.getElementById(panelId);
        if (target) target.style.display = 'block';
        
        // Special handling for calculator panel
        if (panelId === 'calculatorPanel') {
            document.getElementById('calculatorPanel').style.display = 'block';
        }
        
        // Refresh data when switching to history or site
        if (panelId === 'historyPanel') Calculator.renderHistory();
        if (panelId === 'sitePanel') SiteManager.displayCurrentJob();
    },

    switchCalcMode(mode) {
        Calculator.currentMode = mode;
        
        document.querySelectorAll('#calculatorPanel .mode-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.mode === mode);
        });
        
        // Show/hide CT/VT sections
        const ctSections = ['ctSectionDivider', 'ctInputSection', 'ctLiveRatio'];
        const vtSections = ['vtSectionDivider', 'vtInputSection', 'vtLiveRatio'];
        const presetRow = document.getElementById('presetRow');
        
        ctSections.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = mode === 'ct' || mode === 'ctvt' ? 'flex' : 'none';
        });
        
        vtSections.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = mode === 'ctvt' ? 'flex' : 'none';
        });
        
        if (presetRow) {
            presetRow.style.display = mode === 'ct' || mode === 'ctvt' ? 'flex' : 'none';
        }
        
        document.getElementById('calcResultsPanel').style.display = 'none';
    },

    updateEnergyMode() {
        const mode = document.getElementById('energyMode');
        const pulseBlock = document.getElementById('energyPulseCountBlock');
        const energyBlock = document.getElementById('energyInputBlock');
        
        if (mode && pulseBlock && energyBlock) {
            const isEnergyToPulse = mode.value === 'energyToPulse';
            pulseBlock.style.display = isEnergyToPulse ? 'none' : 'block';
            energyBlock.style.display = isEnergyToPulse ? 'block' : 'none';
        }
    },

    resetAll() {
        Calculator.currentMode = 'direct';
        this.switchCalcMode('direct');
        this.switchMainTab('calculatorPanel');
        
        document.querySelectorAll('input[type="number"]').forEach(input => {
            if (input.defaultValue) input.value = input.defaultValue;
            input.classList.remove('input-error');
        });
        
        document.querySelectorAll('select').forEach(select => {
            const defaultOption = Array.from(select.options).find(o => o.defaultSelected);
            if (defaultOption) select.value = defaultOption.value;
        });
        
        const resultPanels = ['calcResultsPanel', 'energyResult', 'demandResult', 'accResult'];
        resultPanels.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
        
        this.showToast(this.t('resetDone'), 'success');
    },

    clearHistory() {
        if (confirm(this.t('confirmClear'))) {
            Calculator.history = [];
            Calculator.saveHistory();
            Calculator.renderHistory();
            this.showToast(this.t('historyCleared'), 'success');
        }
    },

    copyAllHistory() {
        const csv = Calculator.exportHistoryCSV ? Calculator.exportHistoryCSV() : JSON.stringify(Calculator.history, null, 2);
        navigator.clipboard.writeText(csv).then(() => this.showToast(this.t('copied'), 'success'));
    },

    exportCSV() {
        let csv = 'Type,Date,Detail,Value\n';
        Calculator.history.forEach(h => {
            const date = new Date(h.timestamp).toISOString();
            if (h.type === 'calculator') {
                csv += `"Calculator","${date}","M=${Calculator.formatNumber(h.totalMultiplier)} ${h.supply}","${Calculator.formatNumber(h.primaryActive)} imp/kWh"\n`;
            } else if (h.type === 'energy') {
                csv += `"Pulse to Energy","${date}","${h.pulseCount}÷${h.pulseConst}×${h.multiplier}","${Calculator.formatEnergy(h.result, h.unit)}"\n`;
            } else if (h.type === 'demand') {
                csv += `"MD","${date}","${h.pulseCount} pulses","${Calculator.formatNumber(h.result)} kW"\n`;
            }
        });
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `metercalc_history_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast(this.t('csvDone'), 'success');
    },

    applyCTPreset() {
        const preset = document.getElementById('ctPreset').value;
        if (!preset) return;
        
        const [primary, secondary] = preset.split('/');
        document.getElementById('ctPrimary').value = primary;
        document.getElementById('ctSecondary').value = secondary;
        
        // Trigger live update
        const event = new Event('input', { bubbles: true });
        document.getElementById('ctPrimary').dispatchEvent(event);
        
        this.showToast(`CT set to ${primary}/${secondary}A`, 'success');
    },

    applyVTPreset() {
        const preset = document.getElementById('vtPreset').value;
        if (!preset) return;
        
        const [primary, secondary] = preset.split('/');
        document.getElementById('vtPrimary').value = primary;
        document.getElementById('vtSecondary').value = secondary;
        
        const event = new Event('input', { bubbles: true });
        document.getElementById('vtPrimary').dispatchEvent(event);
        
        this.showToast(`VT set to ${primary}/${secondary}V`, 'success');
    },

    showToast(msg, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = msg;
        toast.className = `toast ${type}`;
        toast.offsetHeight;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2500);
    }
};
