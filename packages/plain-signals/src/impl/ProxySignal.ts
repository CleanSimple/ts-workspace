import { Signal } from '../abstract/Signal';
import { notifyDependents, registerDependent } from '../tracking';

/**
 * Proxy signal
 */
export class ProxySignal<T> extends Signal<T> {
    private readonly _dependencyUpdatedCallback: () => void;
    private _value: T;

    public constructor(signal: Signal<T>) {
        super();
        this._value = signal.value;

        this._dependencyUpdatedCallback = () => {
            this.schedule();
            this._value = signal.value;
            notifyDependents(this);
        };

        registerDependent(signal, this._dependencyUpdatedCallback);
    }

    public override get value(): T {
        return this._value;
    }
}
