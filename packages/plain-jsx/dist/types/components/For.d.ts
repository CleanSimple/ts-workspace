import type { Signal } from '@cleansimple/plain-signals';
import type { JSXNode } from '../types';
interface ForCallbackProps<T> {
    item: T;
    index: Signal<number>;
}
export interface ForProps<T> {
    of: T[] | Signal<T[]>;
    children: (props: ForCallbackProps<T>) => JSXNode;
}
export declare function For<T>(_props: ForProps<T>): JSXNode;
export {};
