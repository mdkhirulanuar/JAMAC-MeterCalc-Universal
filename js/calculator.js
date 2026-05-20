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
                if (value === '') return;
                const parsed = Number(value);
                if (!Number.isFinite(parsed) || parsed < 0) {
                    input.classList.add('input-error');
                } else {
                    input.classList.remove('input-error');
                }
            });
        });
    },

    getNumber(id) {
        const el = document.getElementById(id);
        if (!el) return NaN;
        return Number(el.value);
    },

    isValidPositive(value) {
        return Number.isFinite(value) && value > 0;
    },

    calculate() {
        const meterConstActive = this.getNumber('meterConstActive');
        const meterConstReactive = this.getNumber('meterConstReactive') || 0;
        const supply = document.getElementById('supplyType').value;
        const meterClass = document.getElementById('meterClass').value;

        if (!this.isValidPositive(meterConstActive)) {
            UIManager.showToast('Meter Constant Active mesti > 0', 'error');
            return;
        }

        let ctRatio = 1;
        let vtRatio = 1;

        if (this.currentMode === 'ct' || this.currentMode === 'ctvt') {
            const ctP = this.getNumber('ctPrimary');
            const ctS = this.getNumber('ctSecondary');
            if (!this.isValidPositive(ctP)) { UIManager.showToast('CT Primary mesti > 0', 'error'); return; }
            if (!this.isValidPositive(ctS)) { UIManager.showToast('CT Secondary mesti > 0', 'error'); return; }
            ctRatio = ctP / ctS;
        }

        if (this.currentMode === 'ctvt') {
            const vtP = this.getNumber('vtPrimary');
            const vtS = this.getNumber('vtSecondary');
            if (!this.isValidPositive(vtP)) { UIManager.showToast('VT Primary mesti > 0', 'error'); return; }
            if (!this.isValidPositive(vtS)) { UIManager.showToast('VT Secondary mesti > 0', 'error'); return; }
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
        UIManager.showToast('Pengiraan selesai!', 'success');
    },

    displayCalcResults(result) {
        const panel = document.getElementById('calcResultsPanel');
        const body = document.getElementById('calcResultsBody');
        panel.style.display = 'block';

        const labels = { direct: 'DIRECT', ct: 'CT', ctvt: 'CT+VT' };
        const formula = result.mode === 'direct' ? 'M = 1' :
                        result.mode === 'ct' ? `M = ${this.formatNumber(result.ctRatio)} = CT ratio` :
                        `M = ${this.formatNumber(result.ctRatio)} × ${this.formatNumber(result.vtRatio)} = ${this.formatNumber(result.totalMultiplier)}`;

        let html = `
            <div class="hero-result">
                <div class="hero-label">TOTAL MULTIPLIER</div>
                <div class="hero-value">${this.formatNumber(result.totalMultiplier)}</div>
                <div class="hero-sub">${labels[result.mode]} • ${result.supply} • ${result.meterClass}</div>
            </div>
            <div class="formula-box">
                <div class="formula-title">Formula</div>
                <div class="formula-content"><code>${formula}</code></div>
            </div>
            <div class="section-divider"><div class="divider-line"></div><span class="divider-text">PULSE CONSTANTS</span><div class="divider-line"></div></div>
            <div class="result-grid-2">
                <div class="result-card"><div class="result-card-label">Primary Active</div><div class="result-card-value">${this.formatPulseConstant(result.primaryActive)}</div><div class="result-card-unit">imp/kWh</div></div>
                <div class="result-card"><div class="result-card-label">Secondary Active</div><div class="result-card-value">${this.formatNumber(result.secondaryActive)}</div><div class="result-card-unit">imp/kWh</div></div>
            </div>
            <div class="action-buttons"><button class="btn-calculate" onclick="PDFReport.generateFromCurrent()">📄 Export PDF</button></div>
        `;

        body.innerHTML = html;
        this.addToHistory(result);
    },

    calculateEnergy() {
        const mode = document.getElementById('energyMode').value;
        const unit = document.getElementById('energyUnit').value;
        const pConst = this.getNumber('energyPulseConst');
        const mult = this.getNumber('energyMultiplier') || 1;

        if (!this.isValidPositive(pConst)) {
            UIManager.showToast('Meter Constant mesti > 0', 'error');
            return;
        }

        const resultPanel = document.getElementById('energyResult');
        const resultValue = document.getElementById('energyResultValue');
        resultPanel.style.display = 'block';

        if (mode === 'energyToPulse') {
            const energyInput = this.getNumber('energyInputValue');
            if (!Number.isFinite(energyInput) || energyInput < 0) {
                UIManager.showToast('Nilai tenaga mesti ≥ 0', 'error');
                return;
            }
            const energyKWh = unit === 'MWh' ? energyInput * 1000 : energyInput;
            const pulse = (energyKWh * pConst) / mult;
            resultValue.textContent = `${this.formatNumber(pulse)} pulse`;
            this.addToHistory({ type: 'energyToPulse', energyInput, pulseConst: pConst, multiplier: mult, unit, result: pulse, timestamp: new Date().toISOString() });
        } else {
            const pc = this.getNumber('energyPulseCount');
            if (!Number.isFinite(pc) || pc < 0) {
                UIManager.showToast('Pulse Count mesti ≥ 0', 'error');
                return;
            }
            let energy = (pc / pConst) * mult;
            if (unit === 'MWh') energy /= 1000;
            resultValue.textContent = this.formatEnergy(energy, unit);
            this.addToHistory({ type: 'energy', pulseCount: pc, pulseConst: pConst, multiplier: mult, unit, result: energy, timestamp: new Date().toISOString() });
        }
        UIManager.showToast('Tenaga dikira!', 'success');
    },

    calculateDemand() {
        const pc = this.getNumber('demandPulseCount');
        const pConst = this.getNumber('demandPulseConst');
        const mult = this.getNumber('demandMultiplier') || 1;

        if (!Number.isFinite(pc) || pc < 0) { UIManager.showToast('Pulse Count mesti ≥ 0', 'error'); return; }
        if (!this.isValidPositive(pConst)) { UIManager.showToast('Meter Constant mesti > 0', 'error'); return; }

        const md = (pc * mult * 3600) / (pConst * 1800);
        document.getElementById('demandResult').style.display = 'block';
        document.getElementById('demandResultValue').textContent = this.formatNumber(md) + ' kW';
        this.addToHistory({ type: 'demand', pulseCount: pc, pulseConst: pConst, multiplier: mult, result: md, timestamp: new Date().toISOString() });
        UIManager.showToast('MD dikira!', 'success');
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

    addToHistory(entry) {
        this.history.unshift({ id: Date.now(), ...entry });
        if (this.history.length > 100) this.history.pop();
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

    deleteHistoryItem(id) {
        this.history = this.history.filter(h => h.id !== id);
        this.saveHistory();
        this.renderHistory();
        UIManager.showToast('Rekod dipadam', 'success');
    },

    renderHistory() {
        const container = document.getElementById('historyList');
        const clearButton = document.getElementById('btnClearHistory');
        if (!container) return;

        if (!this.history.length) {
            container.innerHTML = `<div class="empty-state"><span class="empty-icon">📭</span><p>Tiada rekod</p></div>`;
            if (clearButton) clearButton.style.display = 'none';
            return;
        }

        if (clearButton) clearButton.style.display = 'inline-block';
        container.innerHTML = this.history.slice(0, 100).map(h => {
            const date = new Date(h.timestamp);
            const timestamp = `${date.toLocaleDateString('ms-MY')} ${date.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })}`;
            let typeLabel = '', dotClass = '', detail = '', value = '';

            if (h.type === 'calculator') {
                typeLabel = '🔌 ' + (h.mode || 'DIRECT').toUpperCase();
                dotClass = h.mode || 'direct';
                detail = `M=${this.formatNumber(h.totalMultiplier)} | ${h.supply}`;
                value = `${this.formatNumber(h.primaryActive)} imp/kWh`;
            } else if (h.type === 'energy') {
                typeLabel = '🔢 Pulse → Energy';
                dotClass = 'energy';
                detail = `${this.formatNumber(h.pulseCount)} ÷ ${this.formatNumber(h.pulseConst)} × ${this.formatNumber(h.multiplier)}`;
                value = this.formatEnergy(h.result, h.unit || 'kWh');
            } else if (h.type === 'demand') {
                typeLabel = '🕐 MD';
                dotClass = 'demand';
                detail = `${this.formatNumber(h.pulseCount)} pulse / 30min`;
                value = `${this.formatNumber(h.result)} kW`;
            } else {
                return '';
            }

            return `<div class="history-item"><div class="history-left"><div class="history-dot ${dotClass}"></div><div class="history-info"><div class="history-type">${typeLabel}</div><div class="history-detail">${detail}</div></div></div><div class="history-right"><div class="history-value">${value}</div><div class="history-time">${
