export type KeyBinding = {
    key: string;
    action: string;
    context: string;
}

export function keystrokeStringForEvent(event: React.KeyboardEvent) {
    let keystroke = "";
    if (event.ctrlKey) {
        keystroke = "ctrl";
    }
    if (event.altKey) {
        keystroke = appendKeystrokeElement(keystroke, "alt");
    }
    if (event.shiftKey) {
        keystroke = appendKeystrokeElement(keystroke, "shift");
    }
    if (event.metaKey) {
        keystroke = appendKeystrokeElement(keystroke, "cmd");
    }
    switch (event.key) {
        case "ArrowDown":
            return appendKeystrokeElement(keystroke, "down");
        case "ArrowUp":
            return appendKeystrokeElement(keystroke, "up");
        case "ArrowLeft":
            return appendKeystrokeElement(keystroke, "left");
        case "ArrowRight":
            return appendKeystrokeElement(keystroke, "right");
        default:
            return appendKeystrokeElement(keystroke, event.key.toLowerCase());
    }
}

export function appendKeystrokeElement(keyString: string, element: string) {
    if (keyString.length > 0) {
        keyString += "-";
    }
    keyString += element;
    return keyString;
}

export function contextMatches(context: React.Context<any>, expression: string[]) {
    let expressionStartIndex = 0;
    for (let i = 0; i < expression.length; i++) {
        if (expression[i] == " ") {
            const component = expression.slice(expressionStartIndex, i);
            if (!context) {
                return false;
            }
        }
    }
    return true;
}