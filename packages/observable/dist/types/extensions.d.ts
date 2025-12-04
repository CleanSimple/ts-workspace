import { Observable } from './abstract/Observable';
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
export {};
