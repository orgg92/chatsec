var io = require('socket.io')(9898);

io.on('connection', function (socket) {
  console.log('client connected')
  socket.on('ping', function (arg, ack) {
    console.log('Received emit message from client')
    ack('This is the reply from server');
  });
});
