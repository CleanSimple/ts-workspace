import { notifyDependents } from '../tracking.esm.js';
import { ObservableBase } from './ObservableBase.esm.js';

/**
 * Simple observable value implementation
 */
class Val extends ObservableBase {
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
        this.scheduleNotification();
        this._value = newValue;
        notifyDependents(this);
    }
}

export { Val };
