import type { Signal } from '@cleansimple/plain-signals';
import type { JSXNode } from '../types';
export interface WithProps<T> {
    value: T | Signal<T>;
    children: (value: T) => JSXNode;
}
export declare function With<T>(_props: WithProps<T>): JSXNode;
