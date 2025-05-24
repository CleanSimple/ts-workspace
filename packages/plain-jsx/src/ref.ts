export class Ref<T extends Element = Element> {
    private _current: T | null = null;

    public get current() {
        return this._current;
    }
    public setCurrent(value: T) {
        this._current = value;
    }
}

export function createRef<T extends Element = Element>(): Ref<T> {
    return new Ref<T>();
}
