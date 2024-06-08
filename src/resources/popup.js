let canvas = document.getElementById("canvas");
let download = document.getElementById("download");
function getSettings() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(null, (items) => {
      // if there are no settings, open the settings page
      if (Object.keys(items).length === 0) {
        chrome.runtime.openOptionsPage();
        return;
      }
      window.QRsettings = items;
      resolve(window.QRsettings);
      generate();
    });
  });
}

function qrOptions(url) {
  if (QRsettings.cleanUrl) {
    url = removeTrackersFromUrl(url, ALL_TRACKERS);
    document.getElementById("url").value = url;
  }
  if (
    QRsettings.urlShortener != "none" &&
    QRsettings.urlShortener != undefined
  ) {
    url = getShortUrl(url, QRsettings.urlShortener, QRsettings.api_key);
    document.getElementById("url").value = url;
  }
  let options = {
    width: 280,
    height: 280,
    type: "canvas",
    data: url,

    dotsOptions: {
      color: "#161f27",
      type: "rounded",
    },
    backgroundOptions: {
      color: "#efefef",
    },
    imageOptions: {
      crossOrigin: "anonymous",
      margin: 5,
    },
  };
  if (window.QRsettings.logo) {
    options.image = window.QRsettings.logo;
  }
  if (window.QRsettings.type) {
    options.dotsOptions.type = window.QRsettings.type;
  }
  if (window.QRsettings.color) {
    options.dotsOptions.color = window.QRsettings.color;
  }
  if (window.QRsettings.background) {
    options.backgroundOptions.color = window.QRsettings.background;
  }
  return options;
}

function generate() {
  if (document.getElementById("url").value == "") {
    if (!canvas.classList.contains("placeholder")) {
      canvas.classList.add("placeholder");
    }
    if (canvas.classList.contains("qr-code-canvas")) {
      canvas.classList.remove("qr-code-canvas");
    }
    canvas.innerHTML = "";
    return;
  }
  const qrCode = new QRCodeStyling(
    qrOptions(document.getElementById("url").value)
  );

  if (canvas.classList.contains("placeholder")) {
    canvas.classList.remove("placeholder");
    canvas.classList.remove("placeholderAnimation");
  }
  if (!canvas.classList.contains("qr-code-canvas")) {
    canvas.classList.add("qr-code-canvas");
  }
  // replace canvas
  canvas.innerHTML = "";
  qrCode.append(canvas);
}

// on click download
document.getElementById("download").addEventListener("click", function () {
  let url = document.getElementById("url").value;
  let options = qrOptions(url);
  options.width = 500;
  options.height = 500;

  const qrCode = new QRCodeStyling(options);
  if (url.includes("http")) {
    const hostname = new URL(url).hostname;
    const path = new URL(url).pathname;
    qrCode.download({ name: "qr-" + hostname + path, extension: "png" });
  } else {
    qrCode.download({ name: "qr-code", extension: window.QRsettings.format });
  }
});

document.getElementById("settings").addEventListener("click", function () {
  chrome.runtime.openOptionsPage();
});

document.getElementById("url").addEventListener("input", function () {
  console.log("input");
  generate();
});

// on dom content loaded
document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("popup")) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      document.getElementById("url").value = tabs[0].url;
      getSettings();
    });
  } else {
    // get ?url= parameter
    const url = new URLSearchParams(window.location.search).get("url");
    if (!url) {
      document.getElementById("url").value = 'https://www.google.com';
    } else {
      document.getElementById("url").value = url;
    }
    getSettings();
  }
});
