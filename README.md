# MeterCalc Pro Universal v3.0.1

MeterCalc Pro ialah web app ringan untuk pengiraan parameter meter elektrik bagi sambungan **Direct**, **CT**, dan **CT+VT**. Aplikasi ini direka untuk kegunaan pantas di lapangan, boleh dipasang sebagai PWA, dan boleh digunakan secara offline selepas cache pertama berjaya.

## Fungsi utama

- Kira **Total Multiplier (M)** untuk Direct, CT dan CT+VT.
- Kira **Primary / Secondary Active Pulse Constant** dalam `imp/kWh`.
- Kira **Primary / Secondary Reactive Pulse Constant** dalam `imp/kvarh`.
- Kira **Pulse → Energy**.
- Kira **Energy → Pulse**.
- Kira **Accuracy Test** berdasarkan reference pulse, display difference dan test pulse.
- Kira **Maximum Demand (MD)** bagi interval 30 minit.
- Simpan sehingga 50 rekod sejarah dalam localStorage.
- Export sejarah kepada CSV.
- Dark mode / light mode.
- Pilihan bahasa BM / English disimpan dalam localStorage.
- PWA/offline-ready dengan relative path untuk GitHub Pages atau folder deploy lain.

## Formula

### Multiplier

```text
M = (CT Primary ÷ CT Secondary) × (VT Primary ÷ VT Secondary)
```

Untuk Direct meter:

```text
M = 1
```

### Primary pulse constant

```text
Primary Pulse Constant = Secondary Pulse Constant ÷ M
```

### Pulse → Energy

```text
Energy = (Pulse Count ÷ Meter Constant) × M
```

Untuk MWh:

```text
Energy MWh = Energy kWh ÷ 1000
```

### Energy → Pulse

```text
Pulse = (Energy kWh × Meter Constant) ÷ M
```

Jika input unit ialah MWh:

```text
Energy kWh = Energy MWh × 1000
```

### Accuracy Test

Definisi input yang digunakan dalam versi ini:

- `Pulse Count` = pulse reference/test source.
- `Meter Constant` = pulse constant MUT pada nameplate, contohnya `imp/kWh`.
- `Multiplier (M)` = total multiplier meter.
- `Start Reading` dan `End Reading` = display reading MUT dalam nilai primary energy.
- `Test Pulse` = pulse sebenar dari test output MUT.

Formula:

```text
Reference Energy = (Reference Pulse ÷ Meter Constant) × M
Display Difference = End Reading - Start Reading
Calculated MUT Pulse = (Display Difference × Meter Constant) ÷ M
Energy Error % = ((Display Difference - Reference Energy) ÷ Reference Energy) × 100
Pulse Error % = ((Test Pulse - Calculated MUT Pulse) ÷ Calculated MUT Pulse) × 100
Constant Check = (Test Pulse × M) ÷ Display Difference
```

> Nota: Jika display MUT tidak menunjukkan nilai primary energy, semak semula definisi formula Accuracy Test mengikut prosedur organisasi anda.

### Maximum Demand

Untuk interval 30 minit:

```text
MD kW = (Pulse Count × M × 3600) ÷ (Meter Constant × 1800)
```

Ringkasnya:

```text
MD kW = (Pulse Count × M × 2) ÷ Meter Constant
```

## Deploy

Aplikasi ini tiada dependency dan tidak memerlukan build step.

1. Upload semua fail ke hosting statik seperti GitHub Pages, Netlify, Vercel atau server dalaman.
2. Buka `index.html`.
3. Untuk PWA/offline, pastikan site menggunakan HTTPS kecuali semasa testing di `localhost`.

Struktur fail:

```text
index.html
css/style.css
js/app.js
js/calculator.js
js/ui.js
manifest.json
sw.js
```

## Perubahan v3.0.1

- Betulkan light theme contrast untuk input, panel dan result text.
- Tukar service worker cache kepada `metercalc-v3.0.1`.
- Tukar PWA path kepada relative path `./` supaya lebih mudah deploy di GitHub Pages.
- Tambah cleanup cache lama dalam service worker.
- Tambah `skipWaiting()` dan `clients.claim()` untuk update PWA lebih cepat.
- Tambah mode **Energy → Pulse**.
- Betulkan validasi input `0` supaya tidak dianggap invalid untuk field yang memang boleh bernilai sifar.
- Hentikan auto-convert nombor negatif kepada positif; input negatif kini ditandakan sebagai ralat.
- Betulkan butang delete sejarah dengan CSS sebenar.
- Reset kini mengembalikan input kepada default value.
- Pilihan bahasa kini disimpan dalam localStorage.
- Tambah ARIA label asas untuk beberapa button/navigation.

## Lesen

Rujuk fail `LICENSE`.
