/**
 * OCR Manager v4.0 - Fixed
 * Scans image and extracts meter values using Tesseract.js
 */
const OCRManager = {
    worker: null,
    ready: false,

    async init() {
        if (typeof Tesseract === 'undefined') {
            console.warn('Tesseract not loaded yet. Will retry when needed.');
            return;
        }
        try {
            this.worker = await Tesseract.createWorker('eng');
            this.ready = true;
            console.log('✅ OCR Worker ready');
        } catch (e) {
            console.error('OCR Init Error:', e);
        }
    },

    async scan(imageData, callback) {
        // Show processing
        document.getElementById('ocrModal').style.display = 'flex';

        if (!this.ready || !this.worker) {
            // Try to init now
            await this.init();
        }

        if (!this.ready || !this.worker) {
            // Fallback: try basic text extraction
            const results = this.parseResults('');
            document.getElementById('ocrModal').style.display = 'none';
            callback(results);
            return;
        }

        try {
            document.getElementById('ocrProgress').textContent = 
                UIManager.currentLang === 'bm' ? 'Membaca teks dari gambar...' : 'Reading text from image...';

            const { data } = await this.worker.recognize(imageData);
            const text = data.text;
            console.log('OCR Text:', text);

            const results = this.parseResults(text);
            console.log('Parsed Results:', results);

            document.getElementById('ocrModal').style.display = 'none';
            callback(results);
        } catch (e) {
            console.error('OCR Scan Error:', e);
            document.getElementById('ocrModal').style.display = 'none';
            callback(this.parseResults(''));
        }
    },

    parseResults(text) {
        const results = {};
        if (!text) return results;

        // Meter Constant: cari pattern "1000 imp/kWh" atau "1000 imp/kvarh"
        const constMatch = text.match(/(\d+)\s*imp\/(kWh|kvarh|kWh|kvarh)/i);
        if (constMatch) {
            results.meterConstant = parseInt(constMatch[1]);
            console.log('Found Meter Constant:', results.meterConstant);
        }

        // CT Ratio: cari "800/5A" atau "CT: 800/5" atau "200/5A"
        const ctMatch = text.match(/(\d{2,4})\s*\/\s*(\d{1,2})\s*A/i);
        if (ctMatch) {
            const primary = parseInt(ctMatch[1]);
            const secondary = parseInt(ctMatch[2]);
            // Validate: CT primary typically 100-2000, secondary 1 or 5
            if (primary >= 50 && primary <= 5000 && (secondary === 1 || secondary === 5)) {
                results.ctPrimary = primary;
                results.ctSecondary = secondary;
                console.log('Found CT Ratio:', primary + '/' + secondary + 'A');
            }
        }

        // VT Ratio: cari "11kV/110V" atau "11000/110V"
        const vtMatch = text.match(/(\d{1,3})\s*kV\s*\/\s*(\d{2,3})\s*V/i);
        if (vtMatch) {
            results.vtPrimary = parseInt(vtMatch[1]) * 1000; // Convert kV to V
            results.vtSecondary = parseInt(vtMatch[2]);
            console.log('Found VT Ratio:', results.vtPrimary + '/' + results.vtSecondary + 'V');
        } else {
            // Try "11000/110" pattern
            const vtMatch2 = text.match(/(\d{4,5})\s*\/\s*(\d{2,3})\s*V/i);
            if (vtMatch2 && parseInt(vtMatch2[1]) > 1000) {
                results.vtPrimary = parseInt(vtMatch2[1]);
                results.vtSecondary = parseInt(vtMatch2[2]);
                console.log('Found VT Ratio (alt):', results.vtPrimary + '/' + results.vtSecondary + 'V');
            }
        }

        // Start/End readings: cari nombor decimal seperti 100.0000, 101.7400
        const allNumbers = text.match(/\d+\.?\d*/g);
        if (allNumbers && allNumbers.length >= 4) {
            const decimals = allNumbers
                .filter(n => n.includes('.') && n.split('.')[1].length >= 4)
                .map(parseFloat);
            if (decimals.length >= 2) {
                results.start = decimals[decimals.length - 2];
                results.end = decimals[decimals.length - 1];
                console.log('Found Readings:', results.start, 'to', results.end);
            }
        }

        // Real Pulse: cari nombor 4-5 digit (biasanya dekat dengan "pulse" atau "pulses")
        const pulseLine = text.match(/(\d{4,5})\s*(pulse|pulses|imp)/gi);
        if (pulseLine) {
            results.realPulse = parseInt(pulseLine[1]);
            console.log('Found Real Pulse:', results.realPulse);
        }

        // Pulse Count: cari nombor 3-5 digit
        const pulseCountMatch = text.match(/\b(\d{3,5})\b/g);
        if (pulseCountMatch && pulseCountMatch.length >= 1) {
            const nums = pulseCountMatch.map(Number).filter(n => n > 100 && n < 50000);
            if (nums.length >= 1) {
                results.pulseCount = nums[0];
                console.log('Found Pulse Count:', results.pulseCount);
            }
        }

        return results;
    }
};
