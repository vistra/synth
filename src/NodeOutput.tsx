import React from "react";
import {Connector} from "./connector";

interface Props {
    connector: Connector;
    name: string,
    nodeId: string}
export class NodeOutput extends React.Component<Props, any> {
    constructor(props: Props) {
        super(props);
        const connector = props.connector;
        connector.onChange(this.onChange);
    }

    onChange = () => {
        this.forceUpdate();
    };

    select = () => {
        const {connector} = this.props;
        connector.outputSelected(this.props.nodeId, this.props.name);
    };

    render() {
        return <span className={`out-${this.props.nodeId}-${this.props.name}`}>
            {this.props.name}&nbsp;
            <button onClick={this.select}>^</button>
        </span>
    }

    componentWillUnmount(): void {
        const connector = this.props.connector;
        connector.removeListener(this.onChange);
    }
}
