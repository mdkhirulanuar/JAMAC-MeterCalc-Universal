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
                let val = input.value.trim();
                if (val === '' || val === '-') return;
                let num = parseFloat(val);
                if (isNaN(num)) { input.value = ''; return; }
                if (num < 0) input.value = Math.abs(num);
            });
        });
    },

    getValidNumber(id) {
        const el = document.getElementById(id);
        if (!el) return null;
        const val = parseFloat(el.value);
        return (isNaN(val) || val < 0) ? null : val;
    },

    // ============ KALKULATOR ============
    calculate() {
        const meterConstActive = this.getValidNumber('meterConstActive') || 0;
        const meterConstReactive = this.getValidNumber('meterConstReactive') || 0;
        const supply = document.getElementById('supplyType').value;
        const meterClass = document.getElementById('meterClass').value;
        if (!meterConstActive || meterConstActive <= 0) { UIManager.showToast('❌ Sila masukkan Meter Constant Active!', 'error'); return; }

        let ctRatio = 1, vtRatio = 1;
        if (this.currentMode === 'ct' || this.currentMode === 'ctvt') {
            const ctP = this.getValidNumber('ctPrimary'), ctS = this.getValidNumber('ctSecondary');
            if (!ctP || ctP <= 0) { UIManager.showToast('❌ Sila masukkan CT Primary!', 'error'); return; }
            if (!ctS || ctS <= 0) { UIManager.showToast('❌ Sila masukkan CT Secondary!', 'error'); return; }
            ctRatio = ctP / ctS;
        }
        if (this.currentMode === 'ctvt') {
            const vtP = this.getValidNumber('vtPrimary'), vtS = this.getValidNumber('vtSecondary');
            if (!vtP || vtP <= 0) { UIManager.showToast('❌ Sila masukkan VT Primary!', 'error'); return; }
            if (!vtS || vtS <= 0) { UIManager.showToast('❌ Sila masukkan VT Secondary!', 'error'); return; }
            vtRatio = vtP / vtS;
        }
        const M = ctRatio * vtRatio;
        const primaryActive = meterConstActive / M, secondaryActive = meterConstActive;
        let primaryReactive = 0, secondaryReactive = 0;
        if (meterConstReactive > 0) { primaryReactive = meterConstReactive / M; secondaryReactive = meterConstReactive; }

        const result = { type: 'calculator', mode: this.currentMode, supply, meterClass, meterConstActive, meterConstReactive, ctRatio, vtRatio, totalMultiplier: M, primaryActive, secondaryActive, primaryReactive, secondaryReactive, timestamp: new Date().toISOString() };
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
        let html = `<div class="hero-result"><div class="hero-label">TOTAL MULTIPLIER</div><div class="hero-value">${this.formatNumber(result.totalMultiplier)}</div><div class="hero-sub">${labels[result.mode]} • ${result.supply} • Cl.${result.meterClass}</div></div>`;
        if (result.mode !== 'direct') {
            html += `<div class="result-grid-2">`;
            html += `<div class="result-card"><div class="result-card-label">CT Ratio</div><div class="result-card-value">${this.formatNumber(result.ctRatio)} : 1</div></div>`;
            if (result.mode === 'ctvt') html += `<div class="result-card"><div class="result-card-label">VT Ratio</div><div class="result-card-value">${this.formatNumber(result.vtRatio)} : 1</div></div>`;
            html += `</div>`;
        }
        html += `<div class="section-divider"><div class="divider-line"></div><span class="divider-text">PULSE CONSTANTS</span><div class="divider-line"></div></div><div class="result-grid-2"><div class="result-card pulse-card"><div class="result-card-label">Primary Active</div><div class="result-card-value">${result.primaryActive < 0.001 ? result.primaryActive.toExponential(4) : this.formatNumber(result.primaryActive)}</div><div class="result-card-unit">imp/kWh</div></div><div class="result-card pulse-card"><div class="result-card-label">Secondary Active</div><div class="result-card-value">${this.formatNumber(result.secondaryActive)}</div><div class="result-card-unit">imp/kWh</div></div></div>`;
        if (result.primaryReactive > 0) html += `<div class="result-grid-2"><div class="result-card pulse-card"><div class="result-card-label">Primary Reactive</div><div class="result-card-value">${this.formatNumber(result.primaryReactive)}</div><div class="result-card-unit">imp/kvarh</div></div><div class="result-card pulse-card"><div class="result-card-label">Secondary Reactive</div><div class="result-card-value">${this.formatNumber(result.secondaryReactive)}</div><div class="result-card-unit">imp/kvarh</div></div></div>`;
        html += `<div class="action-buttons"><button class="btn-action btn-share" onclick="UIManager.shareCalculatorResult()">📤 Kongsi</button></div>`;
        body.innerHTML = html;
    },

    // ============ TENAGA ============
    calculateEnergy() {
        const pc = parseFloat(document.getElementById('energyPulseCount').value);
        const pConst = parseFloat(document.getElementById('energyPulseConst').value);
        const mult = parseFloat(document.getElementById('energyMultiplier').value) || 1;
        if (!pc || pc <= 0) { UIManager.showToast('❌ Sila masukkan Jumlah Pulse!', 'error'); return; }
        if (!pConst || pConst <= 0) { UIManager.showToast('❌ Sila masukkan Pulse Constant!', 'error'); return; }
        const energy = (pc / pConst) * mult;
        document.getElementById('energyResult').style.display = 'block';
        document.getElementById('energyResultValue').textContent = this.formatEnergy(energy);
        this.addToHistory({ type: 'energy', pulseCount: pc, pulseConst: pConst, multiplier: mult, result: energy, timestamp: new Date().toISOString() });
        UIManager.showToast('✅ Tenaga dikira!', 'success');
    },

    // ============ DIAL TEST ============
    calculateDialTest() {
        const unit = document.getElementById('dialUnit').value;
        const meterClass = document.getElementById('dialClass').value;
        const pConst = parseFloat(document.getElementById('dialPulseConst').value);
        const mult = parseFloat(document.getElementById('dialMultiplier').value) || 1;
        const pulseCount = parseFloat(document.getElementById('dialPulseCount').value);
        const start = parseFloat(document.getElementById('dialStart').value);
        const end = parseFloat(document.getElementById('dialEnd').value);
        const realPulse = parseFloat(document.getElementById('dialRealPulse').value);

        if (!pConst || pConst <= 0) { UIManager.showToast('❌ Sila masukkan Pulse Constant!', 'error'); return; }
        if (!pulseCount || pulseCount < 0) { UIManager.showToast('❌ Sila masukkan Pulse Count (Working Standard)!', 'error'); return; }
        if (start === undefined || start === null || isNaN(start)) { UIManager.showToast('❌ Sila masukkan Bacaan Mula!', 'error'); return; }
        if (end === undefined || end === null || isNaN(end)) { UIManager.showToast('❌ Sila masukkan Bacaan Akhir!', 'error'); return; }
        if (end <= start) { UIManager.showToast('❌ Bacaan Akhir mesti > Bacaan Mula!', 'error'); return; }
        if (!realPulse || realPulse < 0) { UIManager.showToast('❌ Sila masukkan Real Pulse (MUT)!', 'error'); return; }

        const reference = (pulseCount / pConst) * mult;
        const difference = end - start;
        const calculatedPulse = difference * pConst;
        const errorPercent = ((difference - reference) / reference) * 100;
        const absError = Math.abs(errorPercent);
        const limits = { '0.2S': 0.2, '0.5S': 0.5, '0.5': 0.5, '1': 1, '2': 2 };
        const limit = limits[meterClass] || 1;
        const passed = absError <= limit;
        const constCheck = realPulse / difference;

        document.getElementById('dialResult').style.display = 'block';
        document.getElementById('dialResultContent').innerHTML = `
            <div class="dial-results">
                <div class="dial-row"><span>📐 Reference</span><strong>${this.formatEnergy(reference)}</strong></div>
                <div class="dial-row"><span>📐 Difference</span><strong>${this.formatEnergy(difference)}</strong></div>
                <div class="dial-row"><span>📐 Calculated Pulse</span><strong>${this.formatNumber(calculatedPulse)}</strong></div>
                <div class="dial-row"><span>📊 Error</span><strong style="color:${passed?'var(--green)':'var(--red)'}">${errorPercent.toFixed(4)}%</strong></div>
                <div class="dial-row"><span>Status</span><strong style="color:${passed?'var(--green)':'var(--red)'}">${passed ? '✅ LULUS' : '❌ GAGAL'} (Class ${meterClass} ±${limit}%)</strong></div>
                <div class="dial-row"><span>🔍 Const Check</span><strong>${this.formatNumber(constCheck)} imp/${unit}</strong></div>
            </div>`;
        
        this.addToHistory({ type: 'dialTest', unit, meterClass, pConst, mult, pulseCount, start, end, realPulse, reference, difference, calculatedPulse, errorPercent, passed, constCheck, timestamp: new Date().toISOString() });
        UIManager.showToast(passed ? '✅ LULUS!' : '❌ GAGAL!', passed ? 'success' : 'error');
    },

    // ============ MD ============
    calculateDemand() {
        const pc = parseFloat(document.getElementById('demandPulseCount').value);
        const pConst = parseFloat(document.getElementById('demandPulseConst').value);
        const mult = parseFloat(document.getElementById('demandMultiplier').value) || 1;
        if (!pc || pc <= 0) { UIManager.showToast('❌ Sila masukkan Jumlah Pulse!', 'error'); return; }
        if (!pConst || pConst <= 0) { UIManager.showToast('❌ Sila masukkan Pulse Constant!', 'error'); return; }
        const md = (pc * mult * 3600) / (pConst * 1800);
        document.getElementById('demandResult').style.display = 'block';
        document.getElementById('demandResultValue').textContent = this.formatNumber(md) + ' kW';
        this.addToHistory({ type: 'demand', pulseCount: pc, pulseConst: pConst, multiplier: mult, result: md, timestamp: new Date().toISOString() });
        UIManager.showToast('✅ MD dikira!', 'success');
    },

    // ============ LIVE RATIOS ============
    attachLiveListeners() {
        const update = () => {
            const ctP = parseFloat(document.getElementById('ctPrimary').value), ctS = parseFloat(document.getElementById('ctSecondary').value);
            if (this.currentMode === 'ct' || this.currentMode === 'ctvt') {
                document.getElementById('ctLiveRatio').style.display = 'flex';
                const val = document.getElementById('ctLiveRatioValue');
                val.textContent = (ctP && ctS && ctS > 0) ? (ctP/ctS).toFixed(2) + ' : 1' : 'Masukkan nilai';
            } else document.getElementById('ctLiveRatio').style.display = 'none';
        };
        ['ctPrimary','ctSecondary','vtPrimary','vtSecondary'].forEach(id => { const el = document.getElementById(id); if(el) el.addEventListener('input', update); });
    },
    updateLiveRatios() {},

    // ============ HISTORY ============
    addToHistory(entry) { this.history.unshift({ id: Date.now(), ...entry }); if (this.history.length > 50) this.history.pop(); this.saveHistory(); this.renderHistory(); },
    saveHistory() { try { localStorage.setItem('metercalc_pro_history', JSON.stringify(this.history)); } catch(e){} },
    loadHistory() { try { const s = localStorage.getItem('metercalc_pro_history'); if(s) this.history = JSON.parse(s); } catch(e) { this.history = []; } },
    renderHistory() {
        const c = document.getElementById('historyList'), btn = document.getElementById('btnClearHistory');
        if (!this.history.length) { c.innerHTML = '<div class="empty-state"><span class="empty-icon">📭</span><p>Tiada rekod</p></div>'; btn.style.display = 'none'; return; }
        btn.style.display = 'inline-block';
        c.innerHTML = this.history.slice(0, 30).map(h => {
            const d = new Date(h.timestamp), ts = d.toLocaleDateString('ms-MY') + ' ' + d.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' });
            if (h.type === 'calculator') return `<div class="history-item"><div class="history-left"><div class="history-dot ${h.mode||'direct'}"></div><div class="history-info"><div class="history-type">🔌 ${h.mode?.toUpperCase()||'DIRECT'}</div><div class="history-detail">M=${this.formatNumber(h.totalMultiplier)} | ${h.supply} Cl.${h.meterClass}</div></div></div><div class="history-right"><div class="history-value">${this.formatNumber(h.primaryActive)} imp/kWh</div><div class="history-time">${ts}</div></div></div>`;
            if (h.type === 'energy') return `<div class="history-item"><div class="history-left"><div class="history-dot energy"></div><div class="history-info"><div class="history-type">🔢 Tenaga</div><div class="history-detail">${this.formatNumber(h.pulseCount)} ÷ ${this.formatNumber(h.pulseConst)} × ${this.formatNumber(h.multiplier)}</div></div></div><div class="history-right"><div class="history-value">${this.formatEnergy(h.result)}</div><div class="history-time">${ts}</div></div></div>`;
            if (h.type === 'dialTest') return `<div class="history-item"><div class="history-left"><div class="history-dot accuracy"></div><div class="history-info"><div class="history-type">📊 Dial Test</div><div class="history-detail">Ref:${this.formatEnergy(h.reference)} | Diff:${this.formatEnergy(h.difference)} | ${h.unit}</div></div></div><div class="history-right"><div class="history-value">${h.errorPercent.toFixed(4)}% ${h.passed?'✅':'❌'}</div><div class="history-time">${ts}</div></div></div>`;
            if (h.type === 'demand') return `<div class="history-item"><div class="history-left"><div class="history-dot demand"></div><div class="history-info"><div class="history-type">🕐 MD</div><div class="history-detail">${this.formatNumber(h.pulseCount)} ÷ ${this.formatNumber(h.pulseConst)} × ${this.formatNumber(h.multiplier)}</div></div></div><div class="history-right"><div class="history-value">${this.formatNumber(h.result)} kW</div><div class="history-time">${ts}</div></div></div>`;
            return '';
        }).join('');
    },

    formatNumber(num) { if (num === undefined || num === null) return '-'; if (Number.isInteger(num)) return num.toLocaleString('ms-MY'); return parseFloat(num.toFixed(6)).toString(); },
    formatEnergy(kWh) { if (kWh >= 1) return kWh.toFixed(2) + ' kWh'; if (kWh >= 0.1) return kWh.toFixed(3) + ' kWh'; if (kWh >= 0.01) return kWh.toFixed(4) + ' kWh'; if (kWh >= 0.001) return kWh.toFixed(5) + ' kWh'; return kWh.toFixed(6) + ' kWh'; }
};
