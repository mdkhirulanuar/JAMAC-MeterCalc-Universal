```markdown
# ⚡ MeterCalc Pro v3.0

**Universal Meter Parameter Calculator** untuk kegunaan teknikal di lapangan.  
Kira parameter meter elektrik dengan pantas dan tepat — **Direct, CT, CT+VT**, serta kalkulator tambahan untuk tenaga, ketepatan, dan maximum demand.

Dibangunkan untuk **JAMAC Metering Sdn. Bhd.**

---

## 🎯 Ciri-Ciri

| Modul | Fungsi |
|-------|--------|
| 🔌 **Kalkulator** | Kira CT Ratio, VT Ratio, Total Multiplier, Primary/Secondary Pulse (Active & Reactive) |
| 🔢 **Tenaga** | Pulse → Tenaga (kWh, kvarh, MWh) |
| 📊 **Accuracy Test** | Semak % error dan Constant Check — Error (%) + Error Pulse (%) |
| 🕐 **MD** | Kira Maximum Demand dari bacaan pulse 30 minit |
| 📋 **Sejarah** | Simpan sehingga 50 rekod — salin, CSV export, padam (long-press) |
| 📚 **Rujukan** | Standard CT/VT ratios, meter constants, class limits, decimal rules, multiplier guide |

---

## 📐 Formula Digunakan

### Kalkulator Parameter
```

Direct:  M = 1
CT:      M = CT Primary ÷ CT Secondary
CT+VT:   M = (CT Primary ÷ CT Secondary) × (VT Primary ÷ VT Secondary)

Primary Pulse   = Meter Constant ÷ M
Secondary Pulse = Meter Constant

```

### Tenaga
```

Tenaga (kWh) = (Pulse Count ÷ Meter Constant) × Multiplier

```

### Accuracy Test
```

Error (%) = ((Difference - Reference Energy) ÷ Reference Energy) × 100
Error Pulse (%) = ((Test Pulse - Calculated Pulse) ÷ Calculated Pulse) × 100
Constant Check = Test Pulse ÷ Difference

```

### Maximum Demand
```

MD (kW) = (Pulse × Multiplier × 3600) ÷ (Meter Constant × 1800)

```

---

## 🚀 Cara Guna

### Online (GitHub Pages)
Buka: `https://hirulanuar.github.io/meter-calc-universal/`

### Local
1. Clone atau download repo ini
2. Buka `index.html` dalam mana-mana browser
3. Tiada server diperlukan — 100% client-side

### PWA (Install ke Phone)
1. Buka URL di Chrome/Safari mobile
2. Tap "Add to Home Screen"
3. Boleh guna offline selepas first load

---

## 📱 Dioptimumkan Untuk

- ✅ Smartphone (mobile-first design)
- ✅ Tablet & Desktop
- ✅ Dark & Light theme
- ✅ Haptic feedback (vibrate on tap)
- ✅ Offline (PWA dengan Service Worker)
- ✅ BM/EN Dual Language

---

## 🛠️ Teknologi

- **HTML5** — Struktur
- **CSS3** — Styling (CSS Variables, Grid, Flexbox)
- **JavaScript (Vanilla)** — Tiada framework
- **PWA** — Service Worker, Manifest, Installable
- **LocalStorage** — Simpan sejarah & tema

---

## 📂 Struktur Projek

```

meter-calc-universal/
├── index.html              # Main app (6 tabs)
├── css/
│   └── style.css           # Complete stylesheet
├── js/
│   ├── calculator.js       # Core calculation engine
│   ├── ui.js               # UI manager + language
│   └── app.js              # Initialization
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker (offline)
└── README.md               # Dokumentasi

```

---

## 📊 Contoh Pengiraan

### Direct Meter (1 Fasa Domestik)
```

Input:  1000 imp/kWh, 1P2W, Class 1
Output: M = 1, Primary Pulse = 1000 imp/kWh

```

### CT Meter (3 Fasa Kilang)
```

Input:  1 imp/kWh, 3P4W, CT 800/5A, Class 0.5S
Output: CT Ratio = 160, M = 160, Primary Pulse = 0.00625 imp/kWh

```

### CT+VT Meter (HV Consumer)
```

Input:  1 imp/kWh, 3P4W, CT 50/5A, VT 11000/110V, Class 0.5S
Output: CT Ratio = 10, VT Ratio = 100, M = 1000, Primary Pulse = 0.001 imp/kWh

```

### Accuracy Test
```

Reference Energy: 1.7400 kWh, Difference: 1.7400 kWh, Class 1
Output: Error = 0.00% → ✅ LULUS

```

### Maximum Demand
```

Pulse: 150 (30 min), Meter Constant: 1000 imp/kWh, Multiplier: 160
Output: MD = 48 kW

```

---

## 🏷️ Label Sumber (Standard MS)

| Label | Maksud | Sumber Nilai |
|-------|--------|-------------|
| **Nameplate** | Plat nama meter/CT/VT | Meter Constant, CT/VT Ratio |
| **Reference Meter** | Meter standard rujukan | Pulse Count (rujukan) |
| **Display MUT** | Skrin meter yang diuji | Start/End Reading |
| **Test Output MUT** | Output pulse meter diuji | Test Pulse, Pulse Count |

---

## 🌐 Dual Language

| Bahasa | Coverage |
|--------|----------|
| 🇲🇾 **Bahasa Melayu** | Semua label UI, toast, error, footer |
| 🇬🇧 **English** | All UI labels, toast, errors, footer |

Tekan butang **🇲🇾/🇬🇧** di topbar untuk tukar.

---

## 📚 Rujukan Standard

App ini dibina berdasarkan standard berikut:

- **MS 62052-11:2009** — General requirements, tests and test conditions
- **MS 62053-21:2009** — Static meters for active energy (Classes 1 and 2)
- **MS 62053-22:2009** — Static meters for active energy (Classes 0.2S and 0.5S)
- **MS 62053-23:2009** — Static meters for reactive energy (Classes 2 and 3)

---

## 👨‍💻 Pembangun

**Khirul Anuar**  
Untuk **JAMAC Metering Sdn. Bhd.**

---

## 📄 Lesen

**MIT License** — Bebas guna, ubah suai, dan sebarkan.

---

**⚡ MeterCalc Pro v3.0 — Pantas, Tepat, Standard.**
