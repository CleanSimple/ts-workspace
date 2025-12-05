import type { IDependent } from '../interfaces/IDependent';
import { IDependent_onDependencyUpdated } from '../interfaces/IDependent';
import { Signal } from './Signal';
export declare abstract class ComputedSignal<T> extends Signal<T> implements IDependent {
    private _value;
    private _version;
    private _isScheduling;
    protected abstract compute(): T;
    get value(): T;
    [IDependent_onDependencyUpdated](): void;
}
