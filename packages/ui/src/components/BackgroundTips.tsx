import React from "react";
import { styled } from "styletron-react";

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

const BackgroundMessage = styled("div", (props: { $clickable?: boolean }) => ({
    display: props.$clickable ? "flex" : null,
    alignItems: "center",
    userSelect: "none",
    padding: `0 ${componentPadding * 3}px`,
    transition: "opacity .3s ease-in-out",
    opacity: "0.6",
    ":hover": props.$clickable ? {
        opacity: "1",
    } : null,
}));

const KeyboardButton = styled("kbd", (props: { $isDark: boolean; $clickable?: boolean }) => ({
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
    whiteSpace: "nowrap",
    ":hover": props.$clickable ? {
        cursor: "pointer"
    } : null,
}));

type Props = {
    darkMode: boolean;
}

export default class BackgroundTips extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
    }

    render() {
        const { darkMode } = this.props;
        return <Container className="keystroke">
            <BackgroundMessage>Press
                <KeyboardButton $isDark={darkMode}>CTRL</KeyboardButton>
                +
                <KeyboardButton $isDark={darkMode}>T</KeyboardButton>
                to browse files
            </BackgroundMessage>
            <BackgroundMessage $clickable>
                Open <KeyboardButton $isDark={darkMode} $clickable>settings</KeyboardButton>
            </BackgroundMessage>
        </Container>
    }
}