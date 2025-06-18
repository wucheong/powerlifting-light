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

// Redirect root to /display
app.get('/', (req, res) => {
  res.redirect('/display');
});

// Route to allow /display, /controller, /referee to serve their respective .html files
app.get('/:page(display|controller|referee)', (req, res) => {
  res.sendFile(__dirname + `/public/${req.params.page}.html`);
});

const refereeConnections = [[], [], []]; // 每個位置的 socket.id 陣列

io.on('connection', socket => {
  console.log('A client connected:', socket.id);
  // Send current state upon connection
  socket.emit('update', { lights, timer, timerRunning });

  socket.on('light', ({ refereeIndex, color }) => {
    console.log(`Light event: referee ${refereeIndex}, color: ${color}`);
    lights[refereeIndex] = color;
    io.emit('update', { lights, timer, timerRunning });
  });

  socket.on('reset', () => {
    console.log('Reset event received');
    lights[0] = lights[1] = lights[2] = null;
    timer = 60;
    timerRunning = false;
    clearInterval(timerInterval);
    io.emit('update', { lights, timer, timerRunning });
  });

  socket.on('startTimer', () => {
    if (timerRunning) return;
    console.log('Start timer event received');
    timerRunning = true;
    io.emit('update', { lights, timer, timerRunning });
    timerInterval = setInterval(() => {
      if (timer <= 0) {
        clearInterval(timerInterval);
        timerRunning = false;
        io.emit('beep', { type: 'end' });
        io.emit('update', { lights, timer, timerRunning });
        console.log('Timer ended');
        return;
      }
      timer--;
      if (timer === 30) io.emit('beep', { type: '30s' });
      if (timer <= 10 && timer > 0) io.emit('beep', { type: 'countdown', value: timer });
      io.emit('update', { lights, timer, timerRunning });
    }, 1000);
  });

  socket.on('pauseTimer', () => {
    if (timerRunning) {
      timerRunning = false;
      clearInterval(timerInterval);
      io.emit('update', { lights, timer, timerRunning });
      console.log('Pause timer event received');
    }
  });

  socket.on('refereeJoin', ({ refereeIndex }) => {
    if (typeof refereeIndex === 'number' && refereeIndex >= 0 && refereeIndex < 3) {
      if (!refereeConnections[refereeIndex].includes(socket.id)) {
        refereeConnections[refereeIndex].push(socket.id);
        console.log(`Referee joined: position ${refereeIndex}, id: ${socket.id}`);
        io.emit('refereeStatus', getRefereeStatus());
      }
      socket.refereeIndex = refereeIndex;
    }
  });

  socket.on('disconnect', () => {
    if (typeof socket.refereeIndex === 'number') {
      const idx = refereeConnections[socket.refereeIndex].indexOf(socket.id);
      if (idx !== -1) refereeConnections[socket.refereeIndex].splice(idx, 1);
      console.log(`Referee disconnected: position ${socket.refereeIndex}, id: ${socket.id}`);
      io.emit('refereeStatus', getRefereeStatus());
    }
    console.log('A client disconnected:', socket.id);
  });
});

function getRefereeStatus() {
  return refereeConnections.map(arr => arr.length);
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));