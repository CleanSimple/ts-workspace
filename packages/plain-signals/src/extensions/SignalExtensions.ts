import { Signal } from '../abstract/Signal';
import { ComputedSingle } from '../impl/ComputedSingle';

interface SignalExtensions<T> {
    /**
     * A shorthand for creating a computed signal
     * @example
     *
     * import { val, computed } from '@cleansimple/plain-signals';
     *
     * const value = val();
     * // both of these are equivalent
     * const double1 = value.computed(value => value * 2);
     * const double2 = computed(value, value => value * 2);
     */
    computed: <TComputed>(compute: (value: T) => TComputed) => Signal<TComputed>;
}

declare module '../abstract/Signal' {
    interface Signal<T> extends SignalExtensions<T> {
    }
}

Signal.prototype.computed = function<T, TComputed>(
    this: Signal<T>,
    compute: (value: T) => TComputed,
): Signal<TComputed> {
    return new ComputedSingle(this, compute);
};
