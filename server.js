const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const lights = [null, null, null]; // 3 referees
let timer = 60;
let timerRunning = false;
let timerInterval = null;

app.use(express.static('public'));

io.on('connection', socket => {
  // Send current state upon connection
  socket.emit('update', { lights, timer, timerRunning });

  socket.on('light', ({ refereeIndex, color }) => {
    lights[refereeIndex] = color;
    io.emit('update', { lights, timer, timerRunning });
  });

  socket.on('reset', () => {
    lights[0] = lights[1] = lights[2] = null;
    timer = 60;
    timerRunning = false;
    clearInterval(timerInterval);
    io.emit('update', { lights, timer, timerRunning });
  });

  socket.on('startTimer', () => {
    if (timerRunning) return;
    timerRunning = true;
    io.emit('update', { lights, timer, timerRunning });
    timerInterval = setInterval(() => {
      if (timer <= 0) {
        clearInterval(timerInterval);
        timerRunning = false;
        io.emit('beep', { type: 'end' });
        io.emit('update', { lights, timer, timerRunning });
        return;
      }
      timer--;
      if (timer === 30) io.emit('beep', { type: '30s' });
      if (timer <= 10 && timer > 0) io.emit('beep', { type: 'countdown', value: timer });
      io.emit('update', { lights, timer, timerRunning });
    }, 1000);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));