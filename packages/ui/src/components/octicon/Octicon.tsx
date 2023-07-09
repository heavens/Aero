import classNames from "classnames"
import React, { RefObject } from "react"
import { createRoot } from "react-dom/client";
import { OcticonSymbolType } from "./octicons"

interface OcticonProps {
  readonly type: OcticonSymbolType;
  readonly styled?: React.CSSProperties;
  readonly className?: string;
}

export class Octicon extends React.Component<OcticonProps, {}> {
  private svgRef: RefObject<SVGSVGElement>;

  public render() {
    const { type } = this.props;
    const viewBox = `0 0 ${type.w} ${type.h}`;
    const className = classNames('octicon', this.props.className);
    const style = {
      height: "16px",
      flexShrink: "0",
      fill: "currentcolor",
      ...this.props.styled
    };
    return (
      <svg
        className={className}
        version="1.1"
        viewBox={viewBox}
        ref={this.svgRef}
        tabIndex={-1}
        style={style}
      >
        <path fillRule={type.fr} d={type.d} />
      </svg>
    )
  }
}

export function createOcticonElement(
  symbol: OcticonSymbolType,
  className?: string,
  id?: string
) {
  const wrapper = document.createElement('div');
  wrapper.id = id ?? ''
  if (className !== undefined) {
    wrapper.classList.add(className)
  }
  const octicon = <Octicon type={symbol} />
  createRoot(wrapper).render(octicon)
  return wrapper
}
