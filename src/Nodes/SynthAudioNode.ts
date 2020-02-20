import {SynthNodeConfig} from "../grid-config";

export interface SynthAudioNode {
    connectInput(inputName: string, inputSource: any);
    connectOutput(outputName: string, to: any);

    getInput(name: string): any;
    getOutput(name: string): any;

    pack(): SynthNodeConfig;
}
