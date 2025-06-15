const socket = io();
const lightsDiv = document.getElementById('lights');
const timerEl = document.getElementById('timer');
const beep = document.getElementById('beep');
const buzzer = document.getElementById('buzzer');

function renderLights(lights) {
  lightsDiv.innerHTML = '';
  const allPressed = lights.every(color => color);

  lights.forEach(color => {
    // Dot: white if pressed, gray if not
    const dotClass = 'dot' + (color ? ' active' : '');

    // Circles & squares: only show real result if all pressed, else gray
    let circleClass = 'light';
    let squareClass = 'square';

    if (allPressed) {
      if (color === 'white') {
        circleClass += ' white';
        // square stays gray
      } else if (color === 'red') {
        circleClass += ' red';
        squareClass += ' red'; // red square too
      } else if (color === 'yellow') {
        circleClass += ' red';
        squareClass += ' yellow-square';
      } else if (color === 'blue') {
        circleClass += ' red';
        squareClass += ' blue-square';
      }
    }

    // Render block with dot, circle, and square
    const block = document.createElement('div');
    block.className = 'referee-light-block';
    block.innerHTML = `
      <div class="${dotClass}"></div>
      <div class="${circleClass}"></div>
      <div class="${squareClass}"></div>
    `;
    lightsDiv.appendChild(block);
  });
}

function renderTimer(timer) {
  const min = Math.floor(timer / 60);
  const sec = timer % 60;
  timerEl.textContent = `${min}:${sec.toString().padStart(2, '0')}`;
}

socket.on('update', ({ lights, timer }) => {
  renderLights(lights);
  renderTimer(timer);
});

socket.on('beep', ({ type, value }) => {
  if (type === 'end') {
    buzzer.currentTime = 0;
    buzzer.play();
  } else {
    beep.currentTime = 0;
    beep.play();
  }
});