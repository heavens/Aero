import React from "react";
import { ReactNode } from "react";
import { Ctx, Theme } from "../Theme";
import { Octicon } from "../components/octicon/Octicon";
import { x, zoomOut } from "../components/octicon/octicons";
import { RendererIpc } from "..";
import { styled, withStyle } from "styletron-react";

const WindowControlContainer = styled("div", {
  display: "flex",
  justifyContent: "space-evenly",
  maxHeight: "inherit"
});

const WindowControl = styled("button", (props: { $theme?: Theme }) => ({
  display: "flex",
  flex: "1",
  alignItems: "center",
  justifyContent: "center",
  borderColor: "transparent",
  borderWidth: "1px",
  borderStyle: "solid",
  backgroundColor: "transparent"
}));

const BasicWindowControl = withStyle(WindowControl, (props: { $theme: Theme }) => ({
  ":hover": {
    backgroundColor: `${props.$theme.colors.palette["gray"]}70`
  }
}));

const DangerWindowControl = withStyle(WindowControl, (props: { $theme: Theme }) => ({
  ":hover": {
    backgroundColor: `${props.$theme.colors.palette["red"]}90`
  }
}));

/**
 * The root component of the titlebar with an optional `$isDark` property used to conditionally set the LaF.
 */
const StyledTitleBar = styled("div", (props: { $theme?: Theme }) => ({
  background: props.$theme.colors.app.bg,
  borderBottom: `1px solid ${props.$theme.colors.titleBar.border}`,
}));

type Props = {
  children?: ReactNode[];
  style?: React.CSSProperties;
  isWindowFocused?: boolean;
  title: ReactNode;
  controls?: boolean;
  hidden?: boolean;
  isMaximized?: boolean;
  onCloseClick?: CallableFunction;
  onMinimizeClick?: CallableFunction;
  onMaximizeClick?: CallableFunction;
  onRestoreDownClick?: CallableFunction;
}

/**
 * A component for creating, and updating, the look-and-feel aspect of the title bar.
 */
export default class TitleBar extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  componentDidMount(): void {
    document.addEventListener("mousedown", (event: MouseEvent) => {
      const target = event.target as Element;
      if (target.classList.contains("drag-region") && event.buttons == 1) {
        RendererIpc.postMessage('window_drag');
      }
    })
  }

  componentWillUnmount(): void {
    document.removeEventListener("mousedown", (event: MouseEvent) => {
      const target = event.target as Element;
      if (target.classList.contains("drag-region") && event.buttons == 1) {
        RendererIpc.postMessage('window_drag');
      }
    });
  }

  minimizeWindow() {
    RendererIpc.postMessage("window_minimize");
  }

  closeWindow() {
    RendererIpc.postMessage("window_close");
  }

  render() {
    const {
      style,
      title,
      hidden,
    } = this.props;

    let styled: React.CSSProperties;
    if (style) {
      styled = Object.assign(style, {
        visibility: !hidden ? 'visible' : 'hidden',
        display: !hidden ? 'flex' : 'none'
      });
    }

    const theme = this.context as Theme;
    return (
      <StyledTitleBar className="titlebar" $theme={theme}>
        <span className="drag-region" />
        <div className="titlebar-header drag-region">
          {title}
        </div>
        <WindowControlContainer>
          <BasicWindowControl $theme={theme} onClick={this.minimizeWindow}>
            <Octicon styled={{ fill: theme.colors.titleBar.activeForeground }} type={zoomOut} />
          </BasicWindowControl>
          <DangerWindowControl $theme={theme} onClick={this.closeWindow}>
            <Octicon styled={{ fill: theme.colors.titleBar.activeForeground }} type={x} />
          </DangerWindowControl>
        </WindowControlContainer>
      </StyledTitleBar>
    );
  }
}

TitleBar.contextType = Ctx;