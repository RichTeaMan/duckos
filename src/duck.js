"use strict";
var Gpio = require('pigpio').Gpio;
var motor = new Gpio(17, { mode: Gpio.OUTPUT });
/*
let dutyCycle = 0;

setInterval(() => {
  motor.pwmWrite(dutyCycle);

  dutyCycle += 5;
  if (dutyCycle > 255) {
    dutyCycle = 0;
  }
}, 20);
*/
console.log("pulsing");
var topPosition = 2500;
var bottomPosition = 1600;
var step = 50;
var pulseWidth = topPosition;
var increment = step;
setInterval(function () {
    pulseWidth += increment;
    if (pulseWidth >= topPosition) {
        increment = -step;
        pulseWidth = topPosition;
    }
    else if (pulseWidth <= bottomPosition) {
        increment = step;
        pulseWidth = bottomPosition;
    }
    motor.servoWrite(pulseWidth);
    //motor.servoWrite(2400)
    //motor.servoWrite(1500);
    console.log(pulseWidth);
}, 50);
