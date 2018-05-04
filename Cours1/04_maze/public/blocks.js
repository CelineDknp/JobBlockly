/**
 * Blockly Games: Maze Blocks
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
 * @fileoverview Blocks for Blockly's Maze application.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

Maze.Blocks = {};

/**
 * Common HSV hue for all movement blocks.
 */
Maze.Blocks.MOVEMENT_HUE = 290;

/**
 * HSV hue for loop block.
 */
Maze.Blocks.LOOPS_HUE = 120;

/**
 * Common HSV hue for all logic blocks.
 */
Maze.Blocks.LOGIC_HUE = 210;

/**
 * Left turn arrow to be appended to messages.
 */
Maze.Blocks.LEFT_TURN = ' \u21BA';

/**
 * Left turn arrow to be appended to messages.
 */
Maze.Blocks.RIGHT_TURN = ' \u21BB';

// Extensions to Blockly's language and JavaScript generator.

Blockly.Blocks['maze_moveForward'] = {
    /**
     * Block for moving forward.
     * @this Blockly.Block
     */
    init: function() {
        this.jsonInit({
            "message0": "avancer",
            "previousStatement": null,
            "nextStatement": null,
            "colour": Maze.Blocks.MOVEMENT_HUE,
            "tooltip": "Avance le joueur d'un espace"
        });
    }
};

Blockly.JavaScript['maze_moveForward'] = function(block) {
    // Generate JavaScript for moving forward.
    return 'moveForward(\'block_id_' + block.id + '\');\n';
};

Blockly.Python['maze_moveForward'] = function(block) {
    // Generate JavaScript for moving forward.
    return 'moveForward()\n';
};

Blockly.Blocks['maze_turn'] = {
    /**
     * Block for turning left or right.
     * @this Blockly.Block
     */
    init: function() {
        var DIRECTIONS = [
            ["tourner à gauche", 'turnLeft'],
            ["tourner à droite", 'turnRight']
        ];
        // Append arrows to direction messages.
        DIRECTIONS[0][0] += Maze.Blocks.LEFT_TURN;
        DIRECTIONS[1][0] += Maze.Blocks.RIGHT_TURN;
        this.setColour(Maze.Blocks.MOVEMENT_HUE);
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown(DIRECTIONS), 'DIR');
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip("Tourne le joueur à gauche ou à droite de 90 degrés.");
    }
};

Blockly.JavaScript['maze_turn'] = function(block) {
    // Generate JavaScript for turning left or right.
    var dir = block.getFieldValue('DIR');
    return dir + '(\'block_id_' + block.id + '\');\n';
};

Blockly.Python['maze_turn'] = function(block) {
    // Generate JavaScript for turning left or right.
    var dir = block.getFieldValue('DIR');
    return dir + '()\n';
};

Blockly.Blocks['maze_if'] = {
    /**
     * Block for 'if' conditional if there is a path.
     * @this Blockly.Block
     */
    init: function() {
        var DIRECTIONS = [
            ["si chemin devant", 'isPathForward'],
            ["si chemin vers la gauche", 'isPathLeft'],
            ["si chemin vers la droite", 'isPathRight']
        ];
        // Append arrows to direction messages.
        DIRECTIONS[1][0] += Maze.Blocks.LEFT_TURN;
        DIRECTIONS[2][0] += Maze.Blocks.RIGHT_TURN;
        this.setColour(Maze.Blocks.LOGIC_HUE);
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown(DIRECTIONS), 'DIR');
        this.appendStatementInput('DO')
            .appendField("faire");
        this.setTooltip("Si il y a un chemin dans la direction specifiée, \nalors effectue ces actions. ");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
    }
};

Blockly.JavaScript['maze_if'] = function(block) {
    // Generate JavaScript for 'if' conditional if there is a path.
    var argument = block.getFieldValue('DIR') +
        '(\'block_id_' + block.id + '\')';
    var branch = Blockly.JavaScript.statementToCode(block, 'DO');
    var code = 'if (' + argument + ') {\n' + branch + '}\n';
    return code;
};

Blockly.Python['maze_if'] = function(block) {
    // Generate JavaScript for 'if' conditional if there is a path.
    var argument = block.getFieldValue('DIR') + '()';
    var branch = Blockly.Python.statementToCode(block, 'DO');
    var code = 'if ' + argument + ':\n' + branch + '\n';
    return code;
};

Blockly.Blocks['maze_ifElse'] = {
    /**
     * Block for 'if/else' conditional if there is a path.
     * @this Blockly.Block
     */
    init: function() {
        var DIRECTIONS = [
            ["si chemin devant", 'isPathForward'],
            ["si chemin vers la gauche", 'isPathLeft'],
            ["si chemin vers la droite", 'isPathRight']
        ];
        // Append arrows to direction messages.
        DIRECTIONS[1][0] += Maze.Blocks.LEFT_TURN;
        DIRECTIONS[2][0] += Maze.Blocks.RIGHT_TURN;
        this.setColour(Maze.Blocks.LOGIC_HUE);
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown(DIRECTIONS), 'DIR');
        this.appendStatementInput('DO')
            .appendField("faire");
        this.appendStatementInput('ELSE')
            .appendField("sinon");
        this.setTooltip("Si il y a un chemin dans la direction specifiée, \nalors fais le premier bloc d'actions. \nSinon fais le second bloc d'actions.");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
    }
};

Blockly.JavaScript['maze_ifElse'] = function(block) {
    // Generate JavaScript for 'if/else' conditional if there is a path.
    var argument = block.getFieldValue('DIR') +
        '(\'block_id_' + block.id + '\')';
    var branch0 = Blockly.JavaScript.statementToCode(block, 'DO');
    var branch1 = Blockly.JavaScript.statementToCode(block, 'ELSE');
    var code = 'if (' + argument + ') {\n' + branch0 +
        '} else {\n' + branch1 + '}\n';
    return code;
};

Blockly.Python['maze_ifElse'] = function(block) {
    // Generate JavaScript for 'if/else' conditional if there is a path.
    var argument = block.getFieldValue('DIR') +
        '()';
    var branch0 = Blockly.Python.statementToCode(block, 'DO');
    var branch1 = Blockly.Python.statementToCode(block, 'ELSE');
    var code = 'if ' + argument + ':\n' + branch0 +
        '\nelse:\n' + branch1 + '\n';
    return code;
};

Blockly.Blocks['maze_forever'] = {
    /**
     * Block for repeat loop.
     * @this Blockly.Block
     */
    init: function() {
        this.setColour(Maze.Blocks.LOOPS_HUE);
        this.appendDummyInput()
            .appendField("répéter jusqu'à")
            .appendField(new Blockly.FieldImage(Maze.SKIN.marker, 12, 16));
        this.appendStatementInput('DO')
            .appendField("faire");
        this.setPreviousStatement(true);
        this.setTooltip("Répète les blocs qui sont à l'intérieur jusqu'à \natteindre le but. ");
    }
};

Blockly.JavaScript['maze_forever'] = function(block) {
    // Generate JavaScript for repeat loop.
    var branch = Blockly.JavaScript.statementToCode(block, 'DO');
    if (Blockly.JavaScript.INFINITE_LOOP_TRAP) {
        branch = Blockly.JavaScript.INFINITE_LOOP_TRAP.replace(/%1/g,
            '\'block_id_' + block.id + '\'') + branch;
    }
    return 'while (notDone()) {\n' + branch + '}\n';
};

Blockly.Python['maze_forever'] = function(block) {
    // Generate JavaScript for repeat loop.
    var branch = Blockly.Python.statementToCode(block, 'DO');
    return 'while notDone():\n' + branch + '\n';
};
