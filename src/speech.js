"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var pigpio_1 = require("pigpio");
var fs_1 = __importDefault(require("fs"));
// @ts-ignore
var web_audio_api_1 = require("web-audio-api");
var speaker_1 = __importDefault(require("speaker"));
var Speech = /** @class */ (function () {
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
    function Speech() {
        this.motor = new pigpio_1.Gpio(17, { mode: pigpio_1.Gpio.OUTPUT });
        console.log("pulsing");
        var topPosition = 2500;
        var bottomPosition = 1600;
        var step = 50;
        var pulseWidth = topPosition;
        var increment = step;
    }
    Speech.prototype.toArrayBuffer = function (buf) {
        var ab = new ArrayBuffer(buf.length);
        var view = new Uint8Array(ab);
        for (var i = 0; i < buf.length; ++i) {
            view[i] = buf[i];
        }
        return ab;
    };
    Speech.prototype.loadSpeech = function (fileName) {
        console.log(fileName);
        var margin = 10;
        var chunkSize = 50;
        var ac = new web_audio_api_1.AudioContext();
        //const ac: AudioContext = new wAudioContext();
        var file = fs_1.default.readFileSync(fileName);
        console.log(file);
        var ab = this.toArrayBuffer(file);
        console.log(ab);
        ac.outStream = new speaker_1.default({
            channels: ac.format.numberOfChannels,
            bitDepth: ac.format.bitDepth,
            sampleRate: ac.sampleRate
        });
        ac.decodeAudioData(file, function (audioBuffer) {
            console.log("???");
            var bufferNode = ac.createBufferSource();
            bufferNode.connect(ac.destination);
            bufferNode.buffer = audioBuffer;
            bufferNode.loop = true;
            bufferNode.start(0);
            console.log(">>> ???");
            var context = ac;
            var float32Array = audioBuffer.getChannelData(0);
            var array = [];
            var i = 0;
            var length = float32Array.length;
            while (i < length) {
                array.push(float32Array.slice(i, i += chunkSize).reduce(function (total, value) {
                    return Math.max(total, Math.abs(value));
                }));
            }
            console.log(ac);
            console.log("sound???");
            //ac.resume();
            console.log("sound done");
            for (var index in array) {
                //console.log(array[index]);
            }
        });
    };
    return Speech;
}());
var s = new Speech();
s.loadSpeech("/home/duckos/duckos/dont-stop-me-now.mp3");
