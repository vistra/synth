import React from 'react';
import * as _ from 'lodash';
import {BiquadFilterSettings, SynthNodeConfig} from "./grid-config";
import {BiquadFilterNode} from "./Nodes/BiquadFilterNode";
import {Connector} from "./connector";
import {NodeOutput} from "./NodeOutput";
import {NodeInput} from "./NodeInput";

interface TProps {
    config: SynthNodeConfig<BiquadFilterSettings>,
    node: BiquadFilterNode,
    onChange: (config: SynthNodeConfig<BiquadFilterSettings>) => void,
    connector: Connector;
}
export class BiquadFilter extends React.Component<TProps, {}> {

    constructor(props: TProps) {
        super(props);
    }

    render() {
        return <div style={{border: '1px solid', padding: 10, display:'inline-block'}}>
            <div className={"nodeOutputs"}>
                <NodeOutput connector={this.props.connector} name={"output"} nodeId={this.props.config.id}/>
            </div>
            <span>Filter {this.props.config.id} </span>
            <div><select value={this.props.node.config.settings.type} onChange={(e) => this.onTypeChange(e.target.value)}>
                <option value={'lowpass'}>lowpass</option>
                <option value={'highpass'}>highpass</option>
                <option value={'bandpass'}>bandpass</option>
                <option value={'lowshelf'}>lowshelf</option>
                <option value={'highshelf'}>highshelf</option>
                <option value={'peaking'}>peaking</option>
                <option value={'notch'}>notch</option>
                <option value={'allpass'}>allpass</option>
            </select></div>
            <div>
                <input value={this.props.node.config.settings.freq} onChange={(e) => this.onFreqChange(parseFloat(e.target.value))} size={7}/>&nbsp;&nbsp;&nbsp;&nbsp;
                <input type="range" min="1" max="200000" value={this.props.node.config.settings.freq*10} onChange={(e) => this.onFreqChange(parseFloat(e.target.value)/10)}/>
            </div>
            <div>Gain:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type="range" min="0" max="100" value={this.props.node.config.settings.gain} onChange={(e) => this.onGainChange(e.target.value)}/></div>
            <div>Q:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type="range" min="0" max="100" value={this.props.node.config.settings.Q} onChange={(e) => this.onQChange(e.target.value)}/></div>
            <div className={"nodeInputs"}>
                <NodeInput connector={this.props.connector} name={"input"} nodeId={this.props.config.id}/>
            </div>
        </div>
    }

    onTypeChange(typeTxt: string) {
        this.props.node.setType(typeTxt);
        this.update();
    }

    onFreqChange(freq: number) {
        this.props.node.setFreq(freq);
        this.update();
    }

    onGainChange(gainTxt: string) {
        this.props.node.setGain(parseFloat(gainTxt) || 10);
        this.update();
    }

    onQChange(Qtxt: string) {
        this.props.node.setQ(parseFloat(Qtxt) || 0);
        this.update();
    }

    update() {
        this.props.onChange(this.props.node.pack());
        this.forceUpdate();
    }
}

