import React, { ReactNode } from "react";

type Props = {
  id: string;
}

type State = {
  currentViewId: string;
  version: number;
  component: ReactNode | null;
}

export class View extends React.Component<Props, State> {
  id: string;

  constructor(props: Props) {
    super(props);
    this.id = props.id;
    this.state = {
      version: 0,
      currentViewId: props.id,
      component: null
    };
  }

  componentWillReceiveProps(props: Props, context: any) {
    if (this.state.currentViewId != props.id) {
      this.setState({ currentViewId: props.id });
    }
  }

  /**
   * Bumps the version, incrementing it by 1.
   */
  bumpVersion() {
    this.setState({
      version: this.state.version + 1
    })
  }
}

type UpdateMessage = {
  updated: View[];
  removed: string[];
  focused: string | null;
};

export default class ViewRegistry {
  private componentsByName: Map<string, ReactNode>;
  private focusListenersByViewId: Map<string, () => void>;
  private viewsById: Map<string, View>;
  private pendingFocus: string | null;
  private onAction: any;
  private propListenersByViewId: Map<string, CallableFunction[]>;

  constructor(props: { onAction: CallableFunction }) {
    this.onAction = props.onAction;
    this.componentsByName = new Map();
    this.viewsById = new Map();
    this.propListenersByViewId = new Map();
    this.focusListenersByViewId = new Map();
  }

  addComponent(name: string, component: React.ReactNode) {
    this.componentsByName.set(name, component);
  }

  getComponent(name: string) {
    const component = this.componentsByName.get(name);
    return component;
  }

  removeComponent(name: string) {
    this.componentsByName.delete(name);
  }

  update(msg: UpdateMessage) {
    const { updated, removed, focused } = msg;
    for (let i = 0; i < updated.length; i++) {
      const view = updated[i];
      this.viewsById.set(view.id, view);

      const listeners = this.propListenersByViewId.get(view.id);
      if (listeners) {
        for (let i = 0; i < listeners.length; i++) {
          listeners[i]();
        }
      }
    }

    for (var i = 0; i < removed.length; i++) {
      const viewId = removed[i];
      this.viewsById.delete(viewId);
      this.propListenersByViewId.delete(viewId);
    }

    if (focused != null) {
      const focusListener = this.focusListenersByViewId.get(focused);
      if (focusListener) {
        this.pendingFocus = null;
        focusListener[0]();
      } else {
        this.pendingFocus = focused;
      }
    }
  }

  watchProps(id: string, callback: () => void) {
    // assert(this.viewsById.has(id));

    let listeners = this.propListenersByViewId.get(id);
    if (!listeners) {
      listeners = null;
      this.propListenersByViewId.set(id, listeners);
    }

    listeners.push(callback);

    return () => {
      const callbackIndex = listeners.indexOf(callback);
      if (callbackIndex !== -1) listeners.splice(callbackIndex, 1);
    };
  }

  watchFocus(id: string, callback: () => void) {
    // assert(!this.focusListenersByViewId.has(id));

    this.focusListenersByViewId.set(id, callback);
    if (this.pendingFocus === id) {
      this.pendingFocus = null;
      callback();
    }

    return () => this.focusListenersByViewId.delete(id);
  }

  dispatchAction(id: string, action: () => void) {
    // assert(this.viewsById.has(id));
    this.onAction({ view_id: id, action });
  }
};
