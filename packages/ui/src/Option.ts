export default class Optional<T> {

    /**
     * Designated `Optional` used to represent an invalid value.
     */
    public static None = new Optional(null);

    /**
     * 
     * @param value 
     * @returns 
     */
    public static Some = <T>(value: T) => new Optional<T>(value);

    private value: T | null;

    public get some(): boolean {
        return this.value != null;
    }

    public get none(): boolean {
        return this.value == null;
    }

    public get unwrap(): T extends any ? T : never {
        if (this.none) {
            throw new Error("cannot unwrap a value of None.");
        }

        return this.value as T;
    }

    constructor(value: T) {
        this.value = value;
    }
}