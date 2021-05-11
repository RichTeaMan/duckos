import { Gpio } from 'pigpio';
import fs from 'fs';
// @ts-ignore
import { AudioContext as nodeAudioContext } from 'web-audio-api';
import Speaker from 'speaker';

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

    const ac: AudioContext & { format: any, outStream: any } = new nodeAudioContext();
    //const ac: AudioContext = new wAudioContext();
    const file = fs.readFileSync(fileName);
    console.log(file);
    const ab = this.toArrayBuffer(file);
    console.log(ab);

    ac.outStream = new Speaker({
      channels: ac.format.numberOfChannels,
      bitDepth: ac.format.bitDepth,
      sampleRate: ac.sampleRate
    });

    ac.decodeAudioData(file, (audioBuffer: AudioBuffer) => {

      console.log("???");
      var bufferNode = ac.createBufferSource();
      bufferNode.connect(ac.destination);
      bufferNode.buffer = audioBuffer;
      bufferNode.loop = true;
      bufferNode.start(0);
      console.log(">>> ???");

      

      const context: AudioContext = ac;
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

      console.log(ac);
      console.log("sound???");
      //ac.resume();
      console.log("sound done");

      for (let index in array) {
        //console.log(array[index]);
      }
    });
  }

}

const s = new Speech();
s.loadSpeech("/home/duckos/duckos/dont-stop-me-now.mp3");
