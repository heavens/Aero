import React, { ReactNode } from "react";
import ReactDOM from "react-dom";
import { styled } from "styletron-react";

const Root = styled("div", {
  position: "absolute",
  top: "31px",
  left: 0,
  right: 0,
  width: "min-content",
  margin: "auto",
  outline: "none",
});

export type ModalProps = {
  visible: boolean;
  children?: ReactNode;
}

export default class Modal extends React.Component<ModalProps> {
  previouslyFocusedElement: HTMLElement | Element | null;
  render() {
    return <Root tabIndex={-1} key={"modal"} style={{ visibility: this.props.visible ? "visible" : "hidden" }}>
        {this.props.children}
      </Root>
  }

  componentDidMount() {
    this.previouslyFocusedElement = document.activeElement;
  }

  componentWillUnmount() {
    const element = ReactDOM.findDOMNode(this);
    if (element.contains(document.activeElement) && this.previouslyFocusedElement instanceof HTMLElement) {
      this.previouslyFocusedElement.focus();
      this.previouslyFocusedElement = null
    }
  }
};
