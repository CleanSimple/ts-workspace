import type { Observable } from '..';
import type { JSXNode } from '../types';
export interface WithProps<T> {
    value: T | Observable<T>;
    children: (value: T) => JSXNode;
}
export declare function With<T>(_props: WithProps<T>): JSXNode;
