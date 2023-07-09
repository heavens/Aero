import React, { ReactNode } from "react";
import ReactDOM from "react-dom";
import { styled, withStyle } from "styletron-react";
import Modal from "./modal";
import { createElement } from "react";
import FileFinder from "./file-search";

const componentPadding = 10;
const componentBorderRadius = 2;

const Root = styled("div", {
  position: "relative",
  width: "100%",
  height: "100%",
  padding: 0,
  margin: 0,
  display: "flex"
});

const LeftPanel = styled("div", {
  width: "300px",
  height: "100%"
});

const RightPanel = styled("div", {
  width: "300px",
  height: "100%"
});

const Pane = styled("div", {
  flex: 1,
  position: "relative"
});

const PaneInner = styled("div", {
  position: "absolute",
  left: 0,
  top: 0,
  bottom: 0,
  right: 0
});

const BackgroundTip = styled("div", {
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
});

const BackgroundMessage = withStyle(BackgroundTip, {
  userSelect: "none",
  padding: `0 ${componentPadding * 3}px`,
  transition: "opacity .3s ease-in-out",
  ".keystroke": {
    border: "2px solid",
    padding: `0 ${componentPadding / 2}px`,
    borderRadius: `${componentBorderRadius * 3}`,
    fontFamily: ["Iosevka", "sans-serif"]
  }
});

type Props = {
  inBrowser: boolean;
  modal?: string;
  leftPanel?: string;
  centerPanel?: string;
};

export class Workspace extends React.Component<Props> {
  
  constructor(props: Props) {
    super(props);
  }

  render() {
    const modal: ReactNode = createElement(Modal, { visible: false }, createElement(FileFinder));
    const leftPanel: ReactNode = createElement(LeftPanel, null);
    const centerItem: ReactNode = createElement(BackgroundMessage, { className: "keystroke" }, "Press Ctrl-T to browse files");
    const rightPanel: ReactNode = createElement(RightPanel, null);
    return createElement(
      Root,
      {},
      leftPanel,
      createElement(Pane, null, createElement(PaneInner, {}, centerItem)),
      modal,
      rightPanel
    );
  }

  componentDidMount() {
    const el = ReactDOM.findDOMNode(this);
    if (el instanceof HTMLElement) {
      el.focus();
    }
  }
}