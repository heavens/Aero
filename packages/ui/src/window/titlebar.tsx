import React from "react";
import { ReactNode } from "react";
import { styled } from "styletron-react";
import { DarkTheme, LightTheme } from "../theme";
import { Octicon } from "../components/octicon/Octicon";
import { x, zoomOut } from "../components/octicon/octicons";

/**
 * The root component of the titlebar with an optional `$isDark` property used to conditionally set the LaF.
 */
const StyledTitleBar = styled("div", (props: { $isDark?: boolean }) => ({
  WebkitUserSelect: 'none',
  userSelect: 'none',
  WebkitAppRegion: 'drag',
  appRegion: 'drag',
  cursor: "default",
  position: "absolute",
  display: "flex",
  flexShrink: "0",
  alignItems: 'center',
  justifyContent: 'center',
  width: "100%",
  height: '31px',
  borderBottom: `1px solid ${props.$isDark ? DarkTheme.borderColor : LightTheme.borderColor}`,
}));

/**
 * The string representation of the window title.
 */
const WindowTitle = styled("h4", {
  display: "flex",
  flex: "0 1 auto",
  fontSize: "13px",
  textAlign: "center",
  whiteSpace: "nowrap",
  overflow: "hidden"
});

const WindowControls = styled("div", {
  display: "flex",
  height: "100%",
  position: "absolute",
  right: "0",
  padding: "0 12px",
  alignItems: "center",
  zIndex: "5",
});

const WindowControl = styled("button", (props: { $hoverColor?: string }) => ({
  display: "flex",
  flex: "1",
  border: "none",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "transparent",
  ":hover": {
    cursor: "pointer",
    backgroundColor: props.$hoverColor ?? "#8a91991a"
  }
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
    this.windowDrag = this.windowDrag.bind(this);
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

    delete props.isMaximized;
    delete props.onCloseClick;
    delete props.onMinimizeClick;
    delete props.onMaximizeClick;
    delete props.onRestoreDownClick;

    let styled: React.CSSProperties;
    if (style) {
      styled = Object.assign(style, {
        visibility: !hidden ? 'visible' : 'hidden',
        display: !hidden ? 'flex' : 'none'
      });
    }

    return (
      <div style={styled} {...props}>
        <StyledTitleBar $isDark={props.darkMode}>
          <WindowControls>
            <WindowControl>
              <Octicon type={zoomOut} styled={{ fill: LightTheme.foreground }} />
            </WindowControl>
            <WindowControl $hoverColor="#E65050">
              <Octicon type={x} styled={{ fill: LightTheme.foreground }} />
            </WindowControl>
          </WindowControls>
          <WindowTitle>
            {this.props.title}
          </WindowTitle>
        </StyledTitleBar>
        {children}
      </div>
    );
  }

  windowDrag(event: MouseEvent) {
    event.preventDefault();
  }
}
