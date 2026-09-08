//@version=1
/**
 * ============================================================================
 * Indikator : Mayya • Asia Range & HTF Candle (FX Replay Edition)
 * Author    : Mayya
 * Versi     : 1.3.6
 * Bahasa    : FXR Script (JavaScript / TypeScript runtime)
 * Platform  : FX Replay (FXR Code Editor v1)
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// Input Value Storage — Diisi oleh init(), dipakai oleh onTick().
// Pola: tangkap return value dari input.xxx() karena TypeScript type 'Input'
// hanya mendeklarasikan method, bukan property user-defined seperti input.showAsia.
// ----------------------------------------------------------------------------
var _showAsia        = true;
var _asiaSession     = '0000-0800';
var _asiaTz          = 'UTC+0';
var _asiaColor       = null;
var _asiaTransparency= 85;
var _showMidline     = true;
var _asiaHistoryCount= 5;
var _showLabel       = true;
var _labelText       = 'Asia';
var _showHtf         = true;
var _htfTf           = '4h';
var _htfCandlesAmount= 4;
var _htfMode         = 'Overlay (Pada Chart)';
var _htfBullColor    = null;
var _htfBearColor    = null;
var _htfWickColor    = null;
var _htfShowWick     = true;
var _htfLineWidth    = 1;
var _htfOffset       = 5;
var _htfSpace        = 2;
var _htfWidth        = 4;
var _htfShowLabel    = true;
var _showHtfHlLines  = true;
var _showHtfOcLines  = false;
var _htfLineColor    = null;

init = () => {
  // Pasang indikator di panel chart utama
  indicator({ onMainPanel: true, format: 'inherit' });

  // --------------------------------------------------------------------------
  // 1. Modul Asia Range Settings
  // Tangkap return value dari setiap input.xxx() — ini adalah pola yang benar
  // di FX Replay agar nilai input bisa dibaca di onTick() tanpa menyentuh
  // property dynamic di type 'Input' yang TypeScript tidak mengenalnya.
  // --------------------------------------------------------------------------
  _showAsia         = input.bool('Tampilkan Asia Range', true, 'showAsia', 'Modul Asia Range');
  _asiaSession      = input.session('Jam Sesi Asia', '0000-0800', 'asiaSession', 'Modul Asia Range');
  _asiaTz           = input.str(
    'Timezone',
    'UTC+0',
    'asiaTz',
    [
      'UTC-12', 'UTC-11', 'UTC-10', 'UTC-9', 'UTC-8', 'UTC-7', 'UTC-6', 'UTC-5', 'UTC-4', 'UTC-3', 'UTC-2', 'UTC-1',
      'UTC+0', 'UTC+1', 'UTC+2', 'UTC+3', 'UTC+4', 'UTC+5', 'UTC+6', 'UTC+7', 'UTC+8', 'UTC+9', 'UTC+10', 'UTC+11', 'UTC+12'
    ],
    undefined,
    'Modul Asia Range'
  );
  _asiaColor        = input.color('Warna Box Asia', color.gray, 'asiaColor', 'Modul Asia Range');
  _asiaTransparency = input.int('Transparansi Background (%)', 85, 'asiaTransparency', 0, 100, 1, undefined, 'Modul Asia Range');
  _showMidline      = input.bool('Tampilkan Garis Tengah (50%)', true, 'showMidline', 'Modul Asia Range');
  _asiaHistoryCount = input.int('Jumlah Sesi Historis', 5, 'asiaHistoryCount', 1, 30, 1, 'Berapa sesi Asia terakhir yang ditampilkan di chart', 'Modul Asia Range');

  // Label Sesi Asia
  _showLabel        = input.bool('Tampilkan Label Sesi', true, 'showLabel', 'Label Asia');
  _labelText        = input.str('Teks Label', 'Asia', 'labelText', undefined, undefined, 'Label Asia');

  // --------------------------------------------------------------------------
  // 2. Modul HTF Candle Settings (Multi-Timeframe)
  // --------------------------------------------------------------------------
  _showHtf          = input.bool('Tampilkan HTF Candle', true, 'showHtf', 'Modul HTF Candle');

  // Daftarkan timeframe HTF ke runtime MTF FX Replay
  _htfTf            = input.timeframe('HTF Timeframe', '4h', 'htfTf', 'Modul HTF Candle');
  if (typeof mtf !== 'undefined' && mtf && typeof mtf.timeframe === 'function') {
    mtf.timeframe(_htfTf);
  }

  _htfCandlesAmount = input.int('Jumlah Candle HTF', 4, 'htfCandlesAmount', 1, 15, 1, 'Berapa candle HTF yang ingin ditampilkan', 'Modul HTF Candle');
  _htfMode          = input.str(
    'Mode Tampilan HTF',
    'Overlay (Pada Chart)',
    'htfMode',
    ['Overlay (Pada Chart)', 'Projected (Kanan Chart)'],
    undefined,
    'Modul HTF Candle'
  );

  // Pewarnaan & Sumbu HTF
  _htfBullColor     = input.color('Warna Bullish HTF', color.green, 'htfBullColor', 'Styling HTF');
  _htfBearColor     = input.color('Warna Bearish HTF', color.red, 'htfBearColor', 'Styling HTF');
  _htfWickColor     = input.color('Warna Wick / Border HTF', color.black, 'htfWickColor', 'Styling HTF');
  _htfShowWick      = input.bool('Tampilkan Sumbu (Wick)', true, 'htfShowWick', 'Styling HTF');
  _htfLineWidth     = input.int('Ketebalan Garis / Sumbu', 1, 'htfLineWidth', 1, 4, 1, undefined, 'Styling HTF');

  // Offset & Posisi (Untuk Mode Projected)
  _htfOffset        = input.int('Offset Kanan (Bar)', 5, 'htfOffset', 1, 50, 1, 'Jarak candle HTF dari candle terakhir chart', 'Posisi Projected HTF');
  _htfSpace         = input.int('Spacing Antar Candle (Bar)', 2, 'htfSpace', 1, 10, 1, 'Jarak antar candle HTF', 'Posisi Projected HTF');
  _htfWidth         = input.int('Lebar Candle (Bar)', 4, 'htfWidth', 1, 20, 1, 'Lebar body candle HTF dalam jumlah bar', 'Posisi Projected HTF');

  // Label HTF
  _htfShowLabel     = input.bool('Tampilkan Label HTF', true, 'htfShowLabel', 'Label HTF');
  input.str('Posisi Label HTF', 'Top', 'htfLabelPos', ['Top', 'Bottom', 'Both'], undefined, 'Label HTF');

  // Garis Level HTF ke Chart LTF (Tracing)
  _showHtfHlLines   = input.bool('Tampilkan Garis H/L HTF di LTF', true, 'showHtfHlLines', 'Level HTF Trace');
  _showHtfOcLines   = input.bool('Tampilkan Garis O/C HTF di LTF', false, 'showHtfOcLines', 'Level HTF Trace');
  _htfLineColor     = input.color('Warna Garis Level HTF', color.gray, 'htfLineColor', 'Level HTF Trace');
};

// ----------------------------------------------------------------------------
// Global Tracking State (Menampung ID gambar agar bisa dibersihkan & di-update)
// Menggunakan `var` (bukan `let`) agar variabel di-hoist ke global scope sehingga
// tetap accessible di dalam eval sandbox FX Replay. Pattern `typeof x !== 'undefined'`
// digunakan untuk menghindari ReferenceError dan TypeScript strict type error.
// ----------------------------------------------------------------------------

// Deklarasi dengan `var` + self-referential init: aman diulang setiap eval karena
// var di-hoist, dan `typeof __mayyaDrawnIds` tidak pernah melempar error.
var __mayyaDrawnIds = (typeof __mayyaDrawnIds !== 'undefined' && Array.isArray(__mayyaDrawnIds))
  ? __mayyaDrawnIds
  : [];

/**
 * Membersihkan semua drawing yang pernah dibuat pada tick sebelumnya.
 * Menggunakan akses array via `__mayyaDrawnIds` yang ter-hoist ke global scope
 * oleh deklarasi `var` di atas sehingga tidak pernah undefined.
 */
function clearOldDrawings() {
  if (typeof deleteDrawingById !== 'function') return;
  if (typeof __mayyaDrawnIds === 'undefined' || !Array.isArray(__mayyaDrawnIds)) return;
  try {
    var len = __mayyaDrawnIds.length;
    for (var i = 0; i < len; i++) {
      var id = __mayyaDrawnIds[i];
      if (id) {
        try { deleteDrawingById(id); } catch (err) {}
      }
    }
    __mayyaDrawnIds.length = 0;
  } catch (e) {}
}

/**
 * Menyimpan ID drawing ke dalam tracking list.
 */
function trackDrawing(id) {
  if (!id) return;
  if (typeof __mayyaDrawnIds === 'undefined' || !Array.isArray(__mayyaDrawnIds)) return;
  try {
    __mayyaDrawnIds.push(id);
  } catch (e) {}
}

/**
 * Konversi string Timezone UTC ke menit offset.
 * Contoh: "UTC-5" -> -300 menit, "UTC+7" -> +420 menit
 */
function getTzMinutes(tzStr) {
  if (!tzStr || tzStr === 'UTC+0' || tzStr === 'UTC') return 0;
  const match = String(tzStr).match(/UTC([+-])(\d+)/);
  if (!match) return 0;
  const sign = match[1] === '-' ? -1 : 1;
  const hrs = parseInt(match[2], 10) || 0;
  return sign * hrs * 60;
}

/**
 * Parsing rentang sesi string "HHMM-HHMM" ke menit dalam 1 hari.
 * Contoh: "0000-0800" -> start: 0, end: 480
 */
function parseSessionTime(sessStr) {
  if (!sessStr || typeof sessStr !== 'string' || !sessStr.includes('-')) {
    return { start: 0, end: 480 };
  }
  const parts = sessStr.split('-');
  if (parts.length < 2 || parts[0].length < 4 || parts[1].length < 4) {
    return { start: 0, end: 480 };
  }
  const sH = parseInt(parts[0].slice(0, 2), 10) || 0;
  const sM = parseInt(parts[0].slice(2, 4), 10) || 0;
  const eH = parseInt(parts[1].slice(0, 2), 10) || 0;
  const eM = parseInt(parts[1].slice(2, 4), 10) || 0;
  return {
    start: sH * 60 + sM,
    end: eH * 60 + eM
  };
}

/**
 * Menghitung timestamp UTC awal dan akhir sesi Asia untuk hari ke-dayOffset ke belakang.
 * Menggunakan aritmatika matematis murni (Math.floor) tanpa membuat objek waktu eksternal.
 */
function getSessionUtcRange(baseTimestamp, dayOffset, sessStartMin, sessEndMin, tzOffsetMin) {
  const tzOffsetMs = tzOffsetMin * 60000;
  const ONE_DAY_MS = 86400000;

  // Awal hari (00:00:00) pada timezone yang dipilih
  const dayStartLocal = Math.floor((baseTimestamp + tzOffsetMs) / ONE_DAY_MS) * ONE_DAY_MS;
  const dayStartUtc = dayStartLocal - tzOffsetMs - (dayOffset * ONE_DAY_MS);

  // Waktu mulai & selesai sesi dalam timestamp UTC
  const startUtc = dayStartUtc + (sessStartMin * 60000);
  const endUtc = dayStartUtc + (sessEndMin * 60000);

  return { startUtc, endUtc };
}

/**
 * Memperkirakan durasi timeframe dalam milidetik
 */
function estimateTfDurationMs(tfStr) {
  if (!tfStr) return 4 * 3600 * 1000;
  const s = String(tfStr).toUpperCase();
  if (s.includes('D')) return 24 * 3600 * 1000;
  if (s.includes('W')) return 7 * 24 * 3600 * 1000;
  if (s.includes('M') && !s.includes('15') && !s.includes('30') && !s.includes('5')) return 30 * 24 * 3600 * 1000;
  if (s.includes('H') || s === '60' || s === '120' || s === '240') {
    const hours = parseInt(s.replace('H', ''), 10) || (parseInt(s, 10) / 60) || 4;
    return hours * 3600 * 1000;
  }
  const mins = parseInt(s, 10) || 60;
  return mins * 60 * 1000;
}

// ----------------------------------------------------------------------------
// Main Calculation & Drawing Loop (Called on each bar/tick)
// ----------------------------------------------------------------------------
onTick = (length, _moment, _, ta) => {
  if (length < 2) return;

  // Bersihkan drawing lama setiap ada pembaruan tick
  clearOldDrawings();

  const currentBarTime = time(0);
  if (typeof currentBarTime !== 'number' || isNaN(currentBarTime)) return;

  // ==========================================================================
  // 1. RENDER ASIA RANGE (KALENDER ARITMATIKA MURNI)
  // ==========================================================================
  if (_showAsia) {
    const tzOffsetMin = getTzMinutes(_asiaTz);
    const sessTime = parseSessionTime(_asiaSession);
    const boxColor = _asiaColor || color.gray;
    const boxTransparency = typeof _asiaTransparency === 'number' ? _asiaTransparency : 85;
    const labelTitle = _showLabel ? (_labelText || 'Asia') : undefined;
    const totalDaysToScan = typeof _asiaHistoryCount === 'number' ? Math.max(1, Math.min(30, _asiaHistoryCount)) : 5;

    const boxStyle = {
      color: boxColor,
      backgroundColor: color.rgba(128, 128, 128, 0.15),
      fillBackground: true,
      transparency: boxTransparency,
      linewidth: 1,
      extendRight: false,
      showLabel: Boolean(_showLabel),
      textColor: boxColor,
      fontSize: 11,
      bold: true,
      middleLine: _showMidline
        ? {
            showLine: true,
            lineStyle: 2,
            lineWidth: 1,
            lineColor: boxColor
          }
        : undefined
    };

    // Cari box sesi Asia untuk setiap hari dari hari ini mundur ke belakang
    for (let d = 0; d < totalDaysToScan; d++) {
      const range = getSessionUtcRange(currentBarTime, d, sessTime.start, sessTime.end, tzOffsetMin);
      const startUtc = range.startUtc;
      const endUtc = range.endUtc;

      // Jika sesi hari ini belum mulai sama sekali, abaikan
      if (startUtc > currentBarTime) continue;

      const actualEnd = Math.min(endUtc, currentBarTime);

      let hMax = -Infinity;
      let lMin = Infinity;
      let barCount = 0;

      // Cari bar-bar di chart yang berada di dalam jendela waktu sesi ini
      for (let b = 0; b < length; b++) {
        const bTime = time(b);
        if (typeof bTime !== 'number' || isNaN(bTime)) continue;
        if (bTime < startUtc) break; // Sudah melewati rentang sesi hari ini
        if (bTime <= actualEnd) {
          const bHigh = high(b);
          const bLow = low(b);
          if (typeof bHigh === 'number' && !isNaN(bHigh) && typeof bLow === 'number' && !isNaN(bLow)) {
            if (bHigh > hMax) hMax = bHigh;
            if (bLow < lMin) lMin = bLow;
            barCount++;
          }
        }
      }

      // Jika ada data harga yang valid pada sesi tersebut, gambar box
      if (barCount > 0 && hMax > lMin) {
        const finalEndTime = actualEnd > startUtc ? actualEnd : (startUtc + 60000);
        const boxId = rectangle(
          startUtc,
          hMax,
          finalEndTime,
          lMin,
          boxStyle,
          labelTitle
        );
        trackDrawing(boxId);
      }
    }
  }

  // ==========================================================================
  // 2. RENDER HTF CANDLE (MULTI-TIMEFRAME)
  // ==========================================================================
  if (_showHtf && typeof mtf !== 'undefined' && mtf && typeof mtf.time === 'function') {
    const candlesAmount = typeof _htfCandlesAmount === 'number' ? Math.max(1, _htfCandlesAmount) : 4;
    const isProjected = _htfMode === 'Projected (Kanan Chart)';
    const bullColor = _htfBullColor || color.green;
    const bearColor = _htfBearColor || color.red;
    const wickColor = _htfWickColor || color.black;
    const lineWidth = typeof _htfLineWidth === 'number' ? _htfLineWidth : 1;
    const htfDuration = estimateTfDurationMs(_htfTf);

    // Hitung durasi 1 bar chart saat ini untuk mode Projected
    const barDuration = (time(0) && time(1)) ? Math.abs(time(0) - time(1)) : 60000;
    const offsetBars = typeof _htfOffset === 'number' ? _htfOffset : 5;
    const spaceBars = typeof _htfSpace === 'number' ? _htfSpace : 2;
    const widthBars = typeof _htfWidth === 'number' ? _htfWidth : 4;

    // Loop sejumlah candle HTF dari candle saat ini (i = 0) ke belakang
    for (let i = 0; i < candlesAmount; i++) {
      const htfOpen = mtf.openC(i, false);
      const htfHigh = mtf.high(i, false);
      const htfLow = mtf.low(i, false);
      const htfClose = mtf.closeC(i, false);
      const htfTime = mtf.time(i, false);

      if (typeof htfTime !== 'number' || isNaN(htfTime) ||
          typeof htfOpen !== 'number' || isNaN(htfOpen) ||
          typeof htfClose !== 'number' || isNaN(htfClose) ||
          typeof htfHigh !== 'number' || isNaN(htfHigh) ||
          typeof htfLow !== 'number' || isNaN(htfLow)) {
        continue;
      }

      const isBull = htfClose >= htfOpen;
      const candleColor = isBull ? bullColor : bearColor;
      const bodyTop = Math.max(htfOpen, htfClose);
      const bodyBottom = Math.min(htfOpen, htfClose);

      let startTime = 0;
      let endTime = 0;
      let wickTime = 0;

      if (isProjected) {
        // Mode Projected: Lilin HTF berjejer rapi di sebelah kanan chart
        const candleIndex = candlesAmount - 1 - i;
        const shiftBars = offsetBars + (widthBars + spaceBars) * candleIndex;
        startTime = currentBarTime + (shiftBars * barDuration);
        endTime = startTime + (widthBars * barDuration);
        wickTime = startTime + Math.floor((widthBars * barDuration) / 2);
      } else {
        // Mode Overlay: Lilin HTF digambar persis pada waktu historis candle tersebut
        startTime = htfTime;
        const nextHtfTime = (i > 0) ? mtf.time(i - 1, false) : null;
        endTime = (typeof nextHtfTime === 'number' && nextHtfTime > startTime) ? nextHtfTime : (startTime + htfDuration);
        wickTime = startTime + Math.floor((endTime - startTime) / 2);
      }

      // Label Candle HTF
      let candleLabel = undefined;
      if (_htfShowLabel && i === 0) {
        const tfLabelText = String(_htfTf || 'HTF').toUpperCase();
        candleLabel = tfLabelText;
      }

      // 1. Gambar Body Candle HTF
      const bodyStyle = {
        color: wickColor,
        backgroundColor: candleColor,
        fillBackground: true,
        linewidth: lineWidth,
        transparency: 20,
        showLabel: Boolean(candleLabel),
        textColor: wickColor,
        fontSize: 10,
        bold: true
      };

      const bodyBoxId = rectangle(
        startTime,
        bodyTop,
        endTime,
        bodyBottom,
        bodyStyle,
        candleLabel
      );
      trackDrawing(bodyBoxId);

      // 2. Gambar Sumbu (Wick) Candle HTF
      if (_htfShowWick && typeof newPoint === 'function' && typeof trendLine === 'function') {
        const lineStyle = { linecolor: wickColor, linewidth: lineWidth };

        // Upper Wick (High ke Body Top)
        if (htfHigh > bodyTop) {
          const upperWickId = trendLine(
            newPoint(wickTime, htfHigh),
            newPoint(wickTime, bodyTop),
            lineStyle
          );
          trackDrawing(upperWickId);
        }

        // Lower Wick (Body Bottom ke Low)
        if (htfLow < bodyBottom) {
          const lowerWickId = trendLine(
            newPoint(wickTime, bodyBottom),
            newPoint(wickTime, htfLow),
            lineStyle
          );
          trackDrawing(lowerWickId);
        }
      }

      // 3. Garis Level Tracing ke Chart LTF (H/L Line & O/C Line)
      if (typeof newPoint === 'function' && typeof trendLine === 'function') {
        const traceColor = _htfLineColor || color.gray;

        if (_showHtfHlLines && i < 2) {
          // Garis High
          const hlLineId1 = trendLine(
            newPoint(htfTime, htfHigh),
            newPoint(currentBarTime, htfHigh),
            { linecolor: traceColor, linestyle: 2, linewidth: 1 }
          );
          trackDrawing(hlLineId1);

          // Garis Low
          const hlLineId2 = trendLine(
            newPoint(htfTime, htfLow),
            newPoint(currentBarTime, htfLow),
            { linecolor: traceColor, linestyle: 2, linewidth: 1 }
          );
          trackDrawing(hlLineId2);
        }

        if (_showHtfOcLines && i < 2) {
          // Garis Open
          const ocLineId1 = trendLine(
            newPoint(htfTime, htfOpen),
            newPoint(currentBarTime, htfOpen),
            { linecolor: traceColor, linestyle: 1, linewidth: 1 }
          );
          trackDrawing(ocLineId1);

          // Garis Close
          const ocLineId2 = trendLine(
            newPoint(htfTime, htfClose),
            newPoint(currentBarTime, htfClose),
            { linecolor: traceColor, linestyle: 1, linewidth: 1 }
          );
          trackDrawing(ocLineId2);
        }
      }
    }
  }
};
