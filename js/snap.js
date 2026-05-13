/**
 * Snap Manager v4.0 - Fixed
 * Camera, Gallery, OCR auto-fill
 */
const SnapManager = {
    currentTab: null,
    db: null,

    init() {
        const request = indexedDB.open('MeterCalcSnap', 1);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('snaps')) {
                const store = db.createObjectStore('snaps', { keyPath: 'id', autoIncrement: true });
                store.createIndex('tab', 'tab', { unique: false });
                store.createIndex('timestamp', 'timestamp', { unique: false });
            }
        };
        request.onsuccess = (e) => { 
            this.db = e.target.result; 
            console.log('✅ IndexedDB ready');
        };
        request.onerror = (e) => {
            console.error('IndexedDB Error:', e);
        };
    },

    openCamera(tab) {
        this.currentTab = tab;
        const input = document.getElementById('cameraInput');
        if (input) {
            input.click();
        }
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

        console.log('Image captured:', file.name, file.size, 'bytes');

        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = e.target.result;
            console.log('Image loaded, size:', imageData.length);
            
            // Save to IndexedDB
            this.saveSnap(imageData);
            
            // Run OCR
            this.runOCR(imageData);
        };
        reader.onerror = (e) => {
            console.error('FileReader Error:', e);
            UIManager.showToast('❌ Gagal membaca gambar', 'error');
        };
        reader.readAsDataURL(file);
        
        // Reset input
        event.target.value = '';
    },

    saveSnap(imageData) {
        if (!this.db) {
            console.warn('IndexedDB not ready, skipping save');
            return;
        }
        try {
            const tx = this.db.transaction('snaps', 'readwrite');
            const store = tx.objectStore('snaps');
            const now = new Date();
            store.add({
                tab: this.currentTab,
                image: imageData,
                timestamp: now.toISOString(),
                name: now.toLocaleDateString('ms-MY') + ' ' + now.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })
            });
            console.log('Snap saved to IndexedDB');
        } catch (e) {
            console.error('Save Error:', e);
        }
    },

    renderGallery() {
        if (!this.db) {
            document.getElementById('galleryEmpty').style.display = 'block';
            document.getElementById('galleryGrid').innerHTML = '';
            return;
        }

        try {
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

            request.onerror = (e) => {
                console.error('Gallery Load Error:', e);
                document.getElementById('galleryEmpty').style.display = 'block';
            };
        } catch (e) {
            console.error('Gallery Error:', e);
            document.getElementById('galleryEmpty').style.display = 'block';
        }
    },

    useSnap(id) {
        try {
            const tx = this.db.transaction('snaps', 'readonly');
            const store = tx.objectStore('snaps');
            const request = store.get(id);

            request.onsuccess = () => {
                const item = request.result;
                if (item) {
                    this.currentTab = item.tab;
                    this.closeGallery();
                    this.runOCR(item.image);
                }
            };

            request.onerror = (e) => {
                console.error('Use Snap Error:', e);
                UIManager.showToast('❌ Gagal muat gambar', 'error');
            };
        } catch (e) {
            console.error('Use Snap Error:', e);
        }
    },

    deleteSnap(id) {
        if (!confirm('Padam gambar ini?')) return;
        try {
            const tx = this.db.transaction('snaps', 'readwrite');
            tx.objectStore('snaps').delete(id);
            tx.oncomplete = () => {
                console.log('Snap deleted');
                this.renderGallery();
            };
        } catch (e) {
            console.error('Delete Error:', e);
        }
    },

    runOCR(imageData) {
        console.log('Starting OCR for tab:', this.currentTab);
        
        // Show progress
        document.getElementById('ocrModal').style.display = 'flex';
        document.getElementById('ocrProgress').textContent = 
            UIManager.currentLang === 'bm' ? 'Memproses gambar...' : 'Processing image...';

        // Run OCR with callback
        OCRManager.scan(imageData, (results) => {
            console.log('OCR Results:', results);
            document.getElementById('ocrModal').style.display = 'none';
            
            // Check if any values were found
            const hasValues = Object.keys(results).length > 0;
            
            if (hasValues) {
                this.autoFill(results);
            } else {
                UIManager.showToast(
                    UIManager.currentLang === 'bm' 
                        ? '⚠️ Tiada nilai dikesan. Sila isi manual.' 
                        : '⚠️ No values detected. Please fill manually.',
                    'error'
                );
            }
        });
    },

    autoFill(results) {
        const tab = this.currentTab;
        console.log('Auto-filling tab:', tab, 'with:', results);

        switch (tab) {
            case 'calculator':
                if (results.meterConstant) {
                    document.getElementById('meterConstActive').value = results.meterConstant;
                    console.log('Filled meterConstActive:', results.meterConstant);
                }
                if (results.ctPrimary && results.ctPrimary > 0) {
                    document.getElementById('ctPrimary').value = results.ctPrimary;
                    console.log('Filled ctPrimary:', results.ctPrimary);
                    // Auto switch to CT mode
                    UIManager.switchCalcMode('ct');
                }
                if (results.ctSecondary) {
                    document.getElementById('ctSecondary').value = results.ctSecondary;
                    console.log('Filled ctSecondary:', results.ctSecondary);
                }
                if (results.vtPrimary && results.vtPrimary > 0) {
                    document.getElementById('vtPrimary').value = results.vtPrimary;
                    console.log('Filled vtPrimary:', results.vtPrimary);
                    // Auto switch to CT+VT mode
                    UIManager.switchCalcMode('ctvt');
                }
                if (results.vtSecondary) {
                    document.getElementById('vtSecondary').value = results.vtSecondary;
                    console.log('Filled vtSecondary:', results.vtSecondary);
                }
                // Update live ratios
                Calculator.updateLiveRatios();
                UIManager.switchMainTab('calculatorPanel');
                break;

            case 'energy':
                if (results.meterConstant) {
                    document.getElementById('energyPulseConst').value = results.meterConstant;
                }
                if (results.pulseCount) {
                    document.getElementById('energyPulseCount').value = results.pulseCount;
                }
                UIManager.switchMainTab('energyPanel');
                break;

            case 'accuracy':
                if (results.meterConstant) {
                    document.getElementById('dialPulseConst').value = results.meterConstant;
                }
                if (results.start !== undefined) {
                    document.getElementById('dialStart').value = results.start;
                }
                if (results.end !== undefined) {
                    document.getElementById('dialEnd').value = results.end;
                }
                if (results.realPulse) {
                    document.getElementById('dialRealPulse').value = results.realPulse;
                }
                if (results.pulseCount) {
                    document.getElementById('dialPulseCount').value = results.pulseCount;
                }
                UIManager.switchMainTab('accuracyPanel');
                break;

            case 'demand':
                if (results.meterConstant) {
                    document.getElementById('demandPulseConst').value = results.meterConstant;
                }
                if (results.pulseCount) {
                    document.getElementById('demandPulseCount').value = results.pulseCount;
                }
                UIManager.switchMainTab('demandPanel');
                break;
        }

        // Count filled fields
        const filledCount = Object.keys(results).length;
        UIManager.showToast(
            UIManager.currentLang === 'bm'
                ? `✅ ${filledCount} nilai diisi dari gambar! Sila verify.`
                : `✅ ${filledCount} values filled from image! Please verify.`,
            'success'
        );
        if (navigator.vibrate) navigator.vibrate([10, 20, 10]);
    }
};
