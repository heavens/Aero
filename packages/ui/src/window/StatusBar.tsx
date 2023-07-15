import React, { ReactNode } from "react";
import { Ctx, DarkTheme, LightTheme, Theme } from "../Theme";
import { Octicon } from "../components/octicon/Octicon";
import { gear, lightBulb, moon, sun } from "../components/octicon/octicons";
import Spinner from "../components/Spinner";
import { WorkspaceStatus, activeTheme, onWorkspaceStatusUpdate } from "../events";
import { styled } from "styletron-react";
import { Subscription } from "rxjs";

const Root = styled("div", (props: { $theme?: Theme }) => ({
    display: "flex",
    alignItems: "center",
    bottom: "0",
    position: "absolute",
    width: "100%",
    height: "31px",
    padding: "0 30px",
    background: props.$theme.colors.statusBar.bg,
    borderTop: `1px solid ${props.$theme.colors.statusBar.border}`,
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
        color: "white",
        borderColor: "#8a9199",
        cursor: "pointer",
        backgroundColor: "#8a919980"
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
    userSelect: "none",
    ":hover": {
        cursor: "pointer",
        textDecorationLine: "underline",
    }
});

type Props = {
    children?: ReactNode[];
    notificationsEnabled?: boolean;
    openSettings?: () => void;
}

type State = {
    status: WorkspaceStatus;
}

export default class StatusBar extends React.Component<Props, State> {

    private statusSubscription: Subscription;

    constructor(props: Props) {
        super(props);
        this.state = {
            status: { title: "" },
        }
    }

    componentDidMount(): void {
        this.statusSubscription = onWorkspaceStatusUpdate.subscribe(newStatus => this.setState({ status: newStatus }))
    }

    componentWillUnmount(): void {
        if (this.statusSubscription != null && !this.statusSubscription.closed) {
            this.statusSubscription.unsubscribe();
            this.statusSubscription = null;
        }
    }

    render() {
        let theme = this.context as Theme;
        return <Root $theme={theme}>
            <QuickActions>
                <ActionButton onClick={this.props.openSettings}><Octicon styled={{ fill: theme.colors.app.fg }} type={gear} /></ActionButton>
                <ActionButton onClick={() => {
                    activeTheme.next(theme.isDark ? LightTheme : DarkTheme);
                }}>
                    <Octicon styled={{ fill: theme.colors.app.fg }} type={theme.isDark ? sun : moon} />
                </ActionButton>
            </QuickActions>
            {this.renderMessage(theme)}
        </Root>
    }

    renderMessage(theme: Theme) {
        const { status } = this.state;
        const isBusy = status.title.length > 0;
        return <StatusContainer>
            {isBusy && <Spinner style={{ fill: theme.colors.app.fg }} width={16} height={16} />}
            <StatusMessage>{status.title}</StatusMessage>
        </StatusContainer>
    }
}

StatusBar.contextType = Ctx;