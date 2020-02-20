import * as _ from "lodash";

import {SequencerSettings, SequencerSlot, SynthNodeConfig} from "../grid-config";
import {SynthAudioNode} from "./SynthAudioNode";

export const GAIN_PRESETS = {
    full: [],
    half: [0.5],
    "3/4": [0.75],
    quarter: [0.25],
    dots: [1/6, 2/6, 3/6, 4/6, 5/6],
    silent: [0]
};

export const TRANSITIONS = [
    'linear',
    'teasy',
    'cut'
];

function setGainPresetLoudFrom(gp, t) {
    const mgp = [];
    for (const g of gp) {
        if (g < t) {
            mgp.push(g);
        } else {
            break;
        }
    }

    if (mgp.length % 2 == 1) {
        mgp.push(t);
    }
    return mgp;
}

export class SequencerNode implements SynthAudioNode {

    baseTime = null;
    tick: number;
    allTicks: number;
    slotTick: number;
    private outputs: {[name: string]: AudioParam} = {};

    private tickCallback;

    constructor(private audioCtx: AudioContext, public config: SynthNodeConfig<SequencerSettings>) {
        this.restart();
        this.start();
    }

    static create(id: string, audioCtx: AudioContext): SequencerNode {
        return new SequencerNode(audioCtx, {
            id,
            type: 'Sequencer',
            inputs: [],
            outputs: ['gain', 'detune'],
            settings: {
                slots: [
                    {value: 5, count: 1, gainPreset: 'quarter', transition: 'linear', offset: 0},
                    {value: 3, count: 1, gainPreset: 'dots', transition: 'linear', offset: 0},
                    {value: 5, count: 1, gainPreset: 'quarter', transition: 'linear', offset: 0},
                    {value: 0, count: 1, gainPreset: 'quarter', transition: 'linear', offset: 0},
                    {value: -4, count: 1, gainPreset: 'quarter', transition: 'linear', offset: 0},
                    {value: 0, count: 1, gainPreset: 'quarter', transition: 'linear', offset: 0},
                    {value: -7, count: 1, gainPreset: 'full', transition: 'linear', offset: 0},
                    {value: -7, count: 1, gainPreset: 'full', transition: 'linear', offset: 0},
                ],
                tickEvery: 0.2,   
            }
        })
    }

    pack() {
        return _.clone(this.config);
    }

    onTick(f) {
        this.tickCallback = f;
    }

    restart() {
        this.baseTime = this.audioCtx.currentTime;
        this.tick = -1;
        this.allTicks = -1;
        this.slotTick = 0;
    }

    getInput(name: string): any {
        throw new Error("node has no inputs");
    }

    getOutput(name: string): any {
        return null;
    }

    connectInput(name: string) {
        throw new Error("node has no inputs");
    }

    connectOutput(outputName: 'detune' | 'gain', to: AudioParam) {
        if (!(to instanceof AudioParam)) {
            throw new Error("unsupported output type");
        }
        this.outputs[outputName] = to;
    }

    editSlot(i: number, slot: SequencerSlot) {
        this.config.settings.slots[i] = slot;
        // this.restart();
    }

    addSlot(at: number) {
        this.config.settings.slots.splice(at, 0, {value:0, count: 1, gainPreset: 'full', offset:0, transition: 'cut'});
    }

    deleteSlot(at: number) {
        this.config.settings.slots.splice(at,1);
    }

    setTickEvery(tickEvery: number) {
        this.config.settings.tickEvery = tickEvery;
    }



    private callOnOutput(name: 'gain'|'detune', fn: (output: AudioParam)=>void) {
        const output = this.outputs[name];
        if (output) fn(output);
    }

    start() {
        this.baseTime = this.audioCtx.currentTime;
        this.tick = -1;
        this.allTicks = -1;
        this.slotTick = -1;
        const nextTick = () => {
            this.slotTick++;
            this.allTicks++;
            if (this.tick < 0 || this.config.settings.slots[this.tick % this.config.settings.slots.length].count <= this.slotTick) {
                this.tick++;
                this.slotTick = 0;
                if (this.tickCallback) this.tickCallback();
            }
            const slot = this.config.settings.slots[this.tick % this.config.settings.slots.length];
            let nextTickTime = this.baseTime + (this.allTicks + 1) * this.config.settings.tickEvery;

            slot.offset = slot.offset || 0;

            const thisTick = this.allTicks;
            const TEASING_DELTA = 0.3;
            const slotTime = this.baseTime + (thisTick + slot.offset) * this.config.settings.tickEvery;
            this.callOnOutput('detune', (o) => o.setValueAtTime(slot.value*100, slotTime));

            let gp = GAIN_PRESETS[slot.gainPreset];

            if (this.slotTick == slot.count - 1) {
                const nextSlot = this.config.settings.slots[(this.tick + 1) % this.config.settings.slots.length];
                const nextSlotTime = this.baseTime + (thisTick + 1 + nextSlot.offset) * this.config.settings.tickEvery;
                nextTickTime += nextSlot.offset * this.config.settings.tickEvery;
                if ((nextSlot.transition == 'linear' || nextSlot.transition == 'teasy')) {
                    if (nextSlot.transition == 'teasy') {
                        this.callOnOutput('detune', (o) => o.setValueAtTime(nextSlot.value*100 - 150, nextSlotTime - TEASING_DELTA * this.config.settings.tickEvery))
                    }
                    const delayMs = (nextSlotTime - TEASING_DELTA * this.config.settings.tickEvery - slotTime) * 1000;
                    setTimeout(() => {
                        this.callOnOutput('detune', (o) => o.linearRampToValueAtTime(nextSlot.value*100, nextSlotTime))
                    }, delayMs);
                    if (nextSlot.transition == 'teasy') {
                        gp = setGainPresetLoudFrom(gp, 1 - TEASING_DELTA + nextSlot.offset)
                    }
                }
            }

            this.callOnOutput('gain', (o) => o.setValueAtTime(1, slotTime));
            gp.forEach((p,i) => {
                if (p < 1) {
                    this.callOnOutput('gain', (o) => o.setValueAtTime(i % 2, slotTime + p * this.config.settings.tickEvery));
                }
            });

            setTimeout(nextTick, Math.max((nextTickTime - this.audioCtx.currentTime) * 1000, 1));
        };

        nextTick();
    }

}
