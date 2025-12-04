import { ObservableBase } from './ObservableBase';
/**
 * Simple observable value implementation
 */
export declare class Val<T> extends ObservableBase<T> {
    private _value;
    constructor(initialValue: T);
    get value(): T;
    set value(newValue: T);
}
