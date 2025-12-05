import type { IDependent } from '../interfaces/IDependent';
import type { Val } from './Val';

import { Signal } from '../abstract/Signal';
import { IDependency_registerDependent } from '../interfaces/IDependency';
import { IDependent_onDependencyUpdated } from '../interfaces/IDependent';

/**
 * Proxy signal
 */
export class ReadOnlyVal<T> extends Signal<T> implements IDependent {
    private readonly _signal: Val<T>;
    private _value: T;

    public constructor(signal: Val<T>) {
        super();
        this._signal = signal;
        this._value = signal.value;

        signal[IDependency_registerDependent](this);
    }

    public override get value(): T {
        return this._value;
    }

    /* IDependent */
    public [IDependent_onDependencyUpdated]() {
        this.schedule();
        this._value = this._signal.value;
        this.notifyDependents();
    }
}
