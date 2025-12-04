import { Signal } from '../abstract/Signal';
/**
 * Proxy signal
 */
export declare class ProxySignal<T> extends Signal<T> {
    private readonly _dependencyUpdatedCallback;
    private _value;
    constructor(signal: Signal<T>);
    get value(): T;
}
