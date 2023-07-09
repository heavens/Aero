import React, { ReactNode, createElement } from "react";
import ReactDOM from "react-dom";
import { styled } from "styletron-react";

const Root = styled("div", {
  boxShadow: "0 6px 12px -2px rgba(0, 0, 0, 0.4)",
  background: "#f2f2f2",
  borderRadius: "6px",
  width: 500 + "px",
  padding: "10px",
  marginTop: "20px"
});

const QueryInput = styled("input", {
  width: "100%",
  boxSizing: "border-box",
  padding: "5px",
  fontSize: "10pt",
  outline: "none",
  border: "1px solid #556de8",
  boxShadow: "0 0 0 1px #556de8",
  background: "#ebeeff",
  borderRadius: "3px",
  foreground: "#232324",
});

const SearchResultList = styled("ol", {
  listStyleType: "none",
  height: "200px",
  overflow: "auto",
  padding: 0
});

const SearchResultListItem = styled("li", {
  listStyleType: "none",
  padding: "0.75em 1em",
  lineHeight: "2em",
  fontSize: "10pt",
  fontFamily: "sans-serif",
  borderBottom: "1px solid #dbdbdc"
});

const SearchResultMatchedQuery = styled("b", {
  foreground: "#304ee2",
  fontWeight: "bold"
});

type Props = {
  children?: ReactNode[];
};

class SelectedSearchResultListItem extends React.Component<Props> {
  render() {
    return React.createElement(
      styled(SearchResultListItem, {
        background: "#dbdbdc"
      }),
      {},
      ...this.props.children
    );
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
}

export default class FileFinder extends React.Component<{}, FileFinderState> {
  private inputEl: HTMLInputElement;
  constructor(props: {}) {
    super(props);
    this.didChangeQuery = this.didChangeQuery.bind(this);
    this.didChangeIncludeIgnored = this.didChangeIncludeIgnored.bind(this);
    this.state = {
      queryInput: "",
      results: [],
      selectedIndex: -1,
    };
  }

  render() {
    return React.createElement(
      Root,
      null,
      createElement(QueryInput, {
        ref: (inputNode: HTMLInputElement) => this.inputEl = inputNode,
        value: this.state.queryInput,
        onChange: this.didChangeQuery
      }),
      createElement(
        SearchResultList,
        {},
        ...this.state.results.map((result, i) =>
          this.renderSearchResult(result, i === this.state.selectedIndex)
        )
      )
    );
    // createElement(Action, { type: "SelectPrevious" }),
    // createElement(Action, { type: "SelectNext" }),
    // createElement(Action, { type: "Confirm" }),
    // createElement(Action, { type: "Close" })
  }

  renderSearchResult(result: FileResult, isSelected: boolean) {
    const { positions, displayPath: display_path } = result;
    let pathIndex = 0;
    let queryIndex = 0;
    const children = [];
    while (true) {
      if (pathIndex === positions[queryIndex]) {
        children.push(
          createElement(SearchResultMatchedQuery, null, display_path[pathIndex])
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

    const item = isSelected
      ? SelectedSearchResultListItem
      : SearchResultListItem;
    return createElement(item, null, ...children);
  }

  focus() {
    if (this.inputEl) {
      this.inputEl.focus();
    }
  }

  didChangeQuery(event: InputEvent) {
    this.setState({
      queryInput: event.data
    })
  }

  didChangeIncludeIgnored(event: Event) {
    // this.props.dispatch({
    //   type: "UpdateIncludeIgnored",
    //   include_ignored: event
    // });
  }
};
