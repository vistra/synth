import React from 'react';
import * as _ from 'lodash';
import {SimpleOscillatorSettings, SynthNodeConfig} from "../grid-config";
import {SynthAudioNode} from "./SynthAudioNode";

const N_FREQ = 8;

export class SimpleOscillatorNode implements SynthAudioNode {

    oscillator = null;
    gainNode = null;
    delayNode = null;

    constructor(private audioCtx: AudioContext, public config: SynthNodeConfig<SimpleOscillatorSettings>) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const delay = audioCtx.createDelay();
        osc.connect(gain);
        gain.connect(delay);
        // delay.connect(target);
        osc.start();
        this.oscillator = osc;
        this.gainNode = gain;
        this.delayNode = delay;

        this.update();
    }

    pack() {
        return _.clone(this.config);
    }

    setType(type: SimpleOscillatorSettings["type"]) {
        this.config.settings.type = type;
        this.update();
    }

    setFreq(freq: number) {
        this.config.settings.freq = freq || 440;
        this.update();
    }

    setGain(gain: number) {
        this.config.settings.gain = gain || 10;
        this.update();
    }

    setDelay(delay: number) {
        this.config.settings.delay = delay || 0;
        this.update();
    }

    update() {
        this.oscillator.type = this.config.settings.type;
        this.oscillator.frequency.value = this.config.settings.freq || 440;

        this.gainNode.gain.value = this.config.settings.gain/100 || 0;
        this.delayNode.delayTime.value = this.config.settings.delay/100 || 0;
    }

    static create(id: string, audioCtx: AudioContext): SimpleOscillatorNode {
        return new SimpleOscillatorNode(audioCtx, {
            id,
            type: 'SimpleOscillator',
            inputs: ['gain', 'detune'],
            outputs: ['output'],
            top: 0,
            left: 0,
            settings: {
                type: 'sine',
                freq: 200,
                gain: 100,
                delay: 0
            }
        })
    }

    getInput(name: 'gain'|'detune'): any {
        if (name == 'gain') {
            return this.gainNode.gain;
        }
        if (name == 'detune') {
            return this.oscillator.detune;
        }
        throw new Error("no such input for oscillator");
    }

    getOutput(name: 'output'): any {
        return this.delayNode;
    }

    connectInput(inputName: 'gain'|'detune', from: any) {
        from.connect(this.getInput(inputName));
    }

    connectOutput(outputName: 'output', to: any) {
        this.delayNode.connect(to);
    }
}

