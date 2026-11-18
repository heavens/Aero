import React from "react";
import { Provider as StyletronProvider, styled } from "styletron-react";
import { Client as StyletronEngine } from "styletron-engine-atomic";
import TitleBar from "./window/TitleBar";
import StatusBar from "./window/StatusBar";
import Workspace from "./editor/Workspace";
import { Theme, LightTheme, DarkTheme } from "./Theme";
import { Subject, Subscription } from "rxjs";
import { onThemeUpdate } from "./events";

export type Props = {
  browser: boolean;
};

type State = {
  theme: Theme;
  settingsOpen: boolean;
}

const styleEngine = new StyletronEngine();

const AppRoot = styled("div", (props: { $theme?: Theme }) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  width: "100%",
  height: "100%",
  fontFamily: props.$theme.fontFamily,
  fontSize: `${props.$theme.fontSize}px`,
  background: props.$theme.colors.sideBar.bg,
  foreground: props.$theme.colors.sideBar.fg,
  color: `${props.$theme.colors.sideBar.fg}`
}));

class AeroWindow extends React.Component<Props, State> {

  private destroyed: Subject<boolean>;
  private themeSubscription: Subscription;

  constructor(props: Props) {
    super(props);
    this.destroyed = new Subject();
    this.state = {
      theme: LightTheme,
      settingsOpen: false,
    };
    
    this.themeSubscription = onThemeUpdate().subscribe(_ => {
      const theme = this.state.theme.isDark ? LightTheme : DarkTheme;
      aero.context.theme = theme;
      this.setState({ theme });
    })
  }

  componentWillUnmount(): void {
    if (this.themeSubscription && !this.themeSubscription.closed) {
      this.themeSubscription.unsubscribe();
      this.themeSubscription = null;
    }
    
    if (this.destroyed != null && !this.destroyed.closed) {
      this.destroyed.next(true);
      this.destroyed = null;
    }
  }

  render() {
    const { browser } = this.props;
    return <StyletronProvider value={styleEngine}>
      <AppRoot $theme={this.state.theme}>
        <TitleBar title={"Aero"} />
        <Workspace inBrowser={browser} />
        <StatusBar openSettings={() => this.setState({ settingsOpen: !this.state.settingsOpen })} />
      </AppRoot>
    </StyletronProvider>
  }
}

export {
  AeroWindow,
};