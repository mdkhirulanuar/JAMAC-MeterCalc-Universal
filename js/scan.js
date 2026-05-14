/*
 * MeterCalc Pro - Scan / Upload Nameplate OCR
 * Reads safe values from meter nameplate photo and lets user confirm before applying.
 * OCR engine: Tesseract.js via CDN in index.html. If unavailable, user gets a clear error.
 */

const Scanner = {
    file: null,
    imageUrl: null,
    rawText: '',
    detected: null,

    init() {
        const camera = document.getElementById('scanCameraInput');
        const upload = document.getElementById('scanUploadInput');
        if (camera) camera.addEventListener('change', e => this.handleFile(e.target.files && e.target.files[0]));
        if (upload) upload.addEventListener('change', e => this.handleFile(e.target.files && e.target.files[0]));
    },

    t(key) {
        return UIManager && typeof UIManager.t === 'function' ? UIManager.t(key) : key;
    },

    openCamera() {
        const input = document.getElementById('scanCameraInput');
        if (input) input.click();
    },

    openUpload() {
        const input = document.getElementById('scanUploadInput');
        if (input) input.click();
    },

    handleFile(file) {
        if (!file) return;
        if (!file.type || !file.type.startsWith('image/')) {
            UIManager.showToast(this.t('scanNoImage'), 'error');
            return;
        }

        this.file = file;
        this.rawText = '';
        this.detected = null;

        if (this.imageUrl) URL.revokeObjectURL(this.imageUrl);
        this.imageUrl = URL.createObjectURL(file);

        const previewWrap = document.getElementById('scanPreviewWrap');
        const previewImg = document.getElementById('scanPreviewImg');
        const btnRun = document.getElementById('btnRunOCR');
        const scanResult = document.getElementById('scanResult');
        const scanApplyWrap = document.getElementById('scanApplyWrap');
        const scanWarning = document.getElementById('scanWarning');
        const rawWrap = document.getElementById('scanRawWrap');
        const progress = document.getElementById('scanProgress');

        if (previewImg) previewImg.src = this.imageUrl;
        if (previewWrap) previewWrap.style.display = 'block';
        if (btnRun) btnRun.disabled = false;
        if (scanResult) scanResult.style.display = 'none';
        if (scanApplyWrap) scanApplyWrap.style.display = 'none';
        if (scanWarning) scanWarning.style.display = 'none';
        if (rawWrap) rawWrap.style.display = 'none';
        if (progress) progress.style.display = 'none';
    },

    async runOCR() {
        if (!this.file) {
            UIManager.showToast(this.t('scanNoImage'), 'error');
            return;
        }
        if (!window.Tesseract) {
            UIManager.showToast(this.t('scanOCRError'), 'error');
            return;
        }

        const btnRun = document.getElementById('btnRunOCR');
        const progress = document.getElementById('scanProgress');
        const progressText = document.getElementById('scanProgressText');
        const progressPct = document.getElementById('scanProgressPct');
        const progressFill = document.getElementById('scanProgressFill');

        if (btnRun) btnRun.disabled = true;
        if (progress) progress.style.display = 'block';
        if (progressText) progressText.textContent = this.t('scanOCRLoading');
        if (progressPct) progressPct.textContent = '0%';
        if (progressFill) progressFill.style.width = '0%';

        try {
            const result = await Tesseract.recognize(this.file, 'eng', {
                logger: msg => {
                    if (!msg || typeof msg.progress !== 'number') return;
                    const pct = Math.max(0, Math.min(100, Math.round(msg.progress * 100)));
                    if (progressPct) progressPct.textContent = `${pct}%`;
                    if (progressFill) progressFill.style.width = `${pct}%`;
                    if (progressText && msg.status) progressText.textContent = msg.status;
                }
            });

            this.rawText = (result && result.data && result.data.text) ? result.data.text : '';
            this.detected = this.extractValues(this.rawText);
            this.renderDetected();

            const rawText = document.getElementById('scanRawText');
            const rawWrap = document.getElementById('scanRawWrap');
            if (rawText) rawText.textContent = this.rawText.trim() || '-';
            if (rawWrap) rawWrap.style.display = 'block';

            UIManager.showToast(this.t('scanOCRDone'), 'success');
        } catch (error) {
            console.error('OCR error:', error);
            UIManager.showToast(this.t('scanOCRError'), 'error');
        } finally {
            if (btnRun) btnRun.disabled = false;
        }
    },

    normaliseText(text) {
        return (text || '')
            .replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
            .replace(/[×xX]/g, 'x')
            .replace(/[|]/g, '1')
            .replace(/[ ]+/g, ' ');
    },

    extractValues(text) {
        const raw = this.normaliseText(text);
        const compact = raw.replace(/\s+/g, ' ');
        const noSpace = raw.replace(/\s+/g, '');

        const find = (regex, source = compact) => {
            const m = source.match(regex);
            return m ? (m[1] || m[0]).trim() : '';
        };

        let model = find(/\b([A-Z]{2,}[A-Z0-9-]{2,})\b/);
        if (/^(IEC|LCD|LED|KWH|KVARH|IMP)$/i.test(model)) model = '';

        const currentRating = find(/(\d+(?:\.\d+)?\s*\(\s*\d+(?:\.\d+)?\s*\)\s*A)/i)
            || find(/(\d+(?:\.\d+)?\s*A)/i);

        let ctSecondary = '';
        if (/\b1\s*\(\s*\d+(?:\.\d+)?\s*\)\s*A\b/i.test(compact) || /\b1A\b/i.test(noSpace)) ctSecondary = '1';
        if (/\b5\s*\(\s*\d+(?:\.\d+)?\s*\)\s*A\b/i.test(compact) || /\b5A\b/i.test(noSpace)) ctSecondary = '5';

        const activeConst = find(/(\d{2,7})\s*(?:imp|pulse|pulses)\s*\/?\s*kWh/i, noSpace);
        const reactiveConst = find(/(\d{2,7})\s*(?:imp|pulse|pulses)\s*\/?\s*kvarh/i, noSpace);
        const freq = find(/\b(50|60)\s*Hz\b/i, compact);
        const meterClass = find(/(?:Cl\.?|Class)\s*([0-9]+(?:\.[0-9]+)?S?)/i, compact)
            || find(/\b(0\.2S|0\.5S|0\.5|1|2)\b/i, compact);

        let voltage = find(/(3\s*x\s*[0-9.]+\s*\/\s*[0-9.]+\s*V\s*[-–~to]*\s*3\s*x\s*[0-9.]+\s*\/\s*[0-9.]+\s*V)/i, compact);
        if (!voltage) voltage = find(/(3\s*x\s*[0-9.]+\s*\/\s*[0-9.]+\s*V)/i, compact);
        if (!voltage) voltage = find(/(\d+(?:\.\d+)?\s*\/\s*\d+(?:\.\d+)?\s*V)/i, compact);

        const supply = /three\s*phase\s*four\s*wire|3\s*phase\s*4\s*wire|3P4W/i.test(compact) ? '3P4W'
            : /three\s*phase\s*three\s*wire|3\s*phase\s*3\s*wire|3P3W/i.test(compact) ? '3P3W'
            : /single\s*phase|1P2W/i.test(compact) ? '1P2W' : '';

        const meterType = /CT\s*Energy\s*Meter|CT-operated|CT operated/i.test(compact) ? 'CT Meter'
            : /direct/i.test(compact) ? 'Direct Meter' : '';

        return {
            model,
            meterType,
            supply,
            voltage,
            currentRating: currentRating.replace(/\s+/g, ''),
            ctSecondary,
            activeConst,
            reactiveConst,
            meterClass,
            frequency: freq ? `${freq}Hz` : '',
            ctPrimary: '',
            vtPrimary: '',
            multiplier: ''
        };
    },

    row(labelKey, value, statusKey, statusClass = '') {
        const valueText = value || this.t('scanManualNeeded');
        const safeValue = this.escapeHTML(valueText);
        const cls = statusClass ? ` ${statusClass}` : '';
        return `
            <div class="scan-detected-row">
                <div class="scan-detected-label">${this.t(labelKey)}</div>
                <div class="scan-detected-value">${safeValue}</div>
                <div class="scan-status${cls}">${this.t(statusKey)}</div>
            </div>`;
    },

    renderDetected() {
        if (!this.detected) return;
        const d = this.detected;
        const content = document.getElementById('scanDetectedContent');
        const result = document.getElementById('scanResult');
        const warning = document.getElementById('scanWarning');
        const applyWrap = document.getElementById('scanApplyWrap');

        const html = `
            <div class="scan-detected-grid">
                ${this.row('scanFieldModel', d.model, d.model ? 'scanStatusDetected' : 'scanStatusNotFound', d.model ? '' : 'notfound')}
                ${this.row('scanFieldMeterType', d.meterType, d.meterType ? 'scanStatusDetected' : 'scanStatusNotFound', d.meterType ? '' : 'notfound')}
                ${this.row('scanFieldSupply', d.supply, d.supply ? 'scanStatusDetected' : 'scanStatusNotFound', d.supply ? '' : 'notfound')}
                ${this.row('scanFieldVoltage', d.voltage, d.voltage ? 'scanStatusDetected' : 'scanStatusNotFound', d.voltage ? '' : 'notfound')}
                ${this.row('scanFieldCurrent', d.currentRating, d.currentRating ? 'scanStatusDetected' : 'scanStatusNotFound', d.currentRating ? '' : 'notfound')}
                ${this.row('scanFieldCTSecondary', d.ctSecondary ? `${d.ctSecondary}A` : '', d.ctSecondary ? 'scanStatusSuggested' : 'scanStatusNotFound', d.ctSecondary ? '' : 'notfound')}
                ${this.row('scanFieldActiveConst', d.activeConst ? `${d.activeConst} imp/kWh` : '', d.activeConst ? 'scanStatusDetected' : 'scanStatusNotFound', d.activeConst ? '' : 'notfound')}
                ${this.row('scanFieldReactiveConst', d.reactiveConst ? `${d.reactiveConst} imp/kvarh` : '', d.reactiveConst ? 'scanStatusDetected' : 'scanStatusNotFound', d.reactiveConst ? '' : 'notfound')}
                ${this.row('scanFieldClass', d.meterClass, d.meterClass ? 'scanStatusDetected' : 'scanStatusNotFound', d.meterClass ? '' : 'notfound')}
                ${this.row('scanFieldFrequency', d.frequency, d.frequency ? 'scanStatusDetected' : 'scanStatusNotFound', d.frequency ? '' : 'notfound')}
                ${this.row('scanFieldCTPrimary', '', 'scanStatusManual', 'manual')}
                ${this.row('scanFieldVTPrimary', '', 'scanStatusManual', 'manual')}
                ${this.row('scanFieldMultiplier', '', 'scanStatusManual', 'manual')}
            </div>`;

        if (content) content.innerHTML = html;
        if (result) result.style.display = 'block';
        if (warning) warning.style.display = 'block';
        if (applyWrap) applyWrap.style.display = 'grid';
    },

    applyDetectedValues() {
        if (!this.detected) return;
        const d = this.detected;

        if (d.activeConst) this.setValue('meterConstActive', d.activeConst);
        if (d.reactiveConst) this.setValue('meterConstReactive', d.reactiveConst);
        if (d.ctSecondary) this.setValue('ctSecondary', d.ctSecondary);
        if (d.supply) this.setSelect('supplyType', d.supply);
        if (d.meterClass) this.setSelect('meterClass', d.meterClass);

        if (d.meterType === 'CT Meter' || d.ctSecondary) {
            UIManager.switchCalcMode('ct');
        }
        UIManager.switchMainTab('calculatorPanel');
        UIManager.showToast(this.t('scanApplied'), 'success');
    },

    clearScan() {
        this.file = null;
        this.rawText = '';
        this.detected = null;
        if (this.imageUrl) URL.revokeObjectURL(this.imageUrl);
        this.imageUrl = null;

        ['scanCameraInput', 'scanUploadInput'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        const idsToHide = ['scanPreviewWrap', 'scanProgress', 'scanResult', 'scanWarning', 'scanApplyWrap', 'scanRawWrap'];
        idsToHide.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
        const img = document.getElementById('scanPreviewImg');
        if (img) img.removeAttribute('src');
        const raw = document.getElementById('scanRawText');
        if (raw) raw.textContent = '';
        const btn = document.getElementById('btnRunOCR');
        if (btn) btn.disabled = true;
        UIManager.showToast(this.t('scanCleared'), 'success');
    },

    setValue(id, value) {
        const el = document.getElementById(id);
        if (el) {
            el.value = value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }
    },

    setSelect(id, value) {
        const el = document.getElementById(id);
        if (!el) return;
        const found = Array.from(el.options).some(opt => opt.value === value);
        if (found) {
            el.value = value;
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }
    },

    escapeHTML(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
};

document.addEventListener('DOMContentLoaded', () => Scanner.init());
