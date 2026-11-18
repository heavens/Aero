type TextColor = string;

type ColorProfileMap = {
    accent: TextColor;
    palette: Object;
    pane: PaneColorProfile;
    input: InputColorProfile;
    list: ListColorProfile;
    titleBar: TitleBarColorProfile;
    sideBar: SideBarColorProfile;
    statusBar: StatusBarColorProfile;
}

type StatusBarColorProfile = {
    bg: TextColor;
    fg: TextColor;
    border: TextColor;
}

type PaneColorProfile = {
    fg: TextColor;
    bg: TextColor;
    border: TextColor;
    borderAccent?: TextColor;
}

type SideBarColorProfile = {
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
    activeSelectionBackground: TextColor;
    activeSelectionForeground: TextColor;
    focusBackground: TextColor;
    focusForeground: TextColor;
    focusOutline: TextColor;
    highlightForeground: TextColor;
    deemphasizedForeground: TextColor;
    hoverBackground: TextColor;
    inactiveSelectionBackground: TextColor;
    inactiveSelectionForeground: TextColor;
    invalidItemForeground: TextColor;
    errorForeground: TextColor;
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
        accent: "#e6b450",
        palette: {
            gray: "#565b66",
            red: "#FF0000",
        },
        pane: {
            bg: "#10141c",
            fg: "#bfbdb6",
            border: "#0d1017",
            borderAccent: "#1b1f29"
        },
        input: {
            bg: "#0d1017",
            fg: "#8a919966",
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
            activeBackground: "#0d1017",
            activeForeground: "#bfbdb6",
            inactiveBackground: "#0d1017",
            inactiveForeground: "#565b66",
            border: "#11151c"
        },
        sideBar: {
            bg: "#0d1017",
            fg: "#565b66",
            border: "#11151c"
        },
        statusBar: {
            bg: "#0d1017",
            fg: "#565b66",
            border: "#1b1f29"
        }
    },
    fontFamily: "Iosevka",
    fontSize: 14,
    lineHeight: 14,
};

/**
 * The base light theme template.
 */
export const LightTheme: Theme = {
    isDark: false,
    colors: {
        accent: "#ffaa33",
        palette: {
            gray: "#565b66",
            red: "#FF0000",
        },
        pane: {
            bg: "#fcfcfc",
            fg: "#343b58",
            border: "#5D768F1a"
        },
        input: {
            bg: "#fcfcfc",
            fg: "#5c6166",
            border: "#8a919945",
            placeholderForeground: "#8a919945"
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
        sideBar: {
            bg: "#f8f9fa",
            fg: "#1B1D1E",
            border: "#6b7d8f1a"
        },
        statusBar: {
            bg: "#f8f9fa",
            fg: "#8a9199",
            border: "#6b7d8f1f"
        }
    },
    fontFamily: "Iosevka",
    fontSize: 16,
    lineHeight: 22,
}