// ---------- Data ----------
let sheets = []; // list of all sheets

// ---------- Helpers ----------
function getNumber(id) {
  return Number(document.getElementById(id).value);
}

function calcWeightKg(length, width, thickness, density) {
  // mm -> m, then volume (m³) x density (kg/m³)
  const volume = (length / 1000) * (width / 1000) * (thickness / 1000);
  return volume * density;
}

// ---------- Exception checkbox: enable/disable the amount field ----------
const exceptionOn = document.getElementById('exceptionOn');
const exceptionRow = document.getElementById('exceptionRow');
const exceptionAmount = document.getElementById('exceptionAmount');

function updateExceptionState() {
  exceptionAmount.disabled = !exceptionOn.checked;
  exceptionRow.classList.toggle('disabled-row', !exceptionOn.checked);
}
exceptionOn.addEventListener('change', updateExceptionState);
updateExceptionState();

// ---------- Sheet table ----------
function renderSheets() {
  const body = document.getElementById('sheetTableBody');
  body.innerHTML = '';

  sheets.forEach(function (s, index) {
    const weight = calcWeightKg(s.length, s.width, s.thickness, s.density);
    const row = document.createElement('tr');
    row.innerHTML =
      '<td>' + s.name + '</td>' +
      '<td>' + s.length + '</td>' +
      '<td>' + s.width + '</td>' +
      '<td>' + s.thickness + '</td>' +
      '<td>' + s.density + '</td>' +
      '<td>' + s.qty + '</td>' +
      '<td>' + (s.canBeUnder ? 'Yes' : 'No') + '</td>' +
      '<td>' + weight.toFixed(2) + '</td>' +
      '<td><button class="delete-btn" data-index="' + index + '">X</button></td>';
    body.appendChild(row);
  });

  document.getElementById('sheetEmpty').style.display =
    sheets.length === 0 ? 'block' : 'none';
}

// Delete button (event delegation: one listener for all delete buttons)
document.getElementById('sheetTableBody').addEventListener('click', function (e) {
  if (e.target.classList.contains('delete-btn')) {
    const index = Number(e.target.dataset.index);
    sheets.splice(index, 1);
    renderSheets();
  }
});

// ---------- Add a sheet manually ----------
document.getElementById('addSheetBtn').addEventListener('click', function () {
  const name = document.getElementById('sheetName').value.trim();
  const length = getNumber('sheetLength');
  const width = getNumber('sheetWidth');
  const thickness = getNumber('sheetThickness');
  const density = getNumber('sheetDensity');
  const qty = getNumber('sheetQty');
  const canBeUnder = document.getElementById('sheetCanBeUnder').checked;
  const message = document.getElementById('message');

  if (!name || length <= 0 || width <= 0 || thickness <= 0 || density <= 0 || qty <= 0) {
    message.textContent = 'Please fill in all sheet fields with valid values.';
    return;
  }

  sheets.push({ name, length, width, thickness, density, qty, canBeUnder });
  renderSheets();
  message.textContent = 'Sheet "' + name + '" added.';

  // clear the form for the next sheet
  document.getElementById('sheetName').value = '';
  document.getElementById('sheetLength').value = '';
  document.getElementById('sheetWidth').value = '';
  document.getElementById('sheetThickness').value = '';
});

// ---------- Import Excel ----------
document.getElementById('excelFile').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    const data = new Uint8Array(event.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(firstSheet);

    let added = 0;
    rows.forEach(function (r) {
      const sheet = {
        name: String(r.name || r.Name || '').trim(),
        length: Number(r.length || r.Length),
        width: Number(r.width || r.Width),
        thickness: Number(r.thickness || r.Thickness),
        density: Number(r.density || r.Density || 750),
        qty: Number(r.quantity || r.Quantity || r.qty || 1),
        canBeUnder: String(r.canBeUnder || r.CanBeUnder || 'yes').toLowerCase() !== 'no'
      };
      if (sheet.name && sheet.length > 0 && sheet.width > 0 && sheet.thickness > 0) {
        sheets.push(sheet);
        added++;
      }
    });

    renderSheets();
    document.getElementById('message').textContent =
      added + ' sheet(s) imported from "' + file.name + '".';
  };
  reader.readAsArrayBuffer(file);
  e.target.value = ''; // allows re-importing the same file
});

// ---------- Save settings ----------
document.getElementById('saveBtn').addEventListener('click', function () {
  const settings = {
    palletLength: getNumber('palletLength'),
    palletWidth: getNumber('palletWidth'),
    maxHeight: getNumber('maxHeight'),
    maxWeight: getNumber('maxWeight'),
    overlimit: getNumber('overlimit'),
    onePieceOnePillar: document.getElementById('onePieceOnePillar').checked,
    exceptionOn: exceptionOn.checked,
    exceptionAmount: exceptionOn.checked ? getNumber('exceptionAmount') : 0,
    sheets: sheets
  };

  const message = document.getElementById('message');

  if (settings.palletLength <= 0 || settings.palletWidth <= 0 ||
      settings.maxHeight <= 0 || settings.maxWeight <= 0) {
    message.textContent = 'Pallet size and limits must be positive numbers.';
    return;
  }
  if (settings.overlimit < 0) {
    message.textContent = 'Overlimit cannot be negative.';
    return;
  }

  const totalPieces = sheets.reduce((sum, s) => sum + s.qty, 0);
  const totalWeight = sheets.reduce(
    (sum, s) => sum + calcWeightKg(s.length, s.width, s.thickness, s.density) * s.qty, 0);

  message.textContent = 'Settings saved.';
  document.getElementById('summary').textContent =
    'Pallet: ' + settings.palletLength + ' x ' + settings.palletWidth + ' mm\n' +
    'Max height: ' + settings.maxHeight + ' mm\n' +
    'Max weight: ' + settings.maxWeight + ' kg\n' +
    'Overlimit: ' + settings.overlimit + ' mm\n' +
    'One piece, one pillar: ' + (settings.onePieceOnePillar ? 'Yes' : 'No') + '\n' +
    'Exception: ' + (settings.exceptionOn ? 'Yes (max ' + settings.exceptionAmount + ' pieces)' : 'No') + '\n' +
    'Sheets: ' + sheets.length + ' type(s), ' + totalPieces + ' piece(s)\n' +
    'Total weight of all sheets: ' + totalWeight.toFixed(1) + ' kg';

  console.log(settings);
});

// First display
renderSheets();