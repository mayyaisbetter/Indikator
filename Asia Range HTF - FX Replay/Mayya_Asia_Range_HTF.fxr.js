//@version=1
/**
 * ============================================================================
 * Indicator : Mayya • Asia Range & HTF Candle (FX Replay Edition)
 * Author    : Mayya
 * Language  : FXR Script (JavaScript / TypeScript runtime)
 * Platform  : FX Replay (FXR Code Editor v1)
 * ============================================================================
 */

init = () => {
  // Pasang indikator di panel chart utama
  indicator({ onMainPanel: true, format: 'inherit' });

  // --------------------------------------------------------------------------
  // Asia Range Settings
  // --------------------------------------------------------------------------
  input.bool('Aktifkan Asia Range', true, 'showAsia', 'Asia Range');
  input.session('Jam Sesi Asia', '0000-0800', 'asiaSession');
  input.str(
    'Timezone',
    'UTC+0',
    'asiaTz',
    [
      'UTC-12', 'UTC-11', 'UTC-10', 'UTC-9', 'UTC-8', 'UTC-7', 'UTC-6', 'UTC-5', 'UTC-4', 'UTC-3', 'UTC-2', 'UTC-1',
      'UTC+0', 'UTC+1', 'UTC+2', 'UTC+3', 'UTC+4', 'UTC+5', 'UTC+6', 'UTC+7', 'UTC+8', 'UTC+9', 'UTC+10', 'UTC+11', 'UTC+12'
    ],
    undefined,
    'Asia Range'
  );
  input.color('Warna Box Asia', color.gray, 'asiaColor', 'Asia Range');
  input.int('Transparansi Background (%)', 85, 'asiaTransparency', 0, 100, 1, undefined, 'Asia Range');
  input.bool('Tampilkan Garis Tengah (50%)', true, 'showMidline', 'Asia Range');

  // --------------------------------------------------------------------------
  // Label Settings
  // --------------------------------------------------------------------------
  input.bool('Tampilkan Label', true, 'showLabel', 'Label Sesi');
  input.str('Teks Label', 'Asia', 'labelText', undefined, undefined, 'Label Sesi');

  // --------------------------------------------------------------------------
  // HTF Candle Settings (Multi-Timeframe)
  // --------------------------------------------------------------------------
  input.bool('Tampilkan HTF Candle', false, 'showHtf', 'HTF Candle');
  input.timeframe('HTF Timeframe', '4h', 'htfTf', 'HTF Candle');
  if (typeof mtf !== 'undefined' && mtf && typeof mtf.timeframe === 'function') {
    mtf.timeframe('4h');
  }
  input.color('Warna Bullish HTF', color.green, 'htfBullColor', 'HTF Candle');
  input.color('Warna Bearish HTF', color.red, 'htfBearColor', 'HTF Candle');
};

// ----------------------------------------------------------------------------
// Global Tracking State (Persists across onTick invocations)
// ----------------------------------------------------------------------------
let currentSession = null;
let activeBoxId = null;
let lastHtfBarTime = null;

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

// ----------------------------------------------------------------------------
// Main Calculation & Drawing Loop (Called on each bar/tick)
// ----------------------------------------------------------------------------
onTick = (length, _moment, _, ta, inputs) => {
  if (length < 2) return;

  const currentBarTime = time(0);
  const currentHigh = high(0);
  const currentLow = low(0);
  const currentClose = closeC(0);

  if (isNaN(currentBarTime) || isNaN(currentHigh) || isNaN(currentLow)) {
    return;
  }

  // 1. Logika Sesi Asia Range
  if (inputs.showAsia) {
    const tzOffset = getTzMinutes(inputs.asiaTz);
    const sess = parseSessionTime(inputs.asiaSession);
    const inSess = isTimestampInSession(currentBarTime, sess, tzOffset, _moment);

    const boxColor = inputs.asiaColor || color.gray;
    const boxTransparency = typeof inputs.asiaTransparency === 'number' ? inputs.asiaTransparency : 85;
    const labelTitle = inputs.showLabel ? (inputs.labelText || 'Asia') : undefined;

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

    if (inSess) {
      if (!currentSession) {
        // Sesi baru dimulai
        currentSession = {
          startTime: currentBarTime,
          endTime: currentBarTime,
          high: currentHigh,
          low: currentLow
        };
      } else {
        // Update high & low selama sesi berlangsung
        currentSession.high = Math.max(currentSession.high, currentHigh);
        currentSession.low = Math.min(currentSession.low, currentLow);
        currentSession.endTime = currentBarTime;
      }

      // Update box live selama sesi aktif
      if (typeof deleteDrawingById === 'function' && activeBoxId) {
        try {
          deleteDrawingById(activeBoxId);
        } catch (e) {}
      }

      activeBoxId = rectangle(
        currentSession.startTime,
        currentSession.high,
        currentSession.endTime,
        currentSession.low,
        boxStyle,
        labelTitle
      );
    } else {
      // Sesi telah selesai
      if (currentSession) {
        if (typeof deleteDrawingById === 'function' && activeBoxId) {
          try {
            deleteDrawingById(activeBoxId);
          } catch (e) {}
        }

        rectangle(
          currentSession.startTime,
          currentSession.high,
          currentSession.endTime,
          currentSession.low,
          boxStyle,
          labelTitle
        );

        activeBoxId = null;
        currentSession = null;
      }
    }
  }

  // 2. Logika Multi-Timeframe (HTF Candle Overlay)
  if (inputs.showHtf && typeof mtf !== 'undefined' && mtf && typeof mtf.time === 'function') {
    const htfTime = mtf.time(0);
    if (htfTime && htfTime !== lastHtfBarTime) {
      lastHtfBarTime = htfTime;
      const prevHtfOpen = mtf.openC(1, false);
      const prevHtfHigh = mtf.high(1, false);
      const prevHtfLow = mtf.low(1, false);
      const prevHtfClose = mtf.closeC(1, false);
      const prevHtfTime = mtf.time(1);

      if (!isNaN(prevHtfOpen) && !isNaN(prevHtfClose) && prevHtfTime) {
        const isBull = prevHtfClose >= prevHtfOpen;
        const candleColor = isBull
          ? (inputs.htfBullColor || color.green)
          : (inputs.htfBearColor || color.red);

        // Body Candle HTF
        rectangle(
          prevHtfTime,
          Math.max(prevHtfOpen, prevHtfClose),
          htfTime,
          Math.min(prevHtfOpen, prevHtfClose),
          {
            color: candleColor,
            backgroundColor: isBull ? color.rgba(0, 200, 100, 0.2) : color.rgba(255, 70, 70, 0.2),
            fillBackground: true,
            linewidth: 1,
            transparency: 80,
            showLabel: true,
            textColor: candleColor,
            fontSize: 10,
            bold: true
          },
          'HTF Candle'
        );

        // Sumbu Candle HTF
        if (typeof newPoint === 'function' && typeof trendLine === 'function') {
          trendLine(
            newPoint(prevHtfTime, prevHtfHigh),
            newPoint(prevHtfTime, Math.max(prevHtfOpen, prevHtfClose)),
            { linecolor: candleColor, linewidth: 1 }
          );
          trendLine(
            newPoint(prevHtfTime, Math.min(prevHtfOpen, prevHtfClose)),
            newPoint(prevHtfTime, prevHtfLow),
            { linecolor: candleColor, linewidth: 1 }
          );
        }
      }
    }
  }
};
