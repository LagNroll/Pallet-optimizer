const fields = {
  palletLength: document.getElementById("palletLength"),
  palletWidth: document.getElementById("palletWidth"),
  maxHeight: document.getElementById("maxHeight"),
  maxWeight: document.getElementById("maxWeight"),
};

const message = document.getElementById("message");
const summary = document.getElementById("summary");

// Settings object used by the rest of the app later
let settings = {
  palletLength: 1200,
  palletWidth: 800,
  maxHeight: 1250,
  maxWeight: 450,
};

function loadSettings() {
  const saved = localStorage.getItem("palletSettings");
  if (saved) {
    settings = JSON.parse(saved);
  }
  for (const key in fields) {
    fields[key].value = settings[key];
  }
  updateSummary();
}

function saveSettings() {
  const values = {};
  for (const key in fields) {
    const v = Number(fields[key].value);
    if (!v || v <= 0) {
      showMessage("Please enter a positive number in every field.", "error");
      return;
    }
    values[key] = v;
  }
  settings =  values;
  localStorage.setItem("palletSettings", JSON.stringify(settings));
  showMessage("Saved!", "ok");
  updateSummary();
}

function updateSummary() {
  summary.textContent =
    `Pallet: ${settings.palletLength} x ${settings.palletWidth} mm\n` +
    `Max height: ${settings.maxHeight} mm\n` +
    `Max weight: ${settings.maxWeight} kg`;
}

function showMessage(text, type) {
  message.textContent = text;
  message.className = type;
}

document.getElementById("saveBtn").addEventListener("click", saveSettings);
loadSettings();