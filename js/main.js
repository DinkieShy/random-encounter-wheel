var STUFF_TO_DRAW = [];
var CAN;
var CTX;
var CENTER;
const FPS = 60;

var drawInterval;

const audioCount = 256;

const audio = new Audio('assets/click.mp3');
var audioSources = [];
var audioIndex = 0;

var resultsArea;
var outcomeArea;

var spinnerImage;

const colourCycle = [
	"#FFD1D1",
	"#FBFFDE",
	"#D7FDDF",
	"#E0FFFD",
	"#D0D0FE",
	"#F9DEFF"
];

// const colourCycle = [
// 	"#F7F7F7",
// 	"#CDCDCD",
// 	"#A8E9FF",
// 	"#8ABBCC"
// ];

var colourIndex = 0;

$(document).ready(function(){
	console.log("init");

	resultsArea = $("#resultsList")[0];
	outcomeArea = $("#outcomeArea");

	spinnerImage = $("#flat");

	CAN = $("#wheel")[0];

	sizeCanvas();

	CTX = CAN.getContext("2d");

	var wheel = new Wheel()
	STUFF_TO_DRAW.push(wheel);

	draw();

	for(var i = 0; i < audioCount; i++){
		audioSources.push(audio.cloneNode());
	}

	for(audioSource of audioSources){
		audioSource.load();
		audioSource.volume = 0.15;
	}

	outcomeArea.click(function(){
		STUFF_TO_DRAW[0].spin(true);
	});

	outcomeArea[0].innerHTML = "<h3 class=\"outcome\">Click to spin!</h3>";
});

$(window).resize(function(){
	sizeCanvas();
});

function getRandomInt(max){
  return Math.floor(Math.random() * max);
}

function sizeCanvas(){
	CAN.width = window.innerWidth;
	CAN.height = window.innerHeight*0.8;
	CENTER = [CAN.width*0.35, CAN.height/2]
}

function draw(){
	CTX.clearRect(0, 0, CAN.width, CAN.height);
	for(object of STUFF_TO_DRAW){
		object.draw(CTX);
	}
}

function playTick(){
	audioSources[audioIndex].play();
	audioIndex += 1;
	audioIndex = audioIndex % audioCount;
}

function parseOutcomeString(string){
	var total = Function('return (' + string + ');')();
	var hours = Math.floor(total / 3600);
	var subtotal = total - 3600 * hours;
	var minutes = Math.floor(subtotal / 60);
	subtotal -= 60 * minutes;
	var seconds = subtotal;

	if(hours > 0){
		return `<h3 class="outcome">${hours} hours</h3>
		<h3 class="outcome">${minutes} minutes</h3>
		<h3 class="outcome">${seconds} seconds</h3>
		<h4 id="instructionText">Click to spin again!</h4>`;
	}
	else if(minutes > 0){
		return `<h3 class="outcome">${minutes} minutes</h3>
		<h3 class="outcome">${seconds} seconds</h3>
		<h4 id="instructionText">Click to spin again!</h4>`;
	}
	else{
		return `<h3 class="outcome">${seconds} seconds</h3>
		<h4 id="instructionText">Click to spin again!</h4>`;
	}
}

class Wheel{
	constructor(){
		this.rotation=0;
		this.items = [
			{"text": "Encounter!", "val": "Rolling..."},
			{"text": "No encounter", "val": ""},
			{"text": "No encounter", "val": ""},
			{"text": "No encounter", "val": ""},
			{"text": "No encounter", "val": ""},
			{"text": "Encounter!", "val": "Rolling..."},
			{"text": "No encounter", "val": ""},
			{"text": "No encounter", "val": ""},
			{"text": "No encounter", "val": ""},
			{"text": "No encounter", "val": ""},
		];
		this.endStates = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
		this.sep = (Math.PI*2)/this.items.length;
		this.speed = 0;
		this.braking = 0.95;
		this.brakingTime = 1000;
		this.started;
		this.startBraking;
		this.cutoff = 0.01;
		this.lastRotationCheck = 0;
		this.hasEnded = true;
		this.results = "";
		this.individualResults = [];
		this.radius = CENTER[1]*0.8;
		this.maxTextHeight;
		this.maxTextWidth;
	}

	draw(ctx, overlay = -1){
		this.radius = CENTER[1]*0.8;
		if(CENTER[0]*0.8 < this.radius){
			this.radius = CENTER[0]*0.8;
		}

		this.maxTextWidth = this.radius*0.6;
		this.maxTextHeight = this.radius*0.6*Math.sin(((Math.PI*this.radius*0.6*2)/this.items.length)/2*this.radius*0.6);

		this.rotate();

		if(this.rotation % this.sep < this.lastRotationCheck){
			playTick();
		}
		this.lastRotationCheck = this.rotation % this.sep;

		ctx.fillStyle = "white";
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.arc(CENTER[0], CENTER[1], this.radius, 0, 2*Math.PI);
		ctx.fill();
		ctx.stroke();

		ctx.lineWidth = 2;
		for(var i = this.rotation; i <= Math.PI*2 + this.rotation; i += this.sep){
			ctx.fillStyle = colourCycle[colourIndex];
			colourIndex += 1;
			colourIndex = colourIndex % colourCycle.length;
			ctx.beginPath();
			ctx.arc(CENTER[0], CENTER[1], this.radius, i, i+this.sep);
			ctx.lineTo(CENTER[0], CENTER[1]);
			ctx.fill();
		}
		colourIndex = 0;

		ctx.save();
		ctx.translate(CENTER[0], CENTER[1]);
		ctx.rotate(this.rotation);

		var imageSize = Math.ceil(this.radius*0.6);

		ctx.beginPath();
		ctx.arc(0, 0, this.radius*0.35, 0, 2*Math.PI);
		ctx.fillStyle = "white";
		ctx.strokeStyle = "black";
		ctx.lineWidth = 2;
		ctx.fill();
		ctx.stroke();
		ctx.drawImage(spinnerImage[0], -imageSize/2, -imageSize/2, imageSize, imageSize);

		ctx.rotate(-1*(this.sep/2-0.01));
		ctx.fillStyle = "black";
		ctx.lineWidth = 1;
		ctx.textAlign = "right";
		ctx.textBaseline = 'middle';

		for(var item of this.items){
			var fontSize = 30;
			ctx.font = fontSize + "px Monospace";
			while(ctx.measureText(item["text"]).width > this.maxTextWidth || ctx.measureText(item["text"]).height > this.maxTextHeight){
				fontSize--;
				ctx.font = fontSize + "px Monospace";
			}
			ctx.fillText(item["text"], this.radius*0.99, 0);
			ctx.rotate(-this.sep);
		}

		ctx.restore();

		ctx.fillStyle = "black";

		var pointSize = this.radius*0.05;
		var point = [CENTER[0]+this.radius-pointSize/4, CENTER[1]];

		ctx.beginPath();
		ctx.moveTo(point[0], point[1]);
		ctx.lineTo(point[0]+pointSize*2, point[1]+pointSize);
		ctx.lineTo(point[0]+pointSize*2, point[1]-pointSize);
		ctx.lineTo(point[0], point[1]);
		ctx.fill();
	}

	spin(clear = false){
		if(clear){
			this.results = "";
			resultsArea.innerHTML = "";
			outcomeArea[0].innerHTML = "";
			outcomeArea.hide();
		}
		drawInterval = setInterval(draw, 1000/FPS);
		this.hasEnded = false;
		this.speed = 5 + (Math.random()-0.5) * 2;
		this.started = Date.now();
		this.startBraking = this.started + this.brakingTime + (0.5+Math.random())*this.brakingTime;
	}

	rotate(){
		this.rotation = (this.rotation + this.speed/(1000/FPS)) % (Math.PI*2);
		if(this.speed > this.cutoff && Date.now() >= this.startBraking){
			this.speed *= this.braking;
		}
		else if(this.speed < this.cutoff){
			this.speed = 0;
			if(!this.hasEnded){
				this.end();
			}
		}
	}

	end(){
		clearInterval(drawInterval);
		this.hasEnded = true;
		var result = Math.floor(this.rotation/this.sep);
		this.results += this.items[result]["val"];
		this.individualResults.push(result);
		resultsArea.innerHTML += `<h3>${this.items[result]["text"]}</h3>`;
		if(this.endStates.includes(result)){
			console.log(this.results);
			// var total = parseOutcomeString(this.results);
			var total = "Nothing :("
			if(this.results == "Rolling..."){
				total = getRandomInt(100);
			}
			console.log(total);
			outcomeArea.show();
			outcomeArea[0].innerHTML = `<h3 class="outcome">${total}</h3>`;
		}
		else{
			this.spin();
		}
	}
}