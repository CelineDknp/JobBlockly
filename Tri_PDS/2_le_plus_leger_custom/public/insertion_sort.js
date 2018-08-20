/*
*  Copyright (c)  2018 Ilias Boutchichi
*  This program is free software: you can redistribute it and/or modify
*  it under the terms of the GNU Affero General Public License as published by
*  the Free Software Foundation, either version 3 of the License, or
*  (at your option) any later version.
*  This program is distributed in the hope that it will be useful,
*  but WITHOUT ANY WARRANTY; without even the implied warranty of
*  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*  GNU Affero General Public License for more details.
*
*  You should have received a copy of the GNU Affero General Public License
*  along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/**
* @author Ilias Boutchichi
*/

'use strict'; //more secure

var TEXT = 0, RECT = 1, INDEX = 2, VALUE = 3, RECT_HEIGHT = 60;

var Insertion = {};

var currentBlue = -1;
var currentRed = -1;
var currentlyClassed = 0;

Insertion.animations = [];
Insertion.initList = [];
Insertion.case = [];
Insertion.animid = 0;
Insertion.tmp = null;
window.stepSpeed = 500;

/**
 * Interpreter for custom functions in blocks generators
 */
var initInterpreterApi = function(interpreter, scope) {
  interpreter.setProperty(scope, 'currentComp',
  interpreter.createNativeFunction(function(index) {
    if(currentRed != -1){
      Insertion.tmp = Insertion.case[currentRed];
      Insertion.animations.push(Insertion.changeBackgroundColor('none', Insertion.tmp[RECT]));
    }
    Insertion.tmp = Insertion.case[Number(index)];
    Insertion.animations.push(Insertion.changeBackgroundColor('red', Insertion.tmp[RECT]));
    currentRed = Number(index)
    if(currentRed == currentBlue){
      currentBlue = -1
    }
  }));

  interpreter.setProperty(scope, 'otherComp',
  interpreter.createNativeFunction(function(index) {
    if(currentBlue != -1){
      Insertion.tmp = Insertion.case[currentBlue];
      Insertion.animations.push(Insertion.changeBackgroundColor('none', Insertion.tmp[RECT]));
    }
    Insertion.tmp = Insertion.case[Number(index)];
    Insertion.animations.push(Insertion.changeBackgroundColor('blue', Insertion.tmp[RECT]));
    currentBlue = Number(index)
  }));

  interpreter.setProperty(scope, 'move',
  interpreter.createNativeFunction(function(index) {
    Insertion.tmp = Insertion.case[Number(index)];
    Insertion.animations.push(Insertion.dmove(0, -Number(index), Insertion.tmp));
    var dist = 0
    if(currentlyClassed == 0)
      dist = 5 - Insertion.tmp[RECT].y()
    else
      dist = 5 + currentlyClassed*RECT_HEIGHT + 2 - Insertion.tmp[RECT].y()
    Insertion.animations.push(Insertion.dmove(250, dist, Insertion.tmp));
    currentlyClassed += 1;
    Insertion.animations.push(Insertion.changeBackgroundColor('none', Insertion.tmp[RECT]));
    currentRed = -1;
    if(currentBlue != -1){
      Insertion.tmp = Insertion.case[currentBlue];
      Insertion.animations.push(Insertion.changeBackgroundColor('none', Insertion.tmp[RECT]));
      currentBlue = -1;
    }
    Insertion.tmp = Insertion.case.splice(index, 1);
  }));

  Insertion.reset();
};

/**
 * Function called after the evaluation of each block for animations
 */
var animate = function() {
    Insertion.animate();
};

/**
 * Initialisation of Blockly, svg, and display of the random list
 */
Insertion.init = function() {
  if (typeof Blockly === "undefined" || typeof Blockly.getMainWorkspace() === "undefined"
  || Blockly.getMainWorkspace() === null) {
    console.warn("Insertion.init() called but Blockly or workspace was not loaded.");
    window.setTimeout(Insertion.init, 20);
    return;
  }
  var svg = document.getElementById('blocklySvgZone');
  svg.setAttribute('style', '');
  svg.setAttribute('viewBox', '0, 0, 400, 800');
  svg.setAttribute('xmlns:xhtml', 'http://www.w3.org/1999/xhtml');

  Insertion.list = Lst.liste;

  var svg = SVG('blocklySvgZone').size('100%', '100%');
  Insertion.list.forEach(function(item, index, array) {
    var text = svg.text('' + item).font({ fill: 'black', family: 'Inconsolata', size:40})
                  .move(0, index*RECT_HEIGHT);
    var rect = svg.rect(100,RECT_HEIGHT).fill('none').stroke({width:4,color:'black'})
                  .move(0,RECT_HEIGHT*index);
    Insertion.case.push([text,rect,index,item]);
  });
  Insertion.initList = Insertion.case.slice();
};

/**
 * Reset function called when clicking on the 'restart' button
 */
Insertion.reset = function() {
  for(var x=0; x < Insertion.animations.length; x++){
    clearTimeout(Insertion.animations[x]);
  }
  Insertion.animations = [];
  if(currentBlue != -1){
    Insertion.case[currentBlue][RECT].fill("none");
    currentBlue = -1;
  }
  if(currentRed != -1){
    Insertion.case[currentRed][RECT].fill('none');
    currentRed = -1;
  }
  Insertion.case = Insertion.initList.slice();

  Insertion.case.forEach(function(item, index, array) {
    item[TEXT].stroke('black').move(0,index*RECT_HEIGHT);
    item[RECT].stroke('black').move(0,index*RECT_HEIGHT);
  });
};

var Maze = {};
Maze.reset = Insertion.reset; //Trick 'cause plugin

/**
 * Function that changes the color of a rectangle
 * @param {string} color the color value, either common value
 *     or hexadecimal value
 * @param {rectangle} rect the rectangle that needs to change color
 */
Insertion.changeColor = function(color, rect) {
  return function() {
    rect.animate(window.stepSpeed, '<>').stroke(color);
  };
};

Insertion.changeBackgroundColor = function(color, rect) {
  return function() {
    rect.animate(window.stepSpeed, '<>').fill(color).opacity(0.4);
  };
};

/**
 * Function that move a case (text + rectangle) by adding (x,y) to
 * its coordinates
 * @param {number} x value to add to the abscissa of the case 'elem'
 * @param {number} y value to add to the ordinate of the case 'elem'
 * @param {case} elem element representing the case that needs to move
 */
Insertion.dmove = function(x,y,elem) {
  return function() {
    elem[TEXT].animate(window.stepSpeed, '<>').dmove(x,y);
    elem[RECT].animate(window.stepSpeed, '<>').dmove(x,y);
  };
};

/**
 * My animation function
 */
Insertion.animate = function() {
  while(Insertion.animations.length) {
    window.setTimeout(Insertion.animations.shift(),
    Insertion.animid++*window.stepSpeed);
  }
  Insertion.animid = 0;
};

/**
 * Throws a warning if no visual interface is found on the web page,
 * otherwise load the visuals
 */
if (document.getElementById('blocklySvgZone') != null) {
  window.addEventListener('load', Insertion.init);
} else {
  console.warn('Cannot find blocklySvgZone element.');
}
