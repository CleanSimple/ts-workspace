import type { Observable } from '@cleansimple/observable';
import type { JSXNode } from '../types';
type TypesOf<T> = {
    [K in keyof T]: T[K];
};
export type ValuesOf<T extends readonly unknown[]> = {
    [K in keyof T]: T extends Observable<infer V> ? V : T;
};
export interface WithManyProps<T extends readonly unknown[]> {
    values: TypesOf<T>;
    children: (...args: ValuesOf<T>) => JSXNode;
}
export declare function WithMany<T extends readonly unknown[]>(_props: WithManyProps<T>): JSXNode;
export {};
