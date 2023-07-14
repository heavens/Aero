import React from "react";
import { ReactNode } from "react";
import { styled } from "styletron-react";
import { DarkTheme, LightTheme } from "../theme";
import { Octicon } from "../components/octicon/Octicon";
import { x, zoomOut } from "../components/octicon/octicons";
import { RendererIpc } from "..";

/**
 * The root component of the titlebar with an optional `$isDark` property used to conditionally set the LaF.
 */
const StyledTitleBar = styled("div", (props: { $isDark?: boolean }) => ({
  background: "#e9ecef",
  borderBottom: `1px solid ${props.$isDark ? DarkTheme.borderColor : LightTheme.borderColor}`,
}));

type Props = {
  children?: ReactNode[];
  style?: React.CSSProperties;
  isWindowFocused?: boolean;
  title: ReactNode;
  controls?: boolean;
  hidden?: boolean;
  isMaximized?: boolean;
  darkMode: boolean;
  onCloseClick?: () => void;
  onMinimizeClick?: () => void;
  onMaximizeClick?: () => void;
  onRestoreDownClick?: () => void;
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
      children,
      style,
      controls,
      title,
      hidden,
      isWindowFocused,
      ...props
    } = this.props;

    let styled: React.CSSProperties;
    if (style) {
      styled = Object.assign(style, {
        visibility: !hidden ? 'visible' : 'hidden',
        display: !hidden ? 'flex' : 'none'
      });
    }

    return (
      <StyledTitleBar className="titlebar" $isDark={props.darkMode}>
        <span className="drag-region" />
        <div className="titlebar-header drag-region">
          {title}
        </div>
        <div className="window-controls">
          <button className="window-control basic-control" onClick={this.minimizeWindow}>
            <Octicon type={zoomOut} />
          </button>
          <button className="window-control x-window" onClick={this.closeWindow}>
            <Octicon type={x} />
          </button>
        </div>
      </StyledTitleBar>
    );
  }
}
