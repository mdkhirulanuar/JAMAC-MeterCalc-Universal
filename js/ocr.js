/**
 * OCR Manager v4.0
 * Scans image and extracts meter values
 */
const OCRManager = {
    worker: null,

    async init() {
        if (typeof Tesseract === 'undefined') {
            console.warn('Tesseract not loaded yet');
            return;
        }
        this.worker = await Tesseract.createWorker('eng');
    },

    async scan(imageData, callback) {
        if (!this.worker) {
            // Fallback: basic text extraction using regex
            const results = this.fallbackScan();
            callback(results);
            return;
        }

        try {
            const { data } = await this.worker.recognize(imageData);
            const text = data.text;
            const results = this.parseResults(text);
            callback(results);
        } catch (e) {
            console.error('OCR Error:', e);
            const results = this.fallbackScan();
            callback(results);
        }
    },

    parseResults(text) {
        const results = {};

        // Meter Constant: cari "1000 imp/kWh" atau "500 imp/kvarh"
        const constMatch = text.match(/(\d+)\s*imp\/(kWh|kvarh|kWh|kvarh)/i);
        if (constMatch) results.meterConstant = parseInt(constMatch[1]);

        // CT Ratio: cari "800/5A" atau "CT: 800/5"
        const ctMatch = text.match(/(\d+)\s*\/\s*(\d+)\s*A/i);
        if (ctMatch) {
            results.ctPrimary = parseInt(ctMatch[1]);
            results.ctSecondary = parseInt(ctMatch[2]);
        }

        // VT Ratio: cari "11kV/110V" atau "11000/110"
        const vtMatch = text.match(/(\d+)\s*k?V\s*\/\s*(\d+)\s*V/i);
        if (vtMatch && parseInt(vtMatch[1]) > 1000) {
            results.vtPrimary = parseInt(vtMatch[1]) >= 1000 ? parseInt(vtMatch[1]) : parseInt(vtMatch[1]) * 1000;
            results.vtSecondary = parseInt(vtMatch[2]);
        }

        // Start/End reading: cari nombor decimal 100.0000 dan 101.7400
        const readings = text.match(/(\d+\.\d{4,})\s*[kWh|kvarh]*/g);
        if (readings && readings.length >= 2) {
            results.start = parseFloat(readings[0]);
            results.end = parseFloat(readings[1]);
        }

        // Real Pulse: cari nombor 4-5 digit
        const pulseMatch = text.match(/\b(\d{4,5})\s*pulses?\b/i);
        if (pulseMatch) results.realPulse = parseInt(pulseMatch[1]);

        // Pulse Count: cari nombor 4-5 digit
        const pulseCountMatch = text.match(/\b(\d{4,5})\b/g);
        if (pulseCountMatch && pulseCountMatch.length >= 2) {
            results.pulseCount = parseInt(pulseCountMatch[1]);
        }

        return results;
    },

    fallbackScan() {
        // Return empty — user will fill manually
        return {};
    }
};
