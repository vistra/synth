import React from 'react';
import {DestinationNode} from "./Nodes/DestinationNode";

interface Props {
    analyzer: AnalyserNode;
}
export class BackgroundEqualizer extends React.Component<Props, any> {

    waveCanvas = null;
    freqCanvas = null;
    private containerEl: HTMLDivElement;

    constructor(props) {
        super(props);
        this.start();
    }

    render() {
        return <div className={"background-equalize"} ref={e => this.containerEl = e}>
            <canvas ref={(e) => this.waveCanvas = e} height={200} width={400} style={{position: "absolute"}}/>
            <canvas ref={(e) => this.freqCanvas = e} height={200} width={400} style={{position: "absolute"}}/>
        </div>
    }

    updateWave() {
        if (this.waveCanvas && this.containerEl) {
            let {height, width} = this.containerEl.getBoundingClientRect();
            // width *= 0.9;
            // height *= 0.9;

            this.waveCanvas.height = height;
            this.waveCanvas.width = width;
            const ctx = this.waveCanvas.getContext("2d");

            const dataArray = new Float32Array(this.props.analyzer.fftSize);
            this.props.analyzer.getFloatTimeDomainData(dataArray);

            ctx.clearRect(0, 0, width / 2, height);
            ctx.beginPath();
            ctx.moveTo(0, height / 2);
            const pointFor = i => [Math.floor(i / dataArray.length * width), dataArray[i] * height / 4 + height / 2];
            for (let i = 0; i < dataArray.length; i++) {
                // ctx.fillRect(pointFor(i)[0], pointFor(i)[1], 3, 3)
                ctx.lineTo(pointFor(i)[0], pointFor(i)[1])
            }
            ctx.stroke();
        }
        requestAnimationFrame(() => this.updateWave());
    }

    updateFreq() {
        if (this.freqCanvas && this.containerEl) {
            let {height, width} = this.containerEl.getBoundingClientRect();
            // width *= 0.9;
            // height *= 0.9;
            this.freqCanvas.height = height;
            this.freqCanvas.width = width;

            const ctx = this.freqCanvas.getContext("2d");

            const dataArray = new Uint8Array(this.props.analyzer.fftSize);
            this.props.analyzer.getByteFrequencyData(dataArray);
            const n = this.props.analyzer.frequencyBinCount;
            ctx.clearRect(0, 0, width, height);
            for (let i=0; i<n; i++) {
                const x = i/n * width;
                const y = height - (dataArray[i]/256)*height;
                ctx.fillRect(x, y, width/n/2, (dataArray[i]/256)*height);
            }
        }
        requestAnimationFrame(() => this.updateFreq());
    }

    start() {
        this.updateWave();
        this.updateFreq();
    }
}

