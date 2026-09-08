# Mayya • Asia Range & HTF Candle (FX Replay Edition)

Panduan penggunaan dan instalasi indikator **Asia Range & HTF Candle** untuk platform **FX Replay**.

---

## ❓ Mengapa Muncul Peringatan di FX Replay?

Di FX Replay muncul notifikasi:
> **⚠️ Pine Script detected**  
> *"FX Replay uses a different scripting engine. You can use AI to convert your Pine Script into a supported format."*

### Penjelasan:
1. **TradingView** menggunakan bahasa pemrograman **Pine Script** (`.pine`).
2. **FX Replay** **TIDAK** menjalankan Pine Script secara langsung. FX Replay menggunakan scripting engine bawaan bernama **FXR Script** (`//@version=1`) yang berbasis **JavaScript / TypeScript**.
3. Peringatan tersebut memberi tahu bahwa kode yang di-paste adalah sintaks Pine Script, sehingga tidak bisa langsung dijalankan oleh compiler FX Replay.

---

## 🚀 Cara Memasang di FX Replay

1. Buka sesi chart Anda di [FX Replay](https://www.fxreplay.com).
2. Di pojok kanan bawah chart, buka **FXR Code editor, v1**.
3. Buat file / script baru atau hapus seluruh teks template yang ada di editor.
4. Buka file [`Mayya_Asia_Range_HTF.fxr.js`](./Mayya_Asia_Range_HTF.fxr.js).
5. Salin (**Copy**) seluruh isi kode dari file tersebut, lalu tempel (**Paste**) ke dalam editor FX Replay.
6. Klik tombol **Run** atau **Save & Run** di bagian atas editor.
7. Indikator Asia Range & HTF Candle akan langsung aktif di chart FX Replay Anda! ✨

---

## ⚙️ Fitur yang Tersedia di Versi FX Replay:

- **Asia Range Box**:
  - **Warna Default**: Abu-abu (*Grey*).
  - **Transparansi**: Dapat diatur (default: 85%).
  - **Jam Sesi**: Format `HHMM-HHMM` (default: `0000-0800`).
  - **Pilihan Timezone Lengkap**: Pilihan UTC dari `UTC-12` hingga `UTC+12` (termasuk `UTC-4` & `UTC-5`).
  - **Midline (50%)**: Garis tengah equilibrium sesi Asia.
- **Label Sesi**:
  - Teks label default: **Asia**.
  - Toggle aktifkan / nonaktifkan label.
- **Multi-Timeframe (HTF Candle Overlay)**:
  - Toggle aktifkan candle HTF (1H, 4H, 1D, dll.) langsung di atas chart LTF.
  - Pewarnaan Bullish & Bearish HTF.
- **Watermark Info**:
  - Toggle Watermark Mayya on/off.
  - Toggle Subtitle on/off.
- **Pembersihan Fitur Sesuai Request**:
  - Tanpa fitur yang tidak diinginkan (tanpa extend, opening range, fibonacci, dots, day/price/pips text).
