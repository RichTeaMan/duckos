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
        this.closedPosition = 2500;
        this.openPosition = 1600;
        console.log("speech");
        console.log("open");
        this.motor.servoWrite(this.openPosition);
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
        var _this = this;
        console.log(fileName);
        var margin = 10;
        var mouthSampleLength = 0.0625; // 16 times a second
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
        console.log("closed");
        this.motor.servoWrite(this.closedPosition);
        ac.decodeAudioData(file, function (audioBuffer) {
            var channelArray = audioBuffer.getChannelData(0);
            console.log("sample rate: " + audioBuffer.sampleRate);
            console.log("length: " + audioBuffer.length);
            console.log("channels: " + audioBuffer.numberOfChannels);
            console.log("duration: " + audioBuffer.duration);
            console.log("channel data length: " + channelArray.length);
            var array = [];
            var chunkSize = audioBuffer.sampleRate * mouthSampleLength;
            var i = 0;
            var length = channelArray.length;
            while (i < length) {
                array.push(channelArray.slice(i, i += chunkSize).reduce(function (total, value) {
                    return Math.max(total, Math.abs(value));
                }));
            }
            var min = Math.min.apply(Math, array);
            var max = Math.max.apply(Math, array);
            console.log("Samples: " + array.length + " Min: " + min + " Max: " + max);
            var chunkCount = 0;
            console.log("Starting sound...");
            var bufferNode = ac.createBufferSource();
            bufferNode.connect(ac.destination);
            bufferNode.buffer = audioBuffer;
            bufferNode.loop = false;
            var millis = Date.now();
            bufferNode.start(0);
            console.log("Sound started");
            var mouthInterval = setInterval(function () {
                if (chunkCount > array.length) {
                    console.log('Sample complete.');
                    _this.motor.servoWrite(_this.openPosition);
                    clearInterval(mouthInterval);
                }
                var sample = array[chunkCount];
                chunkCount++;
                if (isNaN(sample)) {
                    console.log(chunkCount + "/" + array.length + " is NAN");
                    return;
                }
                var normalisedSample = (sample - min) / (max - min);
                var pulse = Math.round(((1.0 - normalisedSample) * (_this.closedPosition - _this.openPosition)) + _this.openPosition);
                console.log("Chunk: " + chunkCount + "/" + array.length + " Sample: " + sample + " NormalisedSample: " + normalisedSample + " Pulse: " + pulse);
                _this.motor.servoWrite(pulse);
            }, 1000 * mouthSampleLength);
        });
    };
    return Speech;
}());
var s = new Speech();
s.loadSpeech("/home/duckos/duckos/bohemian-rhapsody-intro.mp3");
