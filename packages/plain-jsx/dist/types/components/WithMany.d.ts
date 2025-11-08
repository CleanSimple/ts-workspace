import type { ValuesOf } from '../reactive';
import type { JSXNode } from '../types';
type TypesOf<T> = {
    [K in keyof T]: T[K];
};
export interface WithManyProps<T extends readonly unknown[]> {
    values: TypesOf<T>;
    children: (...args: ValuesOf<T>) => JSXNode;
}
export declare function WithMany<T extends readonly unknown[]>(_props: WithManyProps<T>): JSXNode;
export {};
