const chalk = require('chalk');
const http = require('http').createServer()
const io = require('socket.io')(http, {pingTimeout: 12000, pingInterval: 5000})
const port = 9898

function debug(input) {
        console.log(chalk.red(input));
}

function sockGen() {
	return Math.floor(Math.random() * Math.floor(9999));
};

function Client(IDno, IP, port, sockID, pubKey) {
	this.IDno = IDno;
	this.IP = IP;
	this.port = port;
	this.sockID = sockID;
	this.pubKey = pubKey;
}

var users = [];
var IDs = [];

http.listen(port, '0.0.0.0', function() {
console.log(`server listening on ${port}`)
});

io.on('connection', (socket) => {
	setInterval(() => {
		var sockets = io.sockets.adapter.rooms;
		console.log(users);

                let inc = 0;
		for (inc = 0; inc < users.length; inc++) {
			console.log(users[inc].sockID);
			let check = sockets.has(users[inc].sockID);
			
			if (check == true) {
				console.log("Doing nothing")
			} else {
				let newUsers = users.filter(user => users.sockID !== check)
				users = [];
				users = users.concat(newUsers);
			}
		}
		

		
	}, 5 * 1000);

	var address = socket.request.connection.remoteAddress;
	var port = socket.request.connection._peername.port;

	socket.join(socket.id);

	socket.on('joined', (data) => {
		const myID = data;
		const userID = myID;
		console.log(userID);
		console.log(IDs);
		socket.broadcast.emit('joined', {userID, IDs})
	});

        socket.on('disc', function(data) {
                const myID = data;
		const userID = myID;
		var newIDs = IDs.filter(function(e) { return e !== userID })
		console.log(newIDs);
		IDs = [];
		IDs = IDs.concat(newIDs);
		console.log("New list of IDs: "+ IDs);	
		const delid = parseInt(userID);
		let clients = users.filter(client => client.IDno !== delid);
		users = [];
		users = users.concat(clients);

		socket.broadcast.emit('disc', {userID, IDs})
        }); 

	socket.on('xchange', function(pubKey) {
		var newUserID = sockGen()
		if (!IDs.includes(newUserID)) {
			users.push(new Client(newUserID, address, port, socket.id, pubKey));

			let userID = users.find(client => client.sockID === socket.id);
			userID = userID.IDno;
			console.log(userID);

			IDs.push(userID);
		
			socket.emit('getid', {userID, IDs});
		} else if (IDs.includes(newUserID)) {
			console.log(chalk.red("User ID already in use..."));
		}
	});

	socket.on('message', (evt) => {
		socket.broadcast.emit('message', evt)
	})
	
	socket.on('dm', function(data) {
		const {recipID, fromID, recipKey, encPW, encMsg} = data;
		let recip = users.find(client => client.IDno == recipID);
		let sender = users.find(client => client.IDno == fromID);

                if (recip.sockID == undefined) {
                        console.log("Recipient is unknown");
                } else {
			let recipsocket = recip.sockID;
			io.to(recipsocket).emit("dm", {recipID, fromID, recipKey, encPW, encMsg});
		}
	});
	
	socket.on('toclient', function(data) {

		const {encMsg, encPW, fromID, recipID} = data;

                let recip = users.find(client => client.IDno == recipID);
                let recipsocket = recip.sockID;

		io.to(recipsocket).emit("decry", {encMsg, encPW, fromID});
	});

	socket.on('recipKey', function(data) { 

		const {recipID, cliID} = data;
		let user = users.find(client => client.IDno == recipID);
		
		recipsocket = user.sockID;
		recipKey = user.pubKey;

		socket.emit('getKey', {recipKey, recipID});
		console.log(recipKey);
	});

	socket.on('disconnect', function(data) {

		let clients = users.filter(client => client.sockID !== socket.id);
		let user = users.find(client => client.sockID == socket.id);

		userID = parseInt(user.IDno);
		console.log(chalk.yellow("UserID leaving is "+ userID));

                var newIDs = IDs.filter(function(e) { return e !== userID })

                console.log(newIDs);
                IDs = [];
                IDs = IDs.concat(newIDs);
                console.log("New list of IDs: "+ IDs);
		console.log(socket.id + "  disconnected");

                users = [];
                users = users.concat(clients);
		socket.broadcast.emit('disc', {userID, IDs});

	});
	
})

io.on('disconnect', (evt) => {
	console.log('some people left')
})

io.on('err', (evt) => {
	console.log("Caught error");
})
