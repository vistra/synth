import * as _ from 'lodash';
import {BiquadFilterSettings, SynthNodeConfig} from "../grid-config";
import {SynthAudioNode} from "./SynthAudioNode";

export class BiquadFilterNode implements SynthAudioNode {
    filterNode = null;

    constructor(private audioCtx: AudioContext, public config: SynthNodeConfig<BiquadFilterSettings>) {
        this.config = _.cloneDeep(this.config);
        this.filterNode = audioCtx.createBiquadFilter();
        this.update();
    }

    setType(type: string) {
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

    setQ(Q: number) {
        this.config.settings.Q = Q || 0;
        this.update();
    }

    update() {
        const settings = this.config.settings;
        this.filterNode.type = settings.type;
        this.filterNode.frequency.value = settings.freq;
        this.filterNode.gain.value = settings.gain;
        this.filterNode.Q.value = settings.Q;
    }

    static create(id: string, audioCtx: AudioContext): BiquadFilterNode {
        return new BiquadFilterNode(audioCtx, {
            id,
            type: 'BiquadFilter',
            inputs: ['input'],
            outputs: ['output'],
            top: 0,
            left: 0,
            settings: {
                type: 'lowpass',
                Q: 0,
                freq: 440,
                gain: 10,
            }
        })
    }

    pack() {
        return _.cloneDeep(this.config);
    }

    getInput(name: 'input') {
        return this.filterNode;
    }

    getOutput(name: 'output'): any {
        return this.filterNode;
    }

    connectInput(inputName: 'input', from: any) {
        from.connect(this.filterNode);
    }

    connectOutput(outputName: 'output', to: any) {
        this.filterNode.connect(to);
    }
}

