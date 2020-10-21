const express = require('express');
const app = express();

const server = require('http').Server(app);	
const io = require('socket.io')(server);

const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

let locations = {}

io.on('connect', socket => {
	console.log(socket.id, 'has just connected');
	/*
	locations[socket.id] = {};
	locations[socket.id]["socketID"] = socket.id
	locations[socket.id]['x'] = 100;
	locations[socket.id]['y'] = 100;
	socket.emit('load', locations);
	*/
	socket.on('load', data  =>{
		console.log("load captured");
		locations[socket.id] = data;
		socket.emit('load', locations);
	})

	socket.on('movement', data =>{
		const {x, y} = data;

		if(locations[socket.id]){
			locations[socket.id]['x'] = x;
			locations[socket.id]['y'] = y;
		}
		console.log("movement captured");
		const newData = {x, y, socketID: socket.id};
		io.emit('movement', newData);
	})
})

server.listen(3000);
