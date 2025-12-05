import { IDependent_onDependencyUpdated } from '../interfaces/IDependent.esm.js';
import { SENTINEL } from '../sentinel.esm.js';
import { Signal } from './Signal.esm.js';

class ComputedSignal extends Signal {
    _value;
    _shouldCompute;
    constructor() {
        super();
        this._value = SENTINEL;
        this._shouldCompute = true;
    }
    get value() {
        if (this._shouldCompute) {
            this._shouldCompute = false;
            this._value = this.compute();
        }
        return this._value;
    }
    /* IDependent */
    [IDependent_onDependencyUpdated]() {
        this.schedule();
        this._shouldCompute = true;
        this.notifyDependents();
    }
}

export { ComputedSignal };
