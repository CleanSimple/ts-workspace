import type { Val } from '../types';

import { ObservableBase } from './ObservableBase';

/**
 * Simple observable value implementation
 */
export class ValImpl<T> extends ObservableBase<T> implements Val<T> {
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
        this.scheduleUpdate();
        this._value = newValue;
        this.notifyDependents();
    }
}
