export function rgbToHSL(channels: number[]) {
    if (!channels) return;

    const r = channels[0] / 255;
    const g = channels[1] / 255;
    const b = channels[2] / 255;
    const min = Math.min(r, g, b);
    const max = Math.max(r, g, b);
    const lum = (max + min) / 2;
    const delta = max - min;
    const sat = lum < .5
        ? (delta / (max + min))
        : (delta / (2 - max - min));

    let hue: number;
    switch (max) {
        case r: hue = (g - b) / delta; break;
        case g: hue = 2 + (b - r) / delta; break;
        default: hue = 4 + (r - g) / delta; break;
    }

    hue /= 6;

    if (hue < 0)
        hue += 1;

    return [hue || 0, sat || 0, lum || 0];
}

export function isNumeric(i: any){
	return "" !== i && +i == i && (String(i) === String(+i) || !/[^\d.]+/.test(i));
}

export function isRegExp(input: string){
	return "[object RegExp]" === Object.prototype.toString.call(input);
}