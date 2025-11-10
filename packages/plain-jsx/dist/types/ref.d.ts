import type { FunctionalComponent } from '.';
export declare const RefValue: unique symbol;
export declare function ref<T extends Element | FunctionalComponent<never, any>>(): Ref<T extends FunctionalComponent<never, infer TRef> ? TRef : T>;
export declare class Ref<T> {
    [RefValue]: T | null;
    get current(): T | null;
}
