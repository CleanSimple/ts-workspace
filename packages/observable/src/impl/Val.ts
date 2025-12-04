import { Observable } from '../abstract/Observable';
import { notifyDependents } from '../tracking';

/**
 * Simple observable value implementation
 */
export class Val<T> extends Observable<T> {
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
        this.schedule();
        this._value = newValue;
        notifyDependents(this);
    }
}
