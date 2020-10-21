const socket = io();

let users = {};
let myX, myY;


function drawMovement(data){
	const {x, y, socketID} = data;
	users[socketID] = {'x': x, 'y': y, 'socketID': socketID}
	fill(0);
	console.log(socketID);
}

function drawAllUsers(){
	for(user in users){
		text(users[user].socketID, users[user].x, users[user].y);
	}
}



function drawMe(){
	fill(0);
	text(socket.id, 100, 100);
}

function setup(){
	//console.log("hello");
	createCanvas(500, 500);	
	myX = 100;
	myY = 100;
	
	socket.on('movement', drawMovement);
}

function draw(){
	background(255);
	drawAllUsers();

	if(keyIsDown(65)){
		//a
		myX -= 1;
		socket.emit('movement', {x: myX, y: myY});
	}
	if(keyIsDown(68)){
		//d
		myX += 1;
		socket.emit('movement', {x: myX, y: myY});
	}
	if(keyIsDown(87)){
		//w
		myY -= 1;
		socket.emit('movement', {x: myX, y: myY});
	}
	if(keyIsDown(83)){
		//s
		myY += 1;
		socket.emit('movement', {x: myX, y: myY});
	}
}



