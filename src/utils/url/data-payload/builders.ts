import type { QrPayload } from './types';

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
      return `SMSTO:${payload.phone}:${payload.message}`;
    case 'wifi':
      return `WIFI:S:${payload.ssid};T:${payload.encryption};P:${payload.password};;`;
    case 'geo':
      return `geo:${payload.lat},${payload.lon}`;
    case 'event':
      return `BEGIN:VCAL\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${payload.title}\nLOCATION:${payload.location}\nDTSTART:${payload.date}\nEND:VEVENT\nEND:VCAL`;
    case 'contact':
      return `BEGIN:VCARD\nVERSION:3.0\nN:${payload.name};;;\nFN:${payload.name}\nTEL;TYPE=CELL:${payload.phone}\nEMAIL:${payload.email}\nEND:VCARD`;
    default:
      return '';
  }
}
