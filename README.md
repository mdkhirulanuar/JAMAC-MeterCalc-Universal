```markdown
# ⚡ MeterCalc Pro

**Universal Meter Parameter Calculator** untuk kegunaan teknikal di lapangan.  
Kira parameter meter elektrik dengan pantas dan tepat — **direct, CT, CT+VT**, serta kalkulator tambahan untuk tenaga, ketepatan, dan maximum demand.

## 🎯 Ciri-Ciri

| Modul | Fungsi |
|-------|--------|
| 🔌 **Kalkulator** | Kira CT Ratio, VT Ratio, Total Multiplier, Primary/Secondary Pulse (Active & Reactive) |
| 🔢 **Tenaga** | Pulse → Tenaga (kWh) atau Tenaga → Pulse |
| 📊 **Ketepatan** | Semak % error meter dan lulus/gagal berdasarkan Class |
| 🕐 **MD** | Kira Maximum Demand dari bacaan pulse 30 minit |
| 📋 **Sejarah** | Simpan sehingga 50 rekod pengiraan lepas |
| 📚 **Rujukan** | Standard CT/VT ratios, meter constants, class limits, wiring configuration |

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

### Energy Registration
```

Pulse → Tenaga:  Energy (kWh) = (Pulse Count ÷ Pulse Constant) × Multiplier
Tenaga → Pulse:  Pulse = (Energy × Pulse Constant) ÷ Multiplier

```

### Accuracy
```

% Error = ((Meter Reading - Reference) ÷ Reference) × 100

Class Limits:
0.2S → ±0.2%
0.5S → ±0.5%
0.5  → ±0.5%
1    → ±1%
2    → ±2%

```

### Maximum Demand
```

MD (kW) = (Pulse × Multiplier × 3600) ÷ (Pulse Constant × 1800)

```

---

## 🚀 Cara Guna

### Online (GitHub Pages)
Buka: `https://[username].github.io/meter-calc-universal/`

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
- ✅ Tablet
- ✅ Desktop
- ✅ Dark & Light theme
- ✅ Haptic feedback (vibrate on tap)
- ✅ Offline (PWA dengan Service Worker)

---

## 🛠️ Teknologi

- **HTML5** — Struktur
- **CSS3** — Styling (CSS Variables, Grid, Flexbox, Animations)
- **JavaScript (Vanilla)** — Tiada framework diperlukan
- **PWA** — Service Worker, Manifest, Installable
- **LocalStorage** — Simpan sejarah & tema

---

## 📂 Struktur Projek

```

meter-calc-universal/
├── index.html              # Main app
├── css/
│   └── style.css           # Complete stylesheet
├── js/
│   ├── calculator.js       # Core calculation engine
│   ├── ui.js               # UI manager
│   └── app.js              # Initialization
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker (offline cache)
└── README.md               # Dokumentasi

```

---

## 📊 Contoh Pengiraan

### Direct Meter (1 Fasa)
```

Input:  1000 imp/kWh, 1P2W, Class 1
Output: M = 1, Primary Pulse = 1000 imp/kWh

```

### CT Meter (3 Fasa)
```

Input:  1 imp/kWh, 3P4W, CT 800/5A, Class 0.5S
Output: CT Ratio = 160, M = 160, Primary Pulse = 0.00625 imp/kWh

```

### CT+VT Meter (High Voltage)
```

Input:  1 imp/kWh, 3P4W, CT 50/5A, VT 11000/110V, Class 0.5S
Output: CT Ratio = 10, VT Ratio = 100, M = 1000, Primary Pulse = 0.001 imp/kWh

```

### Accuracy Test
```

Reference: 100 kWh, Meter Reading: 101.5 kWh, Class 1
Output: Error = +1.5% → ❌ GAGAL (melebihi ±1%)

```

### Maximum Demand
```

Pulse: 150 dalam 30 minit, Constant: 1000 imp/kWh, Multiplier: 160
Output: MD = 48 kW

---

## 🔄 Changelog

### v2.0 (Current)
- ✅ Energy Registration Calculator (Pulse ↔ Tenaga)
- ✅ Meter Accuracy Calculator (+ Pass/Fail)
- ✅ Maximum Demand Calculator
- ✅ Quick Reference Table (CT, VT, Constants, Class Limits, Wiring)
- ✅ Detailed History Log (50 rekod)
- ✅ Dark/Light theme
- ✅ PWA offline support
- ✅ Removed Reverse Calculator
- ✅ Removed mandatory site info fields

### v1.0 (Initial)
- ✅ Basic Calculator (Direct, CT, CT+VT)
- ✅ History log
- ✅ PWA support

---

## 📄 Lesen

**MIT License** — Bebas guna, ubah suai, dan sebarkan.

---

## 👨‍💻 Dibangunkan Untuk

Kegunaan teknikal oleh jurutera dan juruteknik meter elektrik di lapangan.

---

**⚡ MeterCalc Pro — Pantas, Tepat, Universal.**
```
