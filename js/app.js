/**
 * MeterCalc Pro - Application Initialization
 * Initializes all modules and handles global events
 */

document.addEventListener('DOMContentLoaded', () => {
    // Hide splash screen after loading
    setTimeout(() => {
        document.getElementById('splash').classList.add('hide');
        document.getElementById('app').style.display = 'block';
    }, 1200);

    // Initialize all modules
    Calculator.init();
    UIManager.init();

    // Handle browser back button
    window.addEventListener('popstate', (e) => {
        if (UIManager.currentMainTab !== 'calculatorPanel') {
            e.preventDefault();
            UIManager.switchMainTab('calculatorPanel');
        }
    });

    console.log('✅ MeterCalc Pro v2.1 initialized');
    console.log('   Features: Calculator | Energy | Accuracy | Demand | History | Reference');
    console.log('   Languages: 🇲🇾 BM | 🇬🇧 EN');
    console.log('   Copy: 📋 One-tap clipboard');
});

// Global keyboard shortcut: Enter to calculate
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const activeEl = document.activeElement;
        if (activeEl && activeEl.tagName === 'INPUT') {
            const panel = UIManager.currentMainTab;
            
            switch (panel) {
                case 'calculatorPanel':
                    activeEl.blur();
                    Calculator.calculate();
                    break;
                case 'energyPanel':
                    activeEl.blur();
                    Calculator.calculateEnergy();
                    break;
                case 'accuracyPanel':
                    activeEl.blur();
                    Calculator.calculateAccuracy();
                    break;
                case 'demandPanel':
                    activeEl.blur();
                    Calculator.calculateDemand();
                    break;
            }
        }
    }
});

// Handle service worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('✅ Service Worker registered:', registration.scope);
            })
            .catch(error => {
                console.log('❌ Service Worker registration failed:', error);
            });
    });
}

// Handle app install prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    console.log('📱 App can be installed');
});

// Handle app installed
window.addEventListener('appinstalled', () => {
    console.log('✅ App installed successfully');
    deferredPrompt = null;
});

// Handle network status changes
window.addEventListener('online', () => {
    console.log('🌐 Online');
});

window.addEventListener('offline', () => {
    console.log('📴 Offline - Using cached version');
});

// Handle visibility change (when app goes to background/foreground)
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        // Refresh history when app comes back to foreground
        if (UIManager.currentMainTab === 'historyPanel') {
            Calculator.renderHistory();
        }
    }
});

// Prevent double-tap zoom on buttons
document.addEventListener('dblclick', (e) => {
    if (e.target.closest('button')) {
        e.preventDefault();
    }
}, { passive: false });

// Handle orientation change
window.addEventListener('orientationchange', () => {
    // Recalculate any visible results after orientation change
    setTimeout(() => {
        const activePanel = document.getElementById(UIManager.currentMainTab);
        if (activePanel) {
            activePanel.scrollIntoView({ behavior: 'smooth' });
        }
    }, 300);
});
