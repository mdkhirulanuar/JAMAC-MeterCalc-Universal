const Calculator = {
    currentMode: 'direct',
    history: [],
    longPressTimer: null,
    longPressId: null,

    init() { this.loadHistory(); this.renderHistory(); this.attachLiveListeners(); this.attachInputValidators(); },

    attachInputValidators() {
        document.querySelectorAll('input[type="number"]').forEach(input => {
            input.addEventListener('input', () => { let v = parseFloat(input.value.trim()); if (isNaN(v)) input.value = ''; if (v < 0) input.value = Math.abs(v); });
        });
    },

    getValidNumber(id) { const el = document.getElementById(id); if (!el) return null; const val = parseFloat(el.value); return (isNaN(val) || val < 0) ? null : val; },

    // ============ LONG PRESS HANDLERS ============
    startLongPress(event, id) {
        this.longPressId = id;
        this.longPressTimer = setTimeout(() => {
            const item = document.getElementById('history-' + id);
            if (item) {
                item.classList.add('show-delete');
                if (navigator.vibrate) navigator.vibrate(15);
            }
        }, 600);
        event.preventDefault();
    },

    cancelLongPress() {
        clearTimeout(this.longPressTimer);
        this.longPressTimer = null;
    },

    handleHistoryClick(event, id) {
        // Ignore if delete button was clicked
        if (event.target.closest('.history-delete-mobile')) return;
        
        // Hide all delete buttons
        document.querySelectorAll('.history-item.show-delete').forEach(item => {
            item.classList.remove('show-delete');
        });
        
        this.longPressId = null;
        clearTimeout(this.longPressTimer);
    },

    calculate() {
        const meterConstActive = this.getValidNumber('meterConstActive') || 0;
        const meterConstReactive = this.getValidNumber('meterConstReactive') || 0;
        const supply = document.getElementById('supplyType').value;
        const meterClass = document.getElementById('meterClass').value;
        if (!meterConstActive || meterConstActive <= 0) { UIManager.showToast(UIManager.t('errConstActive'), 'error'); return; }
        let ctRatio = 1, vtRatio = 1;
        if (this.currentMode === 'ct' || this.currentMode === 'ctvt') {
            const ctP = this.getValidNumber('ctPrimary'), ctS = this.getValidNumber('ctSecondary');
            if (!ctP || ctP <= 0) { UIManager.showToast(UIManager.t('errCTPrimary'), 'error'); return; }
            if (!ctS || ctS <= 0) { UIManager.showToast(UIManager.t('errCTSecondary'), 'error'); return; }
            if (ctS > ctP) UIManager.showToast(UIManager.t('warnCTSwap'), 'error');
            ctRatio = ctP / ctS;
        }
        if (this.currentMode === 'ctvt') {
            const vtP = this.getValidNumber('vtPrimary'), vtS = this.getValidNumber('vtSecondary');
            if (!vtP || vtP <= 0) { UIManager.showToast(UIManager.t('errVTPrimary'), 'error'); return; }
            if (!vtS || vtS <= 0) { UIManager.showToast(UIManager.t('errVTSecondary'), 'error'); return; }
            vtRatio = vtP / vtS;
        }
        const M = ctRatio * vtRatio;
        const primaryActive = meterConstActive / M, secondaryActive = meterConstActive;
        let primaryReactive = 0, secondaryReactive = 0;
        if (meterConstReactive > 0) { primaryReactive = meterConstReactive / M; secondaryReactive = meterConstReactive; }
        this.displayCalcResults({ type: 'calculator', mode: this.currentMode, supply, meterClass, meterConstActive, meterConstReactive, ctRatio, vtRatio, totalMultiplier: M, primaryActive, secondaryActive, primaryReactive, secondaryReactive, timestamp: new Date().toISOString() });
        document.getElementById('calcResultsPanel').scrollIntoView({ behavior: 'smooth' });
        UIManager.showToast(UIManager.t('calcDone'), 'success');
        if (navigator.vibrate) navigator.vibrate([10, 20, 10]);
    },

    displayCalcResults(result) {
        const panel = document.getElementById('calcResultsPanel'), body = document.getElementById('calcResultsBody');
        panel.style.display = 'block';
        const labels = { direct: 'DIRECT', ct: 'CT', ctvt: 'CT+VT' };
        let html = `<div class="hero-result"><div class="hero-label">TOTAL MULTIPLIER</div><div class="hero-value">${this.formatNumber(result.totalMultiplier)}</div><div class="hero-sub">${labels[result.mode]} • ${result.supply} • Cl.${result.meterClass}</div></div>`;
        if (result.mode !== 'direct') {
            html += `<div class="result-grid-2"><div class="result-card"><div class="result-card-label">CT Ratio</div><div class="result-card-value">${this.formatNumber(result.ctRatio)} : 1</div></div>`;
            if (result.mode === 'ctvt') html += `<div class="result-card"><div class="result-card-label">VT Ratio</div><div class="result-card-value">${this.formatNumber(result.vtRatio)} : 1</div></div>`;
            html += `</div>`;
        }
        html += `<div class="section-divider"><div class="divider-line"></div><span class="divider-text">PULSE CONSTANTS</span><div class="divider-line"></div></div><div class="result-grid-2"><div class="result-card pulse-card"><div class="result-card-label">Primary Active</div><div class="result-card-value">${result.primaryActive < 0.001 ? result.primaryActive.toExponential(4) : this.formatNumber(result.primaryActive)}</div><div class="result-card-unit">imp/kWh</div></div><div class="result-card pulse-card"><div class="result-card-label">Secondary Active</div><div class="result-card-value">${this.formatNumber(result.secondaryActive)}</div><div class="result-card-unit">imp/kWh</div></div></div>`;
        if (result.primaryReactive > 0) html += `<div class="result-grid-2"><div class="result-card pulse-card"><div class="result-card-label">Primary Reactive</div><div class="result-card-value">${this.formatNumber(result.primaryReactive)}</div><div class="result-card-unit">imp/kvarh</div></div><div class="result-card pulse-card"><div class="result-card-label">Secondary Reactive</div><div class="result-card-value">${this.formatNumber(result.secondaryReactive)}</div><div class="result-card-unit">imp/kvarh</div></div></div>`;
        html += `<div class="action-buttons"><button class="btn-action btn-share" onclick="UIManager.shareCalculatorResult()">📤 Kongsi</button></div>`;
        body.innerHTML = html;
        this.addToHistory(result);
    },

    calculateEnergy() {
        const pc = parseFloat(document.getElementById('energyPulseCount').value), pConst = parseFloat(document.getElementById('energyPulseConst').value), mult = parseFloat(document.getElementById('energyMultiplier').value) || 1, unit = document.getElementById('energyUnit').value;
        if (!pc || pc < 0) { UIManager.showToast(UIManager.t('errPulseCount'), 'error'); return; }
        if (!pConst || pConst <= 0) { UIManager.showToast(UIManager.t('errPulseConst'), 'error'); return; }
        let energy = (pc / pConst) * mult; if (unit === 'MWh') energy /= 1000;
        document.getElementById('energyResult').style.display = 'block';
        document.getElementById('energyResultValue').textContent = this.formatEnergy(energy, unit);
        this.addToHistory({ type: 'energy', pulseCount: pc, pulseConst: pConst, multiplier: mult, unit, result: energy, timestamp: new Date().toISOString() });
        UIManager.showToast(UIManager.t('energyDone'), 'success');
    },

    calculateDialTest() {
        const unit = document.getElementById('dialUnit').value, meterClass = document.getElementById('dialClass').value, pConst = parseFloat(document.getElementById('dialPulseConst').value), mult = parseFloat(document.getElementById('dialMultiplier').value) || 1;
        const pulseCount = parseFloat(document.getElementById('dialPulseCount').value), start = parseFloat(document.getElementById('dialStart').value), end = parseFloat(document.getElementById('dialEnd').value), realPulse = parseFloat(document.getElementById('dialRealPulse').value);
        if (!pConst || pConst <= 0) { UIManager.showToast(UIManager.t('errPulseConst'), 'error'); return; }
        if (!pulseCount || pulseCount < 0) { UIManager.showToast(UIManager.t('errPulseCountWS'), 'error'); return; }
        if (isNaN(start)) { UIManager.showToast(UIManager.t('errStart'), 'error'); return; }
        if (isNaN(end)) { UIManager.showToast(UIManager.t('errEnd'), 'error'); return; }
        if (end <= start) { UIManager.showToast(UIManager.t('errEndLess'), 'error'); return; }
        if (!realPulse || realPulse < 0) { UIManager.showToast(UIManager.t('errRealPulse'), 'error'); return; }
        const reference = (pulseCount / pConst) * mult, difference = end - start, calculatedPulse = difference * pConst;
        const errorEnergy = ((difference - reference) / reference) * 100, errorPulse = ((realPulse - calculatedPulse) / calculatedPulse) * 100;
        const limits = { '0.2S': 0.2, '0.5S': 0.5, '0.5': 0.5, '1': 1, '2': 2 }, limit = limits[meterClass] || 1, passed = Math.abs(errorEnergy) <= limit;
        const constCheck = realPulse / difference;
        document.getElementById('dialResult').style.display = 'block';
        document.getElementById('dialResultContent').innerHTML = `
            <div class="dial-results">
                <div class="dial-row"><span>📐 Reference Energy</span><strong>${this.formatEnergy(reference, unit)}</strong></div>
                <div class="dial-row"><span>📐 Difference</span><strong>${this.formatEnergy(difference, unit)}</strong></div>
                <div class="dial-row"><span>📐 Calculated Pulse</span><strong>${this.formatNumber(calculatedPulse)}</strong></div>
                <div class="dial-row"><span>📊 Error (%)</span><strong style="color:${passed?'var(--green)':'var(--red)'}">${errorEnergy.toFixed(4)}% ${passed?'✅':'❌'}</strong></div>
                <div class="dial-row"><span>📊 Error Pulse (%)</span><strong style="color:${Math.abs(errorPulse)<=limit?'var(--green)':'var(--red)'}">${errorPulse.toFixed(4)}% ${Math.abs(errorPulse)<=limit?'✅':'❌'}</strong></div>
                <div class="dial-row"><span>🔍 Constant Check</span><strong>${this.formatNumber(constCheck)} imp/${unit}</strong></div>
            </div>`;
        this.addToHistory({ type: 'accuracy', unit, meterClass, pConst, mult, pulseCount, start, end, realPulse, reference, difference, calculatedPulse, errorEnergy, errorPulse, passed, constCheck, timestamp: new Date().toISOString() });
        UIManager.showToast(passed ? UIManager.t('dialPass') : UIManager.t('dialFail'), passed ? 'success' : 'error');
    },

    calculateDemand() {
        const pc = parseFloat(document.getElementById('demandPulseCount').value), pConst = parseFloat(document.getElementById('demandPulseConst').value), mult = parseFloat(document.getElementById('demandMultiplier').value) || 1;
        if (!pc || pc < 0) { UIManager.showToast(UIManager.t('errPulseCount'), 'error'); return; }
        if (!pConst || pConst <= 0) { UIManager.showToast(UIManager.t('errPulseConst'), 'error'); return; }
        const md = (pc * mult * 3600) / (pConst * 1800);
        document.getElementById('demandResult').style.display = 'block';
        document.getElementById('demandResultValue').textContent = this.formatNumber(md) + ' kW';
        this.addToHistory({ type: 'demand', pulseCount: pc, pulseConst: pConst, multiplier: mult, result: md, timestamp: new Date().toISOString() });
        UIManager.showToast(UIManager.t('mdDone'), 'success');
    },

    attachLiveListeners() {
        const update = () => {
            const ctP = parseFloat(document.getElementById('ctPrimary').value), ctS = parseFloat(document.getElementById('ctSecondary').value);
            if (this.currentMode === 'ct' || this.currentMode === 'ctvt') {
                document.getElementById('ctLiveRatio').style.display = 'flex';
                document.getElementById('ctLiveRatioValue').textContent = (ctP && ctS && ctS > 0) ? (ctP/ctS).toFixed(2) + ' : 1' : '-';
            } else document.getElementById('ctLiveRatio').style.display = 'none';
            const vtP = parseFloat(document.getElementById('vtPrimary').value), vtS = parseFloat(document.getElementById('vtSecondary').value);
            if (this.currentMode === 'ctvt') {
                document.getElementById('vtLiveRatio').style.display = 'flex';
                document.getElementById('vtLiveRatioValue').textContent = (vtP && vtS && vtS > 0) ? (vtP/vtS).toFixed(2) + ' : 1' : '-';
            } else document.getElementById('vtLiveRatio').style.display = 'none';
        };
        ['ctPrimary','ctSecondary','vtPrimary','vtSecondary'].forEach(id => { const el = document.getElementById(id); if(el) el.addEventListener('input', update); });
    },
    updateLiveRatios() {},

    addToHistory(entry) { this.history.unshift({ id: Date.now(), ...entry }); if (this.history.length > 50) this.history.pop(); this.saveHistory(); this.renderHistory(); },
    saveHistory() { try { localStorage.setItem('metercalc_pro_history', JSON.stringify(this.history)); } catch(e){} },
    loadHistory() { try { const s = localStorage.getItem('metercalc_pro_history'); if(s) this.history = JSON.parse(s); } catch(e) { this.history = []; } },
    deleteHistoryItem(id) { this.history = this.history.filter(h => h.id !== id); this.saveHistory(); this.renderHistory(); UIManager.showToast('🗑️ Rekod dipadam', 'success'); },
    renderHistory() {
        const c = document.getElementById('historyList'), btn = document.getElementById('btnClearHistory');
        if (!this.history.length) { c.innerHTML = '<div class="empty-state"><span class="empty-icon">📭</span><p>Tiada rekod</p></div>'; btn.style.display = 'none'; return; }
        btn.style.display = 'inline-block';
        c.innerHTML = this.history.slice(0, 30).map(h => {
            const d = new Date(h.timestamp), ts = d.toLocaleDateString('ms-MY') + ' ' + d.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' });
            let typeLabel = '', dotClass = '', detail = '', value = '';
            if (h.type === 'calculator') { typeLabel = '🔌 ' + (h.mode||'DIRECT').toUpperCase(); dotClass = h.mode||'direct'; detail = 'M=' + this.formatNumber(h.totalMultiplier) + ' | ' + h.supply + ' Cl.' + h.meterClass; value = this.formatNumber(h.primaryActive) + ' imp/kWh'; }
            else if (h.type === 'energy') { typeLabel = '🔢 Tenaga'; dotClass = 'energy'; detail = this.formatNumber(h.pulseCount) + ' ÷ ' + this.formatNumber(h.pulseConst) + ' × ' + this.formatNumber(h.multiplier); value = this.formatEnergy(h.result, h.unit||'kWh'); }
            else if (h.type === 'accuracy') { typeLabel = '📊 Accuracy Test'; dotClass = 'accuracy'; detail = 'Ref:' + this.formatEnergy(h.reference) + ' Diff:' + this.formatEnergy(h.difference); value = h.errorEnergy.toFixed(4) + '% ' + (h.passed?'✅':'❌'); }
            else if (h.type === 'demand') { typeLabel = '🕐 MD'; dotClass = 'demand'; detail = this.formatNumber(h.pulseCount) + ' ÷ ' + this.formatNumber(h.pulseConst) + ' × ' + this.formatNumber(h.multiplier); value = this.formatNumber(h.result) + ' kW'; }
            return `<div class="history-item" id="history-${h.id}" ontouchstart="Calculator.startLongPress(event, ${h.id})" ontouchend="Calculator.cancelLongPress()" ontouchmove="Calculator.cancelLongPress()" onmousedown="Calculator.startLongPress(event, ${h.id})" onmouseup="Calculator.cancelLongPress()" onmouseleave="Calculator.cancelLongPress()" onclick="Calculator.handleHistoryClick(event, ${h.id})"><div class="history-left"><div class="history-dot ${dotClass}"></div><div class="history-info"><div class="history-type">${typeLabel}</div><div class="history-detail">${detail}</div></div></div><div class="history-right"><div class="history-value">${value}</div><div class="history-time">${ts}</div></div><button class="history-delete-mobile" onclick="event.stopPropagation();Calculator.deleteHistoryItem(${h.id})">✕</button></div>`;
        }).join('');
    },
    exportHistoryCSV() {
        let csv = 'Type,Date,Detail,Value\n';
        this.history.forEach(h => {
            const d = new Date(h.timestamp).toISOString();
            if (h.type === 'calculator') csv += `"Calculator","${d}","M=${this.formatNumber(h.totalMultiplier)} ${h.supply} Cl.${h.meterClass}","${this.formatNumber(h.primaryActive)} imp/kWh"\n`;
            else if (h.type === 'energy') csv += `"Energy","${d}","${this.formatNumber(h.pulseCount)}÷${this.formatNumber(h.pulseConst)}×${this.formatNumber(h.multiplier)}","${this.formatEnergy(h.result, h.unit||'kWh')}"\n`;
            else if (h.type === 'accuracy') csv += `"Accuracy Test","${d}","Ref:${this.formatEnergy(h.reference)} Diff:${this.formatEnergy(h.difference)}","${h.errorEnergy.toFixed(4)}%"\n`;
            else if (h.type === 'demand') csv += `"MD","${d}","${this.formatNumber(h.pulseCount)}÷${this.formatNumber(h.pulseConst)}×${this.formatNumber(h.multiplier)}","${this.formatNumber(h.result)} kW"\n`;
        });
        return csv;
    },

    formatNumber(num) { if (num === undefined || num === null) return '-'; if (Number.isInteger(num)) return num.toLocaleString('ms-MY'); return parseFloat(num.toFixed(6)).toString(); },
    formatEnergy(kWh, unit) { unit = unit || 'kWh'; if (unit === 'MWh') return kWh.toFixed(4) + ' MWh'; if (kWh >= 1) return kWh.toFixed(2) + ' ' + unit; if (kWh >= 0.1) return kWh.toFixed(3) + ' ' + unit; if (kWh >= 0.01) return kWh.toFixed(4) + ' ' + unit; if (kWh >= 0.001) return kWh.toFixed(5) + ' ' + unit; return kWh.toFixed(6) + ' ' + unit; }
};
