/**
 * MeterCalc Pro - Application Initialization
 */

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.getElementById('splash').classList.add('hide');
        document.getElementById('app').style.display = 'block';
    }, 1200);

    UIManager.loadTheme();
    UIManager.loadLanguage();
    Calculator.init();
    UIManager.switchCalcMode('direct');
    UIManager.switchMainTab('calculatorPanel');

    window.addEventListener('popstate', (e) => {
        if (UIManager.currentMainTab !== 'calculatorPanel') {
            e.preventDefault();
            UIManager.switchMainTab('calculatorPanel');
        }
    });

    console.log('✅ MeterCalc Pro v2.1 initialized');
    console.log('   Features: Calculator | Energy | Accuracy | Demand | History | Reference');
    console.log('   Languages: BM/EN | Copy to Clipboard');
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const activeEl = document.activeElement;
        if (activeEl && activeEl.tagName === 'INPUT') {
            const panel = UIManager.currentMainTab;
            if (panel === 'calculatorPanel') { activeEl.blur(); Calculator.calculate(); }
            else if (panel === 'energyPanel') { activeEl.blur(); Calculator.calculateEnergy(); }
            else if (panel === 'accuracyPanel') { activeEl.blur(); Calculator.calculateAccuracy(); }
            else if (panel === 'demandPanel') { activeEl.blur(); Calculator.calculateDemand(); }
        }
    }
});
