import { Signal } from '@cleansimple/plain-signals';
import { JSXNode } from '../types.js';

type TypesOf<T> = {
    [K in keyof T]: T[K];
};
type ValuesOf<T extends readonly unknown[]> = {
    [K in keyof T]: T extends Signal<infer V> ? V : T;
};
interface WithManyProps<T extends readonly unknown[]> {
    values: TypesOf<T>;
    children: (...args: ValuesOf<T>) => JSXNode;
}
declare function WithMany<T extends readonly unknown[]>(_props: WithManyProps<T>): JSXNode;

export { WithMany };
export type { ValuesOf, WithManyProps };
