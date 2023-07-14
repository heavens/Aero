import classNames from "classnames"
import React, { RefObject } from "react"
import { createRoot } from "react-dom/client";
import { OcticonSymbolType } from "./octicons"

interface OcticonProps {
  readonly type: OcticonSymbolType;
  readonly styled?: React.CSSProperties;
  readonly attributes?: React.AriaAttributes;
  readonly className?: string;
}

type OcticonState = {
  active: boolean;
}

export class Octicon extends React.Component<OcticonProps, OcticonState> {
  private svgRef: RefObject<SVGSVGElement>;

  constructor(props: OcticonProps) {
    super(props);
    this.state = {
      active: false,
    };
  }

  public render() {
    const { type, attributes } = this.props;
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
        {...attributes}
        onMouseEnter={() => this.setState({ active: true })}
        onMouseLeave={() => this.setState({ active: false })}
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
