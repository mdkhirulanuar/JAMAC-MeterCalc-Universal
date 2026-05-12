/**
 * MeterCalc Pro v4.0 - App Initialization
 */
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.getElementById('splash').classList.add('hide');
        document.getElementById('app').style.display = 'block';
    }, 1000);

    UIManager.loadTheme();
    UIManager.refreshLanguage();
    Calculator.init();
    SnapManager.init();
    UIManager.switchMainTab('calculatorPanel');

    // Load Tesseract from CDN (async, non-blocking)
    if (typeof Tesseract === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
        script.onload = () => {
            console.log('✅ Tesseract OCR loaded');
            OCRManager.init();
        };
        document.head.appendChild(script);
    } else {
        OCRManager.init();
    }

    console.log('✅ MeterCalc Pro v4.0 initialized');
});
