import React, { ReactNode } from "react";
import Modal from "../Modal";
import SearchMenu from "../components/CommandMenu";
import { styled } from "styletron-react";
import { Theme } from "../Theme";
import Dock, { DockPosition } from "../components/Dock";
import { TextEditor } from "./TextEditor";
import { Query } from "../Query";

const Root = styled("div", {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  height: "100%",
  padding: "8px",
});

const WorkspaceToolBar = styled("div", (props: { $theme: Theme }) => ({
  display: "flex",
  alignItems: "center",
  flex: "1",
  maxHeight: "28px",
  padding: "4px",
}));

const WorkspaceContainer = styled("div", {
  display: "flex",
  position: "relative",
});

type Props = {
  inBrowser: boolean;
  modal?: string;
  leftPanel?: string;
  centerPanel?: string;
};

type State = {
  dockedLeft: ReactNode | null,
  dockedRight: ReactNode | null,
  dockedTop: ReactNode | null,
  dockedBottom: ReactNode | null,
  modalVisible: boolean;
};

export default class Workspace extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      modalVisible: false,
      dockedLeft: null,
      dockedRight: null,
      dockedTop: null,
      dockedBottom: null
    };
  }

  componentDidMount() {
    document.addEventListener("keydown", (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key == "k") {
        event.stopPropagation();
        this.setState({ modalVisible: !this.state.modalVisible });
      }
    });
  }

  componentWillUnmount(): void {
    document.addEventListener("keydown", (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key == "k") {
        this.setState({ modalVisible: !this.state.modalVisible });
      }
    });
  }

  render() {
    const theme = Query.using(aero.context).select(state => state.theme).unwrap;
    return <Root>
      <WorkspaceToolBar $theme={theme}>
      
      </WorkspaceToolBar>
      <WorkspaceContainer>
        <Dock id="left-dock" position="left" collapsed={true} resizable={true}></Dock>
        <TextEditor
          fontSize={theme.fontSize}
          rowCount={1}
          paddingLeft={5}
          firstVisibleRow={0}
          horizontalMargin={0}
          lineHeight={theme.lineHeight}
        />
        {
          this.state.modalVisible
          &&
          <Modal visible={this.state.modalVisible}>
            <SearchMenu />
          </Modal>
        }
        <Dock id="right-dock" position="right" collapsed={false} resizable={true}></Dock>
      </WorkspaceContainer>
    </Root>
  }

  public dockComponent<C extends ReactNode>(component: C, position: DockPosition): boolean {
    const { dockedTop, dockedBottom, dockedLeft, dockedRight } = this.state;
    switch (position) {
      case "top":
        if (dockedTop != null) {
          return false;
        }

        this.setState({ dockedTop: component });
        return true;
      case "bottom":
        if (dockedBottom != null) {
          return false;
        }

        this.setState({ dockedBottom: component });
        return true;
      case "left":
        if (dockedLeft != null) {
          return false;
        }

        this.setState({ dockedLeft: component });
        return true;
      case "right":
        if (dockedRight != null) {
          return false;
        }

        this.setState({ dockedRight: component });
        return true;
      default:
        return null;
    }
  }
}
