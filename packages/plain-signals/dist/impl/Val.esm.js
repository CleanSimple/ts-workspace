import { Signal } from '../abstract/Signal.esm.js';
import { notifyDependents } from '../tracking.esm.js';

/**
 * Simple value signal implementation
 */
class Val extends Signal {
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
        this.schedule();
        this._value = newValue;
        notifyDependents(this);
    }
}

export { Val };
