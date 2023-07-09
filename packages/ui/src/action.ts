import React, { ReactNode } from "react";
import { createElement } from "react";
import { styled } from "styletron-react";

const Root = styled("div", { width: "100%", height: "100%" });

class ActionSet {
  context: Set<ReactNode>;
  actions: WeakMap<any, any>;

  constructor() {
    this.context = null;
    this.actions = new Map();
  }
}

export type KeyBinding = {
  key: string;
  action: string;
  context: string;
};

type ActionDispatcherProps = {
  children?: ReactNode[];
  keyBindings: KeyBinding[];
};

export class ActionDispatcher extends React.Component<ActionDispatcherProps> {
  actionSets: WeakMap<object, any>;
  defaultActionSet: ActionSet;
  constructor(props: ActionDispatcherProps) {
    super(props);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.actionSets = new WeakMap();
    this.defaultActionSet = new ActionSet();
  }

  render() {
    return createElement(Root, { onKeyDown: this.handleKeyDown }, this.props.children);
  }

  handleKeyDown(event: React.KeyboardEvent) {
    const { keyBindings } = this.props;
    const keystrokeString = keystrokeStringForEvent(event);

    let element = event.currentTarget;
    while (element) {
      let actionSet = this.actionSets.get(element);
      if (actionSet) {
        for (let i = keyBindings.length - 1; i >= 0; i--) {
          const keyBinding = keyBindings[i];
          const action = actionSet.actions.get(keyBinding.action);
          if (
            keyBinding.key === keystrokeString &&
            action &&
            contextMatches(actionSet.context, [keyBinding.context])
          ) {
            if (action.onWillDispatch) {
              action.onWillDispatch();
            }
            action.dispatch();
            return;
          }
        }
      }

      element = element.parentElement;
    }
  }
}

export type ActionContextProps = {
  context?: string;
  onWillDispatch?: Action;
  children?: ReactNode[];
  add?: string;
  remove?: ReactNode[];
};

export class ActionContext extends React.Component<ActionContextProps> {
  actionSet: ActionSet;
  actionSets: Set<ActionSet>;
  currentActionSet: ActionSet;

  constructor(props: ActionContextProps) {
    super(props);
    this.actionSet = new ActionSet();
    this.actionSets = new Set();
  }

  componentWillMount() {

    if (this.props.add) {
      if (Array.isArray(this.props.add)) {
        for (let i = 0; i < this.props.add.length; i++) {
          this.actionSet.context.add(this.props.add[i]);
        }
      } else {
        this.actionSet.context.add(this.props.add);
      }
    }

    if (this.props.remove) {
      if (Array.isArray(this.props.remove)) {
        for (let i = 0; i < this.props.remove.length; i++) {
          this.actionSet.context.delete(this.props.remove[i]);
        }
      } else {
        this.actionSet.context.delete(this.props.remove);
      }
    }
  }

  render() {
    return this.props.children;
  }
}

export type ActionProps = {
  type: string;
  onWillDispatch?: () => void;
};

export class Action extends React.Component<ActionProps> {
  context!: ActionContext;

  constructor(props: ActionProps) {
    super(props);
    this.dispatch = this.dispatch.bind(this);
  }

  render() {
    return createElement("div");
  }

  componentDidMount() {
    this.context.currentActionSet.actions.set(this.props.type, {
      // onWillDispatch: this.props.onWillDispatch,
      dispatch: this.dispatch
    });
  }

  dispatch() {
    // this.context.dispatchAction({ type: this.props.type });
  }
}

function keystrokeStringForEvent(event: React.KeyboardEvent) {
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

function appendKeystrokeElement(keyString: string, element: string) {
  if (keyString.length > 0) keyString += "-";
  keyString += element;
  return keyString;
}

function contextMatches(context: React.Context<any>, expression: string[]) {
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

