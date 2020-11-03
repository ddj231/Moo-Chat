const express = require('express');
const app = express();

const server = require('http').Server(app);	
const io = require('socket.io')(server);

const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

let locations = {};
let rooms = {};

io.on('connect', socket => {
	console.log(socket.id, 'has just connected');
	socket.on('load', data  =>{
		const {user} = data;
		socket.join(user.roomID);
		console.log(user.roomID);
		if(!rooms[user.roomID]){
			rooms[user.roomID] = {};  
		}
		rooms[user.roomID][socket.id] = user;  
		/*
		locations[socket.id] = user;
		io.to(user.roomID).emit('load', locations);
		*/
		io.to(user.roomID).emit('load', rooms[user.roomID]);
	})

	socket.on('movement', data =>{
		const {user} = data;

		/*
		if(locations[socket.id]){
			locations[socket.id] = user;
		}
		*/
		if(rooms[user.roomID] && rooms[user.roomID][socket.id]){
			rooms[user.roomID][socket.id] = user;
			const newData = {user: user};
			io.to(user.roomID).emit('movement', newData);
		}

		//const newData = {user: user};
		//console.log(user);
		//io.to(user.roomID).emit('movement', newData);
	})

	/*
	socket.on('disconnect', () =>{
		//console.log(socket.id, "disconnected");
		delete locations[socket.id];
		io.emit('deleted', {socketID: socket.id});
	});
	*/

	socket.on('disconnecting', () =>{
		//console.log(socket.id, "disconnected");
		let keys = Object.keys(socket.rooms);
		for(let key of keys){
			if(rooms[key]){
				delete rooms[key][socket.id];
				io.to(key).emit('deleted', {socketID: socket.id});
			}
		}
		//delete locations[socket.id];
		//io.emit('deleted', {socketID: socket.id});
	});

	socket.on('message', (data) =>{
		const {message, roomID, from} = data;
		io.to(roomID).emit('message', {message: message, from: from});
	});

})


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

server.listen(port);
