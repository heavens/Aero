export class Area2 {
    static EMPTY = new Area2(0, 0);

    static from(width: number, height: number) {
        return new Area2(width, height);
    }

    width: number;
    height: number;

    public get invalid(): boolean {
        return this.width == 0 && this.height == 0;
    }

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    public clamp(using: Area2) {
        this.width = Math.min(using.width, this.width);
        this.height = Math.min(using.height, this.height);
    }

    public translate(dw: number, dh: number) {
        this.width += dw;
        this.height += dh;
    }

    public scale(factor: number) {
        this.width *= factor;
        this.height *= factor;
        return this;
    }

    public delta(from: Area2): Area2 {
        return new Area2(this.width - from.width, this.height - from.height);
    }

    public floor(): { width: number, height: number } {
        return {
            width: Math.floor(this.width),
            height: Math.floor(this.height)
        }
    }

    public clone() {
        return new Area2(this.width, this.height);
    }
}

export class Vec2 {
    static NULL = Vec2.at(-1, -1);
    static ZERO = Vec2.at(0, 0);

    static at(x: number, y: number) {
        return new Vec2(x, y);
    }

    static delta(first: Vec2, second: Vec2) {
        return new Vec2(first.x - second.x, first.y - second.y);
    }

    x: number;
    y: number;

    public get valid(): boolean {
        return this.x != -1 && this.y != -1;
    }

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    translate(deltaX: number, deltaY: number) {
        this.x += deltaX;
        this.y += deltaY;
        return this;
    }

    set(at: Vec2) {
        this.x = at.x;
        this.y = at.y;
        return this;
    }

    clamp(x: number, y: number): Vec2 {
        this.x = Math.min(x, this.x);
        this.y = Math.min(y, this.y);
        return this;
    }

    min(value: number): Vec2 {
        if (this.x < value) {
            this.x = value;
        }
        if (this.y < value) {
            this.y = value;
        }
        return this;
    }

    max(value: number): Vec2 {
        if (this.x > value) {
            this.x = value;
        }
        if (this.y > value) {
            this.y = value;
        }
        return this;
    }
}

export class BoundingBox {

    static from(other: BoundingBox) {
        return other.clone();
    }

    static origin(point: Vec2): BoundingBox {
        return new BoundingBox(point, Area2.EMPTY);
    }

    topLeft: Vec2;
    bottomRight: Vec2;

    /**
     * Returns the computed size of the active bounding box.
     */
    public get size(): Area2 {
        // Kinda misleading here by passing the x and y values but the naming is meaningless in this scope. 
        // Just wanted to make use of `Vec2`'s delta function to calc the size. The returned (x, y) value is 
        // basically a tuple of (first, second).
        const size = Vec2.delta(this.bottomRight, this.topLeft);
        return Area2.from(size.x, size.y);
    }

    constructor(point: Vec2, area: Area2) {
        this.topLeft = point;
        this.bottomRight = Vec2.at(this.topLeft.x + area.width, this.topLeft.y + area.height);
    }

    /**
     * Sets the origin at the specified (x, y) coordinate pair.
     * @param x 
     * @param y 
     */
    public setOrigin(x: number, y: number) {
        const size = this.size;
        this.topLeft.x = x;
        this.topLeft.y = y;
        this.bottomRight.x = this.topLeft.x + size.width;
        this.bottomRight.y = this.topLeft.y + size.height;
    }

    /**
     * Creates a new `BoundingBox` using the values of the calling box. 
     * 
     * *Note: This performs a deep copy as it copies over all values of the bounding box.* 
     * @returns 
     */
    public clone() {
        return new BoundingBox(new Vec2(this.topLeft.x, this.topLeft.y), this.size.clone());
    }
}