const socket = io();
function resetAll() {
  socket.emit('reset');
}
function startTimer() {
  socket.emit('startTimer');
}
function pauseTimer() {
  socket.emit('pauseTimer');
}

// --- Attempt Submission Timers ---
let attemptTimers = [null, null];
let attemptTimes = [60, 60];

function updateAttemptDisplay(idx) {
  document.getElementById(`attempt${idx+1}-display`).textContent = attemptTimes[idx];
}

function startAttemptTimer(num) {
  const idx = num - 1;
  if (attemptTimers[idx]) return; // already running
  attemptTimers[idx] = setInterval(() => {
    if (attemptTimes[idx] > 0) {
      attemptTimes[idx]--;
      updateAttemptDisplay(idx);
    } else {
      clearInterval(attemptTimers[idx]);
      attemptTimers[idx] = null;
      // 可加音效或閃爍提示
    }
  }, 1000);
}

function resetAttemptTimer(num) {
  const idx = num - 1;
  clearInterval(attemptTimers[idx]);
  attemptTimers[idx] = null;
  attemptTimes[idx] = 60;
  updateAttemptDisplay(idx);
}

// 初始化顯示
updateAttemptDisplay(0);
updateAttemptDisplay(1);

// --- Live Status (reflect from display) ---
socket.on('update', ({ lights, timer, timerRunning }) => {
  // 更新主倒數計時
  const timerEl = document.getElementById('live-timer');
  if (timerEl) timerEl.textContent = timer;

  // 更新燈號
  const lightsEl = document.getElementById('live-lights');
  if (lightsEl) {
    lightsEl.innerHTML = '';
    lights.forEach(color => {
      const dot = document.createElement('div');
      dot.style.width = '2.2rem';
      dot.style.height = '2.2rem';
      dot.style.borderRadius = '50%';
      dot.style.display = 'inline-block';
      dot.style.border = '2px solid #444';
      dot.style.margin = '0 0.1rem';
      dot.style.background = '#222';
      if (color === 'white') dot.style.background = '#fff';
      if (color === 'red') dot.style.background = '#ff4444';
      if (color === 'yellow') dot.style.background = '#ffe066';
      if (color === 'blue') dot.style.background = '#4a90e2';
      lightsEl.appendChild(dot);
    });
  }
});

// --- Referee connection status ---
const refereeNames = ["Left", "Center", "Right"];
socket.on('refereeStatus', (counts) => {
  const area = document.getElementById('referee-status-area');
  if (!area) return;
  area.innerHTML = refereeNames.map((name, i) =>
    `<div style='margin-bottom:0.3rem;'>${name}: <span style='color:${counts[i] === 1 ? "#0f0" : counts[i] === 0 ? "#f44" : "#ff0"}; font-weight:bold;'>${counts[i]}</span></div>`
  ).join('');
});