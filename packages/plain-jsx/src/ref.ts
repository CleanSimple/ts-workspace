import type { FunctionalComponent } from './types';

export const RefValue = Symbol('RefValue');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ElementOrComponent = Element | FunctionalComponent<never, any>;

export interface Ref<T extends object> {
    get current(): T | null;
}

type RefFor<T extends ElementOrComponent> = Ref<
    T extends FunctionalComponent<never, infer TRef> ? TRef : T
>;

export class RefImpl<T extends object> implements Ref<T> {
    public [RefValue]: T | null = null;

    public get current(): T | null {
        return this[RefValue];
    }
}

export function ref<T extends ElementOrComponent>(): RefFor<T> {
    return new RefImpl();
}
