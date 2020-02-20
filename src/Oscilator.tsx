import React from 'react';
import * as _ from 'lodash';

const N_FREQ = 8;

export class Oscillator extends React.Component<any, any> {

    freqs = [];

    constructor(props) {
        super(props);

        _.range(N_FREQ).map(freqInd => (
            this.freqs.push({
                amp: freqInd == 0 ? 100 : 0,
                phase: 0
            })
        ))

        this.freqs = props.freqs || this.freqs;
    }

    pack() {
        return {
            type: 'Oscillator',
            params: {
                freqs: this.freqs,
            }
        }
    }

    render() {
        return <div>
            {
                _.range(N_FREQ).map(freqInd => (
                    <span key={freqInd}>
                        <input style={{WebkitAppearance: "slider-vertical", width: 20}} type="range" min={0} max={100} value={this.freqs[freqInd].amp} onChange={(e) => this.onAmpChange(freqInd, e.target.value)}/>
                        {/*<input type="range" min={0} max={100} value={this.freqs[freqInd].phase} onChange={(e) => this.onPhaseChange(freqInd, e.target.value)}/>*/}
                    </span>
                ))
            }
        </div>
    }

    onAmpChange(ind, amp) {
        this.freqs[ind].amp = parseFloat(amp);
        this.update();
    }

    onPhaseChange(ind, amp) {
        this.freqs[ind].phase = parseFloat(amp);
        this.update();
    }

    update() {
        const {audioCtx, oscillator} = this.props;
        const phaseToRadians = (ph) => ph/100 * 2 * Math.PI;
        const real = [0].concat(this.freqs.map(f => Math.cos(phaseToRadians(f.phase)) * f.amp));
        const imag = [0].concat(this.freqs.map(f => Math.sin(phaseToRadians(f.phase)) * f.amp));
        console.log(real);
        console.log(imag);
        oscillator.setPeriodicWave(audioCtx.createPeriodicWave(real, imag));
        this.props.onChange(this.pack());
        this.forceUpdate();
    }

}

