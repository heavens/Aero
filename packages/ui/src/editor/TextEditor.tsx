import React from "react";
import ReactDOM from "react-dom";
import { styled } from "styletron-react";
import TextPlane from "./TextPlane";
import { Line, Point } from "./types";
import { BehaviorSubject, interval, observeOn, takeUntil, timeInterval } from "rxjs";

const CURSOR_BLINK_RESUME_DELAY = 300;
const CURSOR_BLINK_PERIOD = 800;

const Root = styled("div", {
  width: "100%",
  height: "100%",
  overflow: "hidden",
  cursor: "text"
});

type TextEditorProps = {
  rowCount?: number;
  dispatch?: () => void;
  width?: number;
  height?: number;
  scrollTop?: number;
  firstVisibleRow?: number;
  showLocalCursors?: boolean;
  selections?: Array<any>;
  lines?: Array<Line>;
  scrollLeft?: number;
  paddingLeft?: number;
  lineHeight?: number;
  className?: string;
  widestRow?: number;
  horizonAutoscroll?: {
    startingLine: Line;
    endingLine: Line;
    start: Point;
    end: Point;
  };
  horizontal_margin?: number;
};

type TextEditorState = {
  width: number;
  height: number;
  scrollLeft: number;
  showLocalCursors: boolean;
  cursorsBlinking: boolean;
};

export class TextEditor extends React.Component<TextEditorProps, TextEditorState> {
  debouncedStartCursorBlinking: () => void;
  private destroyed: BehaviorSubject<boolean>;
  private cursorBlinkAnimation;
  paddingLeft: number;
  resizeObserver: ResizeObserver;
  textPlane: TextPlane;
  element: HTMLTextAreaElement;
  cursorBlinkIntervalHandle: number;
  baseCharWidth: any;
  longestLineWidth: any;
  longestLine: number;

  static getDerivedStateFromProps(nextProps: { width: null; height: null; }, prevState: { width: any; height: any; }) {
    let derivedState = null;

    if (nextProps.width != null && nextProps.width !== prevState.width) {
      derivedState = { width: nextProps.width };
    }

    if (nextProps.height != null && nextProps.height !== prevState.height) {
      if (derivedState) {
        derivedState.height = nextProps.height;
      } else {
        derivedState = { height: nextProps.height };
      }
    }

    return derivedState;
  }

  constructor(props: TextEditorProps) {
    super(props);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseWheel = this.handleMouseWheel.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.pauseCursorBlinking = this.pauseCursorBlinking.bind(this);
    this.destroyed = new BehaviorSubject(false);
    this.cursorBlinkAnimation = interval(CURSOR_BLINK_RESUME_DELAY)
      .pipe(timeInterval())
      .pipe(takeUntil(this.destroyed))
      .subscribe((interval) => {
        this.processCursorAnim(interval.value);
      });
    this.paddingLeft = 5;
    this.state = { width: 800, height: 600, scrollLeft: 0, showLocalCursors: true, cursorsBlinking: true };
  }

  componentDidMount() {
    const element = ReactDOM.findDOMNode(this) as HTMLTextAreaElement;
    this.resizeObserver = new ResizeObserver(([{ contentRect }]) => {
      this.componentDidResize({
        width: contentRect.width,
        height: contentRect.height
      });
    });
    this.resizeObserver.observe(element);

    if (this.props.width == null || this.props.height == null) {
      const dimensions = {
        width: element.offsetWidth,
        height: element.offsetHeight
      };
      this.componentDidResize(dimensions);
      this.setState({});
    }

    element.addEventListener("wheel", this.handleMouseWheel, { passive: true });
    element.addEventListener("mousedown", this.handleMouseDown, {
      passive: true
    });
  }

  componentWillUnmount() {
    if (!this.destroyed.closed) {
      this.destroyed.next(true);
      this.destroyed = null;
    }

    this.stopCursorBlinking();
    const element = ReactDOM.findDOMNode(this);
    element.removeEventListener("wheel", this.handleMouseWheel, {
      capture: true
    });
    this.resizeObserver.disconnect();
  }

  componentDidResize(measurements: { width: any; height: any; }) {
    // this.props.dispatch({
    //   type: "SetDimensions",
    //   width: measurements.width,
    //   height: measurements.height
    // });
  }

  render() {
    const { width, height, showLocalCursors, lineHeight, scrollTop, scrollLeft, selections, firstVisibleRow, rowCount, lines } = this.props;
    this.flushHorizontalAutoscroll();
    return <Root>
      <TextPlane showLocalCursors={showLocalCursors}
        lineHeight={lineHeight}
        scrollTop={scrollTop}
        paddingLeft={this.paddingLeft}
        scrollLeft={scrollLeft}
        width={width}
        height={height}
        selections={selections}
        firstVisibleRow={firstVisibleRow}
        totalRowCount={rowCount}
        lines={lines}>
          <></>
      </TextPlane>
    </Root>
    // return createElement(
    //   Root,
    //   {
    //     tabIndex: -1,
    //     onKeyDown: this.handleKeyDown,
    //     ref: (element: HTMLTextAreaElement) => {
    //       this.element = element;
    //     }
    //   },
    //   createElement(TextPlane, {
    //     showLocalCursors: this.state.showLocalCursors,
    //     lineHeight: this.props.line_height,
    //     scrollTop: this.props.scroll_top,
    //     paddingLeft: this.paddingLeft,
    //     scrollLeft: this.getScrollLeft(),
    //     height: this.props.height ?? 800,
    //     width: this.getScrollWidth(),
    //     selections: this.props.selections,
    //     firstVisibleRow: this.props.first_visible_row,
    //     totalRowCount: this.props.total_row_count,
    //     lines: this.props.lines,
    //     ref: (ref: TextPlane) => this.textPlane = ref,
    //   })
    // );
    // createElement(Action, {
    //   type: "AddSelectionAbove",
    //   onWillDispatch: this.pauseCursorBlinking
    // }),
    // createElement(Action, {
    //   type: "AddSelectionBelow",
    //   onWillDispatch: this.pauseCursorBlinking
    // }),
    // createElement(Action, { type: "SelectUp", onWillDispatch: this.pauseCursorBlinking }),
    // createElement(Action, {
    //   type: "SelectDown",
    //   onWillDispatch: this.pauseCursorBlinking
    // }),
    // createElement(Action, {
    //   type: "SelectLeft",
    //   onWillDispatch: this.pauseCursorBlinking
    // }),
    // createElement(Action, {
    //   type: "SelectRight",
    //   onWillDispatch: this.pauseCursorBlinking
    // }),
    // createElement(Action, {
    //   type: "SelectToBeginningOfWord",
    //   onWillDispatch: this.pauseCursorBlinking
    // }),
    // createElement(Action, {
    //   type: "SelectToEndOfWord",
    //   onWillDispatch: this.pauseCursorBlinking
    // }),
    // createElement(Action, {
    //   type: "SelectToBeginningOfLine",
    //   onWillDispatch: this.pauseCursorBlinking
    // }),
    // createElement(Action, {
    //   type: "SelectToEndOfLine",
    //   onWillDispatch: this.pauseCursorBlinking
    // }),
    // createElement(Action, {
    //   type: "SelectToTop",
    //   onWillDispatch: this.pauseCursorBlinking
    // }),
    // createElement(Action, {
    //   type: "SelectToBottom",
    //   onWillDispatch: this.pauseCursorBlinking
    // }),
    // createElement(Action, { type: "MoveUp", onWillDispatch: this.pauseCursorBlinking }),
    // createElement(Action, { type: "MoveDown", onWillDispatch: this.pauseCursorBlinking }),
    // createElement(Action, { type: "MoveLeft", onWillDispatch: this.pauseCursorBlinking }),
    // createElement(Action, {
    //   type: "MoveRight",
    //   onWillDispatch: this.pauseCursorBlinking
    // }),
    // createElement(Action, {
    //   type: "MoveToBeginningOfWord",
    //   onWillDispatch: this.pauseCursorBlinking
    // }),
    // createElement(Action, {
    //   type: "MoveToEndOfWord",
    //   onWillDispatch: this.pauseCursorBlinking
    // }),
    // createElement(Action, {
    //   type: "MoveToBeginningOfLine",
    //   onWillDispatch: this.pauseCursorBlinking
    // }),
    // createElement(Action, {
    //   type: "MoveToEndOfLine",
    //   onWillDispatch: this.pauseCursorBlinking
    // }),
    // createElement(Action, {
    //   type: "MoveToTop",
    //   onWillDispatch: this.pauseCursorBlinking
    // }),
    // createElement(Action, {
    //   type: "MoveToBottom",
    //   onWillDispatch: this.pauseCursorBlinking
    // }),
    // createElement(Action, {
    //   type: "Backspace",
    //   onWillDispatch: this.pauseCursorBlinking
    // }),
    // createElement(Action, { type: "Delete", onWillDispatch: this.pauseCursorBlinking })

  }

  handleMouseDown(event: MouseEvent): void {
    if (this.canUseTextPlane()) {
      this.handleClick(event);
      switch (event.detail) {
        case 2:
          this.handleDoubleClick();
          break;
        case 3:
          this.handleTripleClick();
          break;
      }
    }
  }

  handleClick({ clientX, clientY }: { clientX: number; clientY: number; }) {
    const { scrollTop, lineHeight, firstVisibleRow, lines } = this.props;
    const { scrollLeft } = this.state;
    const targetX =
      clientX - this.element.offsetLeft + scrollLeft - this.getGutterWidth();
    const targetY = clientY - this.element.offsetTop + scrollTop;
    const row = Math.max(0, Math.floor(targetY / lineHeight));
    const line = lines[row - firstVisibleRow];
    if (line != null) {
      const glyphWidths = this.textPlane.layoutLine(line);
      let column = 0;
      let x = 0;
      while (x < targetX && column < line) {
        const glyphWidth = glyphWidths[column];
        if (targetX > x + glyphWidth / 2) {
          column++;
          x += glyphWidth;
        } else {
          break;
        }
      }

      this.pauseCursorBlinking();
      // this.props.dispatch({
      //   type: "SetCursorPosition",
      //   row,
      //   column,
      //   autoscroll: false
      // });
    }
  }

  handleDoubleClick() {
    this.pauseCursorBlinking();
    // this.props.dispatch({ type: "SelectWord" });
  }

  handleTripleClick() {
    this.pauseCursorBlinking();
    // this.props.dispatch({ type: "SelectLine" });
  }

  handleMouseWheel(event: WheelEvent) {
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
      this.setScrollLeft(this.state.scrollLeft + event.deltaX);
    } else {
      // this.props.dispatch({ type: "UpdateScrollTop", delta: event.deltaY });
    }
  }

  handleKeyDown(event: { metaKey: any; ctrlKey: any; altKey: any; key: string | any[]; }) {
    const hasNoModifierKeys = !event.metaKey && !event.ctrlKey && !event.altKey;
    if (event.key.length === 1 && hasNoModifierKeys) {
      // this.props.dispatch({ type: "Edit", text: event.key });
    } else if (event.key === "Enter") {
      // this.props.dispatch({ type: "Edit", text: "\n" });
    }
  }

  pauseCursorBlinking() {
    this.stopCursorBlinking();
    this.debouncedStartCursorBlinking();
  }

  stopCursorBlinking() {
    if (this.state.cursorsBlinking) {
      window.clearInterval(this.cursorBlinkIntervalHandle);
      this.cursorBlinkIntervalHandle = null;
      this.setState({
        showLocalCursors: true,
        cursorsBlinking: false
      });
    }
  }

  processCursorAnim(interval: number) {
    if (!this.state.cursorsBlinking) {
      this.cursorBlinkIntervalHandle = window.setInterval(() => {
        this.setState({ showLocalCursors: !this.state.showLocalCursors });
      }, CURSOR_BLINK_PERIOD / 2);

      this.setState({
        cursorsBlinking: true,
        showLocalCursors: false
      });
    }
  }

  focus() {
    this.element.focus();
  }

  flushHorizontalAutoscroll() {
    const { horizonAutoscroll: horizontal_autoscroll, horizontal_margin, width } = this.props;
    const gutterWidth = this.getGutterWidth();
    const baseCharWidth = this.getBaseCharacterWidth();
    if (
      horizontal_autoscroll &&
      width &&
      gutterWidth &&
      baseCharWidth &&
      this.canUseTextPlane()
    ) {
      const horizontalMarginInPixels = baseCharWidth * horizontal_margin;
      const desiredScrollLeft =
        this.textPlane.measureLine(
          horizontal_autoscroll.startingLine,
          horizontal_autoscroll.start.column
        ) - horizontalMarginInPixels;
      const desiredScrollRight =
        this.textPlane.measureLine(
          horizontal_autoscroll.endingLine,
          horizontal_autoscroll.end.column
        ) +
        gutterWidth +
        horizontalMarginInPixels;

      // This function will be called during render, so we avoid calling
      // setState and we manually manipulate this.state instead.
      if (desiredScrollLeft < this.getScrollLeft()) {
        this.setState({ scrollLeft: this.constrainScrollLeft(desiredScrollLeft) });
      }
      if (desiredScrollRight > this.getScrollRight()) {
        this.setState({
          scrollLeft: this.constrainScrollLeft(
            desiredScrollRight - width
          )
        });
      }
    }
  }

  getScrollLeft() {
    return this.constrainScrollLeft(this.state.scrollLeft);
  }

  getScrollRight() {
    if (this.props.width) {
      return this.getScrollLeft() + this.props.width;
    } else {
      return this.getScrollLeft();
    }
  }

  setScrollLeft(scrollLeft: any) {
    this.setState({
      scrollLeft: this.constrainScrollLeft(scrollLeft)
    });
  }

  constrainScrollLeft(scrollLeft: number) {
    return Math.max(0, Math.min(scrollLeft, this.getMaxScrollLeft()));
  }

  getMaxScrollLeft() {
    const contentWidth = this.getContentWidth();
    if (contentWidth != null && this.props.width != null) {
      return Math.max(0, contentWidth - this.props.width);
    } else {
      return 0;
    }
  }

  getScrollWidth() {
    const contentWidth = this.getContentWidth();
    if (contentWidth != null && this.props.width != null) {
      return Math.max(contentWidth, this.props.width);
    } else {
      return 800;
    }
  }

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
    if (this.baseCharWidth == null && this.canUseTextPlane()) {
      this.baseCharWidth = this.textPlane.measureLine("X");
    }
    return this.baseCharWidth;
  }

  getLongestLineWidth() {
    const { widestRow: longestLine } = this.props;
    if (this.longestLine != longestLine && this.canUseTextPlane()) {
      this.longestLine = longestLine;
      this.longestLineWidth = this.textPlane.measureLine(longestLine);
    }
    return this.longestLineWidth;
  }

  getGutterWidth() {
    if (this.canUseTextPlane()) {
      return (
        this.textPlane.getGutterWidth(this.props.rowCount) +
        this.paddingLeft
      );
    } else {
      return null;
    }
  }

  canUseTextPlane() {
    return this.textPlane && this.textPlane.isReady();
  }
}
