//@version=1
/**
 * ============================================================================
 * Indikator : Mayya • Asia Range & HTF Candle (FX Replay Edition)
 * Author    : Mayya
 * Versi     : 1.2.0
 * Bahasa    : FXR Script (JavaScript / TypeScript runtime)
 * Platform  : FX Replay (FXR Code Editor v1)
 * ============================================================================
 */

init = () => {
  // Pasang indikator di panel chart utama
  indicator({ onMainPanel: true, format: 'inherit' });

  // --------------------------------------------------------------------------
  // 1. Modul Asia Range Settings
  // --------------------------------------------------------------------------
  input.bool('Tampilkan Asia Range', true, 'showAsia', 'Modul Asia Range');
  input.session('Jam Sesi Asia', '0000-0800', 'asiaSession', 'Modul Asia Range');
  input.str(
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
  input.color('Warna Box Asia', color.gray, 'asiaColor', 'Modul Asia Range');
  input.int('Transparansi Background (%)', 85, 'asiaTransparency', 0, 100, 1, undefined, 'Modul Asia Range');
  input.bool('Tampilkan Garis Tengah (50%)', true, 'showMidline', 'Modul Asia Range');
  input.int('Jumlah Sesi Historis', 5, 'asiaHistoryCount', 1, 30, 1, 'Berapa sesi Asia terakhir yang ditampilkan di chart', 'Modul Asia Range');

  // Label Sesi Asia
  input.bool('Tampilkan Label Sesi', true, 'showLabel', 'Label Asia');
  input.str('Teks Label', 'Asia', 'labelText', undefined, undefined, 'Label Asia');

  // --------------------------------------------------------------------------
  // 2. Modul HTF Candle Settings (Multi-Timeframe)
  // --------------------------------------------------------------------------
  input.bool('Tampilkan HTF Candle', true, 'showHtf', 'Modul HTF Candle');
  
  // Daftarkan timeframe HTF ke runtime MTF FX Replay
  const tm = input.timeframe('HTF Timeframe', '4h', 'htfTf', 'Modul HTF Candle');
  if (typeof mtf !== 'undefined' && mtf && typeof mtf.timeframe === 'function') {
    mtf.timeframe(tm);
  }

  input.int('Jumlah Candle HTF', 4, 'htfCandlesAmount', 1, 15, 1, 'Berapa candle HTF yang ingin ditampilkan', 'Modul HTF Candle');
  input.str(
    'Mode Tampilan HTF',
    'Overlay (Pada Chart)',
    'htfMode',
    ['Overlay (Pada Chart)', 'Projected (Kanan Chart)'],
    undefined,
    'Modul HTF Candle'
  );

  // Pewarnaan & Sumbu HTF
  input.color('Warna Bullish HTF', color.green, 'htfBullColor', 'Styling HTF');
  input.color('Warna Bearish HTF', color.red, 'htfBearColor', 'Styling HTF');
  input.color('Warna Wick / Border HTF', color.black, 'htfWickColor', 'Styling HTF');
  input.bool('Tampilkan Sumbu (Wick)', true, 'htfShowWick', 'Styling HTF');
  input.int('Ketebalan Garis / Sumbu', 1, 'htfLineWidth', 1, 4, 1, undefined, 'Styling HTF');

  // Offset & Posisi (Untuk Mode Projected)
  input.int('Offset Kanan (Bar)', 5, 'htfOffset', 1, 50, 1, 'Jarak candle HTF dari candle terakhir chart', 'Posisi Projected HTF');
  input.int('Spacing Antar Candle (Bar)', 2, 'htfSpace', 1, 10, 1, 'Jarak antar candle HTF', 'Posisi Projected HTF');
  input.int('Lebar Candle (Bar)', 4, 'htfWidth', 1, 20, 1, 'Lebar body candle HTF dalam jumlah bar', 'Posisi Projected HTF');

  // Label HTF
  input.bool('Tampilkan Label HTF', true, 'htfShowLabel', 'Label HTF');
  input.str('Posisi Label HTF', 'Top', 'htfLabelPos', ['Top', 'Bottom', 'Both'], undefined, 'Label HTF');

  // Garis Level HTF ke Chart LTF (Tracing)
  input.bool('Tampilkan Garis H/L HTF di LTF', true, 'showHtfHlLines', 'Level HTF Trace');
  input.bool('Tampilkan Garis O/C HTF di LTF', false, 'showHtfOcLines', 'Level HTF Trace');
  input.color('Warna Garis Level HTF', color.gray, 'htfLineColor', 'Level HTF Trace');
};

// ----------------------------------------------------------------------------
// Global Tracking State (Menampung ID gambar agar bisa dibersihkan & di-update)
// ----------------------------------------------------------------------------
let drawnDrawingIds = [];

/**
 * Membersihkan semua drawing yang pernah dibuat pada tick sebelumnya
 */
function clearOldDrawings() {
  if (typeof deleteDrawingById === 'function' && drawnDrawingIds.length > 0) {
    for (let i = 0; i < drawnDrawingIds.length; i++) {
      try {
        deleteDrawingById(drawnDrawingIds[i]);
      } catch (e) {}
    }
  }
  drawnDrawingIds = [];
}

/**
 * Menyimpan ID drawing ke dalam tracking list
 */
function trackDrawing(id) {
  if (id) {
    drawnDrawingIds.push(id);
  }
}

/**
 * Konversi string Timezone UTC ke menit offset.
 * Contoh: "UTC-5" -> -300 menit, "UTC+7" -> +420 menit
 */
function getTzMinutes(tzStr) {
  if (!tzStr || tzStr === 'UTC+0' || tzStr === 'UTC') return 0;
  const match = tzStr.match(/UTC([+-])(\d+)/);
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
 * Mengecek apakah candle timestamp berada dalam sesi waktu tertentu.
 */
function isTimestampInSession(candleTimestamp, sess, tzOffsetMin, _moment) {
  const m = _moment.utc(candleTimestamp).add(tzOffsetMin, 'minutes');
  const barMinutes = m.hours() * 60 + m.minutes();
  if (sess.start <= sess.end) {
    return barMinutes >= sess.start && barMinutes < sess.end;
  } else {
    // Overnight session (misal: 2000-0200)
    return barMinutes >= sess.start || barMinutes < sess.end;
  }
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
onTick = (length, _moment, _, ta, inputs) => {
  if (length < 2) return;

  // Bersihkan drawing sebelumnya sebelum merender ulang tick saat ini
  clearOldDrawings();

  const currentBarTime = time(0);
  if (!currentBarTime || isNaN(currentBarTime)) return;

  // ==========================================================================
  // 1. RENDER ASIA RANGE (HISTORIS & AKTIF)
  // ==========================================================================
  if (inputs.showAsia) {
    const tzOffset = getTzMinutes(inputs.asiaTz);
    const sess = parseSessionTime(inputs.asiaSession);
    const boxColor = inputs.asiaColor || color.gray;
    const boxTransparency = typeof inputs.asiaTransparency === 'number' ? inputs.asiaTransparency : 85;
    const labelTitle = inputs.showLabel ? (inputs.labelText || 'Asia') : undefined;
    const maxSessionsToKeep = typeof inputs.asiaHistoryCount === 'number' ? inputs.asiaHistoryCount : 5;

    const boxStyle = {
      color: boxColor,
      backgroundColor: color.rgba(128, 128, 128, 0.15),
      fillBackground: true,
      transparency: boxTransparency,
      linewidth: 1,
      extendRight: false,
      showLabel: Boolean(inputs.showLabel),
      textColor: boxColor,
      fontSize: 11,
      bold: true,
      middleLine: inputs.showMidline
        ? {
            showLine: true,
            lineStyle: 2,
            lineWidth: 1,
            lineColor: boxColor
          }
        : undefined
    };

    // Scan bar historis dari masa lalu ke saat ini untuk merekonstruksi sesi Asia
    const maxScan = Math.min(length - 1, 2000);
    const detectedSessions = [];
    let currentSessObj = null;

    for (let i = maxScan; i >= 0; i--) {
      const bTime = time(i);
      const bHigh = high(i);
      const bLow = low(i);
      if (!bTime || isNaN(bHigh) || isNaN(bLow)) continue;

      const inSess = isTimestampInSession(bTime, sess, tzOffset, _moment);

      if (inSess) {
        if (!currentSessObj) {
          currentSessObj = {
            startTime: bTime,
            endTime: bTime,
            high: bHigh,
            low: bLow
          };
        } else {
          currentSessObj.endTime = bTime;
          currentSessObj.high = Math.max(currentSessObj.high, bHigh);
          currentSessObj.low = Math.min(currentSessObj.low, bLow);
        }
      } else {
        if (currentSessObj) {
          detectedSessions.push(currentSessObj);
          currentSessObj = null;
        }
      }
    }

    if (currentSessObj) {
      detectedSessions.push(currentSessObj);
    }

    // Ambil sejumlah sesi terakhir sesuai setting asiaHistoryCount
    const sessionsToDraw = detectedSessions.slice(-maxSessionsToKeep);

    for (let s = 0; s < sessionsToDraw.length; s++) {
      const item = sessionsToDraw[s];
      if (item.startTime && item.endTime && item.high > item.low) {
        const boxId = rectangle(
          item.startTime,
          item.high,
          item.endTime,
          item.low,
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
  if (inputs.showHtf && typeof mtf !== 'undefined' && mtf && typeof mtf.time === 'function') {
    const candlesAmount = typeof inputs.htfCandlesAmount === 'number' ? Math.max(1, inputs.htfCandlesAmount) : 4;
    const isProjected = inputs.htfMode === 'Projected (Kanan Chart)';
    const bullColor = inputs.htfBullColor || color.green;
    const bearColor = inputs.htfBearColor || color.red;
    const wickColor = inputs.htfWickColor || color.black;
    const lineWidth = typeof inputs.htfLineWidth === 'number' ? inputs.htfLineWidth : 1;
    const htfDuration = estimateTfDurationMs(inputs.htfTf);

    // Hitung durasi 1 bar chart saat ini untuk mode Projected
    const barDuration = Math.abs(time(0) - time(1)) || 60000;
    const offsetBars = typeof inputs.htfOffset === 'number' ? inputs.htfOffset : 5;
    const spaceBars = typeof inputs.htfSpace === 'number' ? inputs.htfSpace : 2;
    const widthBars = typeof inputs.htfWidth === 'number' ? inputs.htfWidth : 4;

    // Loop sejumlah candle HTF dari candle saat ini (i = 0) ke belakang
    for (let i = 0; i < candlesAmount; i++) {
      const htfOpen = mtf.openC(i, false);
      const htfHigh = mtf.high(i, false);
      const htfLow = mtf.low(i, false);
      const htfClose = mtf.closeC(i, false);
      const htfTime = mtf.time(i, false);

      if (!htfTime || isNaN(htfOpen) || isNaN(htfClose) || isNaN(htfHigh) || isNaN(htfLow)) {
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
        // i = 0 adalah candle terbaru di paling kiri susunan projected, atau sebaliknya
        const candleIndex = candlesAmount - 1 - i;
        const shiftBars = offsetBars + (widthBars + spaceBars) * candleIndex;
        startTime = currentBarTime + (shiftBars * barDuration);
        endTime = startTime + (widthBars * barDuration);
        wickTime = startTime + Math.floor((widthBars * barDuration) / 2);
      } else {
        // Mode Overlay: Lilin HTF digambar persis pada waktu historis candle tersebut
        startTime = htfTime;
        const nextHtfTime = (i > 0) ? mtf.time(i - 1, false) : null;
        endTime = nextHtfTime && nextHtfTime > startTime ? nextHtfTime : (startTime + htfDuration);
        wickTime = startTime + Math.floor((endTime - startTime) / 2);
      }

      // Label Candle HTF
      let candleLabel = undefined;
      if (inputs.htfShowLabel && i === 0) {
        const tfLabelText = String(inputs.htfTf || 'HTF').toUpperCase();
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
      if (inputs.htfShowWick && typeof newPoint === 'function' && typeof trendLine === 'function') {
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
        const traceColor = inputs.htfLineColor || color.gray;

        if (inputs.showHtfHlLines && i < 2) {
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

        if (inputs.showHtfOcLines && i < 2) {
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
