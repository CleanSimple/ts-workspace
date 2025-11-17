import type { Observable } from '@cleansimple/observable';
import type { JSXNode } from '../types';
interface ForCallbackProps<T> {
    item: T;
    index: Observable<number>;
}
export interface ForProps<T> {
    of: T[] | Observable<T[]>;
    children: (props: ForCallbackProps<T>) => JSXNode;
}
export declare function For<T>(_props: ForProps<T>): JSXNode;
export {};
