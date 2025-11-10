import type { FunctionalComponent } from '.';

export const RefValue = Symbol('RefValue');

export function ref<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    T extends Element | FunctionalComponent<never, any>,
>(): Ref<T extends FunctionalComponent<never, infer TRef> ? TRef : T> {
    return new Ref();
}

export class Ref<T> {
    public [RefValue]: T | null = null;

    public get current(): T | null {
        return this[RefValue];
    }
}
