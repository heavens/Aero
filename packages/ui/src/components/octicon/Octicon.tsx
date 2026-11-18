import classNames from "classnames"
import React, { RefObject, SVGAttributes } from "react"
import { OcticonSymbolType } from "./octicons"

interface OcticonProps {
  readonly type: OcticonSymbolType;
  readonly styled?: React.CSSProperties;
  readonly attributes?: SVGAttributes<any>;
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
      width: `${type.w}px`,
      height: `${type.h}px`,
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
        onMouseEnter={() => this.setState({ active: true })}
        onMouseLeave={() => this.setState({ active: false })}
      >
        {attributes && <g {...attributes}><path fillRule={type.fr} d={type.d} /></g>}
        {!attributes && <path fillRule={type.fr} d={type.d} />}
      </svg>
    )
  }
}
