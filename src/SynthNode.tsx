import {
    AnalyzerSettings,
    BiquadFilterSettings, DestinationSettings, NodeConnection,
    SequencerSettings,
    SimpleOscillatorSettings,
    SynthNodeConfig
} from "./grid-config";
import {BiquadFilter} from "./BiquadFilter";
import {SimpleOscillator} from "./SimpleOscillator";
import {Sequencer} from "./Sequencer";
import React from "react";
import {Analyzer} from "./Analyzer";
import {SynthAudioNode} from "./Nodes/SynthAudioNode";
import {BiquadFilterNode} from "./Nodes/BiquadFilterNode";
import {SimpleOscillatorNode} from "./Nodes/SimpleOscillatorNode";
import {SequencerNode} from "./Nodes/SequencerNode";
import {AnalyzerNode} from "./Nodes/AnalyzerNode";
import {DestinationNode} from "./Nodes/DestinationNode";
import {Destination} from "./Destination";

interface TProps {
    config: SynthNodeConfig,
    node: SynthAudioNode,
    onChange: (config: SynthNodeConfig<unknown>) => void
    onConnectionChange: (outputName: string, inputId: string, inputName: string, action:"add"|"remove") => void
}
export class SynthNode extends React.Component<TProps> {

    onChange = (config: SynthNodeConfig<unknown>) => {
        this.props.onChange(config);
    };

    render() {
        const {config, node} = this.props;
        const {type} = config;
        return type == 'BiquadFilter' ? <BiquadFilter
                config={config as SynthNodeConfig<BiquadFilterSettings>}
                node={node as BiquadFilterNode}
                onChange={this.onChange}
                onConnectionChange={this.props.onConnectionChange}
                />
            : type == 'SimpleOscillator' ? <SimpleOscillator
                    config={config as SynthNodeConfig<SimpleOscillatorSettings>}
                    node={node as SimpleOscillatorNode}
                    onChange={this.onChange}
                    onConnectionChange={this.props.onConnectionChange}
                />
            : type == 'Analyzer' ? <Analyzer
                config={config as SynthNodeConfig<AnalyzerSettings>}
                node={node as AnalyzerNode}
                onChange={this.onChange}
                onConnectionChange={this.props.onConnectionChange}
                />
            : type == 'Sequencer' ? <Sequencer
                config={config as SynthNodeConfig<SequencerSettings>}
                node={node as SequencerNode}
                onChange={this.onChange}
                onConnectionChange={this.props.onConnectionChange}
                />
            : type == 'Destination' ? <Destination
                config={config as SynthNodeConfig<DestinationSettings>}
                node={node as DestinationNode}
                onChange={this.onChange}
                onConnectionChange={this.props.onConnectionChange}
                />
            : <div>Unsupported node type :(</div>;
    }

}
