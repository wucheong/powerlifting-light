const socket = io();

let selectedReferee = null;
const refereeNames = ["Left", "Center", "Right"];
const radioButtons = document.querySelectorAll('input[name="referee"]');
const refereeSelectGroup = document.getElementById('refereeSelectGroup');
const selectedRefereeTitle = document.getElementById('selectedRefereeTitle');
const radioRow = document.getElementById('radioRow');

radioButtons.forEach(radio => {
  radio.addEventListener('change', (e) => {
    if (e.target.checked) {
      selectedReferee = parseInt(e.target.value, 10);
      // Hide the referee select group after selection
      refereeSelectGroup.style.display = 'none';
      // Show the selected referee title
      selectedRefereeTitle.style.display = 'block';
      selectedRefereeTitle.textContent = `You are the "${refereeNames[selectedReferee]}" Referee`;
      // Enable light buttons
      enableLightButtons(true);
    }
  });
});

function enableLightButtons(enable) {
  document.getElementById('btnWhite').disabled = !enable;
  document.getElementById('btnRed').disabled = !enable;
  document.getElementById('btnYellow').disabled = !enable;
  document.getElementById('btnBlue').disabled = !enable;
}

// Light button handlers
document.getElementById('btnWhite').onclick = () => sendLight('white');
document.getElementById('btnRed').onclick = () => sendLight('red');
document.getElementById('btnYellow').onclick = () => sendLight('yellow');
document.getElementById('btnBlue').onclick = () => sendLight('blue');

function sendLight(color) {
  if (selectedReferee !== null) {
    socket.emit('light', { refereeIndex: selectedReferee, color });
    // Optionally, visually indicate selection or lock out further presses, if needed
    // For now, allow changing light after selected referee #
  }
}

// On load, keep lights disabled until referee is chosen
enableLightButtons(false);