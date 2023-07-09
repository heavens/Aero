import React, { ReactNode, createElement } from "react";
import { styled } from "styletron-react";

/**
 * A 4 channel color structure where 3 of the channels are used to store the RGB values and the last is reserved for alpha support.
 * The RGB channels are 8-bit wide values and the alpha channel usually stores a floating-point value of 0.0 - 1.0.
 */
export type RGBAColor = {
    r: number;
    g: number;
    b: number;
    a: number;
}

/**
 * The type a color value may take the form of.
 * * `number` | `string` - Usually the color in hex notation or decimal value.
 * * `RGBAColor` - The color in RGBA format.
 */
export type TextColor = string | RGBAColor | number;

/**
 * The theme structure used to set the overall look and feel of the UI. As of now, all of the values within theme can be exposed and overriden
 * by the user through the UI however, this may change in the future. 
 * 
 * There may be some value to having an "ImmutableTheme" or "BaseTheme" in which values that prove to be undesirable to expose are migrated over. 
 */
export interface Theme {
    colors: Map<string, string>;
    fontFamily: string;
    fontSize: number;
    borderColor: string;
    foreground: string;
    background: string;
    lineHeight: number;
}

/**
 * The base dark theme template.
 */
export const DarkTheme: Theme = {
    colors: new Map<string, string>([
        ["red", "#ac4142"]
    ]),
    fontFamily: "Iosevka",
    fontSize: 16,
    borderColor: "#2f353c",
    foreground: "#bfbdb6",
    // background: "#1d1f21",
    background: "#10141c",
    lineHeight: 1
};

/**
 * The base light theme template.
 */
export const LightTheme: Theme = {
    colors: new Map<string, string>([
        ["red", "#ac4142"]
    ]),
    fontFamily: "Iosevka",
    fontSize: 16,
    borderColor: "rgba(0, 0, 0, 0.5)",
    foreground: "#5c6166",
    background: "#f8f9fa",
    lineHeight: 1
};

/**
 * The "active" theme that conditionally sets styling based on the property values passed in. 
 * Currently, only a "dark mode" flag is supported, butthis may change in the future.
 */
export const ActiveTheme = styled("div", ({ $isDark }) => ({
    fontFamily: DarkTheme.fontFamily,
    fontSize: `${DarkTheme.fontSize}px`,
    background: $isDark ? DarkTheme.background : LightTheme.background,
    foreground: $isDark ? DarkTheme.foreground : LightTheme.foreground,
    color: $isDark ? DarkTheme.foreground : LightTheme.foreground,
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