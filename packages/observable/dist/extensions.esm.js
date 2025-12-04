import { Observable } from './abstract/Observable.esm.js';
import { ComputedSingle } from './impl/ComputedSingle.esm.js';

Observable.prototype.computed = function (compute) {
    return new ComputedSingle(this, compute);
};
