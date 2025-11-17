import { ObservableImpl } from './observable.esm.js';

/**
 * Simple observable value implementation
 */
class ValImpl extends ObservableImpl {
    _value;
    constructor(initialValue) {
        super();
        this._value = initialValue;
    }
    get value() {
        return this._value;
    }
    set value(newValue) {
        if (newValue === this._value)
            return;
        this.invalidate();
        this._value = newValue;
        this.notifyDependents();
    }
}

export { ValImpl };
