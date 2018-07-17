"use strict";

var task_directory_path = window.location.pathname + "/";
window.Turtle = {};
window.Maze = {};

//Get the json file and its informations
var turtle_file = ""
if(task_directory_path.includes("edit")){ //When we are editing the task
    turtle_file = task_directory_path.replace("admin","course").replace("edit/task/","")+"turtle_config.json"
}else { //When displaying the task
    turtle_file = task_directory_path + "turtle_config.json";
}
var request = new XMLHttpRequest();
request.open("GET", turtle_file, false);
request.send(null)
var json = JSON.parse(request.responseText);

var imagePath = ""
if(json.imageSolution)
	imagePath = task_directory_path+json.imageName;

//Code of the solution
var solution = function(){
	//Here, put the javascript corresponding to the solved exercice
}
var decoration = function(){
	//Here, put the code for any decor, not part of the exercice
	Turtle.jumpForward(50);
	Turtle.turnLeft(90);
	Turtle.jumpForward(145);
	Turtle.penWidth(4);
	Turtle.moveForward(50);
	Turtle.turnRight(90);
	Turtle.jumpForward(15);
	Turtle.turnRight(180);
	Turtle.penColour("#FF0000")
	for(var i = 0; i < 6; i++){
		Turtle.moveForward(30);
		Turtle.turnRight(60);
	}
}

var randomColour = function(){
	var colour = Math.floor(Math.random()*16777215);
	return "#"+colour.toString(16).toUpperCase()
}

//Canvas size
Turtle.CANVAS_WIDTH = json.width;
Turtle.CANVAS_HEIGHT = json.height;

//Starting position and radius of turtle
Turtle.START_X = json.startX;
Turtle.START_Y = json.startY;
Turtle.RADIUS = json.radius;

//Current coordinates of turtle
Turtle.CURRENT_COORD = {
	x:Turtle.START_X,
	y:Turtle.START_Y
}

//Current heading of turtle
Turtle.HEADING = json.startAngle;

//Weater or not the pen is down and it's width
Turtle.PEN_DOWN = true; //At start, the pen is always down
Turtle.PEN_WIDTH = json.strokeWidth;
Turtle.PEN_COLOUR = json.strokeColour;

//Variables used to draw on the solution canvas or the decor canvas
var sol = false;
var decor = false;

//milisec between each frame
window.stepSpeed = json.animationRate;

/**
*
*     Animations functions
*
*/

Turtle.drawMap = function() {
    var div = document.getElementById('visualization');

    // Add the canvas for the turtle
    var canvas = document.createElement('canvas');
    canvas.setAttribute('width', Turtle.CANVAS_WIDTH);
    canvas.setAttribute('height', Turtle.CANVAS_HEIGHT);
    canvas.setAttribute("style", "border:1px solid #F1EEE7;")
    canvas.setAttribute("id", "turtle-canvas");
    div.appendChild(canvas);
    // Add the canvas for the user.
    canvas = document.createElement('canvas');
    canvas.setAttribute('width', Turtle.CANVAS_WIDTH);
    canvas.setAttribute('height', Turtle.CANVAS_HEIGHT);
    canvas.setAttribute('style', 'display: none');
    canvas.setAttribute("id", "user-canvas");
    div.appendChild(canvas);
    // Add the canvas for the solution.
    canvas = document.createElement('canvas');
    canvas.setAttribute('width', Turtle.CANVAS_WIDTH);
    canvas.setAttribute('height', Turtle.CANVAS_HEIGHT);
    canvas.setAttribute('style', 'display: none');
    canvas.setAttribute("id", "solution-canvas");
    div.appendChild(canvas);
    //Add the canvas for the decor
    canvas = document.createElement('canvas');
    canvas.setAttribute('width', Turtle.CANVAS_WIDTH);
    canvas.setAttribute('height', Turtle.CANVAS_HEIGHT);
    canvas.setAttribute('style', 'display: none')
    canvas.setAttribute("id", "decor-canvas");
    div.appendChild(canvas)

    //Draw the decor
    Turtle.drawDecor();

    if(json.imageSolution) //We have an image
    	Turtle.addSolution();
    else //Draw the solution using the code
    	Turtle.drawSolution();

    //Draw the turtle
    Turtle.updateImage();

    
}

Turtle.drawTurtle = function(){
    var c = document.getElementById("turtle-canvas");
	var ctx = c.getContext("2d")

	//Draw the turtle body
	ctx.beginPath();
	ctx.strokeStyle = Turtle.PEN_COLOUR;
	ctx.arc(Turtle.CURRENT_COORD.x, Turtle.CURRENT_COORD.y, Turtle.RADIUS, 0, 2 * Math.PI);
	ctx.stroke();

	 // Draw the turtle head.
    var WIDTH = 0.3;
    var HEAD_TIP = 10;
    var ARROW_TIP = 4;
    var BEND = 6;
    var radians = 2 * Math.PI * Turtle.HEADING / 360;
    var tipX = Turtle.CURRENT_COORD.x + (Turtle.RADIUS + HEAD_TIP) * Math.sin(radians);
    var tipY = Turtle.CURRENT_COORD.y - (Turtle.RADIUS + HEAD_TIP) * Math.cos(radians);
    radians -= WIDTH;
    var leftX = Turtle.CURRENT_COORD.x + (Turtle.RADIUS + ARROW_TIP) * Math.sin(radians);
    var leftY = Turtle.CURRENT_COORD.y - (Turtle.RADIUS + ARROW_TIP) * Math.cos(radians);
    radians += WIDTH / 2;
    var leftControlX = Turtle.CURRENT_COORD.x + (Turtle.RADIUS + BEND) * Math.sin(radians);
    var leftControlY = Turtle.CURRENT_COORD.y - (Turtle.RADIUS + BEND) * Math.cos(radians);
    radians += WIDTH;
    var rightControlX = Turtle.CURRENT_COORD.x + (Turtle.RADIUS + BEND) * Math.sin(radians);
    var rightControlY = Turtle.CURRENT_COORD.y - (Turtle.RADIUS + BEND) * Math.cos(radians);
    radians += WIDTH / 2;
    var rightX = Turtle.CURRENT_COORD.x + (Turtle.RADIUS + ARROW_TIP) * Math.sin(radians);
    var rightY = Turtle.CURRENT_COORD.y - (Turtle.RADIUS + ARROW_TIP) * Math.cos(radians);

    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(leftX, leftY);
    ctx.bezierCurveTo(leftControlX, leftControlY,
        rightControlX, rightControlY, rightX, rightY);
    ctx.closePath();
    ctx.fillStyle = Turtle.PEN_COLOUR;
	ctx.fill();
}

Turtle.resetTurtle = function(){
	var c = document.getElementById("turtle-canvas");
	var ctx = c.getContext("2d")
	//Clear any previous turtle
	ctx.clearRect(0, 0, Turtle.CANVAS_WIDTH, Turtle.CANVAS_HEIGHT);

}

Turtle.addSolution = function(){
	var c = document.getElementById("solution-canvas");
	var ctx = c.getContext("2d")
	ctx.globalAlpha = 0.4; //The solution drawing is a bit transparent
	var img = new Image();   // Crée un nouvel élément Image
	img.src = imagePath;
	img.onload = function(){
    	ctx.drawImage(img, 0, 0);
    	Turtle.updateImage();
  	}
}


Turtle.drawSolution = function(){
	var c = document.getElementById("solution-canvas");
	var ctx = c.getContext("2d")
	ctx.globalAlpha = 0.4; //The solution drawing is a bit transparent
	sol = true;
	solution();
	sol = false;
	Turtle.reset(true);
}

Turtle.drawDecor = function(){
	var c = document.getElementById("decor-canvas");
	var ctx = c.getContext("2d")
	decor = true;
	decoration();
	decor = false;
	Turtle.reset(true);
}

Turtle.animate = function(id) {
	switch(id){
		case "move" :
			Turtle.updateImage();
			break;
		case "turn" :
			Turtle.updateImage();
			break;
		case "colour": 
			Turtle.updateImage();
			break;
		default:
			//This should not happen
			console.warn("Unknown animation");
			break; 
	}
}

Turtle.updateImage = function(){
	Turtle.resetTurtle();
	var c1 = document.getElementById("turtle-canvas");
	var ctx1 = c1.getContext("2d")
	var c2 = document.getElementById("user-canvas");
	var c3 = document.getElementById("solution-canvas");
	var c4 = document.getElementById("decor-canvas");
	ctx1.drawImage(c4, 0, 0); //Fuse any decor
	ctx1.drawImage(c3, 0, 0); //Fuse solution canvas
	ctx1.drawImage(c2, 0, 0); //Fuse user canvas
	Turtle.drawTurtle(); //Add the turtle
}

Turtle.init = function() {

    if (typeof Blockly === "undefined" || typeof Blockly.getMainWorkspace() === "undefined" || Blockly.getMainWorkspace() === null) {
        console.warn("Turtle.init() called but Blockly or workspace was not loaded.");
        window.setTimeout(Maze.init, 20);
    }
     Blockly.JavaScript.addReservedWords('moveForward,moveBackward,' +
      	'turnRight,turnLeft,penUp,penDown,penWidth,penColour,');

    Turtle.drawMap();
};

Turtle.reset = function(bool){
	if(bool){
		Turtle.CURRENT_COORD.x = Turtle.START_X;
		Turtle.CURRENT_COORD.y = Turtle.START_Y;

		Turtle.PEN_DOWN = true;
		Turtle.PEN_WIDTH = json.strokeWidth;
		Turtle.PEN_COLOUR = json.strokeColour;

		Turtle.HEADING = json.startAngle;
	}
	Turtle.updateImage();
}

//Workaround current plugin implementation that uses Maze as a variable
Maze.reset = function(bool){
	Turtle.CURRENT_COORD.x = Turtle.START_X;
	Turtle.CURRENT_COORD.y = Turtle.START_Y;

	Turtle.PEN_DOWN = true;
	Turtle.PEN_WIDTH = json.strokeWidth;
	Turtle.PEN_COLOUR = json.strokeColour;

	Turtle.HEADING = json.startAngle;
	if(!bool){
		var c1 = document.getElementById("turtle-canvas");
		var ctx1 = c1.getContext("2d");
		var c2 = document.getElementById("user-canvas");
		var ctx2 = c2.getContext("2d");
		ctx1.clearRect(0, 0, Turtle.CANVAS_WIDTH, Turtle.CANVAS_HEIGHT);
		ctx2.clearRect(0, 0, Turtle.CANVAS_WIDTH, Turtle.CANVAS_HEIGHT);
	}
	Turtle.updateImage();
}

/**
*
*     Blocks functions
*
*/
Turtle.move = function(length){
	var c;
	if(sol)
    	c = document.getElementById("solution-canvas");
    else if (decor)
    	c = document.getElementById("decor-canvas");
    else
    	c = document.getElementById("user-canvas");
	var ctx = c.getContext("2d")
	if (Turtle.PEN_DOWN) {
    	ctx.beginPath();
    	ctx.moveTo(Turtle.CURRENT_COORD.x, Turtle.CURRENT_COORD.y);
	}
	if(length){
		Turtle.CURRENT_COORD.x += length * Math.sin(2 * Math.PI * Turtle.HEADING / 360);
	  	Turtle.CURRENT_COORD.y -= length * Math.cos(2 * Math.PI * Turtle.HEADING / 360);
	}
	if(Turtle.PEN_DOWN){
		ctx.lineWidth = Turtle.PEN_WIDTH;
		ctx.strokeStyle = Turtle.PEN_COLOUR;
	  	ctx.lineTo(Turtle.CURRENT_COORD.x, Turtle.CURRENT_COORD.y);
	  	ctx.stroke();
	}
	Turtle.animate("move");
}

Turtle.moveForward = function(length){
	Turtle.move(length);
}


Turtle.moveBackward = function(length){
	Turtle.move(-length);
}

Turtle.jumpForward = function(length){
	Turtle.penUp();
	Turtle.moveForward(length);
	Turtle.penDown();
}

Turtle.jumpBackward = function(length){
	Turtle.penUp();
	Turtle.moveBackward(length);
	Turtle.penDown();
}

Turtle.circle = function(radius){
	var c;
	if(sol)
    	c = document.getElementById("solution-canvas");
    else if (decor)
    	c = document.getElementById("decor-canvas");
    else
    	c = document.getElementById("user-canvas");
	var ctx = c.getContext("2d")
	ctx.beginPath();
	ctx.arc(Turtle.CURRENT_COORD.x, Turtle.CURRENT_COORD.y, radius, 0,2*Math.PI);
	ctx.stroke();
	Turtle.updateImage();
}

Turtle.turn = function(angle, direction){
	switch (direction){
		case 0:
			Turtle.HEADING = (Turtle.HEADING - angle) % 360;
  			if (Turtle.HEADING < 0) {
    			Turtle.HEADING += 360;
			}
			break;
		case 1:
			Turtle.HEADING = (Turtle.HEADING + angle) % 360;
			break;
	}
	Turtle.animate("turn");
}

Turtle.turnRight = function(angle){
	Turtle.turn(angle, 1);
}

Turtle.turnLeft = function(angle){
	Turtle.turn(angle, 0);
}

Turtle.penWidth = function(width){
	Turtle.PEN_WIDTH = width;
}

Turtle.penUp = function(){
	Turtle.PEN_DOWN = false;
}

Turtle.penDown = function(){
	Turtle.PEN_DOWN = true;
}

Turtle.penColour = function(colour){
	Turtle.PEN_COLOUR = colour;
	Turtle.animate("colour");
}

//Called to draw
if (document.getElementById('visualization') != null) {
    window.addEventListener('load', Turtle.init);
} else {
    console.warn('Cannot find visualization element.');
}