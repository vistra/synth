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
import {Connector} from "./connector";
import {onMove} from "./Mover";
import {BackgroundEqualizer} from "./BackgroundEqualizer";

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
    private connector: Connector;
    private history: GridConfig[] = [];
    private future: GridConfig[] = [];
    private canvasEl: HTMLCanvasElement;
    private mouseX: number;
    private mouseY: number;
    private analyzer: AnalyserNode;

    constructor(props: TProps) {
        super(props);
        this.gridConfig = props.gridConfig || INITIAL_GRID;
        this.history=[_.cloneDeep(this.gridConfig)];
        this.buildNodes();
        this.connector = new Connector(
            () => this.gridConfig.connections,
            (toNodeId: string, inputName: string) => {
                this.gridConfig.connections = this.gridConfig.connections.filter(c => c.toNodeId != toNodeId || c.toInputName != inputName)
                this.configChanged(this.gridConfig, true);
                this.future = [];
            },
            (fromNodeId: string, outputName: string, toNodeId: string, inputName: string) => {
                this.gridConfig.connections = this.gridConfig.connections.filter(
                    c => c.fromNodeId != fromNodeId || c.fromOutputName != outputName || c.toNodeId != toNodeId || c.toInputName != inputName
                ).concat([{
                    fromNodeId,
                    fromOutputName: outputName,
                    toNodeId,
                    toInputName: inputName
                }]);
                this.configChanged(this.gridConfig, true);
                this.future = [];
            }
        );
    }

    buildNodes = () => {
        if (this.audioCtx) {
            this.audioCtx.close();
        }
        this.audioCtx = new AudioContext();
        this.analyzer = this.audioCtx.createAnalyser();
        const nodes: SynthAudioNode[] = this.gridConfig.nodes.map(node =>
            node.type == "Sequencer" ? new SequencerNode(this.audioCtx, node as SynthNodeConfig<SequencerSettings>)
                : node.type == 'BiquadFilter' ? new BiquadFilterNode(this.audioCtx, node as SynthNodeConfig<BiquadFilterSettings>)
                : node.type == 'SimpleOscillator' ? new SimpleOscillatorNode(this.audioCtx, node as SynthNodeConfig<SimpleOscillatorSettings>)
                : node.type == 'Analyzer' ? new AnalyzerNode(this.audioCtx, node as SynthNodeConfig<AnalyzerSettings>)
                : node.type == 'Destination' ? new DestinationNode(this.audioCtx, node as SynthNodeConfig<DestinationSettings>, this.analyzer)
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

    private configChanged(config: GridConfig, buildNodes: boolean) {
        this.gridConfig = config;
        this.history.push(_.cloneDeep(config));
        this.props.onChange(this.gridConfig);
        if (buildNodes) {
            this.buildNodes();
        }
        this.forceUpdate();
    }

    private undo() {
        if (this.history.length > 1) {
            let cfg = this.history.pop();
            this.future = [_.cloneDeep(cfg)].concat(this.future);
            cfg = this.history.pop();
            this.configChanged(cfg, true);
        }
    }

    private redo() {
        if (this.future.length > 0) {
            const cfg = this.future.splice(0,1)[0];
            this.configChanged(cfg, true);
        }
    }

    onNodeChange = (changedNode: SynthNodeConfig<unknown>) => {
        this.gridConfig.nodes = this.gridConfig.nodes.map(node => node.id == changedNode.id ? _.cloneDeep(changedNode) : node);
        this.future = [];
        this.configChanged(this.gridConfig, false);
        this.drawConnections();
    };

    onNodeDeletion = (deletedNode: SynthNodeConfig<unknown>) => {
        this.gridConfig.nodes = this.gridConfig.nodes.filter(node => node.id != deletedNode.id);
        this.gridConfig.connections = this.gridConfig.connections.filter(conn => conn.fromNodeId != deletedNode.id && conn.toNodeId != deletedNode.id);
        this.future = [];
        this.configChanged(this.gridConfig, true);
        this.drawConnections();
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
        this.configChanged(this.gridConfig, true);
        this.future = [];
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
        const { gridConfig } = this;
        return <div style={{width: '100%', height: '100%', position: "relative"}} onMouseMove={(e) => this.onMouseMove(e)}>
            {/*<BackgroundEqualizer analyzer={this.analyzer}/>*/}
            <canvas className={'connector-canvas'} width={gridConfig.width} height={gridConfig.height} ref={canvasEl => this.canvasEl = canvasEl} style={{position: "absolute", zIndex:10}}/>
            <div>
                {gridConfig.nodes.map(nodeCfg => <SynthNode
                    key={nodeCfg.id}
                    config={nodeCfg}
                    node={this.nodes[nodeCfg.id]}
                    onChange={this.onNodeChange}
                    onDelete={this.onNodeDeletion}
                    connector={this.connector}
                />)}
            </div>

            <button onClick={() => this.newNode('Sequencer')}>Sequencer</button>
            <button onClick={() => this.newNode('BiquadFilter')}>BiquadFilter</button>
            <button onClick={() => this.newNode('SimpleOscillator')}>Oscillator</button>
            <button onClick={() => this.newNode('Analyzer')}>Analyzer</button>
            <button onClick={() => this.undo()}>Undo</button>
            <button onClick={() => this.redo()}>Redo</button>
        </div>
    }

    componentDidMount() {
        // this.drawConnections();
        // onMove(() => this.drawConnections());
        // this.connector.onChange(() => this.drawConnections());
        const drawer = () => {
            this.drawConnections();
            requestAnimationFrame(drawer);
        };
        drawer();
    }

    private drawConnections() {
        const centerXY = (e: Element) => ({
            x: e.getBoundingClientRect().left + window.scrollX + e.getBoundingClientRect().width / 2,
            y: e.getBoundingClientRect().top + window.scrollY +e.getBoundingClientRect().height / 2,
        });
        const ctx = this.canvasEl.getContext('2d');
        ctx.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);
        for (const conn of this.gridConfig.connections) {
            const fromEl = document.getElementsByClassName(`out-${conn.fromNodeId}-${conn.fromOutputName}`)[0];
            const toEl = document.getElementsByClassName(`in-${conn.toNodeId}-${conn.toInputName}`)[0];
            drawConnectionLine(ctx, centerXY(fromEl).x, centerXY(fromEl).y, centerXY(toEl).x, centerXY(toEl).y);
        }

        if (this.connector.isOutputSelected()) {
            const out = this.connector.selectedOutput;
            const fromEl = document.getElementsByClassName(`out-${out.nodeId}-${out.name}`)[0];
            drawConnectionLine(ctx, centerXY(fromEl).x, centerXY(fromEl).y, this.mouseX, this.mouseY);
        }
    }

    private onMouseMove(e) {
        this.mouseX = e.pageX;
        this.mouseY = e.pageY;
    }
}

function drawConnectionLine(ctx: CanvasRenderingContext2D, fromX, fromY, toX, toY) {
    const pulseLength = 20;
    const compression = 0.9;
    const pulseTime = 125;
    ctx.lineWidth = 3;
    const offset = 2 - (Date.now() % (pulseTime*2)) / pulseTime;
    const d = Math.sqrt((toY - fromY)*(toY - fromY) + (toX - fromX)*(toX - fromX));
    const step = pulseLength / d;
    const pulseLengthX = step*(toX - fromX);
    const pulseLengthY = step*(toY - fromY);
    ctx.beginPath();
    ctx.moveTo(
        fromX,
        fromY
    );

    const gradient = ctx.createLinearGradient(
        fromX - pulseLengthX*offset,
        fromY - pulseLengthY*offset,
        toX + pulseLengthX*(2-offset),
        toY + pulseLengthY*(2-offset)
    );
    for (let p = 0, i = 0; p <= 1; p += step*(i%2 ? 1+compression : 1 - compression)*10/12, i++) {
        gradient.addColorStop(p, i % 2 == 0 ? 'white' : 'black');
        // if (p + step*10/12*compression <= 1) {
        //     gradient.addColorStop(p + step*10/12*compression, i % 2 == 0 ? 'black' : 'white');
        // }
    }
    ctx.strokeStyle = gradient;
    ctx.lineTo(toX, toY);
    ctx.stroke();
    ctx.closePath();
}
