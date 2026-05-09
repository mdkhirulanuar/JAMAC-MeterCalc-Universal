/**
 * MeterCalc Pro - Core Calculation Engine
 * Features: Direct, CT, CT+VT, Energy, Accuracy, Demand
 * Multi-language support via Lang.get()
 */

const Calculator = {
    currentMode: 'direct',
    currentEnergyMode: 'pulse-to-energy',
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
            UIManager.showToast(Lang.get('toast-enter-constant'), 'error');
            document.getElementById('meterConstActive').focus();
            return;
        }

        let ctRatio = 1;
        let vtRatio = 1;

        if (this.currentMode === 'ct' || this.currentMode === 'ctvt') {
            if (!inputs.ctPrimary || !inputs.ctSecondary || inputs.ctSecondary <= 0) {
                UIManager.showToast(Lang.get('toast-enter-ct'), 'error');
                return;
            }
            ctRatio = inputs.ctPrimary / inputs.ctSecondary;
        }

        if (this.currentMode === 'ctvt') {
            if (!inputs.vtPrimary || !inputs.vtSecondary || inputs.vtSecondary <= 0) {
                UIManager.showToast(Lang.get('toast-enter-vt'), 'error');
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
            type: 'calculator',
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

        this.displayCalcResults(result);
        this.addToHistory(result);

        document.getElementById('calcResultsPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
        UIManager.showToast(Lang.get('toast-calc-done'), 'success');
        if (navigator.vibrate) navigator.vibrate([10, 20, 10]);
    },

    displayCalcResults(result) {
        const panel = document.getElementById('calcResultsPanel');
        const body = document.getElementById('calcResultsBody');
        panel.style.display = 'block';
        panel.style.animation = 'none';
        panel.offsetHeight;
        panel.style.animation = 'fadeInUp 0.3s ease-out';

        const modeLabels = {
            direct: Lang.get('result-direct-mode'),
            ct: Lang.get('result-ct-mode'),
            ctvt: Lang.get('result-ctvt-mode')
        };

        let html = `
            <div class="hero-result">
                <div class="hero-label">${Lang.get('result-total-multiplier')}</div>
                <div class="hero-value">${this.formatNumber(result.totalMultiplier)}</div>
                <div class="hero-sub">${modeLabels[result.mode]} • ${result.supply} • Cl.${result.meterClass}</div>
            </div>
            <div class="result-grid-2" id="ratioGrid">`;

        if (result.mode === 'ct' || result.mode === 'ctvt') {
            html += `
                <div class="result-card copyable" data-value="CT Ratio: ${this.formatNumber(result.ctRatio)} : 1" onclick="UIManager.copyFromCard(this)">
                    <div class="result-card-label">CT Ratio</div>
                    <div class="result-card-value">${this.formatNumber(result.ctRatio)} : 1</div>
                </div>`;
        }

        if (result.mode === 'ctvt') {
            html += `
                <div class="result-card copyable" data-value="VT Ratio: ${this.formatNumber(result.vtRatio)} : 1" onclick="UIManager.copyFromCard(this)">
                    <div class="result-card-label">VT Ratio</div>
                    <div class="result-card-value">${this.formatNumber(result.vtRatio)} : 1</div>
                </div>`;
        }

        html += `</div>
            <div class="section-divider">
                <div class="divider-line"></div>
                <span class="divider-text">${Lang.get('result-pulse-constants')}</span>
                <div class="divider-line"></div>
            </div>
            <div class="result-grid-2">
                <div class="result-card pulse-card copyable" data-value="Primary Active: ${this.formatNumber(result.primaryActive)} imp/kWh" onclick="UIManager.copyFromCard(this)">
                    <div class="result-card-label">${Lang.get('result-primary-active')}</div>
                    <div class="result-card-value">${result.primaryActive < 0.001 ? result.primaryActive.toExponential(4) : this.formatNumber(result.primaryActive)}</div>
                    <div class="result-card-unit">imp/kWh</div>
                </div>
                <div class="result-card pulse-card copyable" data-value="Secondary Active: ${this.formatNumber(result.secondaryActive)} imp/kWh" onclick="UIManager.copyFromCard(this)">
                    <div class="result-card-label">${Lang.get('result-secondary-active')}</div>
                    <div class="result-card-value">${this.formatNumber(result.secondaryActive)}</div>
                    <div class="result-card-unit">imp/kWh</div>
                </div>
            </div>`;

        if (result.primaryReactive > 0) {
            html += `
            <div class="result-grid-2">
                <div class="result-card pulse-card copyable" data-value="Primary Reactive: ${this.formatNumber(result.primaryReactive)} imp/kvarh" onclick="UIManager.copyFromCard(this)">
                    <div class="result-card-label">${Lang.get('result-primary-reactive')}</div>
                    <div class="result-card-value">${result.primaryReactive < 0.001 ? result.primaryReactive.toExponential(4) : this.formatNumber(result.primaryReactive)}</div>
                    <div class="result-card-unit">imp/kvarh</div>
                </div>
                <div class="result-card pulse-card copyable" data-value="Secondary Reactive: ${this.formatNumber(result.secondaryReactive)} imp/kvarh" onclick="UIManager.copyFromCard(this)">
                    <div class="result-card-label">${Lang.get('result-secondary-reactive')}</div>
                    <div class="result-card-value">${this.formatNumber(result.secondaryReactive)}</div>
                    <div class="result-card-unit">imp/kvarh</div>
                </div>
            </div>`;
        }

        html += `
            <div class="formula-box">
                <div class="formula-title">📐 ${Lang.get('result-formula')}</div>
                <div class="formula-content">${this.getFormulaText(result)}</div>
            </div>`;

        body.innerHTML = html;
    },

    getFormulaText(result) {
        if (result.mode === 'direct') {
            return `<code>M = 1 (Direct)</code><br><code>Primary Pulse = K<sub>m</sub> ÷ 1 = ${this.formatNumber(result.primaryActive)} imp/kWh</code>`;
        } else if (result.mode === 'ct') {
            return `<code>M = ${this.formatNumber(result.ctPrimary)} ÷ ${this.formatNumber(result.ctSecondary)} = <strong>${this.formatNumber(result.totalMultiplier)}</strong></code><br><code>Primary Pulse = ${this.formatNumber(result.secondaryActive)} ÷ ${this.formatNumber(result.totalMultiplier)} = <strong>${this.formatNumber(result.primaryActive)} imp/kWh</strong></code>`;
        } else {
            return `<code>M = CT × VT = (${this.formatNumber(result.ctPrimary)} ÷ ${this.formatNumber(result.ctSecondary)}) × (${this.formatNumber(result.vtPrimary)} ÷ ${this.formatNumber(result.vtSecondary)})</code><br><code>M = ${this.formatNumber(result.ctRatio)} × ${this.formatNumber(result.vtRatio)} = <strong>${this.formatNumber(result.totalMultiplier)}</strong></code><br><code>Primary Pulse = ${this.formatNumber(result.secondaryActive)} ÷ ${this.formatNumber(result.totalMultiplier)} = <strong>${this.formatNumber(result.primaryActive)} imp/kWh</strong></code>`;
        }
    },

    calculateEnergy() {
        if (this.currentEnergyMode === 'pulse-to-energy') {
            this.calculatePulseToEnergy();
        } else {
            this.calculateEnergyToPulse();
        }
    },

    calculatePulseToEnergy() {
        const pulseCount = parseFloat(document.getElementById('energyPulseCount').value);
        const pulseConst = parseFloat(document.getElementById('energyPulseConst').value);
        const multiplier = parseFloat(document.getElementById('energyMultiplier').value) || 1;

        if (!pulseCount || pulseCount <= 0) {
            UIManager.showToast(Lang.get('toast-enter-pulse'), 'error');
            return;
        }
        if (!pulseConst || pulseConst <= 0) {
            UIManager.showToast(Lang.get('toast-enter-constant'), 'error');
            return;
        }

        const energy = (pulseCount / pulseConst) * multiplier;

        document.getElementById('energyResult').style.display = 'block';
        document.getElementById('energyResultValue').textContent = this.formatNumber(energy) + ' kWh';

        this.addToHistory({
            type: 'energy',
            mode: 'pulse-to-energy',
            pulseCount,
            pulseConst,
            multiplier,
            result: energy,
            timestamp: new Date().toISOString()
        });

        UIManager.showToast(Lang.get('toast-energy-done'), 'success');
    },

    calculateEnergyToPulse() {
        const energy = parseFloat(document.getElementById('energyTarget').value);
        const pulseConst = parseFloat(document.getElementById('energyPulseConst2').value);
        const multiplier = parseFloat(document.getElementById('energyMultiplier2').value) || 1;

        if (!energy || energy <= 0) {
            UIManager.showToast(Lang.get('toast-enter-energy'), 'error');
            return;
        }
        if (!pulseConst || pulseConst <= 0) {
            UIManager.showToast(Lang.get('toast-enter-constant'), 'error');
            return;
        }

        const pulses = (energy * pulseConst) / multiplier;

        document.getElementById('energyResult').style.display = 'block';
        document.getElementById('energyResultValue').textContent = this.formatNumber(pulses) + ' pulses';

        this.addToHistory({
            type: 'energy',
            mode: 'energy-to-pulse',
            energy,
            pulseConst,
            multiplier,
            result: pulses,
            timestamp: new Date().toISOString()
        });

        UIManager.showToast(Lang.get('toast-pulse-done'), 'success');
    },

    calculateAccuracy() {
        const reference = parseFloat(document.getElementById('accReference').value);
        const meterReading = parseFloat(document.getElementById('accMeterReading').value);
        const meterClass = document.getElementById('accMeterClass').value;

        if (!reference || reference <= 0) {
            UIManager.showToast(Lang.get('toast-enter-reference'), 'error');
            return;
        }
        if (!meterReading || meterReading <= 0) {
            UIManager.showToast(Lang.get('toast-enter-meter-reading'), 'error');
            return;
        }

        const errorPercent = ((meterReading - reference) / reference) * 100;
        const absError = Math.abs(errorPercent);

        const limits = { '0.2S': 0.2, '0.5S': 0.5, '0.5': 0.5, '1': 1, '2': 2 };
        const limit = limits[meterClass] || 1;
        const passed = absError <= limit;

        document.getElementById('accuracyResult').style.display = 'block';
        document.getElementById('accuracyResultValue').textContent = errorPercent.toFixed(4) + ' %';

        const statusEl = document.getElementById('accuracyStatus');
        if (passed) {
            statusEl.textContent = Lang.get('accuracy-pass') + ' Class ' + meterClass + ' (±' + limit + '%)';
            statusEl.className = 'calc-result-status pass';
        } else {
            statusEl.textContent = Lang.get('accuracy-fail') + ' Class ' + meterClass + ' (±' + limit + '%)';
            statusEl.className = 'calc-result-status fail';
        }

        this.addToHistory({
            type: 'accuracy',
            reference,
            meterReading,
            meterClass,
            errorPercent,
            passed,
            timestamp: new Date().toISOString()
        });

        UIManager.showToast(passed ? Lang.get('toast-accuracy-pass') : Lang.get('toast-accuracy-fail'), passed ? 'success' : 'error');
    },

    calculateDemand() {
        const pulseCount = parseFloat(document.getElementById('demandPulseCount').value);
        const pulseConst = parseFloat(document.getElementById('demandPulseConst').value);
        const multiplier = parseFloat(document.getElementById('demandMultiplier').value) || 1;

        if (!pulseCount || pulseCount <= 0) {
            UIManager.showToast(Lang.get('toast-enter-pulse'), 'error');
            return;
        }
        if (!pulseConst || pulseConst <= 0) {
            UIManager.showToast(Lang.get('toast-enter-constant'), 'error');
            return;
        }

        const md = (pulseCount * multiplier * 3600) / (pulseConst * 1800);

        document.getElementById('demandResult').style.display = 'block';
        document.getElementById('demandResultValue').textContent = this.formatNumber(md) + ' kW';

        this.addToHistory({
            type: 'demand',
            pulseCount,
            pulseConst,
            multiplier,
            result: md,
            timestamp: new Date().toISOString()
        });

        UIManager.showToast(Lang.get('toast-demand-done'), 'success');
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
        const ctDisplay = document.getElementById('ctLiveRatio');
        const ctValue = document.getElementById('ctLiveRatioValue');

        if (this.currentMode === 'ct' || this.currentMode === 'ctvt') {
            ctDisplay.style.display = 'flex';
            if (ctPrimary && ctSecondary && ctSecondary > 0) {
                ctValue.textContent = (ctPrimary / ctSecondary).toFixed(2) + ' : 1';
                ctValue.style.color = 'var(--accent)';
            } else {
                ctValue.textContent = Lang.get('live-enter-value');
                ctValue.style.color = 'var(--text3)';
            }
        } else {
            ctDisplay.style.display = 'none';
        }

        const vtPrimary = parseFloat(document.getElementById('vtPrimary').value);
        const vtSecondary = parseFloat(document.getElementById('vtSecondary').value);
        const vtDisplay = document.getElementById('vtLiveRatio');
        const vtValue = document.getElementById('vtLiveRatioValue');

        if (this.currentMode === 'ctvt') {
            vtDisplay.style.display = 'flex';
            if (vtPrimary && vtSecondary && vtSecondary > 0) {
                vtValue.textContent = (vtPrimary / vtSecondary).toFixed(2) + ' : 1';
                vtValue.style.color = 'var(--accent)';
            } else {
                vtValue.textContent = Lang.get('live-enter-value');
                vtValue.style.color = 'var(--text3)';
            }
        } else {
            vtDisplay.style.display = 'none';
        }
    },

    addToHistory(entry) {
        this.history.unshift({ id: Date.now(), ...entry });
        if (this.history.length > 50) this.history.pop();
        this.saveHistory();
        this.renderHistory();
    },

    saveHistory() {
        try { localStorage.setItem('metercalc_pro_history', JSON.stringify(this.history)); } catch (e) {}
    },

    loadHistory() {
        try {
            const saved = localStorage.getItem('metercalc_pro_history');
            if (saved) this.history = JSON.parse(saved);
        } catch (e) { this.history = []; }
    },

    renderHistory() {
        const container = document.getElementById('historyList');
        const btnClear = document.getElementById('btnClearHistory');

        if (this.history.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">📭</span>
                    <p>${Lang.get('history-empty')}</p>
                </div>`;
            btnClear.style.display = 'none';
            return;
        }

        btnClear.style.display = 'inline-block';

        container.innerHTML = this.history.slice(0, 30).map(h => {
            const date = new Date(h.timestamp);
            const timeStr = date.toLocaleDateString('ms-MY') + ' ' + date.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' });

            let typeLabel, dotClass, detail, value;

            if (h.type === 'calculator') {
                const modeLabels = { direct: 'DIRECT', ct: 'CT', ctvt: 'CT+VT' };
                typeLabel = '🔌 ' + (modeLabels[h.mode] || h.mode);
                dotClass = h.mode || 'direct';
                detail = `M = ${this.formatNumber(h.totalMultiplier)} | ${h.supply} Cl.${h.meterClass}`;
                value = this.formatNumber(h.primaryActive) + ' imp/kWh';
            } else if (h.type === 'energy') {
                typeLabel = h.mode === 'pulse-to-energy' ? '🔢 Pulse→Tenaga' : '🔢 Tenaga→Pulse';
                dotClass = 'energy';
                detail = h.mode === 'pulse-to-energy'
                    ? `${this.formatNumber(h.pulseCount)} pulse ÷ ${this.formatNumber(h.pulseConst)} × ${this.formatNumber(h.multiplier)}`
                    : `${this.formatNumber(h.energy)} kWh × ${this.formatNumber(h.pulseConst)} ÷ ${this.formatNumber(h.multiplier)}`;
                value = h.mode === 'pulse-to-energy' ? this.formatNumber(h.result) + ' kWh' : this.formatNumber(h.result) + ' pulses';
            } else if (h.type === 'accuracy') {
                typeLabel = '📊 ACCURACY';
                dotClass = 'accuracy';
                detail = `Ref: ${this.formatNumber(h.reference)} | MUT: ${this.formatNumber(h.meterReading)} | Cl.${h.meterClass}`;
                value = h.errorPercent.toFixed(4) + '% ' + (h.passed ? '✅' : '❌');
            } else if (h.type === 'demand') {
                typeLabel = '🕐 MD';
                dotClass = 'demand';
                detail = `${this.formatNumber(h.pulseCount)} pulse ÷ ${this.formatNumber(h.pulseConst)} × ${this.formatNumber(h.multiplier)}`;
                value = this.formatNumber(h.result) + ' kW';
            }

            return `
                <div class="history-item">
                    <div class="history-left">
                        <div class="history-dot ${dotClass}"></div>
                        <div class="history-info">
                            <div class="history-type">${typeLabel}</div>
                            <div class="history-detail">${detail}</div>
                        </div>
                    </div>
                    <div class="history-right">
                        <div class="history-value">${value}</div>
                        <div class="history-time">${timeStr}</div>
                    </div>
                </div>
            `;
        }).join('');
    },

    formatNumber(num) {
        if (num === undefined || num === null) return '-';
        if (Number.isInteger(num)) return num.toLocaleString('ms-MY');
        return parseFloat(num.toFixed(6)).toString();
    }
};
