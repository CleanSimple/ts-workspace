import { Signal } from './abstract/Signal';
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
declare module './abstract/Signal' {
    interface Signal<T> extends SignalExtensions<T> {
    }
}
export {};
