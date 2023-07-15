import React from "react";
import { Provider as StyletronProvider, styled } from "styletron-react";
import { KeyBinding } from "./keybinding";
import { Client as StyletronEngine } from "styletron-engine-atomic";
import TitleBar from "./window/TitleBar";
import StatusBar from "./window/StatusBar";
import Workspace from "./editor/Workspace";
import { Theme, LightTheme, ThemeProvider } from "./Theme";
import { Subject, Subscription, takeUntil } from "rxjs";
import { onThemeChange } from "./events";
import { Settings } from "./settings/Settings";

const keyBindings: KeyBinding[] = [
  { key: "cmd-t", context: "Workspace", action: "ToggleFileFinder" },
  { key: "ctrl-t", context: "Workspace", action: "ToggleFileFinder" },
  { key: "cmd-s", context: "Workspace", action: "SaveActiveBuffer" },
  { key: "up", context: "FileFinder", action: "SelectPrevious" },
  { key: "down", context: "FileFinder", action: "SelectNext" },
  { key: "enter", context: "FileFinder", action: "Confirm" },
  { key: "escape", context: "FileFinder", action: "Close" },
  { key: "alt-shift-up", context: "TextEditor", action: "AddSelectionAbove" },
  { key: "alt-shift-down", context: "TextEditor", action: "AddSelectionBelow" },
  { key: "shift-up", context: "TextEditor", action: "SelectUp" },
  { key: "shift-down", context: "TextEditor", action: "SelectDown" },
  { key: "shift-left", context: "TextEditor", action: "SelectLeft" },
  { key: "shift-right", context: "TextEditor", action: "SelectRight" },
  {
    key: "alt-shift-left",
    context: "TextEditor",
    action: "SelectToBeginningOfWord"
  },
  {
    key: "alt-shift-right",
    context: "TextEditor",
    action: "SelectToEndOfWord"
  },
  {
    key: "shift-cmd-left",
    context: "TextEditor",
    action: "SelectToBeginningOfLine"
  },
  {
    key: "shift-cmd-right",
    context: "TextEditor",
    action: "SelectToEndOfLine"
  },
  {
    key: "shift-cmd-up",
    context: "TextEditor",
    action: "SelectToTop"
  },
  {
    key: "shift-cmd-down",
    context: "TextEditor",
    action: "SelectToBottom"
  },
  { key: "up", context: "TextEditor", action: "MoveUp" },
  { key: "down", context: "TextEditor", action: "MoveDown" },
  { key: "left", context: "TextEditor", action: "MoveLeft" },
  { key: "right", context: "TextEditor", action: "MoveRight" },
  { key: "alt-left", context: "TextEditor", action: "MoveToBeginningOfWord" },
  { key: "alt-right", context: "TextEditor", action: "MoveToEndOfWord" },
  { key: "cmd-left", context: "TextEditor", action: "MoveToBeginningOfLine" },
  { key: "cmd-right", context: "TextEditor", action: "MoveToEndOfLine" },
  { key: "cmd-up", context: "TextEditor", action: "MoveToTop" },
  { key: "cmd-down", context: "TextEditor", action: "MoveToBottom" },
  { key: "backspace", context: "TextEditor", action: "Backspace" },
  { key: "delete", context: "TextEditor", action: "Delete" }
];

type Props = {
  browser: boolean;
};

type State = {
  theme: Theme
  settingsOpen: boolean;
}

const styleEngine = new StyletronEngine();

const AppRoot = styled("div", (props: { $theme?: Theme }) => ({
  fontFamily: props.$theme.fontFamily,
  fontSize: `${props.$theme.fontSize}px`,
  backgroundColor: props.$theme.colors.app.bg,
  color: props.$theme.colors.app.fg,
  height: "100%",
  width: "100%",
  display: "flex",
}));

export default class App extends React.Component<Props, State> {

  private subscription: Subscription;
  private destroyed: Subject<boolean>;

  constructor(props: Props) {
    super(props);
    this.destroyed = new Subject();
    this.state = {
      theme: LightTheme,
      settingsOpen: false,
    };
  }

  componentDidMount(): void {
    this.subscription = onThemeChange.pipe(takeUntil(this.destroyed)).subscribe(theme => {
      this.setState({ theme });
    });
  }

  componentWillUnmount(): void {
    if (this.destroyed != null && !this.destroyed.closed) {
      this.destroyed.next(true);
      this.subscription.unsubscribe();
      this.destroyed = null;
    }
  }

  render() {
    const { browser } = this.props;
    return <StyletronProvider value={styleEngine}>
      <ThemeProvider value={this.state.theme}>
        <AppRoot $theme={this.state.theme}>
          <TitleBar title={"Aero"} />
          <Workspace inBrowser={browser} />
          {this.state.settingsOpen && <Settings><>Hi</></Settings>}
          <StatusBar openSettings={() => this.setState({ settingsOpen: !this.state.settingsOpen})}/>
        </AppRoot>
      </ThemeProvider>
    </StyletronProvider>
  }
}