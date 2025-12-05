import { ReadOnlyVal } from '../impl/ReadOnlyVal.esm.js';
import { Val } from '../impl/Val.esm.js';

Val.prototype.asReadOnly = function () {
    return new ReadOnlyVal(this);
};
