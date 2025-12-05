import type { IDependent } from '../interfaces/IDependent';

import { IDependent_onDependencyUpdated } from '../interfaces/IDependent';
import { SENTINEL } from '../sentinel';
import { Schedulable } from './Schedulable';
import { Signal } from './Signal';

export abstract class ComputedSignal<T> extends Signal<T> implements IDependent {
    private _value: T = SENTINEL as T;
    private _version: number = -1;
    private _isScheduling: boolean = false;

    protected abstract compute(): T;

    public override get value(): T {
        if (this._isScheduling) {
            return this._value;
        }
        if (this._version < Schedulable.version) {
            this._version = Schedulable.version;
            this._value = this.compute();
        }
        return this._value;
    }

    /* IDependent */
    public [IDependent_onDependencyUpdated]() {
        this._isScheduling = true;
        this.schedule();
        this._isScheduling = false;
        this.notifyDependents();
    }
}
