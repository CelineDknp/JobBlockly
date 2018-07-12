import math
import json
import os

#Reset the turtle variables to starting position
def resetTurtle():
  Turtle["x"] = start_x
  Turtle["y"] = start_y
  Turtle["heading"] = start_heading
  Turtle["colour"] = start_pen_colour
  Turtle["width"] = start_pen_width
  Turtle["penDown"] = True


def student_code():
@   @code@@

#Code of the solution
def solution():
  for i in range(4):
    moveForward(250)
    turnRight(90)

#
# Code to "draw"
#

# Format stored in the dictionary :
# Point x - Point y (as int) : strokewidth strokeColour

def moveForward(length):
  addPoint()
  for i in range(length):
    Turtle["x"] += int(1 * math.sin(2 * math.pi * Turtle["heading"] / 360));
    Turtle["y"] -= int(1 * math.cos(2 * math.pi * Turtle["heading"] / 360));
    if(Turtle["penDown"]):
      addPoint()

def moveBackward(length):
  addPoint()
  for i in range(length):
    Turtle["x"] -= int(1 * math.sin(2 * math.pi * Turtle["heading"] / 360));
    Turtle["y"] += int(1 * math.cos(2 * math.pi * Turtle["heading"] / 360));
    if(Turtle["penDown"]):
      addPoint()

def addPoint():
  if(sol): # We are computing the solution
    if(count_colours): # Colour is important
        sol_output[str(Turtle["x"])+"-"+str(Turtle["y"])] = str(Turtle["width"])+" "+str(Turtle["colour"])
    else: # Colour is not important
      sol_output[str(Turtle["x"])+"-"+str(Turtle["y"])] = str(Turtle["width"])
  else: # We are computing the student output
    if(count_colours):
      user_output[str(Turtle["x"])+"-"+str(Turtle["y"])] = str(Turtle["width"])+" "+str(Turtle["colour"])
    else:
      user_output[str(Turtle["x"])+"-"+str(Turtle["y"])] = str(Turtle["width"])

def turnRight(angle):
  Turtle["heading"] = (Turtle["heading"] + angle) % 360;

def turnLeft(angle):
  Turtle["heading"] = (Turtle["heading"] - angle) % 360;
  if (Turtle["heading"] < 0):
    Turtle["heading"] += 360

def penWidth(width):
  Turtle["width"] = width

def penUp():
  Turtle["penDown"] = False

def penDown():
  Turtle["penDown"] = True

def penColour(colour):
  Turtle["colour"] = colour

# Get the json data
dir_path = os.path.dirname(os.path.realpath(__file__))
data = ""
with open(dir_path.replace("student","public/")+'turtle_config.json') as f:
  data = json.load(f)

# Dictionaries to compare
sol_output = {}
user_output = {}

# Variables to start
start_x = data["startX"]
start_y = data["startY"]
start_heading = data["startAngle"]
start_pen_width = data["strokeWidth"]
start_pen_colour = data["strokeColour"]

count_colours = data["colourSpecific"]

Turtle = {} # Current turtle state is stocked here
resetTurtle() # Set the variable
sol = True # We will execute the solution first. Save starting point
sol_output[str(Turtle["x"])+"-"+str(Turtle["y"])] = str(Turtle["width"])+" "+str(Turtle["colour"])
solution() # Execute the solution
resetTurtle() # Reset the turtle again
sol = False # We are no longer executing the solution
user_output[str(Turtle["x"])+"-"+str(Turtle["y"])] = str(Turtle["width"])+" "+str(Turtle["colour"])
student_code() # Execute the student code

if(user_output == sol_output): #If the dicts are the same, success
  print("True", end='', flush=True)
else:

  print("Votre solution est incorrecte, essayez encore", end='', flush=True)