// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
import QrScanner from "./qr-scanner.min.js";

const video = document.getElementById("qr-video");
const videoContainer = document.getElementById("video-container");
const camHasCamera = document.getElementById("cam-has-camera");
const camList = document.getElementById("cam-list");
const camHasFlash = document.getElementById("cam-has-flash");
const flashToggle = document.getElementById("flash-toggle");
const flashState = document.getElementById("flash-state");
const camQrResult = document.getElementById("cam-qr-result");
const camQrLastResult = document.getElementById("cam-qr-last-result");

function openModal() {
  var modal = document.getElementById("modal");
  var dimmer = document.getElementById("background-dimmer");
  modal.style.display = "";
  modal.classList.add("float-in-from-above");
  modal.classList.remove("float-out-to-above");
  dimmer.style.display = "";
  dimmer.classList.add("fade-in");
  dimmer.classList.remove("fade-out");
}

function fillModal(data) {
  var name = document.getElementById("name-input");
  var surname = document.getElementById("surname-input");
  var balance = document.getElementById("balance-input");
  var masks = document.getElementById("masks-input");
  // change the values of the inputs
  // CIA SUKEIST KAIP PAEMA INFO
  name.value = data.firstName || "";
  surname.value = data.lastName || "";
  balance.value = data.role || "";
  masks.value = data.email || "";
}

function setResult(label, result) {
  console.log(result.data);
  label.textContent = result.data;
  camQrLastResult.textContent = result.data;
  setTimeout(() => getData(result.data), 1000);
  label.style.color = "teal";
  clearTimeout(label.highlightTimeout);
  label.highlightTimeout = setTimeout(
    () => (label.style.color = "inherit"),
    100
  );
}
var lastId = "";
function getData(id) {
  if (id === lastId) return;
  lastId = id;
  let url = "http://localhost:8080/users/" + id;
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      localStorage.setItem('user', JSON.stringify(data));
      window.location.href = 'user-info.html';
    })
    .catch((error) => console.log(error));
}

function fillUserData(data) {
  const user = localStorage.getItem('user');
  document.getElementById("name-field").innerHTML = user?.firstName || '';
  document.getElementById("lastname-field").innerHTML = user?.lastName || '';
  document.getElementById("balance-field").innerHTML = user?.balance || '';
}

// ####### Web Cam Scanning #######

const scanner = new QrScanner(
  video,
  (result) => setResult(camQrResult, result),
  {
    onDecodeError: (error) => {
      camQrResult.textContent = error;
      camQrResult.style.color = "inherit";
    },
    highlightScanRegion: true,
    highlightCodeOutline: true,
  }
);

const updateFlashAvailability = () => {
  scanner.hasFlash().then((hasFlash) => {
    camHasFlash.textContent = hasFlash;
    flashToggle.style.display = hasFlash ? "inline-block" : "none";
  });
};

scanner.start().then(() => {
  updateFlashAvailability();
  // List cameras after the scanner started to avoid listCamera's stream and the scanner's stream being requested
  // at the same time which can result in listCamera's unconstrained stream also being offered to the scanner.
  // Note that we can also start the scanner after listCameras, we just have it this way around in the demo to
  // start the scanner earlier.
  QrScanner.listCameras(true).then((cameras) =>
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.id;
      option.text = camera.label;
      camList.add(option);
    })
  );
});

QrScanner.hasCamera().then(
  (hasCamera) => (camHasCamera.textContent = hasCamera)
);

camList.addEventListener("change", (event) => {
  scanner.setCamera(event.target.value).then(updateFlashAvailability);
});

flashToggle.addEventListener("click", () => {
  scanner
    .toggleFlash()
    .then(() => (flashState.textContent = scanner.isFlashOn() ? "on" : "off"));
});

document.getElementById("start-button").addEventListener("click", () => {
  scanner.start();
});

document.getElementById("stop-button").addEventListener("click", () => {
  scanner.stop();
});

document.getElementById("close-modal-button").addEventListener("click", () => {
  closeModal();
});
