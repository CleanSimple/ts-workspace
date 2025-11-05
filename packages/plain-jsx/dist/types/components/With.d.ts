import type { ValuesOf } from '../observable';
import type { JSXNode } from '../types';
type TypesOf<T> = {
    [K in keyof T]: T[K];
};
export interface WithProps<T> {
    value: T | TypesOf<T>;
    children: (...args: ValuesOf<T>) => JSXNode;
}
export declare function With<T>(_props: WithProps<T>): JSXNode;
export {};
