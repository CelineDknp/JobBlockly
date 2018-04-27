# How to create Blockly exercices

To make it as simple as possible, there is zip files in the *BaseExercices* directory that contains the minimal files for a Blockly exercice. For now, the "styles" availables are :
- Pegman

To start a fresh exercice, just unzip the file in the corresponding course directory, and modify in the following fashin to customize it.

## ------ EDIT THE INSTRUCTION ------
By graphical interface :
	In the INGInious "Edit task" menu, in Basic settings you can modify the overall context of the task.
	In the Subproblems, clicking on the subproblem itself, same.

In the task.yaml file :
	The general context is the third point of the file (after the 		author)
	The subproblem context is under problem -> subProblemName -> 		header

## ------ EDIT THE BLOCKS ------
By graphical interface :
	In the subproblem tab, select "edit toolbox/workspace graphically"

In the task.yaml :
	Edit the code between the <xml> </xml> under toolbox of the subproblem

## ------ CHANGE THE MAZE ------
In file maze.js (taskName/public/maze.js), the table from line 68 to 74 represents the mase that will be executed.

Change the number in the table to modify the maze, where :
- 0 is a wall
- 1 is a free space (the character can move in it)
- 2 is the starting point (and also a free space)
- 3 is the target point (and also a free space, the character mush finish his moves on that point to solve the maze).

The vizual representation on INGInious is automatically generated.

## ------ INGINIOUS CORRECTION ------
In the file taskName/student/maze.tpl.py; you can find a basic correction file. To correct a simple maze defined in taskName/public/maze.js; there is two steps :
- Modify the maze representation in according to the one in maze.js
- Change the exercice name on line 105, according to the subproblem's name

## ------ INFORMATIONS ABOUT OTHER FILES ------
-> taskName/public/maze directory : contains sounds and images to represent visually the maze
-> taskName/public/blocks.js : define custom blocks (here, all the maze blocks)
-> taskName/public/interpreter.js : deals with animations
