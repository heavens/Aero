import React, { ReactNode } from "react";
import { Vec2 } from "../renderer/layout";
import Pane from "./Pane";

export type DockPosition = "top" | "bottom" | "left" | "right";

const HOVER_MARGIN = 20;

/**
 * The max amount of space a dock may occupy, in px.
 */
const MAX_WIDTH_PX = 400;

/**
 * The orientation denoting the direction the dock splitter can be dragged in.
 */
type DragOrientation = "vertical" | "horizontal";

export type Rect = {
    start: Vec2;
    end: Vec2;
};

type Props = {
    id: string;
    children?: ReactNode | ReactNode[];
    resizable: boolean;
    collapsed?: boolean;
    position: DockPosition;
};

type State = {
    id: string;
    resizable: boolean;
    collapsed: boolean;
    hoveringSplit: boolean;
    dragging: boolean;
    rect: Rect | null;
};

export default class Dock extends React.Component<Props, State> {

    private dragOrientation: DragOrientation;

    constructor(props: Props) {
        super(props);
        this.dragOrientation = props.position == "top" || props.position == "bottom" ? "vertical" : "horizontal";
        this.state = {
            id: props.id,
            resizable: props.resizable,
            collapsed: props?.collapsed ?? false,
            hoveringSplit: false,
            dragging: false,
            rect: {
                start: Vec2.ZERO,
                end: Vec2.ZERO
            }
        };
        this.handleDrag = this.handleDrag.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUnfocus = this.onMouseUnfocus.bind(this);
        this.onMouseButtonPress = this.onMouseButtonPress.bind(this);
        this.onMouseButtonRelease = this.onMouseButtonRelease.bind(this);
        this.onMouseExitDock = this.onMouseExitDock.bind(this);
        this.onBoundsUpdate = this.onBoundsUpdate.bind(this);
    }

    handleDrag(event: React.MouseEvent) {
        const { dragging, rect } = this.state;
        if (!dragging || !this.props.resizable) {
            return;
        }

        if (this.dragOrientation == "horizontal") {
            const movement = event.movementX;
            if (movement == 0) {
                return;
            }

            const paneBoundingBox = rect;
            const mouseX = event.clientX;
            let deltaX = Math.max(0, Math.abs(this.width - mouseX));
            if (deltaX > MAX_WIDTH_PX) {
                deltaX = MAX_WIDTH_PX;
            }

            console.log(this.state.rect);
            paneBoundingBox.start.x = deltaX;
            this.setState({ rect: paneBoundingBox });
        }
    }

    get width(): number {
        return this.state.rect.end.x - this.state.rect.start.x;
    }

    onMouseUnfocus() {
        this.setState({ hoveringSplit: false, dragging: false });
    }

    onMouseButtonPress() {
        if (this.state.hoveringSplit) {
            this.setState({ dragging: this.state.hoveringSplit });
        }
    }

    onMouseButtonRelease() {
        this.setState({ dragging: false });
    }

    onMouseExitDock() {
        // If the mouse has fallen out of the top-level dock component bounding box then we reset the UI state to reflect.
        if (this.state.dragging || this.state.hoveringSplit) {
            this.setState({ hoveringSplit: false, dragging: false });
        }
    }

    onBoundsUpdate(rect: DOMRect) {
        const updated: Rect = {
            start: Vec2.at(rect.left, rect.top),
            end: Vec2.at(rect.right, rect.bottom)
        };
        this.setState({ rect: updated });
    }

    onMouseMove(event: React.MouseEvent) {
        const target = event.currentTarget as HTMLDivElement;
        const paneBoundingBox = target.getBoundingClientRect();
        const mousePos = Vec2.at(event.clientX, event.clientY);

        if (this.state.dragging) {
            this.handleDrag(event);
            return;
        }

        const splitterBounds = this.getSplitterBounds(paneBoundingBox);
        const hoveringSplit = withinRect(splitterBounds, mousePos);
        if (!hoveringSplit) {
            this.setState({ hoveringSplit: false, dragging: false });
            return;
        }

        if (!this.state.hoveringSplit && hoveringSplit) {
            this.setState({ hoveringSplit: true });
        }
    }

    render() {
        return <Pane.Wrapper title="Project Explorer" collapsed={this.state.collapsed}>
            <div></div>
        </Pane.Wrapper>
    }

    private getSplitterBounds(boundingBox: DOMRect): Rect {
        const box: Rect = {
            // start: { x: boundingBox.right - HOVER_MARGIN / 2, y: boundingBox.top },
            // end: { x: boundingBox.right + HOVER_MARGIN / 2, y: boundingBox.bottom }
            start: Vec2.at(boundingBox.right - HOVER_MARGIN / 2, boundingBox.top),
            end: Vec2.at(boundingBox.right + HOVER_MARGIN / 2, boundingBox.top)
        };
        switch (this.props.position) {
            case 'right': {
                return box;
            }
            case 'bottom':
                break;
            case 'left': {
                return box;
            }
        }
        return null;
    }
}

/**
 * Checks if the `DOMRect` boundary contains the passed-in point.
 * @param rect The occupied space taken up by the dock.
 * @param point The `[x,y]` coordinate pair passed in as the point being evaluated.
 * @returns 
 */
function withinRect(rect: Rect, point: Vec2): boolean {
    return (
        point.x >= rect.start.x &&
        point.y >= rect.start.y &&
        point.x <= rect.end.x &&
        point.y <= rect.end.y
    );
}

// function withinBounds(rect: Rect, point: Point): boolean {
//     return (
//         point.x >= rect.left &&
//         point.y >= rect.top &&
//         point.x <= rect.right &&
//         point.y <= rect.bottom
//     );
// }