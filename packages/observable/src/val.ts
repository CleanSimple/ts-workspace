import { ObservableImpl } from './observable';

/**
 * Simple observable value implementation
 */
export class ValImpl<T> extends ObservableImpl<T> {
    private _value: T;

    public constructor(initialValue: T) {
        super();
        this._value = initialValue;
    }

    public override get value() {
        return this._value;
    }

    public set value(newValue) {
        if (newValue === this._value) return;
        this.invalidate();
        this._value = newValue;
        this.notifyDependents();
    }
}
