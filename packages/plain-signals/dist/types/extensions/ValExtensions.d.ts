import { Signal } from '../abstract/Signal';
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
export {};
