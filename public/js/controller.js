const socket = io();
function resetAll() {
  socket.emit('reset');
}
function startTimer() {
  socket.emit('startTimer');
}