# Privacy Policy for QR Code Buddy

QR Code Buddy is an open-source browser extension built with privacy first. By default, it operates completely offline inside your browser.

## The Short Version

* **No tracking:** I don't collect, log, or sell your data.
* **Offline by default:** QR code generation happens locally on your device.
* **Opt-in network access:** External URL shorteners are only contacted if you explicitly enable them.

## URL Shortening (Opt-In Only)

Link shortening is completely optional. If you choose to enable it, the URL you want to shorten is sent to the specific service you selected:

* **Bitly:** Uses your personal Bitly API key. Requests are handled under Bitly's privacy terms.
* **TinyURL:** Requests are handled under TinyURL's privacy terms.

*Note:* Making an API call to any service means that provider sees standard web request metadata (like your IP address), exactly like visiting a web page.

## Local Storage

Your extension settings and API keys stay on your machine using `browser.storage.local`. They are never synced to an external server or shared with third parties.

## GDPR & Legal Basis

* **Legal Basis:** Transmitting links for shortening relies on your explicit consent (Art. 6(1)(a) GDPR), triggered when you toggle the feature on.
* **Your Rights:** You can revoke consent at any time by turning off link shortening or clearing your API key. Because standard offline extension usage collects zero data, there are no tracking records to export, modify, or delete. You retain the statutory right to lodge a complaint with your local Data Protection Supervisory Authority.

## Open Source

You don't have to take my word for any of this. The extension is Free and Open Source Software (FOSS), meaning you can inspect the code and audit the network activity yourself.

## Contact & Controller Details

* **Data Controller:** JMcrafter26
* **Email:** <tricky-supply-dime+qrbuddyprivacy@duck.com>
* **Repository:** <https://github.com/JMcrafter26/qr-code-buddy-extension>
