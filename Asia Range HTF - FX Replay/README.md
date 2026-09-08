# Mayya • Asia Range & HTF Candle (FX Replay Edition)

Panduan penggunaan dan instalasi indikator **Asia Range & HTF Candle** untuk platform **FX Replay**.

---

## ❓ Mengapa Sebelumnya Tidak Muncul di FX Replay?

1. **Pendeteksian Sesi Historis**:  
   Pada versi awal, box sesi Asia hanya terpicu jika terjadi transisi live saat replay berjalan melewati jam sesi. Jika Anda membuka chart di luar jam sesi (misal jam 17:00 seperti pada screenshot), box sesi Asia sebelumnya belum ter-scan. Pada versi 1.2.0 ini, script secara otomatis melakukan scanning bar historis (hingga 2000 bar) sehingga sesi Asia hari ini maupun sesi kemarin langsung muncul seketika saat Anda menekan tombol **Run**!
2. **HTF Candle Multi-Candle & Settings**:  
   HTF Candle kini tidak hanya 1 candle, melainkan dapat diatur jumlahnya (misal 2, 4, 6, hingga 15 candle) seperti di Pine Script, dengan 2 mode tampilan:
   - **Overlay (Pada Chart)**: Candle HTF membungkus bar LTF di waktu historis aslinya.
   - **Projected (Kanan Chart)**: Candle HTF berjejer rapi di sebelah kanan chart dengan pengaturan offset, lebar bar, dan spasi seperti di TradingView/Pine Script.
3. **Tracing Level HTF ke LTF**:  
   Garis High/Low dan Open/Close candle HTF dapat diproyeksikan langsung ke chart LTF.

---

## 🚀 Cara Memasang di FX Replay

1. Buka sesi chart Anda di [FX Replay](https://www.fxreplay.com).
2. Di pojok kanan bawah chart, buka **FXR Code editor, v1**.
3. Buka file [`Mayya_Asia_Range_HTF.fxr.js`](./Mayya_Asia_Range_HTF.fxr.js).
4. Salin (**Copy**) seluruh isi kode dari file tersebut, lalu tempel (**Paste**) menggantikan isi editor di FX Replay.
5. Klik tombol **Run** di bagian atas editor.
6. Indikator Asia Range & HTF Candle akan langsung tampil di chart FX Replay Anda! ✨

---

## ⚙️ Fitur Lengkap di Versi FX Replay (v1.2.0):

### 1. Modul Asia Range Box
- **Aktif secara default**: Langsung muncul saat Run.
- **Warna Default**: Abu-abu (*Grey*).
- **Transparansi Background**: Dapat diatur (default: 85%).
- **Jam Sesi**: Format `HHMM-HHMM` (default: `0000-0800`).
- **Pilihan Timezone Lengkap**: Dari `UTC-12` hingga `UTC+12` (termasuk `UTC-4`, `UTC-5`, `UTC+7`, dsb).
- **Midline (50%)**: Garis tengah equilibrium box Asia.
- **Jumlah Sesi Historis**: Menentukan berapa box sesi Asia ke belakang yang ingin ditampilkan (default: 5 sesi).
- **Label Sesi**: Teks label default "Asia" dengan toggle on/off.

### 2. Modul HTF Candle (Multi-Timeframe)
- **Aktif secara default**: Langsung tampil di chart.
- **HTF Timeframe**: Pilihan timeframe HTF (4h, 1h, 15m, 1D, 1W, dll).
- **Jumlah Candle HTF**: Mengatur berapa candle HTF yang ingin ditampilkan (default: 4 candle).
- **Mode Tampilan**:
  - `Overlay (Pada Chart)`: Candle HTF membungkus bar chart di rentang waktu candle tersebut.
  - `Projected (Kanan Chart)`: Candle HTF berjejer di sisi kanan chart.
- **Pewarnaan & Sumbu**:
  - Warna Bullish (default: Green) & Bearish (default: Red).
  - Warna Wick / Border (default: Black).
  - Toggle tampilkan sumbu (wick) on/off & ketebalan garis.
- **Pengaturan Posisi Projected**:
  - Offset kanan (jarak dari candle terakhir).
  - Spacing antar candle HTF.
  - Lebar candle HTF (dalam jumlah bar).
- **Label HTF**: Label timeframe di atas/bawah candle HTF.
- **Tracing Level HTF ke LTF**:
  - Garis High & Low candle HTF yang diproyeksikan ke chart LTF.
  - Garis Open & Close candle HTF yang diproyeksikan ke chart LTF.
