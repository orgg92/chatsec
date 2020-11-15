var socket = require('socket.io-client')('http://172.16.1.222:9898');
const repl = require('repl');
const chalk = require('chalk');
var username = null;
const crypto = require('crypto');

const keys = keyGen()

var clinfo = [];
var users = []

var myMsg = "";
var password = crypto.randomBytes(10).toString('hex');
console.log("Your session password is: ", password);

function debug(input) {
	console.log(chalk.yellow(input));
}

function clInfo(myID) {
	this.myID = myID;
}

function enCrypt(toEncrypt, pubKey) {
    var buffer = new Buffer.from(toEncrypt);
    var encrypted = crypto.publicEncrypt(pubKey, buffer);
    return encrypted.toString("base64");
};

function deCrypt(toDecrypt, priKey) {
    var buffer = new Buffer.from(toDecrypt, "base64");
    var decrypted = crypto.privateDecrypt(priKey, buffer);
    return decrypted.toString("utf8");
};

function keyGen() {
                const keyPair = crypto.generateKeyPairSync('rsa', {
                        modulusLength: 520,
                        publicKeyEncoding: {
                                type: 'spki',
                                format: 'pem'
                        },
                                privateKeyEncoding: {
                                type: 'pkcs8',
                                format: 'pem',
                                cipher: 'aes-256-cbc',
                                passphrase: ''
                        }
                });

        var pubKey = keyPair.publicKey;
	var priKey = keyPair.privateKey;
        return  {pubKey, priKey}
        res(pubKey, priKey)
};

function cipherText(plaintext, password) {
	var mykey = crypto.createCipher('aes-128-cbc', password);
	var mystr = mykey.update(plaintext, 'utf8', 'hex')
	mystr += mykey.final('hex');
	return mystr
}

function decipherText(ciphertext, password) {
	var mykey = crypto.createDecipher('aes-128-cbc', password);
	var mystr = mykey.update(ciphertext, 'hex', 'utf8')
	mystr += mykey.final('utf8');
	return mystr
}

var id = socket.id;


socket.on('disconnect', function() {
	console.log(chalk.yellow("Disconnecting from server"));
	var myID = clinfo[0]
	socket.emit('disc', myID)
});

socket.on('connect', () => {

	var pubKey = keys.pubKey;
	var priKey = keys.priKey;
	console.log(pubKey, priKey);

	socket.emit('xchange', pubKey)

	console.log(chalk.red('== Client Connected =='))
})

socket.on('joined', (data) => {
	const {userID, IDs} = data;
	console.log(IDs);
	users.push(userID);
	console.log(users);
	console.log(chalk.green("Info: User ["+ userID +"] joined"));
})

socket.on('disc', (data) => {
	const {userID,IDs} = data;
//	var newUsers = users.filter(function(e) { return e !== userID })
//	console.log(newUsers);
//	users = [];
//	users.concat(newUsers);	
	users = [];
	users.concat(IDs);
	console.log(chalk.red(IDs));
	console.log(chalk.green("User ["+ userID +"] left"));
	
})

socket.on('getid', (data) => {
	const {userID, IDs} = data;
	users = [];
	users = users.concat(IDs);
	console.log("Current online users: " + users); 
	var myID = userID;
	console.log("Your ID is: "+ myID);
	clinfo.push(myID);
	//users.push(myID);

	console.log("Your session pass is: "+ password);
	socket.emit('joined', myID)
});

socket.on('getKey', (data) => {
	const {recipKey, recipID} = data;

	var encPW = enCrypt(password, recipKey);
	var encMsg = cipherText(myMsg, password);
	var fromID = clinfo[0];

	socket.emit('dm', {recipID, fromID, recipKey, encPW, encMsg});

});

socket.on('dm', (data) => {

	var priKey = keys.priKey;
	var { encPW, recipKey, fromID, recipID, encMsg } = data;
	var decPW = deCrypt(encPW, priKey)
	var decMsg = decipherText(encMsg, decPW)
	
        console.log(chalk.blue('[DM] From '+ fromID + ': ' + decMsg.split('\n')[0]));

});

socket.on('decry', (data) => {

	const {encMsg, encPW, fromID} = data;
	var priKey = keys.priKey;
	var decPW = deCrypt(encPW, priKey);
	var decMsg = decipherText(encMsg, decPW);

	console.log(chalk.blue('Private message ['+ fromID + '] : ' + decMsg.split('\n')[0]));	

})

socket.on('message', (data) => {
	const { message, cliID } = data;
	console.log(chalk.yellow(cliID + ': ' + message.split('\n')[0]));
})

repl.start({
	
	prompt: '',
	eval: (message) => {
		const cliID = clinfo[0];
		if (message.includes("DM@") & !message.includes("!quit")) {
			const myRe = /(?<=\@)(.*?)(?=\:)/g
			const recip = myRe.exec(message);
			var recipID = parseInt(recip[0]);
			console.log(recipID);
			console.log(users);

			if (users.includes(recipID)) {
				console.log(users.includes(recipID));
				var msg = message.split(/DM@\d{1,4}:/);
				msg = msg[1];
				const pubKey = keys.pubKey;
				socket.emit('recipKey', {cliID, recipID});

				myMsg = msg;
			} else if (!users.includes(recipID)) { 
				console.log(chalk.red("User not online"));
				console.log(users.includes(recipID));
				console.log(recipID);
			}
			
		} else if (message.includes("!quit") & !message.includes("DM@")) {
		
			chalk.green(console.log("Info: Quitting..."));
			var myID = clinfo[0];
			socket.emit('disc', myID);
			process.exit(1);

		} else {
			socket.send({ message, cliID })
		}
	}
})

