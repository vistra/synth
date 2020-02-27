import React from 'react';
import * as _ from 'lodash';
import {SimpleOscillatorSettings, SynthNodeConfig} from "./grid-config";
import {SynthAudioNode} from "./Nodes/SynthAudioNode";
import {SimpleOscillatorNode} from "./Nodes/SimpleOscillatorNode";
import {Connector} from "./connector";
import {NodeInput} from "./NodeInput";
import {NodeOutput} from "./NodeOutput";

interface Props {
    config: SynthNodeConfig<SimpleOscillatorSettings>,
    node: SimpleOscillatorNode,
    onChange: (config: SynthNodeConfig<SimpleOscillatorSettings>) => void
    connector: Connector;
}
export class SimpleOscillator extends React.Component<Props, any> {

    render() {
        return <div style={{border: '1px solid', padding: 10, display:'inline-block'}}>
            <div className={"nodeOutputs"}>
                <NodeOutput connector={this.props.connector} name={"output"} nodeId={this.props.config.id}/>
            </div>
            <span>Oscillator {this.props.node.config.id} </span>
            <div><select value={this.props.node.config.settings.type} onChange={(e) => this.onTypeChange(e.target.value)}>
                <option value={'sine'}>sin</option>
                <option value={'square'}>square</option>
                <option value={'sawtooth'}>sawtooth</option>
            </select></div>
            <div>
                <input value={this.props.node.config.settings.freq} onChange={(e) => this.onFreqChange(e.target.value)} size={7}/>&nbsp;&nbsp;&nbsp;&nbsp;
                <input type="range" min="1" max="50000" value={this.props.node.config.settings.freq*10} onChange={(e) => this.onFreqChange(parseInt(e.target.value)/10)}/>
            </div>
            <div>Gain:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type="range" min="0" max="100" value={this.props.node.config.settings.gain} onChange={(e) => this.onGainChange(e.target.value)}/></div>
            <div>Delay:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type="range" min="0" max="100" value={this.props.node.config.settings.delay} onChange={(e) => this.onPhaseChange(e.target.value)}/></div>
            <span className={"nodeInputs"}>
                <NodeInput connector={this.props.connector} name={"detune"} nodeId={this.props.config.id}/>
                <NodeInput connector={this.props.connector} name={"gain"} nodeId={this.props.config.id}/>
            </span>
        </div>
    }

    onTypeChange(type) {
        this.props.node.setType(type);
        this.update();
    }

    onFreqChange(freq) {
        this.props.node.setFreq(freq || 440);
        this.update();
    }

    onGainChange(gain) {
        this.props.node.setGain(gain || 10);
        this.update();
    }

    onPhaseChange(delay) {
        this.props.node.setDelay(delay || 0);
        this.update();
    }

    update() {
        this.props.onChange(this.props.node.pack());
        this.forceUpdate();
    }

}

