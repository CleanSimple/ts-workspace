import type { IDependent } from '../interfaces/IDependent';

import { IDependent_onDependencyUpdated } from '../interfaces/IDependent';
import { SENTINEL } from '../sentinel';
import { Signal } from './Signal';

export abstract class ComputedSignal<T> extends Signal<T> implements IDependent {
    private _value: T = SENTINEL as T;
    private _shouldCompute: boolean = true;

    protected abstract compute(): T;

    public override get value(): T {
        if (this._shouldCompute) {
            this._shouldCompute = false;
            this._value = this.compute();
        }
        return this._value;
    }

    /* IDependent */
    public [IDependent_onDependencyUpdated]() {
        this.schedule();
        this._shouldCompute = true;
        this.notifyDependents();
    }
}
