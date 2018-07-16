var task_directory_path = window.location.pathname + "/";
var res_path = task_directory_path+ "maze/";
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

Maze.CRASH_STOP = 1;

Maze.SKIN = {
    // This is required when move pegman animation is set
    actionSpeedScale: {
        nectar: 1,
    },
    background: res_path + json.visuals.background,
    tiles: res_path + json.visuals.tiles,
    sprite: res_path + json.visuals.sprite,
    cloud: res_path + json.visuals.cloud,
    cloudAnimation: res_path + json.visuals.cloudAnimation,
    honey: res_path + json.visuals.honey,
    purpleFlower: res_path + json.visuals.purpleFlower,
    redFlower: res_path + json.visuals.redFlower,
    obstacleScale: json.visuals.obstacleScale,

    //Sounds
    winGoalSound: [res_path + 'win.mp3', res_path + 'win.ogg'],
    failureSound: [res_path + 'failure.mp3', res_path + 'failure.ogg'],
    obstacleSound: [res_path + 'obstacle.mp3', res_path + 'obstacle.ogg'],

    //Never called
    obstacleIdle: res_path + 'obstacle.png',
    obstacleAnimation: '',

    //Unused
    look: '#000',
    movePegmanAnimation: res_path + 'move_avatar.png',
    movePegmanAnimationFrameNumber: 9,
    movePegmanAnimationSpeedScale: 1.5,
    nectarSound: [res_path + 'getNectar.mp3', res_path + 'getNectar.ogg'],
    nonDisappearingPegmanHittingObstacle: true,
    turnAfterVictory: false,
    wall0Sound: [res_path + 'wall0.mp3', res_path + 'wall0.ogg'],
    wall1Sound: [res_path + 'wall1.mp3', res_path + 'wall1.ogg'],
    wall2Sound: [res_path + 'wall2.mp3', res_path + 'wall2.ogg'],
    wall3Sound: [res_path + 'wall3.mp3', res_path + 'wall3.ogg'],
    wall4Sound: [res_path + 'wall4.mp3', res_path + 'wall4.ogg'],
    wallPegmanAnimation: res_path + 'wall_avatar.png',
    wallSound: [res_path + 'wall.mp3', res_path + 'wall.ogg'],
    beeSound: true,
    danceOnLoad: false,
    hittingWallAnimation: res_path + 'wall.gif',
    honeySound: [res_path + 'makeHoney.mp3', res_path + 'makeHoney.ogg'],
    avatarIdle: res_path + 'idle_avatar.gif',

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

// The maze map
Maze.map = json.map.layout[0];
// The special cells (flowers, honey and cloud)
Maze.mapCells = json.map.specialCells;
// Set the remainingValue fields
for (var kind in Maze.mapCells) { //For each kind of cell
    if(kind != "cloud"){
        for(var cell of Maze.mapCells[kind]){
            cell.remainingValue = cell.value;
        }
    }
}

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
Maze.FIRSTMOVE = true; //On first move, we need to reveal

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

/**
 * Starting direction.
 */
Maze.startDirection = Maze.DirectionType[json.map.startDirection];

/**
 * PIDs of animation tasks currently executing.
 */
Maze.pidList = [];

// Map each possible shape to a sprite.
// Input: Binary string representing Centre/North/West/South/East squares.
// Output: [x, y] coordinates of each tile's sprite in tiles.png.
Maze.tile_SHAPES = {
    '10010': [4, 0], // Dead ends
    '10001': [3, 3],
    '11000': [0, 1],
    '10100': [0, 2],
    '11010': [4, 1], // Vertical
    '10101': [3, 2], // Horizontal
    '10110': [0, 0], // Elbows
    '10011': [2, 0],
    '11001': [4, 2],
    '11100': [2, 3],
    '11110': [1, 1], // Junctions
    '10111': [1, 0],
    '11011': [2, 1],
    '11101': [1, 2],
    '11111': [2, 2], // Cross
    'null0': [4, 3], // Empty
    'null1': [3, 0],
    'null2': [3, 1],
    'null3': [0, 3],
    'null4': [1, 3]
};

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

    if (Maze.SKIN.background) { //Use an image as background
        var tile = document.createElementNS(Blockly.SVG_NS, 'image');
        tile.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
            Maze.SKIN.background);
        tile.setAttribute('height', Maze.MAZE_HEIGHT);
        tile.setAttribute('width', Maze.MAZE_WIDTH);
        tile.setAttribute('x', 0);
        tile.setAttribute('y', 0);
        svg.appendChild(tile);
    }

    // Draw the tiles making up the maze map.
    // Return a value of '0' if the specified square is wall or out of bounds,
    // '1' otherwise (empty, start, finish).
    var normalize = function(x, y) {
        if (x < 0 || x >= Maze.COLS || y < 0 || y >= Maze.ROWS) {
            return '0';
        }
        return (Maze.map[y][x] == Maze.SquareType.WALL) ? '0' : '1';
    };

    // Compute and draw the tile for each square.
    var tileId = 0;
    for (y = 0; y < Maze.ROWS; y++) {
        for (x = 0; x < Maze.COLS; x++) {
            // Compute the tile index.
            tile = normalize(x, y) +
                normalize(x, y - 1) + // North.
                normalize(x + 1, y) + // West.
                normalize(x, y + 1) + // South.
                normalize(x - 1, y); // East.

            // Draw the tile.
            if (!Maze.tile_SHAPES[tile]) {
                // Empty square.  Use null0 for large areas, with null1-4 for borders.
                // Add some randomness to avoid large empty spaces.
                if (tile == '00000' && Math.random() > 0.3) {
                    tile = 'null0';
                } else {
                    tile = 'null' + Math.floor(1 + Math.random() * 4);
                }
            }
            var left = Maze.tile_SHAPES[tile][0];
            var top = Maze.tile_SHAPES[tile][1];
            // Tile's clipPath element.
            var tileClip = document.createElementNS(Blockly.SVG_NS, 'clipPath');
            tileClip.setAttribute('id', 'tileClipPath' + tileId);
            var clipRect = document.createElementNS(Blockly.SVG_NS, 'rect');
            clipRect.setAttribute('width', Maze.SQUARE_SIZE);
            clipRect.setAttribute('height', Maze.SQUARE_SIZE);

            clipRect.setAttribute('x', x * Maze.SQUARE_SIZE);
            clipRect.setAttribute('y', y * Maze.SQUARE_SIZE);

            tileClip.appendChild(clipRect);
            svg.appendChild(tileClip);
            // Tile sprite.
            tile = document.createElementNS(Blockly.SVG_NS, 'image');
            tile.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
                Maze.SKIN.tiles);
            // Position the tile sprite relative to the clipRect.
            tile.setAttribute('height', Maze.SQUARE_SIZE * 4);
            tile.setAttribute('width', Maze.SQUARE_SIZE * 5);
            tile.setAttribute('clip-path', 'url(#tileClipPath' + tileId + ')');
            tile.setAttribute('x', (x - left) * Maze.SQUARE_SIZE);
            tile.setAttribute('y', (y - top) * Maze.SQUARE_SIZE);
            svg.appendChild(tile);
            tileId++;
        }
    }

    // Pegman's clipPath element, whose (x, y) is reset by Maze.displayPegman
    var pegmanClip = document.createElementNS(Blockly.SVG_NS, 'clipPath');
    pegmanClip.setAttribute('id', 'pegmanClipPath');
    var clipRect = document.createElementNS(Blockly.SVG_NS, 'rect');
    clipRect.setAttribute('id', 'clipRect');
    clipRect.setAttribute('width', Maze.PEGMAN_WIDTH);
    clipRect.setAttribute('height', Maze.PEGMAN_HEIGHT);
    pegmanClip.appendChild(clipRect);
    svg.appendChild(pegmanClip);

    // Add obstacles.
    var obsId = 0;
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
            }
            ++obsId;
        }
    }

    // Add specific cells
    for (var kind in Maze.mapCells) { //For each kind of cell
        for(var cell of Maze.mapCells[kind]){
            var cellIcon = document.createElementNS(Blockly.SVG_NS, 'image');
            cellIcon.setAttribute('id', 'obstacle' + obsId);
            cellIcon.setAttribute('height', 43 * Maze.SKIN.obstacleScale);
            cellIcon.setAttribute('width', 50 * Maze.SKIN.obstacleScale);
            cellIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', Maze.SKIN[kind]);
            cellIcon.setAttribute('x',
                Maze.SQUARE_SIZE * (cell.x + 0.5) -
                cellIcon.getAttribute('width') / 2);
            cellIcon.setAttribute('y',
                Maze.SQUARE_SIZE * (cell.y + 0.9) -
                cellIcon.getAttribute('height'));
            svg.appendChild(cellIcon);
            if(kind == "cloud"){
                cell.id = obsId;
            }
            ++obsId;
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

    Blockly.getMainWorkspace().getAudioManager().load(Maze.SKIN.winGoalSound, 'win');
    Blockly.getMainWorkspace().getAudioManager().load(Maze.SKIN.failureSound, 'fail');
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
    //Replace the clouds
    for(var cell of Maze.mapCells["cloud"]){
        //Play the animation
        var cellIcon = document.getElementById("obstacle"+cell.id); //Get the element
        //Change the value to the image
        cellIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', Maze.SKIN["cloud"]);
    }

    //Add the remaining value on the special cells
    for (var kind in Maze.mapCells) { //For each kind of cell
        for(var cell of Maze.mapCells[kind]){
            if(kind == "purpleFlower"){ //When resetted, purple flowers get a question mark
                Maze.updateOrCreateText_(cell.y, cell.x, "?");
            }
            else{
                cell.remainingValue = cell.value;
                Maze.updateOrCreateText_(cell.y, cell.x, cell.value);
            }
        }
    }
    Maze.FIRSTMOVE = true; //Reset the first move
};
/**
* Reveal any hidden information (remove clouds and set purple flower values)
*/
Maze.reveal = function(){
    for(var cell of Maze.mapCells["purpleFlower"]){
        var val = Math.round(Math.random()); //Pick 1 or 0 at random
        cell.value = val;
        cell.remainingValue = val;
        Maze.updateOrCreateText_(cell.y, cell.x, cell.value); //Set it as the value 
    }
    for(var cell of Maze.mapCells["cloud"]){
        //Play the animation
        var cellIcon = document.getElementById("obstacle"+cell.id); //Get the element
        //Change the value to the animation
        cellIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', Maze.SKIN["cloudAnimation"]);
        //Show the correct number on the underneath cell (redflower or honey)
        for(var under of Maze.mapCells["redFlower"]){
            if (under.x == cell.x && under.y == cell.y){
                Maze.updateOrCreateText_(under.y, under.x, under.value);
            }
        }
        for(var under of Maze.mapCells["honey"]){
            if (under.x == cell.x && under.y == cell.y){
                Maze.updateOrCreateText_(under.y, under.x, under.value);
            }
        }
    }
}


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
    if(Maze.FIRSTMOVE){
        Maze.reveal();
        Maze.FIRSTMOVE = false;
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
        case 'left':
            Maze.schedule([Maze.pegmanX, Maze.pegmanY, Maze.pegmanD * 4], [Maze.pegmanX, Maze.pegmanY, Maze.pegmanD * 4 - 4]);
            Maze.pegmanD = Maze.constrainDirection4(Maze.pegmanD - 1);
            break;
        case 'right':
            Maze.schedule([Maze.pegmanX, Maze.pegmanY, Maze.pegmanD * 4], [Maze.pegmanX, Maze.pegmanY, Maze.pegmanD * 4 + 4]);
            Maze.pegmanD = Maze.constrainDirection4(Maze.pegmanD + 1);
            break;
        case 'finish':
            Maze.scheduleFinish(true);
            break;
        case 'nectar':
            console.log("todo nectar"); // TODO
            break;
        case 'honey':
            console.log("todo honey"); // TODO
            break;
    }
};

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
    }, window.stepSpeed * 2));
    Maze.pidList.push(setTimeout(function() {
        Maze.displayPegman(endPos[0], endPos[1],
            Maze.constrainDirection16(endPos[2]));
    }, window.stepSpeed * 3));
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
        BlocklyTaskInterpreter.alert('Vous avez heurté un obstacle !');
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
        BlocklyTaskInterpreter.alert('Vous avez heurté un mur !');
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
        Maze.SQUARE_SIZE * (y + 0.5) - Maze.PEGMAN_HEIGHT / 2 - 8);
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
        return;
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

    // TODO maybe add this
    // if (Maze.shouldCheckSuccessOnMove()) {
    //     Maze.checkSuccess();
    // }
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
 * Is the player at the finish marker?
 * @return {boolean} True if not done, false if done.
 */
Maze.notDone = function() {
    return Maze.pegmanX != Maze.finish_.x || Maze.pegmanY != Maze.finish_.y;
};

/**
 * Create SVG text element for given cell
 * @param {number} row
 * @param {number} col
 * @param {string} text
 */
Maze.updateOrCreateText_ = function(row, col, text) {
    var pegmanElement = document.getElementById('pegman');
    var svg = document.getElementById('blocklySvgZone');
    var id = 'cellText' + row + col;
    var textElement = document.getElementById(id);

    if (!textElement) {
        // Create text.
        var hPadding = 2;
        var vPadding = 2;
        textElement = document.createElementNS(Blockly.SVG_NS, 'text');
        // Position text just inside the bottom right corner.
        textElement.setAttribute('x', (col + 1) * Maze.SQUARE_SIZE - hPadding);
        textElement.setAttribute('y', (row + 1) * Maze.SQUARE_SIZE - vPadding);
        textElement.setAttribute('text-anchor', 'end');
        textElement.setAttribute('font-size', '16px');
        textElement.setAttribute('font-weight', 'bold');
        textElement.setAttribute('fill', 'white');
        textElement.setAttribute('stroke', 'black');
        textElement.setAttribute('stroke-width', 1);
        textElement.setAttribute('id', id);
        textElement.appendChild(document.createTextNode(''));
        svg.insertBefore(textElement, pegmanElement);
    }

    textElement.firstChild.nodeValue = text;
    return textElement;
};

Maze.getNectar = function(id) {
    var x = Maze.pegmanX;
    var y = Maze.pegmanY;
    var cell;

    var isFlower = false;
    for (var kind in Maze.mapCells) { //For each kind of cell
        for(cell of Maze.mapCells[kind]){
            if (cell.x == x && cell.y == y && kind != 'cloud' && kind != 'honey') {
                isFlower = true;
                break;
            }
        }
        if(isFlower) break;
    }
    if (!isFlower || cell.remainingValue <= 0) {
        BlocklyTaskInterpreter.alert("Vous ne pouvez pas récolter du nectar ici !");
        Maze.log.push(['finish', id]);
        return;
    }    
    cell.remainingValue--;
    Maze.updateOrCreateText_(y, x, cell.remainingValue);
};

//Helper functions
var nectarRemaining = function(){
    var x = Maze.pegmanX;
    var y = Maze.pegmanY;
    var cell = null;

    for(var current of Maze.mapCells["redFlower"]){
        if(x == current.x && y == current.y) {
            cell = current;
            break;
        }
    }
    for(var current of Maze.mapCells["purpleFlower"]){
        if(x == current.x && y == current.y) {
            cell = current;
            break;
        }
    }
    if(cell == null)
        return 0;
    else
        return cell.remainingValue;
}

var honeyRemaining = function(){
    var x = Maze.pegmanX;
    var y = Maze.pegmanY;
    var cell = null;

    for(var current of Maze.mapCells["honey"]){
        if(x == current.x && y == current.y) {
            cell = current;
            break;
        }
    }
    if(cell == null)
        return 0;
    else
        return cell.remainingValue;
}

Maze.get2Nectar = function(id) {
    Maze.getNectar(id);
    Maze.getNectar(id);
};

Maze.makeHoney = function(id) {
    var x = Maze.pegmanX;
    var y = Maze.pegmanY;
    var cell;

    var isHoney = false;
    for(cell of Maze.mapCells["honey"]){
        if (cell.x == x && cell.y == y) {
            isHoney = true;
            break;
        }
    }
    if (! isHoney || cell.remainingValue <= 0) {
        BlocklyTaskInterpreter.alert("Vous ne pouvez pas fabriquer du miel ici !");
        Maze.log.push(['finish', id]);
        return;
    }
    cell.remainingValue--;
    Maze.updateOrCreateText_(y, x, cell.remainingValue);
};

if (document.getElementById('blocklySvgZone') != null) {
    window.addEventListener('load', Maze.init);
} else {
    console.warn('Cannot find blocklySvgZone element.');
}
