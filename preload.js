// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const {machineIdSync} = require("node-machine-id");

window.addEventListener("DOMContentLoaded", () => {
  let id = machineIdSync(true)
  localStorage.setItem('deviceId', id);
  fetch("http://localhost:8080/points/online", {
    method: "POST",
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({deviceId: id})
  }).then(res => {
    const replaceText = (selector, text) => {
      const element = document.getElementById(selector);
      if (element) element.innerText = text;
    };

    for (const type of ["chrome", "node", "electron"]) {
      replaceText(`${type}-version`, process.versions[type]);
    }
  });
});
