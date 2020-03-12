import React from 'react';
import {DestinationNode} from "./Nodes/DestinationNode";

interface Props {
    analyzer: AnalyserNode;
}
export class BackgroundEqualizer extends React.Component<Props, any> {

    waveCanvas = null;
    freqCanvas = null;

    constructor(props) {
        super(props);
        this.start();
    }

    render() {
        return <div className={"background-equalize"}>
            <canvas ref={(e) => this.waveCanvas = e} height={200} width={400} style={{border: "1px solid"}}/>
            <canvas ref={(e) => this.freqCanvas = e} height={200} width={400} style={{border: "1px solid"}}/>
        </div>
    }

    updateWave() {
        if (this.waveCanvas) {
            const ctx = this.waveCanvas.getContext("2d");

            const dataArray = new Float32Array(this.props.analyzer.fftSize);
            this.props.analyzer.getFloatTimeDomainData(dataArray);

            ctx.clearRect(0, 0, 400, 200);
            ctx.beginPath();
            ctx.moveTo(0, 100);
            const pointFor = i => [Math.floor(i / dataArray.length * 400), dataArray[i] * 50 + 100];
            for (let i = 0; i < dataArray.length; i++) {
                // ctx.fillRect(pointFor(i)[0], pointFor(i)[1], 3, 3)
                ctx.lineTo(pointFor(i)[0], pointFor(i)[1])
            }
            ctx.stroke();
        }
        requestAnimationFrame(() => this.updateWave());
    }

    updateFreq() {
        if (this.freqCanvas) {
            const ctx = this.freqCanvas.getContext("2d");

            const dataArray = new Uint8Array(this.props.analyzer.fftSize);
            this.props.analyzer.getByteFrequencyData(dataArray);
            const n = this.props.analyzer.frequencyBinCount;
            ctx.clearRect(0, 0, 400, 200);
            for (let i=0; i<n; i++) {
                const x = i/n * 400;
                // const y = 200 - dataArray[i]*200;
                const y = 200 - dataArray[i];
                ctx.fillRect(x, y, 400/n/2, dataArray[i]);
            }
        }
        requestAnimationFrame(() => this.updateFreq());
    }

    start() {
        this.updateWave();
        this.updateFreq();
    }
}

