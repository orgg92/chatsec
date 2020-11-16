const ioClient = require('socket.io-client');
var client = ioClient.connect('http://localhost:9898');
client.emit('ping', 'tobu', (response) => {
  console.log("Sending emit message");
  console.log(response)
 // console.log('ack')
});
