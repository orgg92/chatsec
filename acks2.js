var io = require('socket.io')(9898);

var users = [];


function sockGen() {
        return Math.floor(Math.random() * Math.floor(9999));
};

io.on('connection', function (socket) {
  console.log('client connected')

  var user = sockGen();
  users.push(user, socket.id);

  socket.emit("ping", {user, users}, function (data) {
		if (data.error)
			console.log("Something went wrong")

		if (data.ok)
			console.log("Event was successful")
  });

  socket.on('disconnect', () => {

	console.log(users);

  });
	
});
