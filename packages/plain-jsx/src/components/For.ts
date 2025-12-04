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

export function For<T>(_props: ForProps<T>): JSXNode {
    throw new Error(
        'This component cannot be called directly — it must be used through the render function.',
    );
}
