export declare class Ref<T extends Element = Element> {
    private _current;
    get current(): T | null;
    setCurrent(value: T): void;
}
export declare function createRef<T extends Element = Element>(): Ref<T>;
