import React from 'react';
import {AnalyzerSettings, DestinationSettings, SimpleOscillatorSettings, SynthNodeConfig} from "./grid-config";
import {AnalyzerNode} from "./Nodes/AnalyzerNode";
import {DestinationNode} from "./Nodes/DestinationNode";
import {Connector} from "./connector";
import {NodeOutput} from "./NodeOutput";
import {NodeInput} from "./NodeInput";

interface Props {
    config: SynthNodeConfig<DestinationSettings>,
    node: DestinationNode,
    onChange: (config: SynthNodeConfig<DestinationSettings>) => void
    connector: Connector;
}
export class Destination extends React.Component<Props, any> {

    render() {
        return <div>
            Destination!
            <NodeInput connector={this.props.connector} name={"input"} nodeId={this.props.config.id}/>
        </div>
    }

}

