// Accuracy Test Module - SAMM 654 Compliant
// Supports MS 62053-11, 62053-21, 62053-22, 62053-23

const AccuracyTest = {
    testPoints: [],
    results: [],

    // Class limits based on MS 62053 standards
    classLimits: {
        // MS 62053-22 (Static High Accuracy - Transformer Operated)
        '0.2S': {
            standard: 'MS/IEC 62053-22:2009',
            points: [
                { currentMin: 0.01, currentMax: 0.05, unit: 'In', pf: 1, limit: 0.4, currentLabel: '0.01In - 0.05In' },
                { currentMin: 0.05, currentMax: 'Imax', unit: 'In', pf: 1, limit: 0.2, currentLabel: '0.05In - Imax' },
                { currentMin: 0.02, currentMax: 0.1, unit: 'In', pf: '0.5L', limit: 0.5, currentLabel: '0.02In - 0.1In' },
                { currentMin: 0.1, currentMax: 'Imax', unit: 'In', pf: '0.5L', limit: 0.3, currentLabel: '0.1In - Imax' },
                { currentMin: 0.02, currentMax: 0.1, unit: 'In', pf: '0.8C', limit: 0.5, currentLabel: '0.02In - 0.1In' },
                { currentMin: 0.1, currentMax: 'Imax', unit: 'In', pf: '0.8C', limit: 0.3, currentLabel: '0.1In - Imax' }
            ]
        },
        '0.5S': {
            standard: 'MS/IEC 62053-22:2009',
            points: [
                { currentMin: 0.01, currentMax: 0.05, unit: 'In', pf: 1, limit: 1.0, currentLabel: '0.01In - 0.05In' },
                { currentMin: 0.05, currentMax: 'Imax', unit: 'In', pf: 1, limit: 0.5, currentLabel: '0.05In - Imax' },
                { currentMin: 0.02, currentMax: 0.1, unit: 'In', pf: '0.5L', limit: 1.0, currentLabel: '0.02In - 0.1In' },
                { currentMin: 0.1, currentMax: 'Imax', unit: 'In', pf: '0.5L', limit: 0.6, currentLabel: '0.1In - Imax' },
                { currentMin: 0.02, currentMax: 0.1, unit: 'In', pf: '0.8C', limit: 1.0, currentLabel: '0.02In - 0.1In' },
                { currentMin: 0.1, currentMax: 'Imax', unit: 'In', pf: '0.8C', limit: 0.6, currentLabel: '0.1In - Imax' }
            ]
        },
        // MS 62053-21 (Static Classes 1 & 2)
        '1': {
            standard: 'MS/IEC 62053-21:2009',
            points: [
                { currentMin: 0.05, currentMax: 0.1, unit: 'Ib', pf: 1, limit: 1.5, currentLabel: '0.05Ib - 0.1Ib' },
                { currentMin: 0.1, currentMax: 'Imax', unit: 'Ib', pf: 1, limit: 1.0, currentLabel: '0.1Ib - Imax' },
                { currentMin: 0.1, currentMax: 0.2, unit: 'Ib', pf: '0.5L', limit: 1.5, currentLabel: '0.1Ib - 0.2Ib' },
                { currentMin: 0.2, currentMax: 'Imax', unit: 'Ib', pf: '0.5L', limit: 1.0, currentLabel: '0.2Ib - Imax' },
                { currentMin: 0.1, currentMax: 0.2, unit: 'Ib', pf: '0.8C', limit: 1.5, currentLabel: '0.1Ib - 0.2Ib' },
                { currentMin: 0.2, currentMax: 'Imax', unit: 'Ib', pf: '0.8C', limit: 1.0, currentLabel: '0.2Ib - Imax' }
            ]
        },
        '2': {
            standard: 'MS/IEC 62053-21:2009',
            points: [
                { currentMin: 0.05, currentMax: 0.1, unit: 'Ib', pf: 1, limit: 2.5, currentLabel: '0.05Ib - 0.1Ib' },
                { currentMin: 0.1, currentMax: 'Imax', unit: 'Ib', pf: 1, limit: 2.0, currentLabel: '0.1Ib - Imax' },
                { currentMin: 0.1, currentMax: 0.2, unit: 'Ib', pf: '0.5L', limit: 2.5, currentLabel: '0.1Ib - 0.2Ib' },
                { currentMin: 0.2, currentMax: 'Imax', unit: 'Ib', pf: '0.5L', limit: 2.0, currentLabel: '0.2Ib - Imax' }
            ]
        },
        // MS 62053-23 (Reactive Classes 2 & 3)
        '2_reactive': {
            standard: 'MS/IEC 62053-23:2009',
            points: [
                { currentMin: 0.05, currentMax: 0.1, unit: 'Ib', sinPhi: 1, limit: 2.5, currentLabel: '0.05Ib - 0.1Ib' },
                { currentMin: 0.1, currentMax: 'Imax', unit: 'Ib', sinPhi: 1, limit: 2.0, currentLabel: '0.1Ib - Imax' },
                { currentMin: 0.1, currentMax: 0.2, unit: 'Ib', sinPhi: 0.5, limit: 2.5, currentLabel: '0.1Ib - 0.2Ib' },
                { currentMin: 0.2, currentMax: 'Imax', unit: 'Ib', sinPhi: 0.5, limit: 2.0, currentLabel: '0.2Ib - Imax' }
            ]
        },
        '3_reactive': {
            standard: 'MS/IEC 62053-23:2009',
            points: [
                { currentMin: 0.05, currentMax: 0.1, unit: 'Ib', sinPhi: 1, limit: 4.0, currentLabel: '0.05Ib - 0.1Ib' },
                { currentMin: 0.1, currentMax: 'Imax', unit: 'Ib', sinPhi: 1, limit: 3.0, currentLabel: '0.1Ib - Imax' },
                { currentMin: 0.1, currentMax: 0.2, unit: 'Ib', sinPhi: 0.5, limit: 4.0, currentLabel: '0.1Ib - 0.2Ib' },
                { currentMin: 0.2, currentMax: 'Imax', unit: 'Ib', sinPhi: 0.5, limit: 3.0, currentLabel: '0.2Ib - Imax' }
            ]
        }
    },

    updateTestPoints() {
        const standard = document.getElementById('accStandard').value;
        const meterClass = document.getElementById('accClass').value;
        const Ib = parseFloat(document.getElementById('accIb').value);
        const Imax = parseFloat(document.getElementById('accImax').value);

        if (isNaN(Ib) || Ib <= 0) {
            UIManager.showToast('Sila masukkan Basic/Rated Current yang sah', 'error');
            return;
        }

        // Find appropriate limit set
        let limitSet = null;
        if (standard === '62053-22') {
            limitSet = this.classLimits[meterClass === '0.2S' ? '0.2S' : '0.5S'];
        } else if (standard === '62053-21') {
            limitSet = this.classLimits[meterClass];
        } else if (standard === '62053-23') {
            limitSet = this.classLimits[meterClass];
        } else if (standard === '62053-11') {
            // Electromechanical - similar to Class 1 & 2
            limitSet = this.classLimits[meterClass === '1' ? '1' : '2'];
        }

        if (!limitSet) {
            limitSet = this.classLimits['1'];
        }

        // Generate test points based on limits
        this.testPoints = [];
        for (const point of limitSet.points) {
            let currentValue;
            if (point.currentMax === 'Imax') {
                currentValue = Imax;
            } else {
                currentValue = point.currentMin * Ib;
            }
            
            this.testPoints.push({
                currentValue: currentValue,
                currentLabel: point.currentLabel,
                pf: point.pf || point.sinPhi || 1,
                limit: point.limit,
                standard: limitSet.standard,
                refEnergy: null,
                dispEnergy: null,
                error: null,
                status: null
            });
        }

        this.renderTestPoints();
    },

    renderTestPoints() {
        const container = document.getElementById('testPointsList');
        if (!container) return;

        if (this.testPoints.length === 0) {
            container.innerHTML = '<p>Tiada test points. Sila pilih standard dan class.</p>';
            return;
        }

        let html = `<div class="test-point-header test-point-row">
            <span>Current (A)</span><span>PF/sinφ</span><span>Limit (%)</span><span>Reference</span><span>Display</span><span>Error</span><span>Status</span>
        </div>`;

        this.testPoints.forEach((point, index) => {
            html += `
                <div class="test-point-row" data-index="${index}">
                    <input type="number" id="tp_current_${index}" value="${point.currentValue.toFixed(3)}" step="any" style="width:70px">
                    <span>${point.pf}</span>
                    <span>±${point.limit}%</span>
                    <input type="number" id="tp_ref_${index}" placeholder="Reference" step="any" style="width:90px">
                    <input type="number" id="tp_disp_${index}" placeholder="Display" step="any" style="width:90px">
                    <span id="tp_error_${index}">-</span>
                    <span id="tp_status_${index}">-</span>
                </div>
            `;
        });

        container.innerHTML = html;
    },

    calculateAll() {
        const constValue = parseFloat(document.getElementById('accConst').value);
        const multiplier = parseFloat(document.getElementById('accMultiplier').value) || 1;

        if (isNaN(constValue) || constValue <= 0) {
            UIManager.showToast('Meter Constant mesti > 0', 'error');
            return;
        }

        this.results = [];
        let allPassed = true;

        for (let i = 0; i < this.testPoints.length; i++) {
            const point = this.testPoints[i];
            const refEnergy = parseFloat(document.getElementById(`tp_ref_${i}`).value);
            const dispEnergy = parseFloat(document.getElementById(`tp_disp_${i}`).value);
            
            if (isNaN(refEnergy) || isNaN(dispEnergy)) {
                document.getElementById(`tp_error_${i}`).textContent = 'N/A';
                document.getElementById(`tp_status_${i}`).textContent = '⏳';
                continue;
            }

            const error = ((dispEnergy - refEnergy) / refEnergy) * 100;
            const status = Math.abs(error) <= point.limit;
            if (!status) allPassed = false;

            document.getElementById(`tp_error_${i}`).textContent = error.toFixed(4) + '%';
            document.getElementById(`tp_status_${i}`).innerHTML = status ? '✅ PASS' : '❌ FAIL';
            document.getElementById(`tp_status_${i}`).style.color = status ? 'var(--green)' : 'var(--red)';

            this.results.push({
                ...point,
                refEnergy,
                dispEnergy,
                error,
                status: status ? 'PASS' : 'FAIL'
            });
        }

        this.displaySummary(allPassed);
    },

    displaySummary(allPassed) {
        const resultDiv = document.getElementById('accResult');
        const resultContent = document.getElementById('accResultContent');
        
        let html = `<div class="dial-results">`;
        
        // Summary statistics
        const totalTests = this.results.length;
        const passedTests = this.results.filter(r => r.status === 'PASS').length;
        const failedTests = totalTests - passedTests;
        const avgError = this.results.length > 0 ? 
            (this.results.reduce((sum, r) => sum + Math.abs(r.error), 0) / this.results.length).toFixed(4) : 0;

        html += `
            <div class="hero-result" style="padding: 15px;">
                <div class="hero-label">TEST SUMMARY</div>
                <div class="hero-value" style="font-size: 1.8rem;">${passedTests}/${totalTests} PASS</div>
                <div class="hero-sub">Failed: ${failedTests} | Avg Error: ±${avgError}%</div>
            </div>
            <div class="formula-box">
                <div class="formula-title">Overall Verdict</div>
                <div class="formula-content">
                    <strong style="color: ${allPassed ? 'var(--green)' : 'var(--red)'}">
                        ${allPassed ? '✅ METER PASSES ACCURACY REQUIREMENTS' : '❌ METER FAILS ACCURACY REQUIREMENTS'}
                    </strong><br>
                    Reference: ${this.results[0]?.standard || 'MS/IEC 62053'}
                </div>
            </div>
        `;

        // Table of results
        html += `<div class="section-divider"><div class="divider-line"></div><span class="divider-text">DETAILED RESULTS</span><div class="divider-line"></div></div>`;
        html += `<table class="ref-table" style="width:100%">
            <thead><tr><th>Current</th><th>PF</th><th>Reference</th><th>Display</th><th>Error</th><th>Limit</th><th>Status</th></tr></thead>
            <tbody>`;

        for (const r of this.results) {
            html += `<tr>
                <td>${r.currentValue.toFixed(3)} A</td>
                <td>${r.pf}</td>
                <td>${r.refEnergy.toFixed(6)}</td>
                <td>${r.dispEnergy.toFixed(6)}</td>
                <td style="color: ${Math.abs(r.error) <= r.limit ? 'var(--green)' : 'var(--red)'}">${r.error.toFixed(4)}%</td>
                <td>±${r.limit}%</td>
                <td>${r.status}</td>
            </tr>`;
        }

        html += `</tbody></table>`;
        html += `<div class="action-buttons" style="margin-top: 15px;">
                    <button class="btn-calculate" onclick="PDFReport.generateAccuracyReport()">📄 Export PDF Report</button>
                    <button class="btn-secondary" onclick="BatchTest.startFromAccuracy()">▶ Run Batch Test</button>
                 </div>`;
        html += `</div>`;

        resultContent.innerHTML = html;
        resultDiv.style.display = 'block';
        
        // Save to history
        Calculator.addToHistory({
            type: 'accuracy',
            standard: this.results[0]?.standard,
            totalTests,
            passedTests,
            avgError,
            allPassed,
            results: this.results,
            timestamp: new Date().toISOString()
        });
    },

    autoGeneratePoints() {
        this.updateTestPoints();
        UIManager.showToast('Test points generated based on standard', 'success');
    },

    addTestPoint() {
        this.testPoints.push({
            currentValue: 10,
            currentLabel: 'Custom',
            pf: 1,
            limit: 1.0,
            standard: 'Custom',
            refEnergy: null,
            dispEnergy: null,
            error: null,
            status: null
        });
        this.renderTestPoints();
    },

    calculateNoLoadTest() {
        const constValue = parseFloat(document.getElementById('accConst').value);
        const elements = document.getElementById('accSupply')?.value === '3P4W' ? 3 : 1;
        const voltage = 230;
        const imax = parseFloat(document.getElementById('accImax').value);
        
        if (isNaN(constValue) || constValue <= 0 || isNaN(imax)) {
            return null;
        }
        
        // Formula from MS 62053-22 clause 8.3.2
        // Δt ≥ (600 × 10^6) / (k × m × Un × Imax) minutes
        const minTestTime = (600 * 1000000) / (constValue * elements * voltage * imax);
        
        return {
            minutes: minTestTime.toFixed(1),
            seconds: (minTestTime * 60).toFixed(0)
        };
    },

    calculateStartingCurrent() {
        const meterClass = document.getElementById('accClass').value;
        const Ib = parseFloat(document.getElementById('accIb').value);
        
        let startingCurrentPercent = 0.004; // Default Class 1
        if (meterClass === '0.2S' || meterClass === '0.5S') {
            startingCurrentPercent = 0.002;
        } else if (meterClass === '2') {
            startingCurrentPercent = 0.005;
        }
        
        return (startingCurrentPercent * Ib).toFixed(3);
    }
};
