import React, { ReactNode } from "react";
import ReactDOM from "react-dom";
import { styled } from "styletron-react";
import Modal from "./modal";
import { createElement } from "react";
import FileFinder from "./file-search";
import BackgroundTips from "./components/BackgroundTips";

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
  position: "static"
});

const PaneInner = styled("div", {
  position: "absolute",
  left: 0,
  top: 0,
  bottom: 0,
  right: 0
});

type Props = {
  inBrowser: boolean;
  darkMode: boolean;
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
    const leftPanel: ReactNode = createElement(LeftPanel);
    const centerItem: ReactNode = createElement(BackgroundTips);
    const rightPanel: ReactNode = createElement(RightPanel);
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