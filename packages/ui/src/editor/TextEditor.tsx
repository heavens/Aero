import React, { ReactNode, RefObject } from "react";
import { Area2 } from "../renderer/layout";
import { RGBAColor } from "../renderer/Color";
import { Viewport } from "../renderer/Viewport";
import { Font, load } from "opentype.js";
import LoadingScreen from "../components/LoadingScreen";

export type TextEditorProps = {
  children?: ReactNode | ReactNode[];
  rowCount?: number;
  firstVisibleRow: number;
  scrollLeft?: number;
  paddingLeft?: number;
  widestRow?: string;
  horizontalMargin: number;
  fontSize: number;
  lineHeight: number;
};

type TextEditorState = {
  initialized: boolean;
  font: Font | null;
  deviceScale: Area2;
  rect: Area2 | null;
};

export class TextEditor extends React.Component<TextEditorProps, TextEditorState> {

  cursorBlinkIntervalHandle: number;
  longestLineWidth: number;
  longestLine: string;
  private baseCharWidth: number;
  private element: RefObject<HTMLDivElement>;

  constructor(props: TextEditorProps) {
    super(props);
    this.state = {
      initialized: false,
      font: null,
      rect: new Area2(800, 600),
      deviceScale: new Area2(aero.dpr, aero.dpr),
    };
    this.element = React.createRef();

    load('./iosevka-regular.ttf', (_, font) => {
      this.setState({ font, initialized: true });
    })
  }

  render() {
    if (this.state.font == null) {
      return <LoadingScreen />
    }

    return <div id="workspace-area"
      ref={this.element}
      style={{
        display: "flex",
        width: `${this.state.rect?.width}px`,
        height: `${this.state.rect?.height}px`,
      }}>
      <Viewport
        id="aero-editor"
        $style={{
          border: `2px solid ${aero.context.theme.colors.sideBar.border}`,
        }}
        initialWidth={this.state.rect?.width}
        initialHeight={this.state.rect?.height}
        fg={RGBAColor.fromHex(aero.context.theme.colors.sideBar.fg)}
        lineHeight={this.props.lineHeight}
        fontWidth={this.props.fontSize}
        font={this.state.font} />
    </div>
  }

  getGutterWidth() {
    return (
      // this.gutterWidth(this.state.cursor.rowCount) +
      this.props.paddingLeft
    );
  }

  // handleMouseWheel(event: WheelEvent) {
  //   const { cursor } = this.state;
  //   if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
  //     this.setState({ cursor: Point.at(cursor.x + event.deltaX, cursor.y), scrollLeft: this.state.scrollLeft + event.deltaX });
  //   } else {
  //     const scrollTop = this.state.scrollTop + event.deltaY + this.element.current.scrollTop;
  //     this.setState({ scrollTop, cursor: Point.at(cursor.x, scrollTop % this.state.lineHeight) })
  //   }
  // }

  public gutterWidth(totalRowCount: number) {
    if (!this.state.initialized) {
      return 0;
    }

    const digitsCount = Math.floor(Math.log10(totalRowCount)) + 1;
    return Math.ceil(digitsCount * this.state.font.getAdvanceWidth("9", this.props.fontSize));
  }

  focus() {
    this.element.current.focus();
  }


  getSegmentWidth(line: string, column = line.length): number {
    if (line.length == 0) {
      return 0;
    }

    return this.getScaledWidth(line)
      .slice(0, Math.min(line.length, column))
      .reduce((acc, width) => acc + width);
  }

  /**
   * Gets the scaled width of the line.
   * @param line 
   * @returns 
   */
  public getScaledWidth(line: string) {
    return this
      .calculateWidth(line)
      .map(width => width);
  }

  /**
   * Scans over all characters in the passed-in string value making up a line entry in the document. Each character is evaluated
   * from LTR with some evaluations being less costly than others if the glyph is not found in the cache. The resolved width of each 
   * glyph is then inserted into an array of widths of the entire line where the index of the insertion point is relative to the
   * characters position in the line.
   *  
   * @returns An int array containing an integer value denoting the width of the glyph. The ordering of widths in the array are
   * ordered in respect to the position of the glyph on the associated line.
   */
  calculateWidth(line: string): number[] {
    let x = 0;
    const { fontSize } = this.props;
    const { font } = this.state;
    const glyphWidths = new Array(line.length);
    for (let i = 0; i < line.length; i++) {
      const width = font.getAdvanceWidth(line, fontSize);
      glyphWidths[i] = width;
      x += width;
    }
    return glyphWidths;
  }

  // autoscroll() {
  //   const { horizonAutoscroll, horizontalMargin, width } = this.props;
  //   const gutterWidth = this.getGutterWidth();
  //   const baseCharWidth = this.getBaseCharacterWidth();
  //   if (
  //     this.canUseTextPlane() &&
  //     horizonAutoscroll &&
  //     width &&
  //     gutterWidth &&
  //     baseCharWidth
  //   ) {
  //     const horizontalMarginInPixels = baseCharWidth * horizontalMargin;
  //     const desiredScrollLeft =
  //       this.getSegmentWidth(
  //         horizonAutoscroll.startingLine,
  //         horizonAutoscroll.start.x
  //       ) - horizontalMarginInPixels;
  //     const desiredScrollRight =
  //       this.getSegmentWidth(
  //         horizonAutoscroll.endingLine,
  //         horizonAutoscroll.end.x
  //       ) +
  //       gutterWidth +
  //       horizontalMarginInPixels;

  //     if (desiredScrollLeft < this.getScrollLeft()) {
  //       // this.setState({ scrollLeft: this.constrainScrollLeft(desiredScrollLeft) });

  //     }
  //     if (desiredScrollRight > this.getScrollRight()) {
  //       // this.setState({
  //       //   scrollLeft: this.constrainScrollLeft(
  //       //     desiredScrollRight - width
  //       //   )
  //       // });
  //     }
  //   }
  // }

  // getScrollLeft() {
  //   return this.constrainScrollLeft(this.state.scrollLeft);
  // }

  // getScrollRight() {
  //   if (this.props.width) {
  //     return this.getScrollLeft() + this.props.width;
  //   } else {
  //     return this.getScrollLeft();
  //   }
  // }

  constrainScrollLeft(scrollLeft: number) {
    return Math.max(0, Math.min(scrollLeft, this.getMaxScrollLeft()));
  }

  getMaxScrollLeft() {
    const contentWidth = this.getContentWidth();
    if (contentWidth != null && this.state.rect.width != null) {
      return Math.max(0, contentWidth - this.state.rect.width);
    } else {
      return 0;
    }
  }

  // getScrollWidth() {
  //   const contentWidth = this.getContentWidth();
  //   if (contentWidth != null && this.props.width != null) {
  //     return Math.max(contentWidth, this.state.width);
  //   } else {
  //     return 0;
  //   }
  // }

  getContentWidth() {
    const longestLineWidth = this.getLongestLineWidth();
    const baseCharWidth = this.getBaseCharacterWidth();
    const gutterWidth = this.getGutterWidth();
    if (
      longestLineWidth != null &&
      baseCharWidth != null &&
      gutterWidth != null
    ) {
      return Math.ceil(gutterWidth + longestLineWidth + baseCharWidth);
    } else {
      return null;
    }
  }

  getBaseCharacterWidth() {
    if (this.baseCharWidth == null) {
      this.baseCharWidth = this.getSegmentWidth("W");
    }
    return this.baseCharWidth;
  }

  getLongestLineWidth() {
    const { widestRow } = this.props;
    if (this.longestLine != widestRow) {
      this.longestLine = widestRow;
      console.log("longesss");
      this.longestLineWidth = this.getSegmentWidth(widestRow);
    }
    return this.longestLineWidth;
  }

  // public documentGutterWidth() {
  //   return (
  //     this.getGutterWidthOf(this.state.rowCount) +
  //     this.props.paddingLeft
  //   );
  // }

  canUseTextPlane() {
    return this.state.initialized
  }
}