import { Gpio } from 'pigpio';
import fs from 'fs';
// @ts-ignore
import { AudioContext as nodeAudioContext } from 'web-audio-api';
import Speaker from 'speaker';

class Speech {


  motor = new Gpio(17, { mode: Gpio.OUTPUT });
  closedPosition = 2400;
  openPosition = 1500;
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

    console.log("speech");

    console.log("open");
    this.motor.servoWrite(this.openPosition);

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
    const mouthSampleLength = 0.0625; // 16 times a second

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

    
    console.log("closed");
    this.motor.servoWrite(this.closedPosition);

    ac.decodeAudioData(file, (audioBuffer: AudioBuffer) => {

      const channelArray = audioBuffer.getChannelData(0);
      console.log(`sample rate: ${audioBuffer.sampleRate}`);
      console.log(`length: ${audioBuffer.length}`);
      console.log(`channels: ${audioBuffer.numberOfChannels}`);
      console.log(`duration: ${audioBuffer.duration}`);
      console.log(`channel data length: ${channelArray.length}`);

      const array: number[] = [];

      const chunkSize = audioBuffer.sampleRate * mouthSampleLength;

      let i = 0;
      const length = channelArray.length;
      while (i < length) {
        array.push(
          channelArray.slice(i, i += chunkSize).reduce(function (total, value) {
            return Math.max(total, Math.abs(value));
          })
        );
      }
      const min = Math.min(...array);
      const max = Math.max(...array);
      console.log(`Samples: ${array.length} Min: ${min} Max: ${max}`);
      let chunkCount = 0;


      console.log("Starting sound...");
      var bufferNode = ac.createBufferSource();
      bufferNode.connect(ac.destination);
      bufferNode.buffer = audioBuffer;
      bufferNode.loop = true;
      const millis = Date.now()
      bufferNode.start(0);
      console.log("Sound started");

      const mouthInterval = setInterval(() => {
  
        if (chunkCount > array.length) {
          console.log('Sample complete.');
          this.motor.servoWrite(this.openPosition);
          clearInterval(mouthInterval);
        }

        const sample = array[chunkCount];
        chunkCount++;
        if (isNaN(sample)) {
          console.log(`${chunkCount}/${array.length} is NAN`);
          return;
        }
        const normalisedSample = (sample - min) / (max - min);
        
        const pulse = Math.round(((1.0 - normalisedSample) * (this.closedPosition - this.openPosition)) + this.openPosition);
        
        console.log(`Chunk: ${chunkCount}/${array.length} Sample: ${sample} NormalisedSample: ${normalisedSample} Pulse: ${pulse}`);
        this.motor.servoWrite(pulse);
      
      }, 1000 * mouthSampleLength);

    });
  }

}

const s = new Speech();
s.loadSpeech("/home/duckos/duckos/bohemian-rhapsody-intro.mp3");
