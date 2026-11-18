import { Font, Glyph } from "opentype.js";
import { Vec2 } from "../renderer/layout";
import { TextCursor } from "./TextCursor";
import DocumentReader from "./DocumentReader";

type GlyphInfo = {
    glyph: Glyph;
    width: number;
    fontSize: number;
    invisible: boolean;
    min: number;
    max: number;
}

type LineInfo = {
    pixelWidth: number;
    characters: number;
    widths: Array<number>;
    content: string;
    terminatorIndex: number;
}

type Selection = {
    start: number;
    end: number;
}

export class TextBuffer {

    font: Font;
    public fontSize: number;
    private glyphCache: Map<string, GlyphInfo>;
    public lineCache: Map<number, LineInfo>;
    public dirty: boolean;
    private _cursor: TextCursor;
    private _selection: Selection | null;

    constructor(font: Font | null, fontSize: number, eol: '\r\n' | '\n' = '\r\n') {
        this.glyphCache = new Map();
        this.lineCache = new Map();
        this.font = font;
        this.fontSize = fontSize;
        this._cursor = new TextCursor();
        this._selection = null;
    }

    public get hasSelection(): boolean {
        return this._selection != null;
    }

    public get selection(): Selection {
        return this._selection;
    }

    public get cursor(): TextCursor {
        return this._cursor;
    }

    public blinkCursor() {
        this.cursor.toggleVisibility();
        this.dirty = true;
    }

    public insert(text: string): boolean {
        if (this.insertAt(text, this.cursor.lineIndex, this.cursor.column)) {
            this._cursor.step(Vec2.at(text.length, 0));
            this.dirty = true;
            return true;
        }
        return false;
    }

    public insertNewLine(): boolean {
        if (this.insertAt("\n", this.cursor.lineIndex, this.cursor.column)) {
            this.cursor.lineIndex++;
            this.cursor.column = 0;
            this.dirty = true;
            return true;
        }
        return false;
    }

    public insertAt(text: string, line: number, column: number): boolean {
        return this.updateLineCache(text, line, column);
    }

    updateGlyphCache(grapheme: string) {
        var entry = this.glyphCache.get(grapheme);
        if (entry) {
            return entry;
        }

        const glyph = this.font.charToGlyph(grapheme);
        const width = glyph.advanceWidth == 0 ? 0 : this.font.getAdvanceWidth(grapheme, this.fontSize);
        const info: GlyphInfo = {
            glyph,
            width,
            fontSize: this.fontSize,
            invisible: glyph.advanceWidth == 0,
            min: -(0.5 * width),
            max: 0.5 * width
        };

        this.glyphCache.set(grapheme, info);
        return info;
    }

    updateLineCache(character: string, lineNumber: number, column: number): boolean {
        var line = this.lineCache.get(lineNumber);
        var updated = false;
        if (!line) {
            line = this.createEmptyLine();
            updated = true;
        }

        const terminator = character == '\n';
        var content = line.content;
        var prevWidth = line.widths[column - 1];
        if (column < content.length) {
            if (content[column] != character) {
                const split = content.slice(0, column);
                const remaining = content.slice(column + 1);
                line.widths[column] = prevWidth + this.font.getAdvanceWidth(character, this.fontSize);
                for (var i = 0; i < remaining.length; i++) {
                    line.widths[column + 1 + i] += line.widths[column + i];
                }
                content = split.concat(character, remaining);
                updated = true;
            }
        } else {
            content += character;
            line.widths[column] = prevWidth + this.glyph(character).width;
            updated = true;
        }

        line.terminatorIndex = terminator ? column : -1;
        line.characters = terminator ? Math.max(0, line.content.length - 1) : line.content.length;
        line.pixelWidth = column > 0 ? this.font.getAdvanceWidth(content, this.fontSize) : 0;
        line.content = content;
        this.lineCache.set(lineNumber, line);
        return updated;
    }

    public select(line: number = -1) {
        const info = this.lineInfo(line);
        if (info) {
            this._selection = { start: 0, end: info.pixelWidth };
        } else {
            this._selection = null;
        }
    }

    public createEmptyLine(): LineInfo {
        return { content: "", pixelWidth: 0, characters: 0, terminatorIndex: -1, widths: new Array() };
    }

    public createLine(content: string): LineInfo {
        return { content, pixelWidth: this.font.getAdvanceWidth(content, this.fontSize), characters: content.length, terminatorIndex: -1, widths: new Array() };
    }

    public newReader(line: string): DocumentReader {
        return new DocumentReader(line);
    }

    public lineInfo(line: number) {
        return this.lineCache.get(line);
    }

    public translateToBufferPos(visualPosition: Vec2, lineHeight: number): Vec2 {
        const line = Math.max(0, Math.floor(visualPosition.y / lineHeight));
        const info = this.lineInfo(line);
        if (!info) {
            return Vec2.NULL;
        }

        const x = visualPosition.x;
        var query = 0;
        for (var i = 0; i < info.characters; i++) {
            const width = info.widths[i];
            if (query >= x && query < x + width) {
                return Vec2.at(i, line);
            }
            query += width;

        }
        return Vec2.NULL;
    }

    public getSegmentWidth(lineNumber: number, column: number) {
        const line = this.lineInfo(lineNumber);
        if (!line) {
            return 0;
        }
        return this.font.getAdvanceWidth(line.content.substring(0, column), this.fontSize);
    }

    public glyph(grapheme: string) {
        const glyph = this.glyphCache.get(grapheme);
        if (glyph) {
            return glyph;
        }
        return this.updateGlyphCache(grapheme);
    }

    public getLine(lineNumber: number = this.cursor.lineIndex): string {
        const info = this.lineInfo(lineNumber);
        if (!info) {
            return "";
        }
        return info.content;
    }

    public getLineSegment(lineNumber: number, column: number): string {
        const info = this.lineInfo(lineNumber);
        if (!info) {
            return "";
        }
        return info.content.substring(column)
    }

    public lineCount(): number {
        return this.lineCache.size;
    }
}