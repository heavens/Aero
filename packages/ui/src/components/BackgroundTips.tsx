import React from "react";
import { styled } from "styletron-react";
import { Theme } from "../Theme";

const componentPadding = 10;

const Container = styled("div", {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
    alignItems: "center",
    justifyContent: "center",
});

const BackgroundMessage = styled("div", (props: { $theme: Theme }) => ({
    color: props.$theme.colors.app.fg,
    alignItems: "center",
    userSelect: "none",
    padding: `0 ${componentPadding * 3}px`,
}));

const KeyboardButton = styled("kbd", (props: { $theme?: Theme; $clickable?: boolean }) => ({
    backgroundColor: "#eee",
    borderRadius: "3px",
    border: "1px solid #b4b4b4",
    boxShadow: "0 1px 1px rgba(0, 0, 0, 0.2), 0 2px 0 0 rgba(255, 255, 255, 0.7) inset",
    color: "#333",
    display: props.$clickable ? "flex" : "inline-block",
    fontSize: "0.85em",
    fontWeight: 700,
    padding: "4px",
    margin: "0 8px",
    opacity: "0.6",
    whiteSpace: "nowrap",
    ":hover": props.$clickable ? {
        cursor: "pointer"
    } : null,
}));

type Props = {
    theme: Theme;
}

export default class BackgroundTips extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
    }

    render() {
        const { theme } = this.props;
        return <Container className="keystroke">
            <BackgroundMessage $theme={theme}>Press
                <KeyboardButton>CTRL</KeyboardButton>
                +
                <KeyboardButton>K</KeyboardButton>
                to open the command menu
            </BackgroundMessage>
        </Container>
    }
}