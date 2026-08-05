/**
 * Dynamic timezone handling utilities using IANA timezone names (e.g. Asia/Makassar)
 */

export function getDateStringInTimezone(date: Date = new Date(), timezone: string = 'Asia/Makassar'): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date); // Returns YYYY-MM-DD
}

export function getDayRangeInTimezone(dateStr: string, timezone: string = 'Asia/Makassar'): { start: Date; end: Date } {
  // Compute offset for the date in target timezone to translate UTC timestamps accurately
  const [y, m, d] = dateStr.split('-').map(Number);
  const tzDate = new Date(Date.UTC(y, m - 1, d, 12, 0, 0, 0)); // Midday UTC

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  }).formatToParts(tzDate);

  const map = new Map(parts.map(p => [p.type, p.value]));
  
  const formattedDate = new Date(
    Date.UTC(
      parseInt(map.get('year')!, 10),
      parseInt(map.get('month')!, 10) - 1,
      parseInt(map.get('day')!, 10),
      parseInt(map.get('hour')!, 10),
      parseInt(map.get('minute')!, 10),
      parseInt(map.get('second')!, 10)
    )
  );

  const offsetMs = formattedDate.getTime() - tzDate.getTime();

  const localStart = Date.UTC(y, m - 1, d, 0, 0, 0, 0);
  const localEnd = Date.UTC(y, m - 1, d, 23, 59, 59, 999);

  return {
    start: new Date(localStart - offsetMs),
    end: new Date(localEnd - offsetMs),
  };
}

// Backwards-compatibility wrapper mapping to Asia/Makassar default or fallback
export function getWibDateString(date: Date = new Date()): string {
  return getDateStringInTimezone(date, 'Asia/Makassar');
}

export function getWibDayRange(dateStr: string): { start: Date; end: Date } {
  return getDayRangeInTimezone(dateStr, 'Asia/Makassar');
}

export function getIsoStringWithOffset(date: Date, timezone: string): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const map = new Map(parts.map(p => [p.type, p.value]));

  const y = map.get('year');
  const m = map.get('month');
  const d = map.get('day');
  const hr = map.get('hour');
  const min = map.get('minute');
  const sec = map.get('second');

  const tzDate = new Date(date.getTime());
  const formattedTzDate = new Date(
    Date.UTC(
      parseInt(y!, 10),
      parseInt(m!, 10) - 1,
      parseInt(d!, 10),
      parseInt(hr!, 10),
      parseInt(min!, 10),
      parseInt(sec!, 10)
    )
  );

  const offsetMinutes = Math.round((formattedTzDate.getTime() - tzDate.getTime()) / 60000);
  const offsetSign = offsetMinutes >= 0 ? '+' : '-';
  const absOffsetMinutes = Math.abs(offsetMinutes);
  const offsetHours = String(Math.floor(absOffsetMinutes / 60)).padStart(2, '0');
  const offsetMinsStr = String(absOffsetMinutes % 60).padStart(2, '0');
  
  return `${y}-${m}-${d}T${hr}:${min}:${sec}${offsetSign}${offsetHours}:${offsetMinsStr}`;
}
