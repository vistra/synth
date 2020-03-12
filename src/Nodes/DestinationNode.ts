import {AnalyzerSettings, DestinationSettings, SynthNodeConfig} from "../grid-config";
import {SynthAudioNode} from "./SynthAudioNode";

export class DestinationNode implements SynthAudioNode {
    constructor(private audioCtx: AudioContext, public config: SynthNodeConfig<DestinationSettings>, public analyzer: AnalyserNode) {

    }

    pack() {
        return this.config;
    }

    static create(id: string, audioCtx: AudioContext, analyzer: AnalyserNode): DestinationNode {
        return new DestinationNode(audioCtx, {
            id,
            type: 'Destination',
            inputs: ['input'],
            outputs: [],
            top: 0,
            left: 0,
            settings: {}
        }, analyzer)
    }

    connectInput(inputName: string, inputSource: any) {
        inputSource.connect(this.audioCtx.destination);
        inputSource.connect(this.analyzer);
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
