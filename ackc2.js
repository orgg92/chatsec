const ioClient = require('socket.io-client');
var client = ioClient.connect('http://localhost:9898');
client.on('ping', function (data, callback) {
  console.log(data)

  if (callback.err) {

	console.log("oops")
  }

  callback({ok:true});
});
