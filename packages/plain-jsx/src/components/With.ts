import type { ValuesOf } from '../observable';
import type { JSXNode } from '../types';

type TypesOf<T> = { [K in keyof T]: T[K] };

export interface WithProps<T> {
    value: T | TypesOf<T>;
    children: (...args: ValuesOf<T>) => JSXNode;
}

export function With<T>(_props: WithProps<T>): JSXNode {
    throw new Error(
        'This component cannot be called directly — it must be used through the render function.',
    );
}
