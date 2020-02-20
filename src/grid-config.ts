import {BiquadFilter} from "./BiquadFilter";
import {SimpleOscillator} from "./SimpleOscillator";
import {Analyzer} from "./Analyzer";
import {Sequencer} from "./Sequencer";
import React from "react";

export const IOGetters = {
    detune: (node) => node.detune,
    gain: (node) => node.gain,
    node: (node) => node
};

export type NodeType = 'BiquadFilter' | 'SimpleOscillator' | 'Analyzer' | 'Sequencer' | 'Destination';

export function getIO(getterName: string, node: AudioNode) {
    return IOGetters[getterName](node);
}

export interface BiquadFilterSettings {
    type: string,
    Q: number,
    freq: number,
    gain: number,
}

export interface SimpleOscillatorSettings {
    freq: number,
    type: "sine" | "square" | "sawtooth",
    gain: number,
    delay: number
}

export interface AnalyzerSettings {
}

export interface DestinationSettings {
}

export interface SequencerSlot {
    value: number,
    count: number,
    gainPreset: string,
    transition: string,
    offset: number
}

export interface SequencerSettings {
    slots: SequencerSlot[],
    tickEvery: number,
}

export type NodeSettings = SequencerSettings | SimpleOscillatorSettings | BiquadFilterSettings | AnalyzerSettings | DestinationSettings;

export interface SynthNodeConfig<TSettings=NodeSettings> {
    id: string,
    type: NodeType,
    inputs: string[],
    outputs: string[],
    settings: TSettings
}

export interface NodeConnection {
    fromNodeId: string,
    fromOutputName: string,
    toNodeId: string,
    toInputName: string
}

export interface GridConfig {
    width: number,
    height: number,
    nodes: SynthNodeConfig[]
    connections: NodeConnection[]
}
