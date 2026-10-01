<!-- markdownlint-disable MD033 -->
<!-- markdownlint-disable MD041 -->
<div align="center">
 <br />
 <p>
  <a href="#badges"><img src="./public/icon-256.png" width="256" alt="QR Code Buddy"/></a>
 </p>
 <h1>QR Code Buddy</h1>
 <p id="badges">
 <a href="https://chrome.google.com/webstore/detail/qr-code-buddy/ekmddmgodfefpfpgglaiphhelggfpife"><img alt="Chrome Web Store" src="https://cdn.jsdelivr.net/gh/JMcrafter26/badges@main/src/assets/available/chrome-web-store/cozy.svg" /></a>
 <a href="https://addons.mozilla.org/en-US/firefox/addon/qr-code-buddy/"><img alt="Firefox Add-ons" src="https://cdn.jsdelivr.net/gh/JMcrafter26/badges@main/src/assets/available/firefox-addons/cozy.svg" /></a>
 <a href="https://microsoftedge.microsoft.com/addons/detail/qr-code-buddy/likcomgjkmhmefbhmjkimgnhlenaegcf/"><img alt="Microsoft Edge Add-ons" src="https://cdn.jsdelivr.net/gh/JMcrafter26/badges@main/src/assets/available/edge-addons/cozy.svg"/></a>
 <a href="https://addons.opera.com/en/extensions/details/qr-code-buddy/"><img alt="Opera Add-ons" src="https://cdn.jsdelivr.net/gh/JMcrafter26/badges@main/src/assets/available/opera-addons/cozy.svg"></a>
 </p>
 <p>
  <img alt="Version" src="https://img.shields.io/github/v/release/JMcrafter26/qr-code-buddy-extension?include_prereleases">
  <img alt="GitHub Stars" src="https://img.shields.io/github/stars/JMcrafter26/qr-code-buddy-extension">
  <img alt="GitHub License" src="https://img.shields.io/github/license/JMcrafter26/qr-code-buddy-extension">
 </p>
</div>

A lightweight, privacy-focused browser extension for generating, customizing, and downloading QR codes directly from your browser.

## Features

- **Instant Generation:** Create QR codes for the current tab's URL with a single click.
- **Context Menu Integration:** Generate QR codes directly from right-click menus.
- **Privacy First:** Zero tracking, zero analytics, and fully offline generation.
- **URL Optimization:** Automatically strip tracking parameters from URLs and optionally shorten them before generating.
- **Extensive Customization:** Modify colors, add custom logos, and adjust edge styles.
- **Export Options:** Download the generated QR code as an image file.
- **Clean UI:** Simple, modern, and accessible interface.

## Installation

### Official Stores

<!-- [![Chrome Web Store](https://cdn.jsdelivr.net/gh/JMcrafter26/badges@main/src/assets/available/chrome-web-store/cozy.svg)](https://chromewebstore.google.com/detail/qr-code-buddy/ekmddmgodfefpfpgglaiphhelggfpife/) [![Firefox Add-ons](https://cdn.jsdelivr.net/gh/JMcrafter26/badges@main/src/assets/available/firefox-addons/cozy.svg)](https://addons.mozilla.org/en-US/firefox/addon/qr-code-buddy/) [![Microsoft Edge Add-ons](https://cdn.jsdelivr.net/gh/JMcrafter26/badges@main/src/assets/available/edge-addons/cozy.svg)](https://microsoftedge.microsoft.com/addons/detail/qr-code-buddy/likcomgjkmhmefbhmjkimgnhlenaegcf/) [![Opera Add-ons](https://cdn.jsdelivr.net/gh/JMcrafter26/badges@main/src/assets/available/opera-addons/cozy.svg)](https://addons.opera.com/en/extensions/details/qr-code-buddy/) -->

The easiest way to install QR Code Buddy is through your browser's official extension store using the badges [above](#badges).

### Manual Installation (From GitHub)

If you prefer to sideload the extension or test the latest beta:

1. Download the source code from the [latest release](https://github.com/JMcrafter26/qr-code-buddy-extension/releases/latest) and extract the files to a local directory.
2. Navigate to your browser's extension management page:

- **Chrome:** `chrome://extensions/`
- **Firefox:** `about:addons`
- **Edge:** `edge://extensions/`
- **Opera:** `opera://extensions/`

1. Enable **Developer mode** (usually a toggle in the top right corner).
2. Click **Load unpacked** (or "Load Temporary Add-on" in Firefox) and select the extracted folder.

## Usage

1. Click the QR Code Buddy icon in your browser toolbar.
2. A QR code for your current active tab will instantly generate.
3. Use the settings panel in the popup to customize colors, add a logo, or strip URL parameters.
4. Click the download button to save the QR code to your device.

## Screenshots

_(Screenshots coming soon)_

## Local Development

### Prerequisites

- Node.js
- pnpm (recommended)

### Setup & Scripts

Clone the repository and install dependencies:

```bash
pnpm install
pnpm postinstall
```

Start the development server with Hot Module Replacement (HMR):

```bash
# Default (usually Chrome)
pnpm dev

# Specific browsers
pnpm dev:firefox
pnpm dev:chrome
pnpm dev:edge
```

Build for production:

```bash
# Build all targeted browsers
pnpm build

# Package into publishable zip files
pnpm zip
```

Code quality and formatting:

```bash
pnpm check   # Run Svelte type-checking
pnpm lint    # Run ESLint and Prettier check
pnpm format  # Auto-format codebase
```

## License and Credits

This project is open-source and licensed under the **GNU GPL v2 License**. See the [LICENSE](LICENSE) file for complete details.

- QR code generation is powered by [qr-code-styling](https://github.com/kozakdenys/qr-code-styling)
- Icons are provided by [Lucide](https://lucide.dev/)
- Cleaning URLs of tracking parameters is powered by [ClearURLs](https://github.com/ClearURLs/rules)
- The extension is built using **WXT**, **Svelte 5**, **Tailwind CSS**, and **DaisyUI 5**.
- Special thanks to [@JMcrafter26](https://github.com/JMcrafter26) - (me :\) ) for creating and maintaining this project.
