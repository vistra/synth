import React from 'react';
import './App.css';
import 'typeface-roboto';
import {Oscillator} from "./Oscilator";
import {Analyzer} from "./Analyzer";
import {FreeformWave} from "./FreeformWave";
import {SimpleOscillator} from "./SimpleOscillator";
import {BiquadFilter} from "./BiquadFilter";
import {Sequencer} from "./Sequencer";
import {SynthGrid} from "./SynthGrid";
import {NodeConnection, NodeType, SynthNodeConfig} from "./grid-config";
import {DestinationNode} from "./Nodes/DestinationNode";

class App extends React.Component {
    audioContext = null;
    analyzer = null;
    filterNode = null;
    nOsc = 1;

    nodes: any = {};

    packed: any = {};

    constructor(props) {
        super(props);

        const audioContext = new AudioContext();
        // analyzer.fftSize = 256;
        this.audioContext = audioContext;
        // this.analyzer = analyzer;
        try {
            this.packed = JSON.parse(window.decodeURIComponent(window.location.search.slice(1)) || '{}');
        } catch {
            console.error('Unable to parse query string');
            this.packed = {};
        }

    }

    updateQuerystring() {
        window.history.pushState({}, "Synth", "?" + JSON.stringify(this.packed))
    }

    start() {
        this.audioContext.resume();
    }

    addOscillator() {
        this.nOsc++;
        this.forceUpdate();
    }

    // renderPacked() {
    //     return <div>
    //         <Analyzer audioCtx={this.audioContext} analyzer={(a) => {this.nodes.analyzer = a; this.forceUpdate()}}/>
    //         { Object.keys(this.packed).map(id => this.nodes[this.packed[id].target] &&
    //             (this.packed[id].type == 'BiquadFilter' ? <BiquadFilter
    //                 key={id}
    //                 onChange={(p) => {this.packed[id] = {...p, target: this.packed[id].target}; this.updateQuerystring();}}
    //                 audioCtx={this.audioContext}
    //                 target={this.nodes.analyzer}
    //                 filterNode={(f) => {this.nodes[id] = f; this.forceUpdate()}}
    //                 {...(this.packed[id] || {}).params}
    //             />
    //             : this.packed[id].type == 'SimpleOscillator' ? <SimpleOscillator
    //                     key={id}
    //                     id={id}
    //                     onChange={(p) => {this.packed[id] = {...p, target: this.packed[id].target}; this.updateQuerystring();}}
    //                     audioCtx={this.audioContext}
    //                     target={this.nodes[this.packed[id].target]}
    //                     oscillator={(o, g) => {this.nodes[id] = {o: o, g:g}; this.forceUpdate()}}
    //                     {...(this.packed[id] || {}).params}
    //                 />
    //             : this.packed[id].type == 'Sequencer' ? <Sequencer
    //                     key={id}
    //                     onChange={(p) => {this.packed[id] = {...p, target: this.packed[id].target}; this.updateQuerystring();}}
    //                     audioCtx={this.audioContext}
    //                     targetDetune={this.nodes[this.packed[id].target].o.detune}
    //                     targetGain={this.nodes[this.packed[id].target].g.gain}
    //                     sequencer={(s) => {this.nodes[id] = s; this.forceUpdate()}}
    //                     {...(this.packed[id] || {}).params}
    //             /> : null) )}
    //     </div>
    // }
    //
    // render() {
    //     // if (Object.keys(this.packed).length) {
    //     //     return this.renderPacked();
    //     // }
    //     return <div className="App">
    //         <button onClick={() => this.start()}>Start</button>
    //         <Analyzer audioCtx={this.audioContext} analyzer={(a) => {this.nodes.analyzer = a; this.forceUpdate()}}/>
    //         {/*<div>*/}
    //         {/*{ this.nodes.analyzer && <BiquadFilter*/}
    //         {/*    onChange={(p) => {this.packed['bf0'] = {...p, target: 'analyzer'}; this.updateQuerystring();}}*/}
    //         {/*    audioCtx={this.audioContext}*/}
    //         {/*    target={this.nodes.analyzer}*/}
    //         {/*    filterNode={(f) => {this.nodes['bf0'] = f; this.forceUpdate()}}*/}
    //         {/*    {...(this.packed['bf0'] || {}).params}*/}
    //         {/*/>*/}
    //         {/*}*/}
    //         {/*</div>*/}
    //         <div>
    //         { this.nodes['analyzer']  &&
    //             Array.from(Array(this.nOsc)).map((x, i) => (
    //                 <SimpleOscillator
    //                     key={i}
    //                     id={i}
    //                     onChange={(p) => {this.packed['osc' + i] = {...p, target: 'bf0'}; this.updateQuerystring();}}
    //                     audioCtx={this.audioContext}
    //                     target={this.nodes['analyzer']}
    //                     oscillator={(o, g) => {this.nodes['osc' + i] = {o: o, g:g}; this.forceUpdate()}}
    //                     {...(this.packed['osc' + i] || {}).params}
    //                 />
    //             ))
    //         }
    //         </div>
    //         <div><button onClick={() => this.addOscillator()}>add</button></div>
    //         <div>{this.nodes['osc0'] && <Sequencer
    //             onChange={(p) => {this.packed['sequencer0'] = {...p, target:'osc0'}; this.updateQuerystring();}}
    //             audioCtx={this.audioContext}
    //             targetDetune={this.nodes['osc0'].o.detune}
    //             targetGain={this.nodes['osc0'].g.gain}
    //             sequencer={(s) => {this.nodes['sequencer0'] = s; this.forceUpdate()}}
    //             {...(this.packed['sequencer0'] || {}).params}
    //         />}
    //         </div>
    //         {/*<SimpleOscillator audioCtx={this.audioContext} target={this.analyzer}/>*/}
    //         {/*<Oscillator audioCtx={audioContext} oscillator={osc}/>*/}
    //         {/*<FreeformWave audioCtx={audioContext} target={analyzer}/>*/}
    //     </div>
    // }
    render() {
        return <div style={{width:'100%', height:'100%'}}>
            <SynthGrid gridConfig={{
                "width": 1800,
                "height": 1400,
                "nodes": [
                    {
                        "id": "destination_0",
                        "type": "Destination",
                        "top": 28,
                        "left": 6,
                        "inputs": [
                            "input"
                        ],
                        "outputs": [],
                        "settings": {}
                    },
                    {
                        "id": "SimpleOscillator_1",
                        "type": "SimpleOscillator",
                        "top": 242,
                        "left": 830,
                        "inputs": [],
                        "outputs": [
                            "output"
                        ],
                        "settings": {
                            "type": "sine",
                            "freq": 200,
                            "gain": 100,
                            "delay": 0
                        }
                    },
                    {
                        "id": "BiquadFilter_2",
                        "type": "BiquadFilter",
                        "top": 261,
                        "left": 547,
                        "inputs": [
                            "input"
                        ],
                        "outputs": [
                            "output"
                        ],
                        "settings": {
                            "type": "lowpass",
                            "Q": 0,
                            "freq": 440,
                            "gain": 10
                        }
                    },
                    {
                        "id": "Analyzer_3",
                        "type": "Analyzer",
                        "top": 26,
                        "left": 418,
                        "inputs": [
                            "input"
                        ],
                        "outputs": [],
                        "settings": {}
                    },
                    {
                        "id": "Sequencer_4",
                        "type": "Sequencer",
                        "top": 457,
                        "left": 42,
                        "inputs": [],
                        "outputs": [
                            "gain",
                            "detune"
                        ],
                        "settings": {
                            "slots": [
                                {
                                    "value": 5,
                                    "count": 1,
                                    "gainPreset": "quarter",
                                    "transition": "linear",
                                    "offset": 0
                                },
                                {
                                    "value": 3,
                                    "count": 1,
                                    "gainPreset": "dots",
                                    "transition": "linear",
                                    "offset": 0
                                },
                                {
                                    "value": 5,
                                    "count": 1,
                                    "gainPreset": "quarter",
                                    "transition": "linear",
                                    "offset": 0
                                },
                                {
                                    "value": 0,
                                    "count": 1,
                                    "gainPreset": "quarter",
                                    "transition": "linear",
                                    "offset": 0
                                },
                                {
                                    "value": -4,
                                    "count": 1,
                                    "gainPreset": "quarter",
                                    "transition": "linear",
                                    "offset": 0
                                },
                                {
                                    "value": 0,
                                    "count": 1,
                                    "gainPreset": "quarter",
                                    "transition": "linear",
                                    "offset": 0
                                },
                                {
                                    "value": -7,
                                    "count": 1,
                                    "gainPreset": "full",
                                    "transition": "linear",
                                    "offset": 0
                                },
                                {
                                    "value": -7,
                                    "count": 1,
                                    "gainPreset": "full",
                                    "transition": "linear",
                                    "offset": 0
                                }
                            ],
                            "tickEvery": 0.2
                        }
                    }
                ],
                "connections": [
                    {
                        "fromNodeId": "Sequencer_4",
                        "fromOutputName": "gain",
                        "toNodeId": "SimpleOscillator_1",
                        "toInputName": "gain"
                    },
                    {
                        "fromNodeId": "Sequencer_4",
                        "fromOutputName": "detune",
                        "toNodeId": "SimpleOscillator_1",
                        "toInputName": "detune"
                    },
                    {
                        "fromNodeId": "SimpleOscillator_1",
                        "fromOutputName": "output",
                        "toNodeId": "BiquadFilter_2",
                        "toInputName": "input"
                    },
                    {
                        "fromNodeId": "BiquadFilter_2",
                        "fromOutputName": "output",
                        "toNodeId": "Analyzer_3",
                        "toInputName": "input"
                    },
                    {
                        "fromNodeId": "BiquadFilter_2",
                        "fromOutputName": "output",
                        "toNodeId": "destination_0",
                        "toInputName": "input"
                    }
                ]
            }
            } onChange={(p)=>console.log(JSON.stringify(p, null, 2))}/>
        </div>
    }
}

export default App;
