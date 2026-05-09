/**
 * MeterCalc Pro - Core Calculation Engine
 * Features: Direct, CT, CT+VT, Energy, Accuracy (1P2W & 3P4W), Demand
 * Improved: Input validation, 3-phase accuracy support
 */

const Calculator = {
    currentMode: 'direct',
    currentEnergyMode: 'pulse-to-energy',
    history: [],

    init() {
        this.loadHistory();
        this.renderHistory();
        this.attachLiveListeners();
        this.attachInputValidators();
    },

    // ============ INPUT VALIDATORS ============
    attachInputValidators() {
        // All number inputs - prevent negative values
        const numberInputs = document.querySelectorAll('input[type="number"]');
        numberInputs.forEach(input => {
            input.addEventListener('input', () => {
                this.validateNumberInput(input);
            });
            input.addEventListener('blur', () => {
                this.validateNumberInput(input);
            });
        });
    },

    validateNumberInput(input) {
        let val = input.value.trim();

        // Remove any non-numeric characters except decimal point and minus
        // But we'll handle minus separately

        if (val === '' || val === '-') {
            return; // Allow empty
        }

        let num = parseFloat(val);

        // Check if it's a valid number
        if (isNaN(num)) {
            input.value = '';
            return;
        }

        // Prevent negative values
        if (num < 0) {
            num = Math.abs(num);
            input.value = num;
            UIManager.showToast('⚠️ Nilai negatif ditukar ke positif', 'error');
        }

        // Prevent zero for required fields
        if (num === 0 && input.hasAttribute('data-required')) {
            input.value = '';
            UIManager.showToast('⚠️ Nilai tidak boleh 0', 'error');
        }
    },

    // ============ GET INPUT VALUES ============
    getInputValues() {
        return {
            mode: this.currentMode,
            meterConstActive: this.getValidNumber('meterConstActive', true),
            meterConstReactive: this.getValidNumber('meterConstReactive', false),
            supply: document.getElementById('supplyType').value,
            meterClass: document.getElementById('meterClass').value,
            ctPrimary: this.getValidNumber('ctPrimary', false),
            ctSecondary: this.getValidNumber('ctSecondary', false),
            vtPrimary: this.getValidNumber('vtPrimary', false),
            vtSecondary: this.getValidNumber('vtSecondary', false)
        };
    },

    getValidNumber(id, required) {
        const el = document.getElementById(id);
        if (!el) return null;
        const val = parseFloat(el.value);
        if (isNaN(val) || val < 0) return required ? 0 : null;
        if (required && val <= 0) return 0;
        return val;
    },

    // ============ MAIN CALCULATOR ============
    calculate() {
        const inputs = this.getInputValues();

        // Validate meter constant
        if (!inputs.meterConstActive || inputs.meterConstActive <= 0) {
            UIManager.showToast('❌ Sila masukkan Meter Constant Active!', 'error');
            document.getElementById('meterConstActive').focus();
            document.getElementById('meterConstActive').style.borderColor = 'var(--red)';
            setTimeout(() => {
                document.getElementById('meterConstActive').style.borderColor = '';
            }, 2000);
            return;
        }

        // Calculate ratios
        let ctRatio = 1;
        let vtRatio = 1;

        if (this.currentMode === 'ct' || this.currentMode === 'ctvt') {
            const ctPrimary = inputs.ctPrimary;
            const ctSecondary = inputs.ctSecondary;

            if (!ctPrimary || ctPrimary <= 0) {
                UIManager.showToast('❌ Sila masukkan CT Primary!', 'error');
                document.getElementById('ctPrimary').focus();
                return;
            }
            if (!ctSecondary || ctSecondary <= 0) {
                UIManager.showToast('❌ Sila masukkan CT Secondary!', 'error');
                document.getElementById('ctSecondary').focus();
                return;
            }
            if (ctSecondary > ctPrimary) {
                UIManager.showToast('⚠️ CT Secondary > Primary? Nilai mungkin terbalik!', 'error');
            }
            ctRatio = ctPrimary / ctSecondary;
        }

        if (this.currentMode === 'ctvt') {
            const vtPrimary = inputs.vtPrimary;
            const vtSecondary = inputs.vtSecondary;

            if (!vtPrimary || vtPrimary <= 0) {
                UIManager.showToast('❌ Sila masukkan VT Primary!', 'error');
                document.getElementById('vtPrimary').focus();
                return;
            }
            if (!vtSecondary || vtSecondary <= 0) {
                UIManager.showToast('❌ Sila masukkan VT Secondary!', 'error');
                document.getElementById('vtSecondary').focus();
                return;
            }
            if (vtSecondary > vtPrimary) {
                UIManager.showToast('⚠️ VT Secondary > Primary? Nilai mungkin terbalik!', 'error');
            }
            vtRatio = vtPrimary / vtSecondary;
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
        UIManager.showToast('✅ Pengiraan selesai!', 'success');
        if (navigator.vibrate) navigator.vibrate([10, 20, 10]);
    },

    // ============ DISPLAY CALCULATOR RESULTS ============
    displayCalcResults(result) {
        const panel = document.getElementById('calcResultsPanel');
        const body = document.getElementById('calcResultsBody');
        panel.style.display = 'block';
        panel.style.animation = 'none';
        panel.offsetHeight;
        panel.style.animation = 'fadeInUp 0.3s ease-out';

        const modeLabels = { direct: 'DIRECT • Tiada CT/VT', ct: 'CT Sahaja', ctvt: 'CT + VT (High Voltage)' };

        let html = `
            <div class="hero-result">
                <div class="hero-label">TOTAL MULTIPLIER</div>
                <div class="hero-value">${this.formatNumber(result.totalMultiplier)}</div>
                <div class="hero-sub">${modeLabels[result.mode]} • ${result.supply} • Cl.${result.meterClass}</div>
            </div>

            <div class="result-grid-2" id="ratioGrid">`;

        if (result.mode === 'ct' || result.mode === 'ctvt') {
            html += `
                <div class="result-card">
                    <div class="result-card-label">CT Ratio</div>
                    <div class="result-card-value">${this.formatNumber(result.ctRatio)} : 1</div>
                </div>`;
        }

        if (result.mode === 'ctvt') {
            html += `
                <div class="result-card">
                    <div class="result-card-label">VT Ratio</div>
                    <div class="result-card-value">${this.formatNumber(result.vtRatio)} : 1</div>
                </div>`;
        }

        html += `</div>

            <div class="section-divider">
                <div class="divider-line"></div>
                <span class="divider-text">PULSE CONSTANTS</span>
                <div class="divider-line"></div>
            </div>

            <div class="result-grid-2">
                <div class="result-card pulse-card">
                    <div class="result-card-label">Primary Active</div>
                    <div class="result-card-value">${result.primaryActive < 0.001 ? result.primaryActive.toExponential(4) : this.formatNumber(result.primaryActive)}</div>
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
                    <div class="result-card-value">${result.primaryReactive < 0.001 ? result.primaryReactive.toExponential(4) : this.formatNumber(result.primaryReactive)}</div>
                    <div class="result-card-unit">imp/kvarh</div>
                </div>
                <div class="result-card pulse-card">
                    <div class="result-card-label">Secondary Reactive</div>
                    <div class="result-card-value">${this.formatNumber(result.secondaryReactive)}</div>
                    <div class="result-card-unit">imp/kvarh</div>
                </div>
            </div>`;
        }

        html += `
            <div class="formula-box">
                <div class="formula-title">📐 Formula Digunakan</div>
                <div class="formula-content">${this.getFormulaText(result)}</div>
            </div>

            <div class="action-buttons">
                <button class="btn-action btn-share" onclick="UIManager.shareCalculatorResult()">📤 Kongsi</button>
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

    // ============ ENERGY REGISTRATION CALCULATOR ============
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
            UIManager.showToast('❌ Sila masukkan jumlah pulse!', 'error');
            return;
        }
        if (pulseCount < 0) {
            UIManager.showToast('⚠️ Nilai negatif tidak dibenarkan!', 'error');
            return;
        }
        if (!pulseConst || pulseConst <= 0) {
            UIManager.showToast('❌ Sila masukkan pulse constant!', 'error');
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

        UIManager.showToast('✅ Tenaga dikira!', 'success');
    },

    calculateEnergyToPulse() {
        const energy = parseFloat(document.getElementById('energyTarget').value);
        const pulseConst = parseFloat(document.getElementById('energyPulseConst2').value);
        const multiplier = parseFloat(document.getElementById('energyMultiplier2').value) || 1;

        if (!energy || energy <= 0) {
            UIManager.showToast('❌ Sila masukkan tenaga!', 'error');
            return;
        }
        if (!pulseConst || pulseConst <= 0) {
            UIManager.showToast('❌ Sila masukkan pulse constant!', 'error');
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

        UIManager.showToast('✅ Pulse dikira!', 'success');
    },

    // ============ ACCURACY CALCULATOR (IMPROVED: 1P2W & 3P4W) ============
    calculateAccuracy() {
        const reference = parseFloat(document.getElementById('accReference').value);
        const meterReading = parseFloat(document.getElementById('accMeterReading').value);
        const meterClass = document.getElementById('accMeterClass').value;
        const accSupply = document.getElementById('accSupplyType').value; // NEW: 1P2W or 3P4W

        if (!reference || reference <= 0) {
            UIManager.showToast('❌ Sila masukkan tenaga rujukan!', 'error');
            return;
        }
        if (!meterReading || meterReading <= 0) {
            UIManager.showToast('❌ Sila masukkan tenaga meter!', 'error');
            return;
        }

        // Calculate error percentage
        let errorPercent;
        
        if (accSupply === '3P4W') {
            // For 3-phase 4-wire: use per-phase calculation
            // Error = ((Meter Total - Reference Total) / Reference Total) × 100
            errorPercent = ((meterReading - reference) / reference) * 100;
        } else {
            // For 1-phase 2-wire: direct comparison
            errorPercent = ((meterReading - reference) / reference) * 100;
        }

        const absError = Math.abs(errorPercent);

        // Class limits
        const limits = {
            '0.2S': 0.2,
            '0.5S': 0.5,
            '0.5': 0.5,
            '1': 1,
            '2': 2
        };

        const limit = limits[meterClass] || 1;
        const passed = absError <= limit;

        // Display result
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

        // Add note about typical 3-phase calculation
        const noteEl = document.getElementById('accuracyNote');
        if (noteEl) {
            if (accSupply === '3P4W') {
                noteEl.innerHTML = `
                    <small style="color: var(--text2);">
                        📐 Formula 3P4W: Error = ((MUT - Ref) ÷ Ref) × 100<br>
                        💡 Untuk ujian per-fasa: nilai perlu dibahagi 3 terlebih dahulu
                    </small>`;
            } else {
                noteEl.innerHTML = `
                    <small style="color: var(--text2);">
                        📐 Formula 1P2W: Error = ((MUT - Ref) ÷ Ref) × 100
                    </small>`;
            }
        }

        this.addToHistory({
            type: 'accuracy',
            reference,
            meterReading,
            meterClass,
            accSupply,
            errorPercent,
            passed,
            timestamp: new Date().toISOString()
        });

        UIManager.showToast(passed ? '✅ Meter LULUS!' : '❌ Meter GAGAL!', passed ? 'success' : 'error');
    },

    // ============ DEMAND CALCULATOR ============
    calculateDemand() {
        const pulseCount = parseFloat(document.getElementById('demandPulseCount').value);
        const pulseConst = parseFloat(document.getElementById('demandPulseConst').value);
        const multiplier = parseFloat(document.getElementById('demandMultiplier').value) || 1;

        if (!pulseCount || pulseCount <= 0) {
            UIManager.showToast('❌ Sila masukkan jumlah pulse!', 'error');
            return;
        }
        if (!pulseConst || pulseConst <= 0) {
            UIManager.showToast('❌ Sila masukkan pulse constant!', 'error');
            return;
        }

        // MD = (Pulse × M × 3600) / (Constant × 1800)
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

        UIManager.showToast('✅ Maximum Demand dikira!', 'success');
    },

    // ============ LIVE RATIO UPDATES ============
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
                const ratio = ctPrimary / ctSecondary;
                ctValue.textContent = ratio.toFixed(2) + ' : 1';
                // Warning if CT ratio seems wrong
                if (ratio < 1) {
                    ctValue.style.color = 'var(--red)';
                } else {
                    ctValue.style.color = 'var(--accent)';
                }
            } else {
                ctValue.textContent = 'Masukkan nilai';
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
                const ratio = vtPrimary / vtSecondary;
                vtValue.textContent = ratio.toFixed(2) + ' : 1';
                if (ratio < 1) {
                    vtValue.style.color = 'var(--red)';
                } else {
                    vtValue.style.color = 'var(--accent)';
                }
            } else {
                vtValue.textContent = 'Masukkan nilai';
                vtValue.style.color = 'var(--text3)';
            }
        } else {
            vtDisplay.style.display = 'none';
        }
    },

    // ============ HISTORY MANAGEMENT ============
    addToHistory(entry) {
        this.history.unshift({
            id: Date.now(),
            ...entry
        });
        if (this.history.length > 50) this.history.pop();
        this.saveHistory();
        this.renderHistory();
    },

    saveHistory() {
        try {
            localStorage.setItem('metercalc_pro_history', JSON.stringify(this.history));
        } catch (e) {}
    },

    loadHistory() {
        try {
            const saved = localStorage.getItem('metercalc_pro_history');
            if (saved) this.history = JSON.parse(saved);
        } catch (e) {
            this.history = [];
        }
    },

    renderHistory() {
        const container = document.getElementById('historyList');
        const btnClear = document.getElementById('btnClearHistory');

        if (this.history.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">📭</span>
                    <p>Tiada rekod pengiraan</p>
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
                value = h.mode === 'pulse-to-energy' 
                    ? this.formatNumber(h.result) + ' kWh'
                    : this.formatNumber(h.result) + ' pulses';
            } else if (h.type === 'accuracy') {
                typeLabel = '📊 ACCURACY';
                dotClass = 'accuracy';
                detail = `Ref: ${this.formatNumber(h.reference)} | MUT: ${this.formatNumber(h.meterReading)} | Cl.${h.meterClass} | ${h.accSupply || '1P2W'}`;
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

    // ============ UTILS ============
    formatNumber(num) {
        if (num === undefined || num === null) return '-';
        if (Number.isInteger(num)) return num.toLocaleString('ms-MY');
        return parseFloat(num.toFixed(6)).toString();
    }
};
