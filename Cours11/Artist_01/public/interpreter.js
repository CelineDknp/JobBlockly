var initInterpreterApi = function(interpreter, scope) {
    var wrapper;
    wrapper = function(length) {
      Turtle.move(length);
    };
    interpreter.setProperty(scope, 'moveForward',
        interpreter.createNativeFunction(wrapper));
    wrapper = function(length) {
      Turtle.move(-length);
    };
    interpreter.setProperty(scope, 'moveBackward',
        interpreter.createNativeFunction(wrapper));
    wrapper = function(angle) {
      Turtle.turn(angle, 0);
    };
    interpreter.setProperty(scope, 'turnLeft',
        interpreter.createNativeFunction(wrapper));
    wrapper = function(angle) {
      Turtle.turn(angle, 1);
    };
    interpreter.setProperty(scope, 'turnRight',
        interpreter.createNativeFunction(wrapper));
    wrapper = function(width) {
      Turtle.penWidth(width);
    };
    interpreter.setProperty(scope, 'penWidth',
        interpreter.createNativeFunction(wrapper));
    wrapper = function() {
      Turtle.penUp();
    };
    interpreter.setProperty(scope, 'penUp',
        interpreter.createNativeFunction(wrapper));
    wrapper = function() {
      Turtle.penDown();
    };
    interpreter.setProperty(scope, 'penDown',
        interpreter.createNativeFunction(wrapper));
    wrapper = function(colour) {
      Turtle.penColour(colour);
    };
    interpreter.setProperty(scope, 'penColour',
        interpreter.createNativeFunction(wrapper));


    

    Turtle.log = [];
    Turtle.reset(false);
};

var animate = function() {
    Turtle.animate();
};
