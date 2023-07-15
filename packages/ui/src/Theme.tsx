import React, { ReactElement, ReactNode, useContext } from "react";

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

export type TextColor = string;

type ColorProfileMap = {
    palette: Object;
    app: AppColorProfile;
    input: InputColorProfile;
    list: ListColorProfile;
    titleBar: TitleBarColorProfile;
    statusBar: StatusBarColorProfile;
}

type StatusBarColorProfile = {
    bg: TextColor;
    fg: TextColor;
    border: TextColor;
}

type AppColorProfile = {
    fg: TextColor;
    bg: TextColor;
    border: TextColor;
}

type TitleBarColorProfile = {
    activeBackground: TextColor;
    activeForeground: TextColor;
    inactiveBackground: TextColor;
    inactiveForeground: TextColor;
    border: TextColor;
}

type InputColorProfile = {
    bg: TextColor;
    fg: TextColor;
    border: TextColor;
    placeholderForeground: TextColor;
}

type ListColorProfile = {
    activeSelectionBackground: TextColor,
    activeSelectionForeground: TextColor,
    focusBackground: TextColor,
    focusForeground: TextColor,
    focusOutline: TextColor,
    highlightForeground: TextColor,
    deemphasizedForeground: TextColor,
    hoverBackground: TextColor,
    inactiveSelectionBackground: TextColor,
    inactiveSelectionForeground: TextColor,
    invalidItemForeground: TextColor,
    errorForeground: TextColor,
}

/**
 * The theme structure used to set the overall look and feel of the UI. As of now, all of the values within theme can be exposed and overriden
 * by the user through the UI however, this may change in the future. 
 * 
 * There may be some value to having an "ImmutableTheme" or "BaseTheme" in which values that prove to be undesirable to expose are migrated over. 
 */
export interface Theme {
    readonly isDark: boolean;
    readonly colors: ColorProfileMap;
    readonly fontFamily: string;
    readonly fontSize: number;
    readonly lineHeight: number;
}

/**
 * The base dark theme template.
 */
export const DarkTheme: Theme = {
    isDark: true,
    colors: {
        palette: {
            gray: "#565b66",
            red: "#FF0000",
        },
        app: {
            bg: "#0b0e14",
            fg: "#565b66",
            border: "#1b1f29"
        },
        input: {
            bg: "#0d1017",
            fg: "#8a9199",
            border: "#565b6645",
            placeholderForeground: "#565b6680"
        },
        list: {
            activeSelectionBackground: "#47526640",
            activeSelectionForeground: "#bfbdb6",
            focusBackground: "#47526640",
            focusForeground: "#bfbdb6",
            focusOutline: "#47526640",
            highlightForeground: "#e6b450",
            deemphasizedForeground: "#d95757",
            hoverBackground: "#47526640",
            inactiveSelectionBackground: "#47526633",
            inactiveSelectionForeground: "#565b66",
            invalidItemForeground: "#565b664d",
            errorForeground: "#d95757",
        },
        titleBar: {
            activeBackground: "#0b0e14",
            activeForeground: "#bfbdb6",
            inactiveBackground: "#0b0e14",
            inactiveForeground: "#565b66",
            border: "#0b0e14"
        },
        statusBar: {
            bg: "#0b0e14",
            fg: "#565b66",
            border: "#1b1f29"
        }
    },
    fontFamily: "Iosevka",
    fontSize: 16,
    lineHeight: 1
};

/**
 * The base light theme template.
 */
export const LightTheme: Theme = {
    isDark: false,
    colors: {
        palette: {
            gray: "#565b66",
            red: "#FF0000",
        },
        app: {
            bg: "#f8f9fa",
            fg: "#8a9199",
            border: "#5D768F1a"
        },
        input: {
            bg: "#fcfcfc",
            fg: "#5c6166",
            border: "#8a919945",
            placeholderForeground: "#8a919980"
        },
        list: {
            activeSelectionBackground: "#56728f1f",
            activeSelectionForeground: "#5c6166",
            focusBackground: "#56728f1f",
            focusForeground: "#5c6166",
            focusOutline: "#56728f1f",
            highlightForeground: "#ffaa33",
            deemphasizedForeground: "#e65050",
            hoverBackground: "#56728f1f",
            inactiveSelectionBackground: "#6b7d8f1f",
            inactiveSelectionForeground: "#8a9199",
            invalidItemForeground: "#8a91994d",
            errorForeground: "#e65050",
        },
        titleBar: {
            activeBackground: "#f8f9fa",
            activeForeground: "#5c6166",
            inactiveBackground: "#fcfcfc",
            inactiveForeground: "#8a9199",
            border: "#6b7d8f1a"
        },
        statusBar: {
            bg: "#fcfcfc",
            fg: "#8a9199",
            border: "#6b7d8f1a"
        }
    },
    fontFamily: "Iosevka",
    fontSize: 16,
    lineHeight: 1
};

export type ThemeContext = Theme;
export const Ctx = React.createContext(LightTheme);
export const ThemeProvider = Ctx.Provider;
export const ThemeConsumer = Ctx.Consumer;

export type Props = {
    children?: ReactElement | ReactElement[];
    theme: Theme;
}

export class Context extends React.Component<Props> {

    static contextType = Ctx;

    constructor(props: Props) {
        super(props);
    }

    render() {
        return <ThemeConsumer>{(theme) => {
            return React.Children.map(this.props.children, (child) => {
                return React.cloneElement(child, { theme: theme })
            })
        }}</ThemeConsumer>
    }
}