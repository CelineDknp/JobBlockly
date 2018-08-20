/*
#  Copyright (c)  2018 Ilias Boutchichi
#  This program is free software: you can redistribute it and/or modify
#  it under the terms of the GNU Affero General Public License as published by
#  the Free Software Foundation, either version 3 of the License, or
#  (at your option) any later version.
#  This program is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU Affero General Public License for more details.
#
#  You should have received a copy of the GNU Affero General Public License
#  along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/**
* @author Ilias Boutchichi
*/

'use strict';

var newlist = function() {
  var liste = [];
  for(var i = 0; i<10; i++){
    liste.push(Math.floor((Math.random() * 100) + 1));
  }
  return liste;
};

var Lst = {};
Lst.liste = newlist();

Blockly.Blocks['custom_for_elem'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("TANT QUE (il reste des bouteilles à comparer)");
    this.appendStatementInput("STAT")
        .setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(105);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.JavaScript['custom_for_elem'] = function(block) {
  var statements_stat = Blockly.JavaScript.statementToCode(block, 'STAT');
  var code = 'for(var i = 1; i < liste.length; i++){\n'+statements_stat+'}\n';
  return code;
};

Blockly.Python['custom_for_elem'] = function(block) {
  var statements_stat = Blockly.Python.statementToCode(block, 'STAT');
  var code = 'for i in range(len(liste)):\n'+statements_stat;
  return code;
};

Blockly.Blocks['custom_for_all'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("TANT QUE (il reste des bouteilles à trier)");
    this.appendStatementInput("STAT")
        .setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(105);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.JavaScript['custom_for_all'] = function(block) {
  var statements_stat = Blockly.JavaScript.statementToCode(block, 'STAT');
  var code = 'for(var j = 0; j < n; j++){\n'+statements_stat+'}\n';
  return code;
};

Blockly.Python['custom_for_all'] = function(block) {
  var statements_stat = Blockly.Python.statementToCode(block, 'STAT');
  var code = 'for j in range(len(liste)):\n'+statements_stat;
  return code;
};

Blockly.Blocks['create_plus_leger'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Choisir une bouteille A");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.JavaScript['create_plus_leger'] = function(block) {
  var code = 'var current = 0;\n currentComp(0);\n';
  return code;
};

Blockly.Python['create_plus_leger'] = function(block) {
  var code = 'leger = 0\n';
  return code;
};

Blockly.Blocks['get_other'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Prendre une bouteille B parmi les autres");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.JavaScript['get_other'] = function(block) {
  var code = 'var other = i; otherComp(i)\n';
  return code;
};

Blockly.Python['get_other'] = function(block) {
  var code = 'other = i\n';
  return code;
};

Blockly.Blocks['b_lighter_a'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("la bouteille B est plus légère que la A");
    this.setOutput(true, null);
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.JavaScript['b_lighter_a'] = function(block) {
  var code = 'liste[other] < liste[current]';
  return [code, Blockly.JavaScript.ORDER_RELATIONAL];
};

Blockly.Python['b_lighter_a'] = function(block) {
  var code = 'liste[other] < liste[leger]';
  return [code, Blockly.Python.ORDER_RELATIONAL];
};

Blockly.Blocks['b_is_a'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("la bouteille B devient la bouteille A");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.JavaScript['b_is_a'] = function(block) {
  var code = 'current = i; currentComp(i);\n';
  return code;
};

Blockly.Python['b_is_a'] = function(block) {
  var code = 'leger = i\n';
  return code;
};

Blockly.Blocks['store_a'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("placer la bouteille A dans la file déjà triée");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.JavaScript['store_a'] = function(block) {
  var code = 'move(current);\n liste.splice(current, 1);\n';
  return code;
};

Blockly.Python['store_a'] = function(block) {
  var code = 'B.append(liste[leger]) \nliste.remove(liste[leger])';
  return code;
};

Blockly.Blocks['new_list'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("créer une nouvelle liste");
    this.setNextStatement(true, null);
    this.setColour(290);
 this.setTooltip("A = []");
 this.setHelpUrl("");
  }
};

Blockly.Python['new_list'] = function(block) {
  var code = 'global liste, B\nliste = [' + Lst.liste + ']\nB = []\n';
  return code;
};

Blockly.JavaScript['new_list'] = function(block) {
  var code = 'liste = [' + Lst.liste + '];\nvar n = liste.length;\n';
  return code;
};