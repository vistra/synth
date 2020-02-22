import {AnalyzerSettings, SynthNodeConfig} from "../grid-config";
import {SynthAudioNode} from "./SynthAudioNode";

export class AnalyzerNode implements SynthAudioNode {
    public analyzer: AnalyserNode;

    constructor(private audioCtx: AudioContext, public config: SynthNodeConfig<AnalyzerSettings>) {
        this.analyzer = audioCtx.createAnalyser()
    }

    pack() {
        return this.config;
    }

    static create(id: string, audioCtx: AudioContext): AnalyzerNode {
        return new AnalyzerNode(audioCtx, {
            id,
            type: 'Analyzer',
            inputs: ['input'],
            outputs: [],
            top: 0,
            left: 0,
            settings: {}
        })
    }

    connectInput(inputName: string, inputSource: any) {
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
