export type QrDataType =
  | 'url'
  | 'text'
  | 'email'
  | 'phone'
  | 'sms'
  | 'wifi'
  | 'geo'
  | 'event'
  | 'contact';

export interface UrlPayload { kind: 'url'; value: string }
export interface TextPayload { kind: 'text'; text: string }
export interface EmailPayload { kind: 'email'; email: string; subject: string; body: string }
export interface PhonePayload { kind: 'phone'; phone: string }
export interface SmsPayload { kind: 'sms'; phone: string; message: string }
export interface WifiPayload { kind: 'wifi'; ssid: string; password: string; encryption: 'WPA' | 'WEP' | 'nopass' }
export interface GeoPayload { kind: 'geo'; lat: string; lon: string }
export interface EventPayload { kind: 'event'; title: string; location: string; date: string }
export interface ContactPayload { kind: 'contact'; name: string; phone: string; email: string }

export type QrPayload =
  | UrlPayload
  | TextPayload
  | EmailPayload
  | PhonePayload
  | SmsPayload
  | WifiPayload
  | GeoPayload
  | EventPayload
  | ContactPayload;
