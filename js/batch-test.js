// Batch Test Module - Run multiple test points in sequence

const BatchTest = {
    queue: [],
    currentIndex: 0,
    results: [],
    meterInfo: null,
    isRunning: false,

    startFromAccuracy() {
        // Get test points from Accuracy Test module
        if (!AccuracyTest.testPoints || AccuracyTest.testPoints.length === 0) {
            UIManager.showToast('Tiada test points. Sila setup Accuracy Test dulu.', 'error');
            return;
        }

        this.meterInfo = {
            serial: document.getElementById('meterSerial')?.value || 'Unknown',
            constValue: parseFloat(document.getElementById('accConst').value),
            multiplier: parseFloat(document.getElementById('accMultiplier').value) || 1,
            Ib: parseFloat(document.getElementById('accIb').value),
            Imax: parseFloat(document.getElementById('accImax').value)
        };

        this.queue = AccuracyTest.testPoints.map(point => ({
            ...point,
            refEnergy: null,
            dispEnergy: null,
            error: null,
            status: null
        }));

        this.currentIndex = 0;
        this.results = [];
        this.isRunning = true;

        // Switch to batch panel
        UIManager.switchMainTab('batchPanel');
        this.showCurrentTest();
    },

    showCurrentTest() {
        const container = document.getElementById('batchTestContainer');
        if (!container) return;

        const progress = document.getElementById('batchProgress');
        const progressBar = document.getElementById('batchProgressBar');
        const statusDiv = document.getElementById('batchStatus');

        if (progress) progress.style.display = 'block';
        
        const percent = (this.currentIndex / this.queue.length) * 100;
        if (progressBar) progressBar.style.width = `${percent}%`;
        if (statusDiv) statusDiv.textContent = `Test ${this.currentIndex + 1} of ${this.queue.length}`;

        if (this.currentIndex >= this.queue.length) {
            this.showSummary();
            return;
        }

        const test = this.queue[this.currentIndex];
        
        container.innerHTML = `
            <div class="batch-test-card" style="background: var(--bg2); border-radius: 16px; padding: 20px; margin-top: 15px;">
                <h3>Test Point ${this.currentIndex + 1}</h3>
                <div class="test-details" style="margin: 15px 0;">
                    <p><strong>Current:</strong> ${test.currentValue.toFixed(3)} A (${test.currentLabel})</p>
                    <p><strong>Power Factor:</strong> ${test.pf}</p>
                    <p><strong>Limit:</strong> ±${test.limit}%</p>
                    <p><strong>Standard:</strong> ${test.standard || 'MS/IEC 62053'}</p>
                </div>
                <div class="test-inputs" style="display: flex; gap: 15px; margin: 15px 0;">
                    <div style="flex: 1;">
                        <label>Reference Energy (kWh/kvarh):</label>
                        <input type="number" id="batchRefEnergy" class="input-field" step="any" placeholder="e.g., 1.0000">
                    </div>
                    <div style="flex: 1;">
                        <label>Display Energy (kWh/kvarh):</label>
                        <input type="number" id="batchDispEnergy" class="input-field" step="any" placeholder="e.g., 0.9985">
                    </div>
                </div>
                <div class="batch-actions" style="display: flex; gap: 10px; margin-top: 20px;">
                    <button class="btn-calculate" onclick="BatchTest.submitCurrent()" style="flex: 2;">✓ Next Test</button>
                    <button class="btn-secondary" onclick="BatchTest.skipCurrent()">Skip</button>
                    <button class="btn-secondary" onclick="BatchTest.cancelBatch()">Cancel</button>
                </div>
            </div>
        `;

        // Auto-focus on reference input
        setTimeout(() => {
            const refInput = document.getElementById('batchRefEnergy');
            if (refInput) refInput.focus();
        }, 100);
    },

    submitCurrent() {
        const refEnergy = parseFloat(document.getElementById('batchRefEnergy').value);
        const dispEnergy = parseFloat(document.getElementById('batchDispEnergy').value);

        if (isNaN(refEnergy) || isNaN(dispEnergy)) {
            UIManager.showToast('Sila masukkan kedua-dua nilai Reference dan Display', 'error');
            return;
        }

        const test = this.queue[this.currentIndex];
        const error = ((dispEnergy - refEnergy) / refEnergy) * 100;
        const status = Math.abs(error) <= test.limit;

        this.results.push({
            ...test,
            refEnergy,
            dispEnergy,
            error,
            status: status ? 'PASS' : 'FAIL'
        });

        this.currentIndex++;
        this.showCurrentTest();
    },

    skipCurrent() {
        this.results.push({
            ...this.queue[this.currentIndex],
            refEnergy: null,
            dispEnergy: null,
            error: null,
            status: 'SKIPPED'
        });
        this.currentIndex++;
        this.showCurrentTest();
    },

    cancelBatch() {
        this.isRunning = false;
        this.queue = [];
        this.results = [];
        UIManager.switchMainTab('accuracyPanel');
        UIManager.showToast('Batch test cancelled', 'success');
    },

    showSummary() {
        const container = document.getElementById('batchTestContainer');
        const summaryDiv = document.getElementById('batchSummary');
        const progress = document.getElementById('batchProgress');

        if (progress) progress.style.display = 'none';

        const totalTests = this.results.length;
        const passedTests = this.results.filter(r => r.status === 'PASS').length;
        const failedTests = this.results.filter(r => r.status === 'FAIL').length;
        const skippedTests = this.results.filter(r => r.status === 'SKIPPED').length;
        const allPassed = failedTests === 0;

        let tableHtml = `
            <div class="hero-result">
                <div class="hero-label">BATCH TEST COMPLETE</div>
                <div class="hero-value" style="font-size: 1.8rem;">${passedTests}/${totalTests} PASS</div>
                <div class="hero-sub">Failed: ${failedTests} | Skipped: ${skippedTests}</div>
            </div>
            <div class="formula-box" style="margin-bottom: 20px;">
                <div class="formula-title">Overall Verdict</div>
                <div class="formula-content">
                    <strong style="color: ${allPassed ? 'var(--green)' : 'var(--red)'}">
                        ${allPassed ? '✅ METER PASSES ALL TESTS' : '❌ METER FAILS SOME TESTS'}
                    </strong>
                </div>
            </div>
            <table class="ref-table" style="width:100%">
                <thead><tr><th>Current (A)</th><th>PF</th><th>Reference</th><th>Display</th><th>Error</th><th>Limit</th><th>Status</th></tr></thead>
                <tbody>
        `;

        for (const r of this.results) {
            const errorDisplay = r.error !== null ? `${r.error.toFixed(4)}%` : '-';
            const statusColor = r.status === 'PASS' ? 'var(--green)' : (r.status === 'FAIL' ? 'var(--red)' : 'var(--orange)');
            tableHtml += `<tr>
                <td>${r.currentValue?.toFixed(3) || '-'}</td>
                <td>${r.pf || '-'}</td>
                <td>${r.refEnergy?.toFixed(6) || '-'}</td>
                <td>${r.dispEnergy?.toFixed(6) || '-'}</td>
                <td style="color: ${statusColor}">${errorDisplay}</td>
                <td>±${r.limit || '-'}%</td>
                <td style="color: ${statusColor}">${r.status}</td>
            </tr>`;
        }

        tableHtml += `</tbody></table>`;

        if (container) container.innerHTML = tableHtml;
        
        if (summaryDiv) {
            summaryDiv.style.display = 'block';
            summaryDiv.innerHTML = `
                <div class="action-buttons" style="display: flex; gap: 10px; margin-top: 20px;">
                    <button class="btn-calculate" onclick="PDFReport.generateBatchReport()">📄 Export PDF Report</button>
                    <button class="btn-secondary" onclick="BatchTest.saveToHistory()">💾 Save to History</button>
                    <button class="btn-secondary" onclick="BatchTest.startNewBatch()">🔄 Start New Batch</button>
                </div>
            `;
        }

        // Save to history
        Calculator.addToHistory({
            type: 'batch_test',
            totalTests,
            passedTests,
            failedTests,
            skippedTests,
            allPassed,
            results: this.results,
            meterInfo: this.meterInfo,
            timestamp: new Date().toISOString()
        });

        this.isRunning = false;
    },

    saveToHistory() {
        UIManager.showToast('Batch test results saved to history', 'success');
        Calculator.renderHistory();
    },

    startNewBatch() {
        this.queue = [];
        this.results = [];
        this.currentIndex = 0;
        UIManager.switchMainTab('accuracyPanel');
        UIManager.showToast('Ready for new batch test', 'success');
    }
};
