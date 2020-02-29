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
        return <span  style={{
            display: 'inline-block',
            lineHeight: 0.4,
            textAlign: 'center'
        }}>
            <i
                onClick={this.select}
                className={`out-${this.props.nodeId}-${this.props.name} material-icons-outlined`}>
                fiber_manual_record
            </i>
            <br/>
            <span style={{
                fontSize: '0.8em'
            }}>{this.props.name}</span>
        </span>
    }

    componentWillUnmount(): void {
        const connector = this.props.connector;
        connector.removeListener(this.onChange);
    }
}
