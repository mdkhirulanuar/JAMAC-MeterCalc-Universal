// App Entry Point - MeterCalc Pro v3.3

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    Calculator.init();
    UIManager.loadTheme();
    SiteManager.init();
    KeyboardShortcuts.init();
    Scanner.init();
    
    // Set default active tab
    UIManager.switchMainTab('calculatorPanel');
    UIManager.updateEnergyMode();
    
    // Hide splash screen after delay
    setTimeout(() => {
        const splash = document.getElementById('splash');
        const app = document.getElementById('app');
        if (splash) splash.classList.add('hide');
        if (app) app.style.display = 'block';
    }, 800);
    
    console.log('✅ MeterCalc Pro v3.3 initialized - SAMM 654 Compliant');
});
