import { Font } from "opentype.js";
import { RGBAColor } from "../Color";
import { Area2, Vec2 } from "../layout";
import { Rasterizer } from "../Rasterizer";
import { TextBuffer as TextBuffer } from "../../editor/TextBuffer";
import { TextCursor } from "../../editor/TextCursor";

const GUTTER_WIDTH = 72;
const DEFAULT_LINE_HEIGHT = 32;

interface Rasterizer2DProps {
    ctx: CanvasRenderingContext2D | null;
    font: Font;
    lineHeight: number;
    fontSize: number;
    alphaSupport: boolean;
}

export default class Rasterizer2D extends Rasterizer {
    displayName: string = "text-editor";
    public ctx: CanvasRenderingContext2D;
    font: Font;
    lineHeight: number;
    fontSize: number;
    viewport: Path2D;

    public get canvasWidth(): number {
        return this.ctx.canvas.width;
    }

    public get canvasHeight(): number {
        return this.ctx.canvas.height;
    }

    constructor(props: Rasterizer2DProps) {
        super();
        this.ctx = props.ctx;
        this.font = props.font;
        this.lineHeight = props.lineHeight || DEFAULT_LINE_HEIGHT;
        this.fontSize = props.fontSize;
        this.viewport = new Path2D();
    }

    onInit() {
        this.fillBg(RGBAColor.fromHex(aero.context.theme.colors.pane.bg));
        this.setFont(Math.ceil(this.fontSize * this.displayRatio), "Iosevka");
        this.ctx.scale(this.displayRatio, this.displayRatio);
    }

    public tick(cache: TextBuffer, debug?: boolean, debugInfo?: { fps: number; currentTick: number }) {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.fillBg();

        var x = 0;
        var y = this.getLinePosition(cache.cursor);
        this.drawCursorBackground(x, y, this.lineHeight, cache);
        if (cache.cursor.visible) {
            this.drawCursor(GUTTER_WIDTH + 18, y, this.lineHeight, cache);
        }

        this.drawGutter(0, 0, GUTTER_WIDTH, this.lineHeight, cache);
        this.drawMain(GUTTER_WIDTH + 18, this.lineHeight, this.lineHeight, cache);

        if (debug) {
            this.drawDebugOverlay({ ...debugInfo });
        }

        cache.dirty = false;
    }

    drawDebugOverlay(info: { fps: number, currentTick: number }) {
        var x = Math.floor(this.canvasWidth / 2);
        this.ctx.save();

        this.ctx.fillStyle = "rgba(11, 11, 11, 0.3)";
        this.ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
        this.ctx.roundRect(x, 0, 350, 150), [20];
        this.ctx.fillRect(x, 0, 350, 150);
        this.ctx.stroke();

        const fpsText = info!.fps + " fps";
        const fpsWidth = this.ctx.measureText(fpsText).width;
        this.ctx.fillStyle = "yellow";
        this.ctx.font = `${12}px Iosevka`;

        this.ctx.fillText(fpsText, x + fpsWidth, 30);

        this.ctx.fillStyle = `${aero.context.theme.colors.pane.fg.toString()}`;
        this.ctx.restore();
    }

    drawCursorBackground(x: number, y: number, lineHeight: number, buffer: TextBuffer) {
        this.ctx.save();
        if (buffer.hasSelection) {
            this.ctx.fillStyle = "rgba(255, 170, 51, 0.4)";
            this.ctx.fillRect(x + 18 + GUTTER_WIDTH, y, buffer.selection.end, lineHeight);
            this.ctx.strokeStyle = "rgba(255, 170, 51, 0.4)";
            this.ctx.strokeRect(x + 18 + GUTTER_WIDTH, y, buffer.selection.end, lineHeight);
        } else {
            this.ctx.fillStyle = "rgba(138, 145, 153, 0.1)";
            this.ctx.fillRect(0, y, this.ctx.canvas.width, lineHeight);
            this.ctx.strokeStyle = "rgba(138, 145, 153, 0.1)";
            this.ctx.strokeRect(0, y, this.ctx.canvas.width, lineHeight);
        }
        this.ctx.restore();
    }

    drawCursor(x: number, y: number, lineHeight: number, buffer: TextBuffer) {
        const offsetX = buffer.getSegmentWidth(buffer.cursor.lineIndex, buffer.cursor.column);
        this.ctx.save();
        this.ctx.fillStyle = `${RGBAColor.fromHex(aero.context.theme.colors.accent).toString()}`;
        this.ctx.fillRect(x + offsetX, y, 1, lineHeight);
        this.ctx.restore();
    }

    drawGutter(x: number, y: number, width: number, lineHeight: number, buffer: TextBuffer) {
        const _gutterCursor = Vec2.at(0, this.lineHeight);
        this.ctx.save();
        for (var i = 0; i < buffer.lineCount(); i++) {
            const lineGlyph = (i + 1).toString();
            const w = buffer.glyph(lineGlyph).width;
            const offset = ((GUTTER_WIDTH - w - 6) / 2)
            const path = this.font.getPath(lineGlyph, x + offset, y + _gutterCursor.y - Math.floor((lineHeight - this.fontSize) / 2), this.fontSize);
            if (buffer.cursor.lineIndex == i) {
                path.fill = "rgba(138, 145, 153, 1.0)";
            } else {
                path.fill = "rgba(138, 145, 153, 0.4)";
            }

            path.draw(this.ctx);
            _gutterCursor.y += lineHeight;
        }

        this.ctx.restore();
    }

    drawMain(x: number, y: number, lineHeight: number, glyphCache: TextBuffer) {
        const offset = Vec2.at(0, 0);
        const color = RGBAColor.fromHex(aero.context.theme.colors.pane.fg).toString();
        for (var idx = 0; idx < glyphCache.lineCount(); idx++) {
            const line = glyphCache.lineInfo(idx);
            for (var charIdx = 0; charIdx < line.characters; charIdx++) {
                const char = line.content.charAt(charIdx);
                const glyph = glyphCache.glyph(char);
                const path = glyph.glyph.getPath(x + offset.x, y + offset.y - Math.floor((lineHeight - this.fontSize) / 2), this.fontSize);
                path.fill = color;
                path.draw(this.ctx);
                offset.x += glyph.width;
            }
            offset.x = 0;
            offset.y += lineHeight;
        }
    }

    public updateDisplayRatio(ratio: number) {
        if (this.displayRatio != ratio) {
            this.displayRatio = ratio;
            const box = this.ctx.canvas.getBoundingClientRect();
            const area = new Area2(box.width, box.height);
            this.resize(area);
        }
    }

    public resize(to: Area2) {
        // if (this.ctx.canvas.width != width || this.ctx.canvas.height != height) {
        // this.ctx.canvas.width = Math.floor(to.width * this.displayRatio);
        // this.ctx.canvas.height = Math.floor(to.height * this.displayRatio);
        // this.ctx.canvas.style.width = width + 'px';
        // this.ctx.canvas.style.height = height + 'px';
        this.ctx.scale(aero.dpr, aero.dpr);
    }

    getLinePosition(cursor: TextCursor): number {
        return (cursor.line - 1) * this.lineHeight;
    }

    clipViewport() {
        this.ctx.clip(this.viewport);
    }

    public fillBg(color: RGBAColor = RGBAColor.fromHex(aero.context.theme.colors.pane.bg)) {
        this.ctx.fillStyle = color.toString();
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    public setFont(size: number = 32, family: string = "Iosevka") {
        this.ctx.fillStyle = aero.context.theme.colors.pane.fg.toString();
        this.ctx.font = `${size}px ${family}`;
        this.ctx.textBaseline = "bottom";
        this.ctx.textAlign = "center";
    }
}