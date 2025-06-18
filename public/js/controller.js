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