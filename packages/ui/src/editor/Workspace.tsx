import React from "react";
import ReactDOM from "react-dom";
import Modal from "../Modal";
import SearchMenu from "../components/CommandMenu";
import BackgroundTips from "../components/BackgroundTips";
import { styled } from "styletron-react";
import { Ctx, Theme } from "../Theme";

const Root = styled("div", {
  display: "flex",
  position: "relative",
  width: "100%",
  height: "100%",
  padding: 0,
  marginTop: "31px",
});

const LeftPanel = styled("div", {
  width: "300px",
  height: "100%",
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
  modal?: string;
  leftPanel?: string;
  centerPanel?: string;
};

type State = {
  modalVisible: boolean;
};

export default class Workspace extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      modalVisible: false,
    };
  }

  componentDidMount() {
    window.addEventListener("keydown", (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key == "k") {
        event.stopPropagation();
        this.setState({ modalVisible: !this.state.modalVisible });
      }
    });

    const el = ReactDOM.findDOMNode(this);
    if (el instanceof HTMLElement) {
      el.focus();
    }
  }

  componentWillUnmount(): void {
    document.addEventListener("keydown", (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key == "k") {
        this.setState({ modalVisible: !this.state.modalVisible });
      }
    });
  }

  render() {
    let theme = this.context as Theme;
    return <Root>
      <LeftPanel />
      <Pane>
        <PaneInner>
          <BackgroundTips theme={theme} />
        </PaneInner>
      </Pane>
      {
        this.state.modalVisible
        &&
        <Modal visible={this.state.modalVisible}>
          <SearchMenu />
        </Modal>
      }
      <RightPanel />
    </Root>
  }
}

Workspace.contextType = Ctx;