import React from "react";
import * as _ from "lodash";
import {
    AnalyzerSettings,
    BiquadFilterSettings, DestinationSettings,
    GridConfig,
    IOGetters,
    NodeType,
    SequencerSettings,
    SimpleOscillatorSettings,
    SynthNodeConfig
} from "./grid-config";
import {SynthNode} from "./SynthNode";
import {SequencerNode} from "./Nodes/SequencerNode";
import {BiquadFilterNode} from "./Nodes/BiquadFilterNode";
import {SimpleOscillatorNode} from "./Nodes/SimpleOscillatorNode";
import {AnalyzerNode} from "./Nodes/AnalyzerNode";
import {SynthAudioNode} from "./Nodes/SynthAudioNode";
import {DestinationNode} from "./Nodes/DestinationNode";

const INITIAL_GRID: GridConfig = {
    width: 500,
    height: 500,
    nodes: [],
    connections: []
};

interface TProps {
    gridConfig: GridConfig,
    onChange: (gridConfig: GridConfig) => void
}
export class SynthGrid extends React.Component<TProps, any> {
    private gridConfig: GridConfig;
    private audioCtx: AudioContext;
    private nodes: {[id: string]: SynthAudioNode};

    constructor(props: TProps) {
        super(props);
        this.gridConfig = props.gridConfig || INITIAL_GRID;
        this.buildNodes();
    }

    buildNodes() {
        if (this.audioCtx) {
            this.audioCtx.close();
        }
        this.audioCtx = new AudioContext();
        const nodes: SynthAudioNode[] = this.gridConfig.nodes.map(node =>
            node.type == "Sequencer" ? new SequencerNode(this.audioCtx, node as SynthNodeConfig<SequencerSettings>)
                : node.type == 'BiquadFilter' ? new BiquadFilterNode(this.audioCtx, node as SynthNodeConfig<BiquadFilterSettings>)
                : node.type == 'SimpleOscillator' ? new SimpleOscillatorNode(this.audioCtx, node as SynthNodeConfig<SimpleOscillatorSettings>)
                : node.type == 'Analyzer' ? new AnalyzerNode(this.audioCtx, node as SynthNodeConfig<AnalyzerSettings>)
                : node.type == 'Destination' ? new DestinationNode(this.audioCtx, node as SynthNodeConfig<DestinationSettings>)
                : null
        );
        this.nodes = {};
        this.gridConfig.nodes.forEach((node, i) => {
            if (nodes[i] != null) {
                this.nodes[node.id] = nodes[i]
            }
        });

        for (const nodeConfig of this.gridConfig.nodes) {
            const node = this.nodes[nodeConfig.id];
            for (const input of this.getNodeInputs(nodeConfig)) {
                node.connectInput(input.inputName, input.input);
            }
            for (const output of this.getNodeOutputs(nodeConfig)) {
                node.connectOutput(output.outputName, output.output);
            }
        }
        this.forceUpdate();
    }

    onNodeChange = (changedNode: SynthNodeConfig<unknown>) => {
        this.gridConfig.nodes = this.gridConfig.nodes.map(node => node.id == changedNode.id ? _.clone(changedNode) : node);
        this.props.onChange(this.gridConfig);
    };

    onConnectionChange = (outputId: string, outputName: string, inputId: string, inputName: string, action: "add"|"remove") => {
        this.gridConfig.connections = this.gridConfig.connections
            .filter(
                x => x.fromNodeId != outputId ||
                    x.fromOutputName != outputName ||
                    x.toNodeId != inputId ||
                    x.toInputName != inputName
            ).concat(action == "add" ? [{
                fromNodeId: outputId,
                fromOutputName: outputName,
                toNodeId: inputId,
                toInputName: inputName
            }] : []);
        this.buildNodes();
        this.props.onChange(this.gridConfig);
    };

    newNode(type: NodeType) {
        const id = `${type}_${this.gridConfig.nodes.length}`;
        const node = type == "Sequencer" ? SequencerNode.create(id, this.audioCtx)
            : type == 'BiquadFilter' ? BiquadFilterNode.create(id, this.audioCtx)
                : type == 'SimpleOscillator' ? SimpleOscillatorNode.create(id, this.audioCtx)
                    : type == 'Analyzer' ? AnalyzerNode.create(id, this.audioCtx)
                    : type == 'Destination' ? AnalyzerNode.create(id, this.audioCtx)
                        : null;
        if (node == null) {
            throw new Error(`Unsupported node type: ${type}`)
        }
        this.gridConfig.nodes.push(node.pack());
        this.buildNodes();
        this.props.onChange(this.gridConfig);
    }

    getNodeInputs(nodeConfig: SynthNodeConfig<unknown>): {inputName: string, input: any}[] {
        const inputs = [];
        for (const input of nodeConfig.inputs) {
            const conn = this.gridConfig.connections.find(c => c.toNodeId == nodeConfig.id && c.toInputName == input);
            if (conn) {
                const inputNode = this.nodes[conn.fromNodeId];
                if (conn && inputNode.getOutput(conn.fromOutputName)) {
                    inputs.push({inputName:input, input: inputNode.getOutput(conn.fromOutputName)});
                }
            }
        }
        return inputs;
    }

    getNodeOutputs(nodeConfig: SynthNodeConfig<unknown>): {outputName: string, output: any}[] {
        const outputs = [];
        for (const output of nodeConfig.outputs) {
            const conn = this.gridConfig.connections.find(c => c.fromNodeId == nodeConfig.id && c.fromOutputName == output);
            if (conn) {
                const outputNode = this.nodes[conn.toNodeId];
                if (conn && outputNode.getInput(conn.fromOutputName)) {
                    outputs.push({outputName: output, output: outputNode.getInput(conn.fromOutputName)})
                }
            }
        }
        return outputs;
    }

    render() {
        const { gridConfig } = this.props;
        return <div style={{width: gridConfig.width, height: gridConfig.height}}>
            <div>
                {gridConfig.nodes.map(nodeCfg => <SynthNode
                    key={nodeCfg.id}
                    config={nodeCfg}
                    node={this.nodes[nodeCfg.id]}
                    onChange={this.onNodeChange}
                    onConnectionChange={(outputName: string, inputId: string, inputName: string, action:"add"|"remove") => this.onConnectionChange(nodeCfg.id, outputName, inputId, inputName, action)}
                />)}
            </div>

            <button onClick={() => this.newNode('Sequencer')}>New Sequencer</button>
            <button onClick={() => this.newNode('BiquadFilter')}>New BiquadFilter</button>
            <button onClick={() => this.newNode('SimpleOscillator')}>New Oscillator</button>
            <button onClick={() => this.newNode('Analyzer')}>New Analyzer</button>
        </div>
    }

}
