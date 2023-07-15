import React from "react";

type Props = {
    name: string;
    resizable: boolean;
};

type State = {
    name: string;
    resizable: boolean;
};

export default class Dock extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            name: props.name,
            resizable: props.resizable
        };
    }
}