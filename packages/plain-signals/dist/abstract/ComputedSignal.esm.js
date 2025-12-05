import { IDependent_onDependencyUpdated } from '../interfaces/IDependent.esm.js';
import { SENTINEL } from '../sentinel.esm.js';
import { Schedulable } from './Schedulable.esm.js';
import { Signal } from './Signal.esm.js';

class ComputedSignal extends Signal {
    _value = SENTINEL;
    _version = -1;
    _isScheduling = false;
    get value() {
        if (this._isScheduling) {
            return this._value;
        }
        if (this._version < Schedulable.version) {
            this._version = Schedulable.version;
            this._value = this.compute();
        }
        return this._value;
    }
    /* IDependent */
    [IDependent_onDependencyUpdated]() {
        this._isScheduling = true;
        this.schedule();
        this._isScheduling = false;
        this.notifyDependents();
    }
}

export { ComputedSignal };
