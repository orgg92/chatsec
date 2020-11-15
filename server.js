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

let i = 0;

io.on('connection', (socket) => {
	var address = socket.request.connection.remoteAddress;
	var port = socket.request.connection._peername.port;

	socket.join(socket.id);

//	socket.on('ping', (data) => {
			var ping = ping;
			console.log("Pong request to all sockets.... ");
		        setInterval(() => { socket.emit('ping', ping)
	}, 30 * 1000);

//	});

	socket.on('pong', (data) => {
		const {userID, pong} = data;
		console.log(data);
		if (pong.includes("pong")) {
			console.log("OK");
	
		} else {
			socket.close();
		}

	});
	
	socket.on('joined', (data) => {

		const myID = data;
		const userID = myID;
		console.log(userID);
		
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
		console.log(delid)
//		let clients = users.filter(function(e) { return e !== delid });
//                let sender = users.find(client => client.IDno == fromID);

		let clients = users.filter(client => client.IDno !== delid);

		console.log(clients);
		users = [];
		users = users.concat(clients);

		socket.broadcast.emit('disc', {userID, IDs})
        });

	socket.on('xchange', function(pubKey) {
		var newUserID = sockGen()
		if (!IDs.includes(newUserID)) {
			users.push(new Client(newUserID, address, port, socket.id, pubKey));
		        console.log(users[i].IDno + '@' + users[i].IP +':' + users[i].port + ' connected')
		        console.log(users);
			var userID = users[i].IDno;
			i = i+1;

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
	
})

io.on('disconnect', (evt) => {
	console.log('some people left')
})

io.on('err', (evt) => {
	console.log("Caught error");
})
