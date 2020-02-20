import {AnalyzerSettings, DestinationSettings, SynthNodeConfig} from "../grid-config";
import {SynthAudioNode} from "./SynthAudioNode";

export class DestinationNode implements SynthAudioNode {
    public analyzer: AnalyserNode;

    constructor(private audioCtx: AudioContext, public config: SynthNodeConfig<DestinationSettings>) {

    }

    pack() {
        return this.config;
    }

    static create(id: string, audioCtx: AudioContext): DestinationNode {
        return new DestinationNode(audioCtx, {
            id,
            type: 'Destination',
            inputs: ['input'],
            outputs: [],
            settings: {}
        })
    }

    connectInput(inputName: string, inputSource: any) {
        inputSource.connect(this.audioCtx.destination);
    }

    connectOutput(outputName: string, to: any) {
        throw new Error('node has no outputs');
    }

    getInput(name: string): any {
        return null;
    }

    getOutput(name: string): any {
        throw new Error('node has no outputs');
    }

}
