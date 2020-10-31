let cowWalkImg;
let tileSize;
let choiceBox;

function preload(){
	cowWalkImg = loadImage('./images/backgrounds/wheat.png');
	tileSize = 192 / 6;
	console.log(cowWalkImg.width);
}

function setup(){
	createCanvas(500, 500);
	choiceBox = new ChoiceBox();
}

function draw(){
	background(0);
	image(cowWalkImg, 0, 0);
	textSize(20);
	fill(255);
	text(getTileNumber(), 10, 30);
	choiceBox.display();
}

function keyPressed(){
	choiceBox.move();
}

function getTileNumber(){
	let num = (choiceBox.row * 3) + choiceBox.col; 
	return num;
}

class ChoiceBox {
	constructor(){
		this.x = 0;
		this.y = 0;
		this.row = 0;
		this.col = 0;
	}

	display(){
		stroke(0, 0, 255);
		strokeWeight(1);
		noFill();
		rect(this.x, this.y, tileSize, tileSize);
	}

	move(){
		if(keyCode == 83){
			if(this.row + 1< 20){
				this.row += 1;
				this.y += tileSize;
			}
		}
		else if(keyCode == 87){
			if(this.row - 1  >= 0){
				this.row -= 1;
				this.y -= tileSize;
			}
		}
		else if(keyCode == 65){
			if(this.col - 1 >= 0){
				this.col -= 1;
				this.x -= tileSize;
			}
		}
		else if(keyCode == 68){
			if(this.col + 1 < 20){
				this.col += 1;
				this.x += tileSize;
			}
		}
	}

}
