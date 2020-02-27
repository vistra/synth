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
import {Connector} from "./connector";
import {Mover} from "./Mover";

interface TProps {
    config: SynthNodeConfig,
    node: SynthAudioNode,
    onChange: (config: SynthNodeConfig<unknown>) => void
    connector: Connector
}
export class SynthNode extends React.Component<TProps> {

    onChange = (config: SynthNodeConfig<unknown>) => {
        this.props.onChange(config);
    };
    private e: HTMLDivElement;

    render() {
        const {config, node} = this.props;
        const {type} = config;
        return <div className="synth-node" ref={(e) => this.e = e} style={{position:'absolute', top: config.top, left: config.left}}>{
            type == 'BiquadFilter' ? <BiquadFilter
                    config={config as SynthNodeConfig<BiquadFilterSettings>}
                    node={node as BiquadFilterNode}
                    onChange={this.onChange}
                    connector={this.props.connector}
                />
                : type == 'SimpleOscillator' ? <SimpleOscillator
                    config={config as SynthNodeConfig<SimpleOscillatorSettings>}
                    node={node as SimpleOscillatorNode}
                    onChange={this.onChange}
                    connector={this.props.connector}
                />
                : type == 'Analyzer' ? <Analyzer
                        config={config as SynthNodeConfig<AnalyzerSettings>}
                        node={node as AnalyzerNode}
                        onChange={this.onChange}
                        connector={this.props.connector}
                    />
                    : type == 'Sequencer' ? <Sequencer
                            config={config as SynthNodeConfig<SequencerSettings>}
                            node={node as SequencerNode}
                            onChange={this.onChange}
                            connector={this.props.connector}
                        />
                        : type == 'Destination' ? <Destination
                                config={config as SynthNodeConfig<DestinationSettings>}
                                node={node as DestinationNode}
                                onChange={this.onChange}
                                connector={this.props.connector}
                            />
                            : <div>Unsupported node type :(</div>
        }
        <Mover
            onDrag={(dTop: number, dLeft: number) => {
                this.e.style.top = `${this.e.offsetTop + dTop}px`;
                this.e.style.left = `${this.e.offsetLeft + dLeft}px`;
            }}
            onDragDone={(dTop: number, dLeft: number) => {
                // Make sure not overlapping
                const nodes = document.getElementsByClassName("synth-node");
                const newTop = this.props.config.top + dTop;
                const newLeft = this.props.config.left + dLeft;
                const width = this.e.clientWidth;
                const height = this.e.clientHeight;

                const myPoints = [
                    [newTop, newLeft],
                    [newTop + height, newLeft],
                    [newTop, newLeft + width],
                    [newTop + height, newLeft + width],
                ];

                const overlaps = Array.from(nodes)
                    .filter(n => n != this.e)
                    .map((n: HTMLDivElement) => [
                        [n.offsetTop, n.offsetLeft],
                        [n.offsetTop + n.clientHeight, n.offsetLeft],
                        [n.offsetTop, n.offsetLeft + n.clientWidth],
                        [n.offsetTop + n.clientHeight, n.offsetLeft + n.clientWidth]
                    ])
                    // .reduce((l, x) => l.concat(x), [])
                    .filter(points =>
                        points.filter(p => p[0] >= myPoints[0][0] && p[0] <= myPoints[3][0] && p[1] >= myPoints[0][1] && p[1] <= myPoints[3][1]).length > 0 ||
                        myPoints.filter(p => p[0] >= points[0][0] && p[0] <= points[3][0] && p[1] >= points[0][1] && p[1] <= points[3][1]).length > 0
                    );

                if (overlaps.length == 0) {
                    this.props.onChange({
                        ...this.props.config,
                        top: newTop,
                        left: newLeft
                    });
                } else {
                    this.e.style.top = `${this.props.config.top}px`;
                    this.e.style.left = `${this.props.config.left}px`;
                }
            }
        }/>
        </div>;
    }

}
