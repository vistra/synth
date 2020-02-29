import {NodeConnection} from "./grid-config";

export class Connector {

    private listeners: Array<()=>void> = [];
    private selectedOutput: {nodeId: string, name: string};

    constructor(
        private connections: () => NodeConnection[],
        private clearConnection: (toNodeId: string, inputName: string) => void,
        private addConnection: (fromNodeId: string, outputName: string, toNodeId: string, inputName: string) => void,
    ) {}

    onChange(onChange: () => void) {
        this.listeners.push(onChange);
    }

    isInputConnected(nodeId: string, name: string) {
        return this.connections().find(c => c.toNodeId == nodeId && c.toInputName == name);
    }

    isOutputSelected() {
        return this.selectedOutput != null;
    }

    removeListener(onChange: () => void) {
        this.listeners = this.listeners.filter(x => x != onChange);
    }

    outputSelected(nodeId: string, name: string) {
        this.selectedOutput = {
            nodeId,
            name
        };
        this.changed();
    }

    private changed() {
        this.listeners.map(l => l());
    }

    disconnectInput(nodeId: string, name: string) {
        this.clearConnection(nodeId, name);
        this.changed();
    }

    connectTo(nodeId: string, name: string) {
        if (this.selectedOutput) {
            this.addConnection(
                this.selectedOutput.nodeId,
                this.selectedOutput.name,
                nodeId,
                name
            )
            this.selectedOutput = null;
        }
        this.changed();
    }
}
