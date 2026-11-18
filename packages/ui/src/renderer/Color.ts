
const MAX_CHANNEL_VALUE = 255;

export type ColorLike = { r: number; g: number; b: number; a: number; }

/**
 * A 4 channel color structure where 3 of the channels are used to store the RGB values and the last is reserved for alpha support.
 * The RGB channels are 8-bit wide values and the alpha channel usually stores a floating-point value of 0.0 - 1.0.
 */
export class RGBAColor {

    static fromRGBA(rgba: { r: number; g: number; b: number; a: number; }): RGBAColor {
        const values = rgba as ColorLike;
        return new RGBAColor(new Uint8Array([values.r, values.g, values.b, values.a]));
    }

    static fromChannels(rgba: number[]) {
        return new RGBAColor(new Uint8Array([...rgba]));
    }

    static fromHex(value: string) {
        const val = parseInt(value.replace("#", ""), 16);
        if (isNaN(val)) {
            return 
        }

        const r = (val >> 16) & 0xff;
        const g = ((val >> 8) & 0xff);
        const b = (val & 0xff);
        const channels = new Uint8Array([r, g, b, 255]);
        return new RGBAColor(channels);
    }

    private color: number;

    public get red() {
        return (this.color >> 24) & 0xFF;
    }

    public get green() {
        return (this.color >> 16) & 0xFF;
    }

    public get blue() {
        return (this.color >> 8) & 0xFF;
    }

    public get alpha() {
        return (this.color) & 0xFF;
    }

    constructor(rgba: Uint8Array) {
        const r = rgba[0] & 0xFF;
        const g = rgba[1] & 0xFF;
        const b = rgba[2] & 0xFF;
        const a = rgba[3] & 0xFF;
        this.color = r << 24 | g << 16 | b << 8 | a;
    }

    public toFloat32(): Float32Array {
        return new Float32Array([
            ((this.color >> 24) & 0xFF) / MAX_CHANNEL_VALUE,
            ((this.color >> 16) & 0xFF) / MAX_CHANNEL_VALUE,
            ((this.color >> 8) & 0xFF) / MAX_CHANNEL_VALUE,
            ((this.color) & 0xFF) / MAX_CHANNEL_VALUE
        ])
    }

    public toString() {
        return `rgba(${this.red}, ${this.green}, ${this.blue}, ${Math.floor(this.alpha / 255.0)})`
    }
}