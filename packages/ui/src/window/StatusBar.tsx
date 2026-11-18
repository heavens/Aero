import { ReactNode } from "react";
import { Theme } from "../Theme";
import { Octicon } from "../components/octicon/Octicon";
import { gear, moon, sun } from "../components/octicon/octicons";
import { WorkspaceStatus, dispatchThemeUpdate, onWorkspaceStatusUpdate } from "../events";
import { styled } from "styletron-react";
import { View } from "../View";
import { Query } from "../Query";
import { AeroContext } from "..";
import LoadingScreen from "../components/LoadingScreen";

const Root = styled("div", (props: { $theme?: Theme }) => ({
    display: "flex",
    alignItems: "center",
    bottom: "0",
    position: "absolute",
    width: "100%",
    height: "31px",
    padding: "0 16px",
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

const ActionButton = styled("button", (props: {$theme? : Theme}) => ({
    display: "flex",
    alignItems: "center",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "transparent",
    backgroundColor: `${props.$theme.colors.statusBar.bg}`,
    ":hover": {
        color: "white",
        borderColor: `${props.$theme.colors.statusBar.border}`,
        cursor: "pointer",
        backgroundColor: `${props.$theme.colors.statusBar.bg}`,
    }
}));

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

export default class StatusBar extends View<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            status: { title: "" },
        }
        this.subscribe(() => onWorkspaceStatusUpdate.subscribe(newStatus => this.setState({ status: newStatus })));
    }

    render() {
        const theme = Query.using(aero.context).select((state: AeroContext) => state.theme).unwrap;
        return <Root $theme={theme}>
            <QuickActions>
                <ActionButton $theme={theme} className="codicon codicon-layout-panel-justify"></ActionButton>
                <ActionButton $theme={theme} className="codicon codicon-layout-panel"></ActionButton>
                <ActionButton $theme={theme} className="codicon codicon-layout-sidebar-left"></ActionButton>
                <ActionButton $theme={theme} className="codicon codicon-layout-sidebar-right"></ActionButton>
                <ActionButton $theme={theme} onClick={this.props.openSettings}><Octicon styled={{ fill: theme.colors.pane.fg }} type={gear} /></ActionButton>
                <ActionButton $theme={theme} onClick={() => dispatchThemeUpdate()}>
                    <Octicon styled={{ fill: theme.colors.pane.fg }} type={theme.isDark ? sun : moon} />
                </ActionButton>
            </QuickActions>
            {this.renderMessage(theme)}
        </Root>
    }

    renderMessage(theme: Theme) {
        const { status } = this.state;
        const isBusy = status.title.length > 0;
        return <StatusContainer>
            {isBusy && <LoadingScreen style={{ fill: theme.colors.pane.fg, width: "16px", height: "16px" }} />}
            <StatusMessage>{status.title}</StatusMessage>
        </StatusContainer>
    }
}