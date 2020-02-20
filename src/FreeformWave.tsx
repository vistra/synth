import React from 'react';
import regression from 'regression';


export class FreeformWave extends React.Component<any, any> {

    buffer = null;
    points = [[0, 100], [399, 100]];
    private canvas: any;

    constructor(props) {
        super(props);
        this.points = props.points || this.points;

        this.buffer = props.audioCtx.createBuffer(1, props.audioCtx.sampleRate / 441, props.audioCtx.sampleRate);
        const {audioCtx} = this.props;

        const audioSource = audioCtx.createBufferSource();
        audioSource.buffer = this.buffer;
        audioSource.loop = true;

        audioSource.connect(props.target);
        audioSource.start();

    }

    pack() {
        return {
            type: 'BiquadFilter',
            params: {
                points: this.points
            }
        }
    }

    render() {
        return <div>
            <canvas onClick={(e) => this.canvasClicked(e)} ref={e => this.canvas = e} height={200} width={400} style={{border: "1px solid"}}/>
        </div>
    }

    canvasClicked(e) {
        const rect = this.canvas.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        this.points.push([x,y]);
        this.points.sort((p1, p2) => p1[0] - p2[0]);
        this.update();
    }

    interpolatePoly() {
        const rPoints = this.points.map(p => [
            p[0] / 400,
            (100 - p[1]) / 100
        ]);
        const m = regression.polynomial(rPoints, {order:this.points.length});
        const dataArray = this.buffer.getChannelData(0);
        for (let i = 0; i< dataArray.length; i++){
            dataArray[i] = m.predict(i/dataArray.length)[1];
        }
    }

    interpolateSaw() {
        const rPoints = this.points.map(p => [
            p[0] / 400,
            (100 - p[1]) / 100
        ]);
        const dataArray = this.buffer.getChannelData(0);
        let dind = 0;

        for (let pind = 0; pind < rPoints.length - 1; pind++) {
            const cur = rPoints[pind];
            const next = rPoints[pind + 1];
            while (dind < dataArray.length && dind/dataArray.length < next[0]) {
                const alpha = (dind/dataArray.length - cur[0]) / (next[0] - cur[0]);
                dataArray[dind] = (1-alpha)*cur[1] + alpha*next[1];
                dind++
            }
        }
    }

    update() {
        if (this.canvas) {
            this.interpolateSaw();
            // this.interpolatePoly();
            const dataArray = this.buffer.getChannelData(0);

            let ctx = this.canvas.getContext("2d");
            ctx.clearRect(0, 0, 400, 200);
            ctx.beginPath();
            ctx.moveTo(0, 100);

            for (let i=0; i<400; i+=1) {
                ctx.lineTo(i, 100 - dataArray[Math.floor(i/400*dataArray.length)]*100);
            }
            ctx.stroke();
            ctx.closePath();
            ctx = this.canvas.getContext("2d");
            for (const point of this.points) {
                let [x, y] = point;
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, 2*Math.PI);
                ctx.fill();
                ctx.closePath();
            }
        }
        this.props.onChange(this.pack());
    }

}

