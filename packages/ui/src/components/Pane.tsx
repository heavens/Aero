import React, { ReactNode } from "react";
import { View } from "../View";
import classNames from "classnames";

type PaneProps = {
    title: string;
    collapsed: boolean;
    children?: ReactNode;
}

class Wrapper extends View<PaneProps> {

    constructor(props: PaneProps) {
        super(props);
    }

    render() {
        return <div className="aero-view">
            <div className={(classNames("pane", {
                "collapsed": this.props.collapsed
            }))}>
            </div>
        </div>
    }
}

const Header = React.memo(function Header(props: { title: string; }) {
    return <div className="pane-header">
        <h4 className="title">{props.title}</h4>
    </div>
})


export default {
    Wrapper,
    Header,
}