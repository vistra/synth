import React from 'react';
import {AnalyzerSettings, DestinationSettings, SimpleOscillatorSettings, SynthNodeConfig} from "./grid-config";
import {AnalyzerNode} from "./Nodes/AnalyzerNode";
import {DestinationNode} from "./Nodes/DestinationNode";

interface Props {
    config: SynthNodeConfig<DestinationSettings>,
    node: DestinationNode,
    onChange: (config: SynthNodeConfig<DestinationSettings>) => void
    onConnectionChange: (outputName: string, inputId: string, inputName: string, action:"add"|"remove") => void
}
export class Destination extends React.Component<Props, any> {

    render() {
        return <div>
            Destination!
        </div>
    }

}

