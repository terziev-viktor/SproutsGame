/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// the array in touchmove event args
var ongoingTouches = [];

// the circles drawn on the screen
var circles = [];

// width and height of the screen == the canvas
var WIDTH, HEIGHT;

// width of the lines we draw
const LINE_WIDTH = 4;

// the radius of circles we draw
const CIRCLE_RADIUS = 8;

// the c in a*a + b*b = c*c
const alpha = CIRCLE_RADIUS * 2;

// if the player is close enough to the other circle we will say that he touched it
const epsilon = 3; 

// a map of the canvas as a matrix of pixels and stuff
var Matrix;

// number of players whose turn is
var player = 1;

// Its time to make a new circle because a player linked 2 circles
var shouldCreateNewCircle = false;

// we are drawing because the player did not make a wrong move
var drawing = true;

var the_step;

class Circle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    get X() {
        return this.x;
    }

    get Y() {
        return this.y;
    }

    collides(other) {
        let a = Math.abs(this.x - other.X);
        let b = Math.abs(this.y - other.Y);
        return a*a + b*b <= alpha * alpha + epsilon;
    }
};

class CANVASMATRIX {
    constructor(w, h) {
        this.width = w;
        this.height = h;
        this.arr = new Array(this.width * this.height);
    }

    get height() {
        return this.height;
    }

    get width() {
        return this.width;
    }

    at(row, col) {
        if(row < this.height && col < this.width) {
            return this.arr[row * this.width + col];
        } else {
            throw "Invalid row and/or col in at(row, col)";
        }
    }

    set_at(row, col, some_value) {
        if(row < this.height && col < this.width) {
            this.arr[row * this.width + col] = some_value;
        } else {
            throw "Invalid row and/or col in set_at(row, col, some_value)";
        }
    }
};

function colorForTouch(touch) {
    var r = Math.random() * 255;
    var g = Math.random() * 255;
    var b = Math.random() * 255;

    r = r.toString(16); // make it a hex digit
    g = g.toString(16); // make it a hex digit
    b = b.toString(16); // make it a hex digit
    var color = "#" + r + g + b;
    console.log("color for touch with identifier " + touch.identifier + " = " + color);
    return color;
};

function copyTouch(touch) {
    return { identifier: touch.identifier, pageX: touch.pageX, pageY: touch.pageY };
};

function ongoingTouchIndexById(idToFind) {
    for (var i = 0; i < ongoingTouches.length; i++) {
      var id = ongoingTouches[i].identifier;
      
      if (id == idToFind) {
        return i;
      }
    }
    return -1;    // not found
};

function getCollidingCircleIndex(some_circle) {
    for(var i = 0; i < circles.length; ++i) {
        if(some_circle.collides(circles[i])) {
            return i;
        }
    }

    return -1;
};

function drawCircle(ctx, x, y) {
    ctx.beginPath();
    ctx.arc(x, y, CIRCLE_RADIUS, 0, 2 * Math.PI, false);
    ctx.stroke();
}

function drawCircle(circle) {
    let el = document.getElementsByTagName("canvas")[0];
    let ctx = el.getContext("2d");
    ctx.beginPath();
    ctx.arc(circle.X, circle.Y, CIRCLE_RADIUS, 0, 2 * Math.PI, false);
    ctx.stroke();
}

// object for syncronizing the game steps
class Step {
    constructor() {
        this.current = 0;
        this.number_of_steps = 4;
    }

    next() {
        ++this.current;
        this.current %= this.number_of_steps;
    }

    prev() {
        --this.current;
        if(this.current < 0) {
            this.current = this.number_of_steps - 1;
        }
    }

    equals(step_str) {
        if(this.current === 0 && step_str === "link_begin") { // link a circle with another with a line
            return true;
        }

        if(this.current === 1 && step_str === "link") { // draw a new circle on the last drawn line
            return true;
        }

        if(this.current === 2 && step_str === "link_end") { // draw a new circle on the last drawn line
            return true;
        }

        if(this.current === 3 && step_str === "draw_new_circle") { // draw a new circle on the last drawn line
            return true;
        }

        return false;
    }
}

function circleIsOnALine(circle) {
    return true; // mock of the function for now
}

var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
        var thecanvas = document.getElementsByTagName('canvas')[0];
        WIDTH = window.screen.width;
        HEIGHT = window.screen.height;
        thecanvas.height = HEIGHT;
        thecanvas.width = WIDTH;
        the_step = new Step();

        thecanvas.addEventListener("touchstart", function (evt) { // Handle touch start
            evt.preventDefault();

            if(the_step.equals("draw_new_circle")) {   
                let touches = evt.changedTouches;
                ongoingTouches.push(copyTouch(touches[0])); 
                let next_circle = new Circle(touches[0].pageX, touches[0].pageY);
                if(circleIsOnALine(next_circle)) {
                    drawCircle(next_circle);
                    circles.push(next_circle);
                    the_step.next();
                }
            } else if(the_step.equals("link_begin")) { 
                let touches = evt.changedTouches;
                ongoingTouches.push(copyTouch(touches[0]));
                let current_circle = new Circle(touches[0].pageX, touches[0].pageY);
                let colliding_cirlce = getCollidingCircleIndex(current_circle);
                if(colliding_cirlce > -1) {
                    the_step.next();
                }
            } else  {
                // maybe we want more steps ?
            }
            
        }, false);

        thecanvas.addEventListener("touchend", function (evt) { // Handle touch end
            evt.preventDefault();
            if(the_step.equals("link")) {
                the_step.next(); // set to link_end, because in touchmove we never know when we are going to stop

                let touches = evt.changedTouches;
                let idx = ongoingTouchIndexById(touches[0].identifier);
                if (idx >= 0) {
                    let c  = new Circle(touches[idx].pageX, touches[idx].pageY);
                    let i = getCollidingCircleIndex(c);
                    if(i == -1) {
                        alert("UNDO not implemented");
                        the_step.next();
                    } else {
                        the_step.next(); // draw new circle
                    }
                    ongoingTouches.splice(idx, 1);  // remove it; we're done
                } else {
                    console.log("error: indx < 0");
                }
            }
        }, false);

        thecanvas.addEventListener("touchcancel", function (evt) { // Handle touch cancel
            evt.preventDefault();
            let touches = evt.changedTouches;
  
            for (let i = 0; i < touches.length; i++) {
                let idx = ongoingTouchIndexById(touches[i].identifier);
                ongoingTouches.splice(idx, 1);  // just remove it, we're done
            }
        }, false);

        thecanvas.addEventListener("touchmove", function (evt) { // Handle touch move
            evt.preventDefault();
            if(the_step.equals("link")) {
                let el = document.getElementsByTagName("canvas")[0];
                let ctx = el.getContext("2d");
                let touches = evt.changedTouches;

                for (let i = 0; i < touches.length; i++) {
                    let color = colorForTouch(touches[i]);
                    let idx = ongoingTouchIndexById(touches[i].identifier);

                    if (idx >= 0) {
                        ctx.beginPath();
                        ctx.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);
                        ctx.lineTo(touches[i].pageX, touches[i].pageY);
                        ctx.lineWidth = LINE_WIDTH;
                        ctx.strokeStyle = color;
                        ctx.stroke();

                        ongoingTouches.splice(idx, 1, copyTouch(touches[i]));  // swap in the new touch record
                    }
                }
            }
        }, false);

        Matrix = new CANVASMATRIX(WIDTH, HEIGHT);
    },
    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        this.receivedEvent();
    },

    // Update DOM on a Received Event
    receivedEvent: function() {
        let circle1 = new Circle(WIDTH / 2 + 5 * CIRCLE_RADIUS, HEIGHT / 2), circle2 = new Circle(WIDTH / 2 - 5 * CIRCLE_RADIUS, HEIGHT / 2);
        let el = document.getElementsByTagName("canvas")[0];
        let ctx = el.getContext("2d");
        circles.push(circle1);
        circles.push(circle2);
        drawCircle(circle1);
        drawCircle(circle2);
    }
};

app.initialize();