document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.getElementById('splash').classList.add('hide');
        document.getElementById('app').style.display = 'block';
    }, 1200);

    UIManager.loadTheme();
    Calculator.init();
    UIManager.updateModeUI('direct');
    Calculator.updateLiveRatios();

    window.addEventListener('popstate', (e) => {
        if (document.getElementById('resultsPanel').style.display !== 'none') {
            e.preventDefault();
            document.getElementById('inputPanel').scrollIntoView({ behavior: 'smooth' });
        }
    });
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const activeEl = document.activeElement;
        if (activeEl && activeEl.tagName === 'INPUT') {
            activeEl.blur();
            Calculator.calculate();
        }
    }
});
