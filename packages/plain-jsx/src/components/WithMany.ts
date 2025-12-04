import type { Signal } from '@cleansimple/plain-signals';
import type { JSXNode } from '../types';

type TypesOf<T> = { [K in keyof T]: T[K] };

export type ValuesOf<T extends readonly unknown[]> = {
    [K in keyof T]: T extends Signal<infer V> ? V : T;
};

export interface WithManyProps<T extends readonly unknown[]> {
    values: TypesOf<T>;
    children: (...args: ValuesOf<T>) => JSXNode;
}

export function WithMany<T extends readonly unknown[]>(_props: WithManyProps<T>): JSXNode {
    throw new Error(
        'This component cannot be called directly — it must be used through the render function.',
    );
}
