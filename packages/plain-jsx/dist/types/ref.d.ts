import type { FunctionalComponent } from '.';
export declare const RefValue: unique symbol;
export interface Ref<T extends object> {
    get current(): T | null;
}
export declare function ref<T extends Element | FunctionalComponent<never, any>>(): Ref<T extends FunctionalComponent<never, infer TRef> ? TRef : T>;
export declare class RefImpl<T extends object> implements Ref<T> {
    [RefValue]: T | null;
    get current(): T | null;
}
