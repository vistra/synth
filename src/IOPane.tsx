import React from 'react';

export class IOPane extends React.Component<{}, {}> {

    render() {
        return <div style={{
            width: "100%",
            textAlign: 'center'
        }}>
            {this.props.children}
        </div>
    }

}
