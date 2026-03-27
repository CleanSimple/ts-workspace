import { Signal } from '@cleansimple/plain-signals';
import { JSXNode } from '../types.js';

interface WithProps<T> {
    value: T | Signal<T>;
    children: (value: T) => JSXNode;
}
declare function With<T>(_props: WithProps<T>): JSXNode;

export { With };
export type { WithProps };
