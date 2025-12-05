import { Signal } from '../abstract/Signal';
import { ReadOnlyVal } from '../impl/ReadOnlyVal';
import { Val } from '../impl/Val';

interface ValExtensions<T> {
    /**
     * Returns a read-only version of the signal
     */
    asReadOnly: () => Signal<T>;
}

declare module '../impl/Val' {
    interface Val<T> extends ValExtensions<T> {
    }
}

Val.prototype.asReadOnly = function<T>(this: Val<T>): Signal<T> {
    return new ReadOnlyVal(this);
};
