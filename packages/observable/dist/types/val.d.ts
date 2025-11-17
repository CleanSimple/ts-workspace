import { ObservableImpl } from './observable';
/**
 * Simple observable value implementation
 */
export declare class ValImpl<T> extends ObservableImpl<T> {
    private _value;
    constructor(initialValue: T);
    get value(): T;
    set value(newValue: T);
}
