import { Signal } from './abstract/Signal.esm.js';
import { ComputedSingle } from './impl/ComputedSingle.esm.js';

Signal.prototype.computed = function (compute) {
    return new ComputedSingle(this, compute);
};
