// server.js
// splashinn

var socketio = require("socket.io");

// listening on port 3636
var io = socketio.listen(3636);

io.sockets.on('connection', function(socket) {
  // broadcast a user's message to everyone else in room
  socket.on('send', function(data) {
    io.sockets.emit('message', data);
  });
});
