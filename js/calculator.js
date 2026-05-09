/**
 * MeterCalc Universal - Core Calculation Engine
 * Menyokong: DIRECT, CT, CT+VT
 */

const Calculator = {
    currentMode: 'direct',
    history: [],

    init() {
        this.loadHistory();
        this.renderHistory();
        this.attachLiveListeners();
    },

    getInputValues() {
        return {
            mode: this.currentMode,
            meterConstActive: parseFloat(document.getElementById('meterConstActive').value) || 0,
            meterConstReactive: parseFloat(document.getElementById('meterConstReactive').value) || 0,
            supply: document.getElementById('supplyType').value,
            meterClass: document.getElementById('meterClass').value,
            ctPrimary: parseFloat(document.getElementById('ctPrimary').value) || null,
            ctSecondary: parseFloat(document.getElementById('ctSecondary').value) || null,
            vtPrimary: parseFloat(document.getElementById('vtPrimary').value) || null,
            vtSecondary: parseFloat(document.getElementById('vtSecondary').value) || null
        };
    },

    calculate() {
        const inputs = this.getInputValues();
        
        if (!inputs.meterConstActive || inputs.meterConstActive <= 0) {
            UIManager.showToast('Sila masukkan Meter Constant Active!', 'error');
            document.getElementById('meterConstActive').focus();
            return;
        }

        let ctRatio = 1;
        let vtRatio = 1;

        if (this.currentMode === 'ct' || this.currentMode === 'ctvt') {
            if (!inputs.ctPrimary || !inputs.ctSecondary || inputs.ctSecondary <= 0) {
                UIManager.showToast('Sila masukkan nilai CT!', 'error');
                return;
            }
            ctRatio = inputs.ctPrimary / inputs.ctSecondary;
        }

        if (this.currentMode === 'ctvt') {
            if (!inputs.vtPrimary || !inputs.vtSecondary || inputs.vtSecondary <= 0) {
                UIManager.showToast('Sila masukkan nilai VT!', 'error');
                return;
            }
            vtRatio = inputs.vtPrimary / inputs.vtSecondary;
        }

        const totalMultiplier = ctRatio * vtRatio;
        const primaryActive = inputs.meterConstActive / totalMultiplier;
        const secondaryActive = inputs.meterConstActive;

        let primaryReactive = 0;
        let secondaryReactive = 0;
        if (inputs.meterConstReactive > 0) {
            primaryReactive = inputs.meterConstReactive / totalMultiplier;
            secondaryReactive = inputs.meterConstReactive;
        }

        const result = {
            ...inputs,
            ctRatio,
            vtRatio,
            totalMultiplier,
            primaryActive,
            secondaryActive,
            primaryReactive,
            secondaryReactive,
            timestamp: new Date().toISOString()
        };

        this.displayResults(result);
        this.addToHistory(result);

        document.getElementById('resultsPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
        UIManager.showToast('✅ Pengiraan selesai!', 'success');

        if (navigator.vibrate) navigator.vibrate([10, 20, 10]);
    },

    displayResults(result) {
        const panel = document.getElementById('resultsPanel');
        panel.style.display = 'block';
        panel.style.animation = 'none';
        panel.offsetHeight;
        panel.style.animation = 'fadeInUp 0.3s ease-out';

        document.getElementById('totalMultiplierValue').textContent = this.formatNumber(result.totalMultiplier);
        
        const modeLabels = { direct: 'DIRECT • Tiada CT/VT', ct: 'CT Sahaja', ctvt: 'CT + VT (High Voltage)' };
        document.getElementById('modeInfo').textContent = `${modeLabels[result.mode]} • ${result.supply} • Cl.${result.meterClass}`;

        const ctCard = document.getElementById('ctResultCard');
        if (result.mode === 'direct') {
            ctCard.style.display = 'none';
        } else {
            ctCard.style.display = 'block';
            document.getElementById('ctResultValue').textContent = this.formatNumber(result.ctRatio) + ' : 1';
        }

        const vtCard = document.getElementById('vtResultCard');
        if (result.mode === 'ctvt') {
            vtCard.style.display = 'block';
            document.getElementById('vtResultValue').textContent = this.formatNumber(result.vtRatio) + ' : 1';
        } else {
            vtCard.style.display = 'none';
        }

        document.getElementById('primaryActiveValue').textContent = result.primaryActive < 0.001 ? 
            result.primaryActive.toExponential(4) : this.formatNumber(result.primaryActive);
        document.getElementById('secondaryActiveValue').textContent = this.formatNumber(result.secondaryActive);

        const reactiveGrid = document.getElementById('reactiveGrid');
        if (result.primaryReactive > 0) {
            reactiveGrid.style.display = 'grid';
            document.getElementById('primaryReactiveValue').textContent = result.primaryReactive < 0.001 ? 
                result.primaryReactive.toExponential(4) : this.formatNumber(result.primaryReactive);
            document.getElementById('secondaryReactiveValue').textContent = this.formatNumber(result.secondaryReactive);
        } else {
            reactiveGrid.style.display = 'none';
        }

        let formulaHTML = '';
        if (result.mode === 'direct') {
            formulaHTML = `<code>M = 1 (Direct)</code><br><code>Primary Pulse = K<sub>m</sub> ÷ 1 = ${this.formatNumber(result.primaryActive)} imp/kWh</code>`;
        } else if (result.mode === 'ct') {
            formulaHTML = `<code>M = CT Ratio = ${this.formatNumber(result.ctPrimary)} ÷ ${this.formatNumber(result.ctSecondary)} = <strong>${this.formatNumber(result.totalMultiplier)}</strong></code><br><code>Primary Pulse = ${this.formatNumber(result.secondaryActive)} ÷ ${this.formatNumber(result.totalMultiplier)} = <strong>${this.formatNumber(result.primaryActive)} imp/kWh</strong></code>`;
        } else {
            formulaHTML = `<code>M = CT × VT = (${this.formatNumber(result.ctPrimary)} ÷ ${this.formatNumber(result.ctSecondary)}) × (${this.formatNumber(result.vtPrimary)} ÷ ${this.formatNumber(result.vtSecondary)})</code><br><code>M = ${this.formatNumber(result.ctRatio)} × ${this.formatNumber(result.vtRatio)} = <strong>${this.formatNumber(result.totalMultiplier)}</strong></code><br><code>Primary Pulse = ${this.formatNumber(result.secondaryActive)} ÷ ${this.formatNumber(result.totalMultiplier)} = <strong>${this.formatNumber(result.primaryActive)} imp/kWh</strong></code>`;
        }
        document.getElementById('formulaContent').innerHTML = formulaHTML;
    },

    formatNumber(num) {
        if (Number.isInteger(num)) return num.toLocaleString('ms-MY');
        return parseFloat(num.toFixed(6)).toString();
    },

    attachLiveListeners() {
        const updateRatios = () => this.updateLiveRatios();
        ['ctPrimary', 'ctSecondary', 'vtPrimary', 'vtSecondary'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', updateRatios);
        });
    },

    updateLiveRatios() {
        const ctPrimary = parseFloat(document.getElementById('ctPrimary').value);
        const ctSecondary = parseFloat(document.getElementById('ctSecondary').value);
        const ctDisplay = document.getElementById('ctRatioDisplay');
        const ctValue = document.getElementById('ctRatioValue');

        if (this.currentMode === 'ct' || this.currentMode === 'ctvt') {
            ctDisplay.style.display = 'flex';
            if (ctPrimary && ctSecondary && ctSecondary > 0) {
                ctValue.textContent = (ctPrimary / ctSecondary).toFixed(2) + ' : 1';
                ctValue.style.color = 'var(--accent)';
            } else {
                ctValue.textContent = 'Masukkan nilai';
                ctValue.style.color = 'var(--text3)';
            }
        } else {
            ctDisplay.style.display = 'none';
        }

        const vtPrimary = parseFloat(document.getElementById('vtPrimary').value);
        const vtSecondary = parseFloat(document.getElementById('vtSecondary').value);
        const vtDisplay = document.getElementById('vtRatioDisplay');
        const vtValue = document.getElementById('vtRatioValue');

        if (this.currentMode === 'ctvt') {
            vtDisplay.style.display = 'flex';
            if (vtPrimary && vtSecondary && vtSecondary > 0) {
                vtValue.textContent = (vtPrimary / vtSecondary).toFixed(2) + ' : 1';
                vtValue.style.color = 'var(--accent)';
            } else {
                vtValue.textContent = 'Masukkan nilai';
                vtValue.style.color = 'var(--text3)';
            }
        } else {
            vtDisplay.style.display = 'none';
        }
    },

    addToHistory(result) {
        this.history.unshift({ id: Date.now(), ...result });
        if (this.history.length > 30) this.history.pop();
        this.saveHistory();
        this.renderHistory();
    },

    saveHistory() {
        try { localStorage.setItem('metercalc_history', JSON.stringify(this.history)); } catch(e) {}
    },

    loadHistory() {
        try {
            const saved = localStorage.getItem('metercalc_history');
            if (saved) this.history = JSON.parse(saved);
        } catch(e) { this.history = []; }
    },

    renderHistory() {
        const container = document.getElementById('historyList');
        const btnClear = document.getElementById('btnClearHistory');

        if (this.history.length === 0) {
            container.innerHTML = `<div class="empty-state"><span class="empty-icon">📭</span><p>Tiada rekod pengiraan</p></div>`;
            btnClear.style.display = 'none';
            return;
        }

        btnClear.style.display = 'block';

        container.innerHTML = this.history.slice(0, 20).map(h => {
            const date = new Date(h.timestamp);
            const timeStr = date.toLocaleDateString('ms-MY') + ' ' + date.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' });
            const modeLabels = { direct: 'DIRECT', ct: 'CT', ctvt: 'CT+VT' };
            return `
                <div class="history-item" onclick="Calculator.loadHistoryItem(${h.id})">
                    <div class="history-left">
                        <div class="history-dot ${h.mode}"></div>
                        <div class="history-info">
                            <div class="history-mode">${modeLabels[h.mode]} • ${h.supply} • Cl.${h.meterClass}</div>
                            <div class="history-value">M = ${Calculator.formatNumber(h.totalMultiplier)} | Pulse: ${Calculator.formatNumber(h.primaryActive)} imp/kWh</div>
                        </div>
                    </div>
                    <div class="history-time">${timeStr}</div>
                </div>
            `;
        }).join('');
    },

    loadHistoryItem(id) {
        const item = this.history.find(h => h.id === id);
        if (!item) return;

        this.currentMode = item.mode;
        UIManager.updateModeUI(item.mode);

        document.getElementById('meterConstActive').value = item.meterConstActive;
        document.getElementById('meterConstReactive').value = item.meterConstReactive;
        document.getElementById('supplyType').value = item.supply;
        document.getElementById('meterClass').value = item.meterClass;
        if (item.ctPrimary) document.getElementById('ctPrimary').value = item.ctPrimary;
        if (item.ctSecondary) document.getElementById('ctSecondary').value = item.ctSecondary;
        if (item.vtPrimary) document.getElementById('vtPrimary').value = item.vtPrimary;
        if (item.vtSecondary) document.getElementById('vtSecondary').value = item.vtSecondary;

        this.updateLiveRatios();
        this.displayResults(item);
        document.getElementById('resultsPanel').scrollIntoView({ behavior: 'smooth' });
        UIManager.showToast('📋 Sejarah dimuatkan!', 'success');
    }
};
