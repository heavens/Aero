import { Area2 } from "./layout";

export abstract class Rasterizer {

    /**
     * A floating-point value serving as a ratio describing the relationship between device to css pixels.
     *  - 1 device pixel = 1 CSS pixel
     *  - 2 device pixels = 1 CSS pixel	500 pixels wide
     */
    displayRatio: number;

    /**
     * Constructs a new canvas element for use by this raster. This may only be called once per raster instance, ideally during construct,
     * such that multiple calls will yield an error.
     * @returns The canvas element built for the raster if one does not already exist otherwise an error is thrown.
     */
    init() {
        this.displayRatio = window.devicePixelRatio;
        this.onInit();
    }

    abstract onInit();

    abstract resize(to: Area2);
}
