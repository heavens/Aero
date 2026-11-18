import { Vec2 } from "../renderer/layout";

type EndOfLineMark = {
    row: number;
    column: number;
}

export class TextCursor {
    private _cursorBlinking: boolean;
    private _isVisible: boolean;
    private eolMarkers: Array<EndOfLineMark>;

    public lineIndex: number;
    public column: number;

    public get line(): number {
        return this.lineIndex + 1;
    }

    public get position(): Vec2 {
        return Vec2.at(this.lineIndex, this.column);
    }

    public get visible(): boolean {
        return this._isVisible;
    }

    public get cursorBlinking(): boolean {
        return this._cursorBlinking
    }

    constructor() {
        this.lineIndex = 0;
        this.column = 0;
        this.eolMarkers = new Array().fill(null);
        this._isVisible = false;
    }

    public canMove(to: Vec2, rowLength: number, rowCount: number) {
        if (to.y < 0 || to.x < 0) {
            return false;
        }

        if (to.y > rowCount || to.x > rowLength) {
            return false;
        }

        return true;
    }

    public markEndOfLine() {
        this.eolMarkers[this.lineIndex - 1] = { row: this.lineIndex, column: this.column };
    }

    public set(at: Vec2) {
        this.lineIndex = at.y;
        this.column = at.x;
    }

    public step(at: Vec2): TextCursor {
        this.lineIndex += at.y;
        this.column += at.x;
        return this;
    }

    public stepColumn(amount: number = 1) {
        this.column += amount;
    }

    public stepLine(amount: number = 1) {
        this.lineIndex += amount;
    }

    public toggleVisibility() {
        return this._isVisible = !this._isVisible;
    }

    public translate(at: Vec2): TextCursor {
        this.lineIndex = Math.max(0, this.lineIndex + at.y);
        this.column = Math.max(0, this.column + at.x);
        return this;
    }

    public snapTo(lineNumber: number, column: number): Vec2 | null {
        const lineSplit = this.eolMarkers[lineNumber - 1];
        if (lineSplit != null) {
            const x = Math.max(1, Math.min(column, lineSplit.column));
            const y = Math.max(1, Math.min(lineNumber, lineSplit.row));
            return Vec2.at(x, y);
        }
        return null;
    }
}
