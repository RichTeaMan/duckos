const Gpio = require('pigpio').Gpio;

const motor = new Gpio(17, { mode: Gpio.OUTPUT });
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

const topPosition = 2500;
const bottomPosition = 1600;
const step = 50;


let pulseWidth = topPosition;
let increment = step;

setInterval(() => {
  
  pulseWidth += increment;
  if (pulseWidth >= topPosition) {
    increment = -step;
    pulseWidth = topPosition;
  } else if (pulseWidth <= bottomPosition) {
    increment = step;
    pulseWidth = bottomPosition;
  }
  motor.servoWrite(pulseWidth);
  //motor.servoWrite(2400)
  //motor.servoWrite(1500);

  console.log(pulseWidth);

  
}, 25);
