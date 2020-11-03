let roomID;
document.addEventListener("DOMContentLoaded", main);

function main(){
	let createButton = document.querySelector("#createButton");
	createButton.addEventListener("click", displayId);
	let joinButton = document.querySelector("#joinButton");
	joinButton.addEventListener("click", setRoomId);
}

function displayId(){
	let newRoomDiv = document.querySelector("#newRoom");
	let uniqueId = getUniqueId(); 
	newRoomDiv.innerText = uniqueId;
}

function getUniqueId(){
	return '_' + Math.random().toString(36).substr(2, 9);
}


function setRoomId(){
	let joinInput= document.querySelector("#joinInput");
	if(joinInput.value !== ""){
		roomID = joinInput.value;
		let joinDiv = document.querySelector("#joinRoom");
		let p = document.createElement("p");
		p.innerText = "joined " + roomID;
		joinDiv.appendChild(p);
		joinInput.remove();
	}
}
