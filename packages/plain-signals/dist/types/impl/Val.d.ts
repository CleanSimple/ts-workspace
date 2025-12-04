import { Signal } from '../abstract/Signal';
/**
 * Simple value signal implementation
 */
export declare class Val<T> extends Signal<T> {
    private _value;
    constructor(initialValue: T);
    get value(): T;
    set value(newValue: T);
}
