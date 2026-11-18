import React, { ChangeEvent, ReactNode, RefObject } from "react";
import ReactDOM from "react-dom";
import { Octicon } from "./octicon/Octicon";
import { search, terminal } from "./octicon/octicons";
import Spinner from "./LoadingScreen";
import { styled } from "styletron-react";
import { Theme } from "../Theme";
import { Query } from "../Query";
import { AeroContext } from "..";

const Root = styled("div", (props: { $theme: Theme }) => ({
  boxShadow: "0 6px 12px -2px rgba(0, 0, 0, 0.4)",
  background: props.$theme.colors.pane.bg,
  borderRadius: "2px",
  width: "500px",
  marginTop: "20px",
  zIndex: "5"
}));

const QueryInputContainer = styled("div", (props: { $theme: Theme }) => ({
  display: "flex",
  alignItems: "center",
  width: "100%",
  boxSizing: "border-box",
  padding: "5px",
  outline: "none",
  border: "none",
  borderBottom: `1px solid ${props.$theme.colors.input.border}`,
  background: props.$theme.colors.input.bg,
  foreground: props.$theme.colors.input.fg
}));

const QueryInput = styled("input", (props: { $theme: Theme }) => ({
  display: "flex",
  alignItems: "center",
  flex: "1",
  fontSize: "12pt",
  padding: "0.25em 1em",
  border: "none",
  outline: "none",
  color: props.$theme.colors.input.fg,
  background: "transparent",
  "::placeholder": {
    color: props.$theme.colors.input.placeholderForeground,
    fontSize: "9pt",
  }
}));

const InputIconWrapper = styled("div", (props: { $theme: Theme }) => ({
  ":after": {
    color: props.$theme.colors.pane.fg,
    mixBlendMode: "difference",
  }
}));

const SearchResultList = styled("ol", (props: { $theme?: Theme }) => ({
  listStyleType: "none",
  margin: "0 4px",
  height: "200px",
  overflow: "auto",
  padding: 0
}));

const SearchResultListItem = styled("li", (props: { $theme: Theme }) => ({
  listStyleType: "none",
  padding: "1.25em 1em",
  fontSize: "10pt",
  borderBottom: `1px solid ${props.$theme.colors.pane.border}`,
  backgroundColor: "transparent",
  ":hover": {
    cursor: "pointer",
    borderRadius: "6px",
    background: props.$theme.colors.list.hoverBackground
  },
  ":focused": {
    background: props.$theme.colors.list.focusBackground,
  }
}));

const SearchResultMatchedQuery = styled("b", (props: { $theme: Theme }) => ({
  foreground: props.$theme.colors.list.highlightForeground,
  fontWeight: "bold"
}));

type Props = {
  children?: ReactNode[];
};

class SelectedSearchResultListItem extends React.Component<Props> {
  render() {
    let theme = this.context as Theme;
    return <SearchResultListItem $theme={theme}>{this.props.children}</SearchResultListItem>
  }

  componentDidMount() {
    this.scrollIntoViewIfNeeded();
  }

  componentDidUpdate() {
    this.scrollIntoViewIfNeeded();
  }

  scrollIntoViewIfNeeded() {
    const domNode = ReactDOM.findDOMNode(this) as Element;
    if (domNode) {
      domNode.scrollIntoView();
    }
  }
}

type FileResult = {
  positions: number[];
  displayPath: string;
};

type FileFinderState = {
  queryInput: string;
  results: FileResult[];
  selectedIndex: number;
  processing: boolean;
}

export default class CommandMenu extends React.Component<{}, FileFinderState> {
  
  private inputEl: RefObject<HTMLInputElement>;
  constructor(props: {}) {
    super(props);
    this.onInputChange = this.onInputChange.bind(this);
    this.state = {
      queryInput: "",
      results: [{ positions: [0, 1], displayPath: "/test/Test" }, { positions: [0, 1], displayPath: "/test/Test" }, { positions: [0, 1], displayPath: "/test/Test" }],
      selectedIndex: 0,
      processing: false,
    };
  }

  traverseList(event: KeyboardEvent) {
    const key = event.key;
    if (key == "ArrowDown") {
      const newIndex = Math.min(this.state.results.length, this.state.selectedIndex + 1);
      this.setState({ selectedIndex: newIndex });
    } else if (key == "ArrowDown") {
      const newIndex = Math.max(0, this.state.selectedIndex - 1);
      this.setState({ selectedIndex: newIndex });
    }
  }

  transitionToBusy(isBusy: boolean) {
    this.setState({ processing: isBusy });
  }

  // display: flex;
  // background: rgb(138, 145, 153);
  // filter: invert(50%);
  // border-radius: 3px;
  // /* padding: 0; */
  // align-items: center;
  // justify-content: center;
  // /* position: relative; */
  // height: 100%;
  // min-width: 24px;
  // min-height: 24px;
  render() {
    const theme = Query.using(aero.context).select((state: AeroContext) => state.theme).unwrap;
    return <Root $theme={theme}>
      <QueryInputContainer $theme={theme}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minWidth: "24px", minHeight: "24px", border: `"1px solid ${theme.colors.pane.border}`, background: theme.colors.pane.fg, filter: "invert(50%)", borderRadius: "3px" }}>
          <InputIconWrapper $theme={theme}>
            <Octicon styled={{ fill: theme.colors.list.inactiveSelectionForeground, mixBlendMode: "difference" }} type={this.state.queryInput.startsWith(">") ? terminal : search} />
          </InputIconWrapper>
        </div>
        <QueryInput $theme={theme} ref={this.inputEl} placeholder={"Search items in the workspace or enter '>' to switch to command mode"} value={this.state.queryInput} onChange={this.onInputChange} />
      </QueryInputContainer>
      {
        this.state.processing ?
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px", margin: "4px" }}><Spinner /></span> :
          <SearchResultList>
            {this.state.results.map((result, i) => this.renderSearchResult(theme, i, result, i === this.state.selectedIndex))}
          </SearchResultList>
      }
    </Root>
  }

  renderSearchResult(theme: Theme, slot: number, result: FileResult, focused: boolean) {
    const { positions, displayPath: display_path } = result;
    let pathIndex = 0;
    let queryIndex = 0;
    const children = [];
    while (true) {
      if (pathIndex === positions[queryIndex]) {
        children.push(
          <SearchResultMatchedQuery key={display_path[pathIndex]} $theme={theme}>{display_path[pathIndex]}</SearchResultMatchedQuery>
        );
        pathIndex++;
        queryIndex++;
      } else if (queryIndex < positions.length) {
        const nextPathIndex = positions[queryIndex];
        children.push(display_path.slice(pathIndex, nextPathIndex));
        pathIndex = nextPathIndex;
      } else {
        children.push(display_path.slice(pathIndex));
        break;
      }
    }

    const Item = focused
      ? SelectedSearchResultListItem
      : SearchResultListItem;
    return <Item key={slot} $theme={theme}>{children}</Item>
  }

  focus() {
    if (this.inputEl && this.inputEl.current) {
      this.inputEl.current.focus();
    }
  }

  onInputChange(event: ChangeEvent<HTMLInputElement>) {
    this.setState({
      queryInput: event.target.value,
      processing: true
    })
  }
};