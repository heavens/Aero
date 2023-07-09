import React, { ReactNode, createElement } from "react";
import { Provider as StyletronProvider } from "styletron-react";
import { KeyBinding } from "./action";
import { Workspace } from "./workspace";
import { Client } from "styletron-engine-atomic";
import ThemeProvider, { DarkTheme, LightTheme } from "./theme";

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
  inBrowser: boolean;
};

const client = new Client();

export default class App extends React.Component<Props> {

  constructor(props: Props) {
    super(props);
  }

  render(): ReactNode {
    return createElement(
      StyletronProvider,
      { value: client },
      createElement(
        ThemeProvider,
        { isDark: false },
        createElement(Workspace, { inBrowser: false })
      )
    );
  }
}