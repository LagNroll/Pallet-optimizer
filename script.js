// The data of our app is stored here
const pallet = {
  length: 0,
  width: 0,
};

const lengthInput = document.getElementById('palletLength');
const widthInput = document.getElementById('palletWidth');
const saveButton = document.getElementById('savePalletBtn');
const palletResult = document.getElementById('palletResult');

saveButton.addEventListener('click', () => {
  const length = Number(lengthInput.value);
  const width = Number(widthInput.value);

  if (length <= 0 || width <= 0) {
    palletResult.textContent = 'Please enter values greater than 0.';
    return;
  }

  pallet.length = length;
  pallet.width = width;

  palletResult.textContent = `Pallet saved: ${pallet.length} x ${pallet.width} mm`;
});
