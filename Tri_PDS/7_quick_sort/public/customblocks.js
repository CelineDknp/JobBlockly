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

Blockly.Blocks['custom_swap'] = {
  init: function() {
    this.jsonInit({
      "type": "custom_swap",
      "message0": "echanger les cases %1 %2 et %3 %4",
      "args0": [
        {
          "type": "input_dummy"
        },
        {
          "type": "input_value",
          "name": "pos1",
          "check": "Number"
        },
        {
          "type": "input_dummy"
        },
        {
          "type": "input_value",
          "name": "pos2",
          "check": "Number"
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": 330,
      "tooltip": "Echanger deux cases du tableau",
      "helpUrl": ""
    });
  }
};

Blockly.Python['custom_swap'] = function(block) {
  var value_pos1 = Blockly.Python.valueToCode(block, 'pos1', Blockly.Python.ORDER_ATOMIC);
  var value_pos2 = Blockly.Python.valueToCode(block, 'pos2', Blockly.Python.ORDER_ATOMIC);
  var code = 'temp=liste[int('+value_pos1+ '-1)] \nliste[int('+value_pos1+'-1)]=liste[int('+value_pos2+'-1)] \nliste[int('+value_pos2+'-1)] = temp \n';
  return code;
};

Blockly.JavaScript['custom_swap'] = function(block) {
  var value_pos1 = Blockly.JavaScript.valueToCode(block, 'pos1', Blockly.JavaScript.ORDER_ATOMIC);
  var value_pos2 = Blockly.JavaScript.valueToCode(block, 'pos2', Blockly.JavaScript.ORDER_ATOMIC);
  var code = 'temp=liste['+value_pos1+ '] \nliste['+value_pos1+']=liste['+value_pos2+'] \nliste['+value_pos2+'] = temp \n swap('+value_pos1+', '+value_pos2+', premier, dernier, pivot);';
  return code;
};

Blockly.Blocks['create_pivot'] = {
  init: function() {
    this.appendValueInput("FIRST")
        .setCheck("Number")
        .appendField("choisir un pivot entre");
    this.appendValueInput("LAST")
        .setCheck("Number")
        .appendField("et");
    this.setInputsInline(true);
    this.setOutput(true, "Number");
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.JavaScript['create_pivot'] = function(block) {
  var value_first = Blockly.JavaScript.valueToCode(block, 'FIRST', Blockly.JavaScript.ORDER_ATOMIC);
  var value_last = Blockly.JavaScript.valueToCode(block, 'LAST', Blockly.JavaScript.ORDER_ATOMIC);
  var code = 'Math.round(Math.random() * ('+value_last+' - '+value_first+') + '+value_first+'); \n makePivot(pivot)';
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Python['create_pivot'] = function(block) {
  var value_min = Blockly.Python.valueToCode(block, 'FIRST', Blockly.Python.ORDER_ATOMIC);
  var value_max = Blockly.Python.valueToCode(block, 'LAST', Blockly.Python.ORDER_ATOMIC);
  // from random import randint
  var code = 'randint('+value_min+', '+value_max+')\n';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Blocks['b_lighter_pivot'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("l'élément est plus petit que le pivot");
    this.setOutput(true, null);
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.JavaScript['b_lighter_pivot'] = function(block) {
  var code = 'liste[i] <= liste[dernier]';
  return [code, Blockly.JavaScript.ORDER_RELATIONAL];
};

Blockly.Python['b_lighter_pivot'] = function(block) {
  var code = 'liste[int(i)] < liste[int(dernier)]';
  return [code, Blockly.Python.ORDER_RELATIONAL];
};

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