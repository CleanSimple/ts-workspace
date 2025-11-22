import { ObservableBase } from './ObservableBase.esm.js';

/**
 * Simple observable value implementation
 */
class ValImpl extends ObservableBase {
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
        this.scheduleUpdate();
        this._value = newValue;
        this.notifyDependents();
    }
}

export { ValImpl };
