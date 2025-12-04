import { notifyDependents } from '../tracking';
import { ObservableBase } from './ObservableBase';

/**
 * Simple observable value implementation
 */
export class Val<T> extends ObservableBase<T> {
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
        this.scheduleNotification();
        this._value = newValue;
        notifyDependents(this);
    }
}
