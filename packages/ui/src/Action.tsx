import React, { ReactNode } from "react";
import { styled } from "styletron-react";
import { KeyBinding, contextMatches, keystrokeStringForEvent } from "./keybinding";

const Root = styled("div", { width: "100%", height: "100%" });

class ActionSet {
  context: Set<ReactNode>;
  actions: WeakMap<any, any>;

  constructor() {
    this.context = null;
    this.actions = new Map();
  }
}

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
    return <Root onKeyDown={this.handleKeyDown}>{this.props.children}</Root>
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
    return <div></div>
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


