function getSettings() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(null, (items) => {
      settings = items;
      resolve(settings);
      loadSettings(settings);
    });
  });
}

function loadSettings(settings) {

  // set the settings on the page
  if (settings.type) {
    document.getElementById("type").value = settings.type;
  }
  if (settings.color) {
    document.getElementById("color").value = settings.color;
  }
  if (settings.background) {
    document.getElementById("background").value = settings.background;
  }
  if (settings.cleanUrl) {
    document.getElementById("cleanUrl").checked = settings.cleanUrl;
  }
  if (settings.format) {
    document.getElementById("format").value = settings.format;
  }
  if (settings.logo) {
    document.getElementById("logo").value = settings.logo;
  }
  if (settings.urlShortener) {
    document.getElementById("urlShortener").value = settings.urlShortener;
    if (settings.urlShortener == 'bitly') {
      document.getElementById("urlShortenerKey").classList.remove("hidden");
      document.getElementById("urlShortenerKey").disabled = false;
      document.getElementById("urlShortenerWarning").classList.remove("hidden");
    }
  }
  if (settings.api_key) {
    document.getElementById("urlShortenerKey").value = settings.api_key;
  }

  //   if settings is empty, set the default settings
  if (Object.keys(settings).length === 0) {
    console.log("No settings found, setting defaults");
    document.getElementById("cleanUrl").checked = true;
    saveSettings();
  } else {
    console.log("Settings loaded");
  }
}

function saveSettings() {
  var settings = {
    type: document.getElementById("type").value,
    color: document.getElementById("color").value,
    background: document.getElementById("background").value,
    cleanUrl: document.getElementById("cleanUrl").checked,
    format: document.getElementById("format").value,
    logo: document.getElementById("logo").value,
    urlShortener: document.getElementById("urlShortener").value,
    api_key: document.getElementById("urlShortenerKey").value,
  };
  // loop through the settings and save them using the setSetting function
  for (var key in settings) {
    setSetting(key, settings[key]);
  }
  console.log("Settings saved");

  // warn, if color is not very visible compared to background
  let color = document.getElementById("color").value;
  let background = document.getElementById("background").value;
  let contrast = getContrastRatio(color, background);
  if (contrast < 1.4) {
    document.getElementById("colorWarning").classList.remove("hidden");
  } else {
    document.getElementById("colorWarning").classList.add("hidden");
  }

  if (settings.urlShortener == 'bitly') {
    document.getElementById("urlShortenerKey").classList.remove("hidden");
    document.getElementById("urlShortenerKey").disabled = false;
    document.getElementById("urlShortenerWarning").classList.remove("hidden");
    document.getElementById("urlShortenerKey").focus();
  } else {
    document.getElementById("urlShortenerKey").classList.add("hidden");
    document.getElementById("urlShortenerKey").disabled = true;
    document.getElementById("urlShortenerWarning").classList.add("hidden");
  }
}

function getContrastRatio(color1, color2) {
  let lum1 = getLuminance(color1);
  let lum2 = getLuminance(color2);
  // check which color is lighter
  let light = lum1 > lum2 ? lum1 : lum2;
  let dark = lum1 > lum2 ? lum2 : lum1;
  let ratio = (light + 0.05) / (dark + 0.05);

  console.log("Contrast ratio: " + ratio);
  return ratio;
}

function getLuminance(color) {
  let rgb = hexToRgb(color);
  let lum = 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b;
  return lum;
}

function hexToRgb(hex) {
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function (m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    }
    : null;
}

function resetSettings() {
  chrome.storage.local.clear();
  location.reload();
}

function cleanUrl() {
  let dirtyUrl = document.getElementById('dirtyUrl').value;
  let cleanUrl = removeTrackersFromUrl(dirtyUrl, ALL_TRACKERS);
  document.getElementById('dirtyUrl').value = cleanUrl;
}

function exportSettings() {
  chrome.storage.local.get(null, (items) => {
    var settings = JSON.stringify(items);
    document.getElementById("importExport").value = settings;
  });
}

function importSettings() {
  var settings = document.getElementById("importExport").value;
  if (settings == "") {
    console.log("No settings to import");
    return;
  }
  chrome.storage.local.clear();
  chrome.storage.local.set(JSON.parse(settings), function () {
    console.log("Settings imported");
    location.reload();
  });
}

// document.getElementById("save").addEventListener("click", saveSettings);
document.getElementById("reset").addEventListener("click", resetSettings);
document.getElementById("cleanBtn").addEventListener("click", cleanUrl);
document.getElementById("export").addEventListener("click", exportSettings);
document.getElementById("import").addEventListener("click", importSettings);

document.addEventListener("DOMContentLoaded", function () {
  const elements = document.querySelectorAll("[data-eventlistener='true']");
  elements.forEach((element) => {
    element.addEventListener("change", saveSettings);
  });
  getSettings();
});
