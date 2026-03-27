import { Signal } from '@cleansimple/plain-signals';
import { JSXNode } from '../types.js';

interface ForCallbackProps<T> {
    item: T;
    index: Signal<number>;
}
interface ForProps<T> {
    of: T[] | Signal<T[]>;
    children: (props: ForCallbackProps<T>) => JSXNode;
}
declare function For<T>(_props: ForProps<T>): JSXNode;

export { For };
export type { ForProps };
