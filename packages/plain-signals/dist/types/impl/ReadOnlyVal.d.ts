import type { IDependent } from '../interfaces/IDependent';
import type { Val } from './Val';
import { Signal } from '../abstract/Signal';
import { IDependent_onDependencyUpdated } from '../interfaces/IDependent';
/**
 * Proxy signal
 */
export declare class ReadOnlyVal<T> extends Signal<T> implements IDependent {
    private readonly _signal;
    private _value;
    constructor(signal: Val<T>);
    get value(): T;
    [IDependent_onDependencyUpdated](): void;
}
