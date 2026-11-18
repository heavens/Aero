import React, { Component, ReactNode, RefObject } from "react";
import { Area2, Vec2 } from "./layout";
import { Subject, Subscription, interval, takeUntil } from "rxjs";
import { TextBuffer } from "../editor/TextBuffer";
import { RGBAColor } from "./Color";
import Rasterizer2D from "./2d/Rasterizer2D";
import { Font } from "opentype.js";

type ArrowKeyCommand = { key: string; movement: Vec2; };
const ARROW_KEYS: ArrowKeyCommand[] = [
    {
        key: "ArrowUp",
        movement: Vec2.at(0, -1)
    },
    {
        key: "ArrowDown",
        movement: Vec2.at(0, 1)
    },
    {
        key: "ArrowLeft",
        movement: Vec2.at(-1, 0)
    },
    {
        key: "ArrowRight",
        movement: Vec2.at(1, 0)
    }
];

type ScrollOffsets = {
    scrollLeft?: number;
    scrollTop?: number;
}

type Props = {
    id?: string;
    children?: ReactNode;
    $style?: React.CSSProperties;
    initialWidth: number;
    initialHeight: number;
    lineHeight: number;
    fontWidth: number;
    fg: RGBAColor;
    font: Font;
}

type State = {
    cursorBlink: boolean;
    scrollOffsets: ScrollOffsets;
    dimensions: Area2;
    view: Rasterizer2D;
}

type LineEdit = {
    row: number;
    column: number;
    content: string;
}

type UpdateKind =
    |
    {
        update: "MoveCursor";
        payload: () => Vec2;
    }
    |
    {
        update: "SetBuffer";
        payload: () => LineEdit[];
    }
    |
    {
        update: "SetDimensions";
        payload: () => Area2;
    }

const updateStream = new Subject<UpdateKind>();

export class Viewport extends Component<Props, State> {

    private element: RefObject<HTMLDivElement>;
    private unmounted: Subject<boolean>;
    private firstVisibleRow: number;
    private resizeSubscription: ResizeObserver;
    private updateSubscription: Subscription;
    private tickSubscription: Subscription;
    private textBuffer: TextBuffer;
    private tick: number;
    private updateTs: number;

    constructor(props: Props) {
        super(props);
        this.element = React.createRef();
        this.state = {
            scrollOffsets: {
                scrollLeft: 0,
                scrollTop: 0
            },
            dimensions: Area2.EMPTY,
            cursorBlink: false,
            view: null,
        }

        this.unmounted = new Subject();
        this.firstVisibleRow = 0;
        this.tick = 0;
        this.handleScroll = this.handleScroll.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleDoubleClick = this.handleDoubleClick.bind(this);
        this.handleOnKeyDown = this.handleOnKeyDown.bind(this);
        this.setCanvasRef = this.setCanvasRef.bind(this);
        this.textBuffer = new TextBuffer(props.font, props.fontWidth);
        this.updateTs = Date.now();
    }

    componentDidMount(): void {
        // Subscribe to the update stream in order to apply changes to the latest state.
        if (this.updateSubscription == null) {
            this.updateSubscription = updateStream.asObservable()
                .pipe(takeUntil(this.unmounted))
                .subscribe(update => this.processUpdate(update));
        }

        // Watch for resize changes stemming from actions such as dragging the window frame.
        if (this.resizeSubscription == null) {
            this.resizeSubscription = new ResizeObserver(([{ contentBoxSize, devicePixelContentBoxSize }]) => this.resize(devicePixelContentBoxSize, contentBoxSize));
            try {
                this.resizeSubscription.observe(this.element.current, { box: 'device-pixel-content-box' });
            } catch (ex) {
                this.resizeSubscription.observe(this.element.current, { box: 'content-box' });
            }
        }

        // Subscribe to the tick stream, periodically polling the canvas to re-render if dirty.
        if (this.tickSubscription == null) {
            this.tickSubscription = interval(1000 / 60)
                .pipe(takeUntil(this.unmounted))
                .subscribe(tick => this.draw(tick));
            this.textBuffer.insert("");
        }
    }

    componentWillUnmount(): void {
        // Dispose of the update subscription.
        if (this.updateSubscription != null && !this.updateSubscription.closed) {
            this.updateSubscription.unsubscribe();
            this.updateSubscription = null;
        }

        if (this.tickSubscription != null && !this.tickSubscription.closed) {
            this.tickSubscription.unsubscribe();
            this.tickSubscription = null;
        }
    }

    draw(currentTick: number) {
        const { view } = this.state;
        if (view != null) {
            const now = Date.now();
            const elapsed = now - this.updateTs;
            const currentFps = Math.round(1000 / (elapsed / ++this.tick) * 100) / 100;
            view.tick(this.textBuffer, false, { fps: Math.floor(currentFps), currentTick: this.tick });
            if (currentTick % 25 == 0) {
                this.textBuffer.blinkCursor();
            }
        }
    }

    processUpdate({ update, payload }: UpdateKind) {
        if (update == "MoveCursor") {
            const to = payload();
            const canMove = this.textBuffer.cursor.canMove(to, this.textBuffer.getLine().length, this.textBuffer.lineCount());
            if (canMove) {
                this.textBuffer.cursor.set(to);
                console.log("moving cursor: " + this.textBuffer.cursor.column + ", " + this.textBuffer.cursor.lineIndex);
            }
            // } else if (update == "SetDimensions") {
            //     const updateValue = payload();
            //     const visualWidth = updateValue.width;
            //     const visualHeight = updateValue.height;
            //     // this.setState({ dimensions: updateValue });
        } else if (update == "SetBuffer") {
            const edits = payload();
            for (const edit of edits) {
                if (edit.content == "\n") {
                    this.textBuffer.insertNewLine();
                } else {
                    this.textBuffer.insert(edit.content);
                }
            }
        }
    }

    setCanvasRef = (ref: HTMLCanvasElement) => {
        const ctx = ref.getContext("2d", { alpha: true, willReadFrequently: true });
        const view = new Rasterizer2D({
            alphaSupport: true,
            ctx,
            font: this.props.font,
            fontSize: this.props.fontWidth,
            lineHeight: this.props.lineHeight
        });

        this.setState({ view }, () => {
            this.state.view.init();
        });
    }

    setRef = (ref: RefObject<HTMLDivElement>) => {
        this.element = ref;
        this.state.view.resize(new Area2(this.props.initialWidth, this.props.initialHeight));
    }

    handleScroll(event: React.MouseEvent<HTMLDivElement>) {
        const scrollTop = event.currentTarget.scrollTop;
        this.firstVisibleRow = scrollTop / this.props.lineHeight;
        this.setState({ scrollOffsets: { scrollTop, } });
    }

    handleOnKeyDown(event: React.KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();
        const key = event.key;
        if (key.length == 1) {
            updateStream.next({
                update: "SetBuffer", payload: () => [
                    { column: this.textBuffer.cursor.column, row: this.textBuffer.cursor.lineIndex, content: key }
                ]
            });
        } else if (key == "Enter") {
            updateStream.next({
                update: "SetBuffer", payload: () => [
                    { column: this.textBuffer.cursor.column, row: this.textBuffer.cursor.lineIndex, content: "\n" },
                ]
            });
        } else {
            const arrowKey = ARROW_KEYS.find(arrowKey => arrowKey.key == key);
            if (arrowKey) {
                const to = Vec2.at(this.textBuffer.cursor.column + arrowKey.movement.x, this.textBuffer.cursor.lineIndex + arrowKey.movement.y);
                updateStream.next({ update: "MoveCursor", payload: () => to });
            }
        }
    }

    render() {
        const { $style } = this.props;
        const width = this.props.initialWidth;
        const height = this.props.initialHeight;

        return <div id={this.props.id}
            ref={this.element}
            tabIndex={-1}
            onScroll={this.handleScroll}
            onKeyDown={this.handleOnKeyDown}
            onClick={this.handleClick}
            onDoubleClick={this.handleDoubleClick}
            style={{
                display: "flex",
                position: "relative",
                "width": "100%",
                "height": "100%",
                overflow: "auto",
                borderRadius: "6px",
                ...$style
            }}>
            <canvas
                id="text-editor"
                ref={this.setCanvasRef}
                width={Math.floor(width * aero.dpr)}
                height={Math.floor(height * aero.dpr)}
                style={{ position: "relative", top: "0", left: "0", bottom: "0", width: `${width}px`, height: `${height}px` }}
            />
        </div>
    }

    resize(devicePixelContentBoxSize: ReadonlyArray<ResizeObserverSize>, contentBox: ReadonlyArray<ResizeObserverSize>) {
        let width: number;
        let height: number;
        if (devicePixelContentBoxSize) {
            width = devicePixelContentBoxSize[0].blockSize;
            height = devicePixelContentBoxSize[0].blockSize;
        } else if (contentBox) {
            width = contentBox[0].inlineSize;
            height = contentBox[0].blockSize;
        }

        this.setDisplaySize(width, height);
    }

    handleClick({ clientX, clientY }: React.MouseEvent) {
        const targetX =
            clientX - this.element.current.offsetLeft;
        const offsetTop = this.element.current.getBoundingClientRect().top;
        const scrollTop = this.element.current.scrollTop;
        const targetY = clientY - offsetTop + scrollTop;

        const translated = this.textBuffer.translateToBufferPos(Vec2.at(targetX - 90, targetY), this.props.lineHeight);
        if (translated.valid) {
            console.log("found " + translated.x + ", " + translated.y);
            updateStream.next({ update: "MoveCursor", payload: () => translated });
        }
    }

    handleDoubleClick({ clientY }: React.MouseEvent) {
        const offsetTop = this.element.current.getBoundingClientRect().top;
        const scrollTop = this.element.current.scrollTop;
        const targetY = clientY - offsetTop + scrollTop;
        const row = Math.max(0, Math.floor(targetY / this.props.lineHeight));
        this.textBuffer.select(row - this.firstVisibleRow);
        const line = this.textBuffer.lineInfo(row);
        if (line) {
            updateStream.next({ update: "MoveCursor", payload: () => Vec2.at(line.content.length, row) });
        }
        this.textBuffer.dirty = true;
    }

    setDisplaySize(w: number, h: number) {
        if (this.state.view == null) {
            return;
        }

        this.setState({ dimensions: new Area2(w, h) })
    }
}