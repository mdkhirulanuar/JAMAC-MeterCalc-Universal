// Scan Module - OCR Nameplate Reader

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

    openCamera() {
        document.getElementById('scanCameraInput').click();
    },

    openUpload() {
        document.getElementById('scanUploadInput').click();
    },

    handleFile(file) {
        if (!file) return;
        if (!file.type || !file.type.startsWith('image/')) {
            UIManager.showToast('Sila pilih gambar', 'error');
            return;
        }

        this.file = file;
        this.rawText = '';
        this.detected = null;

        if (this.imageUrl) URL.revokeObjectURL(this.imageUrl);
        this.imageUrl = URL.createObjectURL(file);

        const previewImg = document.getElementById('scanPreviewImg');
        if (previewImg) previewImg.src = this.imageUrl;
        
        document.getElementById('scanPreviewWrap').style.display = 'block';
        document.getElementById('btnRunOCR').disabled = false;
        document.getElementById('scanResult').style.display = 'none';
        document.getElementById('scanApplyWrap').style.display = 'none';
    },

    async runOCR() {
        if (!this.file) {
            UIManager.showToast('Sila pilih gambar dahulu', 'error');
            return;
        }
        if (!window.Tesseract) {
            UIManager.showToast('OCR library loading. Sila tunggu dan cuba lagi.', 'error');
            return;
        }

        const btnRun = document.getElementById('btnRunOCR');
        btnRun.disabled = true;
        btnRun.textContent = '⏳ Reading...';

        try {
            const result = await Tesseract.recognize(this.file, 'eng', {
                logger: msg => {
                    if (msg.progress) {
                        const pct = Math.round(msg.progress * 100);
                        btnRun.textContent = `⏳ Reading... ${pct}%`;
                    }
                }
            });

            this.rawText = result.data.text;
            this.detected = this.extractValues(this.rawText);
            this.renderDetected();

            UIManager.showToast('Nameplate reading complete', 'success');
        } catch (error) {
            console.error('OCR error:', error);
            UIManager.showToast('OCR failed. Try clearer image.', 'error');
        } finally {
            btnRun.disabled = false;
            btnRun.textContent = '🔎 READ NAMEPLATE';
        }
    },

    extractValues(text) {
        const normalized = text.replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
                               .replace(/[×xX]/g, 'x')
                               .toLowerCase();
        
        const detected = {
            constActive: null,
            constReactive: null,
            ctSecondary: null,
            supply: null,
            meterClass: null,
            voltage: null,
            currentRating: null
        };
        
        // Extract active constant
        const activeMatch = normalized.match(/(\d+)\s*imp\s*\/?\s*kwh/);
        if (activeMatch) detected.constActive = activeMatch[1];
        
        // Extract reactive constant
        const reactiveMatch = normalized.match(/(\d+)\s*imp\s*\/?\s*kvarh/);
        if (reactiveMatch) detected.constReactive = reactiveMatch[1];
        
        // Extract supply type
        if (normalized.includes('3-phase 4-wire') || normalized.includes('3p4w')) detected.supply = '3P4W';
        else if (normalized.includes('3-phase 3-wire') || normalized.includes('3p3w')) detected.supply = '3P3W';
        else if (normalized.includes('1-phase 2-wire') || normalized.includes('1p2w')) detected.supply = '1P2W';
        
        // Extract class
        const classMatch = normalized.match(/cl[.:]?\s*(\d+(?:\.\d+)?s?)/);
        if (classMatch) detected.meterClass = classMatch[1].toUpperCase();
        
        // Extract CT secondary from current rating
        const currentMatch = normalized.match(/(\d+)\(\d+\)a/);
        if (currentMatch) detected.ctSecondary = currentMatch[1];
        
        return detected;
    },

    renderDetected() {
        if (!this.detected) return;
        
        const d = this.detected;
        const content = document.getElementById('scanDetectedContent');
        
        let html = `<div class="scan-detected-grid">`;
        html += `<div class="scan-detected-row"><span>Active Constant:</span><strong>${d.constActive || 'Not found'} imp/kWh</strong></div>`;
        html += `<div class="scan-detected-row"><span>Reactive Constant:</span><strong>${d.constReactive || 'Not found'} imp/kvarh</strong></div>`;
        html += `<div class="scan-detected-row"><span>CT Secondary (suggested):</span><strong>${d.ctSecondary ? d.ctSecondary + 'A' : 'Not found'}</strong></div>`;
        html += `<div class="scan-detected-row"><span>Supply Type:</span><strong>${d.supply || 'Not found'}</strong></div>`;
        html += `<div class="scan-detected-row"><span>Meter Class:</span><strong>${d.meterClass || 'Not found'}</strong></div>`;
        html += `</div>`;
        
        content.innerHTML = html;
        document.getElementById('scanResult').style.display = 'block';
        document.getElementById('scanApplyWrap').style.display = 'grid';
    },

    applyDetectedValues() {
        if (!this.detected) return;
        const d = this.detected;
        
        if (d.constActive) document.getElementById('meterConstActive').value = d.constActive;
        if (d.constReactive) document.getElementById('meterConstReactive').value = d.constReactive;
        if (d.supply) document.getElementById('supplyType').value = d.supply;
        if (d.meterClass) {
            const classOptions = ['0.2S', '0.5S', '0.5', '1', '2', '2_reactive', '3_reactive'];
            if (classOptions.includes(d.meterClass)) {
                document.getElementById('meterClass').value = d.meterClass;
            }
        }
        if (d.ctSecondary) {
            document.getElementById('ctSecondary').value = d.ctSecondary;
            UIManager.switchCalcMode('ct');
        }
        
        UIManager.switchMainTab('calculatorPanel');
        UIManager.showToast('Safe values applied to calculator', 'success');
    },

    clearScan() {
        this.file = null;
        this.rawText = '';
        this.detected = null;
        if (this.imageUrl) URL.revokeObjectURL(this.imageUrl);
        this.imageUrl = null;
        
        document.getElementById('scanCameraInput').value = '';
        document.getElementById('scanUploadInput').value = '';
        document.getElementById('scanPreviewWrap').style.display = 'none';
        document.getElementById('scanResult').style.display = 'none';
        document.getElementById('scanApplyWrap').style.display = 'none';
        document.getElementById('btnRunOCR').disabled = true;
        
        UIManager.showToast('Scan cleared', 'success');
    }
};
