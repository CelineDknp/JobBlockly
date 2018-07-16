import Image, ImageDraw
import math
import json
import os

def moveForward(length):
    global current_x, current_y, current_heading, penColour, current_width
    next_x = current_x + int(length * math.sin(2 * math.pi * current_heading / 360));
    next_y = current_y - int(length * math.cos(2 * math.pi * current_heading / 360));
    if(penDown):
    	draw.line([current_x, current_y, next_x, next_y], penColour, width=current_width)
    current_x = next_x
    current_y = next_y

def moveBackward(length):
    global current_x, current_y, current_heading, penColour, current_width
    next_x = current_x - int(length * math.sin(2 * math.pi * current_heading / 360));
    next_y = current_y + int(length * math.cos(2 * math.pi * current_heading / 360));
    if(penDown):
      draw.line([current_x, current_y, next_x, next_y], penColour, width=current_width)
    current_x = next_x
    current_y = next_y


def jumpForward(length):
  penUp()
  moveForward(length)
  penDown()

def jumpBackward(length):
  penUp()
  moveBackward(length)
  penDown()

def turnRight(angle):
  global current_heading
  current_heading = (current_heading + angle) % 360;

def turnLeft(angle):
  global current_heading
  current_heading = (current_heading - angle) % 360;
  if (current_heading < 0):
    current_heading += 360

def penWidth(width):
  global current_width
  current_width = width

def penUp():
  global penDown
  penDown = False

def penDown():
  global penDown
  penDown = True

def penColour(colour):
  global penColour
  penColour = colour

def randomColour():
  colour = "%06x" % random.randint(0, 0xFFFFFF)
  return "#" + colour

def penWidth(width):
  global current_width
  current_width = width


#Main

dir_path = os.path.dirname(os.path.realpath(__file__))
data = ""
with open(dir_path + '/turtle_config.json') as f:
  data = json.load(f)

width = data["width"]
height = data["height"]
current_x = data["startX"]
current_y = data["startY"]
current_heading = data["startAngle"]
current_width = data["strokeWidth"]
penDown = True
penColour = data["strokeColour"]


# PIL create an empty image and draw object to draw on
# memory only, not visible
image1 = Image.new("RGBA", (width, height), (0,0,0,0))
draw = ImageDraw.Draw(image1)

# do the PIL image/draw (in memory) drawings
for i in range(4):
  moveForward(250)
  turnRight(90)

# PIL image can be saved as .png .jpg .gif or .bmp file (among others)
filename = "solution.png"
image1.save(filename)
