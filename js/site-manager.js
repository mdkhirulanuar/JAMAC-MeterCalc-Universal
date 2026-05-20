// Site & Job Management Module

const SiteManager = {
    currentJob: null,
    jobs: [],

    init() {
        this.loadJobs();
        this.generateJobNumber();
        
        // Set default test date to today
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('testDate');
        if (dateInput) dateInput.value = today;
    },

    loadJobs() {
        try {
            const saved = localStorage.getItem('metercalc_pro_jobs');
            if (saved) this.jobs = JSON.parse(saved);
        } catch (e) {
            this.jobs = [];
        }
    },

    saveJobs() {
        try {
            localStorage.setItem('metercalc_pro_jobs', JSON.stringify(this.jobs));
        } catch (e) {}
    },

    generateJobNumber() {
        const jobInput = document.getElementById('jobNumber');
        if (!jobInput) return;
        
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        
        jobInput.value = `JOB-${year}${month}${day}-${random}`;
    },

    createJob() {
        const jobNumber = document.getElementById('jobNumber')?.value || this.generateJobNumber();
        const siteName = document.getElementById('siteName')?.value || '';
        const customerName = document.getElementById('customerName')?.value || '';
        const technician = document.getElementById('technician')?.value || '';
        const testDate = document.getElementById('testDate')?.value || new Date().toISOString().split('T')[0];

        if (!siteName) {
            UIManager.showToast('Sila masukkan nama site/pencawang', 'error');
            return;
        }

        this.currentJob = {
            id: Date.now(),
            jobNumber: jobNumber,
            siteName: siteName,
            customerName: customerName,
            technician: technician,
            testDate: testDate,
            meters: [],
            status: 'in-progress',
            createdAt: new Date().toISOString()
        };

        this.jobs.push(this.currentJob);
        this.saveJobs();
        this.displayCurrentJob();
        UIManager.showToast(`Job ${jobNumber} created successfully`, 'success');
    },

    saveCurrentJob() {
        if (!this.currentJob) {
            UIManager.showToast('Tiada job aktif. Sila create job dulu.', 'error');
            return;
        }

        // Update job info from form
        this.currentJob.siteName = document.getElementById('siteName')?.value || this.currentJob.siteName;
        this.currentJob.customerName = document.getElementById('customerName')?.value || this.currentJob.customerName;
        this.currentJob.technician = document.getElementById('technician')?.value || this.currentJob.technician;
        this.currentJob.testDate = document.getElementById('testDate')?.value || this.currentJob.testDate;

        // Get current meter data from calculator
        const currentMeter = {
            manufacturer: document.getElementById('meterManufacturer')?.value || 'Unknown',
            model: document.getElementById('meterModel')?.value || 'Unknown',
            serial: document.getElementById('meterSerial')?.value || 'Unknown',
            class: document.getElementById('meterClass')?.value,
            constActive: parseFloat(document.getElementById('meterConstActive')?.value) || 0,
            constReactive: parseFloat(document.getElementById('meterConstReactive')?.value) || 0,
            ctPrimary: parseFloat(document.getElementById('ctPrimary')?.value) || null,
            ctSecondary: parseFloat(document.getElementById('ctSecondary')?.value) || null,
            vtPrimary: parseFloat(document.getElementById('vtPrimary')?.value) || null,
            vtSecondary: parseFloat(document.getElementById('vtSecondary')?.value) || null,
            testResults: []
        };

        // Check if meter already exists in job
        const existingIndex = this.currentJob.meters.findIndex(m => m.serial === currentMeter.serial && m.serial !== 'Unknown');
        if (existingIndex >= 0) {
            this.currentJob.meters[existingIndex] = currentMeter;
        } else if (currentMeter.serial !== 'Unknown') {
            this.currentJob.meters.push(currentMeter);
        }

        this.saveJobs();
        this.displayCurrentJob();
        UIManager.showToast('Job saved successfully', 'success');
    },

    addMeterToJob(meterData) {
        if (!this.currentJob) {
            UIManager.showToast('Tiada job aktif. Sila create job dulu.', 'error');
            return false;
        }

        this.currentJob.meters.push({
            id: Date.now(),
            ...meterData,
            testResults: []
        });
        this.saveJobs();
        this.displayCurrentJob();
        return true;
    },

    addTestResult(meterId, testPoint, result) {
        if (!this.currentJob) return;

        const meter = this.currentJob.meters.find(m => m.id === meterId || m.serial === meterId);
        if (meter) {
            meter.testResults.push({
                timestamp: new Date().toISOString(),
                testPoint: testPoint,
                referenceEnergy: result.reference,
                displayEnergy: result.display,
                error: result.error,
                status: result.status
            });
            this.saveJobs();
        }
    },

    displayCurrentJob() {
        const container = document.getElementById('currentJobInfo');
        if (!container) return;

        if (!this.currentJob) {
            container.innerHTML = '<p class="empty-state">No active job. Click "Create New Job" to start.</p>';
            return;
        }

        let metersHtml = '';
        for (const meter of this.currentJob.meters) {
            const testCount = meter.testResults?.length || 0;
            metersHtml += `
                <div class="meter-item" style="background: var(--bg2); padding: 10px; border-radius: 8px; margin-bottom: 8px;">
                    <div><strong>${meter.manufacturer} ${meter.model}</strong> - Serial: ${meter.serial}</div>
                    <div style="font-size: 0.7rem; color: var(--text2);">Class: ${meter.class} | Tests: ${testCount}</div>
                </div>
            `;
        }

        container.innerHTML = `
            <div class="job-info-card" style="margin-top: 15px; padding: 15px; background: var(--card2); border-radius: 12px;">
                <h3>Current Job: ${this.currentJob.jobNumber}</h3>
                <p><strong>Site:</strong> ${this.currentJob.siteName}</p>
                <p><strong>Customer:</strong> ${this.currentJob.customerName || '-'}</p>
                <p><strong>Technician:</strong> ${this.currentJob.technician || '-'}</p>
                <p><strong>Test Date:</strong> ${this.currentJob.testDate}</p>
                <p><strong>Status:</strong> ${this.currentJob.status}</p>
                <hr style="margin: 10px 0; border-color: var(--border);">
                <h4>Meters (${this.currentJob.meters.length})</h4>
                ${metersHtml || '<p>No meters added yet.</p>'}
                <div class="job-actions" style="display: flex; gap: 10px; margin-top: 15px;">
                    <button class="btn-secondary" onclick="SiteManager.completeJob()">✅ Complete Job</button>
                    <button class="btn-secondary" onclick="SiteManager.exportJobData()">📥 Export Job Data</button>
                </div>
            </div>
        `;
    },

    completeJob() {
        if (!this.currentJob) return;
        
        this.currentJob.status = 'completed';
        this.currentJob.completedAt = new Date().toISOString();
        this.saveJobs();
        
        // Generate final report
        PDFReport.generateSiteReport();
        
        UIManager.showToast(`Job ${this.currentJob.jobNumber} completed`, 'success');
        
        // Reset for new job
        this.currentJob = null;
        this.generateJobNumber();
        this.displayCurrentJob();
        
        // Clear form
        document.getElementById('siteName').value = '';
        document.getElementById('customerName').value = '';
        document.getElementById('technician').value = '';
    },

    exportJobData() {
        if (!this.currentJob) {
            UIManager.showToast('No active job to export', 'error');
            return;
        }

        const dataStr = JSON.stringify(this.currentJob, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.currentJob.jobNumber}.json`;
        a.click();
        URL.revokeObjectURL(url);
        UIManager.showToast('Job data exported', 'success');
    },

    getCurrentMeterInfo() {
        return {
            manufacturer: document.getElementById('meterManufacturer')?.value || '',
            model: document.getElementById('meterModel')?.value || '',
            serial: document.getElementById('meterSerial')?.value || '',
            class: document.getElementById('meterClass')?.value,
            constActive: parseFloat(document.getElementById('meterConstActive')?.value) || 0,
            constReactive: parseFloat(document.getElementById('meterConstReactive')?.value) || 0
        };
    }
};
