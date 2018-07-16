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

MAP = data["map"]["layout"][0]

ROWS = len(MAP)
COLS = len(MAP[0])

UNSET = "UNSET"
SUCCESS = "SUCCESS"
FAILURE = "FAILURE"
TIMEOUT = "TIMEOUT"
ERROR = "ERROR"

RESULT_TYPE = {
    UNSET: 0,
    SUCCESS: 1,
    FAILURE: -1,
    TIMEOUT: 2,
    ERROR: -2
}

RESULT = RESULT_TYPE[UNSET]

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

for y in range(ROWS):
    for x in range(COLS):
        if MAP[y][x] == SQUARE_TYPE[START]:
            PLAYER_POSITION['x'] = x
            PLAYER_POSITION['y'] = y
        if MAP[y][x] == SQUARE_TYPE[FINISH]:
            FINISH_POSITION['x'] = x
            FINISH_POSITION['y'] = y

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

PLAYER_ORIENTATION = DIRECTION_TYPE[data["map"]["startDirection"]]


def student_code():
@   @code@@


def constrain_direction4(direction):
    d = direction % 4
    if d < 0:
        d += 4
    return d


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
    global PLAYER_POSITION, PLAYER_ORIENTATION, MOVE_POSITION
    if isPathForward():
        PLAYER_POSITION['x'] = PLAYER_POSITION['x'] + MOVE_POSITION[PLAYER_ORIENTATION]['x']
        PLAYER_POSITION['y'] = PLAYER_POSITION['y'] + MOVE_POSITION[PLAYER_ORIENTATION]['y']
    else:
        raise BadPathException()


def turnLeft():
    global PLAYER_ORIENTATION
    PLAYER_ORIENTATION = {DIRECTION_TYPE[EAST]: DIRECTION_TYPE[NORTH],
                          DIRECTION_TYPE[SOUTH]: DIRECTION_TYPE[EAST],
                          DIRECTION_TYPE[WEST]: DIRECTION_TYPE[SOUTH],
                          DIRECTION_TYPE[NORTH]: DIRECTION_TYPE[WEST]
                          }[PLAYER_ORIENTATION]


def turnRight():
    global PLAYER_ORIENTATION
    PLAYER_ORIENTATION = {DIRECTION_TYPE[EAST]: DIRECTION_TYPE[SOUTH],
                          DIRECTION_TYPE[SOUTH]: DIRECTION_TYPE[WEST],
                          DIRECTION_TYPE[WEST]: DIRECTION_TYPE[NORTH],
                          DIRECTION_TYPE[NORTH]: DIRECTION_TYPE[EAST]
                          }[PLAYER_ORIENTATION]


def isDone():
    global PLAYER_POSITION, FINISH_POSITION
    if PLAYER_POSITION['x'] == FINISH_POSITION['x'] and PLAYER_POSITION['y'] == FINISH_POSITION['y']:
        return True
    else:
        return False


def notDone():
    return not isDone()


try:
    student_code()
    if isDone():
        print("True", end='', flush=True)
    else:
        print("Il y a une erreur dans votre code.", end='', flush=True)
except BadPathException:
    print("Le personnage emprunte un chemin inexistant.")
