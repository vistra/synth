import React from "react";
import {Connector} from "./connector";

interface Props {
    connector: Connector;
    name: string,
    nodeId: string
}
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
        return <span style={{
            display: 'inline-block',
            textAlign: 'center'
        }}>
            {this.props.name}
            <br/>
            <i
                onClick={() => {
                    if (connector.isInputConnected(this.props.nodeId, this.props.name)) {
                        connector.disconnectInput(this.props.nodeId, this.props.name)
                    } else if (connector.isOutputSelected()) {
                        connector.connectTo(this.props.nodeId, this.props.name)
                    }
                }}
                className={`in-${this.props.nodeId}-${this.props.name} material-icons-outlined`}>
                fiber_manual_record
            </i>
        </span>
    }

    componentWillUnmount(): void {
        const connector = this.props.connector;
        connector.removeListener(this.onChange);
    }
}
