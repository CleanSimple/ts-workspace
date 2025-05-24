export declare class Ref<T extends Element = Element> {
    private _current;
    get current(): T | null;
    setCurrent(value: T): void;
}
export declare function ref<T extends Element = Element>(): Ref<T>;
