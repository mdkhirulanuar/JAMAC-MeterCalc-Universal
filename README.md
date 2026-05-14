# MeterCalc Pro Universal v3.2

**MeterCalc Pro Universal** ialah web app/PWA untuk pengiraan parameter metering bagi direct meter, CT meter dan CT+VT meter. Versi ini menambah modul **Scan Meter Nameplate** untuk capture/upload gambar nameplate menggunakan smartphone, membaca nilai melalui OCR, dan auto-fill nilai yang selamat selepas pengguna confirm.

**MeterCalc Pro Universal** is a web app/PWA for metering parameter calculations for direct, CT and CT+VT meters. This version adds a **Scan Meter Nameplate** module to capture/upload a nameplate photo using a smartphone, read values using OCR, and auto-fill safe values after user confirmation.

---

## Status Version

```text
Version: v3.2
Package: Fixed + Reference + Full BM/EN Toggle + Scan OCR
Recommended use: Field trial / internal pilot / technical reference
```

> **Nota penting:** Formula Accuracy Test perlu disahkan dengan SOP organisasi sebelum digunakan sebagai keputusan audit rasmi.
>
> **Important note:** The Accuracy Test formula must be validated against the organisation's SOP before being used for official audit decisions.

---

## Main Features / Fungsi Utama

### 1. Calculator

Mengira:

- Total multiplier
- CT ratio
- VT ratio
- Primary pulse constant
- Secondary pulse constant

Formula:

```text
Direct Meter:
M = 1

CT Meter:
M = CT Primary ÷ CT Secondary

CT + VT Meter:
M = (CT Primary ÷ CT Secondary) × (VT Primary ÷ VT Secondary)
```

---

### 2. Energy Calculator

Menyokong dua arah kiraan:

```text
Pulse → Energy
Energy → Pulse
```

Formula:

```text
Energy = (Pulse Count ÷ Meter Constant) × Multiplier
Pulse Count = (Energy × Meter Constant) ÷ Multiplier
```

---

### 3. Accuracy Test

Digunakan untuk semakan ralat meter berdasarkan input test.

Perlu disahkan sebelum penggunaan rasmi:

- sama ada Start/End Reading ialah bacaan primary atau secondary,
- sama ada display meter sudah apply multiplier,
- sumber pulse test,
- kaedah error calculation dalam SOP sebenar.

---

### 4. Maximum Demand Calculator

Mengira MD berdasarkan pulse count, meter constant dan multiplier.

---

### 5. Scan Meter Nameplate OCR

Modul baharu v3.2.

Pengguna boleh:

- ambil gambar melalui kamera smartphone,
- upload gambar daripada storage/gallery,
- jalankan OCR nameplate,
- semak nilai yang dikesan,
- apply nilai yang selamat ke Calculator.

The user can:

- capture a photo using the smartphone camera,
- upload an image from storage/gallery,
- run OCR on the nameplate,
- review detected values,
- apply safe values to the Calculator.

#### Nilai yang boleh auto-fill dengan selamat

| Field | Status |
|---|---|
| Meter Constant Active | Safe to apply if detected |
| Meter Constant Reactive | Safe to apply if detected |
| CT Secondary | Suggested only, based on current rating such as `1(10)A` or `5(10)A` |
| Supply Type | Safe to apply if clearly detected |
| Meter Class | Safe to apply if detected |

#### Nilai yang tidak boleh disahkan daripada nameplate meter sahaja

| Field | Reason |
|---|---|
| CT Primary | Usually found on CT nameplate, panel label, SLD or commissioning record |
| VT Primary | Usually found on VT/PT nameplate, panel label, SLD or commissioning record |
| Actual Multiplier | Depends on actual CT/VT ratio or billing/meter setting |

Warning dalam app:

```text
CT Primary / VT Primary / actual multiplier cannot be confirmed from the meter nameplate alone.
Verify from CT/VT nameplate, panel label, SLD, billing system, or commissioning record.
```

---

### 6. History

- Simpan rekod pengiraan
- Padam rekod individu
- Salin/export sejarah CSV
- Clear all history

---

### 7. Reference / Rujukan

Bahagian Reference kini mengandungi:

- nota jangan teka multiplier,
- formula multiplier,
- standard CT ratio secondary 5A,
- standard CT ratio secondary 1A,
- standard VT ratio,
- standard meter constant,
- class limit,
- decimal point rules,
- contoh multiplier 5A,
- contoh multiplier 1A,
- contoh multiplier 1A + VT,
- panduan jika CT/VT tidak diketahui,
- reverse check jika multiplier diketahui.

---

## Dual Language Toggle

App menyokong toggle bahasa:

```text
BM ↔ EN
```

Bahagian yang ikut toggle:

- Main tabs
- Calculator labels
- Energy labels
- Accuracy/MD labels utama
- History labels utama
- Reference section
- Scan OCR section
- Toast/error messages
- Footer

Pilihan bahasa disimpan dalam `localStorage`.

---

## PWA / Offline

App boleh digunakan sebagai PWA statik.

Pembaikan PWA:

- relative path untuk GitHub Pages/subfolder,
- cache versioning,
- cleanup cache lama,
- fallback ke `index.html`.

Nota: OCR menggunakan Tesseract.js melalui CDN. Untuk OCR berfungsi sepenuhnya, browser perlu dapat memuatkan library tersebut sekurang-kurangnya sekali. Fail app utama masih boleh cache sebagai PWA.

---

## Deployment

### Local

1. Extract ZIP.
2. Buka `index.html` dalam browser.

### GitHub Pages

1. Upload semua fail ke repository.
2. Enable GitHub Pages.
3. Pastikan struktur kekal:

```text
index.html
css/style.css
js/app.js
js/calculator.js
js/ui.js
js/scan.js
manifest.json
sw.js
```

---

## Files Updated in v3.2

```text
index.html
css/style.css
js/ui.js
js/scan.js
README.md
sw.js
```

---

## Technical Notes

### OCR Engine

The OCR module uses:

```html
<script src="https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js"></script>
```

Extraction uses JavaScript regex rules to detect values such as:

```text
10000 imp/kWh
10000 imp/kvarh
1(10)A
5(10)A
Class 0.5S
50Hz
3×63.5/110V - 3×230/400V
Three Phase Four Wire
CT Energy Meter
```

### Safety Rule

The scan module only applies safe fields. It does **not** auto-fill CT Primary, VT Primary, or Actual Multiplier because those values normally come from site CT/VT information, not the meter nameplate.

---

## Known Limitations

- OCR accuracy depends on photo quality, lighting, angle and nameplate condition.
- Blurry or reflective images may produce wrong text.
- User confirmation is required before applying detected values.
- CT Primary, VT Primary and Actual Multiplier still need field verification.
- Accuracy Test formula still requires SOP validation.

---

## Recommended Next Improvements

### v3.3

- Add Known Multiplier mode as a full calculator mode.
- Add clickable CT/VT presets from Reference.
- Add formula breakdown in results.

### v3.4

- Add optional site information:
  - Site name
  - Meter serial number
  - Technician
  - Remarks
- Add printable field report.

### v4.0

- SOP-aligned Accuracy Test workflow.
- Official report template.
- Audit-friendly calculation log.

---

## Developed For

```text
JAMAC Metering Sdn. Bhd.
Developed by: Khirul Anuar
```
