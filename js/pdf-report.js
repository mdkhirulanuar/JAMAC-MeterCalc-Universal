// PDF Report Generation Module
// Uses jsPDF library (loaded via CDN)

const PDFReport = {
    async generateFromCurrent() {
        // Get current calculation result
        const lastCalc = Calculator.history.find(h => h.type === 'calculator');
        if (!lastCalc) {
            UIManager.showToast('Tiada keputusan pengiraan. Sila kira parameter dulu.', 'error');
            return;
        }
        
        await this.generatePDF({
            title: 'Meter Parameter Calculation Report',
            type: 'calculator',
            data: lastCalc
        });
    },

    async generateAccuracyReport() {
        if (!AccuracyTest.results || AccuracyTest.results.length === 0) {
            UIManager.showToast('Tiada keputusan accuracy test. Sila jalankan test dulu.', 'error');
            return;
        }

        await this.generatePDF({
            title: 'Meter Accuracy Test Report',
            subtitle: 'SAMM 654 Accredited Laboratory',
            type: 'accuracy',
            data: AccuracyTest.results,
            summary: {
                totalTests: AccuracyTest.results.length,
                passedTests: AccuracyTest.results.filter(r => r.status === 'PASS').length,
                allPassed: AccuracyTest.results.every(r => r.status === 'PASS')
            }
        });
    },

    async generateBatchReport() {
        if (!BatchTest.results || BatchTest.results.length === 0) {
            UIManager.showToast('Tiada keputusan batch test. Sila jalankan batch test dulu.', 'error');
            return;
        }

        await this.generatePDF({
            title: 'Batch Test Report',
            subtitle: 'Multiple Test Points Analysis',
            type: 'batch',
            data: BatchTest.results,
            meterInfo: BatchTest.meterInfo,
            summary: {
                totalTests: BatchTest.results.length,
                passedTests: BatchTest.results.filter(r => r.status === 'PASS').length,
                failedTests: BatchTest.results.filter(r => r.status === 'FAIL').length,
                allPassed: !BatchTest.results.some(r => r.status === 'FAIL')
            }
        });
    },

    async generateSiteReport() {
        if (!SiteManager.currentJob) {
            UIManager.showToast('Tiada job aktif. Sila create job dulu.', 'error');
            return;
        }

        const job = SiteManager.currentJob;
        
        await this.generatePDF({
            title: 'Site Test Report',
            subtitle: job.jobNumber,
            type: 'site',
            siteInfo: {
                siteName: job.siteName,
                customerName: job.customerName,
                technician: job.technician,
                testDate: job.testDate
            },
            meters: job.meters,
            summary: {
                totalMeters: job.meters.length
            }
        });
    },

    async generatePDF(config) {
        // Ensure jsPDF is loaded
        if (typeof window.jspdf === 'undefined') {
            UIManager.showToast('PDF library loading. Please try again.', 'error');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ unit: 'mm', format: 'a4' });
        
        // Add logo/header
        doc.setFontSize(20);
        doc.setTextColor(77, 166, 255);
        doc.text('JAMAC METERING SDN. BHD.', 20, 25);
        
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('SAMM Accreditation No: SAMM 654', 20, 33);
        doc.text(`Issue Date: ${new Date().toLocaleDateString('ms-MY')}`, 20, 39);
        
        // Title
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text(config.title, 20, 55);
        
        if (config.subtitle) {
            doc.setFontSize(10);
            doc.text(config.subtitle, 20, 63);
        }
        
        let startY = 75;
        
        // Site info if available
        if (config.siteInfo) {
            doc.setFontSize(10);
            doc.setTextColor(80, 80, 80);
            doc.text(`Site: ${config.siteInfo.siteName}`, 20, startY);
            doc.text(`Customer: ${config.siteInfo.customerName || '-'}`, 20, startY + 6);
            doc.text(`Technician: ${config.siteInfo.technician || '-'}`, 20, startY + 12);
            doc.text(`Test Date: ${config.siteInfo.testDate}`, 20, startY + 18);
            startY += 28;
        }
        
        // Meter info if available
        if (config.meterInfo) {
            doc.setFontSize(10);
            doc.text(`Meter Constant: ${config.meterInfo.constValue || '-'} imp/kWh`, 20, startY);
            doc.text(`Multiplier: ${config.meterInfo.multiplier || 1}`, 20, startY + 6);
            doc.text(`Ib/In: ${config.meterInfo.Ib || '-'} A`, 20, startY + 12);
            doc.text(`Imax: ${config.meterInfo.Imax || '-'} A`, 20, startY + 18);
            startY += 28;
        }
        
        // Summary section
        if (config.summary) {
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
            doc.text('TEST SUMMARY', 20, startY);
            startY += 6;
            
            doc.setFontSize(9);
            const allPassed = config.summary.allPassed;
            const passedColor = allPassed ? [0, 150, 0] : [200, 0, 0];
            doc.setTextColor(passedColor[0], passedColor[1], passedColor[2]);
            doc.text(`Overall Verdict: ${allPassed ? 'PASS' : 'FAIL'}`, 20, startY + 6);
            doc.setTextColor(80, 80, 80);
            doc.text(`Total Tests: ${config.summary.totalTests || 0}`, 20, startY + 12);
            if (config.summary.passedTests !== undefined) {
                doc.text(`Passed: ${config.summary.passedTests}`, 20, startY + 18);
                doc.text(`Failed: ${config.summary.failedTests || (config.summary.totalTests - config.summary.passedTests)}`, 20, startY + 24);
            }
            startY += 35;
        }
        
        // Results table
        if (config.data && Array.isArray(config.data) && config.data.length > 0) {
            const tableData = config.data.map(r => {
                if (r.currentValue !== undefined) {
                    return [
                        `${r.currentValue?.toFixed(3) || '-'} A`,
                        r.pf || '-',
                        r.refEnergy?.toFixed(6) || '-',
                        r.dispEnergy?.toFixed(6) || '-',
                        `${r.error?.toFixed(4) || '-'}%`,
                        `±${r.limit || '-'}%`,
                        r.status || '-'
                    ];
                }
                return ['-', '-', '-', '-', '-', '-', '-'];
            });
            
            const headers = [['Current', 'PF', 'Reference', 'Display', 'Error %', 'Limit', 'Status']];
            
            doc.autoTable({
                startY: startY,
                head: headers,
                body: tableData,
                theme: 'striped',
                styles: { fontSize: 8, cellPadding: 3 },
                headStyles: { fillColor: [77, 166, 255], textColor: [255, 255, 255] },
                alternateRowStyles: { fillColor: [245, 245, 245] }
            });
            
            startY = doc.lastAutoTable.finalY + 10;
        }
        
        // Signatures
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        doc.text('Tested by: _________________', 20, startY);
        doc.text('Date: _________________', 20, startY + 8);
        doc.text('Verified by: _________________', 20, startY + 16);
        
        // Footer
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text('This report is generated by MeterCalc Pro v3.3', 20, 280);
        doc.text('This report shall not be reproduced except in full without written approval of JAMAC Metering Sdn. Bhd.', 20, 287);
        
        // Save
        const filename = `MeterCalc_${config.title.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(filename);
        
        UIManager.showToast('PDF report generated', 'success');
    }
};
