import React from 'react';
import {AnalyzerSettings, SimpleOscillatorSettings, SynthNodeConfig} from "./grid-config";
import {AnalyzerNode} from "./Nodes/AnalyzerNode";
import {Connector} from "./connector";
import {NodeOutput} from "./NodeOutput";
import {NodeInput} from "./NodeInput";

interface Props {
    config: SynthNodeConfig<AnalyzerSettings>,
    node: AnalyzerNode,
    onChange: (config: SynthNodeConfig<SimpleOscillatorSettings>) => void
    connector: Connector;
}
export class Analyzer extends React.Component<Props, any> {

    waveCanvas = null;
    freqCanvas = null;

    constructor(props) {
        super(props);
        this.start();
    }

    render() {
        return <div>
            <canvas ref={(e) => this.waveCanvas = e} height={200} width={400} style={{border: "1px solid"}}/>
            <canvas ref={(e) => this.freqCanvas = e} height={200} width={400} style={{border: "1px solid"}}/>
            <div className={"nodeInputs"}>
                <NodeInput connector={this.props.connector} name={"input"} nodeId={this.props.config.id}/>
            </div>
        </div>
    }

    updateWave() {
        if (this.waveCanvas) {
            const ctx = this.waveCanvas.getContext("2d");
            const {analyzer} = this.props.node;

            const dataArray = new Float32Array(analyzer.fftSize);
            analyzer.getFloatTimeDomainData(dataArray);

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
            const {analyzer} = this.props.node;

            // const dataArray = new Float32Array(analyzer.fftSize);
            // analyzer.getFloatFrequencyData(dataArray);

            const dataArray = new Uint8Array(analyzer.fftSize);
            analyzer.getByteFrequencyData(dataArray);
            const n = analyzer.frequencyBinCount;
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

