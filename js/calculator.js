/**
 * MeterCalc Pro - Core Engine
 */

const Calculator = {
    currentMode: 'direct',
    history: [],

    init() {
        this.loadHistory();
        this.renderHistory();
        this.attachLiveListeners();
        this.attachInputValidators();
        this.attachAccLiveListeners();
    },

    attachInputValidators() {
        document.querySelectorAll('input[type="number"]').forEach(input => {
            input.addEventListener('input', () => this.validateNumberInput(input));
        });
    },

    validateNumberInput(input) {
        let val = input.value.trim();
        if (val === '' || val === '-') return;
        let num = parseFloat(val);
        if (isNaN(num)) { input.value = ''; return; }
        if (num < 0) input.value = Math.abs(num);
    },

    getValidNumber(id) {
        const el = document.getElementById(id);
        if (!el) return null;
        const val = parseFloat(el.value);
        return (isNaN(val) || val < 0) ? null : val;
    },

    // ============ MAIN CALCULATOR ============
    calculate() {
        const meterConstActive = this.getValidNumber('meterConstActive') || 0;
        const meterConstReactive = this.getValidNumber('meterConstReactive') || 0;
        const supply = document.getElementById('supplyType').value;
        const meterClass = document.getElementById('meterClass').value;

        if (!meterConstActive || meterConstActive <= 0) {
            UIManager.showToast('❌ Sila masukkan Meter Constant Active!', 'error');
            return;
        }

        let ctRatio = 1, vtRatio = 1;

        if (this.currentMode === 'ct' || this.currentMode === 'ctvt') {
            const ctP = this.getValidNumber('ctPrimary');
            const ctS = this.getValidNumber('ctSecondary');
            if (!ctP || ctP <= 0) { UIManager.showToast('❌ Sila masukkan CT Primary!', 'error'); return; }
            if (!ctS || ctS <= 0) { UIManager.showToast('❌ Sila masukkan CT Secondary!', 'error'); return; }
            ctRatio = ctP / ctS;
        }

        if (this.currentMode === 'ctvt') {
            const vtP = this.getValidNumber('vtPrimary');
            const vtS = this.getValidNumber('vtSecondary');
            if (!vtP || vtP <= 0) { UIManager.showToast('❌ Sila masukkan VT Primary!', 'error'); return; }
            if (!vtS || vtS <= 0) { UIManager.showToast('❌ Sila masukkan VT Secondary!', 'error'); return; }
            vtRatio = vtP / vtS;
        }

        const M = ctRatio * vtRatio;
        const primaryActive = meterConstActive / M;
        const secondaryActive = meterConstActive;
        let primaryReactive = 0, secondaryReactive = 0;
        if (meterConstReactive > 0) {
            primaryReactive = meterConstReactive / M;
            secondaryReactive = meterConstReactive;
        }

        const result = {
            type: 'calculator', mode: this.currentMode, supply, meterClass,
            meterConstActive, meterConstReactive,
            ctRatio, vtRatio, totalMultiplier: M,
            primaryActive, secondaryActive, primaryReactive, secondaryReactive,
            timestamp: new Date().toISOString()
        };

        this.displayCalcResults(result);
        this.addToHistory(result);
        document.getElementById('calcResultsPanel').scrollIntoView({ behavior: 'smooth' });
        UIManager.showToast('✅ Pengiraan selesai!', 'success');
        if (navigator.vibrate) navigator.vibrate([10, 20, 10]);
    },

    displayCalcResults(result) {
        const panel = document.getElementById('calcResultsPanel');
        const body = document.getElementById('calcResultsBody');
        panel.style.display = 'block';
        const labels = { direct: 'DIRECT • Tiada CT/VT', ct: 'CT Sahaja', ctvt: 'CT + VT (High Voltage)' };

        let html = `<div class="hero-result"><div class="hero-label">TOTAL MULTIPLIER</div><div class="hero-value">${this.formatNumber(result.totalMultiplier)}</div><div class="hero-sub">${labels[result.mode]} • ${result.supply} • Cl.${result.meterClass}</div></div><div class="result-grid-2">`;
        if (result.mode !== 'direct') html += `<div class="result-card"><div class="result-card-label">CT Ratio</div><div class="result-card-value">${this.formatNumber(result.ctRatio)} : 1</div></div>`;
        if (result.mode === 'ctvt') html += `<div class="result-card"><div class="result-card-label">VT Ratio</div><div class="result-card-value">${this.formatNumber(result.vtRatio)} : 1</div></div>`;
        html += `</div><div class="section-divider"><div class="divider-line"></div><span class="divider-text">PULSE CONSTANTS</span><div class="divider-line"></div></div><div class="result-grid-2"><div class="result-card pulse-card"><div class="result-card-label">Primary Active</div><div class="result-card-value">${result.primaryActive < 0.001 ? result.primaryActive.toExponential(4) : this.formatNumber(result.primaryActive)}</div><div class="result-card-unit">imp/kWh</div></div><div class="result-card pulse-card"><div class="result-card-label">Secondary Active</div><div class="result-card-value">${this.formatNumber(result.secondaryActive)}</div><div class="result-card-unit">imp/kWh</div></div></div>`;
        if (result.primaryReactive > 0) html += `<div class="result-grid-2"><div class="result-card pulse-card"><div class="result-card-label">Primary Reactive</div><div class="result-card-value">${this.formatNumber(result.primaryReactive)}</div><div class="result-card-unit">imp/kvarh</div></div><div class="result-card pulse-card"><div class="result-card-label">Secondary Reactive</div><div class="result-card-value">${this.formatNumber(result.secondaryReactive)}</div><div class="result-card-unit">imp/kvarh</div></div></div>`;
        html += `<div class="action-buttons"><button class="btn-action btn-share" onclick="UIManager.shareCalculatorResult()">📤 Kongsi</button></div>`;
        body.innerHTML = html;
    },

    // ============ ENERGY (PULSE → TENAGA) ============
    calculateEnergy() {
        const pc = parseFloat(document.getElementById('energyPulseCount').value);
        const pConst = parseFloat(document.getElementById('energyPulseConst').value);
        const mult = parseFloat(document.getElementById('energyMultiplier').value) || 1;
        if (!pc || pc <= 0) { UIManager.showToast('❌ Sila masukkan jumlah pulse!', 'error'); return; }
        if (!pConst || pConst <= 0) { UIManager.showToast('❌ Sila masukkan pulse constant!', 'error'); return; }
        const energy = (pc / pConst) * mult;
        document.getElementById('energyResult').style.display = 'block';
        document.getElementById('energyResultValue').textContent = this.formatEnergy(energy);
        this.addToHistory({ type: 'energy', pulseCount: pc, pulseConst: pConst, multiplier: mult, result: energy, timestamp: new Date().toISOString() });
        UIManager.showToast('✅ Tenaga dikira!', 'success');
    },

    // ============ ACCURACY (PULSE SAHAJA) ============
    attachAccLiveListeners() {
        const update = () => {
            const pc = parseFloat(document.getElementById('accPulseCount').value);
            const pConst = parseFloat(document.getElementById('accPulseConst').value);
            const mult = parseFloat(document.getElementById('accPulseMultiplier').value) || 1;
            const unit = document.getElementById('accOutputUnit').value;
            const display = document.getElementById('accLiveEnergy');
            const value = document.getElementById('accLiveEnergyValue');
            if (pc && pConst && pConst > 0 && pc >= 0) {
                let energyKWh = (pc / pConst) * mult;
                display.style.display = 'flex';
                value.textContent = unit === 'Wh' ? (energyKWh * 1000).toFixed(1) + ' Wh' : this.formatEnergy(energyKWh);
            } else {
                display.style.display = 'none';
            }
        };
        ['accPulseCount', 'accPulseConst', 'accPulseMultiplier', 'accOutputUnit'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', update);
        });
    },

    calculateAccuracy() {
        const pc = parseFloat(document.getElementById('accPulseCount').value);
        const pConst = parseFloat(document.getElementById('accPulseConst').value);
        const mult = parseFloat(document.getElementById('accPulseMultiplier').value) || 1;
        const unit = document.getElementById('accOutputUnit').value;
        const meterReading = parseFloat(document.getElementById('accMeterReading').value);
        const meterClass = document.getElementById('accMeterClass').value;
        const accSupply = document.getElementById('accSupplyType').value;

        if (!pc || pc < 0) { UIManager.showToast('❌ Sila masukkan Pulse Count!', 'error'); return; }
        if (!pConst || pConst <= 0) { UIManager.showToast('❌ Sila masukkan Pulse Constant!', 'error'); return; }
        if (!meterReading || meterReading <= 0) { UIManager.showToast('❌ Sila masukkan Tenaga MUT!', 'error'); return; }

        let reference = (pc / pConst) * mult;
        if (unit === 'Wh') reference = reference / 1000;

        const errorPercent = ((meterReading - reference) / reference) * 100;
        const absError = Math.abs(errorPercent);
        const limits = { '0.2S': 0.2, '0.5S': 0.5, '0.5': 0.5, '1': 1, '2': 2 };
        const limit = limits[meterClass] || 1;
        const passed = absError <= limit;

        document.getElementById('accuracyResult').style.display = 'block';
        document.getElementById('accuracyResultValue').textContent = errorPercent.toFixed(4) + ' %';
        const statusEl = document.getElementById('accuracyStatus');
        statusEl.textContent = passed ? `✅ LULUS - Class ${meterClass} (±${limit}%) - ${accSupply}` : `❌ GAGAL - Class ${meterClass} (±${limit}%) - ${accSupply}`;
        statusEl.className = passed ? 'calc-result-status pass' : 'calc-result-status fail';
        document.getElementById('accuracyNote').innerHTML = `<small style="color:var(--text2);">📐 Rujukan: ${this.formatEnergy(reference)} | MUT: ${this.formatEnergy(meterReading)}</small>`;

        this.addToHistory({ type: 'accuracy', reference, meterReading, meterClass, accSupply, errorPercent, passed, timestamp: new Date().toISOString() });
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
        const update = () => {
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
        };
        ['ctPrimary', 'ctSecondary', 'vtPrimary', 'vtSecondary'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', update);
        });
    },

    updateLiveRatios() {},

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
            c.innerHTML = '<div class="empty-state"><span class="empty-icon">📭</span><p>Tiada rekod</p></div>';
            btn.style.display = 'none'; return;
        }
        btn.style.display = 'inline-block';
        c.innerHTML = this.history.slice(0, 30).map(h => {
            const d = new Date(h.timestamp);
            const ts = d.toLocaleDateString('ms-MY') + ' ' + d.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' });
            if (h.type === 'calculator') return `<div class="history-item"><div class="history-left"><div class="history-dot ${h.mode||'direct'}"></div><div class="history-info"><div class="history-type">🔌 ${h.mode?.toUpperCase()||'DIRECT'}</div><div class="history-detail">M=${this.formatNumber(h.totalMultiplier)} | ${h.supply} Cl.${h.meterClass}</div></div></div><div class="history-right"><div class="history-value">${this.formatNumber(h.primaryActive)} imp/kWh</div><div class="history-time">${ts}</div></div></div>`;
            if (h.type === 'energy') return `<div class="history-item"><div class="history-left"><div class="history-dot energy"></div><div class="history-info"><div class="history-type">🔢 Pulse→Tenaga</div><div class="history-detail">${this.formatNumber(h.pulseCount)} ÷ ${this.formatNumber(h.pulseConst)} × ${this.formatNumber(h.multiplier)}</div></div></div><div class="history-right"><div class="history-value">${this.formatEnergy(h.result)}</div><div class="history-time">${ts}</div></div></div>`;
            if (h.type === 'accuracy') return `<div class="history-item"><div class="history-left"><div class="history-dot accuracy"></div><div class="history-info"><div class="history-type">📊 ACCURACY</div><div class="history-detail">R:${this.formatEnergy(h.reference)} | MUT:${this.formatEnergy(h.meterReading)} | Cl.${h.meterClass}</div></div></div><div class="history-right"><div class="history-value">${h.errorPercent.toFixed(4)}% ${h.passed?'✅':'❌'}</div><div class="history-time">${ts}</div></div></div>`;
            if (h.type === 'demand') return `<div class="history-item"><div class="history-left"><div class="history-dot demand"></div><div class="history-info"><div class="history-type">🕐 MD</div><div class="history-detail">${this.formatNumber(h.pulseCount)} ÷ ${this.formatNumber(h.pulseConst)} × ${this.formatNumber(h.multiplier)}</div></div></div><div class="history-right"><div class="history-value">${this.formatNumber(h.result)} kW</div><div class="history-time">${ts}</div></div></div>`;
            return '';
        }).join('');
    },

    // ============ UTILS ============
    formatNumber(num) {
        if (num === undefined || num === null) return '-';
        if (Number.isInteger(num)) return num.toLocaleString('ms-MY');
        return parseFloat(num.toFixed(6)).toString();
    },
    formatEnergy(kWh) {
        if (kWh >= 1) return kWh.toFixed(2) + ' kWh';
        if (kWh >= 0.1) return kWh.toFixed(3) + ' kWh';
        if (kWh >= 0.01) return kWh.toFixed(4) + ' kWh';
        if (kWh >= 0.001) return kWh.toFixed(5) + ' kWh';
        return kWh.toFixed(6) + ' kWh';
    }
};
