import React, { ReactNode } from "react";
import { styled } from "styletron-react";
import { DarkTheme, LightTheme } from "../theme";
import { Octicon } from "../components/octicon/Octicon";
import { gear, lightBulb, moon } from "../components/octicon/octicons";

const Root = styled("div", (props: { $isDark: boolean }) => ({
    display: "flex",
    alignItems: "center",
    bottom: "0",
    position: "absolute",
    width: "100%",
    height: "31px",
    padding: "0 30px",
    borderTop: `1px solid ${props.$isDark ? DarkTheme.borderColor : LightTheme.borderColor}`,
}));

const QuickActions = styled("div", {
    display: "flex",
    gap: "12px",
    flex: "1",
    alignItems: "center",
    justifyContent: "flex-start",
});

const ActionButton = styled("button", {
    display: "flex",
    alignItems: "center",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "transparent",
    backgroundColor: "transparent",
    ":hover": {
        borderColor: "#8a9199",
        cursor: "pointer",
        backgroundColor: "#8a91991a"
    }
});

const StatusContainer = styled("div", {
    display: "flex",
    flex: "1",
});

const StatusMessage = styled("div", {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    fontSize: "12px",
    fontWeight: "bold",
    userSelect: "none"
});

type Props = {
    children?: ReactNode[];
    darkMode: boolean;
    notificationsEnabled?: boolean;
}

type State = {
    busy: boolean;
    message: string;
}

export default class StatusBar extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            busy: false,
            message: "Initializing...",
        }
    }

    render() {
        const { busy, message } = this.state;
        return <Root $isDark={this.props.darkMode}>
            <QuickActions>
                <ActionButton><Octicon type={gear} /></ActionButton>
                <ActionButton><Octicon type={this.props.darkMode ? lightBulb : moon} /></ActionButton>
            </QuickActions>
            {this.renderMessage(message, busy)}
        </Root>
    }

    renderMessage(message: ReactNode, busy: boolean) {
        return <StatusContainer>

            <StatusMessage>{message}</StatusMessage>
        </StatusContainer>
    }
}