import React, { ReactNode, createElement } from "react";
import { createStyled, styled } from "styletron-react";

export type RGBAColor = {
    r: number;
    g: number;
    b: number;
    a: number;
};

export const IosevkaFont = styled("div", {
    fontFamily: {
        fontFamily: "Iosevka",
        src: "url(\"./static/iosevka-regular.ttf\")"
    }
});

export type TextColor = string | RGBAColor | number;

export interface Theme {
    colors: Map<string, string>;
    fontFamily: string;
    fontSize: number;
    borderColor: string;
    foreground: string;
    background: string;
    lineHeight: number;
}

export const DarkTheme: Theme = {
    colors: new Map<string, string>([
        ["red", "#ac4142"]
    ]),
    fontFamily: "Iosevka",
    fontSize: 16,
    borderColor: "rgba(0, 0, 0, 0.5)",
    foreground: "#c5c8c6",
    background: "#1d1f21",
    lineHeight: 1
};

export const LightTheme: Theme = {
    colors: new Map<string, string>([
        ["red", "#ac4142"]
    ]),
    fontFamily: "Iosevka",
    fontSize: 16,
    borderColor: "rgba(0, 0, 0, 0.5)",
    foreground: "#5c6166",
    background: "#ffffff",
    lineHeight: 1
};

export const ActiveTheme = styled("div", ({ $isDark }) => ({
    fontFamily: DarkTheme.fontFamily,
    fontSize: `${DarkTheme.fontSize}px`,
    background: $isDark ? DarkTheme.background : LightTheme.background,
    foreground: $isDark ? DarkTheme.fontFamily : LightTheme.foreground,
}));

type ThemeProviderProps = {
    theme?: Theme;
    isDark: boolean;
    children?: ReactNode[];
};

type ThemeProviderState = {
    theme?: Theme;
    isDark: boolean;
};

export default class ThemeProvider extends React.Component<ThemeProviderProps, ThemeProviderState> {

    constructor(props: ThemeProviderProps) {
        super(props);
        this.state = {
            isDark: props.isDark
        };
    }

    render() {
        return createElement(ActiveTheme, {
            $isDark: this.state.isDark,
            $style: {
                fontFamily: DarkTheme.fontFamily,
                fontSize: `${DarkTheme.fontSize}px`,
                height: "100%",
                width: "100%",
                display: "flex",
            }
        }, this.props.children)
    }
}