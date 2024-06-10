// listen for changes in id dataType
document.getElementById("dataType").addEventListener("change", function () {
  var dataType = document.getElementById("dataType").value;
  var dataTypeInputContainer = document.getElementById(
    "dataTypeInputContainer"
  );
  dataTypeInputContainer.innerHTML = "";
  document.getElementById("url").value = "";
  createInput(dataType, dataTypeInputContainer);
});

function createInput(dataType, container) {
  switch (dataType) {
    case "url":
      container.innerHTML = `
        <p>Just enter the URL above</p>
        `;
      break;
    case "text":
      container.innerHTML = `
          <textarea class="input" id="text" placeholder="Enter text"></textarea>
        `;
      break;
    case "email":
      container.innerHTML = `
          <input type="email" class="input" id="email" placeholder="Enter email" />
          <input type="text" class="input" id="emailSubject" placeholder="Enter email subject" />
          <textarea class="input" id="emailBody" placeholder="Enter email body"></textarea>
        `;
      break;
    case "phone":
      container.innerHTML = `
          <input type="tel" class="input" id="phone" placeholder="Enter phone number" />
        `;
      break;
    case "sms":
      container.innerHTML = `
          <input type="tel" class="input" id="sms" placeholder="Enter phone number" />
          <textarea class="input" id="smsMessage" placeholder="Enter SMS message"></textarea>
        `;
      break;
    case "wifi":
      container.innerHTML = `
          <input type="text" class="input" id="wifiSsid" placeholder="Enter WiFi SSID" />
          <input type="text" class="input" id="wifiPassword" placeholder="Enter WiFi password" />
          <select id="wifiType" class="input">
            <option value="WPA">WPA</option>
            <option value="WEP">WEP</option>
            <option value="nopass">No password</option>
          </select>
        `;
      break;
    case "geo":
      container.innerHTML = `
          <input type="text" class="input" id="geoLat" placeholder="Enter latitude" />
          <input type="text" class="input" id="geoLon" placeholder="Enter longitude" />
        `;
      break;
    case "event":
      container.innerHTML = `
          <input type="text" class="input" id="eventTitle" placeholder="Enter event title" />
          <input type="text" class="input" id="eventLocation" placeholder="Enter event location" />
          <input type="datetime-local" class="input" id="eventDate" />
        `;
      break;
    case "contact":
      container.innerHTML = `
          <input type="text" class="input" id="contactName" placeholder="Enter contact name" />
          <input type="tel" class="input" id="contactPhone" placeholder="Enter contact phone number" />
          <input type="email" class="input" id="contactEmail" placeholder="Enter contact email" />
        `;
      break;
    default:
      container.innerHTML = "No input available";
  }

  var urlInput = document.getElementById("url");
  if (dataType === "url") {
    // change tag to input
    // urlInput.element.outerHTML = urlInput.element.outerHTML.replace("textarea", "input");

    urlInput.type = "url";
    urlInput.placeholder = "Enter URL";

  } else {
    // change tag to textarea
    // urlInput.element.outerHTML = urlInput.element.outerHTML.replace("input", "textarea");
    urlInput.placeholder =
      "Generated Data will appear here";
    urlInput.type = "text";
  }

  // add event listener to the input
  var inputs = container.querySelectorAll(".input, select, textarea");
  inputs.forEach(function (input) {
    input.addEventListener("input", function () {
      createQrData();
    });
  });
}

function createQrData() {
  var inputs = document.querySelectorAll(".input, select, textarea");
  var type = document.getElementById("dataType").value;
  var qrData = "";

  switch (type) {
    case "url":
      qrData = document.getElementById("url").value;
      break;
    case "text":
      qrData = document.getElementById("text").value;
      break;
    case "email":
      var email = document.getElementById("email").value;
      var emailSubject = document.getElementById("emailSubject").value;
      var emailBody = document.getElementById("emailBody").value;
      qrData = `mailto:${email}?subject=${emailSubject}&body=${emailBody}`;
      break;
    case "phone":
      qrData = `tel:${document.getElementById("phone").value}`;
      break;
    case "sms":
      var sms = document.getElementById("sms").value;
      var smsMessage = document.getElementById("smsMessage").value;
      qrData = `SMSTO:${sms}:${smsMessage}`;
      break;
    case "wifi":
      var wifiSsid = document.getElementById("wifiSsid").value;
      var wifiPassword = document.getElementById("wifiPassword").value;
      var wifiType = document.getElementById("wifiType").value;
      qrData = `WIFI:S:${wifiSsid};T:${wifiType};P:${wifiPassword};;`;
      break;
    case "geo":
      var geoLat = document.getElementById("geoLat").value;
      var geoLon = document.getElementById("geoLon").value;
      qrData = `geo:${geoLat},${geoLon}`;
      break;
    case "event":
      var eventTitle = document.getElementById("eventTitle").value;
      var eventLocation = document.getElementById("eventLocation").value;
      var eventDate = document.getElementById("eventDate").value;
      qrData = `BEGIN:VCAL\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${eventTitle}\nLOCATION:${eventLocation}\nDTSTART:${eventDate}\nEND:VEVENT\nEND:VCAL`;
      break;
    case "contact":
      var contactName = document.getElementById("contactName").value;
      var contactPhone = document.getElementById("contactPhone").value;
      var contactEmail = document.getElementById("contactEmail").value;
      qrData = `BEGIN:VCARD\nVERSION:3.0\nN:${contactName};;;\nFN:${contactName}\nTEL;TYPE=CELL:${contactPhone}\nEMAIL:${contactEmail}\nEND:VCARD`;
      break;
    default:
      qrData = "";
  }

  document.getElementById("url").value = qrData;
  triggerInputEvent(document.getElementById("url"));
}

function triggerInputEvent(element) {
  // if user is still typing, reset the timer
  if (element.timeout) {
    clearTimeout(element.timeout);
  }
  element.timeout = setTimeout(function () {
    var event = new Event("input", {
      bubbles: true,
      cancelable: true,
    });
    element.dispatchEvent(event);
  }, 500);
}
