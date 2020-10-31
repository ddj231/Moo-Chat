const express = require('express');
const app = express();

const server = require('http').Server(app);	
const io = require('socket.io')(server);

const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

let locations = {}

io.on('connect', socket => {
	console.log(socket.id, 'has just connected');
	socket.on('load', data  =>{
		const {user} = data;
		//console.log("load captured");
		locations[socket.id] = user;
		io.emit('load', locations);
	})

	socket.on('movement', data =>{
		const {user} = data;

		if(locations[socket.id]){
			locations[socket.id] = user;
		}
		const newData = {user: user};
		//console.log(user);
		io.emit('movement', newData);
	})

	socket.on('disconnect', () =>{
		//console.log(socket.id, "disconnected");
		delete locations[socket.id];
		io.emit('deleted', {socketID: socket.id});
	});

	socket.on('message', (data) =>{
		const {message} = data;
		io.emit('message', {message: message});
	});

})

server.listen(3000);
