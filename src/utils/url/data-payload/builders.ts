import type { QrPayload } from './types';

// cspell:ignore SMSTO VCALENDAR VEVENT DTSTART VCARD PRODID
export function buildQrData(payload: QrPayload): string {
  switch (payload.kind) {
    case 'url':
      return payload.value;
    case 'text':
      return payload.text;
    case 'email':
      return `mailto:${payload.email}?subject=${encodeURIComponent(payload.subject)}&body=${encodeURIComponent(payload.body)}`;
    case 'phone':
      return `tel:${payload.phone}`;
    case 'sms':
      return `SMSTO:${payload.phone}:${escapeSmsText(payload.message)}`;
    case 'wifi':
      return `WIFI:S:${escapeWifiValue(payload.ssid)};T:${payload.encryption};P:${escapeWifiValue(payload.password)};;`;
    case 'geo':
      return `geo:${payload.lat},${payload.lon}`;
    case 'event':
      return `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//QR Code Buddy//EN\nBEGIN:VEVENT\nSUMMARY:${escapeCalendarText(payload.title)}\nLOCATION:${escapeCalendarText(payload.location)}\nDTSTART:${formatCalendarDate(payload.date)}\nEND:VEVENT\nEND:VCALENDAR`;
    case 'contact':
      return `BEGIN:VCARD\nVERSION:3.0\nN:${escapeVCardText(payload.name)};;;\nFN:${escapeVCardText(payload.name)}\nTEL;TYPE=CELL:${payload.phone}\nEMAIL:${payload.email}\nEND:VCARD`;
    default:
      return '';
  }
}

function escapeSmsText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\r\n?|\n/g, '\\n');
}

function escapeWifiValue(value: string): string {
  return value.replace(/([\\;,":])/g, '\\$1');
}

function escapeCalendarText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/([;,])/g, '\\$1')
    .replace(/\r\n?|\n/g, '\\n');
}

function escapeVCardText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/([,;])/g, '\\$1')
    .replace(/\r\n?|\n/g, '\\n');
}

function formatCalendarDate(value: string): string {
  const localDate =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value);
  if (localDate) {
    const [, year, month, day, hours, minutes, seconds = '00'] = localDate;
    return `${year}${month}${day}T${hours}${minutes}${seconds}`;
  }
  if (/^\d{8}T\d{6}Z?$/.test(value)) return value;
  return value;
}
