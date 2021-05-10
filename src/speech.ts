import { Gpio } from 'pigpio';
import fs from 'fs';
// @ts-ignore
import { AudioContext } from 'web-audio-api';

class Speech {


  motor = new Gpio(17, { mode: Gpio.OUTPUT });
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

  constructor() {

    console.log("pulsing");

    const topPosition = 2500;
    const bottomPosition = 1600;
    const step = 50;


    let pulseWidth = topPosition;
    let increment = step;

  }

  toArrayBuffer(buf: Buffer) {
    var ab = new ArrayBuffer(buf.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buf.length; ++i) {
      view[i] = buf[i];
    }
    return ab;
  }

  loadSpeech(fileName: string) {

    console.log(fileName);
    const margin = 10;
    const chunkSize = 50;

    const ac: AudioContext = new AudioContext();
    const file = fs.readFileSync(fileName);
    console.log(file);
    const ab = this.toArrayBuffer(file);
    console.log(ab);
    ac.decodeAudioData(file, (audioBuffer: AudioBuffer) => {

      const float32Array = audioBuffer.getChannelData(0);

      const array = [];

      let i = 0;
      const length = float32Array.length;
      while (i < length) {
        array.push(
          float32Array.slice(i, i += chunkSize).reduce(function (total, value) {
            return Math.max(total, Math.abs(value));
          })
        );
      }

      for (let index in array) {
        console.log(array[index]);
      }
    });
  }

}

const s = new Speech();
s.loadSpeech("/home/duckos/duckjs/dont-stop-me-now.mp3");
