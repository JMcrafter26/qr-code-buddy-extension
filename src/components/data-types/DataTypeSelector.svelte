<script lang="ts">
  import type { QrDataType, QrPayload } from '../../utils/url/data-payload/types';
  import { buildQrData } from '../../utils/url/data-payload/builders';
  import { m } from '@/paraglide/messages.js';

  let { type = $bindable('url'), onDataChange }: { type: QrDataType; onDataChange: (data: string) => void } = $props();

  // Fields
  let text = $state('');
  let email = $state('');
  let emailSubject = $state('');
  let emailBody = $state('');
  let phone = $state('');
  let sms = $state('');
  let smsMessage = $state('');
  let wifiSsid = $state('');
  let wifiPassword = $state('');
  let wifiType: 'WPA' | 'WEP' | 'nopass' = $state('WPA');
  let geoLat = $state('');
  let geoLon = $state('');
  let eventTitle = $state('');
  let eventLocation = $state('');
  let eventDate = $state('');

  function emit() {
    let payload: QrPayload | null = null;
    switch (type) {
      case 'url':
        // url handled by parent input directly, no emit
        return;
      case 'text':
        payload = { kind: 'text', text };
        break;
      case 'email':
        payload = { kind: 'email', email, subject: emailSubject, body: emailBody };
        break;
      case 'phone':
        payload = { kind: 'phone', phone };
        break;
      case 'sms':
        payload = { kind: 'sms', phone: sms, message: smsMessage };
        break;
      case 'wifi':
        payload = { kind: 'wifi', ssid: wifiSsid, password: wifiPassword, encryption: wifiType };
        break;
      case 'geo':
        payload = { kind: 'geo', lat: geoLat, lon: geoLon };
        break;
      case 'event':
        payload = { kind: 'event', title: eventTitle, location: eventLocation, date: eventDate };
        break;
      case 'contact':
        // Not in selector but keep for completeness
        return;
    }
    if (payload) onDataChange(buildQrData(payload));
  }

  $effect(() => {
    void text; void email; void emailSubject; void emailBody; void phone; void sms; void smsMessage;
    void wifiSsid; void wifiPassword; void wifiType; void geoLat; void geoLon;
    void eventTitle; void eventLocation; void eventDate; void type;
    if (type !== 'url') emit();
  });
</script>

<div class="form-control w-full gap-2">
  <label class="label" for="dataTypeSelector"><span class="label-text font-medium">{m['dataTypes.label']()}</span></label>
  <select class="select select-bordered w-full" bind:value={type} id="dataTypeSelector">
    <option value="url">{m['dataTypes.options.url']()}</option>
    <option value="text">{m['dataTypes.options.text']()}</option>
    <option value="email">{m['dataTypes.options.email']()}</option>
    <option value="phone">{m['dataTypes.options.phone']()}</option>
    <option value="sms">{m['dataTypes.options.sms']()}</option>
    <option value="wifi">{m['dataTypes.options.wifi']()}</option>
    <option value="geo">{m['dataTypes.options.geo']()}</option>
    <option value="event">{m['dataTypes.options.event']()}</option>
  </select>

  {#if type === 'text'}
    <textarea class="textarea textarea-bordered w-full" placeholder={m['dataTypes.fields.text']()} bind:value={text}></textarea>
  {:else if type === 'email'}
    <input type="email" class="input input-bordered w-full" placeholder={m['dataTypes.fields.email.address']()} bind:value={email} />
    <input type="text" class="input input-bordered w-full" placeholder={m['dataTypes.fields.email.subject']()} bind:value={emailSubject} />
    <textarea class="textarea textarea-bordered w-full" placeholder={m['dataTypes.fields.email.body']()} bind:value={emailBody}></textarea>
  {:else if type === 'phone'}
    <input type="tel" class="input input-bordered w-full" placeholder={m['dataTypes.fields.phone.number']()} bind:value={phone} />
  {:else if type === 'sms'}
    <input type="tel" class="input input-bordered w-full" placeholder={m['dataTypes.fields.sms.number']()} bind:value={sms} />
    <textarea class="textarea textarea-bordered w-full" placeholder={m['dataTypes.fields.sms.message']()} bind:value={smsMessage}></textarea>
  {:else if type === 'wifi'}
    <input type="text" class="input input-bordered w-full" placeholder={m['dataTypes.fields.wifi.ssid']()} bind:value={wifiSsid} />
    <input type="text" class="input input-bordered w-full" placeholder={m['dataTypes.fields.wifi.password']()} bind:value={wifiPassword} />
    <select class="select select-bordered w-full" bind:value={wifiType}>
      <option value="WPA">{m['dataTypes.fields.wifi.encryption.wpa']()}</option>
      <option value="WEP">{m['dataTypes.fields.wifi.encryption.wep']()}</option>
      <option value="nopass">{m['dataTypes.fields.wifi.encryption.none']()}</option>
    </select>
  {:else if type === 'geo'}
    <input type="text" class="input input-bordered w-full" placeholder={m['dataTypes.fields.geo.latitude']()} bind:value={geoLat} />
    <input type="text" class="input input-bordered w-full" placeholder={m['dataTypes.fields.geo.longitude']()} bind:value={geoLon} />
  {:else if type === 'event'}
    <input type="text" class="input input-bordered w-full" placeholder={m['dataTypes.fields.event.title']()} bind:value={eventTitle} />
    <input type="text" class="input input-bordered w-full" placeholder={m['dataTypes.fields.event.location']()} bind:value={eventLocation} />
    <input type="datetime-local" class="input input-bordered w-full" bind:value={eventDate} />
  {:else if type === 'url'}
    <p class="text-sm opacity-70">{m['dataTypes.urlHint']()}</p>
  {/if}
</div>
