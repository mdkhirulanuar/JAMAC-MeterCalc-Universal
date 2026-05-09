/**
 * MeterCalc Universal - UI Manager
 */

const UIManager = {
    // Switch mode
    switchMode(mode) {
        Calculator.currentMode = mode;
        this.updateModeUI(mode);
        Calculator.updateLiveRatios();
        
        // Scroll to input
        document.getElementById('inputPanel').scrollIntoView({ behavior: 'smooth' });
        
        // Haptic
        if (navigator.vibrate) navigator.vibrate(8);
    },

    // Update mode tab visuals & form visibility
    updateModeUI(mode) {
        // Tabs
        document.querySelectorAll('.mode-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.mode === mode);
        });

        // CT Section
        const ctSection = document.getElementById('ctSection');
        const ctInputs = document.getElementById('ctInputs');
        const ctRatioDisplay = document.getElementById('ctRatioDisplay');

        // VT Section
        const vtSection = document.getElementById('vtSection');
        const vtInputs = document.getElementById('vtInputs');
        const vtRatioDisplay = document.getElementById('vtRatioDisplay');

        // Results ratio cards
        const ctResultCard = document.getElementById('ctResultCard');
        const vtResultCard = document.getElementById('vtResultCard');

        // Reset all first
        [ctSection, ctInputs, ctRatioDisplay, vtSection, vtInputs, vtRatioDisplay].forEach(el => {
            if (el) el.style.display = 'none';
        });
        if (ctResultCard) ctResultCard.style.display = 'none';
        if (vtResultCard) vtResultCard.style.display = 'none';

        // Apply based on mode
        switch(mode) {
            case 'direct':
                // Semua hidden - direct mode
                break;
            case 'ct':
                if (ctSection) ctSection.style.display = 'flex';
                if (ctInputs) ctInputs.style.display = 'grid';
                if (ctRatioDisplay) ctRatioDisplay.style.display = 'flex';
                if (ctResultCard) ctResultCard.style.display = 'block';
                break;
            case 'ctvt':
                if (ctSection) ctSection.style.display = 'flex';
                if (ctInputs) ctInputs.style.display = 'grid';
                if (ctRatioDisplay) ctRatioDisplay.style.display = 'flex';
                if (vtSection) vtSection.style.display = 'flex';
                if (vtInputs) vtInputs.style.display = 'grid';
                if (vtRatioDisplay) vtRatioDisplay.style.display = 'flex';
                if (ctResultCard) ctResultCard.style.display = 'block';
                if (vtResultCard) vtResultCard.style.display = 'block';
                break;
        }
    },

    // Toast notification
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        
        clearTimeout(this._toastTimeout);
        this._toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    },

    // Toggle light/dark theme
    toggleTheme() {
        const isLight = document.body.classList.toggle('light-theme');
        const icon = document.getElementById('themeIcon');
        
        if (isLight) {
            icon.innerHTML = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
        } else {
            icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
        }
        
        localStorage.setItem('metercalc_theme', isLight ? 'light' : 'dark');
    },

    // Load saved theme
    loadTheme() {
        const saved = localStorage.getItem('metercalc_theme');
        if (saved === 'light') {
            document.body.classList.add('light-theme');
            document.getElementById('themeIcon').innerHTML = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
        }
    },

    // Reset all
    resetAll() {
        Calculator.currentMode = 'direct';
        this.updateModeUI('direct');

        document.getElementById('meterConstActive').value = '1000';
        document.getElementById('meterConstReactive').value = '1000';
        document.getElementById('supplyType').value = '3P4W';
        document.getElementById('meterClass').value = '1';
        document.getElementById('ctPrimary').value = '';
        document.getElementById('ctSecondary').value = '5';
        document.getElementById('vtPrimary').value = '';
        document.getElementById('vtSecondary').value = '110';

        Calculator.updateLiveRatios();
        document.getElementById('resultsPanel').style.display = 'none';

        document.getElementById('inputPanel').scrollIntoView({ behavior: 'smooth' });
        this.showToast('🔄 Form dikosongkan!', 'success');
    },

    // Clear history
    clearHistory() {
        if (confirm('Padam semua sejarah pengiraan?')) {
            Calculator.history = [];
            Calculator.saveHistory();
            Calculator.renderHistory();
            this.showToast('🗑️ Sejarah dipadamkan!', 'success');
        }
    },

    // Share results
    shareResults() {
        const multiplier = document.getElementById('totalMultiplierValue').textContent;
        const primaryActive = document.getElementById('primaryActiveValue').textContent;
        const mode = Calculator.currentMode.toUpperCase();
        
        const text = `📊 MeterCalc Universal\n⚡ Mode: ${mode}\n📏 Total Multiplier: ${multiplier}\n🔌 Primary Pulse: ${primaryActive} imp/kWh\n\nDikira dengan MeterCalc Universal`;
        
        if (navigator.share) {
            navigator.share({ title: 'MeterCalc Result', text }).catch(() => {});
        } else {
            navigator.clipboard.writeText(text).then(() => {
                this.showToast('📋 Keputusan disalin!', 'success');
            });
        }
    },

    // Save current results to history explicitly
    saveToHistory() {
        // Results are auto-saved on calculate
        if (Calculator.history.length > 0) {
            this.showToast('💾 Tersimpan dalam sejarah!', 'success');
        }
    }
};
