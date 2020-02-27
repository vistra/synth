import React from "react";
import {Connector} from "./connector";

interface Props {
    connector: Connector;
    name: string,
    nodeId: string}
export class NodeInput extends React.Component<Props, any> {
    constructor(props: Props) {
        super(props);
        const connector = props.connector;
        connector.onChange(this.onChange);
    }

    onChange = () => {
        this.forceUpdate();
    };

    render() {
        const connector = this.props.connector;
        return <span className={`in-${this.props.nodeId}-${this.props.name}`}>
            {this.props.name}
            {connector.isInputConnected(this.props.nodeId, this.props.name) && <span><button onClick={() => connector.disconnectInput(this.props.nodeId, this.props.name)}>(x)</button></span>}
            {connector.isOutputSelected() && <span><button onClick={() => connector.connectTo(this.props.nodeId, this.props.name)}>+</button></span>}
        </span>
    }

    componentWillUnmount(): void {
        const connector = this.props.connector;
        connector.removeListener(this.onChange);
    }
}
