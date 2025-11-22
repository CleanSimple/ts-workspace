import type { Observable } from './types';

import { ComputedSingle } from './impl/ComputedSingle';
import { ObservableBase } from './impl/ObservableBase';

interface ObservableExtensions<T> {
    /**
     * A shorthand for creating a computed observable
     * @example
     *
     * import { val, computed } from '@cleansimple/observable';
     *
     * const value = val();
     * // both of these are equivalent
     * const double1 = value.computed(value => value * 2);
     * const double2 = computed(value, value => value * 2);
     */
    computed: <TComputed>(compute: (value: T) => TComputed) => Observable<TComputed>;
}

declare module './types' {
    interface Observable<T> extends ObservableExtensions<T> {
    }
}

declare module './impl/ObservableBase' {
    interface ObservableBase<T> extends ObservableExtensions<T> {
    }
}

ObservableBase.prototype.computed = function<T, TComputed>(
    compute: (value: T) => TComputed,
): Observable<TComputed> {
    return new ComputedSingle(this, compute);
};
