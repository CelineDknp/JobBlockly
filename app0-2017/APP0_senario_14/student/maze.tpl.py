#!/usr/bin/python3
# -*- coding: utf-8 -*-
'''
This file is a bit messed up because it tests Python code generated from code also tested in javascript equivalent.
Try to forget the basic Python syntax for a while.
'''
import json
import os

dir_path = os.path.dirname(os.path.realpath(__file__))
data = ""
with open(dir_path.replace("student","public/")+'maze_config.json') as f:
  data = json.load(f)

class BadPathException(Exception):
    pass

class StepNumberExceededException(Exception):
    pass

UNSET = "UNSET"
SUCCESS = "SUCCESS"
FAILURE = "FAILURE"
TIMEOUT = "TIMEOUT"
ERROR = "ERROR"
STEPS = 0
MAXSTEPS = data["map"]["maxSteps"]

RESULT_TYPE = {
    UNSET: 0,
    SUCCESS: 1,
    FAILURE: -1,
    TIMEOUT: 2,
    ERROR: -2
}



WALL = "WALL"
OPEN = "OPEN"
START = "START"
FINISH = "FINISH"
OBSTACLE = "OBSTACLE"

SQUARE_TYPE = data["map"]["squareType"]

PLAYER_POSITION = {
    'x': None,
    'y': None
}

FINISH_POSITION = {
    'x': None,
    'y': None
}

FINISHED = False

EAST = "EAST"
SOUTH = "SOUTH"
WEST = "WEST"
NORTH = "NORTH"

DIRECTION_TYPE = {
    NORTH: 0,
    EAST: 1,
    SOUTH: 2,
    WEST: 3
}

MOVE_POSITION = {
    DIRECTION_TYPE[EAST]: {
        'x': 1,
        'y': 0
    },
    DIRECTION_TYPE[SOUTH]: {
        'x': 0,
        'y': 1
    },
    DIRECTION_TYPE[WEST]: {
        'x': -1,
        'y': 0
    },
    DIRECTION_TYPE[NORTH]: {
        'x': 0,
        'y': -1
    }
}

MAP = ""
ROWS = 0
COLS = 0
RESULT = RESULT_TYPE[UNSET]
PLAYER_ORIENTATION = DIRECTION_TYPE[data["map"]["startDirection"]]

def student_code():
@ @code@@


def init(map):
    global ROWS,COLS,RESULT,PLAYER_ORIENTATION,MAP
    MAP = map   
    ROWS = len(map)
    COLS = len(map[0])
    RESULT = RESULT_TYPE[UNSET]
    PLAYER_ORIENTATION = DIRECTION_TYPE[data["map"]["startDirection"]]
    for y in range(ROWS):
        for x in range(COLS):
            if MAP[y][x] == SQUARE_TYPE[START]:
                PLAYER_POSITION['x'] = x
                PLAYER_POSITION['y'] = y
            if MAP[y][x] == SQUARE_TYPE[FINISH]:
                FINISH_POSITION['x'] = x
                FINISH_POSITION['y'] = y

def constrain_direction4(direction):
    d = direction % 4
    if d < 0:
        d += 4
    return d

def getPlayerX():
  return PLAYER_POSITION['x']

def getPlayerY():
  return PLAYER_POSITION['y']

def getTargetX():
  return FINISH_POSITION['x']

def getTargetY():
  return FINISH_POSITION['y']

def getPlayerDir():
  return PLAYER_ORIENTATION

def canMove():
  global PLAYER_POSITION, PLAYER_ORIENTATION, MOVE_POSITION, SQUARE_TYPE, WALL, ROWS, COLS, DIRECTION_TYPE
  effective_direction = PLAYER_ORIENTATION
  test_x = PLAYER_POSITION['x'] + MOVE_POSITION[effective_direction]['x']
  test_y = PLAYER_POSITION['y'] + MOVE_POSITION[effective_direction]['y']
  if test_x < 0 or test_x >= COLS:
      return False
  elif test_y < 0 or test_y >= ROWS:
      return False
  else:
      return not MAP[test_y][test_x] == SQUARE_TYPE[WALL]

def isInFrontOfEnemy():
  global PLAYER_POSITION, PLAYER_ORIENTATION, MOVE_POSITION, SQUARE_TYPE, WALL, ROWS, COLS, DIRECTION_TYPE
  effective_direction = PLAYER_ORIENTATION
  test_x = PLAYER_POSITION['x'] + MOVE_POSITION[effective_direction]['x']
  test_y = PLAYER_POSITION['y'] + MOVE_POSITION[effective_direction]['y']
  if test_x < 0 or test_x >= COLS:
      return False
  elif test_y < 0 or test_y >= ROWS:
      return False
  else:
      return MAP[test_y][test_x] == SQUARE_TYPE[OBSTACLE]

def isOnTarget():
  return PLAYER_POSITION['y'] == FINISH_POSITION['y'] and PLAYER_POSITION['x'] == FINISH_POSITION['x']

def spyOnTarget():
  global FINISHED
  if(isOnTarget()):
    FINISHED = True

def isPath(direction):
    global PLAYER_POSITION, PLAYER_ORIENTATION, MOVE_POSITION, SQUARE_TYPE, WALL, ROWS, COLS, DIRECTION_TYPE
    effective_direction = constrain_direction4(PLAYER_ORIENTATION + direction)
    test_x = PLAYER_POSITION['x'] + MOVE_POSITION[effective_direction]['x']
    test_y = PLAYER_POSITION['y'] + MOVE_POSITION[effective_direction]['y']
    if test_x < 0 or test_x >= COLS:
        return False
    elif test_y < 0 or test_y >= ROWS:
        return False
    else:
        return not MAP[test_y][test_x] == SQUARE_TYPE[WALL] and not MAP[test_y][test_x] == SQUARE_TYPE[OBSTACLE]


def isPathForward():
    return isPath(0)


def isPathRight():
    return isPath(1)


def isPathBackward():
    return isPath(2)


def isPathLeft():
    return isPath(3)


def moveForward():
    global PLAYER_POSITION, PLAYER_ORIENTATION, MOVE_POSITION, STEPS, MAXSTEPS
    if (STEPS + 1 > MAXSTEPS and MAXSTEPS != -1) or STEPS > 10000:
        raise StepNumberExceededException()
    elif isPathForward():
        PLAYER_POSITION['x'] = PLAYER_POSITION['x'] + MOVE_POSITION[PLAYER_ORIENTATION]['x']
        PLAYER_POSITION['y'] = PLAYER_POSITION['y'] + MOVE_POSITION[PLAYER_ORIENTATION]['y']
        STEPS += 1
    else:
        raise BadPathException()


def turnLeft():
    global PLAYER_ORIENTATION, STEPS
    if (STEPS + 1 > MAXSTEPS and MAXSTEPS != -1) or STEPS > 10000:
        raise StepNumberExceededException()
    PLAYER_ORIENTATION = {DIRECTION_TYPE[EAST]: DIRECTION_TYPE[NORTH],
                          DIRECTION_TYPE[SOUTH]: DIRECTION_TYPE[EAST],
                          DIRECTION_TYPE[WEST]: DIRECTION_TYPE[SOUTH],
                          DIRECTION_TYPE[NORTH]: DIRECTION_TYPE[WEST]
                          }[PLAYER_ORIENTATION]
    STEPS += 1


def turnRight():
    global PLAYER_ORIENTATION, STEPS
    if (STEPS + 1 > MAXSTEPS and MAXSTEPS != -1) or STEPS > 10000:
        raise StepNumberExceededException()
    PLAYER_ORIENTATION = {DIRECTION_TYPE[EAST]: DIRECTION_TYPE[SOUTH],
                          DIRECTION_TYPE[SOUTH]: DIRECTION_TYPE[WEST],
                          DIRECTION_TYPE[WEST]: DIRECTION_TYPE[NORTH],
                          DIRECTION_TYPE[NORTH]: DIRECTION_TYPE[EAST]
                          }[PLAYER_ORIENTATION]
    STEPS += 1


def isDone():
    global FINISHED
    return FINISHED


def notDone():
    return not isDone()
allsteps = 0
total = len(data["map"]["layout"])
for i in range(total):
  init(data["map"]["layout"][i])
  try: 
    student_code()
    if isOnTarget() and notDone():
      print(str(data["map"]["layout"][i])+"###Vous y êtes presque ! Votre presonnage atteint le but mais il manque une action.###"+str((i/total)*100))
      quit()
    elif notDone():
      print(str(data["map"]["layout"][i])+"### ###"+str((i/total)*100))
      quit()
    allsteps += STEPS
    STEPS = 0
  except BadPathException:
    print(str(data["map"]["layout"][i])+"###Le personnage emprunte un chemin inexistant.###"+str((i/total)*100))
    quit()
  except StepNumberExceededException:
    print(str(data["map"]["layout"][i])+"###Le personnage fait trop de pas ("+str(STEPS)+").###"+str((i/total)*100))
    quit()

print("True "+str(allsteps/30))

