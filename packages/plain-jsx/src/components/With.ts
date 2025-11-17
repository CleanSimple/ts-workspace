import type { Observable } from '@cleansimple/observable';
import type { JSXNode } from '../types';

export interface WithProps<T> {
    value: T | Observable<T>;
    children: (value: T) => JSXNode;
}

export function With<T>(_props: WithProps<T>): JSXNode {
    throw new Error(
        'This component cannot be called directly — it must be used through the render function.',
    );
}
