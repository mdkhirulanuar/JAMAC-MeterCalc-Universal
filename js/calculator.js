/**
 * MeterCalc Pro - Core Calculation Engine
 * Features: Direct, CT, CT+VT, Energy, Accuracy (Manual & Pulse), Demand
 */

const Calculator = {
    currentMode: 'direct',
    currentEnergyMode: 'pulse-to-energy',
    currentAccuracyMode: 'manual',
    history: [],

    init() {
        this.loadHistory();
        this.renderHistory();
        this.attachLiveListeners();
        this.attachInputValidators();
        this.attachAccPulseListeners();
    },

    attachInputValidators() {
        const numberInputs = document.querySelectorAll('input[type="number"]');
        numberInputs.forEach(input => {
            input.addEventListener('input', () => this.validateNumberInput(input));
            input.addEventListener('blur', () => this.validateNumberInput(input));
        });
    },

    validateNumberInput(input) {
        let val = input.value.trim();
        if (val === '' || val === '-') return;
        let num = parseFloat(val);
        if (isNaN(num)) { input.value = ''; return; }
        if (num < 0) {
            num = Math.abs(num);
            input.value = num;
            UIManager.showToast('⚠️ Nilai negatif ditukar ke positif', 'error');
        }
        if (num === 0 && input.hasAttribute('data-required')) {
            input.value = '';
            UIManager.showToast('⚠️ Nilai tidak boleh 0', 'error');
        }
    },

    getValidNumber(id) {
        const el = document.getElementById(id);
        if (!el) return null;
        const val = parseFloat(el.value);
        if (isNaN(val) || val < 0) return null;
        return val;
    },

    getInputValues() {
        return {
            mode: this.currentMode,
            meterConstActive: this.getValidNumber('meterConstActive') || 0,
            meterConstReactive: this.getValidNumber('meterConstReactive') || 0,
            supply: document.getElementById('supplyType').value,
            meterClass: document.getElementById('meterClass').value,
            ctPrimary: this.getValidNumber('ctPrimary'),
            ctSecondary: this.getValidNumber('ctSecondary'),
            vtPrimary: this.getValidNumber('vtPrimary'),
            vtSecondary: this.getValidNumber('vtSecondary')
        };
    },

    // ============ MAIN CALCULATOR ============
    calculate() {
        const inputs = this.getInputValues();
        if (!inputs.meterConstActive || inputs.meterConstActive <= 0) {
            UIManager.showToast('❌ Sila masukkan Meter Constant Active!', 'error');
            document.getElementById('meterConstActive').focus();
            return;
        }
        let ctRatio = 1, vtRatio = 1;
        if (this.currentMode === 'ct' || this.currentMode === 'ctvt') {
            const ctP = inputs.ctPrimary, ctS = inputs.ctSecondary;
            if (!ctP || ctP <= 0) { UIManager.showToast('❌ Sila masukkan CT Primary!', 'error'); return; }
            if (!ctS || ctS <= 0) { UIManager.showToast('❌ Sila masukkan CT Secondary!', 'error'); return; }
            if (ctS > ctP) UIManager.showToast('⚠️ CT Secondary > Primary?', 'error');
            ctRatio = ctP / ctS;
        }
        if (this.currentMode === 'ctvt') {
            const vtP = inputs.vtPrimary, vtS = inputs.vtSecondary;
            if (!vtP || vtP <= 0) { UIManager.showToast('❌ Sila masukkan VT Primary!', 'error'); return; }
            if (!vtS || vtS <= 0) { UIManager.showToast('❌ Sila masukkan VT Secondary!', 'error'); return; }
            if (vtS > vtP) UIManager.showToast('⚠️ VT Secondary > Primary?', 'error');
            vtRatio = vtP / vtS;
        }
        const M = ctRatio * vtRatio;
        const primaryActive = inputs.meterConstActive / M;
        const secondaryActive = inputs.meterConstActive;
        let primaryReactive = 0, secondaryReactive = 0;
        if (inputs.meterConstReactive > 0) {
            primaryReactive = inputs.meterConstReactive / M;
            secondaryReactive = inputs.meterConstReactive;
        }
        const result = { type: 'calculator', ...inputs, ctRatio, vtRatio, totalMultiplier: M, primaryActive, secondaryActive, primaryReactive, secondaryReactive, timestamp: new Date().toISOString() };
        this.displayCalcResults(result);
        this.addToHistory(result);
        document.getElementById('calcResultsPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
        UIManager.showToast('✅ Pengiraan selesai!', 'success');
        if (navigator.vibrate) navigator.vibrate([10, 20, 10]);
    },

    displayCalcResults(result) {
        const panel = document.getElementById('calcResultsPanel');
        const body = document.getElementById('calcResultsBody');
        panel.style.display = 'block';
        panel.style.animation = 'none'; panel.offsetHeight; panel.style.animation = 'fadeInUp 0.3s ease-out';
        const modeLabels = { direct: 'DIRECT • Tiada CT/VT', ct: 'CT Sahaja', ctvt: 'CT + VT (High Voltage)' };
        let html = `<div class="hero-result"><div class="hero-label">TOTAL MULTIPLIER</div><div class="hero-value">${this.formatNumber(result.totalMultiplier)}</div><div class="hero-sub">${modeLabels[result.mode]} • ${result.supply} • Cl.${result.meterClass}</div></div><div class="result-grid-2">`;
        if (result.mode === 'ct' || result.mode === 'ctvt') html += `<div class="result-card"><div class="result-card-label">CT Ratio</div><div class="result-card-value">${this.formatNumber(result.ctRatio)} : 1</div></div>`;
        if (result.mode === 'ctvt') html += `<div class="result-card"><div class="result-card-label">VT Ratio</div><div class="result-card-value">${this.formatNumber(result.vtRatio)} : 1</div></div>`;
        html += `</div><div class="section-divider"><div class="divider-line"></div><span class="divider-text">PULSE CONSTANTS</span><div class="divider-line"></div></div><div class="result-grid-2"><div class="result-card pulse-card"><div class="result-card-label">Primary Active</div><div class="result-card-value">${result.primaryActive < 0.001 ? result.primaryActive.toExponential(4) : this.formatNumber(result.primaryActive)}</div><div class="result-card-unit">imp/kWh</div></div><div class="result-card pulse-card"><div class="result-card-label">Secondary Active</div><div class="result-card-value">${this.formatNumber(result.secondaryActive)}</div><div class="result-card-unit">imp/kWh</div></div></div>`;
        if (result.primaryReactive > 0) html += `<div class="result-grid-2"><div class="result-card pulse-card"><div class="result-card-label">Primary Reactive</div><div class="result-card-value">${result.primaryReactive < 0.001 ? result.primaryReactive.toExponential(4) : this.formatNumber(result.primaryReactive)}</div><div class="result-card-unit">imp/kvarh</div></div><div class="result-card pulse-card"><div class="result-card-label">Secondary Reactive</div><div class="result-card-value">${this.formatNumber(result.secondaryReactive)}</div><div class="result-card-unit">imp/kvarh</div></div></div>`;
        html += `<div class="formula-box"><div class="formula-title">📐 Formula Digunakan</div><div class="formula-content">${this.getFormulaText(result)}</div></div><div class="action-buttons"><button class="btn-action btn-share" onclick="UIManager.shareCalculatorResult()">📤 Kongsi</button></div>`;
        body.innerHTML = html;
    },

    getFormulaText(result) {
        if (result.mode === 'direct') return `<code>M = 1 (Direct)</code><br><code>Primary Pulse = K<sub>m</sub> ÷ 1 = ${this.formatNumber(result.primaryActive)} imp/kWh</code>`;
        if (result.mode === 'ct') return `<code>M = ${this.formatNumber(result.ctPrimary)} ÷ ${this.formatNumber(result.ctSecondary)} = <strong>${this.formatNumber(result.totalMultiplier)}</strong></code><br><code>Primary Pulse = ${this.formatNumber(result.secondaryActive)} ÷ ${this.formatNumber(result.totalMultiplier)} = <strong>${this.formatNumber(result.primaryActive)} imp/kWh</strong></code>`;
        return `<code>M = CT × VT = (${this.formatNumber(result.ctPrimary)} ÷ ${this.formatNumber(result.ctSecondary)}) × (${this.formatNumber(result.vtPrimary)} ÷ ${this.formatNumber(result.vtSecondary)})</code><br><code>M = ${this.formatNumber(result.ctRatio)} × ${this.formatNumber(result.vtRatio)} = <strong>${this.formatNumber(result.totalMultiplier)}</strong></code><br><code>Primary Pulse = ${this.formatNumber(result.secondaryActive)} ÷ ${this.formatNumber(result.totalMultiplier)} = <strong>${this.formatNumber(result.primaryActive)} imp/kWh</strong></code>`;
    },

    // ============ ENERGY ============
    calculateEnergy() {
        this.currentEnergyMode === 'pulse-to-energy' ? this.calculatePulseToEnergy() : this.calculateEnergyToPulse();
    },

    calculatePulseToEnergy() {
        const pc = parseFloat(document.getElementById('energyPulseCount').value);
        const pConst = parseFloat(document.getElementById('energyPulseConst').value);
        const mult = parseFloat(document.getElementById('energyMultiplier').value) || 1;
        if (!pc || pc <= 0) { UIManager.showToast('❌ Sila masukkan jumlah pulse!', 'error'); return; }
        if (!pConst || pConst <= 0) { UIManager.showToast('❌ Sila masukkan pulse constant!', 'error'); return; }
        const energy = (pc / pConst) * mult;
        document.getElementById('energyResult').style.display = 'block';
        document.getElementById('energyResultValue').textContent = this.formatEnergy(energy);
        this.addToHistory({ type: 'energy', mode: 'pulse-to-energy', pulseCount: pc, pulseConst: pConst, multiplier: mult, result: energy, timestamp: new Date().toISOString() });
        UIManager.showToast('✅ Tenaga dikira!', 'success');
    },

    calculateEnergyToPulse() {
        const energy = parseFloat(document.getElementById('energyTarget').value);
        const pConst = parseFloat(document.getElementById('energyPulseConst2').value);
        const mult = parseFloat(document.getElementById('energyMultiplier2').value) || 1;
        if (!energy || energy <= 0) { UIManager.showToast('❌ Sila masukkan tenaga!', 'error'); return; }
        if (!pConst || pConst <= 0) { UIManager.showToast('❌ Sila masukkan pulse constant!', 'error'); return; }
        const pulses = (energy * pConst) / mult;
        document.getElementById('energyResult').style.display = 'block';
        document.getElementById('energyResultValue').textContent = this.formatNumber(pulses) + ' pulses';
        this.addToHistory({ type: 'energy', mode: 'energy-to-pulse', energy, pulseConst: pConst, multiplier: mult, result: pulses, timestamp: new Date().toISOString() });
        UIManager.showToast('✅ Pulse dikira!', 'success');
    },

    // ============ ACCURACY (UPDATED) ============
    attachAccPulseListeners() {
        const update = () => this.updateAccLiveEnergy();
        ['accPulseCount', 'accPulseConst', 'accPulseMultiplier', 'accOutputUnit'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', update);
        });
    },

    updateAccLiveEnergy() {
        if (this.currentAccuracyMode !== 'pulse') return;
        const pc = parseFloat(document.getElementById('accPulseCount').value);
        const pConst = parseFloat(document.getElementById('accPulseConst').value);
        const mult = parseFloat(document.getElementById('accPulseMultiplier').value) || 1;
        const unit = document.getElementById('accOutputUnit').value;
        const display = document.getElementById('accLiveEnergy');
        const value = document.getElementById('accLiveEnergyValue');
        if (pc && pConst && pConst > 0 && pc >= 0) {
            let energyKWh = (pc / pConst) * mult;
            display.style.display = 'flex';
            if (unit === 'Wh') {
                value.textContent = (energyKWh * 1000).toFixed(1) + ' Wh';
            } else {
                value.textContent = this.formatEnergy(energyKWh);
            }
        } else {
            display.style.display = 'none';
        }
    },

    calculateAccuracy() {
        let reference;
        if (this.currentAccuracyMode === 'manual') {
            reference = parseFloat(document.getElementById('accReference').value);
            if (!reference || reference <= 0) {
                UIManager.showToast('❌ Sila masukkan Tenaga Rujukan!', 'error');
                return;
            }
        } else {
            const pc = parseFloat(document.getElementById('accPulseCount').value);
            const pConst = parseFloat(document.getElementById('accPulseConst').value);
            const mult = parseFloat(document.getElementById('accPulseMultiplier').value) || 1;
            const unit = document.getElementById('accOutputUnit').value;
            if (!pc || pc < 0) { UIManager.showToast('❌ Sila masukkan Pulse Count!', 'error'); return; }
            if (!pConst || pConst <= 0) { UIManager.showToast('❌ Sila masukkan Pulse Constant!', 'error'); return; }
            reference = (pc / pConst) * mult;
            if (unit === 'Wh') reference = reference / 1000;
        }

        const meterReading = parseFloat(document.getElementById('accMeterReading').value);
        const meterClass = document.getElementById('accMeterClass').value;
        const accSupply = document.getElementById('accSupplyType').value;
        if (!meterReading || meterReading <= 0) {
            UIManager.showToast('❌ Sila masukkan Tenaga MUT!', 'error');
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
            statusEl.textContent = `✅ LULUS - Dalam had Class ${meterClass} (±${limit}%) untuk ${accSupply}`;
            statusEl.className = 'calc-result-status pass';
        } else {
            statusEl.textContent = `❌ GAGAL - Melebihi had Class ${meterClass} (±${limit}%) untuk ${accSupply}`;
            statusEl.className = 'calc-result-status fail';
        }

        const noteEl = document.getElementById('accuracyNote');
        if (noteEl) {
            noteEl.innerHTML = `<small style="color:var(--text2);">📐 Rujukan: ${this.formatEnergy(reference)} | MUT: ${this.formatEnergy(meterReading)} | ${accSupply}</small>`;
        }

        this.addToHistory({
            type: 'accuracy',
            reference, meterReading, meterClass, accSupply, errorPercent, passed,
            accuracyMode: this.currentAccuracyMode,
            timestamp: new Date().toISOString()
        });
        UIManager.showToast(passed ? '✅ Meter LULUS!' : '❌ Meter GAGAL!', passed ? 'success' : 'error');
    },

    // ============ DEMAND ============
    calculateDemand() {
        const pc = parseFloat(document.getElementById('demandPulseCount').value);
        const pConst = parseFloat(document.getElementById('demandPulseConst').value);
        const mult = parseFloat(document.getElementById('demandMultiplier').value) || 1;
        if (!pc || pc <= 0) { UIManager.showToast('❌ Sila masukkan jumlah pulse!', 'error'); return; }
        if (!pConst || pConst <= 0) { UIManager.showToast('❌ Sila masukkan pulse constant!', 'error'); return; }
        const md = (pc * mult * 3600) / (pConst * 1800);
        document.getElementById('demandResult').style.display = 'block';
        document.getElementById('demandResultValue').textContent = this.formatNumber(md) + ' kW';
        this.addToHistory({ type: 'demand', pulseCount: pc, pulseConst: pConst, multiplier: mult, result: md, timestamp: new Date().toISOString() });
        UIManager.showToast('✅ Maximum Demand dikira!', 'success');
    },

    // ============ LIVE RATIOS ============
    attachLiveListeners() {
        const update = () => this.updateLiveRatios();
        ['ctPrimary', 'ctSecondary', 'vtPrimary', 'vtSecondary'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', update);
        });
    },

    updateLiveRatios() {
        const ctP = parseFloat(document.getElementById('ctPrimary').value);
        const ctS = parseFloat(document.getElementById('ctSecondary').value);
        if (this.currentMode === 'ct' || this.currentMode === 'ctvt') {
            document.getElementById('ctLiveRatio').style.display = 'flex';
            const val = document.getElementById('ctLiveRatioValue');
            if (ctP && ctS && ctS > 0) {
                const r = ctP / ctS;
                val.textContent = r.toFixed(2) + ' : 1';
                val.style.color = r < 1 ? 'var(--red)' : 'var(--accent)';
            } else { val.textContent = 'Masukkan nilai'; val.style.color = 'var(--text3)'; }
        } else { document.getElementById('ctLiveRatio').style.display = 'none'; }

        const vtP = parseFloat(document.getElementById('vtPrimary').value);
        const vtS = parseFloat(document.getElementById('vtSecondary').value);
        if (this.currentMode === 'ctvt') {
            document.getElementById('vtLiveRatio').style.display = 'flex';
            const val = document.getElementById('vtLiveRatioValue');
            if (vtP && vtS && vtS > 0) {
                const r = vtP / vtS;
                val.textContent = r.toFixed(2) + ' : 1';
                val.style.color = r < 1 ? 'var(--red)' : 'var(--accent)';
            } else { val.textContent = 'Masukkan nilai'; val.style.color = 'var(--text3)'; }
        } else { document.getElementById('vtLiveRatio').style.display = 'none'; }
    },

    // ============ HISTORY ============
    addToHistory(entry) {
        this.history.unshift({ id: Date.now(), ...entry });
        if (this.history.length > 50) this.history.pop();
        this.saveHistory();
        this.renderHistory();
    },

    saveHistory() { try { localStorage.setItem('metercalc_pro_history', JSON.stringify(this.history)); } catch(e) {} },
    loadHistory() { try { const s = localStorage.getItem('metercalc_pro_history'); if (s) this.history = JSON.parse(s); } catch(e) { this.history = []; } },

    renderHistory() {
        const c = document.getElementById('historyList');
        const btn = document.getElementById('btnClearHistory');
        if (this.history.length === 0) {
            c.innerHTML = '<div class="empty-state"><span class="empty-icon">📭</span><p>Tiada rekod pengiraan</p></div>';
            btn.style.display = 'none'; return;
        }
        btn.style.display = 'inline-block';
        c.innerHTML = this.history.slice(0, 30).map(h => {
            const d = new Date(h.timestamp);
            const ts = d.toLocaleDateString('ms-MY') + ' ' + d.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' });
            let label, dot, detail, value;
            if (h.type === 'calculator') {
                const ml = { direct: 'DIRECT', ct: 'CT', ctvt: 'CT+VT' };
                label = '🔌 ' + (ml[h.mode] || h.mode); dot = h.mode || 'direct';
                detail = `M = ${this.formatNumber(h.totalMultiplier)} | ${h.supply} Cl.${h.meterClass}`;
                value = this.formatNumber(h.primaryActive) + ' imp/kWh';
            } else if (h.type === 'energy') {
                label = h.mode === 'pulse-to-energy' ? '🔢 Pulse→Tenaga' : '🔢 Tenaga→Pulse'; dot = 'energy';
                detail = h.mode === 'pulse-to-energy' ? `${this.formatNumber(h.pulseCount)} pulse ÷ ${this.formatNumber(h.pulseConst)} × ${this.formatNumber(h.multiplier)}` : `${this.formatNumber(h.energy)} kWh × ${this.formatNumber(h.pulseConst)} ÷ ${this.formatNumber(h.multiplier)}`;
                value = h.mode === 'pulse-to-energy' ? this.formatEnergy(h.result) : this.formatNumber(h.result) + ' pulses';
            } else if (h.type === 'accuracy') {
                label = '📊 ACCURACY'; dot = 'accuracy';
                detail = `Ref: ${this.formatEnergy(h.reference)} | MUT: ${this.formatEnergy(h.meterReading)} | Cl.${h.meterClass}`;
                value = h.errorPercent.toFixed(4) + '% ' + (h.passed ? '✅' : '❌');
            } else if (h.type === 'demand') {
                label = '🕐 MD'; dot = 'demand';
                detail = `${this.formatNumber(h.pulseCount)} pulse ÷ ${this.formatNumber(h.pulseConst)} × ${this.formatNumber(h.multiplier)}`;
                value = this.formatNumber(h.result) + ' kW';
            }
            return `<div class="history-item"><div class="history-left"><div class="history-dot ${dot}"></div><div class="history-info"><div class="history-type">${label}</div><div class="history-detail">${detail}</div></div></div><div class="history-right"><div class="history-value">${value}</div><div class="history-time">${ts}</div></div></div>`;
        }).join('');
    },

    // ============ UTILS ============
    formatNumber(num) {
        if (num === undefined || num === null) return '-';
        if (Number.isInteger(num)) return num.toLocaleString('ms-MY');
        return parseFloat(num.toFixed(6)).toString();
    },

    // Auto decimal formatting untuk tenaga
    formatEnergy(kWh) {
        if (kWh >= 1) return kWh.toFixed(2) + ' kWh';
        if (kWh >= 0.1) return kWh.toFixed(3) + ' kWh';
        if (kWh >= 0.01) return kWh.toFixed(4) + ' kWh';
        if (kWh >= 0.001) return kWh.toFixed(5) + ' kWh';
        return kWh.toFixed(6) + ' kWh';
    }
};
