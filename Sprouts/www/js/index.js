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

var ongoingTouches = [];

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



var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);

        var thecanvas = document.getElementsByTagName('canvas')[0];
        thecanvas.height = window.screen.height;
        thecanvas.width = window.screen.width;

        thecanvas.addEventListener("touchstart", function (evt) { // Handle touch start
            console.log('Handling touch start:')
            evt.preventDefault();
            var el = document.getElementsByTagName("canvas")[0];
            var ctx = el.getContext("2d");
            var touches = evt.changedTouches;

            ongoingTouches.push(copyTouch(touches[0]));
            var color = colorForTouch(touches[0]);
            ctx.beginPath();
            ctx.arc(touches[0].pageX, touches[0].pageY, 8, 0, 2 * Math.PI, false);  // a circle at the start
            ctx.strokeStyle = color;
            ctx.stroke();
        
        }, false);

        thecanvas.addEventListener("touchend", function (evt) { // Handle touch end
            console.log('Handling touch end:')
            evt.preventDefault();
            var el = document.getElementsByTagName("canvas")[0];
            var ctx = el.getContext("2d");
            var touches = evt.changedTouches;

            //var color = colorForTouch(touches[0]);
            var idx = ongoingTouchIndexById(touches[0].identifier);

            if (idx >= 0) {
                ctx.beginPath();
                ctx.arc(touches[idx].pageX, touches[idx].pageY, 8, 0, 2*Math.PI, true);
                var color = colorForTouch(touches[0]);
                ctx.strokeStyle = color;
                ctx.stroke();
                
                ongoingTouches.splice(idx, 1);  // remove it; we're done
            } else {
                console.log("can't figure out which touch to end");
            }
            
        }, false);

        thecanvas.addEventListener("touchcancel", function (evt) { // Handle touch cancel
            console.log('Handling touch cancel:')
            evt.preventDefault();
            console.log("touchcancel.");
            var touches = evt.changedTouches;
  
            for (var i = 0; i < touches.length; i++) {
                var idx = ongoingTouchIndexById(touches[i].identifier);
                ongoingTouches.splice(idx, 1);  // just remove it, we're done
            }
        }, false);

        thecanvas.addEventListener("touchmove", function (evt) { // Handle touch move
            console.log('Handling touch move:')
            evt.preventDefault();
            var el = document.getElementsByTagName("canvas")[0];
            var ctx = el.getContext("2d");
            var touches = evt.changedTouches;

            for (var i = 0; i < touches.length; i++) {
                var color = colorForTouch(touches[i]);
                var idx = ongoingTouchIndexById(touches[i].identifier);

                if (idx >= 0) {
                console.log("continuing touch "+idx);
                ctx.beginPath();
                console.log("ctx.moveTo(" + ongoingTouches[idx].pageX + ", " + ongoingTouches[idx].pageY + ");");
                ctx.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);
                console.log("ctx.lineTo(" + touches[i].pageX + ", " + touches[i].pageY + ");");
                ctx.lineTo(touches[i].pageX, touches[i].pageY);
                ctx.lineWidth = 4;
                ctx.strokeStyle = color;
                ctx.stroke();

                ongoingTouches.splice(idx, 1, copyTouch(touches[i]));  // swap in the new touch record
                console.log(".");
                } else {
                    console.log("can't figure out which touch to continue");
                }
            }
        }, false);
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
        console.log('Device is ready');
        
    }
};

app.initialize();