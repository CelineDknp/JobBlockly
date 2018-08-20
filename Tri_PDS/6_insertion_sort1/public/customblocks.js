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
  var liste = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
  return liste;
};

var Lst = {};
Lst.liste = newlist();

/********************************************************************************
 **                       JavaScript Block Definitions                         **
 ********************************************************************************/

Blockly.Blocks['new_list'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("créer une nouvelle liste 'A'");
    this.setNextStatement(true, null);
    this.setColour(290);
 this.setTooltip("A = []");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['for_each_list'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Pour chaque indice i de 1 à (longueur de A - 1)");
    this.appendStatementInput("CONTENT")
        .setCheck(null);
    this.setPreviousStatement(true, null);
    this.setColour(120);
 this.setTooltip("En Python, for i in range(1, len(A)):");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['assign_tmp'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("x = iᵉᵐᵉ élément de A");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(330);
 this.setTooltip("x = A[i]");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['for_each_greater'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("tant que indice j ≥ 0 et jᵉᵐᵉ élément de A > x");
    this.appendStatementInput("CONTENT")
        .setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
 this.setTooltip("En python, while j >= 0 and A[j] > x");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['assign_index_j'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("indice j = (indice i - 1)");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(330);
 this.setTooltip("j = i - 1");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['decrease_j'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("décrémenter indice j de 1");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(330);
 this.setTooltip("j -= 1");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['assign_greater_elem'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("décale le jᵉᵐᵉ élément de A vers le bas");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
 this.setTooltip("A[j+1] = A[j]");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['put_x'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("place x à la (j+1)ᵉᵐᵉ place de la liste A");
    this.setPreviousStatement(true, null);
    this.setColour(290);
 this.setTooltip("A[j+1] = x");
 this.setHelpUrl("");
  }
};

/********************************************************************************
 **                             Python Generator                               **
 ********************************************************************************/

Blockly.Python['new_list'] = function(block) {
  var code = 'global A, B\nA = [' + Lst.liste + ']\nB = list(A)\n';
  return code;
};

Blockly.Python['for_each_list'] = function(block) {
  var statements_content = Blockly.Python.statementToCode(block, 'CONTENT');
  var code = 'for i in range(1,len(A)):\n' + statements_content;
  return code;
};

Blockly.Python['assign_tmp'] = function(block) {
  var code = 'tmp = A[i]\n';
  return code;
};

Blockly.Python['for_each_greater'] = function(block) {
  var statements_content = Blockly.Python.statementToCode(block, 'CONTENT');
  var code = 'while j>=0 and A[j] > tmp:\n' + statements_content;
  return code;
};

Blockly.Python['assign_index_j'] = function(block) {
  var code = 'j = i-1\n';
  return code;
};

Blockly.Python['decrease_j'] = function(block) {
  var code = 'j -= 1\n';
  return code;
};

Blockly.Python['assign_greater_elem'] = function(block) {
  var code = 'A[j+1] = A[j]\n';
  return code;
};

Blockly.Python['put_x'] = function(block) {
  var code = 'A[j+1] = tmp\n';
  return code;
};

/********************************************************************************
 **                         JavaScript Generator                               **
 ********************************************************************************/

Blockly.JavaScript['new_list'] = function(block) {
  var code = 'A = [' + Lst.liste + '];\nvar n = A.length;\n';
  return code;
};

Blockly.JavaScript['for_each_list'] = function(block) {
  var statements_content = Blockly.JavaScript.statementToCode(block, 'CONTENT');
  var code = 'for(var i=1; i<n; i++) {\n' + statements_content + '}\n';
  return code;
};

Blockly.JavaScript['assign_tmp'] = function(block) {
  var code = 'shift_tmp(i);\nvar tmp = A[i];\nvar dy = 0;\n';
  return code;
};

Blockly.JavaScript['assign_index_j'] = function(block) {
  var code = 'var j = i-1;\n';
  return code;
};

Blockly.JavaScript['for_each_greater'] = function(block) {
  var statements_content = Blockly.JavaScript.statementToCode(block, 'CONTENT');
  var code = 'while (j>=0 && A[j] > tmp) {\n'
  + statements_content + '}\n';
  return code;
};

Blockly.JavaScript['decrease_j'] = function(block) {
  var code = 'j--;\n';
  return code;
};

Blockly.JavaScript['assign_greater_elem'] = function(block) {
  var code = 'shift(j);\ndy += 70;\nA[j+1] = A[j];\n';
  return code;
};

Blockly.JavaScript['put_x'] = function(block) {
  var code = 'put(dy, j+1);\nA[j+1] = tmp;\n';
  return code;
};
