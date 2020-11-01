const socket = io();

//game state
let game_state = 0;


let users = {};
let myX, myY;
let myMessage = '';
let me;
let myUsername = "";

//recorder
let myRec;
let mySpeaker;
let sayCount = 0;
let recordedStarted = false;
let isTalking = false;
let usernameRecorder;

//cow walk
let cowWalkImg;
let cowImgTileSize = 512 / 4;

//background sound
let bgSound;

//background grass
let grassImg;
let grassTileSize = 192 / 6;

//background (plowed soil)
let soilImg;
let soilTileSize = 192 / 6;

let soilTiles = [
	[6, 7, 7, 7, 7, 7, 7, 7, 7, 8],
	[9, 17, 16, 17, 16, 17, 16, 1, 2, 11],
	[9, 17, 16, 17, 16, 17, 16, 4, 5, 11],
	[9, 17, 16, 17, 16, 17, 16, 17, 16, 11],
	[9, 17, 16, 1, 2, 17, 16, 17, 16, 11],
	[9, 17, 16, 4, 5, 17, 16, 17, 16, 11],
	[9, 17, 16, 17, 16, 17, 16, 17, 16, 11],
	[9, 1, 2, 17, 16, 17, 16, 17, 16, 11],
	[9, 4, 5, 17, 16, 17, 16, 17, 16, 11],
	[12, 13, 13, 13, 13, 13, 13, 13, 13, 14]
]

let fenceImg;
let fenceTileSize = grassTileSize;

let fenceTiles = [
	[-1, -1, -1, 0, 1, 1, 1, 1, 1, 2],
	[-1, -1, -1, -1, -1, -1, -1, -1, -1, 5],
	[-1, -1, -1, -1, -1, -1, -1, -1, -1, 5],
	[3, -1, -1, -1, -1, -1, -1, -1, -1, 5],
	[3, -1, -1, -1, -1, -1, -1, -1, -1, 5],
	[3, -1, -1, -1, -1, -1, -1, -1, -1, 5],
	[3, -1, -1, -1, -1, -1, -1, -1, -1, 5],
	[0, 1, 1, 1, 1, 1, 1, 1, 1, 2],
	[3, -1, -1, -1, -1, -1, -1, -1, -1, 5],
	[0, 1, 1, 1, 1, 1, 1, 1, 1, 2],
]

let wheatImg;
let wheatTileSize = grassTileSize;

let wheatTiles = [
	[6, 7, 8, 16, 1, 1, 1, 1, 1, 2],
	[9, 10, 11, 16, -1, -1, -1, -1, -1, 5],
	[12, 13, 14, 16, -1, -1, -1, -1, -1, 5],
	[16, 16, 16, 16, -1, -1, -1, -1, -1, 5],
	[3, -1, -1, -1, -1, -1, -1, -1, -1, 5],
	[3, -1, -1, -1, -1, -1, -1, -1, -1, 5],
	[3, -1, -1, -1, -1, -1, -1, -1, -1, 5],
	[3, -1, -1, -1, -1, -1, -1, -1, -1, 5],
	[3, -1, -1, -1, -1, -1, -1, -1, -1, 5],
	[0, 1, 1, 1, 1, 1, 1, 1, 1, 2],
]


let looping = false;

//MARK: Socket Logic
function drawMovement(data){
	const {user} = data;
	if(users[user.socketID]){
		//console.log(user);
		users[user.socketID] = makeUser(user);
	}
	else{
		//console.log("Uncreated user", user);
		users[user.socketID] = new User(user.x, user.y, user.username, user.socketID, user.roomID);	
	}

	fill(0);
}

function drawAllUsers(){
	for(user in users){
		users[user].display();
	}
}

function loadAllUsers(data){
	for(key in data){
		let socketID = data[key].socketID;
		users[socketID] = makeUser(data[key]);
	}
	drawAllUsers();
}

function makeUser(user){
	/*
	return new User(user.x, user.y, user.username, user.socketID, 
		user.status, user.walkLeftInd, 
		user.walkRightInd, user.walkDownInd, user.walkUpInd);
		*/
	return new User(user.x, user.y, user.username, user.socketID, user.roomID,
		user.status, user.walkLeftInd, 
		user.walkRightInd, user.walkDownInd, user.walkUpInd);
}



function drawMe(){
	fill(0);
	text(socket.id, 100, 100);
}

//MARK: P5 
function preload(){
	cowWalkImg = loadImage('./images/AnimalFarm/cow_walk.png');
	soilImg = loadImage('./images/backgrounds/plowed_soil.png');
	grassImg = loadImage('./images/backgrounds/tallgrass.png');
	fenceImg = loadImage('./images/backgrounds/fence.png');
	wheatImg = loadImage('./images/backgrounds/wheat.png');
	bgSound = loadSound('./sounds/Farm-background-noise/Farm-background-noise.mp3');	
}

let loaded = false;

function setup(){
	createCanvas(500, 500);	

	//configure username recorder
	usernameRecorder = new p5.SpeechRec();
	usernameRecorder.onResult = () =>{ 
		myUsername = usernameRecorder.resultString
	};
	usernameRecorder.onEnd = () => {
		if(myUsername != ""){
			//me.username = myUsername;
			game_state = 2;
		}
		startedRecordingUsername = false;
	};
}

function loadApp(){
	myX = 100;
	myY = 100;
	//me = new User(100, 100, myUsername, socket.id);
	me = new User(100, 100, myUsername, socket.id, roomID);

	//configure audio in
	//and speaker sound
	mySpeaker = new p5.Speech();
	mySpeaker.onEnd = speechEnded;

	//myRec.continuous = true;
	//myRec.interimResults = true;
	myRec = new p5.SpeechRec();
	myRec.onResult = parseResult;
	myRec.onStart = onStart;
	myRec.onEnd = onEnd;
	myRec.onError = onRecorderError;
	//myRec.start();
	

	//socket.emit('load', {'x': me.x, 'y': me.y, 'socketID': socket.id}user: me);
	socket.emit('load', {user: me});
	socket.on('load', loadAllUsers);
	socket.on('movement', drawMovement);
	socket.on('deleted', (data) =>{ 
		delete users[data.socketID]
		mySpeaker.speak("oh mooooo! we lost one cow");
	});
	socket.on('message', (data) => {
		//console.log("speaking");
		mySpeaker.speak(data.message);
	});
}

function drawGetUsername(){
	background(47,129,54);
	textAlign(CENTER);
	fill(0)
	rect(200, 200, 100, 100);
	fill(180,0,0) ;
	rect(200, 200, 100, 100);
	fill(0, 80)
	rect(200, 200, 100, 100);
	fill(255)
	text("Click \nand \nRecord \nYour Name", 250, 230);
	rectMode(CORNER);


}

function startBgSound(){
		if(!looping){
			bgSound.setVolume(0.2);
			bgSound.loop();
			looping = true;
		}
}

function draw(){
	//console.log("Room id is: ", roomID);
	noStroke();
	if(game_state == 0){
		drawStart();
	}
	else if(game_state == 1){
		drawGetUsername();
	}
	else if(game_state == 2){
		loadApp();
		game_state = 3;
	}
	else{
		startBgSound();
		background(255);
		drawBgSoilTiles();
		drawBgGrassTiles();
		drawBgWheatTiles();
		drawAllUsers();
		drawBgFenceTiles();
		//drawBgSandwaterTiles();
		drawRecordMsgButton();
		drawSendMsgButton();
		drawTextField();

		me.move();
	}
}

function drawStart(){
	background(47,129,54);
	//start button
	//rectMode(CENTER);
	textAlign(CENTER);
	fill(117,75,52);
	rect(200, 200, 100, 100);
	fill(255)
	text("Click To Start", 250, 250);
	rectMode(CORNER);
}

let startedRecordingUsername = false;

function mousePressed(){
	//console.log("pressed");
	if(game_state == 0 && mouseX > 200 && mouseX < 300 && mouseY > 200 && mouseY < 300){
		if(roomID){
			game_state = 1;
		}
	}

	if(game_state == 1 && mouseX > 200 && mouseX < 300 && mouseY > 200 && mouseY < 300){
		if(!startedRecordingUsername){
			startedRecordingUsername = true;
			usernameRecorder.start();
		}
	}


	if(game_state == 3 && mouseIsPressed && mouseX > 400 && mouseX < 450 && mouseY > 400 && mouseY < 450){
		console.log("Should Recored");
		if(!recordedStarted){
			myRec.start();
			recordedStarted = true;
		}
	}

	if(game_state == 3 && mouseIsPressed && mouseX > 320 && mouseX < 370 && mouseY > 400 && mouseY < 450){
		if(myMessage != "" && sayCount == 0){
			sayCount += 1;
			console.log("speaking");
			//mySpeaker.speak(myMessage);
			socket.emit("message", {message: myMessage, roomID: roomID});	
			myMessage = "";
		}
	}
}

function speechEnded(){
	sayCount = 0;
}

function onRecorderError(){
	myRec = new p5.SpeechRec();
	myRec.onResult = parseResult;
	myRec.onStart = onStart;
	myRec.onEnd = onEnd;
	myRec.onError = onRecorderError;
	recordedStarted = true;
}


function drawSendMsgButton(){
	fill(0, 255, 0, 50);
	rect(320, 400, 50, 50);
	fill(255);
	textAlign(CENTER);
	text("Send\nMsg", 345, 425);
}

function drawRecordMsgButton(){
	fill(255, 0, 0, 50);
	rect(400, 400, 50, 50);
	fill(255);
	textAlign(CENTER);
	text("Record\nMsg", 425, 425);

}

function onStart(){
	recordedStarted = true;
}

function onEnd(){
	recordedStarted = false;
}


//wrap funtion from rossetta code
function wrap (text, limit) {
  if (text.length > limit) {
    // find the last space within limit
    var edge = text.slice(0, limit).lastIndexOf(' ');
    if (edge > 0) {
      var line = text.slice(0, edge);
      var remainder = text.slice(edge + 1);
      return line + '\n' + wrap(remainder, limit);
    }
  }
  return text;
}

function parseResult(){
	console.log(myRec.resultString);
	myMessage = myRec.resultString;
	//format msg string
	if(myMessage.length > 30){
		//myMessage = myMessage.slice(0, 30) + '\n' + myMessage.slice(30);
		myMessage = wrap(myMessage, 32); 
	}
	
}

function drawTextField(){
	fill(255, 50);
	rect(50, 400, 200, 50);
	textAlign(LEFT);
	fill(255)
	if(!recordedStarted){
		text(myMessage, 70, 425);
	}
	else{
		text("recording user...", 70, 425);
	}
}

function drawBgSoilTiles(){
	for(let i = 0; i < 500; i += 50){
		for(let j = 0; j < 500; j += 50){
			drawBgTile(soilImg, soilTiles[i/50][j/50], j, i);
		}
	}
}

function drawBgFenceTiles(){
	for(let i = 0; i < 500; i += 50){
		for(let j = 0; j < 500; j += 50){
			if(fenceTiles[i/50][j/50] >= 0){
				drawBgTile(fenceImg, fenceTiles[i/50][j/50], j, i);
			}
		}
	}
}

function drawBgWheatTiles(){
	for(let i = 0; i < 500; i += 50){
		for(let j = 0; j < 500; j += 50){
			if(wheatTiles[i/50][j/50] >= 6){
				drawBgTile(wheatImg, wheatTiles[i/50][j/50], j, i);
			}
		}
	}
}


function drawBgGrassTiles(){
	for(let i = 0; i < 500; i += 50){
		for(let j = 0; j < 500; j += 50){
			drawBgTile(grassImg, 15, i, j);
		}
	}
}

function drawCowWalkTile(i, xPos, yPos){
	let x = (i % 4)	* cowImgTileSize;
	let y = floor(i / 4) * cowImgTileSize;
	image(cowWalkImg, xPos, yPos, cowImgTileSize, cowImgTileSize, x, y, cowImgTileSize, cowImgTileSize);
}

function drawBgTile(img, i, xPos, yPos){
	let x = (i % 3)	* grassTileSize;
	let y = floor(i / 3) * grassTileSize;
	image(img, xPos, yPos, 50, 50, x, y, grassTileSize, grassTileSize);
}

function drawSoilTile(i, xPos, yPos){
	let x = (i % 5)	* soilTileSize;
	let y = floor(i / 5) * soilTileSize;
	image(soilImg, xPos, yPos, 50, 50, x, y, soilTileSize, soilTileSize);
}


class User {

	constructor(x, y, username, socketID, roomID, status, walkLeftInd, walkRightInd, walkDownInd, walkUpInd){
		this.x = x;
		this.y = y;
		this.username = username;
		this.socketID = socketID;
		this.roomID = roomID;
		this.message = "";
		//status 0 = idle,  1 = walk right, 2 walk left 
		this.status = status ? status : 0;
		this.walkRightInd = walkRightInd ? walkRightInd: 0;
		this.walkLeftInd = walkLeftInd ? walkLeftInd : 0;
		this.walkDownInd = walkDownInd ? walkDownInd : 0;
		this.walkUpInd = walkUpInd ? walkUpInd : 0;
	}

	move(){
		if(keyIsDown(68)){
			this.status = 1;	
			this.walkRightInd += 0.2;
			let sensorX = floor((this.x + 80) / 50);
			let sensorY = floor((this.y + 80) / 50);
			let wheat = wheatTiles[sensorY][sensorX]; 
			if(fenceTiles[sensorY][sensorX] < 0 &&  (wheat < 6 || wheat == 16)){
				this.x += 0.5;
			}
			//ellipse(sensorX, sensorY, 5, 5);
			socket.emit('movement', {user: me});
		}
		else if(keyIsDown(65)){
			this.status = 2;	
			let sensorX = floor((this.x + 40) / 50);
			let sensorY = floor((this.y + 80) / 50);
			//ellipse(this.x + 40, this.y + 50, 5, 5);
			let wheat = wheatTiles[sensorY][sensorX]; 
			if(fenceTiles[sensorY][sensorX] < 0 && (wheat < 6 || wheat == 16)){
				this.x -= 0.5;
			}
			this.walkLeftInd += 0.2;
			socket.emit('movement', {user: me});
		}
		else if(keyIsDown(83)){
			this.status = 3;	
			this.walkDownInd += 0.2;
			let sensorX = floor((this.x + 60) / 50);
			let sensorY = floor((this.y + 90) / 50);
			//ellipse(this.x + 60, this.y + 80, 5, 5);
			let wheat = wheatTiles[sensorY][sensorX]; 
			if(fenceTiles[sensorY][sensorX] < 0 && (wheat < 6 || wheat == 16)){
				this.y += 0.5;
			}
			socket.emit('movement', {user: me});
		}
		else if(keyIsDown(87)){
			this.status = 4;	
			//this.y -= 0.5;
			this.walkUpInd += 0.2;
			let sensorX = floor((this.x + 60) / 50);
			let sensorY = floor((this.y + 50) / 50);
			//ellipse(this.x + 60, this.y + 50, 5, 5);
			let wheat = wheatTiles[sensorY][sensorX]; 
			if(sensorY > 0 && fenceTiles[sensorY][sensorX] < 0 && (wheat < 6 || wheat == 16)){
				this.y -= 0.5;
			}
			socket.emit('movement', {user: me});
		}
		/*
		else{
			this.status = 0;
			this.walkRightInd = 0;
			this.walkLeftInd = 0;
		}
		*/
	}

	display(){
		fill(255);
		text(this.username, this.x + 40, this.y + 40);
		//image(cowWalkImg, this.x, this.y, tileSize, tileSize, this.walkRightInd * tileSize, tileSize * 3, tileSize, tileSize);
		if(this.status == 1){
			let ind = floor(this.walkRightInd);
			drawCowWalkTile(12 + (ind % 4), this.x, this.y);
		}
		else if(this.status == 2){
			let ind = floor(this.walkLeftInd);
			drawCowWalkTile(4 + (ind % 4), this.x, this.y);
		}
		else if(this.status == 3){
			let ind = floor(this.walkDownInd);
			drawCowWalkTile(8 + (ind % 4), this.x, this.y);
		}
		else if(this.status == 4){
			let ind = floor(this.walkUpInd);
			drawCowWalkTile((ind % 4), this.x, this.y);
		}
		else{
			drawCowWalkTile(12, this.x, this.y);
		}
	}
}




