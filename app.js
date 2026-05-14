document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.getElementById('splash').classList.add('hide');
        document.getElementById('app').style.display = 'block';
    }, 1000);
    UIManager.loadTheme();
    Calculator.init();
    UIManager.updateEnergyMode();
    UIManager.switchMainTab('calculatorPanel');
    console.log('✅ MeterCalc Pro v3.0 initialized');
});
