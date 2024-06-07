function generate() {
    let url = document.getElementById("url").value;
    // get the url from the current tab

  const qrCode = new QRCodeStyling({
    width: 300,
    height: 300,
    type: "canvas",
    data: url,

    dotsOptions: {
      color: "#4267b2",
      type: "rounded",
    },
    backgroundOptions: {
      color: "#e9ebee",
    },
    imageOptions: {
      crossOrigin: "anonymous",
      margin: 20,
    },
  });

  qrCode.append(document.getElementById("canvas"));
  // qrCode.download({ name: "qr", extension: "svg" });

  // get the png image
  /*
    QRCodeStyling.getRawData(extension) => Promise<Blob>

Param	Type	Default Value	Description
extension	string ('png' 'jpeg' 'webp' 'svg')	'png'	Blob type
Returns: Promise<Blob>
    */
  qrCode.getRawData("png").then((blob) => {
    const url = URL.createObjectURL(blob);
    // document.getElementById("png").src = url;

    // remove class hidden from the qr code image
    // remove the qr code canvas
    // document.getElementById("canvas").classList.add("hidden");
    // document.getElementById("png").classList.remove("hidden");
  });
}

// on click download
document.getElementById("download").addEventListener("click", function () {
    let url = document.getElementById("url").value;
    let hostname = new URL(url).hostname;
  const qrCode = new QRCodeStyling({
    width: 300,
    height: 300,
    type: "canvas",
    data: url,

    dotsOptions: {
      color: "#4267b2",
      type: "rounded",
    },
    backgroundOptions: {
      color: "#e9ebee",
    },
    imageOptions: {
      crossOrigin: "anonymous",
      margin: 20,
    },
  });

  qrCode.download({ name: "qr-" + hostname, extension: "png" });
});

// on dom content loaded
document.addEventListener("DOMContentLoaded", function () {
feather.replace();

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    let url = tabs[0].url;
    document.getElementById("url").value = url;
  generate();

});
});