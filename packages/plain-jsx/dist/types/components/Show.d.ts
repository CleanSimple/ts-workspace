import type { Predicate } from '@cleansimple/utils-js';
import type { Observable } from '../observable';
import type { JSXNode } from '../types';
export interface ShowProps<T> {
    when: T | Observable<T>;
    is?: T | Predicate<T>;
    /**
     * If `true`, the children will be re-rendered when the value changes.
     * @default false
     */
    keyed?: boolean;
    fallback?: JSXNode | (() => JSXNode);
    children: JSXNode | (() => JSXNode);
}
export declare function Show<T>(_props: ShowProps<T>): JSXNode;
