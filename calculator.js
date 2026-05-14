const Calculator = {
    currentMode: 'direct',
    history: [],

    init() {
        this.loadHistory();
        this.renderHistory();
        this.attachLiveListeners();
        this.attachInputValidators();
    },

    attachInputValidators() {
        document.querySelectorAll('input[type="number"]').forEach(input => {
            input.addEventListener('input', () => {
                const value = input.value.trim();
                if (value === '') {
                    input.setCustomValidity('');
                    input.classList.remove('input-error');
                    return;
                }

                const parsed = Number(value);
                if (!Number.isFinite(parsed) || parsed < 0) {
                    input.setCustomValidity('Nilai mesti nombor positif atau sifar');
                    input.classList.add('input-error');
                } else {
                    input.setCustomValidity('');
                    input.classList.remove('input-error');
                }
            });
        });
    },

    getNumber(id) {
        const el = document.getElementById(id);
        if (!el) return NaN;
        const value = Number(el.value);
        return Number.isFinite(value) ? value : NaN;
    },

    isValidPositive(value) {
        return Number.isFinite(value) && value > 0;
    },

    isValidNonNegative(value) {
        return Number.isFinite(value) && value >= 0;
    },

    calculate() {
        const meterConstActive = this.getNumber('meterConstActive');
        const meterConstReactiveRaw = this.getNumber('meterConstReactive');
        const meterConstReactive = this.isValidNonNegative(meterConstReactiveRaw) ? meterConstReactiveRaw : 0;
        const supply = document.getElementById('supplyType').value;
        const meterClass = document.getElementById('meterClass').value;

        if (!this.isValidPositive(meterConstActive)) {
            UIManager.showToast(UIManager.t('errConstActive'), 'error');
            return;
        }

        let ctRatio = 1;
        let vtRatio = 1;

        if (this.currentMode === 'ct' || this.currentMode === 'ctvt') {
            const ctP = this.getNumber('ctPrimary');
            const ctS = this.getNumber('ctSecondary');
            if (!this.isValidPositive(ctP)) { UIManager.showToast(UIManager.t('errCTPrimary'), 'error'); return; }
            if (!this.isValidPositive(ctS)) { UIManager.showToast(UIManager.t('errCTSecondary'), 'error'); return; }
            if (ctS > ctP) { UIManager.showToast(UIManager.t('warnCTSwap'), 'error'); return; }
            ctRatio = ctP / ctS;
        }

        if (this.currentMode === 'ctvt') {
            const vtP = this.getNumber('vtPrimary');
            const vtS = this.getNumber('vtSecondary');
            if (!this.isValidPositive(vtP)) { UIManager.showToast(UIManager.t('errVTPrimary'), 'error'); return; }
            if (!this.isValidPositive(vtS)) { UIManager.showToast(UIManager.t('errVTSecondary'), 'error'); return; }
            if (vtS > vtP) { UIManager.showToast(UIManager.t('warnVTSwap'), 'error'); return; }
            vtRatio = vtP / vtS;
        }

        const totalMultiplier = ctRatio * vtRatio;
        const primaryActive = meterConstActive / totalMultiplier;
        const secondaryActive = meterConstActive;
        const primaryReactive = meterConstReactive > 0 ? meterConstReactive / totalMultiplier : 0;
        const secondaryReactive = meterConstReactive > 0 ? meterConstReactive : 0;

        this.displayCalcResults({
            type: 'calculator',
            mode: this.currentMode,
            supply,
            meterClass,
            meterConstActive,
            meterConstReactive,
            ctRatio,
            vtRatio,
            totalMultiplier,
            primaryActive,
            secondaryActive,
            primaryReactive,
            secondaryReactive,
            timestamp: new Date().toISOString()
        });

        document.getElementById('calcResultsPanel').scrollIntoView({ behavior: 'smooth' });
        UIManager.showToast(UIManager.t('calcDone'), 'success');
        if (navigator.vibrate) navigator.vibrate([10, 20, 10]);
    },

    displayCalcResults(result) {
        const panel = document.getElementById('calcResultsPanel');
        const body = document.getElementById('calcResultsBody');
        panel.style.display = 'block';

        const labels = { direct: 'DIRECT', ct: 'CT', ctvt: 'CT+VT' };
        const formula = result.mode === 'direct'
            ? 'M = 1'
            : result.mode === 'ct'
                ? `M = ${this.formatNumber(result.ctRatio)} = CT ratio`
                : `M = ${this.formatNumber(result.ctRatio)} × ${this.formatNumber(result.vtRatio)} = ${this.formatNumber(result.totalMultiplier)}`;

        let html = `
            <div class="hero-result">
                <div class="hero-label">TOTAL MULTIPLIER</div>
                <div class="hero-value">${this.formatNumber(result.totalMultiplier)}</div>
                <div class="hero-sub">${labels[result.mode]} • ${result.supply} • Cl.${result.meterClass}</div>
            </div>`;

        if (result.mode !== 'direct') {
            html += `
                <div class="result-grid-2">
                    <div class="result-card">
                        <div class="result-card-label">CT Ratio</div>
                        <div class="result-card-value">${this.formatNumber(result.ctRatio)} : 1</div>
                    </div>`;
            if (result.mode === 'ctvt') {
                html += `
                    <div class="result-card">
                        <div class="result-card-label">VT Ratio</div>
                        <div class="result-card-value">${this.formatNumber(result.vtRatio)} : 1</div>
                    </div>`;
            }
            html += '</div>';
        }

        html += `
            <div class="formula-box">
                <div class="formula-title">Formula</div>
                <div class="formula-content"><code>${formula}</code></div>
            </div>
            <div class="section-divider"><div class="divider-line"></div><span class="divider-text">PULSE CONSTANTS</span><div class="divider-line"></div></div>
            <div class="result-grid-2">
                <div class="result-card pulse-card">
                    <div class="result-card-label">Primary Active</div>
                    <div class="result-card-value">${this.formatPulseConstant(result.primaryActive)}</div>
                    <div class="result-card-unit">imp/kWh</div>
                </div>
                <div class="result-card pulse-card">
                    <div class="result-card-label">Secondary Active</div>
                    <div class="result-card-value">${this.formatNumber(result.secondaryActive)}</div>
                    <div class="result-card-unit">imp/kWh</div>
                </div>
            </div>`;

        if (result.primaryReactive > 0) {
            html += `
                <div class="result-grid-2">
                    <div class="result-card pulse-card">
                        <div class="result-card-label">Primary Reactive</div>
                        <div class="result-card-value">${this.formatPulseConstant(result.primaryReactive)}</div>
                        <div class="result-card-unit">imp/kvarh</div>
                    </div>
                    <div class="result-card pulse-card">
                        <div class="result-card-label">Secondary Reactive</div>
                        <div class="result-card-value">${this.formatNumber(result.secondaryReactive)}</div>
                        <div class="result-card-unit">imp/kvarh</div>
                    </div>
                </div>`;
        }

        html += `<div class="action-buttons"><button class="btn-action btn-share" onclick="UIManager.shareCalculatorResult()">📤 Kongsi</button></div>`;
        body.innerHTML = html;
        this.addToHistory(result);
    },

    calculateEnergy() {
        const mode = document.getElementById('energyMode') ? document.getElementById('energyMode').value : 'pulseToEnergy';
        const unit = document.getElementById('energyUnit').value;
        const pConst = this.getNumber('energyPulseConst');
        const multRaw = this.getNumber('energyMultiplier');
        const mult = this.isValidPositive(multRaw) ? multRaw : 1;

        if (!this.isValidPositive(pConst)) {
            UIManager.showToast(UIManager.t('errPulseConst'), 'error');
            return;
        }

        const resultPanel = document.getElementById('energyResult');
        const resultValue = document.getElementById('energyResultValue');
        resultPanel.style.display = 'block';

        if (mode === 'energyToPulse') {
            const energyInput = this.getNumber('energyInputValue');
            if (!this.isValidNonNegative(energyInput)) {
                UIManager.showToast(UIManager.t('errEnergyValue'), 'error');
                return;
            }
            const energyKWh = unit === 'MWh' ? energyInput * 1000 : energyInput;
            const pulse = (energyKWh * pConst) / mult;
            resultValue.textContent = `${this.formatNumber(pulse)} pulse`;
            this.addToHistory({ type: 'energyToPulse', energyInput, pulseConst: pConst, multiplier: mult, unit, result: pulse, timestamp: new Date().toISOString() });
        } else {
            const pc = this.getNumber('energyPulseCount');
            if (!this.isValidNonNegative(pc)) {
                UIManager.showToast(UIManager.t('errPulseCount'), 'error');
                return;
            }
            let energy = (pc / pConst) * mult;
            if (unit === 'MWh') energy /= 1000;
            resultValue.textContent = this.formatEnergy(energy, unit);
            this.addToHistory({ type: 'energy', pulseCount: pc, pulseConst: pConst, multiplier: mult, unit, result: energy, timestamp: new Date().toISOString() });
        }

        UIManager.showToast(UIManager.t('energyDone'), 'success');
    },

    calculateDialTest() {
        const unit = document.getElementById('dialUnit').value;
        const meterClass = document.getElementById('dialClass').value;
        const pConst = this.getNumber('dialPulseConst');
        const multRaw = this.getNumber('dialMultiplier');
        const mult = this.isValidPositive(multRaw) ? multRaw : 1;
        const pulseCount = this.getNumber('dialPulseCount');
        const start = this.getNumber('dialStart');
        const end = this.getNumber('dialEnd');
        const realPulse = this.getNumber('dialRealPulse');

        if (!this.isValidPositive(pConst)) { UIManager.showToast(UIManager.t('errPulseConst'), 'error'); return; }
        if (!this.isValidNonNegative(pulseCount)) { UIManager.showToast(UIManager.t('errPulseCountWS'), 'error'); return; }
        if (!this.isValidPositive(mult)) { UIManager.showToast(UIManager.t('errMultiplier'), 'error'); return; }
        if (!Number.isFinite(start)) { UIManager.showToast(UIManager.t('errStart'), 'error'); return; }
        if (!Number.isFinite(end)) { UIManager.showToast(UIManager.t('errEnd'), 'error'); return; }
        if (end <= start) { UIManager.showToast(UIManager.t('errEndLess'), 'error'); return; }
        if (!this.isValidNonNegative(realPulse)) { UIManager.showToast(UIManager.t('errRealPulse'), 'error'); return; }

        const reference = (pulseCount / pConst) * mult;
        const difference = end - start;
        const calculatedPulse = (difference * pConst) / mult;
        const errorEnergy = reference === 0 ? 0 : ((difference - reference) / reference) * 100;
        const errorPulse = calculatedPulse === 0 ? 0 : ((realPulse - calculatedPulse) / calculatedPulse) * 100;
        const limits = { '0.2S': 0.2, '0.5S': 0.5, '0.5': 0.5, '1': 1, '2': 2 };
        const limit = limits[meterClass] || 1;
        const passed = Math.abs(errorEnergy) <= limit;
        const pulsePassed = Math.abs(errorPulse) <= limit;
        const constCheck = difference === 0 ? 0 : (realPulse * mult) / difference;

        document.getElementById('dialResult').style.display = 'block';
        document.getElementById('dialResultContent').innerHTML = `
            <div class="dial-results">
                <div class="dial-row"><span>📐 Reference Energy</span><strong>${this.formatEnergy(reference, unit)}</strong></div>
                <div class="dial-row"><span>📐 Display Difference</span><strong>${this.formatEnergy(difference, unit)}</strong></div>
                <div class="dial-row"><span>📐 Calculated MUT Pulse</span><strong>${this.formatNumber(calculatedPulse)}</strong></div>
                <div class="dial-row"><span>📊 Energy Error</span><strong style="color:${passed ? 'var(--green)' : 'var(--red)'}">${errorEnergy.toFixed(4)}% ${passed ? '✅' : '❌'}</strong></div>
                <div class="dial-row"><span>📊 Pulse Error</span><strong style="color:${pulsePassed ? 'var(--green)' : 'var(--red)'}">${errorPulse.toFixed(4)}% ${pulsePassed ? '✅' : '❌'}</strong></div>
                <div class="dial-row"><span>🔍 Constant Check</span><strong>${this.formatNumber(constCheck)} imp/${unit}</strong></div>
                <div class="formula-box"><div class="formula-title">Formula Note</div><div class="formula-content"><code>Calculated Pulse = Display Difference × Meter Constant ÷ M</code></div></div>
            </div>`;

        this.addToHistory({ type: 'accuracy', unit, meterClass, pConst, mult, pulseCount, start, end, realPulse, reference, difference, calculatedPulse, errorEnergy, errorPulse, passed, constCheck, timestamp: new Date().toISOString() });
        UIManager.showToast(passed ? UIManager.t('dialPass') : UIManager.t('dialFail'), passed ? 'success' : 'error');
    },

    calculateDemand() {
        const pc = this.getNumber('demandPulseCount');
        const pConst = this.getNumber('demandPulseConst');
        const multRaw = this.getNumber('demandMultiplier');
        const mult = this.isValidPositive(multRaw) ? multRaw : 1;

        if (!this.isValidNonNegative(pc)) { UIManager.showToast(UIManager.t('errPulseCount'), 'error'); return; }
        if (!this.isValidPositive(pConst)) { UIManager.showToast(UIManager.t('errPulseConst'), 'error'); return; }

        const md = (pc * mult * 3600) / (pConst * 1800);
        document.getElementById('demandResult').style.display = 'block';
        document.getElementById('demandResultValue').textContent = this.formatNumber(md) + ' kW';
        this.addToHistory({ type: 'demand', pulseCount: pc, pulseConst: pConst, multiplier: mult, result: md, timestamp: new Date().toISOString() });
        UIManager.showToast(UIManager.t('mdDone'), 'success');
    },

    attachLiveListeners() {
        const update = () => {
            const ctP = this.getNumber('ctPrimary');
            const ctS = this.getNumber('ctSecondary');
            const vtP = this.getNumber('vtPrimary');
            const vtS = this.getNumber('vtSecondary');

            if (this.currentMode === 'ct' || this.currentMode === 'ctvt') {
                document.getElementById('ctLiveRatio').style.display = 'flex';
                document.getElementById('ctLiveRatioValue').textContent = (this.isValidPositive(ctP) && this.isValidPositive(ctS)) ? `${this.formatNumber(ctP / ctS)} : 1` : '-';
            } else {
                document.getElementById('ctLiveRatio').style.display = 'none';
            }

            if (this.currentMode === 'ctvt') {
                document.getElementById('vtLiveRatio').style.display = 'flex';
                document.getElementById('vtLiveRatioValue').textContent = (this.isValidPositive(vtP) && this.isValidPositive(vtS)) ? `${this.formatNumber(vtP / vtS)} : 1` : '-';
            } else {
                document.getElementById('vtLiveRatio').style.display = 'none';
            }
        };

        ['ctPrimary', 'ctSecondary', 'vtPrimary', 'vtSecondary'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', update);
        });
    },

    updateLiveRatios() {},

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
        } catch (e) {
            this.history = [];
        }
    },

    deleteHistoryItem(id) {
        this.history = this.history.filter(h => h.id !== id);
        this.saveHistory();
        this.renderHistory();
        if (typeof UIManager !== 'undefined') UIManager.showToast(UIManager.t('recordDeleted'), 'success');
    },

    renderHistory() {
        const container = document.getElementById('historyList');
        const clearButton = document.getElementById('btnClearHistory');
        if (!container || !clearButton) return;

        if (!this.history.length) {
            container.innerHTML = `<div class="empty-state"><span class="empty-icon">📭</span><p>${UIManager ? UIManager.t('historyEmpty') : 'Tiada rekod'}</p></div>`;
            clearButton.style.display = 'none';
            return;
        }

        clearButton.style.display = 'inline-block';
        container.innerHTML = this.history.slice(0, 50).map(h => {
            const date = new Date(h.timestamp);
            const timestamp = `${date.toLocaleDateString('ms-MY')} ${date.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })}`;
            let typeLabel = '';
            let dotClass = '';
            let detail = '';
            let value = '';

            if (h.type === 'calculator') {
                typeLabel = '🔌 ' + (h.mode || 'DIRECT').toUpperCase();
                dotClass = h.mode || 'direct';
                detail = `M=${this.formatNumber(h.totalMultiplier)} | ${h.supply} Cl.${h.meterClass}`;
                value = `${this.formatNumber(h.primaryActive)} imp/kWh`;
            } else if (h.type === 'energy') {
                typeLabel = '🔢 Pulse → Energy';
                dotClass = 'energy';
                detail = `${this.formatNumber(h.pulseCount)} ÷ ${this.formatNumber(h.pulseConst)} × ${this.formatNumber(h.multiplier)}`;
                value = this.formatEnergy(h.result, h.unit || 'kWh');
            } else if (h.type === 'energyToPulse') {
                typeLabel = '🔢 Energy → Pulse';
                dotClass = 'energy';
                detail = `${this.formatEnergy(h.energyInput, h.unit)} × ${this.formatNumber(h.pulseConst)} ÷ ${this.formatNumber(h.multiplier)}`;
                value = `${this.formatNumber(h.result)} pulse`;
            } else if (h.type === 'accuracy') {
                typeLabel = '📊 Accuracy Test';
                dotClass = 'accuracy';
                detail = `Ref:${this.formatEnergy(h.reference, h.unit)} Diff:${this.formatEnergy(h.difference, h.unit)}`;
                value = `${h.errorEnergy.toFixed(4)}% ${h.passed ? '✅' : '❌'}`;
            } else if (h.type === 'demand') {
                typeLabel = '🕐 MD';
                dotClass = 'demand';
                detail = `${this.formatNumber(h.pulseCount)} ÷ ${this.formatNumber(h.pulseConst)} × ${this.formatNumber(h.multiplier)}`;
                value = `${this.formatNumber(h.result)} kW`;
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
                        <div class="history-time">${timestamp}</div>
                    </div>
                    <button class="history-delete" type="button" aria-label="Delete record" onclick="event.stopPropagation();Calculator.deleteHistoryItem(${h.id})">✕</button>
                </div>`;
        }).join('');
    },

    exportHistoryCSV() {
        let csv = 'Type,Date,Detail,Value\n';
        this.history.forEach(h => {
            const date = new Date(h.timestamp).toISOString();
            if (h.type === 'calculator') csv += `"Calculator","${date}","M=${this.formatNumber(h.totalMultiplier)} ${h.supply} Cl.${h.meterClass}","${this.formatNumber(h.primaryActive)} imp/kWh"\n`;
            else if (h.type === 'energy') csv += `"Pulse to Energy","${date}","${this.formatNumber(h.pulseCount)}÷${this.formatNumber(h.pulseConst)}×${this.formatNumber(h.multiplier)}","${this.formatEnergy(h.result, h.unit || 'kWh')}"\n`;
            else if (h.type === 'energyToPulse') csv += `"Energy to Pulse","${date}","${this.formatEnergy(h.energyInput, h.unit)}×${this.formatNumber(h.pulseConst)}÷${this.formatNumber(h.multiplier)}","${this.formatNumber(h.result)} pulse"\n`;
            else if (h.type === 'accuracy') csv += `"Accuracy Test","${date}","Ref:${this.formatEnergy(h.reference, h.unit)} Diff:${this.formatEnergy(h.difference, h.unit)}","${h.errorEnergy.toFixed(4)}%"\n`;
            else if (h.type === 'demand') csv += `"MD","${date}","${this.formatNumber(h.pulseCount)}÷${this.formatNumber(h.pulseConst)}×${this.formatNumber(h.multiplier)}","${this.formatNumber(h.result)} kW"\n`;
        });
        return csv;
    },

    formatNumber(num) {
        if (num === undefined || num === null || !Number.isFinite(Number(num))) return '-';
        const value = Number(num);
        if (Number.isInteger(value)) return value.toLocaleString('ms-MY');
        return parseFloat(value.toFixed(6)).toLocaleString('ms-MY');
    },

    formatPulseConstant(value) {
        if (!Number.isFinite(Number(value))) return '-';
        return Math.abs(value) < 0.001 ? Number(value).toExponential(4) : this.formatNumber(value);
    },

    formatEnergy(value, unit = 'kWh') {
        if (!Number.isFinite(Number(value))) return '-';
        const energy = Number(value);
        if (unit === 'MWh') return `${energy.toFixed(4)} MWh`;
        if (energy >= 1) return `${energy.toFixed(2)} ${unit}`;
        if (energy >= 0.1) return `${energy.toFixed(3)} ${unit}`;
        if (energy >= 0.01) return `${energy.toFixed(4)} ${unit}`;
        if (energy >= 0.001) return `${energy.toFixed(5)} ${unit}`;
        return `${energy.toFixed(6)} ${unit}`;
    }
};
