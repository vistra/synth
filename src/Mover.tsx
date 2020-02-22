import React from 'react';

interface Props {
    onDrag: (dTop: number, dLeft: number) => void
    onDragDone: (dTop: number, dLeft: number) => void
}
export class Mover extends React.Component<Props, {}> {
    private selected: boolean;
    private originTop: number;
    private originLeft: number;
    private curTop: number;
    private curLeft: number;

    render() {
        return <div onMouseDown={this.onMouseDown}>Move</div>
    }

    private destroyMover() {
        window.removeEventListener("mousemove", this.onMouseMove);
        window.removeEventListener("mouseup", this.onMouseUp);
    }

    onMouseDown = (event) => {
        this.destroyMover();
        window.addEventListener("mousemove", this.onMouseMove);
        window.addEventListener("mouseup", this.onMouseUp);
        this.selected = true;
        this.originTop = event.clientY;
        this.originLeft = event.clientX;
        this.curTop = this.originTop;
        this.curLeft = this.originLeft;
    };

    private move(dTop: number, dLeft: number) {
        this.curTop += dTop;
        this.curLeft += dLeft;
        this.props.onDrag(dTop, dLeft);
    }

    onMouseMove = (event) => {
        if (this.selected) {
            const dTop = event.clientY - this.curTop;
            const dLeft = event.clientX - this.curLeft;
            // if (Math.abs(dTop) + Math.abs(dLeft) > 5) {
                this.move(dTop, dLeft);
            // }
        }
    };

    onMouseUp = () => {
        if (this.selected) {
            this.props.onDragDone(this.curTop - this.originTop, this.curLeft - this.originLeft);
            this.selected = false;
            this.destroyMover();        }
    };
}
