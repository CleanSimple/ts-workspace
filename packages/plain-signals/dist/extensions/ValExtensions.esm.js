import { ProxySignal } from '../impl/ProxySignal.esm.js';
import { Val } from '../impl/Val.esm.js';

Val.prototype.asReadOnly = function () {
    return new ProxySignal(this);
};
