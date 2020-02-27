import React from 'react';

import {SequencerNode} from "./Nodes/SequencerNode";
import {SequencerSettings, SequencerSlot, SynthNodeConfig} from "./grid-config";
import {Connector} from "./connector";
import {NodeInput} from "./NodeInput";
import {NodeOutput} from "./NodeOutput";

const GAIN_PRESETS = {
    full: [],
    half: [0.5],
    "3/4": [0.75],
    quarter: [0.25],
    dots: [1/6, 2/6, 3/6, 4/6, 5/6],
    silent: [0]
};

const TRANSITIONS = [
    'linear',
    'teasy',
    'cut'
];

function setGainPresetLoudFrom(gp, t) {
    const mgp = [];
    for (const g of gp) {
        if (g < t) {
            mgp.push(g);
        } else {
            break;
        }
    }

    if (mgp.length % 2 == 1) {
        mgp.push(t);
    }
    return mgp;
}

function VerticalRange(props) {
    const {min, max, value, onChange} = props;

    return <div style={{position: 'relative'}}>
        <input
            type="range"
            style={{WebkitAppearance: "slider-vertical", width: 20}}
            min={min}
            max={max}
            value={value}
            onChange={onChange}
        />
        <span style={{position: 'absolute', top: '45%', display: 'inline-block'}}>{value}</span>
    </div>

}

interface Props {
    config: SynthNodeConfig<SequencerSettings>,
    node: SequencerNode,
    onChange: (config: SynthNodeConfig<SequencerSettings>) => void
    connector: Connector;
}
export class Sequencer extends React.Component<Props, any> {

    constructor(props) {
        super(props);

        props.node.onTick(() => this.forceUpdate());
    }

    slotEls = {};

    get slots(): SequencerSlot[] {
        return this.props.node.config.settings.slots;
    }

    get tickEvery(): number {
        return this.props.node.config.settings.tickEvery;
    }

    renderSlot(slot: SequencerSlot, i: number) {
        return <div style={{display: 'inline-block'}} ref={(e) => this.slotEls[i] = e} key={i} >
            <VerticalRange min={-12} max={12}
                      value={slot.value}
                       onChange={(e) => { this.props.node.editSlot(i, {...slot, value: parseFloat(e.target.value) || 0}); this.props.onChange(this.props.node.pack()); this.forceUpdate();}}
            />
            <button onClick={() => {this.props.node.deleteSlot(i); this.forceUpdate();}}>X</button>
            <br/>
            <VerticalRange min={1} max={8}
                      value={slot.count}
                       onChange={(e) => { this.props.node.editSlot(i, {...slot, count: parseFloat(e.target.value)}); this.props.onChange(this.props.node.pack()); this.forceUpdate();}}/>
            <br/>
            <select value={slot.gainPreset} onChange={(e) => { this.props.node.editSlot(i, {...slot, gainPreset: e.target.value}); this.props.onChange(this.props.node.pack()); this.forceUpdate();}}>
                {Object.keys(GAIN_PRESETS).map(g => <option value={g}>{g}</option>)}
            </select>
            <br/>
            <select style={{width: '100%'}} value={slot.transition} onChange={(e) => { this.props.node.editSlot(i, {...slot, transition: e.target.value}); this.props.onChange(this.props.node.pack()); this.forceUpdate();}}>
                {TRANSITIONS.map(t => <option value={t}>{t}</option>)}
            </select>
            <input value={slot.offset} onChange={(e) => { this.props.node.editSlot(i, {...slot, offset: parseFloat(e.target.value) || 0}); this.props.onChange(this.props.node.pack()); this.forceUpdate();}}/>
        </div>

    }

    render() {
        const add = (at) => <div style={{display: 'inline-block', position: "absolute", top: 134, height: '100%', textAlign: 'center'}}><button style={{right:-11, top:2, position: 'absolute'}} onClick={() => {this.props.node.addSlot(at); this.forceUpdate()}}>+</button></div>;
        return <div style={{border: '1px solid', display: 'inline-block', position: 'relative', padding: '0 20px'}}>
            <div className={"nodeOutput"}>
                <NodeOutput connector={this.props.connector} name={"detune"} nodeId={this.props.config.id}/>
                <NodeOutput connector={this.props.connector} name={"gain"} nodeId={this.props.config.id}/>
            </div>
            <div>
                {add(0)}
                {[].concat.apply([], this.slots.map((slot, i) => [this.renderSlot(slot, i), add(i + 1)]))}
            </div>
            <input value={this.tickEvery} onChange={(e) => { this.props.node.setTickEvery(parseFloat(e.target.value) || 0.5);}}/>
        </div>
    }

    start() {
        const { node } = this.props;
        node.onTick(() => {
            Object.keys(this.slotEls).forEach(i => this.slotEls[i].style.backgroundColor = 'white');
            this.slotEls[node.tick % this.slots.length].style.backgroundColor = 'black';
        });
    }

}
