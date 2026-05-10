/**
 * MeterCalc Pro - Core Calculation Engine v3.0
 */
const Calculator = {
    currentMode: 'direct', history: [], longPressTimer: null, longPressId: null,

    init() { this.loadHistory(); this.renderHistory(); this.attachLiveListeners(); this.attachInputValidators(); },

    attachInputValidators() {
        document.querySelectorAll('input[type="number"]').forEach(input => {
            input.addEventListener('input', () => { let v = parseFloat(input.value.trim()); if (isNaN(v)) input.value = ''; if (v < 0) input.value = Math.abs(v); });
        });
    },
    getValidNumber(id) { const el = document.getElementById(id); if (!el) return null; const val = parseFloat(el.value); return (isNaN(val) || val < 0) ? null : val; },

    startLongPress(event, id) {
        this.longPressId = id;
        this.longPressTimer = setTimeout(() => {
            const item = document.getElementById('history-' + id);
            if (item) {
                document.querySelectorAll('.history-item.show-delete').forEach(el => { if (el !== item) el.classList.remove('show-delete'); });
                item.classList.add('show-delete');
                if (navigator.vibrate) navigator.vibrate(15);
            }
        }, 600);
        event.preventDefault();
    },
    cancelLongPress() { clearTimeout(this.longPressTimer); this.longPressTimer = null; },
    handleHistoryClick(event, id) {
        if (event.target.closest('.history-delete-mobile')) return;
        document.querySelectorAll('.history-item.show-delete').forEach(item => item.classList.remove('show-delete'));
        this.longPressId = null; clearTimeout(this.longPressTimer);
    },

    calculate() {
        const a = this.getValidNumber('meterConstActive') || 0, r = this.getValidNumber('meterConstReactive') || 0;
        const s = document.getElementById('supplyType').value, c = document.getElementById('meterClass').value;
        if (!a || a <= 0) { UIManager.showToast(UIManager.t('errConstActive'), 'error'); return; }
        let ct = 1, vt = 1;
        if (this.currentMode === 'ct' || this.currentMode === 'ctvt') {
            const p = this.getValidNumber('ctPrimary'), q = this.getValidNumber('ctSecondary');
            if (!p || p <= 0) { UIManager.showToast(UIManager.t('errCTPrimary'), 'error'); return; }
            if (!q || q <= 0) { UIManager.showToast(UIManager.t('errCTSecondary'), 'error'); return; }
            if (q > p) UIManager.showToast(UIManager.t('warnCTSwap'), 'error');
            ct = p / q;
        }
        if (this.currentMode === 'ctvt') {
            const p = this.getValidNumber('vtPrimary'), q = this.getValidNumber('vtSecondary');
            if (!p || p <= 0) { UIManager.showToast(UIManager.t('errVTPrimary'), 'error'); return; }
            if (!q || q <= 0) { UIManager.showToast(UIManager.t('errVTSecondary'), 'error'); return; }
            vt = p / q;
        }
        const M = ct * vt, pa = a / M, sa = a; let pr = 0, sr = 0;
        if (r > 0) { pr = r / M; sr = r; }
        this.displayCalcResults({ type: 'calculator', mode: this.currentMode, supply: s, meterClass: c, meterConstActive: a, meterConstReactive: r, ctRatio: ct, vtRatio: vt, totalMultiplier: M, primaryActive: pa, secondaryActive: sa, primaryReactive: pr, secondaryReactive: sr, timestamp: new Date().toISOString() });
        document.getElementById('calcResultsPanel').scrollIntoView({ behavior: 'smooth' });
        UIManager.showToast(UIManager.t('calcDone'), 'success');
        if (navigator.vibrate) navigator.vibrate([10, 20, 10]);
    },

    displayCalcResults(r) {
        const p = document.getElementById('calcResultsPanel'), b = document.getElementById('calcResultsBody');
        p.style.display = 'block'; p.style.animation = 'none'; p.offsetHeight; p.style.animation = 'fadeInUp 0.3s ease-out';
        const l = { direct: 'DIRECT', ct: 'CT', ctvt: 'CT+VT' };
        let h = `<div class="hero-result"><div class="hero-label">TOTAL MULTIPLIER</div><div class="hero-value">${this.formatNumber(r.totalMultiplier)}</div><div class="hero-sub">${l[r.mode]} • ${r.supply} • Cl.${r.meterClass}</div></div>`;
        if (r.mode !== 'direct') { h += `<div class="result-grid-2"><div class="result-card"><div class="result-card-label">CT Ratio</div><div class="result-card-value">${this.formatNumber(r.ctRatio)} : 1</div></div>`; if (r.mode === 'ctvt') h += `<div class="result-card"><div class="result-card-label">VT Ratio</div><div class="result-card-value">${this.formatNumber(r.vtRatio)} : 1</div></div>`; h += `</div>`; }
        h += `<div class="section-divider"><div class="divider-line"></div><span class="divider-text">PULSE CONSTANTS</span><div class="divider-line"></div></div><div class="result-grid-2"><div class="result-card pulse-card"><div class="result-card-label">Primary Active</div><div class="result-card-value">${r.primaryActive < 0.001 ? r.primaryActive.toExponential(4) : this.formatNumber(r.primaryActive)}</div><div class="result-card-unit">imp/kWh</div></div><div class="result-card pulse-card"><div class="result-card-label">Secondary Active</div><div class="result-card-value">${this.formatNumber(r.secondaryActive)}</div><div class="result-card-unit">imp/kWh</div></div></div>`;
        if (r.primaryReactive > 0) h += `<div class="result-grid-2"><div class="result-card pulse-card"><div class="result-card-label">Primary Reactive</div><div class="result-card-value">${this.formatNumber(r.primaryReactive)}</div><div class="result-card-unit">imp/kvarh</div></div><div class="result-card pulse-card"><div class="result-card-label">Secondary Reactive</div><div class="result-card-value">${this.formatNumber(r.secondaryReactive)}</div><div class="result-card-unit">imp/kvarh</div></div></div>`;
        h += `<div class="action-buttons"><button class="btn-action btn-share" onclick="UIManager.shareCalculatorResult()">📤 Kongsi</button></div>`;
        b.innerHTML = h; this.addToHistory(r);
    },

    calculateEnergy() {
        const pc = parseFloat(document.getElementById('energyPulseCount').value), pConst = parseFloat(document.getElementById('energyPulseConst').value), mult = parseFloat(document.getElementById('energyMultiplier').value) || 1, unit = document.getElementById('energyUnit').value;
        if (!pc || pc < 0) { UIManager.showToast(UIManager.t('errPulseCount'), 'error'); return; }
        if (!pConst || pConst <= 0) { UIManager.showToast(UIManager.t('errPulseConst'), 'error'); return; }
        let e = (pc / pConst) * mult; if (unit === 'MWh') e /= 1000;
        document.getElementById('energyResult').style.display = 'block';
        document.getElementById('energyResultValue').textContent = this.formatEnergy(e, unit);
        this.addToHistory({ type: 'energy', pulseCount: pc, pulseConst: pConst, multiplier: mult, unit, result: e, timestamp: new Date().toISOString() });
        UIManager.showToast(UIManager.t('energyDone'), 'success');
    },

    calculateDialTest() {
        const unit = document.getElementById('dialUnit').value, mc = document.getElementById('dialClass').value, pConst = parseFloat(document.getElementById('dialPulseConst').value), mult = parseFloat(document.getElementById('dialMultiplier').value) || 1;
        const pc = parseFloat(document.getElementById('dialPulseCount').value), start = parseFloat(document.getElementById('dialStart').value), end = parseFloat(document.getElementById('dialEnd').value), rp = parseFloat(document.getElementById('dialRealPulse').value);
        if (!pConst || pConst <= 0) { UIManager.showToast(UIManager.t('errPulseConst'), 'error'); return; }
        if (!pc || pc < 0) { UIManager.showToast(UIManager.t('errPulseCountWS'), 'error'); return; }
        if (isNaN(start)) { UIManager.showToast(UIManager.t('errStart'), 'error'); return; }
        if (isNaN(end)) { UIManager.showToast(UIManager.t('errEnd'), 'error'); return; }
        if (end <= start) { UIManager.showToast(UIManager.t('errEndLess'), 'error'); return; }
        if (!rp || rp < 0) { UIManager.showToast(UIManager.t('errRealPulse'), 'error'); return; }
        const ref = (pc / pConst) * mult, diff = end - start, calcP = diff * pConst;
        const errE = ((diff - ref) / ref) * 100, errP = ((rp - calcP) / calcP) * 100;
        const limits = { '0.2S': 0.2, '0.5S': 0.5, '0.5': 0.5, '1': 1, '2': 2 }, limit = limits[mc] || 1, passed = Math.abs(errE) <= limit;
        document.getElementById('dialResult').style.display = 'block';
        document.getElementById('dialResultContent').innerHTML = `<div class="dial-results"><div class="dial-row"><span>📐 Reference Energy</span><strong>${this.formatEnergy(ref, unit)}</strong></div><div class="dial-row"><span>📐 Difference</span><strong>${this.formatEnergy(diff, unit)}</strong></div><div class="dial-row"><span>📐 Calculated Pulse</span><strong>${this.formatNumber(calcP)}</strong></div><div class="dial-row"><span>📊 Error (%)</span><strong style="color:${passed?'var(--green)':'var(--red)'}">${errE.toFixed(4)}% ${passed?'✅':'❌'}</strong></div><div class="dial-row"><span>📊 Error Pulse (%)</span><strong style="color:${Math.abs(errP)<=limit?'var(--green)':'var(--red)'}">${errP.toFixed(4)}% ${Math.abs(errP)<=limit?'✅':'❌'}</strong></div><div class="dial-row"><span>🔍 Constant Check</span><strong>${this.formatNumber(rp/diff)} imp/${unit}</strong></div></div>`;
        this.addToHistory({ type: 'accuracy', unit, meterClass: mc, pConst, mult, pulseCount: pc, start, end, realPulse: rp, reference: ref, difference: diff, calculatedPulse: calcP, errorEnergy: errE, errorPulse: errP, passed, constCheck: rp/diff, timestamp: new Date().toISOString() });
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
        const u = () => {
            const ctP = parseFloat(document.getElementById('ctPrimary').value), ctS = parseFloat(document.getElementById('ctSecondary').value);
            if (this.currentMode === 'ct' || this.currentMode === 'ctvt') { document.getElementById('ctLiveRatio').style.display = 'flex'; document.getElementById('ctLiveRatioValue').textContent = (ctP && ctS && ctS > 0) ? (ctP/ctS).toFixed(2)+' : 1' : '-'; }
            else document.getElementById('ctLiveRatio').style.display = 'none';
            const vtP = parseFloat(document.getElementById('vtPrimary').value), vtS = parseFloat(document.getElementById('vtSecondary').value);
            if (this.currentMode === 'ctvt') { document.getElementById('vtLiveRatio').style.display = 'flex'; document.getElementById('vtLiveRatioValue').textContent = (vtP && vtS && vtS > 0) ? (vtP/vtS).toFixed(2)+' : 1' : '-'; }
            else document.getElementById('vtLiveRatio').style.display = 'none';
        };
        ['ctPrimary','ctSecondary','vtPrimary','vtSecondary'].forEach(id => { const el = document.getElementById(id); if(el) el.addEventListener('input', u); });
    },
    updateLiveRatios() {},

    addToHistory(e) { this.history.unshift({ id: Date.now(), ...e }); if (this.history.length > 50) this.history.pop(); this.saveHistory(); this.renderHistory(); },
    saveHistory() { try { localStorage.setItem('metercalc_pro_history', JSON.stringify(this.history)); } catch(e){} },
    loadHistory() { try { const s = localStorage.getItem('metercalc_pro_history'); if(s) this.history = JSON.parse(s); } catch(e) { this.history = []; } },
    deleteHistoryItem(id) { this.history = this.history.filter(h => h.id !== id); this.saveHistory(); this.renderHistory(); UIManager.showToast('🗑️ ' + (UIManager.currentLang === 'bm' ? 'Rekod dipadam' : 'Record deleted'), 'success'); },

    renderHistory() {
        const c = document.getElementById('historyList'), btn = document.getElementById('btnClearHistory'), lang = UIManager.currentLang;
        if (!this.history.length) { c.innerHTML = '<div class="empty-state"><span class="empty-icon">📭</span><p>' + (lang === 'bm' ? 'Tiada rekod' : 'No records') + '</p></div>'; btn.style.display = 'none'; return; }
        btn.style.display = 'inline-block';
        c.innerHTML = this.history.slice(0, 30).map(h => {
            const d = new Date(h.timestamp), ts = d.toLocaleDateString('ms-MY') + ' ' + d.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' });
            let tl = '', dc = '', dt = '', v = '';
            if (h.type === 'calculator') { tl = '🔌 ' + (h.mode||'DIRECT').toUpperCase(); dc = h.mode||'direct'; dt = 'M=' + this.formatNumber(h.totalMultiplier) + ' | ' + h.supply + ' Cl.' + h.meterClass; v = this.formatNumber(h.primaryActive) + ' imp/kWh'; }
            else if (h.type === 'energy') { tl = lang === 'bm' ? '🔢 Tenaga' : '🔢 Energy'; dc = 'energy'; dt = this.formatNumber(h.pulseCount) + ' ÷ ' + this.formatNumber(h.pulseConst) + ' × ' + this.formatNumber(h.multiplier); v = this.formatEnergy(h.result, h.unit||'kWh'); }
            else if (h.type === 'accuracy') { tl = '📊 Accuracy Test'; dc = 'accuracy'; dt = 'Ref:' + this.formatEnergy(h.reference) + ' Diff:' + this.formatEnergy(h.difference); v = h.errorEnergy.toFixed(4) + '% ' + (h.passed?'✅':'❌'); }
            else if (h.type === 'demand') { tl = '🕐 MD'; dc = 'demand'; dt = this.formatNumber(h.pulseCount) + ' ÷ ' + this.formatNumber(h.pulseConst) + ' × ' + this.formatNumber(h.multiplier); v = this.formatNumber(h.result) + ' kW'; }
            return `<div class="history-item" id="history-${h.id}" ontouchstart="Calculator.startLongPress(event, ${h.id})" ontouchend="Calculator.cancelLongPress()" ontouchmove="Calculator.cancelLongPress()" onmousedown="Calculator.startLongPress(event, ${h.id})" onmouseup="Calculator.cancelLongPress()" onmouseleave="Calculator.cancelLongPress()" onclick="Calculator.handleHistoryClick(event, ${h.id})"><div class="history-left"><div class="history-dot ${dc}"></div><div class="history-info"><div class="history-type">${tl}</div><div class="history-detail">${dt}</div></div></div><div class="history-right"><div class="history-value">${v}</div><div class="history-time">${ts}</div></div><button class="history-delete-mobile" onclick="event.stopPropagation();Calculator.deleteHistoryItem(${h.id})">✕</button></div>`;
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

    formatNumber(n) { if (n === undefined || n === null) return '-'; if (Number.isInteger(n)) return n.toLocaleString('ms-MY'); return parseFloat(n.toFixed(6)).toString(); },
    formatEnergy(kWh, unit) { unit = unit || 'kWh'; if (unit === 'MWh') return kWh.toFixed(4) + ' MWh'; if (kWh >= 1) return kWh.toFixed(2) + ' ' + unit; if (kWh >= 0.1) return kWh.toFixed(3) + ' ' + unit; if (kWh >= 0.01) return kWh.toFixed(4) + ' ' + unit; if (kWh >= 0.001) return kWh.toFixed(5) + ' ' + unit; return kWh.toFixed(6) + ' ' + unit; }
};
