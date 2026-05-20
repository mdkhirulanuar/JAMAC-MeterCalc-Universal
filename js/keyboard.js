// Keyboard Shortcuts for Desktop

const KeyboardShortcuts = {
    enabled: true,
    
    init() {
        document.addEventListener('keydown', (e) => {
            if (!this.enabled) return;
            
            // Alt + number for tab switching
            if (e.altKey && !e.ctrlKey && !e.shiftKey) {
                switch(e.key) {
                    case '1': this.switchTab('calculatorPanel'); e.preventDefault(); break;
                    case '2': this.switchTab('energyPanel'); e.preventDefault(); break;
                    case '3': this.switchTab('accuracyPanel'); e.preventDefault(); break;
                    case '4': this.switchTab('batchPanel'); e.preventDefault(); break;
                    case '5': this.switchTab('demandPanel'); e.preventDefault(); break;
                    case '6': this.switchTab('scanPanel'); e.preventDefault(); break;
                    case '7': this.switchTab('historyPanel'); e.preventDefault(); break;
                    case '8': this.switchTab('referencePanel'); e.preventDefault(); break;
                    case '9': this.switchTab('sitePanel'); e.preventDefault(); break;
                }
            }
            
            // Alt + C: Calculate
            if (e.altKey && e.key === 'c') {
                Calculator.calculate();
                e.preventDefault();
            }
            
            // Alt + R: Reset
            if (e.altKey && e.key === 'r') {
                UIManager.resetAll();
                e.preventDefault();
            }
            
            // Alt + L: Language toggle
            if (e.altKey && e.key === 'l') {
                UIManager.toggleLanguage();
                e.preventDefault();
            }
            
            // Alt + T: Theme toggle
            if (e.altKey && e.key === 't') {
                UIManager.toggleTheme();
                e.preventDefault();
            }
            
            // Ctrl + S: Save current calculation
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                const lastCalc = Calculator.history[0];
                if (lastCalc && lastCalc.type === 'calculator') {
                    PDFReport.generateFromCurrent();
                } else {
                    UIManager.showToast('Tiada pengiraan untuk disimpan', 'error');
                }
            }
            
            // Ctrl + P: Print report
            if (e.ctrlKey && e.key === 'p') {
                e.preventDefault();
                window.print();
            }
            
            // F1: Help
            if (e.key === 'F1') {
                e.preventDefault();
                this.showHelp();
            }
        });
    },
    
    switchTab(panelId) {
        UIManager.switchMainTab(panelId);
        UIManager.showToast(`Switched to ${panelId.replace('Panel', '')}`, 'success');
    },
    
    showHelp() {
        const helpHtml = `
            <div class="help-modal" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: var(--card); border: 2px solid var(--accent); border-radius: 16px; padding: 20px; max-width: 400px; z-index: 10000;">
                <h3>Keyboard Shortcuts</h3>
                <table style="width: 100%; margin: 15px 0;">
                    <tr><td><kbd>Alt+1</kbd></td><td>Calculator</td></tr>
                    <tr><td><kbd>Alt+2</kbd></td><td>Energy</td></tr>
                    <tr><td><kbd>Alt+3</kbd></td><td>Accuracy Test</td></tr>
                    <tr><td><kbd>Alt+4</kbd></td><td>Batch Test</td></tr>
                    <tr><td><kbd>Alt+5</kbd></td><td>MD</td></tr>
                    <tr><td><kbd>Alt+6</kbd></td><td>Scan</td></tr>
                    <tr><td><kbd>Alt+7</kbd></td><td>History</td></tr>
                    <tr><td><kbd>Alt+8</kbd></td><td>Reference</td></tr>
                    <tr><td><kbd>Alt+9</kbd></td><td>Site</td></tr>
                    <tr><td><kbd>Alt+C</kbd></td><td>Calculate</td></tr>
                    <tr><td><kbd>Alt+R</kbd></td><td>Reset All</td></tr>
                    <tr><td><kbd>Alt+L</kbd></td><td>Toggle Language</td></tr>
                    <tr><td><kbd>Alt+T</kbd></td><td>Toggle Theme</td></tr>
                    <tr><td><kbd>Ctrl+S</kbd></td><td>Save/Screenshot</td></tr>
                    <tr><td><kbd>Ctrl+P</kbd></td><td>Print Report</td></tr>
                </table>
                <button class="btn-calculate" onclick="document.querySelector('.help-modal').remove()">Close</button>
            </div>
            <div class="help-overlay" style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 9999;" onclick="document.querySelector('.help-modal')?.remove(); this.remove();"></div>
        `;
        document.body.insertAdjacentHTML('beforeend', helpHtml);
    },
    
    disable() {
        this.enabled = false;
    },
    
    enable() {
        this.enabled = true;
    }
};
