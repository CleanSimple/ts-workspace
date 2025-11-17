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

export function For<T>(_props: ForProps<T>): JSXNode {
    throw new Error(
        'This component cannot be called directly — it must be used through the render function.',
    );
}
