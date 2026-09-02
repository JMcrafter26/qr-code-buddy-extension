<script lang="ts">
  import type { QrDataType, QrPayload } from '../../utils/url/data-payload/types';
  import { buildQrData } from '../../utils/url/data-payload/builders';

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
  <label class="label"><span class="label-text font-medium">Data Type</span></label>
  <select class="select select-bordered w-full" bind:value={type}>
    <option value="url">URL</option>
    <option value="text">Text</option>
    <option value="email">Email</option>
    <option value="phone">Phone</option>
    <option value="sms">SMS</option>
    <option value="wifi">WiFi</option>
    <option value="geo">Geo</option>
    <option value="event">Event</option>
  </select>

  {#if type === 'text'}
    <textarea class="textarea textarea-bordered w-full" placeholder="Enter text" bind:value={text}></textarea>
  {:else if type === 'email'}
    <input type="email" class="input input-bordered w-full" placeholder="Enter email" bind:value={email} />
    <input type="text" class="input input-bordered w-full" placeholder="Enter email subject" bind:value={emailSubject} />
    <textarea class="textarea textarea-bordered w-full" placeholder="Enter email body" bind:value={emailBody}></textarea>
  {:else if type === 'phone'}
    <input type="tel" class="input input-bordered w-full" placeholder="Enter phone number" bind:value={phone} />
  {:else if type === 'sms'}
    <input type="tel" class="input input-bordered w-full" placeholder="Enter phone number" bind:value={sms} />
    <textarea class="textarea textarea-bordered w-full" placeholder="Enter SMS message" bind:value={smsMessage}></textarea>
  {:else if type === 'wifi'}
    <input type="text" class="input input-bordered w-full" placeholder="Enter WiFi SSID" bind:value={wifiSsid} />
    <input type="text" class="input input-bordered w-full" placeholder="Enter WiFi password" bind:value={wifiPassword} />
    <select class="select select-bordered w-full" bind:value={wifiType}>
      <option value="WPA">WPA</option>
      <option value="WEP">WEP</option>
      <option value="nopass">No password</option>
    </select>
  {:else if type === 'geo'}
    <input type="text" class="input input-bordered w-full" placeholder="Enter latitude" bind:value={geoLat} />
    <input type="text" class="input input-bordered w-full" placeholder="Enter longitude" bind:value={geoLon} />
  {:else if type === 'event'}
    <input type="text" class="input input-bordered w-full" placeholder="Enter event title" bind:value={eventTitle} />
    <input type="text" class="input input-bordered w-full" placeholder="Enter event location" bind:value={eventLocation} />
    <input type="datetime-local" class="input input-bordered w-full" bind:value={eventDate} />
  {:else if type === 'url'}
    <p class="text-sm opacity-70">Enter URL in the main input above.</p>
  {/if}
</div>
