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
 * @author celine.deknop@student.uclouvain.be (Céline Deknop)
 * @author victor.feyens@student.uclouvain.be (Victor Feyens)
 */
'use strict';

//File to modify to change the maze configuration
var task_directory_path = window.location.pathname + "/";
var maze_file = ""
if(task_directory_path.includes("edit")){ //When we are editing the task
    maze_file = task_directory_path.replace("admin","course").replace("edit/task/","")+"maze_config.json"
}else { //When displaying the task
    maze_file = task_directory_path + "maze_config.json";
}

var request = new XMLHttpRequest();
request.open("GET", maze_file, false);
request.send(null);
var json = JSON.parse(request.responseText);

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
            "message0": json.blocs.move.name,
            "previousStatement": null,
            "nextStatement": null,
            "colour": Maze.Blocks.MOVEMENT_HUE,
            "tooltip": json.blocs.move.tooltip
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
            [json.blocs.turn.name1, 'turnRight'],
            [json.blocs.turn.name2, 'turnLeft']
        ];
        // Append arrows to direction messages.
        DIRECTIONS[0][0] += Maze.Blocks.RIGHT_TURN;
        DIRECTIONS[1][0] += Maze.Blocks.LEFT_TURN;
        this.setColour(Maze.Blocks.MOVEMENT_HUE);
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown(DIRECTIONS), 'DIR');
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip(json.blocs.turn.tooltip);
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

Blockly.Blocks['get_player_pos'] = {
  init: function() {
    this.jsonInit({
      "type": "get_player_pos",
      "message0": json.blocs.getPlayerPosition.name+" %1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "VALUE",
          "options": [
            [
              "x",
              "X"
            ],
            [
              "y",
              "Y"
            ]
          ]
        }
      ],
      "output": "Number",
      "colour": 230,
      "tooltip": json.blocs.getPlayerPosition.tooltip,
      "helpUrl": ""
    });
  }
};

Blockly.Blocks['custom_if_else'] = {
    init: function() {
      this.jsonInit({
        "type": "custom_if_else",
        "message0": "if %1 %2 else %3",
        "args0": [
          {
            "type": "input_value",
            "name": "COND",
            "check": "Boolean"
          },
          {
            "type": "input_statement",
            "name": "IF_STAT"
          },
          {
            "type": "input_statement",
            "name": "ELSE_STAT"
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 200,
        "tooltip": "if COND is true, execute the first block. Otherwise, execute the second",
        "helpUrl": ""
      });
    }
  };

Blockly.Python['custom_if_else'] = function(block) {
  var value_cond = Blockly.Python.valueToCode(block, 'COND', Blockly.Python.ORDER_ATOMIC);
  var statements_if_stat = Blockly.Python.statementToCode(block, 'IF_STAT');
  var statements_else_stat = Blockly.Python.statementToCode(block, 'ELSE_STAT');
  var code = 'if '+value_cond+" :\n"+statements_if_stat+" \nelse:\n"+statements_else_stat+"\n";
  return code;
};

Blockly.JavaScript['custom_if_else'] = function(block) {
  var value_cond = Blockly.JavaScript.valueToCode(block, 'COND', Blockly.Python.ORDER_ATOMIC);
  var statements_if_stat = Blockly.JavaScript.statementToCode(block, 'IF_STAT');
  var statements_else_stat = Blockly.JavaScript.statementToCode(block, 'ELSE_STAT');
  var code = 'if ('+value_cond+"){\n"+statements_if_stat+"\n} \nelse{\n"+statements_else_stat+"\n}\n";
  return code;
};

Blockly.JavaScript['get_player_pos'] = function(block) {
  var dropdown_value = block.getFieldValue('VALUE');
  var code = 'getPlayer'+dropdown_value+'()';;
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.Python['get_player_pos'] = function(block) {
  var dropdown_value = block.getFieldValue('VALUE');
  var code = 'getPlayer'+dropdown_value+'()';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Blocks['get_target_pos'] = {
  init: function() {
    this.jsonInit({
      "type": "get_target_pos",
      "message0": json.blocs.getTargetPosition.name+" %1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "VALUE",
          "options": [
            [
              "x",
              "X"
            ],
            [
              "y",
              "Y"
            ]
          ]
        }
      ],
      "output": "Number",
      "colour": 230,
      "tooltip": json.blocs.getTargetPosition.tooltip,
      "helpUrl": ""
    });
  }
};

Blockly.JavaScript['get_target_pos'] = function(block) {
  var dropdown_value = block.getFieldValue('VALUE');
  var code = 'getTarget'+dropdown_value+'()';;
  return [code, Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.Python['get_target_pos'] = function(block) {
  var dropdown_value = block.getFieldValue('VALUE');
  var code = 'getTarget'+dropdown_value+'()';
  return [code, Blockly.Python.ORDER_MEMBER];
};

Blockly.Blocks['get_player_dir'] = {
  init: function() {
    this.jsonInit({
      "type": "get_player_dir",
      "message0": json.blocs.getPlayerDirection.name,
      "output": "Number",
      "colour": 230,
      "tooltip": json.blocs.getPlayerDirection.tooltip,
      "helpUrl": ""
    });
  }
};

Blockly.JavaScript['get_player_dir'] = function(block) {
  var code = 'getPlayerDir()';
  return [code, Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.Python['get_player_dir'] = function(block) {
  var code = 'getPlayerDir()';
  return [code, Blockly.Python.ORDER_MEMBER];
};

Blockly.Blocks['north_value'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("North");
    this.setOutput(true, null);
    this.setColour(230);
 this.setTooltip("Retourne la valeur correspondant au nord");
 this.setHelpUrl("");
  }
};

Blockly.JavaScript['north_value'] = function(block) {
  var code = '0';
  return [code, Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.Python['north_value'] = function(block) {
  var code = '0';
  return [code, Blockly.Python.ORDER_MEMBER];
};

Blockly.Blocks['east_value'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("East");
    this.setOutput(true, null);
    this.setColour(230);
 this.setTooltip("Retourne la valeur correspondant à l'est");
 this.setHelpUrl("");
  }
};

Blockly.JavaScript['east_value'] = function(block) {
  var code = '1';
  return [code, Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.Python['east_value'] = function(block) {
  var code = '1';
  return [code, Blockly.Python.ORDER_MEMBER];
};

Blockly.Blocks['south_value'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("South");
    this.setOutput(true, null);
    this.setColour(230);
 this.setTooltip("Retourne la valeur correspondant au sud");
 this.setHelpUrl("");
  }
};

Blockly.JavaScript['south_value'] = function(block) {
  var code = '2';
  return [code, Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.Python['south_value'] = function(block) {
  var code = '2';
  return [code, Blockly.Python.ORDER_MEMBER];
};

Blockly.Blocks['west_value'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("West");
    this.setOutput(true, null);
    this.setColour(230);
 this.setTooltip("Retourne la valeur correspondant à l'ouest");
 this.setHelpUrl("");
  }
};

Blockly.JavaScript['west_value'] = function(block) {
  var code = '3';
  return [code, Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.Python['west_value'] = function(block) {
  var code = '3';
  return [code, Blockly.Python.ORDER_MEMBER];
};

Blockly.Blocks['can_move'] = {
  init: function() {
    this.jsonInit({
      "type": "can_move",
      "message0": json.blocs.canMove.name,
      "output": "Boolean",
      "colour": 230,
      "tooltip": json.blocs.canMove.tooltip,
      "helpUrl": ""
    });
  }
};

Blockly.JavaScript['can_move'] = function(block) {
  var code = 'canMove()';
  return [code, Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.Python['can_move'] = function(block) {
  var code = 'canMove()';
  return [code, Blockly.Python.ORDER_MEMBER];
};

Blockly.Blocks['is_in_front_of_enemy'] = {
  init: function() {
    this.jsonInit({
      "type": "is_in_front_of_enemy",
      "message0": json.blocs.isInFrontOfEnemy.name,
      "output": "Boolean",
      "colour": 230,
      "tooltip": json.blocs.isInFrontOfEnemy.tooltip,
      "helpUrl": ""
    });
  }
};

Blockly.JavaScript['is_in_front_of_enemy'] = function(block) {
  var code = 'isInFrontOfEnemy()';
  return [code, Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.Python['is_in_front_of_enemy'] = function(block) {
  var code = 'isInFrontOfEnemy()';
  return [code, Blockly.Python.ORDER_MEMBER];
};

Blockly.Blocks['is_on_target'] = {
  init: function() {
    this.jsonInit({
      "type": "is_on_target",
      "message0": json.blocs.isOnTarget.name,
      "output": "Boolean",
      "colour": 230,
      "tooltip": json.blocs.isOnTarget.tooltip,
      "helpUrl": ""
    });
  }
};

Blockly.JavaScript['is_on_target'] = function(block) {
  var code = 'isOnTarget()';
  return [code, Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.Python['is_on_target'] = function(block) {
  var code = 'isOnTarget()';
  return [code, Blockly.Python.ORDER_MEMBER];
};

Blockly.Blocks['spy_on_target'] = {
  init: function() {
    this.jsonInit({
      "type": "spy_on_target",
      "message0": json.blocs.finish.name,
      "previousStatement": null,
      "nextStatement": null,
      "colour": 230,
      "tooltip": json.blocs.finish.tooltip,
      "helpUrl": ""
    });
  }
};

Blockly.JavaScript['spy_on_target'] = function(block) {
  var code = 'spyOnTarget()';
  return code;
};

Blockly.Python['spy_on_target'] = function(block) {
  var code = 'spyOnTarget()';
  return code;
};