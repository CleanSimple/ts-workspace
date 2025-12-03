import { Observable } from './abstract/Observable';
import { ComputedSingle } from './impl/ComputedSingle';

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

declare module './abstract/Observable' {
    interface Observable<T> extends ObservableExtensions<T> {
    }
}

Observable.prototype.computed = function<T, TComputed>(
    this: Observable<T>,
    compute: (value: T) => TComputed,
): Observable<TComputed> {
    return new ComputedSingle(this, compute);
};
