/**
 * Blockly Games: Maze
 *
 * Copyright 2012 Google Inc.
 * https://github.com/google/blockly-games
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview JavaScript for Blockly's Maze application.
 * @author fraser@google.com (Neil Fraser)
 * @author celine.deknop@student.uclouvain.be (Céline Deknop)
 * @author victor.feyens@student.uclouvain.be (Victor Feyens)
 */
"use strict";

var task_directory_path = window.location.pathname + "/";
window.Maze = {};

//File to modify to change the maze configuration
var maze_file = ""
if(task_directory_path.includes("edit")){ //When we are editing the task
    maze_file = task_directory_path.replace("admin","course").replace("edit/task/","")+"maze_config.json"
}else { //When displaying the task
    maze_file = task_directory_path + "maze_config.json";
}

var request = new XMLHttpRequest();
request.open("GET", maze_file, false);
request.send(null);
request.responseText;
var json = JSON.parse(request.responseText);


// Crash type constants.
Maze.CRASH_STOP = 1;
Maze.CRASH_SPIN = 2;
Maze.CRASH_FALL = 3;

Maze.SKIN = {
    sprite: task_directory_path + json.visuals.sprite,
    tiles: task_directory_path + json.visuals.tiles,
    marker: task_directory_path + json.visuals.marker,
    goalAnimation: task_directory_path + json.visuals.goalAnimation,
    obstacleIdle: task_directory_path + json.visuals.obstacleIdle,
    obstacleAnimation: task_directory_path + json.visuals.obstacleAnimation,
    wall: task_directory_path + json.visuals.wall,
    obstacleScale: json.visuals.obstacleScale,
    background: task_directory_path + json.visuals.background,
    graph: json.visuals.graph,
    look: '#000',
    obstacleSound: [task_directory_path + 'maze/obstacle.mp3', task_directory_path + 'maze/obstacle.ogg'],
    winSound: [task_directory_path + 'maze/win.mp3', task_directory_path + 'maze/win.ogg'],
    crashSound: [task_directory_path + 'maze/failure.mp3', task_directory_path + 'maze/failure.ogg'],
    crashType: Maze.CRASH_STOP
};

/**
 * Milliseconds between each animation frame.
 */
window.stepSpeed = json.map.animationSpeed;

/**
 * The types of squares in the maze, which is represented
 * as a 2D array of SquareType values.
 * @enum {number}
 */
Maze.SquareType = json.map.squareType;

// The maze square constants
Maze.map = json.map.layout[0];

/**
 * Measure maze dimensions and set sizes.
 * ROWS: Number of tiles down.
 * COLS: Number of tiles across.
 * SQUARE_SIZE: Pixel height and width of each maze square (i.e. tile).
 */
Maze.ROWS = Maze.map.length;
Maze.COLS = Maze.map[0].length;
Maze.SQUARE_SIZE = json.map.squareSize;
Maze.PEGMAN_HEIGHT = json.map.avatarHeight;
Maze.PEGMAN_WIDTH = json.map.avatarWidth;

Maze.MAZE_WIDTH = Maze.SQUARE_SIZE * Maze.COLS;
Maze.MAZE_HEIGHT = Maze.SQUARE_SIZE * Maze.ROWS;
Maze.PATH_WIDTH = Maze.SQUARE_SIZE / 3;

/**
 * Constants for cardinal directions.  Subsequent code assumes these are
 * in the range 0..3 and that opposites have an absolute difference of 2.
 * @enum {number}
 */
Maze.DirectionType = {
    NORTH: 0,
    EAST: 1,
    SOUTH: 2,
    WEST: 3
};

/**
 * Outcomes of running the user program.
 */
Maze.ResultType = {
    UNSET: 0,
    SUCCESS: 1,
    FAILURE: -1,
    TIMEOUT: 2,
    ERROR: -2
};

/**
 * Result of last execution.
 */
Maze.result = Maze.ResultType.UNSET;
Maze.finished = false;

/**
 * Starting direction.
 */
Maze.startDirection = Maze.DirectionType[json.map.startDirection];

/**
 * PIDs of animation tasks currently executing.
 */
Maze.pidList = [];


Maze.updateMap = function(map){
    Maze.map = map;
    Maze.ROWS = Maze.map.length;
    Maze.COLS = Maze.map[0].length;
    Maze.MAZE_WIDTH = Maze.SQUARE_SIZE * Maze.COLS;
    Maze.MAZE_HEIGHT = Maze.SQUARE_SIZE * Maze.ROWS;
    Maze.PATH_WIDTH = Maze.SQUARE_SIZE / 3;
}

Maze.reload_maze = function(map) {
    if (typeof Maze !== "undefined" && typeof Maze.reset !== "undefined") {
        Maze.updateMap(map);
        $("#blocklySvgZone").empty();
        Maze.init();
    }

}


/**
 * Create and layout all the nodes for the path, scenery, Pegman, and goal.
 */
Maze.drawMap = function() {
    var svg = document.getElementById('blocklySvgZone');
    var x, y, tile;
    var scale = Math.max(Maze.ROWS, Maze.COLS) * Maze.SQUARE_SIZE;
    svg.setAttribute('viewBox', '0 0 ' + scale + ' ' + scale);
    svg.setAttribute('style', '');

    // Draw the outer square.
    var square = document.createElementNS(Blockly.SVG_NS, 'rect');
    square.setAttribute('width', Maze.MAZE_WIDTH);
    square.setAttribute('height', Maze.MAZE_HEIGHT);
    square.setAttribute('fill', '#F1EEE7');
    square.setAttribute('stroke-width', 1);
    square.setAttribute('stroke', '#CCB');
    svg.appendChild(square);

    if (Maze.SKIN.background) {
        for(var xVal = 0; xVal < Maze.COLS; xVal++){
            for(var yVal = 0; yVal < Maze.ROWS; yVal++){
                var tile = document.createElementNS(Blockly.SVG_NS, 'image');
                tile.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
                    Maze.SKIN.background);
                tile.setAttribute('height', Maze.SQUARE_SIZE);
                tile.setAttribute('width', Maze.SQUARE_SIZE);
                tile.setAttribute('x', xVal*Maze.SQUARE_SIZE);
                tile.setAttribute('y', yVal*Maze.SQUARE_SIZE);
                svg.appendChild(tile);
            }
        }
    }
    if (Maze.SKIN.graph) {
        // Draw the grid lines.
        var offset = 0.5;
        for (var k = 0; k < Maze.ROWS; k++) {
            var h_line = document.createElementNS(Blockly.SVG_NS, 'line');
            h_line.setAttribute('y1', k * Maze.SQUARE_SIZE + offset);
            h_line.setAttribute('x2', Maze.MAZE_WIDTH);
            h_line.setAttribute('y2', k * Maze.SQUARE_SIZE + offset);
            h_line.setAttribute('stroke', Maze.SKIN.graph);
            h_line.setAttribute('stroke-width', 1);
            svg.appendChild(h_line);
        }
        for (var k = 0; k < Maze.COLS; k++) {
            var v_line = document.createElementNS(Blockly.SVG_NS, 'line');
            v_line.setAttribute('x1', k * Maze.SQUARE_SIZE + offset);
            v_line.setAttribute('x2', k * Maze.SQUARE_SIZE + offset);
            v_line.setAttribute('y2', Maze.MAZE_HEIGHT);
            v_line.setAttribute('stroke', Maze.SKIN.graph);
            v_line.setAttribute('stroke-width', 1);
            svg.appendChild(v_line);
        }
    }

    // Add finish marker.
    var finishMarker = document.createElementNS(Blockly.SVG_NS, 'image');
    finishMarker.setAttribute('id', 'finish');
    finishMarker.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
        Maze.SKIN.marker);
    finishMarker.setAttribute('height', 43);
    finishMarker.setAttribute('width', 50);
    svg.appendChild(finishMarker);

    // Pegman's clipPath element, whose (x, y) is reset by Maze.displayPegman
    var pegmanClip = document.createElementNS(Blockly.SVG_NS, 'clipPath');
    pegmanClip.setAttribute('id', 'pegmanClipPath');
    var clipRect = document.createElementNS(Blockly.SVG_NS, 'rect');
    clipRect.setAttribute('id', 'clipRect');
    clipRect.setAttribute('width', Maze.PEGMAN_WIDTH);
    clipRect.setAttribute('height', Maze.PEGMAN_HEIGHT);
    pegmanClip.appendChild(clipRect);
    svg.appendChild(pegmanClip);

    // Add obstacles and walls
    var obsId = 0;
    var wallID = 0;
    for (y = 0; y < Maze.ROWS; y++) {
        for (x = 0; x < Maze.COLS; x++) {
            if (Maze.map[y][x] === Maze.SquareType.OBSTACLE) {
                var obsIcon = document.createElementNS(Blockly.SVG_NS, 'image');
                obsIcon.setAttribute('id', 'obstacle' + obsId);
                obsIcon.setAttribute('height', 43 * Maze.SKIN.obstacleScale);
                obsIcon.setAttribute('width', 50 * Maze.SKIN.obstacleScale);
                obsIcon.setAttributeNS(
                    'http://www.w3.org/1999/xlink', 'xlink:href', Maze.SKIN.obstacleIdle);
                obsIcon.setAttribute('x',
                    Maze.SQUARE_SIZE * (x + 0.5) -
                    obsIcon.getAttribute('width') / 2);
                obsIcon.setAttribute('y',
                    Maze.SQUARE_SIZE * (y + 0.9) -
                    obsIcon.getAttribute('height'));
                svg.appendChild(obsIcon);
                ++obsId;
            }
            if (Maze.map[y][x] === Maze.SquareType.WALL) {
                var obsIcon = document.createElementNS(Blockly.SVG_NS, 'image');
                obsIcon.setAttribute('id', 'wall' + wallID);
                obsIcon.setAttribute('height', 43 * Maze.SKIN.obstacleScale);
                obsIcon.setAttribute('width', 50 * Maze.SKIN.obstacleScale);
                obsIcon.setAttributeNS(
                    'http://www.w3.org/1999/xlink', 'xlink:href', Maze.SKIN.wall);
                obsIcon.setAttribute('x',
                    Maze.SQUARE_SIZE * (x + 0.5) -
                    obsIcon.getAttribute('width') / 2);
                obsIcon.setAttribute('y',
                    Maze.SQUARE_SIZE * (y + 0.9) -
                    obsIcon.getAttribute('height') );
                svg.appendChild(obsIcon);
                ++wallID;
            }

        }
    }

    // Add Pegman.
    var pegmanIcon = document.createElementNS(Blockly.SVG_NS, 'image');
    pegmanIcon.setAttribute('id', 'pegman');
    pegmanIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
        Maze.SKIN.sprite);
    pegmanIcon.setAttribute('height', Maze.PEGMAN_HEIGHT);
    pegmanIcon.setAttribute('width', Maze.PEGMAN_WIDTH * 21); // 49 * 21 = 1029
    pegmanIcon.setAttribute('clip-path', 'url(#pegmanClipPath)');
    svg.appendChild(pegmanIcon);
};

/**
 * Initialize Blockly and the maze.  Called on page load.
 */
Maze.init = function() {

    if (typeof Blockly === "undefined" || typeof Blockly.getMainWorkspace() === "undefined" || Blockly.getMainWorkspace() === null) {
        console.warn("Maze.init() called but Blockly or workspace was not loaded.");
        window.setTimeout(Maze.init, 20);
        return;
    }

    //
    // Blockly.Blocks && (Blockly.Blocks.ONE_BASED_INDEXING = false);
    // Blockly.JavaScript && (Blockly.JavaScript.ONE_BASED_INDEXING = false);

    Blockly.getMainWorkspace().getAudioManager().load(Maze.SKIN.winSound, 'win');
    Blockly.getMainWorkspace().getAudioManager().load(Maze.SKIN.crashSound, 'fail');
    Blockly.getMainWorkspace().getAudioManager().load(Maze.SKIN.obstacleSound, 'obstacle');
    // Not really needed, there are no user-defined functions or variables.
    Blockly.JavaScript.addReservedWords('moveForward,moveBackward,' +
        'turnRight,turnLeft,isPathForward,isPathRight,isPathBackward,isPathLeft');

    Maze.drawMap();

    // Locate the start and finish squares.
    for (var y = 0; y < Maze.ROWS; y++) {
        for (var x = 0; x < Maze.COLS; x++) {
            if (Maze.map[y][x] == Maze.SquareType.START) {
                Maze.start_ = {
                    x: x,
                    y: y
                };
            } else if (Maze.map[y][x] == Maze.SquareType.FINISH) {
                Maze.finish_ = {
                    x: x,
                    y: y
                };
            }
        }
    }

    Maze.reset(true);

    // document.body.addEventListener('mousemove', Maze.updatePegSpin_, true);

    // Switch to zero-based indexing so that later JS levels match the blocks.
    Blockly.Blocks && (Blockly.Blocks.ONE_BASED_INDEXING = false);
    Blockly.JavaScript && (Blockly.JavaScript.ONE_BASED_INDEXING = false);
};

/**
 * Reset the maze to the start position and kill any pending animation tasks.
 * @param {boolean} first True if an opening animation is to be played.
 */
Maze.reset = function(first) {
    var x, y;

    // Kill all tasks.
    for (x = 0; x < Maze.pidList.length; x++) {
        window.clearTimeout(Maze.pidList[x]);
    }
    Maze.pidList = [];

    // Move Pegman into position.
    Maze.pegmanX = Maze.start_.x;
    Maze.pegmanY = Maze.start_.y;

    if (first) {
        Maze.pegmanD = Maze.startDirection + 1;
        Maze.scheduleFinish(false);
        Maze.pidList.push(setTimeout(function() {
            Maze.schedule([Maze.pegmanX, Maze.pegmanY, Maze.pegmanD * 4], [Maze.pegmanX, Maze.pegmanY, Maze.pegmanD * 4 - 4]);
            Maze.pegmanD++;
        }, window.stepSpeed * 5));
    } else {
        Maze.pegmanD = Maze.startDirection;
        Maze.displayPegman(Maze.pegmanX, Maze.pegmanY, Maze.pegmanD * 4);
    }

    // Move the finish icon into position.
    var finishIcon = document.getElementById('finish');
    finishIcon.setAttribute('x', Maze.SQUARE_SIZE * (Maze.finish_.x));
    finishIcon.setAttribute('y', Maze.SQUARE_SIZE * (Maze.finish_.y));
    finishIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', Maze.SKIN.marker);

    // Reset pegman's visibility.
    var pegmanIcon = document.getElementById('pegman');
    pegmanIcon.setAttribute('opacity', 1);
    pegmanIcon.setAttribute('visibility', 'visible');

    // Reset the obstacle image.
    var obsId = 0;
    for (y = 0; y < Maze.ROWS; y++) {
        for (x = 0; x < Maze.COLS; x++) {
            var obsIcon = document.getElementById('obstacle' + obsId);
            if (obsIcon) {
                obsIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
                    Maze.SKIN.obstacleIdle);
            }
            ++obsId;
        }
    }

};


/**
 * Iterate through the recorded path and animate pegman's actions.
 */
Maze.animate = function() {
    var action = Maze.log.shift();
    if (!action) {
        //   for (var x = 0; x < Maze.pidList.length; x++) {
        //     window.clearTimeout(Maze.pidList[x]);
        //   }
        return;
    }
    switch (action[0]) {
        case 'north':
            Maze.schedule([Maze.pegmanX, Maze.pegmanY, Maze.pegmanD * 4], [Maze.pegmanX, Maze.pegmanY - 1, Maze.pegmanD * 4]);
            Maze.pegmanY--;
            break;
        case 'east':
            Maze.schedule([Maze.pegmanX, Maze.pegmanY, Maze.pegmanD * 4], [Maze.pegmanX + 1, Maze.pegmanY, Maze.pegmanD * 4]);
            Maze.pegmanX++;
            break;
        case 'south':
            Maze.schedule([Maze.pegmanX, Maze.pegmanY, Maze.pegmanD * 4], [Maze.pegmanX, Maze.pegmanY + 1, Maze.pegmanD * 4]);
            Maze.pegmanY++;
            break;
        case 'west':
            Maze.schedule([Maze.pegmanX, Maze.pegmanY, Maze.pegmanD * 4], [Maze.pegmanX - 1, Maze.pegmanY, Maze.pegmanD * 4]);
            Maze.pegmanX--;
            break;
        case 'look_north':
            Maze.scheduleLook(Maze.DirectionType.NORTH);
            break;
        case 'look_east':
            Maze.scheduleLook(Maze.DirectionType.EAST);
            break;
        case 'look_south':
            Maze.scheduleLook(Maze.DirectionType.SOUTH);
            break;
        case 'look_west':
            Maze.scheduleLook(Maze.DirectionType.WEST);
            break;
        case 'fail_forward':
            Maze.scheduleFail(true);
            break;
        case 'fail_backward':
            Maze.scheduleFail(false);
            break;
        case 'right':
            Maze.schedule([Maze.pegmanX, Maze.pegmanY, Maze.pegmanD * 4], [Maze.pegmanX, Maze.pegmanY, Maze.pegmanD * 4 + 4]);
            Maze.pegmanD = Maze.constrainDirection4(Maze.pegmanD + 1);
            break;
        case 'left':
            Maze.schedule([Maze.pegmanX, Maze.pegmanY, Maze.pegmanD * 4], [Maze.pegmanX, Maze.pegmanY, Maze.pegmanD * 4 - 4]);
            Maze.pegmanD = Maze.constrainDirection4(Maze.pegmanD - 1);
            break;
        case 'finish':
            Maze.scheduleFinish(true);
            break;
            // TODO maybe add this
            // case 'plant':
            //     Maze.animatePlant();
            //     break;
    }
};

Maze.getPlayerX = function(){
    return Maze.pegmanX
}

Maze.getPlayerY = function(){
    return Maze.pegmanY
}

Maze.getTargetX = function(){
    return Maze.finish_.x
}

Maze.getTargetY = function(){
    return Maze.finish_.y
}

Maze.getPlayerDir = function(){
    return Maze.pegmanD;
}

Maze.canMove = function(){
    console.log("can move ?")
    switch(Maze.pegmanD){
        case 0: //North
            if(Maze.pegmanY == 0) return false
            else 
                {

                    console.log(Maze.map[Maze.pegmanY-1][Maze.pegmanX] != Maze.SquareType.WALL)
                    return Maze.map[Maze.pegmanY-1][Maze.pegmanX] != Maze.SquareType.WALL
                }
        case 1: //East
            if(Maze.pegmanX == Maze.map[0].length-1) return false
            else 
                {
                    console.log(Maze.map[Maze.pegmanY][Maze.pegmanX+1] != Maze.SquareType.WALL)
                    return Maze.map[Maze.pegmanY][Maze.pegmanX+1] != Maze.SquareType.WALL
                }
        case 2: //South
            if(Maze.pegmanY == Maze.map.length-1) return false
            else {
                console.log(Maze.map[Maze.pegmanY+1][Maze.pegmanX] != Maze.SquareType.WALL)
                return Maze.map[Maze.pegmanY+1][Maze.pegmanX] != Maze.SquareType.WALL
            }
        case 3: //West
            if(Maze.pegmanX == 0) return false
            else {
                console.log(Maze.map[Maze.pegmanY][Maze.pegmanX-1] != Maze.SquareType.WALL)
                return Maze.map[Maze.pegmanY][Maze.pegmanX-1] != Maze.SquareType.WALL
            }
    }
}

Maze.isInFrontOfEnemy = function(){
    switch(Maze.pegmanD){
        case 0: //North
            if(Maze.pegmanY == 0) return false
            else return Maze.map[Maze.pegmanY-1][Maze.pegmanX] == Maze.SquareType.OBSTACLE
        case 1: //East
            if(Maze.pegmanX == Maze.map.length-1) return false
            else return Maze.map[Maze.pegmanY][Maze.pegmanX+1] == Maze.SquareType.OBSTACLE
        case 2: //South
            if(Maze.pegmanY == Maze.map[0].length-1) return false
            else return Maze.map[Maze.pegmanY+1][Maze.pegmanX] == Maze.SquareType.OBSTACLE
        case 3: //West
            if(Maze.pegmanX == 0) return false
            else return Maze.map[Maze.pegmanY][Maze.pegmanX-1] == Maze.SquareType.OBSTACLE
    }
}

Maze.isOnTarget = function(){
    return Maze.finish_.y == Maze.pegmanY && Maze.finish_.x == Maze.pegmanX
}

Maze.spyOnTarget = function(){
    if (Maze.isOnTarget()){
        Maze.finished = true
        Maze.result = Maze.ResultType.SUCCESS;
    }
}

/**
 * Schedule the animations for a move or turn.
 * @param {!Array.<number>} startPos X, Y and direction starting points.
 * @param {!Array.<number>} endPos X, Y and direction ending points.
 */
Maze.schedule = function(startPos, endPos) {
    var deltas = [(endPos[0] - startPos[0]) / 4,
        (endPos[1] - startPos[1]) / 4,
        (endPos[2] - startPos[2]) / 4
    ];
    Maze.displayPegman(startPos[0] + deltas[0],
        startPos[1] + deltas[1],
        Maze.constrainDirection16(startPos[2] + deltas[2]));
    Maze.pidList.push(setTimeout(function() {
        Maze.displayPegman(startPos[0] + deltas[0] * 2,
            startPos[1] + deltas[1] * 2,
            Maze.constrainDirection16(startPos[2] + deltas[2] * 2));
    }, window.stepSpeed));
    Maze.pidList.push(setTimeout(function() {
        Maze.displayPegman(startPos[0] + deltas[0] * 3,
            startPos[1] + deltas[1] * 3,
            Maze.constrainDirection16(startPos[2] + deltas[2] * 3));
    }, window.stepSpeed));
    Maze.pidList.push(setTimeout(function() {
        Maze.displayPegman(endPos[0], endPos[1],
            Maze.constrainDirection16(endPos[2]));
    }, window.stepSpeed));

    if (Maze.finish_.x == endPos[0] && Maze.finish_.y == endPos[1]) {
        Maze.pidList.push(setTimeout(function() {
            var finishIcon = document.getElementById('finish');
            if (finishIcon.getAttribute('xlink:href') != Maze.SKIN.goalAnimation) {
                finishIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', Maze.SKIN.goalAnimation);
                Blockly.getMainWorkspace().getAudioManager().play('win', 0.3);
            }
        }, window.stepSpeed * 4));
    }
};

/**
 * Schedule the animations and sounds for a failed move.
 * @param {boolean} forward True if forward, false if backward.
 */
Maze.scheduleFail = function(forward) {
    var deltaX = 0;
    var deltaY = 0;
    switch (Maze.pegmanD) {
        case Maze.DirectionType.NORTH:
            deltaY = -1;
            break;
        case Maze.DirectionType.EAST:
            deltaX = 1;
            break;
        case Maze.DirectionType.SOUTH:
            deltaY = 1;
            break;
        case Maze.DirectionType.WEST:
            deltaX = -1;
            break;
    }
    if (!forward) {
        deltaX = -deltaX;
        deltaY = -deltaY;
    }

    var targetX = Maze.pegmanX + deltaX + 1;
    var targetY = Maze.pegmanY + deltaY;
    var squareType = Maze.map[targetY][targetX];

    if (squareType === Maze.SquareType.OBSTACLE) {
        BlocklyTaskInterpreter.alert("Vous avez heurté un obstacle !");
        // Play the sound
        Blockly.getMainWorkspace().getAudioManager().play('obstacle');

        // Play the animation
        var direction16 = Maze.constrainDirection16(Maze.pegmanD * 4);
        var obsId = targetX + Maze.COLS * targetY;
        var obsIcon = document.getElementById('obstacle' + obsId);
        obsIcon.setAttributeNS(
            'http://www.w3.org/1999/xlink', 'xlink:href',
            Maze.SKIN.obstacleAnimation);
        Maze.pidList.push(setTimeout(function() {
            Maze.displayPegman(Maze.pegmanX + deltaX / 2,
                Maze.pegmanY + deltaY / 2,
                direction16);
        }, window.stepSpeed));


        var pegmanIcon = document.getElementById('pegman');

        Maze.pidList.push(setTimeout(function() {
            pegmanIcon.setAttribute('visibility', 'hidden');
        }, window.stepSpeed * 2));

        Maze.pidList.push(setTimeout(function() {
            Blockly.getMainWorkspace().getAudioManager().play('failure');
        }, window.stepSpeed));
    } else if (Maze.SKIN.crashType == Maze.CRASH_STOP) {
        BlocklyTaskInterpreter.alert("Vous avez heurté un mur !");
        // Bounce bounce.
        deltaX /= 4;
        deltaY /= 4;
        var direction16 = Maze.constrainDirection16(Maze.pegmanD * 4);
        Maze.displayPegman(Maze.pegmanX + deltaX,
            Maze.pegmanY + deltaY,
            direction16);
        Blockly.getMainWorkspace().getAudioManager().play('fail', 0.5);
        Maze.pidList.push(setTimeout(function() {
            Maze.displayPegman(Maze.pegmanX,
                Maze.pegmanY,
                direction16);
        }, window.stepSpeed));
        Maze.pidList.push(setTimeout(function() {
            Maze.displayPegman(Maze.pegmanX + deltaX,
                Maze.pegmanY + deltaY,
                direction16);
            Blockly.getMainWorkspace().getAudioManager().play('fail', 0.5);
        }, window.stepSpeed * 2));
        Maze.pidList.push(setTimeout(function() {
            Maze.displayPegman(Maze.pegmanX, Maze.pegmanY, direction16);
        }, window.stepSpeed * 3));
    } else {
        // Add a small random delta away from the grid.
        var deltaZ = (Math.random() - 0.5) * 10;
        var deltaD = (Math.random() - 0.5) / 2;
        deltaX += (Math.random() - 0.5) / 4;
        deltaY += (Math.random() - 0.5) / 4;
        deltaX /= 8;
        deltaY /= 8;
        var acceleration = 0;
        if (Maze.SKIN.crashType == Maze.CRASH_FALL) {
            acceleration = 0.01;
        }
        Maze.pidList.push(setTimeout(function() {
            Blockly.getMainWorkspace().getAudioManager().play('fail', 0.5);
        }, window.stepSpeed * 2));
        var setPosition = function(n) {
            return function() {
                var direction16 = Maze.constrainDirection16(Maze.pegmanD * 4 +
                    deltaD * n);
                Maze.displayPegman(Maze.pegmanX + deltaX * n,
                    Maze.pegmanY + deltaY * n,
                    direction16,
                    deltaZ * n);
                deltaY += acceleration;
            };
        };
        // 100 frames should get Pegman offscreen.
        for (var i = 1; i < 100; i++) {
            Maze.pidList.push(setTimeout(setPosition(i),
                window.stepSpeed * i / 2));
        }
    }
};

/**
 * Schedule the animations and sound for a victory dance.
 * @param {boolean} sound Play the victory sound.
 */
Maze.scheduleFinish = function(sound) {
    var direction16 = Maze.constrainDirection16(Maze.pegmanD * 4);
    Maze.displayPegman(Maze.pegmanX, Maze.pegmanY, 16);
    if (sound) {
        Blockly.getMainWorkspace().getAudioManager().play('win', 0.5);
    }
    window.stepSpeed = 250; // Slow down victory animation a bit.
    Maze.pidList.push(setTimeout(function() {
        Maze.displayPegman(Maze.pegmanX, Maze.pegmanY, 18);
    }, window.stepSpeed));
    Maze.pidList.push(setTimeout(function() {
        Maze.displayPegman(Maze.pegmanX, Maze.pegmanY, 16);
    }, window.stepSpeed * 2));
    Maze.pidList.push(setTimeout(function() {
        Maze.displayPegman(Maze.pegmanX, Maze.pegmanY, direction16);
    }, window.stepSpeed * 3));
};

/**
 * Display Pegman at the specified location, facing the specified direction.
 * @param {number} x Horizontal grid (or fraction thereof).
 * @param {number} y Vertical grid (or fraction thereof).
 * @param {number} d Direction (0 - 15) or dance (16 - 17).
 * @param {number} opt_angle Optional angle (in degrees) to rotate Pegman.
 */
Maze.displayPegman = function(x, y, d, opt_angle) {
    var pegmanIcon = document.getElementById('pegman');
    pegmanIcon.setAttribute('x',
        x * Maze.SQUARE_SIZE - d * Maze.PEGMAN_WIDTH + 1);
    pegmanIcon.setAttribute('y',
        Maze.SQUARE_SIZE * (y + 0.5) - Maze.PEGMAN_HEIGHT / 2);
    if (opt_angle) {
        pegmanIcon.setAttribute('transform', 'rotate(' + opt_angle + ', ' +
            (x * Maze.SQUARE_SIZE + Maze.SQUARE_SIZE / 2) + ', ' +
            (y * Maze.SQUARE_SIZE + Maze.SQUARE_SIZE / 2) + ')');
    } else {
        pegmanIcon.setAttribute('transform', 'rotate(0, 0, 0)');
    }

    var clipRect = document.getElementById('clipRect');
    clipRect.setAttribute('x', x * Maze.SQUARE_SIZE + 1);
    clipRect.setAttribute('y', pegmanIcon.getAttribute('y'));
};

/**
 * Display the look icon at Pegman's current location,
 * in the specified direction.
 * @param {!Maze.DirectionType} d Direction (0 - 3).
 */
Maze.scheduleLook = function(d) {
    var x = Maze.pegmanX;
    var y = Maze.pegmanY;
    switch (d) {
        case Maze.DirectionType.NORTH:
            x += 0.5;
            break;
        case Maze.DirectionType.EAST:
            x += 1;
            y += 0.5;
            break;
        case Maze.DirectionType.SOUTH:
            x += 0.5;
            y += 1;
            break;
        case Maze.DirectionType.WEST:
            y += 0.5;
            break;
    }
    x *= Maze.SQUARE_SIZE;
    y *= Maze.SQUARE_SIZE;
    d = d * 90 - 45;

    var lookIcon = document.getElementById('look');
    lookIcon.setAttribute('transform',
        'translate(' + x + ', ' + y + ') ' +
        'rotate(' + d + ' 0 0) scale(.4)');
    var paths = lookIcon.getElementsByTagName('path');
    lookIcon.style.display = 'inline';
    for (var x = 0, path; path = paths[x]; x++) {
        Maze.scheduleLookStep(path, window.stepSpeed * x);
    }
};

/**
 * Schedule one of the 'look' icon's waves to appear, then disappear.
 * @param {!Element} path Element to make appear.
 * @param {number} delay Milliseconds to wait before making wave appear.
 */
Maze.scheduleLookStep = function(path, delay) {
    Maze.pidList.push(setTimeout(function() {
        path.style.display = 'inline';
        setTimeout(function() {
            path.style.display = 'none';
        }, window.stepSpeed * 2);
    }, delay));
};

/**
 * Keep the direction within 0-3, wrapping at both ends.
 * @param {number} d Potentially out-of-bounds direction value.
 * @return {number} Legal direction value.
 */
Maze.constrainDirection4 = function(d) {
    d = Math.round(d) % 4;
    if (d < 0) {
        d += 4;
    }
    return d;
};

/**
 * Keep the direction within 0-15, wrapping at both ends.
 * @param {number} d Potentially out-of-bounds direction value.
 * @return {number} Legal direction value.
 */
Maze.constrainDirection16 = function(d) {
    d = Math.round(d) % 16;
    if (d < 0) {
        d += 16;
    }
    return d;
};

// Core functions.

/**
 * Attempt to move pegman forward or backward.
 * @param {number} direction Direction to move (0 = forward, 2 = backward).
 * @param {string} id ID of block that triggered this action.
 * @throws {true} If the end of the maze is reached.
 * @throws {false} If Pegman collides with a wall.
 */
Maze.move = function(direction, id) {
    var isNotAPath = !Maze.isPath(direction, null);
    if (isNotAPath) {
        Maze.log.push(['fail_' + (direction ? 'backward' : 'forward'), id]);
        Maze.result = Maze.ResultType.ERROR;
    }
    // If moving backward, flip the effective direction.
    var effectiveDirection = Maze.pegmanD + direction;
    var command;
    switch (Maze.constrainDirection4(effectiveDirection)) {
        case Maze.DirectionType.NORTH:
            if (isNotAPath) Maze.pegmanY++;
            command = 'north';
            break;
        case Maze.DirectionType.EAST:
            if (isNotAPath) Maze.pegmanX--;
            command = 'east';
            break;
        case Maze.DirectionType.SOUTH:
            if (isNotAPath) Maze.pegmanY--;
            command = 'south';
            break;
        case Maze.DirectionType.WEST:
            if (isNotAPath) Maze.pegmanX++;
            command = 'west';
            break;
    }
    Maze.log.push([command, id]);
};

/**
 * Turn pegman left or right.
 * @param {number} direction Direction to turn (0 = left, 1 = right).
 * @param {string} id ID of block that triggered this action.
 */
Maze.turn = function(direction, id) {
    if (direction) {
        // Right turn (clockwise).
        // Maze.pegmanD++;
        Maze.log.push(['right', id]);
    } else {
        // Left turn (counterclockwise).
        // Maze.pegmanD--;
        Maze.log.push(['left', id]);
    }
    Maze.pegmanD = Maze.constrainDirection4(Maze.pegmanD);
};

/**
 * Is there a path next to pegman?
 * @param {number} direction Direction to look
 *     (0 = forward, 1 = right, 2 = backward, 3 = left).
 * @param {?string} id ID of block that triggered this action.
 *     Null if called as a helper function in Maze.move().
 * @return {boolean} True if there is a path.
 */
Maze.isPath = function(direction, id) {
    var effectiveDirection = Maze.pegmanD + direction;
    var square;
    var command;
    switch (Maze.constrainDirection4(effectiveDirection)) {
        case Maze.DirectionType.NORTH:
            square = Maze.map[Maze.pegmanY - 1] &&
                Maze.map[Maze.pegmanY - 1][Maze.pegmanX];
            command = 'look_north';
            break;
        case Maze.DirectionType.EAST:
            square = Maze.map[Maze.pegmanY][Maze.pegmanX + 1];
            command = 'look_east';
            break;
        case Maze.DirectionType.SOUTH:
            square = Maze.map[Maze.pegmanY + 1] &&
                Maze.map[Maze.pegmanY + 1][Maze.pegmanX];
            command = 'look_south';
            break;
        case Maze.DirectionType.WEST:
            square = Maze.map[Maze.pegmanY][Maze.pegmanX - 1];
            command = 'look_west';
            break;
    }
    if (id) {
        Maze.log.push([command, id]);
    }
    return square !== Maze.SquareType.WALL && square !== Maze.SquareType.OBSTACLE && square !== undefined;
};

/**
 * Has the player finished the maze ?
 */
Maze.notDone = function() {
    return !Maze.finished;
};

if (document.getElementById('blocklySvgZone') != null) {
    window.addEventListener('load', Maze.init);
} else {
    console.warn('Cannot find blocklySvgZone element.');
}
