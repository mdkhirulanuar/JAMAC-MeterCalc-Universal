/**
 * Snap Manager v4.0
 * Camera, Gallery, OCR auto-fill
 */
const SnapManager = {
    currentTab: null,
    db: null,

    init() {
        // Open IndexedDB
        const request = indexedDB.open('MeterCalcSnap', 1);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('snaps')) {
                const store = db.createObjectStore('snaps', { keyPath: 'id', autoIncrement: true });
                store.createIndex('tab', 'tab', { unique: false });
                store.createIndex('timestamp', 'timestamp', { unique: false });
            }
        };
        request.onsuccess = (e) => { this.db = e.target.result; };
    },

    openCamera(tab) {
        this.currentTab = tab;
        document.getElementById('cameraInput').click();
    },

    openGallery(tab) {
        this.currentTab = tab;
        this.renderGallery();
        document.getElementById('galleryModal').style.display = 'flex';
    },

    closeGallery() {
        document.getElementById('galleryModal').style.display = 'none';
    },

    handleImageCapture(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = e.target.result;
            this.saveSnap(imageData);
            this.runOCR(imageData);
        };
        reader.readAsDataURL(file);
        event.target.value = '';
    },

    saveSnap(imageData) {
        if (!this.db) return;
        const tx = this.db.transaction('snaps', 'readwrite');
        const store = tx.objectStore('snaps');
        const now = new Date();
        store.add({
            tab: this.currentTab,
            image: imageData,
            timestamp: now.toISOString(),
            name: now.toLocaleDateString('ms-MY') + ' ' + now.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })
        });
    },

    renderGallery() {
        if (!this.db) { document.getElementById('galleryEmpty').style.display = 'block'; return; }
        const tx = this.db.transaction('snaps', 'readonly');
        const store = tx.objectStore('snaps');
        const request = store.getAll();
        request.onsuccess = () => {
            const items = request.result.reverse();
            const grid = document.getElementById('galleryGrid');
            const empty = document.getElementById('galleryEmpty');
            if (!items.length) {
                grid.innerHTML = '';
                empty.style.display = 'block';
                return;
            }
            empty.style.display = 'none';
            grid.innerHTML = items.map(item => `
                <div class="gallery-item">
                    <img src="${item.image}" alt="Snap">
                    <div class="gallery-name">${item.name}</div>
                    <div class="gallery-actions">
                        <button class="gallery-use" onclick="SnapManager.useSnap(${item.id})">Guna</button>
                        <button class="gallery-delete" onclick="SnapManager.deleteSnap(${item.id})">Padam</button>
                    </div>
                </div>
            `).join('');
        };
    },

    useSnap(id) {
        const tx = this.db.transaction('snaps', 'readonly');
        const store = tx.objectStore('snaps');
        const request = store.get(id);
        request.onsuccess = () => {
            const item = request.result;
            this.currentTab = item.tab;
            this.closeGallery();
            this.runOCR(item.image);
        };
    },

    deleteSnap(id) {
        if (!confirm('Padam gambar ini?')) return;
        const tx = this.db.transaction('snaps', 'readwrite');
        tx.objectStore('snaps').delete(id);
        tx.oncomplete = () => this.renderGallery();
    },

    runOCR(imageData) {
        document.getElementById('ocrModal').style.display = 'flex';
        document.getElementById('ocrProgress').textContent = UIManager.currentLang === 'bm' ? 'Memproses gambar...' : 'Processing image...';

        // Run OCR
        OCRManager.scan(imageData, (results) => {
            document.getElementById('ocrModal').style.display = 'none';
            this.autoFill(results);
        });
    },

    autoFill(results) {
        const tab = this.currentTab;
        const values = results;

        switch (tab) {
            case 'calculator':
                if (values.meterConstant) document.getElementById('meterConstActive').value = values.meterConstant;
                if (values.ctPrimary) {
                    document.getElementById('ctPrimary').value = values.ctPrimary;
                    if (values.ctPrimary > 0) UIManager.switchCalcMode('ct');
                }
                if (values.ctSecondary) document.getElementById('ctSecondary').value = values.ctSecondary;
                if (values.vtPrimary) {
                    document.getElementById('vtPrimary').value = values.vtPrimary;
                    if (values.vtPrimary > 0) UIManager.switchCalcMode('ctvt');
                }
                if (values.vtSecondary) document.getElementById('vtSecondary').value = values.vtSecondary;
                UIManager.switchMainTab('calculatorPanel');
                break;

            case 'energy':
                if (values.meterConstant) document.getElementById('energyPulseConst').value = values.meterConstant;
                if (values.pulseCount) document.getElementById('energyPulseCount').value = values.pulseCount;
                UIManager.switchMainTab('energyPanel');
                break;

            case 'accuracy':
                if (values.meterConstant) document.getElementById('dialPulseConst').value = values.meterConstant;
                if (values.start) document.getElementById('dialStart').value = values.start;
                if (values.end) document.getElementById('dialEnd').value = values.end;
                if (values.realPulse) document.getElementById('dialRealPulse').value = values.realPulse;
                if (values.pulseCount) document.getElementById('dialPulseCount').value = values.pulseCount;
                UIManager.switchMainTab('accuracyPanel');
                break;

            case 'demand':
                if (values.meterConstant) document.getElementById('demandPulseConst').value = values.meterConstant;
                if (values.pulseCount) document.getElementById('demandPulseCount').value = values.pulseCount;
                UIManager.switchMainTab('demandPanel');
                break;
        }

        UIManager.showToast('✅ Nilai diisi dari gambar! Sila verify.', 'success');
        if (navigator.vibrate) navigator.vibrate([10, 20, 10]);
    }
};
