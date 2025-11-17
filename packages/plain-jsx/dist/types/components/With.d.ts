import type { Observable } from '@cleansimple/observable';
import type { JSXNode } from '../types';
export interface WithProps<T> {
    value: T | Observable<T>;
    children: (value: T) => JSXNode;
}
export declare function With<T>(_props: WithProps<T>): JSXNode;
